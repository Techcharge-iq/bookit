import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "./",
  logLevel: "warn",

  plugins: [react()],

  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: "es2020",
    minify: "esbuild",
    cssCodeSplit: true,
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});