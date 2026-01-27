import { renderSSRHead } from '@unhead/vue/server';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from "hono/cors";
import { streamText } from 'hono/streaming';
import isMobile from 'is-mobile';
import { renderToWebStream } from 'vue/server-renderer';
import { buildBootstrapScript } from './lib/manifest';
import { styleTags } from './lib/primePassthrough';
import { createApp } from './main';
import { useAuthStore } from './stores/auth';
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
}, async (c, next) => {
  const path = c.req.path

  if (path !== '/r' && !path.startsWith('/r/')) {
    return await next()
  }
  const url = new URL(c.req.url)
  url.host = 'api.pipic.fun'
  url.protocol = 'https:'
  url.pathname = path.replace(/^\/r/, '') || '/'
  url.port = ''
  // console.log("url", url.toString())
  // console.log("c.req.raw", c.req.raw)
  const headers = new Headers(c.req.header());
  headers.delete("host");
  headers.delete("connection");

  return fetch(url.toString(), {
    method: c.req.method,
    headers: headers,
    body: c.req.raw.body,
    // @ts-ignore
    duplex: 'half',
    credentials: 'include'
  });
});
app.get("/.well-known/*", (c) => {
  return c.json({ ok: true });
});
app.get("*", async (c) => {
  const nonce = crypto.randomUUID();
  const url = new URL(c.req.url);
  const { app, router, head, pinia, bodyClass } = createApp();
  app.provide("honoContext", c);
  const auth = useAuthStore();
  auth.$reset();
  // auth.initialized = false;
  await auth.init();
  await router.push(url.pathname);
  await router.isReady();
  let usedStyles = new Set<String>();
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
    // await stream.write(`<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"rel="stylesheet"></link>`);
    await stream.write(`<link rel="preconnect" href="https://fonts.googleapis.com">`);
    await stream.write(`<link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet">`);
    await stream.write('<link rel="icon" href="/favicon.ico" />');
    await stream.write(buildBootstrapScript());
    if (usedStyles.size > 0) {
      defaultNames.forEach(name => usedStyles.add(name));
    }
    await Promise.all(styleTags.filter(tag => usedStyles.has(tag.name.replace(/-(variables|style)$/, ""))).map(tag => stream.write(`<style type="text/css" data-primevue-style-id="${tag.name}">${tag.value}</style>`)));
    await stream.write(`</head><body class='${bodyClass}'>`);
    await stream.pipe(appStream);
    Object.assign(ctx, { $p: pinia.state.value });
    await stream.write(`<script type="application/json" data-ssr="true" id="__APP_DATA__" nonce="${nonce}">${htmlEscape((JSON.stringify(ctx)))}</script>`);
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
