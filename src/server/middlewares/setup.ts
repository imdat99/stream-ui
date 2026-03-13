import type { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { languageDetector } from "hono/language";
import isMobile from "is-mobile";
import { JwtProvider } from "../utils/token";
import { RedisClient } from "bun";
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
    jwtPayload: Record<string, unknown>;
    userId: string;
    role: string;
    email: string;
  }
}

let redisClientPromise: Promise<RedisClient> | null = null;

const getJwtSecret = () => {
  const secret = (process.env.JWT_SECRET || process.env.STREAM_UI_JWT_SECRET || "").trim() || "secret_is_not_configured"
  if (!secret) {
    throw new Error("JWT secret is not configured");
  }
  return secret;
};

const getRedisUrl = () => {
  const redisUrl = (process.env.REDIS_URL || process.env.STREAM_UI_REDIS_URL || "").trim() || "redis://:pass123@47.84.62.226:6379/3";
  if (!redisUrl) {
    throw new Error("Redis URL is not configured");
  }
  return redisUrl;
};

const getRedisClient = async (): Promise<RedisClient> => {
  console.log("bun", typeof Bun)

  if (!redisClientPromise) {
    const client = new RedisClient(getRedisUrl())
    await client.connect();
    return client;
    // redisClientPromise = import("Bun").then(async ({ RedisClient }) => {
    //   const client = new RedisClient(getRedisUrl()) as RedisClientLike;
    //   await client.connect();
    //   return client;
    // });
  }
  // return await redisClientPromise;
  return Promise.resolve() as any
};

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
      c.set("jwtProvider", JwtProvider.newJWTProvider(getJwtSecret()));
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
    try {
      const redisClient = await getRedisClient();
      c.set("redis", redisClient);
      await next();
    } catch (e) {
      console.error("Failed to connect to Redis", e);
      return c.json({ error: "Redis unavailable" }, 500);
    }
  });
}
