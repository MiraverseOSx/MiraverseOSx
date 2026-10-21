export const DESKTOP_APP_IDS = ['browser', 'files', 'mail', 'comms', 'passport', 'board', 'housing', 'finance', 'spellforge', 'pulse', 'vitals', 'campus', 'lore', 'jobs', 'meridionRegistry', 'documentStudio', 'dgaos', 'traceForensics', 'process', 'terminal', 'settings'];
export const DEFAULT_SHORTCUT_IDS = ['browser', 'files', 'mail', 'jobs', 'housing', 'lore'];
export const MAX_DESKTOP_SHORTCUTS = 8;
export interface DesktopPreferences { shortcutIds: string[] }

export function restoreDesktopPreferences(saved: unknown): DesktopPreferences {
  const ids = saved && typeof saved === 'object' ? (saved as Partial<DesktopPreferences>).shortcutIds : undefined;
  return { shortcutIds: Array.isArray(ids)
    ? [...new Set(ids.filter((id): id is string => typeof id === 'string' && DESKTOP_APP_IDS.includes(id)))].slice(0, MAX_DESKTOP_SHORTCUTS)
    : [...DEFAULT_SHORTCUT_IDS] };
}
