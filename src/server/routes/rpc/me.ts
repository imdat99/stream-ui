import { validateFn } from "@hiogawa/tiny-rpc";
import { getContext } from "hono/context-storage";
import z from "zod";

export const meMethods = {
    getMe: async () => {
        const context = getContext();
        const userServiceClient = context.get("userServiceClient");
        const user = await userServiceClient.getUser({ id: context.get("userId") });
        const userPreferences = await userServiceClient.getPreferences({ userId: context.get("userId") });
        delete user.user?.password
        return {
            ...user.user,
            ...userPreferences.preferences
        };
    },
    updateMe: validateFn(z.object({
        username: z.string().min(3).optional(),
        avatar: z.url().optional(),
        role: z.string().optional(),
        planId: z.string().optional(),
    }))(
        async (data) => {
            const context = getContext();
            const user = await context.get("userServiceClient").updateUser({
                id: context.get("userId"),
                username: data.username,
                avatar: data.avatar,
                role: data.role,
                planId: data.planId,
            });
            delete user.user?.password
            return user.user;
        }
    ),
    ChangePassword: validateFn(z.object({
        oldPassword: z.string().min(6),
        newPassword: z.string().min(6),
    }))(
        async (data) => {
            const context = getContext();
            const user = await context.get("userServiceClient").getUser({ id: context.get("userId") });
            if (!user.user) {
                throw new Error("User not found");
            }
            const isMatch = Bun.password.verifySync(data.oldPassword, user.user!.password!, "bcrypt");
            if (!isMatch) {
                throw new Error("Invalid password");
            }
            await context.get("userServiceClient").updateUserPassword({
                id: context.get("userId"),
                newPassword: Bun.password.hashSync(data.newPassword, { algorithm: "bcrypt", cost: 12 }),
            });
        }
    )
};