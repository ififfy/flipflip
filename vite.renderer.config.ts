import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    '__VERSION__': JSON.stringify(require("./package.json").version)
  }
});
