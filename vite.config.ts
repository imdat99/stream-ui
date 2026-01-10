import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";
import unocss from "unocss/vite";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import ssrPlugin from "./plugins/ssrPlugin";
import { vitePluginSsrMiddleware } from "./plugins/vite-plugin-ssr-middleware";
import honoDiPlugin from "@hono-di/vite"
export default defineConfig((env) => {
    // console.log("env:", env, import.meta.env);
    return {
        plugins: [
            unocss(),
            vue(),
            vueJsx(),
            AutoImport({
                imports: ["vue", "vue-router", "pinia"], // Common presets
                dts: true, // Generate TypeScript declaration file
            }),
            Components({
                dirs: ["src/components"],
                extensions: ["vue", "tsx"],
                dts: true,
                dtsTsx: true,
                directives: false,
                resolvers: [PrimeVueResolver()],
            }),
            ssrPlugin(),
            vitePluginSsrMiddleware({
                entry: "src/main.ts",
                preview: path.resolve("dist/server/index.js"),
            }),
            honoDiPlugin(),
            // devServer({
            //   entry: 'src/index.tsx',
            // }),
            // cloudflare(),
        ],
        environments: {
            client: {
                build: {
                    outDir: "dist/client",
                    rollupOptions: {
                        input: { index: "/src/client.ts" },
                    },
                },
            },
            server: {
                build: {
                    outDir: "dist/server",
                    copyPublicDir: false,
                    rollupOptions: {
                        input: { index: "/src/main.ts" },
                    },
                },
            },
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                // "httpClientAdapter": path.resolve(__dirname, "./src/api/httpClientAdapter.server.ts")
            },
        },
        optimizeDeps: {
            exclude: ["vue"],
        },
        server: {
            port: 3000,
        },
        ssr: {
            // external: ["vue"]
            // noExternal: ["vue"],
        },
    };
});
