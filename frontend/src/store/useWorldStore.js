import { create } from 'zustand';
import worldData from '../data/worldData.json' with { type: 'json' };

export const useWorldStore = create((set) => ({
  overview: {
    title: worldData.metadata?.title || 'MIRAVERSE OSX Native Client Reality',
    version: worldData.version || '2.0.0',
    regionsCount: worldData.regions?.length || 0,
    factionsCount: worldData.factions?.length || 0,
    npcsCount: worldData.npcs?.length || 0,
    loreCount: worldData.lore?.length || 0,
  },
  regions: worldData.regions || [],
  factions: worldData.factions || [],
  npcs: worldData.npcs || [],
  lore: worldData.lore || [],
  backendStatus: 'standalone', // Standalone client-side architecture
  loading: false,

  syncWorldData: async () => {
    set({
      overview: {
        title: worldData.metadata?.title || 'MIRAVERSE OSX Native Client Reality',
        version: worldData.version || '2.0.0',
        regionsCount: worldData.regions?.length || 0,
        factionsCount: worldData.factions?.length || 0,
        npcsCount: worldData.npcs?.length || 0,
        loreCount: worldData.lore?.length || 0,
      },
      regions: worldData.regions || [],
      factions: worldData.factions || [],
      npcs: worldData.npcs || [],
      lore: worldData.lore || [],
      backendStatus: 'standalone',
      loading: false,
    });
  },

  sendMAIPrompt: async (prompt) => {
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
      response: `MAI Municipal Assistant: System operating in high-performance native client mode. Query recognized: "${prompt}".`,
      action: null,
    };
  },
}));

export default useWorldStore;
