export const BROWSER_HOME = 'https://versenet.aure';
export const MAX_BROWSER_TABS = 8;

export interface InGamePortal {
  id: string;
  name: string;
  domain: string;
  url: string;
  category: string;
  description: string;
  badge: 'SUITE' | 'SECURE' | 'GOV' | 'HEALTH' | 'CARGO' | 'ONION' | 'ACADEMIC' | 'DEEDS' | 'ARCHIVE' | 'SOCIAL' | 'CIVIC';
}

export const IN_GAME_PORTALS: InGamePortal[] = [
  { 
    id: 'auresuite', 
    name: 'AureSuite Cloud', 
    domain: 'auresuite.aure', 
    url: 'https://auresuite.aure', 
    category: 'Cloud Productivity', 
    description: 'Unified Mailbox, Cloud Drive, Live AI Chat, 7 Realms Radar & Cipher Decryptor.', 
    badge: 'SUITE' 
  },
  { 
    id: 'bank', 
    name: 'First Federal Bank', 
    domain: 'bank.aure', 
    url: 'https://bank.aure', 
    category: 'Finance & Treasury', 
    description: 'Municipal Credit & Bit accounts, authenticated wire transfer terminal, and live transaction ledger.', 
    badge: 'SECURE' 
  },
  { 
    id: 'dga', 
    name: 'Directorate of Global Affairs', 
    domain: 'dga.gov.aure', 
    url: 'https://dga.gov.aure', 
    category: 'Civic Governance', 
    description: 'Citizen clearance registry lookup, executive directives, active warrants, and security cipher gate.', 
    badge: 'GOV' 
  },
  { 
    id: 'faithmed', 
    name: 'Faith Medical Group', 
    domain: 'faithmed.aure', 
    url: 'https://faithmed.aure', 
    category: 'Healthcare & Telemetry', 
    description: 'Bio-aura baseline diagnostic scans, inpatient care triage, and treatment protocols.', 
    badge: 'HEALTH' 
  },
  { 
    id: 'shipping', 
    name: 'CargoTrack Logistics', 
    domain: 'shipping.aure', 
    url: 'https://shipping.aure', 
    category: 'Freight & Waybills', 
    description: 'Consignment manifest lookup, cargo tracking, and route discrepancy audit (#CG-8821).', 
    badge: 'CARGO' 
  },
  { 
    id: 'vectornet', 
    name: 'VectorNet Underground', 
    domain: 'vectornet.aure', 
    url: 'https://vectornet.aure', 
    category: 'DarkNet Onion Relay', 
    description: 'Encrypted onion route, classified intel broker market, and interactive hacker terminal.', 
    badge: 'ONION' 
  },
  { 
    id: 'cyacademy', 
    name: 'Cycademy of Sciences', 
    domain: 'cyacademy.edu', 
    url: 'https://cyacademy.edu', 
    category: 'Academic Research', 
    description: 'Compiler Lab 4, algorithmic spell engineering, faculty roster, and research student directory.', 
    badge: 'ACADEMIC' 
  },
  { 
    id: 'records', 
    name: 'Orynvell Public Records', 
    domain: 'records.orynvell.gov', 
    url: 'https://records.orynvell.gov', 
    category: 'Property & Deeds', 
    description: 'Classified property deeds and Subterranean Conduit Sector 7 alignment filings.', 
    badge: 'DEEDS' 
  },
  { 
    id: 'royalhistory', 
    name: 'Royal Historic Society', 
    domain: 'royalhistory.mer', 
    url: 'https://royalhistory.mer', 
    category: 'Dynastic Archives', 
    description: 'Restricted succession codices and pre-Collapse Council charters of succession.', 
    badge: 'ARCHIVE' 
  },
  { 
    id: 'maispace', 
    name: 'MAI Space Social', 
    domain: 'mai.space', 
    url: 'https://mai.space', 
    category: 'Citizen Social Network', 
    description: 'Decentralized citizen social network, public timelines, profiles, and community dispatches.', 
    badge: 'SOCIAL' 
  },
  { 
    id: 'civinet', 
    name: 'Citizen Hub (CIVINET)', 
    domain: 'civinet.mer', 
    url: 'https://civinet.mer', 
    category: 'Municipal Services', 
    description: 'Personal civic identity, services desk, and residence records.', 
    badge: 'CIVIC' 
  },
];

export const STARTER_SITES = IN_GAME_PORTALS.slice(0, 5);

export interface BrowserTab { id: number; url: string; title: string }
export interface TabHistory { stack: string[]; index: number }
export interface BrowserVisit { url: string; title: string; visitedAt: number }
export interface BrowserBookmark { url: string; title: string }
export interface BrowserState {
  tabs: BrowserTab[]; 
  activeTabId: number; 
  nextTabId: number;
  historyMap: Record<number, TabHistory>;
  visits: BrowserVisit[]; 
  bookmarks: BrowserBookmark[];
}

