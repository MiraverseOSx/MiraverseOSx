/**
 * MIRAVERSE OS x — World Store
 * Regions, Factions, NPCs, and Lore will be populated once the DataGrip
 * SQLite pipeline is connected and seeded (npm run data:build).
 */
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
  sendMAIPrompt: (prompt: string) => Promise<{ thought: string; response: string; action: string | null }>;
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
  backendStatus: 'awaiting-datagrip-seed',
  loading: false,

  syncWorldData: async () => {
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

  sendMAIPrompt: async (prompt: string) => {
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
        response: 'Check the Notice Board app to view all active Journeys, Quests, and District Operations.',
        action: 'open_board',
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
