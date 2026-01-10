import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from "hono/cors";
import isMobile from 'is-mobile';
import { rpcServer } from './api/rpc';
import { ssrRender } from './worker/ssrRender';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './server/app.module';
import { HonoAdapter } from './server/HonoAdapter/adapter';
import { NestHonoApplication } from './server/HonoAdapter/interfaces';
// import { serveStatic } from "hono/bun";
// @ts-ignore
// const app = new Hono()
// const isDev = import.meta.env.DEV;

// // app.use(renderer)
// app.use('*', contextStorage());
// app.use(cors(), async (c, next) => {
//   c.set("fetch", app.request.bind(app));
//   const ua = c.req.header("User-Agent")
//   if (!ua) {
//     return c.json({ error: "User-Agent header is missing" }, 400);
//   };
//   c.set("isMobile", isMobile({ ua }));
//   await next();
// }, rpcServer);
// if (!isDev) {
//   if ((process as any).versions?.bun) {
//     const { serveStatic } = await import("hono/bun");
//     app.use(serveStatic({ root: "./dist/client" }))
//   }
// }
// app.get("/.well-known/*", (c) => {
//   return c.json({ ok: true });
// });
const appHonoNest = await NestFactory.create<NestHonoApplication>(
  AppModule,
  new HonoAdapter(),
  {
    rawBody: true,
  },
);
// app.get('*', (c) => {
//   console.log("Request URL:", c);
//   // return next();
// });
// app.use(ssrRender);
// app.use(function (req, next) {
//   console.log("Request:", arguments[1]);
//   return (c, next) => {
//     next();
//   }
// });
const app = appHonoNest.getHonoInstance();
app.use(async (c, next) => {
  c.set("fetch", app.request.bind(app));
  const ua = c.req.header("User-Agent")
  if (!ua) {
    return c.json({ error: "User-Agent header is missing" }, 400);
  };
  c.set("isMobile", isMobile({ ua }));
  await next();
}, contextStorage());

appHonoNest.useStaticAssets("/*", { root: "./dist/client" });
await appHonoNest.init();
app.get("/.well-known/*", (c) => {
  return c.json({ ok: true });
});
app.use(ssrRender);
const httpAdapter = appHonoNest.get(HttpAdapterHost);
// await app.listen(3000)
// console.log("HTTP Adapter:", app.fetch.toString());
export default {
  fetch: app.fetch.bind(app),
}
