// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port : 5174,
    proxy: {
      "/api": {
        target: "https://runcode.shop",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""), // ✅ /api 제거
      },
    },
  },
});
