// Minimal in-memory DB for the OS apps. World data has been removed from the bundle.
// If needed later, we can lazy-load an external data pack.

// ================================================================
// MIRAVERSEOSX | Database Engine rewired from SQLite data exports
// ================================================================

export const APPS = [
  { id: 'files', title: 'Files', category: 'Utility', dev: 'FAC002', version: '1.0.0', primary: 'File system & lore archive explorer', lore: 'System file explorer for browsing documents, logs, and database records.' },
  { id: 'comms', title: 'Comms', category: 'Communication', dev: 'FAC006', version: '2.9.7', primary: 'Encrypted email portal & ShadowChat feed', lore: 'Communication portal for receiving NPC transmissions and Drifter mesh chat.' },
  { id: 'gamehub', title: 'Game Hub', category: 'Gaming', dev: 'FAC006', version: '1.2.0', primary: 'Interactive mini-games & quest engine', lore: 'Game launcher for Netrunner hacking, Faction quests, and Void Rift challenges.' },
  { id: 'spellforge', title: 'SpellForge', category: 'Hacking/Magic', dev: 'FAC005', version: '1.0.0', primary: 'Combine code modules to stabilize reality', lore: 'Interface for combining element and utility modules into cyber spells to purge threats.' },
  { id: 'passport', title: 'Aura Passport', category: 'Utility/Identity', dev: 'FAC002', version: '1.1.0', primary: 'Student profile, aura status, and medical registry', lore: 'Displays student clearance, active aura networks, Faith Medical records, and lineage clearance.' },
  { id: 'terminal', title: 'Terminal', category: 'Intelligence', dev: 'FAC006', version: '2.1.0', primary: 'Command line interface & live SQL query shell', lore: 'Monochrome terminal interface for executing database commands and scripts.' },
  { id: 'browser', title: 'Browser', category: 'Navigation', dev: 'FAC002', version: '4.2.1', primary: 'Miraverse Web Portal & regional web browser', lore: 'Browser for viewing live net portals across the Miraverse.' },
  { id: 'settings', title: 'Settings', category: 'Utility', dev: 'FAC005', version: '3.0.0', primary: 'System preferences & DB statistics monitor', lore: 'System control panel and database status reader.' },
  { id: 'gamedoc', title: 'Game Doc', category: 'Docs', dev: 'FAC002', version: '1.0.0', primary: 'Read the Game Design Document sections', lore: 'Browse extracted sections from the design doc with search.' },
  { id: 'mail', title: 'Mail', category: 'Communication', dev: 'FAC002', version: '5.2.0', primary: 'Formal email system with interactive form attachments', lore: 'APP 5B — Official mail client for school notices, onboarding forms, and job offers.' },
  { id: 'chatmeet', title: 'ChatMeet', category: 'Communication', dev: 'FAC006', version: '5.3.0', primary: 'Scheduled video calls and class meetings suite', lore: 'APP 5C — Event-driven meeting room for orientation calls, lectures, and DGA briefings.' }
];

export const REGIONS = [];

export const HOUSES = [];

export const FACTIONS = [];

export const BASE_NPCS = [];

