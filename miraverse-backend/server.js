import express from 'express';
import cors from 'cors';
import { WorldAuthority } from './world/worldAuthority.js';
import { MAI_AGENT_CONTRACT } from './world/maiAgentContract.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'MIRAVERSE WorldAuthority Node/Express v2.0'
  });
});

// --- World Authority Endpoints ---
app.get('/api/world/overview', (req, res) => {
  res.json(WorldAuthority.getOverview());
});

app.get('/api/world/regions', (req, res) => {
  res.json(WorldAuthority.data.regions);
});

app.get('/api/world/regions/:id', (req, res) => {
  const region = WorldAuthority.getRegion(req.params.id);
  if (!region) return res.status(404).json({ error: 'Region not found' });
  res.json(region);
});

app.get('/api/world/factions', (req, res) => {
  res.json(WorldAuthority.data.factions);
});

app.get('/api/world/factions/:id', (req, res) => {
  const faction = WorldAuthority.getFaction(req.params.id);
  if (!faction) return res.status(404).json({ error: 'Faction not found' });
  res.json(faction);
});

app.get('/api/world/npcs', (req, res) => {
  res.json(WorldAuthority.data.npcs);
});

app.get('/api/world/npcs/:id', (req, res) => {
  const npc = WorldAuthority.getNPC(req.params.id);
  if (!npc) return res.status(404).json({ error: 'NPC not found' });
  res.json(npc);
});

app.get('/api/world/lore', (req, res) => {
  const query = req.query.q || '';
  res.json(WorldAuthority.searchLore(query));
});

// --- MAI Agent Endpoint ---
app.post('/api/mai/chat', (req, res) => {
  const { prompt, userContext } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Simulate lore-consistent MAI structured response
  const loreMatch = WorldAuthority.searchLore(prompt);
  const response = {
    thought: `Processed prompt "${prompt}" under user context: ${userContext?.active_app || 'Desktop'}`,
    response: loreMatch.length > 0 
      ? `MAI Query Result: ${loreMatch[0].title} - ${loreMatch[0].content}`
      : `MAI Systems operational. Querying MIRAVERSE OSX World Authority for "${prompt}".`,
    action: {
      target_app: userContext?.active_app || "Desktop",
      command: "sync_state",
      payload: { query: prompt }
    }
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`🚀 MIRAVERSE Express Backend running on http://localhost:${PORT}`);
});
