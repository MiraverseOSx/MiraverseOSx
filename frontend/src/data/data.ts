// Game reference data, generated from miraverse.db by scripts/export_game_data.py.
// The database enforced foreign keys that plain JSON cannot, so this module rebuilds
// those relationships as lookups.

const empty: any[] = [];

export const regions = empty;
export const houses = empty;
export const factions = empty;
export const npcs = empty;
export const careers = empty;
export const modules = empty;
export const gameApps = empty;
export const lore = empty;
export const events = empty;

// Small helpers for DB-like joins
const indexBy = <T extends Record<string, any>>(rows: T[], key: keyof T) =>
  new Map(rows.map((row) => [row[key], row]));

const REGION_BY_ID = indexBy(regions, 'Region_ID');
const HOUSE_BY_ID = indexBy(houses, 'House_ID');
const FACTION_BY_ID = indexBy(factions, 'Faction_ID');
const NPC_BY_ID = indexBy(npcs, 'NPC_ID');
const CAREER_BY_ID = indexBy(careers, 'Career_ID');
const MODULE_BY_ID = indexBy(modules, 'Module_ID');
const APP_BY_ID = indexBy(gameApps, 'App_ID');
const LORE_BY_ID = indexBy(lore, 'Lore_ID');
const EVENT_BY_ID = indexBy(events, 'Event_ID');

// Single-row lookups. A null id is a valid input and yields undefined.
export const getRegion = (id: string) => REGION_BY_ID.get(id);
export const getHouse = (id: string) => HOUSE_BY_ID.get(id);
export const getFaction = (id: string) => FACTION_BY_ID.get(id);
export const getNpc = (id: string) => NPC_BY_ID.get(id);
export const getCareer = (id: string) => CAREER_BY_ID.get(id);
export const getModule = (id: string) => MODULE_BY_ID.get(id);
export const getApp = (id: string) => APP_BY_ID.get(id);
export const getLore = (id: string) => LORE_BY_ID.get(id);
export const getEvent = (id: string) => EVENT_BY_ID.get(id);

// Reverse joins, mirroring the indexes the importer creates on the SQLite side.
const where = <T extends Record<string, any>>(rows: T[], key: keyof T, id: any) =>
  id == null ? [] : rows.filter((row) => row[key] === id);

export const npcsInRegion = (regionId: string) => where(npcs, 'Region_ID', regionId);
export const npcsInFaction = (factionId: string) => where(npcs, 'Faction_ID', factionId);
export const npcsInHouse = (houseId: string) => where(npcs, 'House_ID', houseId);
export const housesInRegion = (regionId: string) => where(houses, 'Region_ID', regionId);
export const eventsInRegion = (regionId: string) => where(events, 'Region_ID', regionId);
export const eventsForFaction = (factionId: string) => where(events, 'Faction_ID', factionId);
export const loreForRegion = (regionId: string) => where(lore, 'Region_ID', regionId);
export const loreForFaction = (factionId: string) => where(lore, 'Faction_ID', factionId);
export const appsByFaction = (factionId: string) => where(gameApps, 'Developer_Faction_ID', factionId);
export const careersInRegion = (regionId: string) => where(careers, 'Starting_Region_ID', regionId);
export const modulesByTier = (tier: number) => modules.filter((m) => m.Tier === tier);

// Columns exported as arrays of ids; map them back to rows, dropping any that
// do not resolve so callers never receive holes.
const resolveAll = (ids: string[] | undefined, get: (id: string) => any) =>
  (ids || []).map(get).filter(Boolean);

export const factionEnemies = (factionId: string) =>
  resolveAll(getFaction(factionId)?.Enemy_Faction_ID, getFaction);
export const factionAllies = (factionId: string) =>
  resolveAll(getFaction(factionId)?.Allied_Faction_ID, getFaction);
export const connectedLore = (loreId: string) =>
  resolveAll(getLore(loreId)?.Connected_Lore_IDs, getLore);
export const careersForModule = (moduleId: string) =>
  resolveAll(getModule(moduleId)?.Compatible_Career_IDs, getCareer);

// Region -> the faction and house that control it, resolved in one call.
export const regionDetail = (regionId: string) => {
  const region = getRegion(regionId);
  if (!region) return undefined;
  return {
    ...region,
    controllingFaction: getFaction(region.Controlling_Faction_ID),
    primaryHouse: getHouse(region.Primary_House_ID),
    npcs: npcsInRegion(regionId),
    events: eventsInRegion(regionId),
    lore: loreForRegion(regionId),
  };
};

const dashboardJson: { Key: string; Value: any }[] = [];

// Build metrics generated at import time; keys are described in the Dashboard table.
export const dashboard = Object.fromEntries(
  dashboardJson.map((row) => [row.Key, row.Value])
);
