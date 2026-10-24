import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), {
    name: 'miraverse-offline-shell',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      // Run after Vite removes JavaScript placeholders for CSS-only chunks.
      order: 'post',
      handler(_options, bundle) {
      const assets = Object.keys(bundle).filter(name => /\.(js|css|woff2?|ttf)$/.test(name)).map(name => `/${name}`);
      const workerSource = readFileSync(path.join(__dirname, 'offline-worker.js'), 'utf8');
      const revision = createHash('sha256').update(assets.join('\n')).update(workerSource).update(readFileSync(path.join(__dirname, 'index.html'))).update(readFileSync(path.join(__dirname, 'public/manifest.json'))).digest('hex').slice(0, 16);
      const precache = ['/index.html', '/manifest.json', '/pwa-icon.svg', '/favicon.ico', '/images/Logo_Icon - 1.png', ...assets];
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `const CACHE_NAME = ${JSON.stringify(`miraverse-shell-${revision}`)};\nconst PRECACHE = ${JSON.stringify(precache)};\n${workerSource}` });
      },
    },
  }],
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
