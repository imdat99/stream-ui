import { serializeQueryCache } from '@pinia/colada';
import { renderSSRHead } from '@unhead/vue/server';
import { streamText } from 'hono/streaming';
import { renderToWebStream } from 'vue/server-renderer';

import { buildBootstrapScript } from '@/lib/manifest';
import { createApp } from '@/main';
import { htmlEscape } from '@/server/utils/htmlEscape';
import { useAuthStore } from '@/stores/auth';
import type { Hono } from 'hono';

export function registerSSRRoutes(app: Hono) {
  app.get("*", async (c) => {
    const nonce = crypto.randomUUID();
    const url = new URL(c.req.url);
    const lang = c.get("language");
    const { app: vueApp, router, head, pinia, bodyClass, queryCache } = await createApp(lang);

    vueApp.provide("honoContext", c);

    const auth = useAuthStore();
    auth.$reset();
    await auth.init();

    await router.push(url.pathname);
    await router.isReady();

    return streamText(c, async (stream) => {
      c.header("Content-Type", "text/html; charset=utf-8");
      c.header("Content-Encoding", "Identity");

      const ctx: Record<string, any> = {};
      const appStream = renderToWebStream(vueApp, ctx);

      // HTML Head
      await stream.write(`<!DOCTYPE html><html lang='${auth.user?.language ?? lang}'><head>`);
      await stream.write("<base href='" + url.origin + "'/>");

      // SSR Head tags
      const headResult = await renderSSRHead(head);
      await stream.write(headResult.headTags.replace(/\n/g, ""));

      // Fonts & Favicon
      await stream.write('<link rel="icon" href="/favicon.ico">');
      await stream.write(`<link rel="preconnect" href="https://fonts.googleapis.com" />`);
      await stream.write(`<link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet" />`);

      // Bootstrap scripts
      await stream.write(buildBootstrapScript());

      // Body start
      await stream.write(`</head><body class='${bodyClass}'>`);

      // App content
      await stream.pipe(appStream);

      // Cleanup context
      delete ctx.teleports;
      delete ctx.__teleportBuffers;
      delete ctx.modules;

      // Inject state
      Object.assign(ctx, {
        $p: pinia.state.value,
        $colada: serializeQueryCache(queryCache),
        $locale: auth.user?.language ?? lang,
      });

      // App data script
      const appDataScript = `<script type="application/json" data-ssr="true" id="__APP_DATA__" nonce="${nonce}">${htmlEscape(JSON.stringify(ctx))}</script>`;
      await stream.write(appDataScript);

      // Close HTML
      await stream.write("</body></html>");
    });
  });
}
