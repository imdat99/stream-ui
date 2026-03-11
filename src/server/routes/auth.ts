import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z, { success } from "zod";
import { getUserServiceClient } from "../services/grpcClient";
import { generateAndSetTokens } from "../utils";
import { getCookie, setCookie } from "hono/cookie";
import { jwt } from "hono/jwt";
import { authenticate } from "../middlewares/authenticate";
// authGroup := r.Group("/auth")
// 	{
// 		authGroup.POST("/login", authHandler.Login)
// 		authGroup.POST("/register", authHandler.Register)
// 		authGroup.POST("/forgot-password", authHandler.ForgotPassword)
// 		authGroup.POST("/reset-password", authHandler.ResetPassword)
// 		authGroup.GET("/google/login", authHandler.LoginGoogle)
// 		authGroup.GET("/google/callback", authHandler.GoogleCallback)
// 	}
const authRoute = new Hono();
authRoute.post(
  "/login",
  zValidator(
    "json",
    z.object({
      email: z.email("Invalid email or password"),
      password: z.string().min(6, "Invalid email or password"),
    }),
  ),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const user = await getUserServiceClient().getUserByEmail({ email });
    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    const isMatch = Bun.password.verifySync(password, user.user!.password!, "bcrypt");
    if (!isMatch) {
      return c.json({ error: "Invalid email or password" }, 401);
    }
    await generateAndSetTokens(c, user.user!);
    return c.json({ message: "Login successful" });
  },
);
authRoute.post(
  "/register",
  zValidator(
    "json",
    z.object({
      email: z.email("Invalid email"),
      username: z.string().min(3, "Username must be at least 3 characters"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
  ),
  async (c) => {
    const { email, username, password } = c.req.valid("json");
    const user = await getUserServiceClient().createUser({
      email,
      username,
      password: Bun.password.hashSync(password, { algorithm: "bcrypt", cost: 12 }),
    });
    delete user.user?.password;
    return c.json({ success: true, user: user.user });
  },
);
authRoute.post(
  "/forgot-password",
  zValidator("json", z.object({ email: z.email("Invalid email") })),
  async (c) => {
    const { email } = c.req.valid("json");
    const user = await getUserServiceClient().getUserByEmail({ email });
    if (user) {
      const redis = c.get("redis");
      const resetToken = crypto.randomUUID();
      redis?.set("reset_pw:" + resetToken, user.user?.id || "", "EX", 15 * 60);
      //TODO: Connect to email service to send reset link with token
    }
    return c.json({ message: "If email exists, a reset link has been sent" });
  },
);
authRoute.post(
  "/reset-password",
  zValidator(
    "json",
    z.object({ token: z.string(), password: z.string().min(6) }),
  ),
  async (c) => {
    const { token, password } = c.req.valid("json");
    const redis = c.get("redis");
    const userId = await redis?.get("reset_pw:" + token);
    if (userId) {
      // Update the user's password in the database
      await getUserServiceClient().updateUserPassword({
        id: userId,
        newPassword: Bun.password.hashSync(password, {
          algorithm: "bcrypt",
          cost: 12,
        }),
      });
    }
    return c.json({ message: "Reset Password endpoint" });
  },
);
authRoute.get(
  "/google/login",
  zValidator("query", z.object({ redirect_uri: z.string().url() })),
  async (c) => {
    //TODO: Implement Google OAuth flow
    return c.json({ message: "Google Login endpoint" });
  },
);
authRoute.get(
  "/google/callback",
  zValidator("query", z.object({ code: z.string(), state: z.string() })),
  async (c) => {
    //TODO: Implement Google OAuth flow
    return c.json({ message: "Google Callback endpoint" });
  },
);
export function registerAuthRoutes(app: Hono) {
  app.route("/auth", authRoute);
  app.get(
    "/logout",
    authenticate,
    async (c) => {
      const payload = c.get("jwtPayload") as any;
      const redis = c.get("redis");
      redis.del("refresh_uuid:" + payload["refresh_uuid"]);
      setCookie(c, "access_token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: false,
      });
      setCookie(c, "refresh_token", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: false,
      });
      return c.json({ message: "Logged out successfully" });
    },
  );
}
