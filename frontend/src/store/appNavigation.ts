export interface AppDestination { appId: string; section?: string }
export interface WorkspaceRequest { section: string; revision: number }

// Keep old links useful without recreating retired standalone workspaces.
const LEGACY_DESTINATIONS: Record<string, AppDestination> = {
  mirror: { appId: 'passport', section: 'record' },
  civinet: { appId: 'passport', section: 'services' },
  citizenHub: { appId: 'passport', section: 'record' },
  traceForensics: { appId: 'dgaos', section: 'trace' },
  worknet: { appId: 'jobs' },
  board: { appId: 'jobs', section: 'notices' },
  chronicle: { appId: 'jobs', section: 'notices' },
  questnotice: { appId: 'jobs', section: 'civic-jobs' },
  spellforge: { appId: 'campus', section: 'magic' },
  serviceDirectory: { appId: 'browser', section: 'services' },
};
export const isRetiredDesktopApp = (id: unknown): id is string => typeof id === 'string' && Object.hasOwn(LEGACY_DESTINATIONS, id);
export function resolveAppDestination(id: string): AppDestination {
  return isRetiredDesktopApp(id) ? { ...LEGACY_DESTINATIONS[id] } : { appId: id };
}
export function retiredWindowDestination(input: unknown): AppDestination | null {
  if (typeof input === 'string') return isRetiredDesktopApp(input) ? resolveAppDestination(input) : null;
  if (!input || typeof input !== 'object') return null;
  const app = input as { id?: unknown; contentKey?: unknown };
  const id = isRetiredDesktopApp(app.contentKey) ? app.contentKey : app.id;
  return isRetiredDesktopApp(id) ? resolveAppDestination(id) : null;
}
