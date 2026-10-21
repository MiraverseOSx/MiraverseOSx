export const BROWSER_HOME = 'https://versenet.aure';
export const MAX_BROWSER_TABS = 8;
export const STARTER_SITES = [
  { name: 'WorkNet', domain: 'worknet.aure', category: 'Work & opportunity', description: 'Find work, read your briefing, and follow your next assignment.' },
  { name: 'CIVINET', domain: 'civinet.mer', category: 'City services', description: 'Your guide to public services and life in Aureline.' },
  { name: 'Faith Medical', domain: 'faithmed.aure', category: 'Health & care', description: 'Explore the medical network and its care services.' },
  { name: 'Cycademy', domain: 'cyacademy.edu', category: 'Learning & research', description: 'Browse the academy, research, and educational opportunities.' },
  { name: 'Royal Historic Society', domain: 'royalhistory.mer', category: 'History & archives', description: 'Follow the traces of the city through its historic collections.' },
];
export interface BrowserTab { id: number; url: string; title: string }
export interface TabHistory { stack: string[]; index: number }
export interface BrowserVisit { url: string; title: string; visitedAt: number }
export interface BrowserBookmark { url: string; title: string }
export interface BrowserState {
  tabs: BrowserTab[]; activeTabId: number; nextTabId: number;
  historyMap: Record<number, TabHistory>;
  visits: BrowserVisit[]; bookmarks: BrowserBookmark[];
}

// Addresses stay inside the fictional network: never open an external frame or execute a scheme.
export function resolveBrowserInput(input: string): string {
  const value = input.trim();
  if (!value) return BROWSER_HOME;
  if (!/\s/.test(value) && (/^https?:\/\//i.test(value) || /^[\w-]+(?:\.[\w-]+)+(?:[/?#].*)?$/.test(value))) {
    try { const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); if (!url.username && !url.password) return url.href.replace(/\/$/, ''); } catch { /* Treat malformed addresses as a search. */ }
  }
  return `${BROWSER_HOME}/find?q=${encodeURIComponent(value)}`;
}
export function browserTitle(url: string): string {
  try {
    const parsed = new URL(url);
    const siteNames = { 'companion.aure': 'Aureline Companion', 'gardenreview.aure': 'Glassline Garden Review', 'readingroom.aure': 'Aureline Open Reading Room' };
    if (siteNames[parsed.hostname]) {
      const section = parsed.pathname.startsWith('/records/') ? parsed.pathname.split('/')[2] : ({ '/profile': 'My profile', '/request': 'Request', '/records': 'My records' }[parsed.pathname] || '');
      return section ? `${section} · ${siteNames[parsed.hostname]}` : siteNames[parsed.hostname];
    }
    if (parsed.hostname === 'fieldnotes.aure') return parsed.searchParams.get('title')?.slice(0, 200) || 'Fieldnotes · Public reading';
    if (['versenet.aure', 'search.aure', 'versenet'].includes(parsed.hostname)) return parsed.pathname === '/find' ? `${parsed.searchParams.get('q') || 'Search'} — Versenet` : 'Versenet';
    return STARTER_SITES.find(site => site.domain === parsed.hostname)?.name || parsed.hostname;
  } catch { return 'Versenet'; }
}
export function initialBrowserState(): BrowserState {
  return { tabs: [{ id: 1, url: BROWSER_HOME, title: 'Versenet' }], activeTabId: 1, nextTabId: 2, historyMap: { 1: { stack: [BROWSER_HOME], index: 0 } }, visits: [], bookmarks: [] };
}
export function recordBrowserVisit(state: BrowserState, url: string): BrowserVisit[] {
  return [{ url, title: browserTitle(url), visitedAt: Date.now() }, ...state.visits.filter(visit => visit.url !== url)].slice(0, 150);
}
export function restoreBrowserState(saved: unknown): BrowserState {
  const defaults = initialBrowserState();
  if (!saved || typeof saved !== 'object') return defaults;
  const data = saved as Partial<BrowserState>;
  const tabs = Array.isArray(data.tabs) ? data.tabs.filter(tab => tab && Number.isSafeInteger(tab.id) && tab.id > 0 && typeof tab.url === 'string').filter((tab, index, all) => all.findIndex(other => other.id === tab.id) === index).slice(0, MAX_BROWSER_TABS).map(tab => ({ ...tab, url: resolveBrowserInput(tab.url), title: browserTitle(resolveBrowserInput(tab.url)) })) : [];
  if (!tabs.length) return defaults;
  const historyMap: Record<number, TabHistory> = {};
  for (const tab of tabs) {
    const history = data.historyMap?.[tab.id];
    const valid = history && Array.isArray(history.stack) && history.stack.length > 0 && history.stack.every(url => typeof url === 'string') && Number.isInteger(history.index) && history.index >= 0 && history.index < history.stack.length;
    historyMap[tab.id] = valid ? { stack: history.stack.map(resolveBrowserInput), index: history.index } : { stack: [tab.url], index: 0 };
    tab.url = historyMap[tab.id].stack[historyMap[tab.id].index]; tab.title = browserTitle(tab.url);
  }
  const cleanItems = (items: unknown) => Array.isArray(items) ? items.filter(item => item && typeof item.url === 'string').map(item => ({ ...item, url: resolveBrowserInput(item.url), title: browserTitle(resolveBrowserInput(item.url)) })).filter((item, index, all) => all.findIndex(other => other.url === item.url) === index) : [];
  return { tabs, historyMap, activeTabId: tabs.some(tab => tab.id === data.activeTabId) ? data.activeTabId! : tabs[0].id, nextTabId: Math.max(...tabs.map(tab => tab.id)) + 1, bookmarks: cleanItems(data.bookmarks).slice(0, 100), visits: cleanItems(data.visits).filter(item => Number.isFinite(item.visitedAt)).slice(0, 150) };
}
