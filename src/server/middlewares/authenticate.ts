import { MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { buildInternalMetadata, getAccountServiceClient } from "../services/grpcClient";
import { generateAndSetTokens } from "../utils";
export const authenticate: MiddlewareHandler = async (ctx, next) => {
    let payload
    let cause
    const jwtProvider = ctx.get("jwtProvider");
    const token = getCookie(ctx, "access_token");

    if (token) {
        try {
            payload = await jwtProvider.parseToken(token);
        } catch (e) {
            cause = e
        }
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
        const metadata = buildInternalMetadata();
        const user = await getAccountServiceClient().getUserById(userId, metadata);
        
        const tokenPair = await generateAndSetTokens(ctx, user);
        if (!user?.id || !user?.role || user.id !== userId) {
            throw new HTTPException(401)
        }
        payload = {
            user_id: user.id,
            email: user.email,
            role: user.role,
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
    setCookie(ctx, "timestamp", Date.now().toString(), {
        httpOnly: false,
        secure: false,
    });
    await next();
};