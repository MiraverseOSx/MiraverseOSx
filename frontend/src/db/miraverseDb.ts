/**
 * MIRAVERSE OS x — Central App Database (§5.3 & §10)
 * Interfaces, Portals, Career Systems & Missions Database
 */

import careersData from '../data/careers.json';
import missionsData from '../data/missions.json';
import caseAssignment from '../data/broad-street-assignment.json';
import { CareerTrackInfo, WorknetMission } from '../types';

export interface AppMetadata {
  id: string;
  title: string;
  name?: string;
  formName?: string; // 5.3 In-Universe Form Name
  accessType?: 'Personal App' | 'Dual-Pane App' | 'Subsystem Feed' | 'Public Browser' | 'Navigation Tool' | 'Civic Engine' | 'Labor Gateway' | 'Academic Portal' | 'Spatial Editor' | 'Inventory Matrix' | 'Telemetry App' | 'Enterprise Portal' | 'Utility' | 'Security';
  category: string;
  dev: string;
  version: string;
  primary: string;
  lore: string;
}

export const APPS: AppMetadata[] = [
  { id: 'dgaos', title: 'DGAOS // Command Center', category: 'Agency Systems', dev: 'Department of Global Affairs', version: '2.4.0', primary: 'Agency intelligence, investigations, command center, communications and assignments', lore: 'Department of Global Affairs agency operating environment.' },
  { id: 'traceForensics', title: 'TRACE // Forensics', category: 'Agency Systems', dev: 'DGAOS EYES/SHIELD', version: '2.4.0', primary: 'Tactical Records, Analysis & Criminal Examination workstation', lore: 'Specialized forensic laboratory stations and evidence examination engine.' },
  { id: 'documentStudio', title: 'STUDIO // Nine-Document Packet', category: 'Civic Records', dev: 'Aureline Civic Identity Administration', version: '2.0.0', primary: 'Nine-document official civic and forensic packet generator with integrated local portrait studio', lore: 'Official Document Studio providing nine formal printable documents, passport booklet, birth certificate, biometrics, and local portrait synthesis.' },
  { id: 'meridionRegistry', title: 'AURA // Citizen Registry', category: 'Civic Records', dev: 'Meridion Civic Identity', version: '1.0.0', primary: 'Fictional citizen identity, biometrics, and civil document studio', lore: 'Official civic registry and identity issuing authority.' },
  // 5.3 Layered Interfaces & Core Tools
  { 
    id: 'passport',   
    title: 'MIRROR // Citizen Record', 
    formName: 'Identity Initialization Matrix',
    accessType: 'Personal App',
    category: 'Identity',        
    dev: 'FAC_NEO_CITIZENS', 
    version: '2.4.0', 
    primary: 'Character customization: appearance, pronouns, style, wardrobe & biometric calibration',  
    lore: 'Personal profile tool for character customization, wardrobe management, and profile synchronization.' 
  },
  { 
    id: 'vitals',     
    title: 'VITALS // Biometric Flux', 
    formName: 'Biometric Flux Monitor',
    accessType: 'Telemetry App',
    category: 'Healthcare',      
    dev: 'FAC_FAITH_MEDICAL', 
    version: '2.1.0', 
    primary: 'Real-time telemetry tracking Energy, Mood, Focus, and Physical Health', 
    lore: 'Real-time interactive health board tracks biological metrics through color-coded diagnostic arrays.' 
  },
  { 
    id: 'vault',      
    title: 'VAULT // Crystalline Storage', 
    formName: 'Crystalline Core Storage',
    accessType: 'Inventory Matrix',
    category: 'Economy',         
    dev: 'FAC_ORYN_TREASURY', 
    version: '3.0.0', 
    primary: 'Primary CREDITS (₢), secondary rare BITS (◈), artifact storage & core crystal tracking', 
    lore: 'Complete player item and dual-currency vault tracking standard CREDITS, rare BITS, and crystalline core fragments.' 
  },
  { 
    id: 'housing',    
    title: 'HOMECRAFT // Residential Grid', 
    formName: 'Residential Space Grid Editor',
    accessType: 'Spatial Editor',
    category: 'Lifestyle',       
    dev: 'FAC_NEO_CITIZENS', 
    version: '1.2.0', 
    primary: 'Visual layout adjustments, furniture placement, room expansions & stamina rest', 
    lore: 'Housing editor interface for spatial layouts, decor placement, and residential upgrades.' 
  },
  { 
    id: 'comms',      
    title: 'COMMS // Institutional Network', 
    formName: 'Institutional Routing Network',
    accessType: 'Dual-Pane App',
    category: 'Communication',   
    dev: 'FAC_NETRUNNERS',   
    version: '2.9.7', 
    primary: 'Dual-pane instant messaging chat mesh on one side and encrypted Cyacademy/Career inbox on the other', 
    lore: 'Dual-pane communication hub featuring real-time IM alongside a formal encrypted email inbox for academic/career dispatches.' 
  },
  { 
    id: 'pulse',      
    title: 'PULSE // Faction Spectrum', 
    formName: 'Faction Spectrum Telemetry',
    accessType: 'Subsystem Feed',
    category: 'Social',          
    dev: 'FAC_NEO_CITIZENS', 
    version: '1.5.0', 
    primary: 'Social broadcast and faction matrix tracker feeding system alerts & regional announcements', 
    lore: 'Social broadcast and faction matrix tracker feeds system alerts, regional announcements, and direct territorial influence alerts.' 
  },
  { 
    id: 'browser',    
    title: 'VERSENET // Browser Terminal', 
    formName: 'Versenet Browser Terminal',
    accessType: 'Public Browser',
    category: 'Navigation',      
    dev: 'FAC_NEO_CITIZENS', 
    version: '4.5.0', 
    primary: 'Public in-world website network (CIVINET, QUESTNOTICE, Faith Med, DGA, Archives)', 
    lore: 'Public in-world website network and browser experience giving live access to world history archives, public records, unverified user forums, and news.' 
  },
  { 
    id: 'board',      
    title: 'CHRONICLE // Notice Board', 
    formName: 'Civic Notice Board & Vault Log',
    accessType: 'Civic Engine',
    category: 'Gameplay',        
    dev: 'FAC_NEO_CITIZENS', 
    version: '2.2.0', 
    primary: 'Central notice board, active mission tracker, discovered lore codex entries & case traces', 
    lore: 'The central notice board and quest engine. Displays local postings, tracks active missions, and stores discovered lore codices.' 
  },
  { 
    id: 'jobs',       
    title: 'WORKNET // Federal Work Access', 
    formName: 'Federal Global Employment Access Layer',
    accessType: 'Enterprise Portal',
    category: 'Careers',         
    dev: 'FAC_GOV_ADMIN',    
    version: '3.0.0', 
    primary: 'Centralized federal work access across DGA, Faith Medical, Finance, Archives, and Tech Labs', 
    lore: 'Secure work portal used by eligible jobs. Authenticates into a unified federal layer verifying role, clearance, station, and tools.' 
  },
  { 
    id: 'campus',     
    title: 'CAMPUS // Cyacademy Registrar', 
    formName: 'Cyacademy Registrar Node',
    accessType: 'Academic Portal',
    category: 'Scholastic',      
    dev: 'FAC_CYACADEMY',    
    version: '1.8.0', 
    primary: 'Cyacademy student portal tracking academic timelines, course modules, GPA & club rosters', 
    lore: 'Cyacademy student portal that tracks academic timelines, course modules, current GPA, active club memberships, and faculty alerts.' 
  },
  { 
    id: 'files',      
    title: 'File Explorer',        
    formName: 'Virtual Drive & Archive Explorer',
    accessType: 'Utility',
    category: 'Storage',         
    dev: 'FAC_NETRUNNERS',   
    version: '2.0.0', 
    primary: 'Local file explorer, document reader & encrypted Purge archive browser', 
    lore: 'System file explorer for browsing documents, logs, and database records.' 
  },
  { 
    id: 'spellforge', 
    title: 'SpellForge Matrix',    
    formName: 'Protocol Synthesis Engine',
    accessType: 'Utility',
    category: 'Magic/Hacking',   
    dev: 'FAC_ARCANE_GUILD', 
    version: '2.0.0', 
    primary: 'Combine 6 elemental and 8 utility modules to stabilize reality and firewall grids', 
    lore: 'Interface for combining element and utility modules into cyber spells.' 
  },
  { 
    id: 'process',    
    title: 'Process Monitor',      
    formName: 'Kernel Thread & Anomaly Inspector',
    accessType: 'Security',
    category: 'Security',        
    dev: 'FAC_NETRUNNERS',   
    version: '2.1.0', 
    primary: 'Thread inspector, trace origins & quarantine PRISM corruption threads', 
    lore: 'Process Monitor lets players inspect active system processes and isolate PRISM malware.' 
  },
  { 
    id: 'terminal',   
    title: 'System Terminal',      
    formName: 'Command Line & SQL Shell',
    accessType: 'Utility',
    category: 'Intelligence',    
    dev: 'FAC_NETRUNNERS',   
    version: '2.1.0', 
    primary: 'Command line interface & live SQL query shell for database inspection', 
    lore: 'Terminal interface for executing database commands and scripts.' 
  },
  { 
    id: 'settings',   
    title: 'System Settings',      
    formName: 'OS Configuration Hub',
    accessType: 'Utility',
    category: 'System',          
    dev: 'FAC_ARCANE_GUILD', 
    version: '3.0.0', 
    primary: 'Theme customization, audio synthesizer, and OS preferences', 
    lore: 'System control panel and database status reader.' 
  },
];

