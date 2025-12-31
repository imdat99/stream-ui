import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, Manifest, Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import unocss from "unocss/vite";
import path from "node:path";
import ssrPlugin from "./ssrPlugin";
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';
export default defineConfig((env) => {
  return {
    plugins: [
      unocss(),
      vue(),
      vueJsx(),
      ssrPlugin(),
      cloudflare(),
      Components({
      resolvers: [
        PrimeVueResolver()
      ]
    }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
