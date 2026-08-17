/**
 * MIRAVERSE OS x — Central App Database
 * World data (Regions, Factions, NPCs, Careers, Lore) will be populated
 * from the DataGrip-managed SQLite database via the data pipeline.
 *
 * To seed: connect DataGrip to miraverse.db, populate tables, then run:
 *   npm run data:build
 */

export interface AppMetadata {
  id: string;
  title: string;
  category: string;
  dev: string;
  version: string;
  primary: string;
  lore: string;
}

export const APPS: AppMetadata[] = [
  { id: 'files',     title: 'File Explorer',        category: 'Utility',          dev: 'FAC_NETRUNNERS',   version: '2.0.0', primary: 'File system & lore archive explorer',               lore: 'System file explorer for browsing documents, logs, and database records.' },
  { id: 'mail',      title: 'AureMail Mailbox',     category: 'Communication',    dev: 'FAC_NEO_CITIZENS', version: '1.0.0', primary: 'Personal citizen email & municipal dispatches',      lore: 'Aureline personal citizen email for receiving dispatches, invoices, and welcome packets.' },
  { id: 'comms',     title: 'Comms Portal',         category: 'Communication',    dev: 'FAC_NETRUNNERS',   version: '2.9.7', primary: 'Encrypted messaging & NPC transmissions',            lore: 'Communication portal for receiving NPC transmissions and mesh chat.' },
  { id: 'spellforge',title: 'SpellForge',           category: 'Hacking/Magic',    dev: 'FAC_ARCANE_GUILD', version: '2.0.0', primary: 'Combine code modules to stabilize reality',          lore: 'Interface for combining element and utility modules into cyber spells.' },
  { id: 'passport',  title: 'Citizen Record',       category: 'Utility/Identity', dev: 'FAC_NEO_CITIZENS', version: '2.0.0', primary: 'Citizen record, inventory backpack, skill tree',    lore: 'Displays citizen clearance, inventory, and active aura networks.' },
  { id: 'pulse',     title: 'Mai.space',            category: 'Social/Network',   dev: 'FAC_NEO_CITIZENS', version: '1.0.0', primary: 'Public social signal broadcast & 7 reputation tracks', lore: 'Mai.space public network for tracking reputation, trends, gossip, and public social influence.' },
  { id: 'terminal',  title: 'Terminal',             category: 'Intelligence',     dev: 'FAC_NETRUNNERS',   version: '2.1.0', primary: 'Command line interface & live SQL query shell',      lore: 'Terminal interface for executing database commands and scripts.' },
  { id: 'browser',   title: 'Net Browser',          category: 'Navigation',       dev: 'FAC_NEO_CITIZENS', version: '4.2.1', primary: 'Miraverse Web Portal & regional web browser',       lore: 'Browser for viewing live net portals across the Miraverse.' },
  { id: 'board',     title: 'Master Quest Tracker', category: 'Gameplay',         dev: 'FAC_NEO_CITIZENS', version: '2.0.0', primary: 'Missions, Journeys, Quests & Tasks engine',         lore: 'Central gameplay tracker for Journeys, Adventures, Quests, Tasks, and Missions.' },
  { id: 'process',   title: 'Process Monitor',      category: 'Security',         dev: 'FAC_NETRUNNERS',   version: '2.1.0', primary: 'Thread inspector, trace origins & quarantine PRISM', lore: 'Process Monitor lets players inspect active system processes and isolate PRISM malware.' },
  { id: 'housing',   title: 'Residential Dorm 4B',  category: 'Lifestyle',        dev: 'FAC_NEO_CITIZENS', version: '1.0.0', primary: 'Bed rest, study desk, upgrades & DreamLog records', lore: 'Dormitory quarters for stamina restoration, study, storage, and upgrades.' },
  { id: 'jobs',      title: 'Career Workstation',   category: 'Careers/Shift',    dev: 'FAC_NEO_CITIZENS', version: '2.0.0', primary: 'Multi-role dispatch, medical triage & investigation', lore: 'Official Aureline employment terminal for executing shift missions, dispatching units, and earning salary.' },
  { id: 'lore',      title: 'Lore Explorer (Cloud)',category: 'Lore/Database',    dev: 'FAC_NETRUNNERS',   version: '1.0.0', primary: 'Appwrite Cloud Factions, Locations & NPCs Registry',  lore: 'Live synchronized registry of factions, sectors, and characters from Appwrite Cloud.' },
  { id: 'settings',  title: 'Settings',             category: 'Utility',          dev: 'FAC_ARCANE_GUILD', version: '3.0.0', primary: 'System preferences & DB statistics monitor',        lore: 'System control panel and database status reader.' },
];

// ─── World Data ─────────────────────────────────────────────────────────────
// These will be populated from the DataGrip SQLite pipeline.
// Shape must match the DataGrip schema once connected.

export const REGIONS:      any[] = [];
export const FACTIONS:     any[] = [];
export const NPCS:         any[] = [];
export const CAREERS:      any[] = [];
export const LORE_ENTRIES: any[] = [];

export const miraverseDb = {
  getApps:       (): AppMetadata[] => APPS,
  getApp:        (id: string): AppMetadata | undefined => APPS.find((a) => a.id === id),
  getRegions:    () => REGIONS,
  getFactions:   () => FACTIONS,
  getNPCs:       () => NPCS,
  getCareers:    () => CAREERS,
  getLoreEntries:() => LORE_ENTRIES,

  searchLore: (query: string) => {
    if (!query) return LORE_ENTRIES;
    const q = query.toLowerCase();
    return LORE_ENTRIES.filter(
      (l: any) =>
        l.title?.toLowerCase().includes(q) ||
        l.content?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
    );
  },

  executeSQL: (sqlString: string) => {
    const clean = sqlString.trim().toLowerCase();
    if (clean.includes('from regions')  || clean === 'regions')  return { table: 'Regions',      count: REGIONS.length,      rows: REGIONS };
    if (clean.includes('from factions') || clean === 'factions') return { table: 'Factions',     count: FACTIONS.length,     rows: FACTIONS };
    if (clean.includes('from npcs')     || clean === 'npcs')     return { table: 'NPCs',         count: NPCS.length,         rows: NPCS };
    if (clean.includes('from careers')  || clean === 'careers')  return { table: 'Careers',      count: CAREERS.length,      rows: CAREERS };
    if (clean.includes('from apps')     || clean === 'apps')     return { table: 'Apps',         count: APPS.length,         rows: APPS };
    if (clean.includes('from lore')     || clean === 'lore')     return { table: 'Lore_Entries', count: LORE_ENTRIES.length, rows: LORE_ENTRIES };
    return {
      message: 'MIRAVERSE DB — DataGrip pipeline not yet seeded.',
      hint: 'Connect DataGrip to miraverse.db, populate tables, then run: npm run data:build',
      tables: ['Regions', 'Factions', 'NPCs', 'Careers', 'Apps', 'Lore_Entries'],
      totalRecords: REGIONS.length + FACTIONS.length + NPCS.length + CAREERS.length + APPS.length + LORE_ENTRIES.length,
      status: 'Awaiting DataGrip seed',
    };
  },
};
