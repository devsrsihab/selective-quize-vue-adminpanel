// admin/js/admin-app/vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  // ✅ Admin dev server — port 5174 (public এর 5173 এর সাথে conflict হবে না)
  server: {
    port: 5174,
    cors: true,
    origin: "http://localhost:5174",
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      input: resolve(__dirname, "src/main.js"),
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/index[extname]",
      },
    },
  },
});
