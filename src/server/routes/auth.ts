import { Context, Hono } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getAuthClient, getInternalGrpcMetadata } from "../services/grpcClient";
import type { User } from "@/server/api/proto/app/v1/common";

const authRoute = new Hono();

const defaultGoogleFinalizePath = "/auth/google/finalize";

export const ensureSessionUser = (user: User | null | undefined) => {
  if (!user?.id || !user.email) {
    throw new HTTPException(500, { message: "Invalid auth user payload" });
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role ?? "USER",
    username: user.username ?? undefined,
    avatar: user.avatar ?? undefined,
    googleId: user.googleId ?? undefined,
  };
};

const forwardGrpcCookies = (c: Context, cookies: readonly string[]) => {
  for (const cookie of cookies) {
    c.res.headers.append("set-cookie", cookie);
  }
};

const authService = () => getAuthClient();

const googleAuthReasonMap: Record<string, string> = {
  access_denied: "access_denied",
  missing_code: "missing_code",
  exchange_failed: "exchange_failed",
  userinfo_failed: "userinfo_failed",
  userinfo_parse_failed: "userinfo_parse_failed",
  missing_email: "missing_email",
  create_user_failed: "create_user_failed",
  update_user_failed: "update_user_failed",
  reload_user_failed: "reload_user_failed",
  session_failed: "session_failed",
};

const normalizeGoogleAuthReason = (reason: unknown) => {
  const code = typeof reason === "string" ? reason.trim() : "";
  if (!code) {
    return "google_login_failed";
  }
  return googleAuthReasonMap[code] ?? "google_login_failed";
};

export const clearSessionCookies = (c: Context) => {
  deleteCookie(c, "access_token", { path: "/" });
  deleteCookie(c, "refresh_token", { path: "/" });
};

const frontendBaseUrl = () => (process.env.FRONTEND_BASE_URL || "").trim().replace(/\/$/, "");

const googleFinalizeUrl = (status: string, reason?: string) => {
  const base = frontendBaseUrl();
  if (!base) {
    return "";
  }

  const finalizePath = (process.env.GOOGLE_AUTH_FINALIZE_PATH || defaultGoogleFinalizePath).trim() || defaultGoogleFinalizePath;
  const path = finalizePath.startsWith("/") ? finalizePath : `/${finalizePath}`;
  const url = new URL(path, `${base}/`);
  url.searchParams.set("status", status);
  if (reason) {
    url.searchParams.set("reason", reason);
  }
  return url.toString();
};

const redirectToGoogleFinalize = (c: Context, status: string, reason?: string) => {
  const url = googleFinalizeUrl(status, reason);
  if (!url) {
    throw new HTTPException(500, { message: reason || "Google auth finalize URL is not configured" });
  }
  return c.redirect(url, 307);
};

authRoute.get("/google/callback", async (c) => {
  const referralCookieName = "ref_username";
  const oauthError = c.req.query("error")?.trim();
  if (oauthError) {
    return redirectToGoogleFinalize(c, "error", oauthError);
  }

  const code = c.req.query("code")?.trim();
  if (!code) {
    return redirectToGoogleFinalize(c, "error", "missing_code");
  }

  try {
    const grpcCookies: string[] = [];
    const refUsername = getCookie(c, referralCookieName)?.trim();
    await authService().completeGoogleLogin(
      { code, refUsername: refUsername || undefined },
      getInternalGrpcMetadata(),
      {
        onMetadata: (metadata) => {
          for (const value of metadata.get("set-cookie")) {
            if (typeof value === "string" && value) {
              grpcCookies.push(value);
            }
          }
        },
      },
    );
    deleteCookie(c, referralCookieName, { path: "/" });
    forwardGrpcCookies(c, grpcCookies);
    return redirectToGoogleFinalize(c, "success");
  } catch (error) {
    deleteCookie(c, referralCookieName, { path: "/" });
    const reason = normalizeGoogleAuthReason(error instanceof Error ? error.message : undefined);
    return redirectToGoogleFinalize(c, "error", reason);
  }
});

export function registerAuthRoutes(app: Hono) {
  app.route("/auth", authRoute);
}
