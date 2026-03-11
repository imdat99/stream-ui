import { RedisClient } from "bun";
import type { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import isMobile from "is-mobile";
import { JwtProvider } from "../utils/token";
type AppFetch = (
  input: string | Request | URL,
  requestInit?: RequestInit
) => Response | Promise<Response>;

declare module "hono" {
  interface ContextVariableMap {
    fetch: AppFetch;
    isMobile: boolean;
    redis: RedisClient;
    jwtProvider: JwtProvider;
    userId: string;
    role: string;
  }
}

const client = new RedisClient("redis://:pass123@47.84.62.226:6379/3");

export function setupMiddlewares(app: Hono) {
  app.use(
    "*",
    languageDetector({
      supportedLanguages: ["vi", "en"],
      fallbackLanguage: "en",
      lookupCookie: "i18next",
      lookupFromHeaderKey: "accept-language",
      order: ["cookie", "header"],
    }),
    contextStorage(),
    async (c, next) => {
      c.set("jwtProvider", JwtProvider.newJWTProvider("your-secret-key"));
      await next();
    }
  );

  app.use(cors(), async (c, next) => {
    c.set("fetch", app.request.bind(app));

    const ua = c.req.header("User-Agent");
    if (!ua) {
      return c.json({ error: "User-Agent header is missing" }, 400);
    }

    c.set("isMobile", isMobile({ ua }));
    await next();
  });
  app.use(async (c, next) => {
    return await client
      .connect()
      .then(() => {
        c.set("redis", client);
        return next();
      })
      .catch((e) => {
        console.error("Failed to connect to Redis", e);
      });
  });
}
