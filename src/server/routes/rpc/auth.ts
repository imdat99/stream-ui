import { clearSessionCookies, ensureSessionUser } from "@/server/routes/auth";
import { generateAndSetTokens } from "@/server/utils";
import { type Metadata } from "@grpc/grpc-js";
import { validateFn } from "@hiogawa/tiny-rpc";
import { getContext } from "hono/context-storage";
import z from "zod";

const collectGrpcCookies = (metadata: Metadata) => {
  const context = getContext();

  for (const value of metadata.get("set-cookie")) {
    if (typeof value === "string" && value) {
      context.res.headers.append("set-cookie", value);
    }
  }
};

export const publicAuthMethods = {
  login: validateFn(
    z.object({
      email: z.string().email("Invalid email or password"),
      password: z.string().min(6, "Invalid email or password"),
    }),
  )(async (data) => {
    const context = getContext();
    const authClient = context.get("authServiceClient");
    const metadata = context.get("internalGrpcMetadata");
    const response = await authClient.login(data, metadata, {
      onMetadata: collectGrpcCookies,
    });
    await generateAndSetTokens(context, response.user!);
    return { user: ensureSessionUser(response.user) };
  }),
  register: validateFn(
    z.object({
      email: z.string().email("Invalid email"),
      username: z.string().min(3, "Username must be at least 3 characters"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      refUsername: z.string().trim().min(1).optional(),
    }),
  )(async (data) => {
    const context = getContext();
    const authClient = context.get("authServiceClient");
    const metadata = context.get("internalGrpcMetadata");
    const response = await authClient.register({
      email: data.email,
      username: data.username,
      password: data.password,
      refUsername: data.refUsername,
    }, metadata);

    return { user: ensureSessionUser(response.user) };
  }),
  forgotPassword: validateFn(
    z.object({
      email: z.string().email("Invalid email"),
    }),
  )(async (data) => {
    const context = getContext();
    const authClient = context.get("authServiceClient");
    const metadata = context.get("internalGrpcMetadata");
    const response = await authClient.forgotPassword(data, metadata);
    return { message: response.message || "If email exists, a reset link has been sent" };
  }),
  resetPassword: validateFn(
    z.object({
      token: z.string().trim().min(1),
      newPassword: z.string().min(6),
    }),
  )(async (data) => {
    const context = getContext();
    const authClient = context.get("authServiceClient");
    const metadata = context.get("internalGrpcMetadata");
    const response = await authClient.resetPassword(data, metadata);
    return { message: response.message || "Password reset successfully" };
  }),
  getGoogleLoginUrl: async () => {
    const context = getContext();
    const authClient = context.get("authServiceClient");
    const metadata = context.get("internalGrpcMetadata");
    return await authClient.getGoogleLoginUrl({}, metadata);
  },
};

export const protectedAuthMethods = {
  changePassword: validateFn(
    z.object({
      currentPassword: z.string().min(6),
      newPassword: z.string().min(6),
    }),
  )(async (data) => {
    const context = getContext();
    const authClient = context.get("authServiceClient");
    const metadata = context.get("grpcMetadata");
    const response = await authClient.changePassword(data, metadata);
    return { message: response.message || "Password changed successfully" };
  }),
  logout: async () => {
    const context = getContext();
    const authClient = context.get("authServiceClient");
    const metadata = context.get("internalGrpcMetadata");

    await authClient.logout({}, metadata);
    clearSessionCookies(context);
    return { message: "Logged out" };
  },
};
