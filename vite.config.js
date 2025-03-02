import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { terser } from 'rollup-plugin-terser';
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    terser({
      compress: {
        drop_console: true, // 去除 console.log
        drop_debugger: true, // 去除 debugger
        pure_funcs: ['console.info', 'console.debug'], // 去除 console.info 和 console.debug
      },
      format: {
        comments: false, // 去除注释
      },
    }),
  ],
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
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/exe_icon": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
