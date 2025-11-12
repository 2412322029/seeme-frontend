import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    minify: 'terser', // 启用 terser 压缩
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
          if (/\.(png|jpg|jpeg|gif|svg|webp)$/.test(assetInfo.name || '')) {
            return `assets/[name].[ext]`; // 不添加 hash 值
          }
          return `assets/[name]-[hash].[ext]`; // 其他资源文件添加 hash 值
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('naive-ui') || id.includes('@vicons')) {
              return 'chunk-naive-ui';
            }
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'chunk-vue';
            }
            if (id.includes('axios') || id.includes('js-md5') || id.includes('ua-parser-js')) {
              return 'chunk-utils';
            }
            if (id.includes('markdown-it') || id.includes('highlight.js')) {
              return 'chunk-markdown';
            }
            if (id.includes('crossbell')) {
              return 'chunk-crossbell';
            }
            return 'chunk-vendor';
          }
          if (id.includes("/src/components/") || id.includes("/src/views/")) {
            const nameMatch = id.match(/\/([^\/]+)\.(vue|js|ts)/);
            if (nameMatch) {
              return "chunk-business";
            }
          }
        },
      },
    },
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