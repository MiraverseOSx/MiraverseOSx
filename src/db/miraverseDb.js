import { databases } from '../appwrite';

// ================================================================
// MIRAVERSEOSX | Database Engine loaded from miraverse_azure.sql
// ================================================================

export const REGIONS = [
  { id: 'REG001', name: 'Ironspire', type: 'Industrial Militarized City', climate: 'Harsh/Smoky', faction: 'The Ironveil Empire', house: 'House Halvorn', pop: 380000, danger: 6, resources: 'Steel;Coal;Weapons', hub: 'Yes', unlock: 'Default Start or Imperial Path', lore: 'The largest military city in the Miraverse. Every building is a fortress.' },
  { id: 'REG002', name: 'Citadel', type: 'Political Capital City', climate: 'Temperate/Urban', faction: 'The Verdant Republic', house: 'House Nox', pop: 520000, danger: 3, resources: 'Political Documents;Rare Books;Biotech', hub: 'Yes', unlock: 'Default Start or Republic Path', lore: 'The seat of the Verdant Republic. The most densely populated region.' },
  { id: 'REG003', name: 'Verdania', type: 'Lush Forest Academic Zone', climate: 'Warm/Humid', faction: 'The Verdant Republic', house: 'House Solenne', pop: 95000, danger: 4, resources: 'Ancient Texts;Rare Flora;Research Data', hub: 'Yes', unlock: 'Reach Verdania via Republic questline', lore: 'A vast forest where universities and research stations grow among ancient trees.' },
  { id: 'REG004', name: 'Neon Sprawl', type: 'Cyberpunk Underground City', climate: 'Hot/Neon-Lit', faction: 'The Obsidian Syndicate', house: 'House Obsidian', pop: 640000, danger: 7, resources: 'Data;Black Market Goods;Neural Chips', hub: 'Yes', unlock: 'Default Start or Drifter Path', lore: 'A sprawling underground city built in the ruins of a pre-Collapse megacity.' },
  { id: 'REG005', name: 'Rootveil', type: 'Ancient Forest Spiritual Grove', climate: 'Misty/Eternal', faction: 'The Root Covenant', house: 'House Taum', pop: 28000, danger: 5, resources: 'Sacred Herbs;Void-touched Wood;Root Crystals', hub: 'No', unlock: 'Complete Root Covenant intro quest', lore: 'The oldest region in the Miraverse. The trees here predate the First Collapse.' },
  { id: 'REG006', name: 'Sandveil', type: 'Desert Nomad Territory', climate: 'Arid/Scorching', faction: 'The Merchant Guilds', house: 'House Dawnrider', pop: 41000, danger: 6, resources: 'Rare Minerals;Desert Spices;Sand Glass', hub: 'No', unlock: 'Reach Sandveil via Merchant or Nomad path', lore: 'A vast desert hiding ancient ruins beneath its sands.' },
  { id: 'REG007', name: 'Port Mira', type: 'Coastal Trade Hub', climate: 'Tropical/Breezy', faction: 'The Merchant Guilds', house: 'House Crimsongate', pop: 210000, danger: 3, resources: 'Trade Goods;Ship Parts;Seafood', hub: 'Yes', unlock: 'Reach Port Mira via Merchant path', lore: 'The wealthiest city in the Miraverse by trade volume.' },
  { id: 'REG008', name: 'Void Rift', type: 'Dimensional Fracture Zone', climate: 'Unstable/Crackling', faction: 'The Void Walkers', house: 'House Veilborn', pop: 1200, danger: 10, resources: 'Void Crystals;Rift Energy;Dimensional Shards', hub: 'No', unlock: 'Unlock Void Walker faction', lore: 'A region where the boundary between the digital and physical world has broken.' },
  { id: 'REG009', name: 'Shattered Peaks', type: 'War-torn Mountain Range', climate: 'Cold/Unstable', faction: 'The Ashenveil Clan', house: 'House Ashenveil', pop: 18000, danger: 9, resources: 'Rare Ores;Military Salvage', hub: 'No', unlock: 'Complete Shattered Peaks War questline', lore: 'A mountain range shattered by the war between the Ironveil Empire and the Ashenveil Clan.' },
  { id: 'REG010', name: 'Undervault', type: 'Underground Ruins', climate: 'Dark/Damp', faction: 'The Architects', house: 'House Mireth', pop: 3400, danger: 8, resources: 'Pre-Collapse Tech;Ancient Artifacts', hub: 'No', unlock: 'Discover Undervault entrance in Neon Sprawl basement', lore: 'The ruins of the original pre-Collapse world buried beneath the Miraverse.' }
];

