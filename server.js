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

// Import World Authority modules
import { WorldAuthority } from './miraverse-backend/world/worldAuthority.js';
import { MAI_AGENT_CONTRACT } from './miraverse-backend/world/maiAgentContract.js';

const PORT = Number(process.env.PORT || 3000);

async function createApp() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // ---------------- API Routes (Unified under /api) ----------------
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString(), engine: 'MIRAVERSE Unified Server' });
    });

    app.get('/api/world/overview', (req, res) => res.json(WorldAuthority.getOverview()));
    app.get('/api/world/regions', (req, res) => res.json(WorldAuthority.data.regions));
    app.get('/api/world/regions/:id', (req, res) => {
        const region = WorldAuthority.getRegion(req.params.id);
        if (!region) return res.status(404).json({ error: 'Region not found' });
        res.json(region);
    });
    app.get('/api/world/factions', (req, res) => res.json(WorldAuthority.data.factions));
    app.get('/api/world/factions/:id', (req, res) => {
        const faction = WorldAuthority.getFaction(req.params.id);
        if (!faction) return res.status(404).json({ error: 'Faction not found' });
        res.json(faction);
    });
    app.get('/api/world/npcs', (req, res) => res.json(WorldAuthority.data.npcs));
    app.get('/api/world/npcs/:id', (req, res) => {
        const npc = WorldAuthority.getNPC(req.params.id);
        if (!npc) return res.status(404).json({ error: 'NPC not found' });
        res.json(npc);
    });
    app.get('/api/world/lore', (req, res) => res.json(WorldAuthority.searchLore(req.query.q || '')));

    app.post('/api/mai/chat', (req, res) => {
        const { prompt, userContext } = req.body || {};
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
        const loreMatch = WorldAuthority.searchLore(prompt);
        const response = {
            thought: `Processed prompt "${prompt}" under user context: ${userContext?.active_app || 'Desktop'}`,
            response: loreMatch.length > 0
                ? `MAI Query Result: ${loreMatch[0].title} - ${loreMatch[0].content}`
                : `MAI Systems operational. Querying MIRAVERSE OSX World Authority for "${prompt}".`,
            action: { target_app: userContext?.active_app || 'Desktop', command: 'sync_state', payload: { query: prompt } },
            contract: MAI_AGENT_CONTRACT?.name || 'MAI',
        };
        res.json(response);
    });

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
        // Vite attaches HMR websocket via middleware in dev; no manual attach needed
        httpServer.listen(PORT, () => {
            console.log(`⚡ Unified Dev Server: http://localhost:${PORT}`);
        });
    } else {
        // Production: serve built assets
        const serve = (await import('serve-static')).default;
        const compression = (await import('compression')).default;
        app.use(compression());
        app.use('/', serve(path.resolve(__dirname, 'miraverse-frontend', 'dist')));
        app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'miraverse-frontend', 'dist', 'index.html')));
        app.listen(PORT, () => console.log(`✓ Unified Server running on http://localhost:${PORT}`));
    }
}

createApp();
