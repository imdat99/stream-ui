import { RedisClient } from "bun";
import { Context } from "hono";
import { tryGetContext } from "hono/context-storage";
import {
    setCookie
} from 'hono/cookie';
import { User } from "./proto/v1/user";
export const redisClient = (): RedisClient => {
    const context = tryGetContext<any>();
    const redis = context?.get("redis") as RedisClient | undefined;
    if (!redis) {
        throw new Error("Redis client not found in context");
    }
    return redis;
};

export async function generateAndSetTokens(c: Context, userData: User) {
    const redis = c.get("redis");
    const jwtProvider = c.get("jwtProvider");
    return await jwtProvider.generateTokenPair(userData.id!, userData.email!, userData.role!).then((td) => {
        redis.set("refresh_uuid:" + td.refreshUUID, userData.id!, "EX", td.rtExpires - Math.floor(Date.now() / 1000));
            setCookie(c, "access_token", td.accessToken, {
                expires: new Date(td.atExpires * 1000),
                httpOnly: true,
                secure: false,
                path: "/",
            });
            setCookie(c, "refresh_token", td.refreshToken, {
                expires: new Date(td.rtExpires * 1000),
                httpOnly: true,
                secure: false,
                path: "/",
            });
        return td;
    }).catch((e) => {
        console.error("Error generating tokens", e);
        throw e;
    });
}