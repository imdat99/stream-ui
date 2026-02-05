import { cloudflare } from "@cloudflare/vite-plugin";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";
import unocss from "unocss/vite";
import { defineConfig } from "vite";
import ssrPlugin from "./ssrPlugin";
export default defineConfig((env) => {
  // console.log("env:", env, import.meta.env);
  return {
    plugins: [
      unocss(),
      vue(),
      vueJsx(),
      ssrPlugin(),
      cloudflare(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // "httpClientAdapter": path.resolve(__dirname, "./src/api/httpClientAdapter.server.ts")
      },
    },
    optimizeDeps: {
      exclude: ["vue"],
    },

    ssr: {
      noExternal: ["vue"],
    },
  };
});
