import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 8080,
    host: true, // Listen on all local IP addresses (LAN/Mobile testing)
    open: false
  },
  build: {
    target: 'esnext',
    assetsDir: '',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000
  }
});
