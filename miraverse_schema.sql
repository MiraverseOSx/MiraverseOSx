-- ============================================================
-- MIRAVERSE OSx — SQLite Schema
-- Run this entire file in DataGrip to create all game tables.
-- File: M:\MiraverseOSx\miraverse.db
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── REGIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Regions (
    id              TEXT PRIMARY KEY,          -- e.g. REG001
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,             -- District, Wilderness, Underground, etc.
    description     TEXT,
    lore_snippet    TEXT,
    danger_level    INTEGER DEFAULT 1,         -- 1 (safe) to 10 (lethal)
    prism_coverage  REAL DEFAULT 100.0,        -- % PRISM network coverage
    corruption      REAL DEFAULT 0.0,          -- % corruption level
    key_resources   TEXT,                      -- semicolon-delimited list
    subzones        TEXT,                      -- semicolon-delimited list
    ambient_event_pool TEXT,                   -- semicolon-delimited event IDs
    controlling_faction TEXT REFERENCES Factions(id),
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── FACTIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Factions (
    id              TEXT PRIMARY KEY,          -- e.g. FAC001
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,             -- Government, Criminal, Academic, Medical, etc.
    description     TEXT,
    lore_snippet    TEXT,
    ideology        TEXT,
    reputation_track TEXT,                     -- name of the associated reputation axis
    allied_faction_ids TEXT,                   -- semicolon-delimited Faction IDs
    enemy_faction_ids  TEXT,                   -- semicolon-delimited Faction IDs
    member_perks    TEXT,                      -- semicolon-delimited perks
    hq_region       TEXT REFERENCES Regions(id),
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── NPCS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS NPCs (
    id              TEXT PRIMARY KEY,          -- e.g. NPC001
    name            TEXT NOT NULL,
    title           TEXT,
    faction_id      TEXT REFERENCES Factions(id),
    home_region     TEXT REFERENCES Regions(id),
    role            TEXT NOT NULL,             -- Vendor, Quest Giver, Enemy, Ally, Neutral
    personality_traits TEXT,                   -- semicolon-delimited traits
    dialogue_tone   TEXT,
    system_context  TEXT,                      -- AI prompt context injected into NPCEngine
    lore_snippet    TEXT,
    notes_lore_json TEXT,                      -- serialized JSON for extra lore fields
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── CAREERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Careers (
    id              TEXT PRIMARY KEY,          -- e.g. CAR001
    name            TEXT NOT NULL,
    archetype       TEXT NOT NULL,             -- Netrunner, Arcane Scholar, Enforcer, Medic, etc.
    description     TEXT,
    lore_snippet    TEXT,
    primary_stat    TEXT,
    signature_ability TEXT,
    passive_bonus   TEXT,                      -- semicolon-delimited bonuses
    compatible_modules TEXT,                   -- semicolon-delimited Module IDs
    starting_credits INTEGER DEFAULT 1500,
    starting_xp     INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── MODULES ────────────────────────────────────────────────
-- Spell / hack / utility modules combinable in SpellForge
CREATE TABLE IF NOT EXISTS Modules (
    id              TEXT PRIMARY KEY,          -- e.g. MOD001
    name            TEXT NOT NULL,
    element         TEXT NOT NULL,             -- Ignis, Aqua, Terra, Aer, Lux, Umbra, Aether
    type            TEXT NOT NULL,             -- Utility, Rune, Cipher, Protocol
    tier            INTEGER DEFAULT 1,         -- 1-5
    base_power      REAL DEFAULT 50.0,
    description     TEXT,
    lore_snippet    TEXT,
    stat_bonus_json TEXT,                      -- e.g. {"speed": 1.2, "range": 1.5}
    craft_materials TEXT,                      -- semicolon-delimited material names
    compatible_career_ids TEXT,                -- semicolon-delimited Career IDs
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── LORE_ENTRIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Lore_Entries (
    id              TEXT PRIMARY KEY,          -- e.g. LORE001
    title           TEXT NOT NULL,
    category        TEXT NOT NULL,             -- History, Technology, Faction, Region, Character
    content         TEXT NOT NULL,
    tags            TEXT,                      -- semicolon-delimited tags
    connected_lore_ids TEXT,                   -- semicolon-delimited Lore_Entry IDs
    related_faction TEXT REFERENCES Factions(id),
    related_region  TEXT REFERENCES Regions(id),
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── EVENTS ─────────────────────────────────────────────────
-- World events that drive the Ecosystem Engine
CREATE TABLE IF NOT EXISTS Events (
    id              TEXT PRIMARY KEY,          -- e.g. EVT001
    name            TEXT NOT NULL,
    type            TEXT NOT NULL,             -- Anomaly, Festival, Crisis, Patrol, Discovery
    region_id       TEXT REFERENCES Regions(id),
    faction_trigger TEXT REFERENCES Factions(id),
    description     TEXT,
    duration_ticks  INTEGER DEFAULT 10,
    corruption_delta REAL DEFAULT 0.0,
    prism_delta     REAL DEFAULT 0.0,
    reward_type     TEXT,                      -- semicolon-delimited: xp;credits;item
    reward_value    TEXT,
    active          INTEGER DEFAULT 1,         -- 0 = inactive, 1 = active
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── MISSIONS ───────────────────────────────────────────────
-- Persistent authored missions (MissionDirector generates procedural ones at runtime)
CREATE TABLE IF NOT EXISTS Missions (
    id              TEXT PRIMARY KEY,          -- e.g. MIS001
    title           TEXT NOT NULL,
    type            TEXT NOT NULL,             -- Infiltration, Aether Purification, Data Retrieval, etc.
    tier            TEXT NOT NULL DEFAULT 'Task', -- Journey, Adventure, Quest, Task, Mission
    region_id       TEXT REFERENCES Regions(id),
    faction_id      TEXT REFERENCES Factions(id),
    difficulty      TEXT DEFAULT 'Novice',     -- Novice, Adept, Master, Overclocked
    description     TEXT,
    objectives      TEXT,                      -- JSON array of objective strings
    reward_xp       INTEGER DEFAULT 200,
    reward_credits  INTEGER DEFAULT 350,
    reward_item     TEXT,
    min_level       INTEGER DEFAULT 1,
    status          TEXT DEFAULT 'Available',  -- Available, Active, Completed, Locked
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── EMAILS ─────────────────────────────────────────────────
-- Inbox messages for AureMail / CommsApp
CREATE TABLE IF NOT EXISTS Emails (
    id              TEXT PRIMARY KEY,          -- e.g. MAIL001
    subject         TEXT NOT NULL,
    sender_name     TEXT NOT NULL,
    sender_address  TEXT,
    recipient       TEXT DEFAULT 'player',
    body            TEXT NOT NULL,
    timestamp       TEXT DEFAULT (datetime('now')),
    is_read         INTEGER DEFAULT 0,
    is_flagged      INTEGER DEFAULT 0,
    category        TEXT DEFAULT 'Inbox',      -- Inbox, Dispatch, Alert, Personal, System
    attachment_type TEXT,                      -- credits, document, key, item
    attachment_value TEXT,
    faction_origin  TEXT REFERENCES Factions(id),
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── DOCUMENTS ──────────────────────────────────────────────
-- Files visible in the File Explorer
CREATE TABLE IF NOT EXISTS Documents (
    id              TEXT PRIMARY KEY,          -- e.g. DOC001
    name            TEXT NOT NULL,             -- filename shown in explorer
    extension       TEXT NOT NULL,             -- .osform, .arch, .map, .mod, .pdf
    folder          TEXT NOT NULL,             -- folder path in virtual filesystem
    title           TEXT,
    content         TEXT,
    author          TEXT,
    is_encrypted    INTEGER DEFAULT 0,
    is_prism_flagged INTEGER DEFAULT 0,
    faction_origin  TEXT REFERENCES Factions(id),
    region_origin   TEXT REFERENCES Regions(id),
    created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── Indexes for fast lookups ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_npcs_faction   ON NPCs(faction_id);
CREATE INDEX IF NOT EXISTS idx_npcs_region    ON NPCs(home_region);
CREATE INDEX IF NOT EXISTS idx_events_region  ON Events(region_id);
CREATE INDEX IF NOT EXISTS idx_missions_region ON Missions(region_id);
CREATE INDEX IF NOT EXISTS idx_missions_tier  ON Missions(tier);
CREATE INDEX IF NOT EXISTS idx_emails_category ON Emails(category);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON Documents(folder);
CREATE INDEX IF NOT EXISTS idx_lore_category  ON Lore_Entries(category);
