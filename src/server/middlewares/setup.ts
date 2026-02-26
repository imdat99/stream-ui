import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import isMobile from 'is-mobile';
import type { Hono } from 'hono';

export function setupMiddlewares(app: Hono) {
  app.use('*', contextStorage());
  
  app.use(cors(), async (c, next) => {
    c.set("fetch", app.request.bind(app));
    
    const ua = c.req.header("User-Agent");
    if (!ua) {
      return c.json({ error: "User-Agent header is missing" }, 400);
    }
    
    c.set("isMobile", isMobile({ ua }));
    await next();
  });
}
