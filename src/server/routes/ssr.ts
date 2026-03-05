import { serializeQueryCache } from '@pinia/colada';
import { renderSSRHead } from '@unhead/vue/server';
import { streamText } from 'hono/streaming';
import { renderToWebStream } from 'vue/server-renderer';

import { createApp } from '@/main';
import { defaultLocale, localeCookieKey } from '@/i18n/constants';
import { normalizeLocale, resolveLocaleFromAcceptLanguage } from '@/i18n';
import { useAuthStore } from '@/stores/auth';
import { buildBootstrapScript } from '@/lib/manifest';
import { htmlEscape } from '@/server/utils/htmlEscape';
import type { Hono } from 'hono';

const parseCookie = (cookieHeader: string | undefined, key: string): string | undefined => {
  if (!cookieHeader) return undefined;
  const segments = cookieHeader.split(';');
  for (const segment of segments) {
    const [rawKey, ...rest] = segment.trim().split('=');
    if (rawKey !== key) continue;
    return decodeURIComponent(rest.join('='));
  }
  return undefined;
};

const resolveLocaleFromAuthUser = (authUser: unknown): string | undefined => {
  if (!authUser || typeof authUser !== 'object') return undefined;
  const maybeLanguage = (authUser as any).language ?? (authUser as any).locale;
  return typeof maybeLanguage === 'string' ? maybeLanguage : undefined;
};

export function registerSSRRoutes(app: Hono) {
  app.get("*", async (c) => {
    const nonce = crypto.randomUUID();
    const url = new URL(c.req.url);

    const cookieLocaleRaw = parseCookie(c.req.header('cookie'), localeCookieKey);
    const acceptLocale = resolveLocaleFromAcceptLanguage(c.req.header('accept-language'));
    const bootstrapLocale = normalizeLocale(cookieLocaleRaw ?? acceptLocale ?? defaultLocale);

    const { app: vueApp, router, head, pinia, bodyClass, queryCache, i18n } = createApp(bootstrapLocale);

    vueApp.provide("honoContext", c);

    const auth = useAuthStore();
    auth.$reset();
    await auth.init();

    const userPreferredLocale = resolveLocaleFromAuthUser(auth.user);
    const resolvedLocale = normalizeLocale(userPreferredLocale ?? cookieLocaleRaw ?? acceptLocale ?? defaultLocale);
    i18n.global.locale.value = resolvedLocale;

    await router.push(url.pathname);
    await router.isReady();

    return streamText(c, async (stream) => {
      c.header("Content-Type", "text/html; charset=utf-8");
      c.header("Content-Encoding", "Identity");

      const ctx: Record<string, any> = {};
      const appStream = renderToWebStream(vueApp, ctx);

      // HTML Head
      await stream.write(`<!DOCTYPE html><html lang='${resolvedLocale}'><head>`);
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
        $locale: resolvedLocale,
      });

      // App data script
      const appDataScript = `<script type="application/json" data-ssr="true" id="__APP_DATA__" nonce="${nonce}">${htmlEscape(JSON.stringify(ctx))}</script>`;
      await stream.write(appDataScript);

      // Close HTML
      await stream.write("</body></html>");
    });
  });
}
