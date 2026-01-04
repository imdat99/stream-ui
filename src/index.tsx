import { Hono } from 'hono'
import { createApp } from './main';
import { renderToWebStream } from 'vue/server-renderer';
import { streamText } from 'hono/streaming';
import { renderSSRHead } from '@unhead/vue/server';
import { buildBootstrapScript, getHrefFromManifest, loadCssByModules } from './lib/manifest';
import { contextStorage } from 'hono/context-storage';
import { cors } from "hono/cors";
import { jwtRpc, rpcServer } from './api/rpc';
import isMobile from 'is-mobile';
import { useAuthStore } from './stores/auth';
import { cssContent } from './lib/primeCssContent';
import { styleTags } from './lib/primePassthrough';
// @ts-ignore
import Base from '@primevue/core/base';
const app = new Hono()
const defaultNames = ['primitive', 'semantic', 'global', 'base', 'ripple-directive']
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
app.get("/.well-known/*", (c) => {
  return c.json({ ok: true });
});
app.get("*", async (c) => {
  const url = new URL(c.req.url);
  const { app, router, head, pinia, bodyClass } = createApp();
  app.provide("honoContext", c);
  const auth = useAuthStore();
  auth.$reset();
  auth.initialized = false;
  await auth.init();
  await router.push(url.pathname);
  await router.isReady();
  let usedStyles = new Set(defaultNames);
  Base.setLoadedStyleName = async (name: string) => usedStyles.add(name)
  return streamText(c, async (stream) => {
    c.header("Content-Type", "text/html; charset=utf-8");
    c.header("Content-Encoding", "Identity");
    const ctx: Record<string, any> = {};
    const appStream = renderToWebStream(app, ctx);
    // console.log("ctx: ", );
    await stream.write("<!DOCTYPE html><html lang='en'><head>");
    await stream.write("<base href='" + url.origin + "'/>");
    await renderSSRHead(head).then((headString) => stream.write(headString.headTags.replace(/\n/g, "")));
    await stream.write(`<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"rel="stylesheet"></link>`);
    await stream.write('<link rel="icon" href="/favicon.ico" />');
    await stream.write(buildBootstrapScript());
    await Promise.all(styleTags.filter(tag => usedStyles.has(tag.name.replace(/-(variables|style)$/, ""))).map(tag => stream.write(`<style type="text/css" data-primevue-style-id="${tag.name}">${tag.value}</style>`)));
    await stream.write(`</head><body class='${bodyClass}'>`);
    await stream.pipe(appStream);
    await stream.write(`<script>window.__SSR_STATE__ = JSON.parse(${htmlEscape(JSON.stringify(JSON.stringify(ctx)))});</script>`);
    await stream.write(`<script>window.__PINIA_STATE__ = JSON.parse(${htmlEscape(JSON.stringify(JSON.stringify(pinia.state.value)))});</script>`);
    await stream.write("</body></html>");
  });
})
const ESCAPE_LOOKUP: { [match: string]: string } = {
  "&": "\\u0026",
  ">": "\\u003e",
  "<": "\\u003c",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const ESCAPE_REGEX = /[&><\u2028\u2029]/g;

function htmlEscape(str: string): string {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
export default app