// ─── Government, Civic & Institutional Organizations (§10.1C) ────────────────
export interface OrganizationInfo {
  id: string;
  name: string;
  accessTier: string;
  gameplayFunction: string;
  domain: string;
  portalCategory: string;
}

export const ORGANIZATIONS: OrganizationInfo[] = [
  {
    id: 'royal-history',
    name: 'Royal Historic Society',
    accessTier: 'Restricted archive institution',
    gameplayFunction: 'Maintains royal records, classified dynastic archives, succession documents, sealed Council files, and sensitive historical evidence.',
    domain: 'royalhistory.mer',
    portalCategory: 'Restricted Archive'
  },
  {
    id: 'public-archives',
    name: 'Meridion Public Archives',
    accessTier: 'Public archive and citizen records website',
    gameplayFunction: 'Provides searchable public records, local history, newspapers, genealogy files, civic maps, and non-classified lore.',
    domain: 'records.orynvell.gov',
    portalCategory: 'Public Records'
  },
  {
    id: 'oryn-finance',
    name: 'Oryn Department of Finance',
    accessTier: 'Banking and treasury portal',
    gameplayFunction: 'Handles banking, CREDITS/BITS accounts, salary deposits, rent payments, taxes, scholarships, and player financial records.',
    domain: 'finance.oryn.gov',
    portalCategory: 'Treasury & Banking'
  },
  {
    id: 'faith-medical',
    name: 'Faith Medical Group',
    accessTier: 'Health provider and VITALS partner',
    gameplayFunction: 'Operates clinics, appointments, wellness checks, treatment records, injury care, Veil exposure monitoring, and health data connected to the VITALS interface.',
    domain: 'faithmed.aure',
    portalCategory: 'Medical & Telemetry'
  },
  {
    id: 'aureline-library',
    name: 'Aureline City Library',
    accessTier: 'Public workplace and research hub',
    gameplayFunction: 'Offers part-time and full career work as an archivist. Tasks include shelving, cataloging, restoring damaged records, and uncovering clues.',
    domain: 'library.aureline.mer',
    portalCategory: 'Public Research Hub'
  }
];

