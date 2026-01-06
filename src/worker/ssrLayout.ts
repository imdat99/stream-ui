import { createContext, jsx, Suspense } from "hono/jsx";
import { renderToReadableStream, StreamingContext } from "hono/jsx/streaming";
import { HtmlEscapedCallback, HtmlEscapedString, raw } from "hono/utils/html";
// import { jsxs } from "hono/jsx-renderer";
import { Context } from "hono";
import type {
  FC,
  Context as JSXContext,
  JSXNode
} from "hono/jsx";
import { jsxTemplate } from "hono/jsx/jsx-runtime";
export const RequestContext: JSXContext<Context<any, any, {}> | null> =
  createContext<Context | null>(null);
export function renderSSRLayout(c: Context, appStream: ReadableStream) {
  const body = jsxTemplate`${raw("<!DOCTYPE html>")}${_c(
    RequestContext.Provider,
    { value: c },
    //   currentLayout as any
    _c(
      "html",
      { lang: "en" },
      _c(
        "head",
        null,
        raw('<meta charset="UTF-8"/>'),
        raw('<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'),
        raw('<link rel="icon" href="/favicon.ico" />'),
        raw(`<base href="${new URL(c.req.url).origin}/"/>`)
      ),
      _c(
        "body",
        {
          class:
            "font-sans bg-[#f9fafd] text-gray-800 antialiased flex flex-col",
        },
        _c(
          StreamingContext,
          { value: { scriptNonce: "random-nonce-value" } },
          _c(
            Suspense,
            { fallback: _c("div", { class: "loading" }, raw("Loading...")) },
            raw(appStream.getReader())
          )
        ),
        _c("script", {
          dangerouslySetInnerHTML: {
            __html: `window.__SSR_STATE__ = ${JSON.stringify(
              JSON.stringify(c.get("ssrContext") || {})
            )};`,
          },
        })
      )
    )
  )}`;
  return renderToReadableStream(body);
}
function _c(
  tag: string | FC<any>,
  props: any,
  ...children: (JSXNode | HtmlEscapedCallback | HtmlEscapedString | null)[]
): JSXNode {
  return jsx(tag, props, ...(children as any));
}
