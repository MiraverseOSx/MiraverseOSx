import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import {
  DEFAULT_PHONE_THEME,
  isPhoneThemeId,
} from "../components/phone/themes";
import type { PhoneThemeId } from "../components/phone/themes";

interface PhonePreferences {
  themeId: PhoneThemeId;
  setPhoneTheme: (themeId: PhoneThemeId) => void;
}

// Storage can be unavailable in private sessions or full. Theme changes still work.
const phoneStorage: StateStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* Keep the session preference. */
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* Storage is optional. */
    }
  },
};

export const usePhonePreferences = create<PhonePreferences>()(
  persist(
    (set) => ({
      themeId: DEFAULT_PHONE_THEME,
      setPhoneTheme: (themeId) => {
        if (isPhoneThemeId(themeId)) set({ themeId });
      },
    }),
    {
      name: "miraverse-phone-preferences",
      version: 1,
      storage: createJSONStorage(() => phoneStorage),
      partialize: ({ themeId }) => ({ themeId }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PhonePreferences> | null;
        return {
          ...current,
          themeId: isPhoneThemeId(saved?.themeId)
            ? saved.themeId
            : DEFAULT_PHONE_THEME,
        };
      },
    },
  ),
);
