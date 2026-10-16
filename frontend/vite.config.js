import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/dgaos/components'),
      '@/lib': path.resolve(__dirname, './src/dgaos/lib'),
      '@/data': path.resolve(__dirname, './src/dgaos/data'),
      '@/hooks': path.resolve(__dirname, './src/dgaos/hooks'),
      '@/dgaos': path.resolve(__dirname, './src/dgaos'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../wwwroot',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
