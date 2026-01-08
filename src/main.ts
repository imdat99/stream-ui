import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from "hono/cors";
import isMobile from 'is-mobile';
import { rpcServer } from './api/rpc';
import { ssrRender } from './worker/ssrRender';
// import { serveStatic } from "hono/bun";
// @ts-ignore
const app = new Hono()
const isDev = import.meta.env.DEV;

// app.use(renderer)
app.use('*', contextStorage());
app.use(cors(), async (c, next) => {
  c.set("fetch", app.request.bind(app));
  const ua = c.req.header("User-Agent")
  if (!ua) {
    return c.json({ error: "User-Agent header is missing" }, 400);
  };
  c.set("isMobile", isMobile({ ua }));
  await next();
}, rpcServer);
if (!isDev) {
  if ((process as any).versions?.bun) {
    const { serveStatic } = await import("hono/bun");
    app.use(serveStatic({ root: "./dist/client" }))
  }
}
app.get("/.well-known/*", (c) => {
  return c.json({ ok: true });
});
app.get("*", ssrRender);
export default app
