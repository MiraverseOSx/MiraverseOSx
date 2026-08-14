/**
 * MIRAVERSE OSX - Standalone Client World Connector
 * Pure client-side data provider with zero backend dependencies.
 */
import worldData from '../data/worldData.json' with { type: 'json' };

export interface HealthStatus {
  status: string;
  engine: string;
  uptime: string;
}

export interface MAIPromptResponse {
  thought: string;
  response: string;
  action: string | null;
  source?: string;
}

export const apiClient = {
  async getHealth(): Promise<HealthStatus> {
    return { status: 'standalone', engine: 'Native Client-Side Memory', uptime: '100%' };
  },

  async getWorldOverview() {
    return {
      title: worldData.metadata?.title || 'MIRAVERSE OSX',
      version: worldData.version || '2.0.0',
      regions: worldData.regions || [],
      factions: worldData.factions || [],
      npcs: worldData.npcs || [],
      lore: worldData.lore || [],
    };
  },

  async getRegions() {
    return worldData.regions || [];
  },

  async getFactions() {
    return worldData.factions || [];
  },

  async getNPCs() {
    return worldData.npcs || [];
  },

  async searchLore(query: string = '') {
    const lore = worldData.lore || [];
    if (!query) return lore;
    const q = query.toLowerCase();
    return lore.filter((l: any) =>
      l.title.toLowerCase().includes(q) ||
      l.content.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  },

  async sendMAIPrompt(prompt: string, context: Record<string, unknown> = {}): Promise<MAIPromptResponse> {
    try {
      const res = await fetch('http://localhost:5050/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: JSON.stringify(context) })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          thought: data.thought || 'mcp-agents-groq (Groq Inference)',
          response: data.response || `MAI Assistant: Processed "${prompt}"`,
          action: data.action || null,
          source: data.source || 'Groq API'
        };
      }
    } catch (err) {
      // Clean fallback to native client logic if server is offline
    }
    return {
      thought: 'Client MAI Logic',
      response: `MAI Assistant: Processing "${prompt}" in native OS standalone mode.`,
      action: null,
    };
  },
};

export default apiClient;
