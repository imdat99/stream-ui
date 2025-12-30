import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import unocss from "unocss/vite";
import path from "node:path";
export default defineConfig({
  plugins: [unocss(), cloudflare(), vue(), vueJsx()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
