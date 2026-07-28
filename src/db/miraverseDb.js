import { databases } from '../appwrite';
import {
  regions as realRegions,
  houses as realHouses,
  factions as realFactions,
  npcs as realNpcs,
  gameApps as realApps,
  lore as realLore,
  events as realEvents,
  getFaction,
  getHouse,
  getRegion,
  getNpc
} from '../data';

// ================================================================
// MIRAVERSEOSX | Database Engine rewired from SQLite data exports
// ================================================================

// Shell APPS - The 8 launchable OS desktop utilities
export const APPS = [
  { id: 'files', title: 'Files', category: 'Utility', dev: 'FAC002', version: '1.0.0', primary: 'File system & lore archive explorer', lore: 'System file explorer for browsing documents, logs, and database records.' },
  { id: 'comms', title: 'Comms', category: 'Communication', dev: 'FAC006', version: '2.9.7', primary: 'Encrypted email portal & ShadowChat feed', lore: 'Communication portal for receiving NPC transmissions and Drifter mesh chat.' },
  { id: 'gamehub', title: 'Game Hub', category: 'Gaming', dev: 'FAC006', version: '1.2.0', primary: 'Interactive mini-games & quest engine', lore: 'Game launcher for Netrunner hacking, Faction quests, and Void Rift challenges.' },
  { id: 'spellforge', title: 'SpellForge', category: 'Hacking/Magic', dev: 'FAC005', version: '1.0.0', primary: 'Combine code modules to stabilize reality', lore: 'Interface for combining element and utility modules into cyber spells to purge threats.' },
  { id: 'passport', title: 'Aura Passport', category: 'Utility/Identity', dev: 'FAC002', version: '1.1.0', primary: 'Student profile, aura status, and medical registry', lore: 'Displays student clearance, active aura networks, Faith Medical records, and lineage clearance.' },
  { id: 'terminal', title: 'Terminal', category: 'Intelligence', dev: 'FAC006', version: '2.1.0', primary: 'Command line interface & live SQL query shell', lore: 'Monochrome terminal interface for executing database commands and scripts.' },
  { id: 'browser', title: 'Browser', category: 'Navigation', dev: 'FAC002', version: '4.2.1', primary: 'Miraverse Web Portal & regional web browser', lore: 'Browser for viewing live net portals across the Miraverse.' },
  { id: 'settings', title: 'Settings', category: 'Utility', dev: 'FAC005', version: '3.0.0', primary: 'System preferences & DB statistics monitor', lore: 'System control panel and database status reader.' }
];

export const REGIONS = realRegions.map((r) => {
  const factionObj = getFaction(r.Controlling_Faction_ID);
  const houseObj = getHouse(r.Primary_House_ID);
  return {
    id: r.Region_ID,
    name: r.Region_Name,
    type: r.Biome_Type,
    climate: r.Climate,
    faction: factionObj ? factionObj.Faction_Name : 'Independent',
    house: houseObj ? houseObj.House_Name : 'None',
    pop: r.Population_Approx,
    danger: r.Danger_Level,
    resources: Array.isArray(r.Key_Resources) ? r.Key_Resources.join('; ') : (r.Key_Resources || ''),
    hub: r.Fast_Travel_Hub,
    unlock: r.Unlock_Method,
    lore: r.Lore_Notes,
  };
});

export const HOUSES = realHouses.map((h) => {
  return {
    id: h.House_ID,
    name: h.House_Name,
    motto: h.Motto,
    region: h.Region_ID,
    allegiance: h.Allegiance,
    resource: h.Primary_Resource,
    seat: h.Seat_of_Power,
    prestige: h.Prestige_Level,
    lore: h.Lore_Notes,
  };
});

export const FACTIONS = realFactions.map((f) => {
  const leaderObj = getNpc(f.Leader_NPC_ID);
  const hqObj = getRegion(f.HQ_Region_ID);
  return {
    id: f.Faction_ID,
    name: f.Faction_Name,
    type: f.Faction_Type,
    leader: leaderObj ? leaderObj.Name : 'Unknown',
    hq: hqObj ? hqObj.Region_Name : 'Unknown',
    ideology: f.Ideology,
    perks: Array.isArray(f.Member_Perks) ? f.Member_Perks.join('; ') : (f.Member_Perks || ''),
    quests: f.Questline_Count,
    lore: f.Lore_Notes,
  };
});