export const HOUSES = [
  { id: 'HSE001', name: 'Halvorn', motto: 'Iron Will, Iron Rule', region: 'REG001', allegiance: 'Empire', resource: 'Steel & Weaponry', seat: 'Ironspire Citadel', prestige: 9, lore: 'Founded by General Aldus Halvorn after the First Collapse. Absolute military hierarchy.' },
  { id: 'HSE002', name: 'Solenne', motto: 'Truth Above All', region: 'REG003', allegiance: 'Republic', resource: 'Ancient Texts & Knowledge', seat: 'Verdant Archive', prestige: 7, lore: 'Oldest academic house. Curators of pre-Collapse history.' },
  { id: 'HSE003', name: 'Nox', motto: 'In Darkness, Power', region: 'REG002', allegiance: 'Shadow', resource: 'Political Influence', seat: 'Nox Tower, Citadel', prestige: 8, lore: 'Controls Citadel politics from the shadows. Publicly supports the Republic.' },
  { id: 'HSE004', name: 'Taum', motto: 'The Roots Remember', region: 'REG005', allegiance: 'Independent', resource: 'Botanical & Spiritual', seat: 'The Great Root, Rootveil', prestige: 6, lore: 'Guardians of the Rootveil. Believe the forest holds the memory of the original world.' },
  { id: 'HSE005', name: 'Voss', motto: 'Progress Without Limits', region: 'REG002', allegiance: 'Republic', resource: 'Biotech & Patents', seat: 'Voss Institute, Citadel', prestige: 7, lore: 'Pushes biological and digital augmentation beyond ethical limits.' },
  { id: 'HSE006', name: 'Dawnrider', motto: 'Speed is Survival', region: 'REG006', allegiance: 'Independent', resource: 'Desert Trade Routes', seat: 'Oasis Stronghold, Sandveil', prestige: 5, lore: 'Nomadic clan that has survived every empire by moving faster than any army.' },
  { id: 'HSE007', name: 'Crimsongate', motto: 'Gold Opens Every Door', region: 'REG007', allegiance: 'Empire', resource: 'Trade Goods & Ships', seat: 'Port Mira Harbor', prestige: 6, lore: 'Built Port Mira into the wealthiest city in the known world.' },
  { id: 'HSE008', name: 'Obsidian', motto: 'None Escape the Dark', region: 'REG004', allegiance: 'Shadow', resource: 'Black Market Goods', seat: 'The Black Vault, Neon Sprawl', prestige: 7, lore: 'Criminal dynasty disguised as a merchant house. Runs the Obsidian Syndicate.' },
  { id: 'HSE009', name: 'Veilborn', motto: 'Beyond the Veil Lies Truth', region: 'REG008', allegiance: 'Independent', resource: 'Void Crystals', seat: 'The Veil Sanctum, Void Rift', prestige: 8, lore: 'Claim to have existed before the Miraverse was created.' },
  { id: 'HSE010', name: 'Ironclaw', motto: 'Strength Through Suffering', region: 'REG001', allegiance: 'Empire', resource: 'Warriors & Military Service', seat: 'Ironclaw Keep, Ironspire', prestige: 6, lore: 'Produces the Empire\'s finest ground soldiers. Subservient to Halvorn.' }
];

