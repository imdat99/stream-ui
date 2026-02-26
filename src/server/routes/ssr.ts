import { serializeQueryCache } from '@pinia/colada';
import { renderSSRHead } from '@unhead/vue/server';
import { streamText } from 'hono/streaming';
import { renderToWebStream } from 'vue/server-renderer';
// @ts-ignore
import Base from '@primevue/core/base';

import { createApp } from '@/main';
import { useAuthStore } from '@/stores/auth';
import { buildBootstrapScript } from '@/lib/manifest';
import { styleTags } from '@/lib/primePassthrough';
import { htmlEscape } from '@/server/utils/htmlEscape';
import type { Hono } from 'hono';

const DEFAULT_STYLE_NAMES = ['primitive', 'semantic', 'global', 'base', 'ripple-directive'];

export function registerSSRRoutes(app: Hono) {
  app.get("*", async (c) => {
    const nonce = crypto.randomUUID();
    const url = new URL(c.req.url);
    
    const { app: vueApp, router, head, pinia, bodyClass, queryCache } = createApp();
    
    vueApp.provide("honoContext", c);
    
    const auth = useAuthStore();
    auth.$reset();
    await auth.init();
    
    await router.push(url.pathname);
    await router.isReady();
    
    const usedStyles = new Set<string>();
    Base.setLoadedStyleName = async (name: string) => usedStyles.add(name);

    return streamText(c, async (stream) => {
      c.header("Content-Type", "text/html; charset=utf-8");
      c.header("Content-Encoding", "Identity");

      const ctx: Record<string, any> = {};
      const appStream = renderToWebStream(vueApp, ctx);

      // HTML Head
      await stream.write("<!DOCTYPE html><html lang='en'><head>");
      await stream.write("<base href='" + url.origin + "'/>");

      // SSR Head tags
      const headResult = await renderSSRHead(head);
      await stream.write(headResult.headTags.replace(/\n/g, ""));

      // Fonts & Favicon
      await stream.write(`<link rel="preconnect" href="https://fonts.googleapis.com">`);
      await stream.write(`<link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap" rel="stylesheet">`);
      await stream.write('<link rel="icon" href="/favicon.ico" />');

      // Bootstrap scripts
      await stream.write(buildBootstrapScript());

      // PrimeVue styles
      if (usedStyles.size > 0) {
        DEFAULT_STYLE_NAMES.forEach(name => usedStyles.add(name));
      }
      
      const activeStyles = styleTags.filter(tag => 
        usedStyles.has(tag.name.replace(/-(variables|style)$/, ""))
      );
      
      for (const tag of activeStyles) {
        await stream.write(`<style type="text/css" data-primevue-style-id="${tag.name}">${tag.value}</style>`);
      }

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
        $colada: serializeQueryCache(queryCache) 
      });

      // App data script
      const appDataScript = `<script type="application/json" data-ssr="true" id="__APP_DATA__" nonce="${nonce}">${htmlEscape(JSON.stringify(ctx))}</script>`;
      await stream.write(appDataScript);

      // Close HTML
      await stream.write("</body></html>");
    });
  });
}