import { 
  SEVEN_REALMS, 
  GEOGRAPHIC_LANDMARKS, 
  HISTORICAL_CHRONOLOGY, 
  getCelestialState,
  RealmDefinition,
  GeographicLandmark,
  ChronologyEra,
  CelestialState
} from '../data/meridionWorld';

// ─── Department of Global Affairs Divisions (§10.1B) ────────────────────────
export interface DgaDivision {
  division: 'Shield' | 'Eyes' | 'Blackout Team';
  branch: string;
  focus: string;
}

export const DGA_DIVISIONS: DgaDivision[] = [
  { division: 'Shield', branch: 'Strategic Operations Command (SOC)', focus: 'Mission planning and cross-realm defense coordination.' },
  { division: 'Shield', branch: 'Rapid Response Bureau (RRB)', focus: 'Mobile strike units for containment breaches and active hazards.' },
  { division: 'Shield', branch: 'Protective Security Detail (PSD)', focus: 'VIP escort, convoy security, and institutional asset defense.' },
  { division: 'Shield', branch: 'Experimental Tactics Group (ETG)', focus: 'Prototype tech integration and non-standard combat protocols.' },
  { division: 'Eyes', branch: 'Signals Intelligence (SIGINT)', focus: 'Terminal traffic decryption and anomaly monitoring.' },
  { division: 'Eyes', branch: 'Human Intel (HUMINT/CIVINT)', focus: 'Deep-cover operatives and cultural sentiment surveillance.' },
  { division: 'Eyes', branch: 'Research & Analysis (RGA)', focus: 'Strategic threat modeling and cross-realm predictive analysis.' },
  { division: 'Eyes', branch: 'Counter Intelligence & Internal Security (CIIS)', focus: 'Treason suppression and institutional integrity enforcement.' },
  { division: 'Blackout Team', branch: 'Special Operations Co-op', focus: 'Five-agent unit dedicated to deep-level glitches and system corruption.' }
];

