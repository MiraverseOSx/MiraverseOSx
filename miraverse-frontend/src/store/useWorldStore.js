import { create } from 'zustand';
import apiClient from '../lib/apiClient';

export const useWorldStore = create((set, get) => ({
  overview: null,
  regions: [],
  factions: [],
  npcs: [],
  lore: [],
  backendStatus: 'checking', // 'online' | 'offline' | 'checking'
  loading: false,

  // Initialize and sync world data from Express API
  syncWorldData: async () => {
    set({ loading: true });
    try {
      const health = await apiClient.getHealth();
      if (health.status === 'ok') {
        const [overview, regions, factions, npcs, lore] = await Promise.all([
          apiClient.getWorldOverview(),
          apiClient.getRegions(),
          apiClient.getFactions(),
          apiClient.getNPCs(),
          apiClient.searchLore('')
        ]);

        set({
          overview,
          regions,
          factions,
          npcs,
          lore,
          backendStatus: 'online',
          loading: false
        });
      } else {
        set({ backendStatus: 'offline', loading: false });
      }
    } catch (err) {
      console.warn('Backend sync failed, falling back to local state:', err);
      set({ backendStatus: 'offline', loading: false });
    }
  },

  // MAI Chat prompt helper
  sendMAIPrompt: async (prompt, userContext = {}) => {
    return await apiClient.sendMAIPrompt(prompt, userContext);
  }
}));

export default useWorldStore;