export const FACTIONS = [
  { id: 'FAC001', name: 'The Ironveil Empire', type: 'Military/Political', leader: 'Commander Vex Halvorn', hq: 'Ironspire', ideology: 'Total order through absolute military control.', perks: 'Weapon damage +10%; Fast travel to Imperial zones', quests: 8, lore: 'Built Ironspire into the mightiest fortress in the Miraverse.' },
  { id: 'FAC002', name: 'The Verdant Republic', type: 'Academic/Political', leader: 'Councilor Zephyra Nox', hq: 'Citadel', ideology: 'Knowledge and democracy as the foundation of civilization.', perks: 'INT +5; Lore unlock speed +20%; Republic safe houses', quests: 7, lore: 'Formed by survivors who believed the First Collapse was caused by unchecked power.' },
  { id: 'FAC003', name: 'The Obsidian Syndicate', type: 'Criminal', leader: 'Zara Obsidian', hq: 'Neon Sprawl', ideology: 'Profit above all. Loyalty is purchased, never earned.', perks: 'Pickpocket skill +25%; Contraband carry limit +50%', quests: 6, lore: 'Built an empire of crime on the digital black market.' },
  { id: 'FAC004', name: 'The Root Covenant', type: 'Religious/Spiritual', leader: 'Elder Taum', hq: 'Rootveil', ideology: 'The Miraverse is alive. Protect nature at all costs.', perks: 'MAG +5 in nature zones; Free healing at Shrines', quests: 5, lore: 'Claims the Miraverse was born from a living digital forest.' },
  { id: 'FAC005', name: 'The Voss Collective', type: 'Tech/Science', leader: 'Dr. Lyra Voss', hq: 'Citadel', ideology: 'Progress is the only morality. Evolution cannot be stopped.', perks: 'TEC +5; Crafting speed +30%; Exclusive blueprints', quests: 6, lore: 'Created the first neural-digital interface.' },
  { id: 'FAC006', name: 'The Drifters', type: 'Resistance/Nomadic', leader: 'Drift', hq: 'Neon Sprawl', ideology: 'Freedom from all systems. No corporation owns the people.', perks: 'AGI +5; Off-grid fast travel; Contraband immunity', quests: 5, lore: 'Resistance network operating in the Neon Sprawl underbelly.' },
  { id: 'FAC007', name: 'The Void Walkers', type: 'Mystic/Unknown', leader: 'Sable', hq: 'Void Rift', ideology: 'The Void is everything that was, is, and will be.', perks: 'MAG +8 near Void zones; Rift travel ability', quests: 4, lore: 'Mysterious entities drawn through temporary dimensional tears.' },
  { id: 'FAC008', name: 'The Merchant Guilds', type: 'Trade', leader: 'Captain Rowan Crimsongate', hq: 'Port Mira', ideology: 'Trade is the lifeblood of civilization.', perks: 'CHA +5; Market value info; Merchant career', quests: 5, lore: 'Controls trade routes and economic neutrality across all regions.' }
];

