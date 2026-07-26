// Game reference data, generated from miraverse.db by scripts/export_game_data.py.
// Do not edit the JSON by hand -- edit the design-doc workbook, re-run the importer,
// then `npm run data:build`.
//
// The database enforced foreign keys that plain JSON cannot, so this module rebuilds
// those relationships as lookups. Resolvers return undefined (or []) for absent refs
// rather than throwing: several columns are legitimately null, e.g. ORACLE-9 (NPC001)
// has no faction, region, or house.

import appsJson from './Apps.json';
import careersJson from './Careers.json';
import dashboardJson from './Dashboard.json';
import eventsJson from './Events.json';
import factionsJson from './Factions.json';
import housesJson from './Houses.json';
import loreJson from './Lore_Entries.json';
import modulesJson from './Modules.json';
import npcsJson from './NPCs.json';
import regionsJson from './Regions.json';

export const regions = regionsJson;
export const houses = housesJson;
export const factions = factionsJson;
export const npcs = npcsJson;
export const careers = careersJson;
export const modules = modulesJson;
// "gameApps" are in-world apps from the design doc -- distinct from APPS in
// src/apps/registry.js, which are the launchable windows of the OS shell.
export const gameApps = appsJson;
export const lore = loreJson;
export const events = eventsJson;

const indexBy = (rows, key) => new Map(rows.map((row) => [row[key], row]));

const REGION_BY_ID = indexBy(regions, 'Region_ID');
const HOUSE_BY_ID = indexBy(houses, 'House_ID');
const FACTION_BY_ID = indexBy(factions, 'Faction_ID');
const NPC_BY_ID = indexBy(npcs, 'NPC_ID');
const CAREER_BY_ID = indexBy(careers, 'Career_ID');
const MODULE_BY_ID = indexBy(modules, 'Module_ID');
const APP_BY_ID = indexBy(apps, 'App_ID');
const LORE_BY_ID = indexBy(lore, 'Lore_ID');
const EVENT_BY_ID = indexBy(events, 'Event_ID');

// Single-row lookups. A null id is a valid input and yields undefined.
export const getRegion = (id) => REGION_BY_ID.get(id);
export const getHouse = (id) => HOUSE_BY_ID.get(id);
export const getFaction = (id) => FACTION_BY_ID.get(id);
export const getNpc = (id) => NPC_BY_ID.get(id);
export const getCareer = (id) => CAREER_BY_ID.get(id);
export const getModule = (id) => MODULE_BY_ID.get(id);
export const getApp = (id) => APP_BY_ID.get(id);
export const getLore = (id) => LORE_BY_ID.get(id);
export const getEvent = (id) => EVENT_BY_ID.get(id);

// Reverse joins, mirroring the indexes the importer creates on the SQLite side.
const where = (rows, key, id) => (id == null ? [] : rows.filter((row) => row[key] === id));

export const npcsInRegion = (regionId) => where(npcs, 'Region_ID', regionId);
export const npcsInFaction = (factionId) => where(npcs, 'Faction_ID', factionId);
export const npcsInHouse = (houseId) => where(npcs, 'House_ID', houseId);
export const housesInRegion = (regionId) => where(houses, 'Region_ID', regionId);
export const eventsInRegion = (regionId) => where(events, 'Region_ID', regionId);
export const eventsForFaction = (factionId) => where(events, 'Faction_ID', factionId);
export const loreForRegion = (regionId) => where(lore, 'Region_ID', regionId);
export const loreForFaction = (factionId) => where(lore, 'Faction_ID', factionId);
export const appsByFaction = (factionId) => where(apps, 'Developer_Faction_ID', factionId);
export const careersInRegion = (regionId) => where(careers, 'Starting_Region_ID', regionId);
export const modulesByTier = (tier) => modules.filter((m) => m.Tier === tier);

// Columns exported as arrays of ids; map them back to rows, dropping any that
// do not resolve so callers never receive holes.
const resolveAll = (ids, get) => (ids || []).map(get).filter(Boolean);

export const factionEnemies = (factionId) =>
  resolveAll(getFaction(factionId)?.Enemy_Faction_ID, getFaction);
export const factionAllies = (factionId) =>
  resolveAll(getFaction(factionId)?.Allied_Faction_ID, getFaction);
export const connectedLore = (loreId) =>
  resolveAll(getLore(loreId)?.Connected_Lore_IDs, getLore);
export const careersForModule = (moduleId) =>
  resolveAll(getModule(moduleId)?.Compatible_Career_IDs, getCareer);

// Region -> the faction and house that control it, resolved in one call.
export const regionDetail = (regionId) => {
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

// Build metrics generated at import time; keys are described in the Dashboard table.
export const dashboard = Object.fromEntries(
  dashboardJson.map((row) => [row.Key, row.Value])
);
