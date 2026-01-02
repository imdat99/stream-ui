import { readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
export function createVirtualPlugin(name: string, load: Plugin["load"]) {
  name = "virtual:" + name;
  return {
    name,
    resolveId(source, _importer, _options) {
      if (source === name || source.startsWith(`${name}?`)) {
        return `\0${source}`;
      }
      return;
    },
    load(id, options) {
      if (id === `\0${name}` || id.startsWith(`\0${name}?`)) {
        return (load as any).apply(this, [id, options]);
      }
    },
  } satisfies Plugin;
}
export function clientFirstBuild(): Plugin {
  return {
    name: "client-first-build",
    config(config) {
      config.builder ??= {};
      config.builder.buildApp = async (builder) => {
        const clientEnvironment = builder.environments.client;
        const workerEnvironments = Object.keys(builder.environments)
          .filter((name) => name !== "client" && name !== "ssr")
          .map((name) => builder.environments[name]);
        // console.log('Client First Build Plugin: Starting builds...', workerEnvironments)
        // Client build first
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (clientEnvironment) {
          // console.log("Client First Build Plugin: Building client...", clientEnvironment.resolve);
          await builder.build(clientEnvironment);
        }

        // Then worker builds
        for (const workerEnv of workerEnvironments) {
          await builder.build(workerEnv);
        }
      };
    },
  };
}
export function injectManifest(): Plugin {
  let clientOutDir = "dist/client";

  return {
    name: "inject-manifest",
    config(config) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const viteConfig = config as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      clientOutDir =
        viteConfig.environments?.client?.build?.outDir ?? "dist/client";
    },
    async transform(code, id, options) {
      // Only transform in SSR environment (non-client)
      if (!options?.ssr) {
        return;
      }

      // Only transform files that contain the placeholder
      if (!code.includes("__VITE_MANIFEST_CONTENT__")) {
        return;
      }

      // Read manifest from client build output
      const manifestPath = path.resolve(
        process.cwd(),
        clientOutDir,
        ".vite/manifest.json"
      );
      let manifestContent: string | undefined;
      try {
        manifestContent = await this.fs
          .readFile(manifestPath)
          .then((data) => data.toString());
      } catch {
        // Manifest not found
      }

      if (!manifestContent) return;

      // Replace placeholder string with actual manifest data
      // Format: { "__manifest__": { default: <manifest> } } to match the Object.entries loop
      const newCode = code.replace(
        /"__VITE_MANIFEST_CONTENT__"/g,
        `{ "__manifest__": { default: ${manifestContent} } }`
      );

      if (newCode !== code) {
        return { code: newCode, map: null };
      }
    },
  };
}
export default function ssrPlugin(): Plugin[] {
  //   const { hotReload: hotReloadOption = true, entry: entryOption = {} } = options

  const plugins: Plugin[] = [];

  plugins.push(clientFirstBuild());
  plugins.push({
    name: "ssr-auto-entry",
    config(config) {
      config.define = config.define || {};
    },
    resolveId(id, importer, options) {
      if (!id.startsWith('@httpClientAdapter')) return

      return path.resolve(
        __dirname,
        options?.ssr
          ? "./src/api/httpClientAdapter.server.ts"
          : "./src/api/httpClientAdapter.client.ts"
      );
    },
    async configResolved(config) {
      const viteConfig = config as any;

      if (!viteConfig.environments) {
        viteConfig.environments = {};
      }
      if (!viteConfig.environments.client) {
        viteConfig.environments.client = {};
      }
      if (!viteConfig.environments.client.build) {
        viteConfig.environments.client.build = {};
      }

      const clientBuild = viteConfig.environments.client.build;
      clientBuild.manifest = true;
      clientBuild.rollupOptions = clientBuild.rollupOptions || {};
      clientBuild.rollupOptions.input = "src/client.ts";
      if (!viteConfig.environments.ssr) {
          const manifestPath = path.join(clientBuild.outDir as string, '.vite/manifest.json')
          try {
            const resolvedPath = path.resolve(process.cwd(), manifestPath)
            const manifestContent = readFileSync(resolvedPath, 'utf-8')
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            config.define['import.meta.env.VITE_MANIFEST_CONTENT'] = JSON.stringify(manifestContent)
          } catch {}
        }
    },
  });
  plugins.push(injectManifest());

  return plugins;
}