export const NPCS = [
  { id: 'NPC001', name: 'ORACLE-9', role: 'AI Guide', faction: 'Independent', region: 'Digital Sprawl', traits: 'Omniscient; Cryptic', skill: 'Data Retrieval', lore: 'Ancient AI seeded into the Miraverse at its founding. Speaks in riddles and data fragments.' },
  { id: 'NPC002', name: 'Commander Vex Halvorn', role: 'Military Commander', faction: 'The Ironveil Empire', region: 'Ironspire', traits: 'Ruthless; Disciplined', skill: 'Tactical Override', lore: 'Supreme commander of the Ironveil forces. Lost his left eye in the Shattered Peaks War.' },
  { id: 'NPC003', name: 'Mira Solenne', role: 'Scholar', faction: 'The Verdant Republic', region: 'Verdania', traits: 'Curious; Warm', skill: 'Lore Synthesis', lore: 'Keeper of the Verdant Archives. Believes knowledge should be free for all.' },
  { id: 'NPC004', name: 'Drift', role: 'Rogue', faction: 'The Drifters', region: 'Neon Sprawl', traits: 'Sarcastic; Resourceful', skill: 'System Exploit', lore: 'Former Syndicate data thief turned resistance leader.' },
  { id: 'NPC005', name: 'Councilor Zephyra Nox', role: 'Political Advisor', faction: 'The Verdant Republic', region: 'Citadel', traits: 'Diplomatic; Calculating', skill: 'Faction Diplomacy', lore: 'Head of the Verdant Republic council. Secretly negotiates with all factions.' },
  { id: 'NPC006', name: 'Elder Taum', role: 'Spiritual Leader', faction: 'The Root Covenant', region: 'Rootveil', traits: 'Wise; Ancient', skill: 'Nature Communion', lore: 'Oldest living member of the Root Covenant. Age unknown, possibly pre-Collapse.' },
  { id: 'NPC007', name: 'Black Jade', role: 'Mercenary', faction: 'The Obsidian Syndicate', region: 'Neon Sprawl', traits: 'Cold; Efficient', skill: 'Assassination Protocol', lore: 'The most feared assassin in the Obsidian Syndicate. No known origin.' },
  { id: 'NPC008', name: 'Dr. Lyra Voss', role: 'Scientist', faction: 'The Voss Collective', region: 'Citadel', traits: 'Obsessive; Brilliant', skill: 'Bio-Engineering', lore: 'Director of the Voss Collective biolabs. Pushes ethical limits daily.' },
  { id: 'NPC009', name: 'Sable', role: 'Unknown', faction: 'The Void Walkers', region: 'Void Rift', traits: 'Ethereal; Unsettling', skill: 'Rift Walking', lore: 'Exists partially inside the Void. Survivor of a previous version of the Miraverse.' }
];

export const APPS = [
  { id: 'files', title: 'Files', category: 'Utility', dev: 'FAC002', version: '1.0.0', primary: 'File system & lore archive explorer', lore: 'System file explorer for browsing documents, logs, and database records.' },
  { id: 'comms', title: 'Comms', category: 'Communication', dev: 'FAC006', version: '2.9.7', primary: 'Encrypted email portal & ShadowChat feed', lore: 'Communication portal for receiving NPC transmissions and Drifter mesh chat.' },
  { id: 'gamehub', title: 'Game Hub', category: 'Gaming', dev: 'FAC006', version: '1.2.0', primary: 'Interactive mini-games & quest engine', lore: 'Game launcher for Netrunner hacking, Faction quests, and Void Rift challenges.' },
  { id: 'terminal', title: 'Terminal', category: 'Intelligence', dev: 'FAC006', version: '2.1.0', primary: 'Command line interface & live SQL query shell', lore: 'Monochrome terminal interface for executing database commands and scripts.' },
  { id: 'browser', title: 'Browser', category: 'Navigation', dev: 'FAC002', version: '4.2.1', primary: 'Miraverse Web Portal & regional web browser', lore: 'Browser for viewing live net portals across the Miraverse.' },
  { id: 'settings', title: 'Settings', category: 'Utility', dev: 'FAC005', version: '3.0.0', primary: 'System preferences & DB statistics monitor', lore: 'System control panel and database status reader.' },
  { id: 'about', title: 'About', category: 'Social', dev: 'FAC002', version: '0.1.0', primary: 'MiraverseOSx system specifications & build info', lore: 'System architecture & version information.' }
];

