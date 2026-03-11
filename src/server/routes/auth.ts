import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';
import { getUserServiceClient } from '../services/grpcClient';
// authGroup := r.Group("/auth")
// 	{
// 		authGroup.POST("/login", authHandler.Login)
// 		authGroup.POST("/register", authHandler.Register)
// 		authGroup.POST("/forgot-password", authHandler.ForgotPassword)
// 		authGroup.POST("/reset-password", authHandler.ResetPassword)
// 		authGroup.GET("/google/login", authHandler.LoginGoogle)
// 		authGroup.GET("/google/callback", authHandler.GoogleCallback)
// 	}
const authRoute = new Hono();
authRoute.post('/login', zValidator('json', z.object({ email: z.email(), password: z.string().min(6) })), async (c) => {
  const data = c.req.valid("json")
  const user = await getUserServiceClient().getUserByEmail(data);
  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }
  if (user.password !== data.password) {
    return c.json({ error: 'Invalid email or password' }, 401);
  }
  // const user = await getUserServiceClient().getUserByEmail({ email }, (err, response) => {
  //   if (err) {
  //     console.error("Error fetching user by email", err);
  //     return null;
  //   }
  //   return response;
  // });
  // return c.json({ message: 'Login endpoint' });
});
authRoute.post('/register', zValidator('json', z.object({ email: z.email(), password: z.string().min(6) })), async (c) => {
  return c.json({ message: 'Register endpoint' });
});
authRoute.post('/forgot-password', zValidator('json', z.object({ email: z.email() })), async (c) => {
  return c.json({ message: 'Forgot Password endpoint' });
});
authRoute.post('/reset-password', zValidator('json', z.object({ token: z.string(), password: z.string().min(6) })), async (c) => {
  return c.json({ message: 'Reset Password endpoint' });
});
authRoute.get('/google/login', zValidator('query', z.object({ redirect_uri: z.string().url() })), async (c) => {
  return c.json({ message: 'Google Login endpoint' });
});
authRoute.get('/google/callback', zValidator('query', z.object({ code: z.string(), state: z.string() })), async (c) => {
  return c.json({ message: 'Google Callback endpoint' });
});
export function registerAuthRoutes(app: Hono) {
  
  // app.post('/merge', async (c) => {
  //   try {
  //     const body = await c.req.json();
  //     const { filename, chunks, size } = body;

  //     if (!filename || !Array.isArray(chunks) || chunks.length === 0) {
  //       return c.json({ error: 'invalid payload' }, 400);
  //     }

  //     const hostError = validateChunkUrls(chunks);
  //     if (hostError) return c.json({ error: hostError }, 400);

  //     const manifest = createManifest(filename, chunks, size);
  //     await saveManifest(manifest);

  //     return c.json({
  //       status: 'ok',
  //       id: manifest.id,
  //       filename: manifest.filename,
  //       total_parts: manifest.total_parts,
  //       size: manifest.size,
  //       playback_url: `/display/${manifest.id}`,
  //       play_url: `/play/index/${manifest.id}`,
  //       manifest_url: `/manifest/${manifest.id}`,
  //     });
  //   } catch (e: any) {
  //     return c.json({ error: e?.message ?? String(e) }, 500);
  //   }
  // });
}
