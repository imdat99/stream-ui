import { getContext } from "hono/context-storage";
import { HonoVarTypes } from "types";

// We can keep checkAuth to return the current user profile from the context
// which is populated by the firebaseAuthMiddleware
async function checkAuth() {
    const context = getContext<HonoVarTypes>();
    const user = context.get('user');

    if (!user) {
        return { authenticated: false, user: null };
    }

    return {
        authenticated: true,
        user: user
    };
}

export const authMethods = {
    checkAuth,
};