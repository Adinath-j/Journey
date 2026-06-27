import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isTauri = process.env.TAURI_DEV === "true";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: isTauri ? 1420 : 5173,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    target: "es2022",
    minify: "esbuild",
    sourcemap: false,
  },
  resolve: {
    alias: { "@": "/src" },
  },
});
