export type InterfaceAppearance = 'light' | 'dark' | 'system';
export type InterfaceDensity = 'compact' | 'comfortable';
export interface InterfacePreferences { appearance: InterfaceAppearance; density: InterfaceDensity }
export const INTERFACE_STORAGE_KEY = 'miraverse-interface-v1';
export function normalizeInterfacePreferences(value: unknown): InterfacePreferences {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    appearance: ['light', 'dark', 'system'].includes(record.appearance as string) ? record.appearance as InterfaceAppearance : 'system',
    density: record.density === 'comfortable' ? 'comfortable' : 'compact',
  };
}
export function readInterfacePreferences(): InterfacePreferences {
  try { return normalizeInterfacePreferences(JSON.parse(localStorage.getItem(INTERFACE_STORAGE_KEY) || '{}')); }
  catch { return normalizeInterfacePreferences(null); }
}
export function saveInterfacePreferences(value: InterfacePreferences) {
  try { localStorage.setItem(INTERFACE_STORAGE_KEY, JSON.stringify(normalizeInterfacePreferences(value))); }
  catch { /* Preferences still work for this session when browser storage is unavailable. */ }
}
export function resolveInterfaceAppearance(appearance: InterfaceAppearance, systemDark: boolean) {
  return appearance === 'system' ? systemDark ? 'dark' : 'light' : appearance;
}

/** Only device appearance changes cross tabs; never import gameplay or unrelated storage. */
export function subscribeInterfacePreferences(listener: (preferences: InterfacePreferences) => void, target: Pick<Window, 'addEventListener' | 'removeEventListener'>) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== INTERFACE_STORAGE_KEY && event.key !== null) return;
    let value: unknown = null;
    try { value = JSON.parse(event.newValue || 'null'); } catch { /* Reset malformed appearance preferences safely. */ }
    listener(normalizeInterfacePreferences(value));
  };
  target.addEventListener('storage', onStorage as EventListener);
  return () => target.removeEventListener('storage', onStorage as EventListener);
}
