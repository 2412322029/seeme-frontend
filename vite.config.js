import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 匹配图片文件后缀
          if (/\.(png|jpg|jpeg|gif|svg)$/.test(assetInfo.name)) {
            return `assets/[name].[ext]`;  // 不添加 hash 值
          }
          return `assets/[name]-[hash].[ext]`; // 其他资源文件添加 hash 值
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:80", 
        changeOrigin: true, 
        rewrite: (path) => path.replace(/^\/api/, ""), 
      },
      "/exe_icon": {
        target: "http://localhost:80", 
        changeOrigin: true, 
      },
    },
  },
});
