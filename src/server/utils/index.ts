import { RedisClient } from "bun";
import { tryGetContext } from "hono/context-storage";
import {
    setCookie
} from 'hono/cookie';
import { JWTProvider } from "./token";
export const redisClient = (): RedisClient => {
    const context = tryGetContext<any>();
    const redis = context?.get("redis") as RedisClient | undefined;
    if (!redis) {
        throw new Error("Redis client not found in context");
    }
    return redis;
};

export async function generateAndSetTokens(userID: string, email: string, role: string) {
    const redis = redisClient();
    const context = tryGetContext<any>();
    await JWTProvider("your-secret-key").generateTokenPair(userID, email, role).then((td) => {
        redis.set("refresh_uuid:" + td.refreshUUID, userID, "EX", td.rtExpires - Math.floor(Date.now() / 1000));
        if (context) {
            setCookie(context, "access_token", td.accessToken, {
                expires: new Date(td.atExpires * 1000),
                httpOnly: true,
                secure: false,
                path: "/",
            });
            setCookie(context, "refresh_token", td.refreshToken, {
                expires: new Date(td.rtExpires * 1000),
                httpOnly: true,
                secure: false,
                path: "/",
            });
        }
    }).catch((e) => {
        console.error("Error generating tokens", e);
    });
}