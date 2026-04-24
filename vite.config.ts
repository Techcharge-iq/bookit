import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "./",

  plugins: [react()],

  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },

  build: {
    sourcemap: false,

    // FIX: use literal type safety
    minify: "esbuild" as const,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs"
          ]
        }
      }
    }
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});