export const REGIONS: any[] = [
  ...SEVEN_REALMS.map((r) => ({
    id: r.id,
    name: r.name,
    title: r.name,
    type: `${r.element} Realm`,
    category: 'Realm',
    description: `${r.role} Capital: ${r.capital}${r.capitalIsStarred ? ' ★' : ''}${r.secondaryAnchor ? ` | Secondary: ${r.secondaryAnchor}` : ''}. Ruling: ${r.rulingLineage}. Climate: ${r.climate}`,
    dangerLevel: r.dangerLevel,
    danger: r.dangerLevel,
    capital: r.capital,
    element: r.element,
    season: r.season,
    rulingLineage: r.rulingLineage,
    regionCode: r.regionCode,
    color: r.color,
    landmarks: r.landmarks,
    subregions: r.subregions || [],
  })),
  ...GEOGRAPHIC_LANDMARKS.map((g) => ({
    id: g.id,
    name: g.name,
    title: g.name,
    type: g.designation,
    category: 'Landmark',
    description: `${g.description}${g.parentRealm ? ` (Under jurisdiction of ${g.parentRealm})` : ''}`,
    dangerLevel: g.designation === 'Volcanic Rift' ? 5 : 2,
    danger: g.designation === 'Volcanic Rift' ? 5 : 2,
    parentRealm: g.parentRealm,
  }))
];
export const FACTIONS: any[] = [
  {
    id: 'FAC_SERAPHIMA',
    name: 'House Seraphima (Orynvell Crown)',
    title: 'House Seraphima',
    accentColor: '#D97706',
    ideology: 'Sovereign matriarchal monarchs of Meridion. Stewards of imperial succession law, AETHERCORE legitimacy, and sanctuary authority.',
    influenceLevel: 98,
    realm: 'Orynvell',
    seat: 'Aureline'
  },
  {
    id: 'FAC_HOLLY',
    name: 'House Holly (Wardens of Fross)',
    title: 'House Holly',
    accentColor: '#0284C7',
    ideology: 'Endurance, northern border vigilance, glacial discipline, and winter survival rites between Southwake and Northwake.',
    influenceLevel: 85,
    realm: 'Fross',
    seat: 'Southwake / Northwake'
  },
  {
    id: 'FAC_LUCIA',
    name: 'House Lucia (Sol-Council of Lumia)',
    title: 'House Lucia',
    accentColor: '#F59E0B',
    ideology: 'Solar philosophy, public illumination, legislative transparency, and academy administration across the sunlit realm.',
    influenceLevel: 88,
    realm: 'Lumia',
    seat: 'Rhyna'
  },
  {
    id: 'FAC_NERYX',
    name: 'House Neryx (Estuary Sovereigns of Marlowe)',
    title: 'House Neryx',
    accentColor: '#10B981',
    ideology: 'Vernal river diplomacy, maritime healing currents, renewal sanctuaries, and tidal preservation.',
    influenceLevel: 82,
    realm: 'Marlowe',
    seat: 'Island City'
  },
  {
    id: 'FAC_YOKO',
    name: 'House Yoko (Wind Consortium of Brisland)',
    title: 'House Yoko',
    accentColor: '#EA580C',
    ideology: 'Global trade winds, cultural message routing, migration logistics, and autumnal legal mediation.',
    influenceLevel: 84,
    realm: 'Brisland',
    seat: 'Elodia'
  },
  {
    id: 'FAC_EMBER',
    name: 'House Ember (High Forge Council of Kaji)',
    title: 'House Ember',
    accentColor: '#DC2626',
    ideology: 'Volcanic mastery, advanced forge engineering, military vigilance, and sacred fire rites across Kailo, Kanifan, and Pyre.',
    influenceLevel: 89,
    realm: 'Kaji',
    seat: 'Balisya'
  },
  {
    id: 'FAC_KEKET',
    name: 'House Keket (Ancestral Nether Keepers of Nephele)',
    title: 'House Keket',
    accentColor: '#7C3AED',
    ideology: 'Ancestral remembrance, deep nether law, grief counseling, obsidian masonry, and veil twilight stewardship.',
    influenceLevel: 86,
    realm: 'Nephele',
    seat: 'Serafin'
  },
  {
    id: 'FAC_ROYAL_HISTORY',
    name: 'Royal Historic Society',
    title: 'Royal Historic Society',
    accentColor: '#B45309',
    ideology: 'Preservation of dynastic genealogies, coronation treaties from Year 0, and ancient historical codices.',
    influenceLevel: 92,
    realm: 'Orynvell',
    seat: 'Aureline'
  },
  {
    id: 'FAC_FAITH_MED',
    name: 'Faith Medical Group',
    title: 'Faith Medical Group',
    accentColor: '#059669',
    ideology: 'Universal patient care, bio-aura harmonic stabilization, trauma recovery, and epidemiological monitoring.',
    influenceLevel: 94,
    realm: 'Pan-Meridion',
    seat: 'Aureline & Regional Clinics'
  },
  {
    id: 'FAC_DGA',
    name: 'Department of Global Affairs (DGAOS)',
    title: 'DGAOS & TRACE Forensics',
    accentColor: '#4F46E5',
    ideology: 'Sovereign state security, border surveillance, criminal investigation, and forensic anomaly quarantine.',
    influenceLevel: 96,
    realm: 'Pan-Meridion',
    seat: 'Command Sector, Aureline'
  }
];
export const NPCS: any[] = [
  {
    id: 'npc-maeryn',
    name: 'Queen Maeryn Seraphima',
    title: 'Sovereign Monarch of Meridion',
    role: 'Monarch',
    dialogueTone: 'Regal, measured, and harmonically resonant',
    affiliation: 'House Seraphima',
    realm: 'Orynvell'
  },
  {
    id: 'npc-holly',
    name: 'High Warden Holly',
    title: 'Warden of the Northern Ice',
    role: 'Warden',
    dialogueTone: 'Direct, stoic, and watchful',
    affiliation: 'House Holly',
    realm: 'Fross'
  },
  {
    id: 'npc-lucia',
    name: 'Chancellor Lucia',
    title: 'High Speaker of the Sol-Forum',
    role: 'Councilor',
    dialogueTone: 'Eloquent, scholarly, and radiant',
    affiliation: 'House Lucia',
    realm: 'Lumia'
  },
  {
    id: 'npc-neryx',
    name: 'Lord Neryx',
    title: 'Sovereign of the Vernal Estuaries',
    role: 'Diplomat',
    dialogueTone: 'Calm, soothing, and observant',
    affiliation: 'House Neryx',
    realm: 'Marlowe'
  },
  {
    id: 'npc-yoko',
    name: 'Grand Dispatcher Yoko',
    title: 'Overseer of the Autumn Winds',
    role: 'Consul',
    dialogueTone: 'Brisk, pragmatic, and witty',
    affiliation: 'House Yoko',
    realm: 'Brisland'
  },
  {
    id: 'npc-ember',
    name: 'High Forge-Master Ember',
    title: 'Lord of the Pyre Foundries',
    role: 'Artificer',
    dialogueTone: 'Intense, passionate, and exacting',
    affiliation: 'House Ember',
    realm: 'Kaji'
  },
  {
    id: 'npc-keket',
    name: 'Seer Keket',
    title: 'Keeper of Ancestral Twilight',
    role: 'Seer',
    dialogueTone: 'Whispering, deep, and contemplative',
    affiliation: 'House Keket',
    realm: 'Nephele'
  },
  {
    id: 'npc-vesper',
    name: 'Senior Archivist K. Vesper',
    title: 'Crown Registrar & Royal Archivist',
    role: 'Archivist',
    dialogueTone: 'Precise, encyclopedic, and courteous',
    affiliation: 'Royal Historic Society',
    realm: 'Orynvell'
  },
  {
    id: 'npc-mercer',
    name: 'Dr. Robert Mercer',
    title: 'Chief Clinical Examiner',
    role: 'Physician',
    dialogueTone: 'Clinical, empathetic, and diagnostic',
    affiliation: 'Faith Medical Group',
    realm: 'Orynvell'
  }
];
export const CAREERS: CareerTrackInfo[] = careersData as CareerTrackInfo[];
export const MISSIONS: WorknetMission[] = [...(missionsData as WorknetMission[]).filter(mission => mission.id !== caseAssignment.id), caseAssignment as WorknetMission];
export const LORE_ENTRIES: any[] = [
  ...HISTORICAL_CHRONOLOGY.map((era) => ({
    id: era.id,
    title: `${era.period}: ${era.title}`,
    category: 'Historical Chronology',
    content: era.summary
  })),
  {
    id: 'lore-moons',
    title: 'The Twin Moons of Meridion — Radiance and Echo',
    category: 'Celestial Astronomy',
    content: 'Meridion orbits beneath a single sun and two moons. Radiance, the outer moon, is physically larger and distant, appearing pale luminous white. Echo, the inner moon, is smaller, orbits closer, and appears with a dark slate obsidian reflective sheen. Their conjunctions and oppositions mark celestial festivals and alter harmonic resonance frequencies across the Seven Realms.'
  },
  {
    id: 'lore-realms',
    title: 'The Seven Realms Concord & Geography',
    category: 'World Geography',
    content: 'The world of Meridion is organized into seven sovereign realms: Orynvell (Aether, Cap. Aureline ★), Fross (Winter, Cap. Southwake ★ / Northwake), Lumia (Light, Cap. Rhyna ★), Marlowe (Water, Cap. Island City ★), Brisland (Air, Cap. Elodia ★), Kaji (Fire, Cap. Balisya ★; encompassing Kailo, Kanifan, and Pyre), and Nephele (Nether, Cap. Serafin ★). Under the Concord, star markers designate capital anchors while borders preserve ancestral lineages.'
  },
  {
    id: 'lore-housing-tiers',
    title: 'Land Registry & Residential Tiers',
    category: 'Civic Law',
    content: 'HOMECRAFT and AURA Registry classify citizen housing into three tiers: Tier A (Fully Interactive with furnished interiors and room-level upgrades), Tier B (Simplified Visitable with address presence and visitor access), and Tier C (Registered Only with stable location IDs for identity records).'
  }
];