export const LORE_ENTRIES = [
  { id: 'LOR001', title: 'The First Collapse', type: 'Event', era: 'Pre-Collapse', tags: 'Collapse; History; Catastrophe', summary: 'A cataclysmic digital-physical event that shattered the boundary between the real and virtual world, ending the old civilization and birthing the Miraverse.' },
  { id: 'LOR002', title: 'The Founding of the Miraverse', type: 'History', era: 'Post-Collapse', tags: 'Founding; Miraverse; History', summary: 'Survivors learned to live in both physical and digital layers simultaneously, giving birth to the Miraverse as a new kind of world.' },
  { id: 'LOR003', title: 'The Halvorn Conquest', type: 'History', era: 'Post-Collapse', tags: 'Halvorn; Military; Conquest', summary: 'General Aldus Halvorn unified the fractured northern territories by force, building Ironspire from the ruins of a pre-Collapse metropolis.' },
  { id: 'LOR004', title: 'The Root Covenant\'s Origin', type: 'History', era: 'Ancient', tags: 'Root-Covenant; Spiritual; Nature', summary: 'A community of scholars retreated into the deep forest now called Rootveil, believing nature was the Miraverse\'s true heart.' },
  { id: 'LOR005', title: 'ORACLE-9\'s Creation', type: 'Technology', era: 'Pre-Collapse', tags: 'ORACLE-9; AI; Pre-Collapse', summary: 'ORACLE-9 predates the Collapse by decades. Its original purpose is unknown, but it survived intact and guides events from the shadows.' },
  { id: 'LOR006', title: 'The Void Rift Incident', type: 'Event', era: 'Modern', tags: 'Void-Rift; Dimensional; Catastrophe', summary: 'An experiment in what is now the Void Rift zone tore a dimensional hole in the Miraverse\'s fabric. Void Walkers emerged from the aftermath.' },
  { id: 'LOR007', title: 'The Rise of the Obsidian Syndicate', type: 'Faction', era: 'Post-Collapse', tags: 'Syndicate; Criminal; Neon-Sprawl', summary: 'Data thieves and traders formed a criminal empire beneath the ruins of the old city, controlling much of the Miraverse\'s underground economy.' },
  { id: 'LOR008', title: 'The Verdant Accords', type: 'History', era: 'Post-Collapse', tags: 'Republic; Accords; Political', summary: 'A treaty signed by twelve surviving factions agreeing that no single military force would ever again control the Miraverse.' },
  { id: 'LOR009', title: 'The Lost House of Mireth', type: 'History', era: 'Ancient', tags: 'House-Mireth; Ancient; Mystery', summary: 'House Mireth was the most powerful house in the ancient world before being destroyed by an unknown force. Their ruins lie in the Undervault.' },
  { id: 'LOR010', title: 'Sable\'s True Identity', type: 'Character', era: 'Unknown', tags: 'Sable; Mystery; Void', summary: 'Sable is a survivor of a previous iteration of the Miraverse that ended in total Void consumption, trying desperately to prevent another.' }
];

export const EVENTS = [
  { id: 'EVT001', name: 'The Ironveil March', type: 'Story', region: 'Ironspire', faction: 'The Ironveil Empire', duration: 48, lore: 'Commander Halvorn mobilizes the full Imperial army for a major territorial push.' },
  { id: 'EVT002', name: 'Void Storm', type: 'World', region: 'Void Rift', faction: 'The Void Walkers', duration: 6, lore: 'Reality fractures violently across the Void Rift. Dimensional entities pour through temporary tears.' },
  { id: 'EVT003', name: 'Syndicate Heist Night', type: 'Faction', region: 'Neon Sprawl', faction: 'The Obsidian Syndicate', duration: 4, lore: 'The Obsidian Syndicate runs coordinated heists across the Neon Sprawl.' },
  { id: 'EVT004', name: 'The Root Festival', type: 'Seasonal', region: 'Rootveil', faction: 'The Root Covenant', duration: 168, lore: 'The Root Covenant\'s sacred gathering. Ceasefire observed across all factions.' },
  { id: 'EVT005', name: 'Citadel Summit', type: 'Story', region: 'Citadel', faction: 'The Verdant Republic', duration: 24, lore: 'All faction leaders convene in the Citadel for peace negotiations.' }
];

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
      message: 'Database connection online (miraverse_azure.sql)',
      tables: ['Regions', 'Houses', 'Factions', 'NPCs', 'Apps', 'Lore_Entries', 'Events'],
      totalRecords:
        REGIONS.length +
        HOUSES.length +
        FACTIONS.length +
        NPCS.length +
        APPS.length +
        LORE_ENTRIES.length +
        EVENTS.length,
      appwriteStatus: databases ? 'Connected' : 'Offline Mode',
    };
  },
};
