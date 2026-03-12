import type { User } from "@/server/gen/proto/app/v1/common";
import { Context } from "hono";
import { tryGetContext } from "hono/context-storage";
import { setCookie } from "hono/cookie";

export const redisClient = () => {
  const context = tryGetContext<any>();
  const redis = context?.get("redis")
  if (!redis) {
    throw new Error("Redis client not found in context");
  }
  return redis;
};

export async function generateAndSetTokens(c: Context, userData: User) {
  const redis = c.get("redis");
  const jwtProvider = c.get("jwtProvider");

  return await jwtProvider
    .generateTokenPair(userData.id!, userData.email!, userData.role!)
    .then((td) => {
      redis.set(
        "refresh_uuid:" + td.refreshUUID,
        userData.id!,
        "EX",
        td.rtExpires - Math.floor(Date.now() / 1000),
      );

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
    })
    .catch((e: unknown) => {
      console.error("Error generating tokens", e);
      throw e;
    });
}
export const class2Object = <T>(classConvert: T) => {
    const keys = Object.getOwnPropertyNames(
        Object.getPrototypeOf(classConvert)
    ) as Array<keyof T>
    const object = keys.reduce((classAsObj: Record<string, any>, key) => {
        classAsObj[key as string] = (classConvert[key] as any).bind(
            classConvert
        )
        return classAsObj
    }, {})
    return object as T
}