export const miraverseDb = {
  getApps: (): AppMetadata[] => APPS,
  getApp: (id: string): AppMetadata | undefined => APPS.find((a) => a.id === id),
  getRegions: () => REGIONS,
  getFactions: () => FACTIONS,
  getNPCs: () => NPCS,
  getCareers: (): CareerTrackInfo[] => CAREERS,
  getCareer: (id: string): CareerTrackInfo | undefined => CAREERS.find((c) => c.id === id),
  getMissions: (): WorknetMission[] => MISSIONS,
  getMissionsByTrack: (track: string): WorknetMission[] => MISSIONS.filter((m) => m.track === track),
  getMissionsByType: (type: string): WorknetMission[] => MISSIONS.filter((m) => m.type === type),
  getOrganizations: (): OrganizationInfo[] => ORGANIZATIONS,
  getDgaDivisions: (): DgaDivision[] => DGA_DIVISIONS,
  getLoreEntries: () => LORE_ENTRIES,

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
    if (clean.includes('from regions') || clean === 'regions') return { table: 'Regions', count: REGIONS.length, rows: REGIONS };
    if (clean.includes('from factions') || clean === 'factions') return { table: 'Factions', count: FACTIONS.length, rows: FACTIONS };
    if (clean.includes('from npcs') || clean === 'npcs') return { table: 'NPCs', count: NPCS.length, rows: NPCS };
    if (clean.includes('from careers') || clean === 'careers') return { table: 'Careers', count: CAREERS.length, rows: CAREERS };
    if (clean.includes('from missions') || clean === 'missions') return { table: 'Missions', count: MISSIONS.length, rows: MISSIONS };
    if (clean.includes('from apps') || clean === 'apps') return { table: 'Apps', count: APPS.length, rows: APPS };
    if (clean.includes('from lore') || clean === 'lore') return { table: 'Lore_Entries', count: LORE_ENTRIES.length, rows: LORE_ENTRIES };
    return {
      message: 'MIRAVERSE DB — SQL Engine v3.0 Active.',
      tables: ['Regions', 'Factions', 'NPCs', 'Careers', 'Missions', 'Apps', 'Lore_Entries'],
      totalRecords: REGIONS.length + FACTIONS.length + NPCS.length + CAREERS.length + MISSIONS.length + APPS.length + LORE_ENTRIES.length,
      status: 'Online & Synchronized',
    };
  },
};
