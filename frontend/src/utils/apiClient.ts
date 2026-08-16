/**
 * MIRAVERSE OS x — World Data API Client
 * Reads from miraverseDb (sourced from DataGrip SQLite pipeline).
 * No worldData.json dependency — all data flows from miraverse.db → npm run data:build → miraverseDb.ts
 */
import { REGIONS, FACTIONS, NPCS, LORE_ENTRIES } from '../db/miraverseDb';

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
      title: 'MIRAVERSE OSX',
      version: '2.0.0',
      regions: REGIONS,
      factions: FACTIONS,
      npcs: NPCS,
      lore: LORE_ENTRIES,
    };
  },

  async getRegions() {
    return REGIONS;
  },

  async getFactions() {
    return FACTIONS;
  },

  async getNPCs() {
    return NPCS;
  },

  async searchLore(query: string = '') {
    if (!query) return LORE_ENTRIES;
    const q = query.toLowerCase();
    return LORE_ENTRIES.filter((l: any) =>
      l.title?.toLowerCase().includes(q) ||
      l.content?.toLowerCase().includes(q) ||
      l.category?.toLowerCase().includes(q)
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
    } catch {
      // Clean fallback to native client logic if orchestrator is offline
    }
    return {
      thought: 'Client MAI Logic',
      response: `MAI Assistant: Processing "${prompt}" in native OS standalone mode.`,
      action: null,
    };
  },
};

export default apiClient;
