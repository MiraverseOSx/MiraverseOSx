import express from 'express';
import { WorldAuthority } from '../world/worldAuthority.js';
import { MAI_AGENT_CONTRACT } from '../world/maiAgentContract.js';
import { storageEngine } from '../db/storageEngine.js';

export const apiRouter = express.Router();

// --- 1. HEALTH & SYSTEM DIAGNOSTICS ---
apiRouter.get('/health', (req, res) => {
  const dbStatus = storageEngine.getStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'MIRAVERSE Unified World Authority & Storage Engine',
    storage: dbStatus,
  });
});

// --- 2. WORLD AUTHORITY DATA API ---
apiRouter.get('/world/overview', (req, res) => {
  res.json(WorldAuthority.getOverview());
});

apiRouter.get('/world/regions', (req, res) => {
  res.json(WorldAuthority.data.regions);
});

apiRouter.get('/world/regions/:id', (req, res) => {
  const region = WorldAuthority.getRegion(req.params.id);
  if (!region) return res.status(404).json({ error: 'Region not found' });
  res.json(region);
});

apiRouter.get('/world/factions', (req, res) => {
  res.json(WorldAuthority.data.factions);
});

apiRouter.get('/world/factions/:id', (req, res) => {
  const faction = WorldAuthority.getFaction(req.params.id);
  if (!faction) return res.status(404).json({ error: 'Faction not found' });
  res.json(faction);
});

apiRouter.get('/world/npcs', (req, res) => {
  res.json(WorldAuthority.data.npcs);
});

apiRouter.get('/world/npcs/:id', (req, res) => {
  const npc = WorldAuthority.getNPC(req.params.id);
  if (!npc) return res.status(404).json({ error: 'NPC not found' });
  res.json(npc);
});

apiRouter.get('/world/lore', async (req, res) => {
  const query = req.query.q || '';
  const lore = await storageEngine.getLore(query);
  res.json(lore);
});

// --- 3. USER GAMEPLAY PERSISTENCE API ---
apiRouter.get('/user/state', async (req, res) => {
  const userId = req.query.userId || 'CY-9021-CITIZEN';
  const state = await storageEngine.getUserState(userId);
  res.json({ userId, state: state || null });
});

apiRouter.post('/user/state', async (req, res) => {
  const { userId = 'CY-9021-CITIZEN', stateData } = req.body || {};
  if (!stateData) {
    return res.status(400).json({ error: 'stateData object is required' });
  }
  const saved = await storageEngine.saveUserState(userId, stateData);
  res.json({ success: true, userState: saved });
});

// --- 4. PULSE SOCIAL NETWORK API ---
apiRouter.get('/pulse/posts', async (req, res) => {
  const posts = await storageEngine.getPulsePosts();
  res.json(posts);
});

apiRouter.post('/pulse/posts', async (req, res) => {
  const { author, handle, houseTag, content } = req.body || {};
  if (!content) {
    return res.status(400).json({ error: 'Post content is required' });
  }
  const newPost = await storageEngine.createPulsePost({ author, handle, houseTag, content });
  res.json({ success: true, post: newPost });
});

// --- 5. COMMS & MESSAGING API ---
apiRouter.get('/comms/messages', async (req, res) => {
  const userId = req.query.userId || 'CY-9021-CITIZEN';
  const messages = await storageEngine.getCommsMessages(userId);
  res.json(messages);
});

apiRouter.post('/comms/messages', async (req, res) => {
  const { userId = 'CY-9021-CITIZEN', sender, subject, body, time } = req.body || {};
  if (!body) {
    return res.status(400).json({ error: 'Message body is required' });
  }
  const newMsg = await storageEngine.saveCommsMessage(userId, { sender, subject, body, time });
  res.json({ success: true, message: newMsg });
});

// --- 6. QUESTS API ---
apiRouter.get('/quests', async (req, res) => {
  const userId = req.query.userId || 'CY-9021-CITIZEN';
  const quests = await storageEngine.getQuests(userId);
  res.json(quests);
});

apiRouter.post('/quests', async (req, res) => {
  const { userId = 'CY-9021-CITIZEN', questId, status } = req.body || {};
  if (!questId) {
    return res.status(400).json({ error: 'questId is required' });
  }
  const saved = await storageEngine.saveQuest(userId, { questId, status });
  res.json({ success: true, quest: saved });
});

// --- 7. MAI INTELLIGENCE AGENT CHAT API ---
apiRouter.post('/mai/chat', async (req, res) => {
  const { prompt, userContext } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const loreMatch = await storageEngine.getLore(prompt);
  let maiReply = '';
  let thoughtProcess = '';

  // Optional AI integration: Azure Foundry / Azure OpenAI endpoint
  if (process.env.FOUNDRY_ENDPOINT && process.env.FOUNDRY_KEY) {
    try {
      const foundryRes = await fetch(process.env.FOUNDRY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.FOUNDRY_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: process.env.AGENT_INSTRUCTIONS || MAI_AGENT_CONTRACT.systemPromptTemplate(userContext),
            },
            {
              role: 'user',
              content: `[Context: active_app=${userContext?.active_app || 'Desktop'}, location=${userContext?.world_state?.current_location || 'Sector 7'}] ${prompt}`,
            },
          ],
        }),
      });

      if (foundryRes.ok) {
        const data = await foundryRes.json();
        maiReply = data.choices?.[0]?.message?.content || data.response || (typeof data === 'string' ? data : JSON.stringify(data));
        thoughtProcess = `MAI Foundry Neural Response (Context: ${userContext?.active_app || 'Desktop'})`;
      } else {
        const errText = await foundryRes.text();
        console.warn(`Foundry API HTTP ${foundryRes.status}:`, errText);
        thoughtProcess = `Foundry HTTP ${foundryRes.status} — Fallback to WorldAuthority RAG.`;
      }
    } catch (err) {
      console.warn('Foundry endpoint error:', err.message);
      thoughtProcess = `Foundry Connection Error — Fallback to WorldAuthority.`;
    }
  }

  // Fallback response using WorldAuthority lore RAG
  if (!maiReply) {
    if (loreMatch.length > 0) {
      maiReply = `MAI Knowledge Base: ${loreMatch[0].title} — ${loreMatch[0].content}`;
    } else {
      maiReply = `MAI Systems operational. Telemetry indicates optimal signal in sector. Querying MIRAVERSE World Authority for "${prompt}".`;
    }
  }

  res.json({
    thought: thoughtProcess || `Processed prompt "${prompt}" under user context: ${userContext?.active_app || 'Desktop'}`,
    response: maiReply,
    action: {
      target_app: userContext?.active_app || 'Desktop',
      command: 'sync_state',
      payload: { query: prompt },
    },
    contract: MAI_AGENT_CONTRACT?.name || 'MAI Prime',
    version: MAI_AGENT_CONTRACT?.version || '2.0.0',
  });
});

export default apiRouter;
