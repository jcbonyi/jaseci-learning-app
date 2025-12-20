import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
    proxy: {
      '/walker': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/walkers': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/functions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Exclude unnecessary directories from dependency scanning
  optimizeDeps: {
    exclude: ['venv'],
  },
});

