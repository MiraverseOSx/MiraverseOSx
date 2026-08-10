/**
 * MIRAVERSE OSX - Standalone Client World Connector
 * Pure client-side data provider with zero backend dependencies.
 */
import worldData from '../data/worldData.json' with { type: 'json' };

export const apiClient = {
  async getHealth() {
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

  async searchLore(query = '') {
    const lore = worldData.lore || [];
    if (!query) return lore;
    const q = query.toLowerCase();
    return lore.filter((l) =>
      l.title.toLowerCase().includes(q) ||
      l.content.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  },

  async sendMAIPrompt(prompt) {
    return {
      thought: 'Client MAI Logic',
      response: `MAI Assistant: Processing "${prompt}" in native standalone mode.`,
      action: null,
    };
  },
};

export default apiClient;