export const NPCS = realNpcs.map((n) => {
  const factionObj = getFaction(n.Faction_ID);
  const regionObj = getRegion(n.Region_ID);
  return {
    id: n.NPC_ID,
    name: n.Name,
    role: n.Role_Class,
    faction: factionObj ? factionObj.Faction_Name : 'Independent',
    region: regionObj ? regionObj.Region_Name : 'Digital Sprawl',
    traits: Array.isArray(n.Personality_Traits) ? n.Personality_Traits.join('; ') : (n.Personality_Traits || ''),
    skill: n.Signature_Skill,
    lore: n.Notes_Lore_JSON?.lore || n.Notes_Lore_JSON || '',
  };
});

export const LORE_ENTRIES = realLore.map((l) => {
  return {
    id: l.Lore_ID,
    title: l.Title,
    type: l.Lore_Type,
    era: l.Era,
    tags: Array.isArray(l.Tags) ? l.Tags.join('; ') : (l.Tags || ''),
    summary: l.Full_Text_Summary,
  };
});

export const EVENTS = realEvents.map((e) => {
  const regionObj = getRegion(e.Region_ID);
  const factionObj = getFaction(e.Faction_ID);
  return {
    id: e.Event_ID,
    name: e.Event_Name,
    type: e.Event_Type,
    region: regionObj ? regionObj.Region_Name : 'Unknown',
    faction: factionObj ? factionObj.Faction_Name : 'Unknown',
    duration: e.Duration_Hours,
    lore: e.Lore_Notes,
  };
});

// Helper Query API
export const miraverseDb = {
  getApps: () => APPS,
  getApp: (id) => APPS.find((a) => a.id === id),
  getRegions: () => REGIONS,
  getHouses: () => HOUSES,
  getFactions: () => FACTIONS,
  getNPCs: () => NPCS,
  getLoreEntries: () => LORE_ENTRIES,
  getEvents: () => EVENTS,

  searchLore: (query) => {
    const q = query.toLowerCase();
    return LORE_ENTRIES.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        l.tags.toLowerCase().includes(q)
    );
  },

  // Lightweight SQL query evaluator for Terminal & DB features
  executeSQL: (sqlString) => {
    const clean = sqlString.trim().toLowerCase();

    if (clean.includes('from regions') || clean === 'regions') {
      return { table: 'Regions', count: REGIONS.length, rows: REGIONS };
    }
    if (clean.includes('from houses') || clean === 'houses') {
      return { table: 'Houses', count: HOUSES.length, rows: HOUSES };
    }
    if (clean.includes('from factions') || clean === 'factions') {
      return { table: 'Factions', count: FACTIONS.length, rows: FACTIONS };
    }
    if (clean.includes('from npcs') || clean === 'npcs') {
      return { table: 'NPCs', count: NPCS.length, rows: NPCS };
    }
    if (clean.includes('from apps') || clean === 'apps') {
      const mappedApps = realApps.map((a) => ({
        id: a.App_ID,
        title: a.App_Name,
        category: a.App_Category,
        dev: a.Developer_Faction_ID,
        version: a.Version,
        primary: a.Primary_Function,
        lore: a.Lore_Notes
      }));
      return { table: 'Apps', count: mappedApps.length, rows: mappedApps };
    }
    if (clean.includes('from lore') || clean.includes('from lore_entries') || clean === 'lore') {
      return { table: 'Lore_Entries', count: LORE_ENTRIES.length, rows: LORE_ENTRIES };
    }
    if (clean.includes('from events') || clean === 'events') {
      return { table: 'Events', count: EVENTS.length, rows: EVENTS };
    }

    // Default summary
    return {
      message: 'Database connection online (miraverse.db via static JSON)',
      tables: ['Regions', 'Houses', 'Factions', 'NPCs', 'Apps', 'Lore_Entries', 'Events'],
      totalRecords:
        REGIONS.length +
        HOUSES.length +
        FACTIONS.length +
        NPCS.length +
        realApps.length +
        LORE_ENTRIES.length +
        EVENTS.length,
      appwriteStatus: databases ? 'Connected' : 'Offline Mode',
    };
  },
};
