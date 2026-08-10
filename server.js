import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer as createHttpServer } from 'http';
import { createServer as createViteServer } from 'vite';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import World Authority & API Router modules
import { apiRouter } from './miraverse-backend/routes/apiRouter.js';
import { storageEngine } from './miraverse-backend/db/storageEngine.js';

const PORT = Number(process.env.PORT || 3000);

async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Initialize DB Storage Engine (MongoDB Atlas with In-Memory Fallback)
  await storageEngine.initStorage();

  // ---------------- API Routes (Unified under /api) ----------------
  app.use('/api', apiRouter);

  // ---------------- Vite Dev Middleware (Frontend) ----------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // HTML entry fallback for SPA routes
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexHtmlPath = path.resolve(__dirname, 'index.html');
        let html = await readFile(indexHtmlPath, 'utf-8');
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace?.(e);
        next(e);
      }
    });

    const httpServer = createHttpServer(app);
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use — reusing existing server.`);
      } else {
        console.error('Server error:', err);
      }
    });
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`⚡ Unified Dev Server: http://localhost:${PORT}`);
    });
  } else {
    // Production: serve built assets
    const serve = (await import('serve-static')).default;
    const compression = (await import('compression')).default;
    app.use(compression());
    app.use('/', serve(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
    app.listen(PORT, () => console.log(`✓ Unified Server running on http://localhost:${PORT}`));
  }
}

createApp();
