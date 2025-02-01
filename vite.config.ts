import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import Checker from "vite-plugin-checker";

export default defineConfig({
  base: "/",
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://relate15.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths({ parseNative: true }),
    Checker({ typescript: true }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
