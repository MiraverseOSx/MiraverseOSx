import { create } from 'zustand';

interface SystemStoreState {
  soundEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  activeTheme: string;
  setTheme: (theme: string) => void;
}

export const useSystemStore = create<SystemStoreState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  activeTheme: 'aureline-light',
  setTheme: (theme) => set({ activeTheme: theme }),
}));

export default useSystemStore;
