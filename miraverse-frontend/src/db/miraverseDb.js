import worldData from '../../../miraverse-backend/world/worldData.json' with { type: 'json' };
import apiClient from '../lib/apiClient';

export const APPS = [
  { id: 'files', title: 'Files', category: 'Utility', dev: 'FAC_NETRUNNERS', version: '2.0.0', primary: 'File system & lore archive explorer', lore: 'System file explorer for browsing documents, logs, and database records.' },
  { id: 'comms', title: 'Comms', category: 'Communication', dev: 'FAC_NETRUNNERS', version: '2.9.7', primary: 'Encrypted email portal & ShadowChat feed', lore: 'Communication portal for receiving NPC transmissions and mesh chat.' },
  { id: 'spellforge', title: 'SpellForge', category: 'Hacking/Magic', dev: 'FAC_ARCANE_GUILD', version: '2.0.0', primary: 'Combine code modules to stabilize reality', lore: 'Interface for combining element and utility modules into cyber spells.' },
  { id: 'passport', title: 'Civic Profile', category: 'Utility/Identity', dev: 'FAC_NEO_CITIZENS', version: '2.0.0', primary: 'Citizen record, inventory backpack, skill tree, and student registry', lore: 'Displays citizen clearance, inventory, and active aura networks.' },
  { id: 'terminal', title: 'Terminal', category: 'Intelligence', dev: 'FAC_NETRUNNERS', version: '2.1.0', primary: 'Command line interface & live SQL query shell', lore: 'Terminal interface for executing database commands and scripts.' },
  { id: 'browser', title: 'Browser', category: 'Navigation', dev: 'FAC_NEO_CITIZENS', version: '4.2.1', primary: 'Miraverse Web Portal & regional web browser', lore: 'Browser for viewing live net portals across the Miraverse.' },
  { id: 'settings', title: 'Settings', category: 'Utility', dev: 'FAC_ARCANE_GUILD', version: '3.0.0', primary: 'System preferences & DB statistics monitor', lore: 'System control panel and database status reader.' },
  { id: 'chatmeet', title: 'ChatMeet', category: 'Communication', dev: 'FAC_NEO_CITIZENS', version: '5.3.0', primary: 'Scheduled video calls and class meetings suite', lore: 'Meeting room for orientation calls and briefings.' }
];

export const REGIONS = worldData.regions || [];
export const FACTIONS = worldData.factions || [];
export const NPCS = worldData.npcs || [];
export const CAREERS = worldData.careers || [];
export const LORE_ENTRIES = worldData.lore || [];

export const miraverseDb = {
  getApps: () => APPS,
  getApp: (id) => APPS.find((a) => a.id === id),
  getRegions: () => REGIONS,
  getFactions: () => FACTIONS,
  getNPCs: () => NPCS,
  getCareers: () => CAREERS,
  getLoreEntries: () => LORE_ENTRIES,

  searchLore: (query) => {
    if (!query) return LORE_ENTRIES;
    const q = query.toLowerCase();
    return LORE_ENTRIES.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.content.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  },

  // Interactive SQL / CLI executor connecting to Express API or Native JSON
  executeSQL: (sqlString) => {
    const clean = sqlString.trim().toLowerCase();

    if (clean.includes('from regions') || clean === 'regions') {
      return { table: 'Regions', count: REGIONS.length, rows: REGIONS };
    }
    if (clean.includes('from factions') || clean === 'factions') {
      return { table: 'Factions', count: FACTIONS.length, rows: FACTIONS };
    }
    if (clean.includes('from npcs') || clean === 'npcs') {
      return { table: 'NPCs', count: NPCS.length, rows: NPCS };
    }
    if (clean.includes('from careers') || clean === 'careers') {
      return { table: 'Careers', count: CAREERS.length, rows: CAREERS };
    }
    if (clean.includes('from apps') || clean === 'apps') {
      return { table: 'Apps', count: APPS.length, rows: APPS };
    }
    if (clean.includes('from lore') || clean === 'lore') {
      return { table: 'Lore_Entries', count: LORE_ENTRIES.length, rows: LORE_ENTRIES };
    }

    return {
      message: 'MIRAVERSE Express API Bridge Online (http://localhost:5000/api)',
      tables: ['Regions', 'Factions', 'NPCs', 'Careers', 'Apps', 'Lore_Entries'],
      totalRecords: REGIONS.length + FACTIONS.length + NPCS.length + CAREERS.length + APPS.length + LORE_ENTRIES.length,
      status: 'Express Backend Connected',
    };
  },
};