// Resolve addresses without executing schemes. External destinations first show an explicit gateway.
export function resolveBrowserInput(input: string): string {
  const value = input.trim();
  if (!value) return BROWSER_HOME;
  if (!/\s/.test(value) && (/^https?:\/\//i.test(value) || /^[\w-]+(?:\.[\w-]+)+(?:[/?#].*)?$/.test(value))) {
    try { 
      const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`); 
      if (!url.username && !url.password) return url.href.replace(/\/$/, ''); 
    } catch { /* Treat malformed addresses as a search. */ }
  }
  return `${BROWSER_HOME}/find?q=${encodeURIComponent(value)}`;
}

export function browserTitle(url: string): string {
  try {
    const parsed = new URL(url);
    const siteNames: Record<string, string> = { 
      'companion.aure': 'Aureline Companion', 
      'gardenreview.aure': 'Glassline Garden Review', 
      'readingroom.aure': 'Aureline Open Reading Room',
      'auresuite.aure': 'AureSuite Cloud',
      'bank.aure': 'First Federal Bank',
      'dga.gov.aure': 'Directorate of Global Affairs',
      'dga.gov': 'Directorate of Global Affairs',
      'faithmed.aure': 'Faith Medical Group',
      'shipping.aure': 'CargoTrack Logistics',
      'vectornet.aure': 'VectorNet Underground',
      'cyacademy.edu': 'Cycademy of Sciences',
      'records.orynvell.gov': 'Orynvell Public Records',
      'royalhistory.mer': 'Royal Historic Society',
      'mai.space': 'MAI Space Social',
      'civinet.mer': 'Citizen Hub',
      'civinet.aure': 'Citizen Hub'
    };
    if (siteNames[parsed.hostname]) {
      const section = parsed.pathname.startsWith('/records/') 
        ? parsed.pathname.split('/')[2] 
        : ({ '/profile': 'My profile', '/request': 'Request', '/records': 'My records' }[parsed.pathname] || '');
      return section ? `${section} · ${siteNames[parsed.hostname]}` : siteNames[parsed.hostname];
    }
    if (parsed.hostname === 'fieldnotes.aure') return parsed.searchParams.get('title')?.slice(0, 200) || 'Fieldnotes · Public reading';
    if (parsed.hostname === 'services.aure') return 'Service Directory';
    if (['versenet.aure', 'search.aure', 'versenet'].includes(parsed.hostname)) return parsed.pathname === '/find' ? `${parsed.searchParams.get('q') || 'Search'} — Versenet` : 'Versenet';
    const portal = IN_GAME_PORTALS.find(site => site.domain === parsed.hostname);
    return portal?.name || parsed.hostname;
  } catch { return 'Versenet'; }
}

export function initialBrowserState(): BrowserState {
  const defaultBookmarks: BrowserBookmark[] = IN_GAME_PORTALS.map(p => ({
    title: p.name,
    url: p.url
  }));

  return { 
    tabs: [{ id: 1, url: BROWSER_HOME, title: 'Versenet' }], 
    activeTabId: 1, 
    nextTabId: 2, 
    historyMap: { 1: { stack: [BROWSER_HOME], index: 0 } }, 
    visits: [], 
    bookmarks: defaultBookmarks 
  };
}

export function recordBrowserVisit(state: BrowserState, url: string): BrowserVisit[] {
  return [{ url, title: browserTitle(url), visitedAt: Date.now() }, ...state.visits.filter(visit => visit.url !== url)].slice(0, 150);
}

export function restoreBrowserState(saved: unknown): BrowserState {
  const defaults = initialBrowserState();
  if (!saved || typeof saved !== 'object') return defaults;
  const data = saved as Partial<BrowserState>;
  const cleanItems = (items: unknown) => Array.isArray(items) 
    ? items.filter(item => item && typeof item.url === 'string')
        .map(item => ({ ...item, url: resolveBrowserInput(item.url), title: browserTitle(resolveBrowserInput(item.url)) }))
        .filter((item, index, all) => all.findIndex(other => other.url === item.url) === index) 
    : [];

  const bookmarks = cleanItems(data.bookmarks).length > 0 ? cleanItems(data.bookmarks).slice(0, 100) : defaults.bookmarks;
  const visits = cleanItems(data.visits).filter(item => Number.isFinite(item.visitedAt)).slice(0, 150);

  // Versenet always opens on the home page: active tab is always BROWSER_HOME
  return { 
    tabs: [{ id: 1, url: BROWSER_HOME, title: 'Versenet' }], 
    historyMap: { 1: { stack: [BROWSER_HOME], index: 0 } }, 
    activeTabId: 1, 
    nextTabId: 2, 
    bookmarks, 
    visits 
  };
}
