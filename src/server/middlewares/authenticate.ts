import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getUserServiceClient } from "../services/grpcClient";
import { generateAndSetTokens } from "../utils";
export const authenticate: MiddlewareHandler = async (ctx, next) => {
    let payload
    let cause
    const jwtProvider = ctx.get("jwtProvider");
    const token = getCookie(ctx, "access_token");
    if (!token) {
      throw new HTTPException(401, {
        message: 'Unauthorized',
      })
    }
    try {
      payload = await jwtProvider.parseToken(token);
    } catch (e) {
      cause = e
    }
    if (!payload) {
        const refreshToken = getCookie(ctx, "refresh_token");
        if (!refreshToken) {
             throw new HTTPException(401, {
                message: 'Unauthorized',
            })
        }
        const refreshPayload = await jwtProvider.parseToken(refreshToken);
        if (!refreshPayload) {
                throw new HTTPException(401)
        }
        const redis = ctx.get("redis");
        const refreshUuid = refreshPayload["refresh_uuid"];
        const userId = await redis.get("refresh_uuid:" + refreshUuid);
        if (!userId) {
            throw new HTTPException(401)
        }
        const userData = await getUserServiceClient().getUser({ id: userId });
        // userData.user
        redis.del("refresh_uuid:" + refreshUuid);
        const tokenPair = await generateAndSetTokens(ctx, userData.user!);
        payload = {
            user_id: userId,
            email: userData.user!.email,
            role: userData.user!.role,
            token_id: tokenPair.accessUUID,
        }
    }

    if (!payload.user_id || !payload.role) {
        throw new HTTPException(401, {
            message: 'Unauthorized',
        })
    }
    ctx.set('jwtPayload', payload)
    ctx.set('userId', payload.user_id)
    ctx.set("role", payload.role)
    await next();
};