import type { StateStorage } from 'zustand/middleware';

// Keep gameplay usable when local storage is unavailable or has reached its quota.
export const osStorage: StateStorage = {
  getItem: (key) => {
    try { return globalThis.localStorage.getItem(key); }
    catch { return null; }
  },
  setItem: (key, value) => {
    try { globalThis.localStorage.setItem(key, value); }
    catch { console.warn('Miraverse progress could not be saved on this device.'); }
  },
  removeItem: (key) => {
    try { globalThis.localStorage.removeItem(key); }
    catch { /* The current session remains playable. */ }
  },
};

// Preserve new default fields when an older save contains only part of the state.
// Arrays are replaced so cleared conditions and completed lists remain cleared.
export function mergeSavedProgress(defaults: any, saved: unknown): any {
  if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : defaults;
  if (defaults !== null && typeof defaults === 'object') {
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
    const merged = { ...defaults };
    for (const [key, value] of Object.entries(saved)) {
      if (key === '__proto__' || key === 'prototype' || key === 'constructor') continue;
      merged[key] = key in defaults ? mergeSavedProgress(defaults[key], value) : value;
    }
    return merged;
  }
  return defaults === null || typeof saved === typeof defaults ? saved : defaults;
}
