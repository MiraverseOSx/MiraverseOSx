import { create } from 'zustand';
import { normalizeInterfacePreferences, readInterfacePreferences, saveInterfacePreferences, type InterfacePreferences } from './interfacePreferences';

interface SystemStoreState {
  soundEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  activeTheme: string;
  setTheme: (theme: string) => void;
  interfacePreferences: InterfacePreferences;
  setInterfacePreferences: (patch: Partial<InterfacePreferences>) => void;
}

export const useSystemStore = create<SystemStoreState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  activeTheme: 'aureline-light',
  setTheme: (theme) => set({ activeTheme: theme }),
  interfacePreferences: readInterfacePreferences(),
  setInterfacePreferences: (patch) => set((state) => {
    const preferences = normalizeInterfacePreferences({ ...state.interfacePreferences, ...patch });
    saveInterfacePreferences(preferences);
    return { interfacePreferences: preferences };
  }),
}));

export default useSystemStore;
