import { create } from 'zustand';
import { REGIONS, FACTIONS, NPCS, LORE_ENTRIES } from '../db/miraverseDb';

export interface WorldOverview {
  title: string;
  version: string;
  regionsCount: number;
  factionsCount: number;
  npcsCount: number;
  loreCount: number;
}

export interface WorldStoreState {
  overview: WorldOverview;
  regions: any[];
  factions: any[];
  npcs: any[];
  lore: any[];
  backendStatus: string;
  loading: boolean;

  syncWorldData: () => Promise<void>;
  sendMAIPrompt: (prompt: string, context?: any) => Promise<{ thought: string; response: string; action: string | null }>;
}

export const useWorldStore = create<WorldStoreState>((set) => ({
  overview: {
    title: 'MIRAVERSE OSX',
    version: '2.0.0',
    regionsCount: REGIONS.length,
    factionsCount: FACTIONS.length,
    npcsCount: NPCS.length,
    loreCount: LORE_ENTRIES.length,
  },
  regions: REGIONS,
  factions: FACTIONS,
  npcs: NPCS,
  lore: LORE_ENTRIES,
  backendStatus: 'ready',
  loading: false,

  syncWorldData: async () => {
    set({ loading: true });
    // Keep seed data as fallback and indicate local database hydration
    set({
      overview: {
        title: 'MIRAVERSE OSX',
        version: '2.0.0',
        regionsCount: REGIONS.length,
        factionsCount: FACTIONS.length,
        npcsCount: NPCS.length,
        loreCount: LORE_ENTRIES.length,
      },
      regions: REGIONS,
      factions: FACTIONS,
      npcs: NPCS,
      lore: LORE_ENTRIES,
      backendStatus: REGIONS.length > 0 ? 'seeded' : 'awaiting-datagrip-seed',
      loading: false,
    });
  },

  sendMAIPrompt: async (prompt: string, context?: any) => {
    // 1. Query C# Backend AI Controller
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npc: 'Mai',
          prompt,
          activeApp: context?.active_app || 'desktop',
          context: 'MAI Celestial Taskbar Companion'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text) {
          const q = (prompt || '').toLowerCase();
          const action = q.includes('form') ? 'open_form' : (q.includes('quest') || q.includes('mission') ? 'open_worknet' : null);
          return {
            thought: `C# AI Controller [${data.provider} / ${data.model}]`,
            response: data.text,
            action,
          };
        }
      }
    } catch {
      // Fall through to deterministic fallback if offline
    }

    const q = (prompt || '').toLowerCase();
    if (q.includes('form') || q.includes('registration')) {
      return {
        thought: 'Client MAI Assistant Rule Engine',
        response: 'You can open the CITIZEN_REGISTRATION_FORM.osform directly from the File Explorer to verify your civic record.',
        action: 'open_form',
      };
    }
    if (q.includes('quest') || q.includes('mission')) {
      return {
        thought: 'Client MAI Assistant Rule Engine',
        response: 'Open WORKNET for opportunities and civic notices, including Journeys, Quests, and District Operations.',
        action: 'open_worknet',
      };
    }
    return {
      thought: 'Client MAI Assistant Rule Engine',
      response: `MAI Municipal Assistant: Native client mode. Query recognized: "${prompt}".`,
      action: null,
    };
  },
}));

export default useWorldStore;
