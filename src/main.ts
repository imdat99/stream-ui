import { NestFactory } from "@nestjs/core";
import Bun from "bun";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import isMobile from "is-mobile";
import { AppModule } from "./server/app.module";
import { HonoAdapter, NestHonoApplication } from "./server/common/adapter/hono";
import { ssrRender } from "./server/HonoAdapter/ssrRender";
import { TransformInterceptor } from "./server/common/interceptor/transform.interceptor";
import { ZodValidationPipe } from "nestjs-zod";
declare global {
  var __APP__: {
    app?: NestHonoApplication;
    hono?: Hono;
    server?: Bun.Server<any>;
  } | undefined;
}
if (!globalThis.__APP__) {
  globalThis.__APP__ = {};
}
if (globalThis.__APP__.app) {
  await globalThis.__APP__.app.close();
}
let serve: Bun.Server<undefined> | any = {
  stop: async () => {},
}
const hono = new Hono();
globalThis.__APP__.hono = hono;

const app = await NestFactory.create<NestHonoApplication>(
  AppModule,
  new HonoAdapter({
    hono,
    close: () => {
      console.log("Closing server");
      return serve!.stop();
    },
    address: () => String(serve!.hostname),
    listen({ port, hostname, hono, httpsOptions = {}, forceCloseConnections }) {
      return new Promise<void>((resolve) => {
        serve = Bun.serve({
          port,
          hostname,
          fetch: hono.fetch.bind(hono),
        });
        console.log(`Server listening on http://${serve.hostname}:${serve.port}`);
        resolve();
      });
    },
  })
);
globalThis.__APP__.app = app;
app.setGlobalPrefix("api");
app.enableShutdownHooks();
// Validation Pipe (Zod) and Transform Interceptor
app.useGlobalInterceptors(new TransformInterceptor());
app.useGlobalPipes(new ZodValidationPipe());

app.useStaticAssets("/*", { root: "./dist/client" });
await app.init();
// Hono Zone Middleware
hono.use(async (c, next) => {
  c.set("fetch", hono.request.bind(hono));
  const ua = c.req.header("User-Agent");
  if (!ua) {
    return c.json({ error: "User-Agent header is missing" }, 400);
  }
  c.set("isMobile", isMobile({ ua }));
  await next();
}, contextStorage());
hono.get("/.well-known/*", (c) => {
  return c.json({ ok: true });
});
hono.use(ssrRender);
if (import.meta.env.PROD) {
  await app.listen(3500);
}
const honoDev = import.meta.env.DEV ? hono : null;
export default honoDev;
// };