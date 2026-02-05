import { cloudflare } from "@cloudflare/vite-plugin";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "node:path";
import unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import ssrPlugin from "./ssrPlugin";

export default defineConfig((env) => {
  return {
    plugins: [
      unocss(),
      vue(),
      vueJsx(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        dts: true,
      }),
      Components({
        dirs: ["src/components"],
        extensions: ["vue", "tsx"],
        dts: true,
        dtsTsx: true,
        directives: false,
      }),
      ssrPlugin(),
      cloudflare(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
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
