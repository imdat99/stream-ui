import createVueApp from "@/shared/createVueApp";
import { renderSSRHead } from "@unhead/vue/server";
import { Context } from "hono";
import { streamText } from "hono/streaming";
import { renderToWebStream } from "vue/server-renderer";
import { buildBootstrapScript } from "@/lib/manifest";
import { styleTags } from "@/lib/primePassthrough";
import { useAuthStore } from "@/stores/auth";
// @ts-ignore
import Base from "@primevue/core/base";
import { BlankEnv, BlankInput } from "hono/types";

const defaultNames = [
    "primitive",
    "semantic",
    "global",
    "base",
    "ripple-directive",
];
export async function ssrRender(
    c: Context<BlankEnv, "*", BlankInput>
): Promise<Response> {
    if (c.req.method !== "GET") {
        return c.json({ error: "Method not allowed" }, 405);
    }
    const nonce = crypto.randomUUID();
    const url = new URL(c.req.url);
    const { app, router, head, pinia, bodyClass } = createVueApp();
    app.provide("honoContext", c);
    const auth = useAuthStore();
    auth.$reset();
    auth.initialized = false;
    await auth.init();
    await router.push(url.pathname);
    await router.isReady();
    let usedStyles = new Set<String>();
    Base.setLoadedStyleName = async (name: string) => usedStyles.add(name);
    return streamText(c, async (stream) => {
        c.header("Content-Type", "text/html; charset=utf-8");
        c.header("Content-Encoding", "Identity");
        const ctx: Record<string, any> = {};
        const appStream = renderToWebStream(app, ctx);
        // console.log("ctx: ", );
        await stream.write("<!DOCTYPE html><html lang='en'><head>");
        await stream.write("<base href='" + url.origin + "'/>");
        await renderSSRHead(head).then((headString) =>
            stream.write(headString.headTags.replace(/\n/g, ""))
        );
        // await stream.write(`<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"rel="stylesheet"></link>`);
        await stream.write('<link rel="stylesheet" href="https://rsms.me/inter/inter.css">');
        await stream.write('<link rel="icon" href="/favicon.ico" />');
        await stream.write('<link rel="shortcut icon" href="/favicon-32x32.png" sizes="32x32" type="image/x-icon">');
        await stream.write('<link rel="icon" href="/android-chrome-192x192.png" sizes="192x192" type="image/x-icon">');
        await stream.write('<link rel="icon" href="/android-chrome-512x512.png" sizes="512x512" type="image/x-icon">');
        await stream.write('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');

        await stream.write(buildBootstrapScript());
        if (usedStyles.size > 0) {
            defaultNames.forEach((name) => usedStyles.add(name));
        }
        await Promise.all(
            styleTags
                .filter((tag) =>
                    usedStyles.has(tag.name.replace(/-(variables|style)$/, ""))
                )
                .map((tag) =>
                    stream.write(
                        `<style type="text/css" data-primevue-style-id="${tag.name}">${tag.value}</style>`
                    )
                )
        );
        await stream.write(`</head><body class='${bodyClass}'>`);
        await stream.pipe(appStream);
        Object.assign(ctx, { $p: pinia.state.value });
        await stream.write(
            `<script type="application/json" data-ssr="true" id="__APP_DATA__" nonce="${nonce}">${htmlEscape(
                JSON.stringify(ctx)
            )}</script>`
        );
        await stream.write("</body></html>");
    });
}
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
