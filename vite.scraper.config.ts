import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    disabled: true,
  },
  build: {
    target: "node24",
    ssr: true,
    rollupOptions: {
      external: ["electron", "canvas"],
    },
  },
});