const SECTION_5C_NPCS = [
  { id: 'NPC_AELITA', name: 'Aelita', role: 'Digital-Born Student', faction: 'Cyacademy Core', region: 'Aethercore', traits: 'Gentle; Intelligent; Artistic', skill: 'Veil Sense', lore: 'Digital-born student and Veil-sensitive mystery lead. Senses Veil distortions before anyone else. Trust unlocks memory fragments, AETHERCORE clues, and PRISM warnings.' },
  { id: 'NPC_ODD', name: 'Odd', role: 'Scout / Morale Engine', faction: 'Cyacademy Core', region: 'Robotics Workshop', traits: 'Fast-talking; Funny; Impulsive', skill: 'Pattern Recognition', lore: 'Notices patterns in people before systems do. Friendship unlocks hangouts, rumor leads, and shortcut quests.' },
  { id: 'NPC_YUMI', name: 'Yumi', role: 'Stealth Operative', faction: 'Cyacademy Core', region: 'Dorm Block B', traits: 'Calm; Disciplined; Protective', skill: 'Infiltration Protocol', lore: 'Emotional anchor and stealth operative. Excellent at reading danger and keeping secrets. Trust and Sync unlock high-risk infiltration missions.' },
  { id: 'NPC_JEREMIE', name: 'Jeremie', role: 'Tech Strategist', faction: 'Cyacademy Core', region: 'Terminal Lab', traits: 'Brilliant; Anxious; Obsessive', skill: 'System Analysis', lore: 'Understands the OS better than most faculty. Trust unlocks advanced Process Monitor tools, terminal commands, and Supercomputer research.' },
  { id: 'NPC_ULRICH', name: 'Ulrich', role: 'Knight / Frontline Defender', faction: 'Cyacademy Core', region: 'Training Grounds', traits: 'Reserved; Intense; Loyal', skill: 'Frontline Sparring', lore: 'Avoids emotional honesty but acts when others hesitate. Rivalry or Friendship unlocks combat training and squad defense bonuses.' },
  { id: 'NPC_SISSI', name: 'Sissi', role: 'Social Rival', faction: 'Cyacademy Core', region: 'Dorm Block B', traits: 'Dramatic; Ambitious; Image-conscious', skill: 'Rumor Gatekeeping', lore: 'Controls much of the campus rumor economy. High Trust reveals school scandals, hidden alliances, and faction gossip.' },
  { id: 'NPC_HOPPER', name: 'Franz Hopper', role: 'Founder-Scientist', faction: 'Faculty / Legacy', region: 'Supercomputer Vault', traits: 'Legendary; Cryptic; Visionary', skill: 'Architect Protocol', lore: 'Missing architect tied to the Supercomputer and early Veil mapping. Encrypted logs suggest AETHERCORE is buried under MIRAVERSEOSX.' },
  { id: 'NPC_VOSS', name: 'Dr. Maelis Voss', role: 'Head of Veil Studies', faction: 'Cyacademy Faculty', region: 'Lab 4', traits: 'Calm; Elegant; Precise', skill: 'Reality Physics', lore: 'Teaches Reality Physics and advanced Veil theory. Worked on restricted DGA experiments involving Lightborn aura logic.' },
  { id: 'NPC_VALE', name: 'Professor Corvin Vale', role: 'Cyber Defense Instructor', faction: 'Cyacademy Faculty', region: 'DGA Tactical Range', traits: 'Strict; Tactical; Vigilant', skill: 'Field Drill Command', lore: 'Treats every class like a future emergency deployment. Knows more about the Old Factory Ward than he admits.' },
  { id: 'NPC_SELENE', name: 'Archivist Selene Arclight', role: 'Library Keeper', faction: 'Archive Keepers', region: 'Cyacademy Library', traits: 'Meticulous; Ancient; Protective', skill: 'Genealogy Tracking', lore: 'Maintains restricted archives and ancient files. Secretly tracks Purge-era genealogy files and Lineage Keys.' },
  { id: 'NPC_ROOK', name: 'Dean Cassian Rook', role: 'Cyacademy Administrator', faction: 'Cyacademy Admin', region: 'Dean Office', traits: 'Authoritative; Protective; Pragmatic', skill: 'School Governance', lore: 'Responsible for student safety and school reputation. Balances student protection against DGA pressure.' },
  { id: 'NPC_MARA', name: 'Agent Mara Quell', role: 'DGA Mission Handler', faction: 'DGA Agency', region: 'DGA HQ', traits: 'Secretive; Tactical; Decisive', skill: 'Classified Operations', lore: 'Assigns classified operations and evaluates student threat-readiness. Focuses on order, secrecy, containment, and hard choices.' },
  { id: 'NPC_NIKO', name: 'Niko Byte', role: 'Vector Collective Leader', faction: 'Vector Collective', region: 'Neon Sprawl Underbelly', traits: 'Rebellious; Brilliant; Unconventional', skill: 'Exploit Weaving', lore: 'Student hacker-leader who teaches exploits, backdoors, and underground OS traversal.' },
  { id: 'NPC_ROWAN', name: 'Archivist Rowan Lark', role: 'Archive Representative', faction: 'Archive Keepers', region: 'Purge Archive', traits: 'Scholarly; Independent; Inquisitive', skill: 'Historical Reconstruction', lore: 'Rewards research, cryptography, and historical reconstruction without institutional bias.' },
  { id: 'NPC_ILYRA', name: 'Dr. Ilyra Saint', role: 'Aura Physician', faction: 'Faith Medical Group', region: 'Faith Medical Portal', traits: 'Compassionate; Ethical; Perceptive', skill: 'Aura Diagnosis', lore: 'Treats Veil damage and introduces medical mystery questlines.' },
  { id: 'NPC_CANTOR', name: 'Null Cantor', role: 'Prism Cult Masked Persona', faction: 'Prism Cult', region: 'Corrupted Mesh', traits: 'Masked; Cryptic; Tempting', skill: 'Corruption Transmission', lore: 'Contacts the player through corrupted messages, offering forbidden power and identity doubt.' },
  { id: 'NPC_NERYA', name: 'Nerya Solenne', role: 'Orynvell Court Ward', faction: 'Orynvell Delegation', region: 'Orynvell Sanctuary', traits: 'Warm; Diplomatic; Guarded', skill: 'Lightborn History', lore: 'Not the heir to Orynvell, but notices signs of the player’s hidden Lightborn inheritance. Introduces Lineage Keys and celestial modules.' },
  { id: 'NPC_KAEL_F', name: 'Kael Frostbourne', role: 'Fross Heir / Cryo Specialist', faction: 'Fross Successor', region: 'Fross Sector', traits: 'Reserved; Dry-humored; Resilient', skill: 'Cryo Protocol', lore: 'Unlocks Frostlung quests, ice modules, and winter-region lore.' },
  { id: 'NPC_LIORA', name: 'Liora Lucent', role: 'Lumia Heir / Hard-Light Artist', faction: 'Lumia Delegation', region: 'Lumia Pavilion', traits: 'Radiant; Competitive; Perfectionist', skill: 'Hard-Light Weaving', lore: 'Connects Art Club, light spells, Sunspire Burn Fever, and reputation events.' },
  { id: 'NPC_MARIS', name: 'Maris Neryn', role: 'Marlowe Healer', faction: 'Marlowe Delegation', region: 'Marlowe Springs', traits: 'Soft-spoken; Patient; Perceptive', skill: 'Spring Restoration', lore: 'Teaches recovery mechanics, aura restoration, and water/spring modules.' },
  { id: 'NPC_RIVEN', name: 'Riven Asterwind', role: 'Brisland Courier / Envoy', faction: 'Brisland Delegation', region: 'Wind Corridor', traits: 'Restless; Witty; Flirtatious', skill: 'Fast Travel Shortcut', lore: 'Unlocks fast travel shortcuts, rumor routes, and air/autumn modules.' },
  { id: 'NPC_EMBER', name: 'Ember Ashkai', role: 'Kaji Forge Successor', faction: 'Kaji Forge', region: 'Kaji Foundry', traits: 'Bold; Blunt; Passionate', skill: 'Offensive Module Forge', lore: 'Teaches fire modules, forge upgrades, and high-risk SpellForge recipes.' },
  { id: 'NPC_NYX', name: 'Nyx Noctelle', role: 'Nephele Shadow-Line Heir', faction: 'Nephele Delegation', region: 'Nephele Veil', traits: 'Quiet; Elegant; Unsettling', skill: 'Shadow Traversal', lore: 'Introduces dark modules, Prism Cult suspicion, and hidden night routes.' },
  { id: 'NPC_TALI', name: 'Tali Mercer', role: 'Journalism Investigator', faction: 'Cyacademy Press', region: 'Newsroom', traits: 'Curious; Brave; Persistent', skill: 'Rumor Investigation', lore: 'Drives campus rumor investigations, browser articles, and Purge Archive Leak quests.' },
  { id: 'NPC_DEX', name: 'Dex Orion', role: 'Robotics Engineer', faction: 'Robotics Club', region: 'Engineering Lab', traits: 'Practical; Sarcastic; Sentimental', skill: 'Hardware Upgrade', lore: 'Unlocks hardware upgrades, drone companions, and factory traversal tools.' },
];

export const NPCS = [...SECTION_5C_NPCS];

export const LORE_ENTRIES = [];

export const EVENTS = [];

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
      return { table: 'Apps', count: APPS.length, rows: APPS };
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
      totalRecords: REGIONS.length + HOUSES.length + FACTIONS.length + NPCS.length + APPS.length + LORE_ENTRIES.length + EVENTS.length,
      appwriteStatus: 'Offline Mode (Local JSON DB)',
    };
  },
};
