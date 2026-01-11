import { NestFactory } from "@nestjs/core";
import Bun from "bun";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import isMobile from "is-mobile";
import { AppModule } from "./server/app.module";
import { HonoAdapter, NestHonoApplication } from "./server/common/adapter/hono";
import { CustomZodValidationPipe } from "./server/common/pipes/CustomZodValidation.pipe";
import { ssrRender } from "./server/HonoAdapter/ssrRender";
import { TransformInterceptor } from "./server/common/interceptor/transform.interceptor";
let serve: Bun.Server<undefined> | any = {
  stop: async () => {},
}
const hono = new Hono();
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
app.setGlobalPrefix("api");
app.enableShutdownHooks();
app.useGlobalPipes(new CustomZodValidationPipe());
app.useGlobalInterceptors(new TransformInterceptor());

hono.use(async (c, next) => {
  c.set("fetch", hono.request.bind(hono));
  const ua = c.req.header("User-Agent");
  if (!ua) {
    return c.json({ error: "User-Agent header is missing" }, 400);
  }
  c.set("isMobile", isMobile({ ua }));
  await next();
}, contextStorage());

app.useStaticAssets("/*", { root: "./dist/client" });
await app.init();
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