import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Cloud-Gatos/',
  build: {
    outDir: 'dist', 
    assetsDir: 'assets', 
  },
  server: {
    open: true, 
  },
});