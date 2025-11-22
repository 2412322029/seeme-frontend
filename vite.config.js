import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // visualizer({})
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    cssCodeSplit: false, // 禁用 CSS 代码拆分
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true, // 去除 debugger
        pure_funcs: ["console.info", "console.debug"],
      },
      format: {
        comments: false, // 去除注释
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // 匹配图片文件后缀
          if (/\.(png|jpg|jpeg|gif|svg|webp)$/.test(assetInfo.name || "")) {
            return `assets/[name].[ext]`; // 不添加 hash 值
          }
          return `assets/[name]-[hash].[ext]`; // 其他资源文件添加 hash 值
        },
        manualChunks(id) {},
      },
    },
  },
  customLogger: {
    warn(message, options) {
      // 忽略包含 'INVALID_PURE_ANNOTATION_POSITION' 的警告
      if (message.includes("INVALID_PURE_ANNOTATION_POSITION")) {
        return;
      }
    },
    info: (msg) => console.log(msg),
    error: (msg) => console.error(msg),
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000/api",
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
