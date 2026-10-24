import { getDesktopTheme, type DesktopThemeId } from './desktopThemes';
import { resolveAppDestination } from './appNavigation';

export const DESKTOP_APP_IDS = ['browser', 'files', 'mail', 'comms', 'maispace', 'passport', 'housing', 'finance', 'pulse', 'vitals', 'campus', 'lore', 'jobs', 'fieldOperations', 'meridionRegistry', 'documentStudio', 'dgaos', 'process', 'terminal', 'settings'];
export const DEFAULT_SHORTCUT_IDS = ['browser', 'files', 'mail', 'jobs', 'housing', 'lore'];
export const MAX_DESKTOP_SHORTCUTS = 8;
export interface DesktopPreferences { shortcutIds: string[]; themeId: DesktopThemeId }

export function restoreDesktopPreferences(saved: unknown): DesktopPreferences {
  const ids = saved && typeof saved === 'object' ? (saved as Partial<DesktopPreferences>).shortcutIds : undefined;
  return { themeId: getDesktopTheme((saved as Partial<DesktopPreferences>)?.themeId).id, shortcutIds: Array.isArray(ids)
    ? [...new Set(ids.filter((id): id is string => typeof id === 'string').map(id => resolveAppDestination(id).appId).filter(id => DESKTOP_APP_IDS.includes(id)))].slice(0, MAX_DESKTOP_SHORTCUTS)
    : [...DEFAULT_SHORTCUT_IDS] };
}
