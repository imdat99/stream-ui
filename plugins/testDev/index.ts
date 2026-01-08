import type { Plugin, ViteDevServer } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { bold, cyan, green } from "colorette";
export default function myDevtool(): Plugin {
  let server: ViteDevServer

  return {
    name: 'vite-plugin-hono_di',
    apply: 'serve',

    configureServer(_server) {
      server = _server
        const baseUrl = '__hono_di'
      // API cho UI
    //   server.middlewares.use(`/${baseUrl}/api`, (req, res) => {
    //     res.setHeader('Content-Type', 'application/json')
    //     res.end(JSON.stringify({
    //       time: Date.now(),
    //       message: 'Hello from devtool'
    //     }))
    //   })
        server.middlewares.use(`/${baseUrl}/api/tree`, async (_req, res) => {
        try {
          if (!cached) cached = await getTree(server);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(cached));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(e?.message ?? e) }));
        }
      });
      server.middlewares.use(`/${baseUrl}/api/tree`, async (_req, res) => {
        try {
          if (!cached) cached = await getTree(server);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(cached));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(e?.message ?? e) }));
        }
      });
      // Serve UI
      server.middlewares.use(`/${baseUrl}`, (req, res) => {
        const html = fs.readFileSync(
          path.resolve(__dirname, 'ui/index.html'),
          'utf-8'
        )
        res.setHeader('Content-Type', 'text/html')
        res.end(html)
      })
      const _printUrls = server.printUrls;
            const colorUrl = (url) => cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`));
            server.printUrls = () => {
                _printUrls();
                for (const localUrl of server.resolvedUrls?.local ?? []) {
                    const appUrl = localUrl.endsWith("/") ? localUrl : `${localUrl}/`;
                    const inspectorUrl = `${server.config.base && appUrl.endsWith(server.config.base) ? appUrl.slice(0, -server.config.base.length) : appUrl.slice(0, -1)}/${baseUrl}/`;
                    console.log(`  ${green("➜")}  ${bold("Hono-Di devTool")}: ${colorUrl(`${inspectorUrl}`)}`);
                }
            };
    }
  }
}
