import { BROWSER_HOME, MAX_BROWSER_TABS, browserTitle, resolveBrowserInput, recordBrowserVisit } from '../apps/Browser/browserModel';

export function createBrowserActions(set: any, get: any) {
  const open = (input = BROWSER_HOME, title?: string, reuse = false) => {
    const current = get().browserState;
    const resolved = resolveBrowserInput(input);
    if (reuse && current.tabs.length >= MAX_BROWSER_TABS && !current.tabs.some((tab: any) => tab.url === resolved)) {
      get().navigateBrowserTab(resolved, title);
      return;
    }
    set((s: any) => {
    const state = s.browserState; const url = resolveBrowserInput(input);
    const existing = reuse && state.tabs.find((tab: any) => tab.url === url);
    if (existing) return { browserUrl: url, browserState: { ...state, activeTabId: existing.id } };
    if (state.tabs.length >= MAX_BROWSER_TABS) return {};
    const id = state.nextTabId;
    return { browserUrl: url, browserState: { ...state, tabs: [...state.tabs, { id, url, title: title || browserTitle(url) }], activeTabId: id, nextTabId: id + 1, historyMap: { ...state.historyMap, [id]: { stack: [url], index: 0 } }, visits: recordBrowserVisit(state, url) } };
    });
  };
  const travel = (offset: number) => set((s: any) => {
    const state = s.browserState; const id = state.activeTabId; const history = state.historyMap[id]; const index = history?.index + offset;
    if (!history || index < 0 || index >= history.stack.length) return {};
    const url = history.stack[index];
    return { browserUrl: url, browserState: { ...state, tabs: state.tabs.map((tab: any) => tab.id === id ? { ...tab, url, title: browserTitle(url) } : tab), historyMap: { ...state.historyMap, [id]: { ...history, index } }, visits: recordBrowserVisit(state, url) } };
  });
  return {
    setBrowserUrl: (url: string | null) => url ? open(url, undefined, true) : set({ browserUrl: null }),
    openBrowserTab: (url?: string, title?: string) => open(url, title),
    closeBrowserTab: (id: number) => set((s: any) => {
      const state = s.browserState; const index = state.tabs.findIndex((tab: any) => tab.id === id);
      if (index < 0 || state.tabs.length === 1) return {};
      const tabs = state.tabs.filter((tab: any) => tab.id !== id); const historyMap = { ...state.historyMap }; delete historyMap[id];
      const activeTabId = state.activeTabId === id ? tabs[Math.min(index, tabs.length - 1)].id : state.activeTabId;
      return { browserUrl: tabs.find((tab: any) => tab.id === activeTabId).url, browserState: { ...state, tabs, activeTabId, historyMap } };
    }),
    setActiveBrowserTab: (id: number) => set((s: any) => {
      const tab = s.browserState.tabs.find((tab: any) => tab.id === id);
      return tab ? { browserUrl: tab.url, browserState: { ...s.browserState, activeTabId: id } } : {};
    }),
    navigateBrowserTab: (input: string, title?: string) => set((s: any) => {
      const state = s.browserState; const id = state.activeTabId; const url = resolveBrowserInput(input); const history = state.historyMap[id];
      if (!history || history.stack[history.index] === url) return {};
      const stack = [...history.stack.slice(0, history.index + 1), url].slice(-100);
      return { browserUrl: url, browserState: { ...state, tabs: state.tabs.map((tab: any) => tab.id === id ? { ...tab, url, title: title || browserTitle(url) } : tab), historyMap: { ...state.historyMap, [id]: { stack, index: stack.length - 1 } }, visits: recordBrowserVisit(state, url) } };
    }),
    goBrowserBack: () => travel(-1), goBrowserForward: () => travel(1),
    toggleBrowserBookmark: () => set((s: any) => {
      const state = s.browserState; const tab = state.tabs.find((tab: any) => tab.id === state.activeTabId);
      if (!tab) return {};
      const exists = state.bookmarks.some((item: any) => item.url === tab.url);
      return { browserState: { ...state, bookmarks: exists ? state.bookmarks.filter((item: any) => item.url !== tab.url) : [...state.bookmarks, { url: tab.url, title: browserTitle(tab.url) }].slice(-100) } };
    }),
    removeBrowserBookmark: (url: string) => set((s: any) => ({ browserState: { ...s.browserState, bookmarks: s.browserState.bookmarks.filter((item: any) => item.url !== url) } })),
    clearBrowserHistory: () => set((s: any) => ({ browserState: { ...s.browserState, visits: [], historyMap: Object.fromEntries(s.browserState.tabs.map((tab: any) => [tab.id, { stack: [tab.url], index: 0 }])) } })),
  };
}
