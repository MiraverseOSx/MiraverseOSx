/**
 * MERIDION WORLD SYSTEM
 * Canonical geography, Seven Realms, historical chronology, celestial calendar & moons.
 * Approved in Consolidated Worldbuilding Decision Register.
 */

export interface RealmDefinition {
  id: string;
  name: string;
  element: string;
  season: string;
  capital: string;
  capitalIsStarred: boolean;
  secondaryAnchor?: string;
  rulingLineage: string;
  role: string;
  dangerLevel: number;
  regionCode: string;
  color: string;
  climate: string;
  subregions?: string[];
  landmarks: string[];
}

export const SEVEN_REALMS: RealmDefinition[] = [
  {
    id: 'REG_ORYNVELL',
    name: 'Orynvell',
    element: 'Aether / Celestial',
    season: 'Perennial Equinox',
    capital: 'Aureline',
    capitalIsStarred: true,
    rulingLineage: 'House Seraphima',
    role: 'Sacred imperial seat, center of royal legitimacy, succession law, and AETHERCORE-adjacent authority.',
    dangerLevel: 1,
    regionCode: 'OR',
    color: '#D97706',
    climate: 'Temperate celestial seasons with shimmering auroral night skies and high-frequency harmonic atmospheric clarity.',
    landmarks: ['Angel Bay', 'Crown Sanctum', 'Mirrored Cathedral', 'Sub-Conduit Node 04']
  },
  {
    id: 'REG_FROSS',
    name: 'Fross',
    element: 'Winter / Ice',
    season: 'Deep Winter & Seasonal Thaw',
    capital: 'Southwake',
    capitalIsStarred: true,
    secondaryAnchor: 'Northwake (Winter Fortress & Northern Citadel)',
    rulingLineage: 'House Holly',
    role: 'Sovereign border realm of endurance, survival, cold-weather discipline, and ancient winter rites. Southwake acts as the civil administrative capital, while Northwake anchors the northern winter fortress.',
    dangerLevel: 4,
    regionCode: 'FR',
    color: '#0284C7',
    climate: 'Sub-zero glacial plains, heavy blizzards, permafrost tundra with brief seasonal summer thaws.',
    subregions: ['Fross Fields', 'Fross Glaciers', 'Northwake Citadel Sector'],
    landmarks: ['Northold Ocean', 'Fross Glaciers', 'The Silent Threshold']
  },
  {
    id: 'REG_LUMIA',
    name: 'Lumia',
    element: 'Summer / Light',
    season: 'High Summer',
    capital: 'Rhyna',
    capitalIsStarred: true,
    rulingLineage: 'House Lucia',
    role: 'Realm of illumination, civic ceremony, solar law, expansive academies, and radiant public legitimacy.',
    dangerLevel: 2,
    regionCode: 'LU',
    color: '#F59E0B',
    climate: 'Sun-drenched Mediterranean climate with long daylight hours, solar winds, and dry golden summers.',
    landmarks: ['Solar Spire of Rhyna', 'Glowing Gulf of Meri', 'Lucian Forum']
  },
  {
    id: 'REG_MARLOWE',
    name: 'Marlowe',
    element: 'Spring / Water',
    season: 'Vernal Rebirth',
    capital: 'Island City',
    capitalIsStarred: true,
    rulingLineage: 'House Neryx',
    role: 'Lower-left island realm of seasonal renewal, river conduits, deep estuaries, healing currents, and diplomatic sanctuaries.',
    dangerLevel: 2,
    regionCode: 'MA',
    color: '#10B981',
    climate: 'Temperate oceanic rainfall, coastal mists, lush vernal riverbanks, and rhythmic seasonal tidal swells.',
    landmarks: ['Marlie Sea', 'The Sunken Arches', 'Estuary Sanctum']
  },
  {
    id: 'REG_BRISLAND',
    name: 'Brisland',
    element: 'Autumn / Air',
    season: 'Golden Autumn',
    capital: 'Elodia',
    capitalIsStarred: true,
    rulingLineage: 'House Yoko',
    role: 'Realm of sweeping trade winds, cultural preservation, global dispatches, migration crossings, and autumnal judgment.',
    dangerLevel: 3,
    regionCode: 'BR',
    color: '#EA580C',
    climate: 'Vibrant autumnal foliage, brisk coastal gales, shifting cloud shelves, and periodic squall systems.',
    landmarks: ['Trade Wind Docks', 'Elodia Bell Tower', 'The High Flutes']
  },
  {
    id: 'REG_KAJI',
    name: 'Kaji',
    element: 'Volcanic / Fire',
    season: 'Thermal Cycle',
    capital: 'Balisya',
    capitalIsStarred: true,
    rulingLineage: 'House Ember',
    role: 'Volcanic power, military industry, passionate artisans, technological forge craft, and sacred flame. Kailo Islands, Kanifan Deserts, and Volcanic Fields of Pyre belong to Kaji under unified jurisdiction.',
    dangerLevel: 5,
    regionCode: 'KA',
    color: '#DC2626',
    climate: 'Thermal volcanic plumes, arid desert winds, geothermal hot springs, and mineral-rich volcanic ash plains.',
    subregions: ['Kailo Islands', 'Kanifan Deserts', 'Volcanic Fields of Pyre'],
    landmarks: ['Volcanic Fields of Pyre', 'Kailo Basalt Arches', 'Kanifan Red Canyons']
  },
  {
    id: 'REG_NEPHELE',
    name: 'Nephele',
    element: 'Darkness / Nether',
    season: 'Twilight Cycle',
    capital: 'Serafin',
    capitalIsStarred: true,
    rulingLineage: 'House Keket',
    role: 'Nether realm of ancestral depths, hidden law, obsidian architecture, grief work, and taboo metaphysical knowledge.',
    dangerLevel: 6,
    regionCode: 'NE',
    color: '#7C3AED',
    climate: 'Low-light ambient violet glow, persistent obsidian mist, subterranean geysers, and serene atmospheric twilight.',
    landmarks: ['The Obsidian Well', 'Ancestral Cloisters', 'Nether Gate']
  }
];

export interface GeographicLandmark {
  id: string;
  name: string;
  designation: 'Ocean' | 'Sea' | 'Bay' | 'Gulf' | 'Subregion' | 'Archipelago' | 'Desert' | 'Volcanic Rift';
  parentRealm?: string;
  description: string;
}

export const GEOGRAPHIC_LANDMARKS: GeographicLandmark[] = [
  { id: 'geo-marlie', name: 'Marlie Sea', designation: 'Sea', description: 'Central maritime expanse connecting Orynvell, Marlowe, and Brisland.' },
  { id: 'geo-northold', name: 'Northold Ocean', designation: 'Ocean', description: 'Vast, deep northern ocean flanking the frozen coastlines of Fross.' },
  { id: 'geo-angel-bay', name: 'Angel Bay', designation: 'Bay', parentRealm: 'Orynvell', description: 'Ceremonial harbor and sacred coast adjoining Aureline Crown District.' },
  { id: 'geo-meri-gulf', name: 'Glowing Gulf of Meri', designation: 'Gulf', description: 'Luminescent coastal gulf reflecting bioluminescent reefs between Lumia and Marlowe.' },
  { id: 'geo-kailo', name: 'Kailo Islands', designation: 'Archipelago', parentRealm: 'Kaji', description: 'Island chain of basalt sea stacks and maritime artisan outposts. Integral part of Kaji jurisdiction.' },
  { id: 'geo-kanifan', name: 'Kanifan Deserts', designation: 'Desert', parentRealm: 'Kaji', description: 'Vast sandstone expanse and wind-swept dunes of western Kaji.' },
  { id: 'geo-pyre', name: 'Volcanic Fields of Pyre', designation: 'Volcanic Rift', parentRealm: 'Kaji', description: 'Active geothermal fissure network and primary foundry basin of Kaji.' },
  { id: 'geo-fross-fields', name: 'Fross Fields & Glaciers', designation: 'Subregion', parentRealm: 'Fross', description: 'Expansive glacial shelves and tundra stretching between Northwake and Southwake.' }
];

export interface ChronologyEra {
  id: string;
  period: string;
  title: string;
  summary: string;
  isMilestone?: boolean;
}

export const HISTORICAL_CHRONOLOGY: ChronologyEra[] = [
  {
    id: 'era-nephilim',
    period: '400 BM – 300 BM',
    title: 'The Nephilim Era',
    summary: 'Century of angelic descent, hidden resonance harmonics, and the first recorded TBD 7 anomalies across the nascent world.'
  },
  {
    id: 'era-purge',
    period: '300 BM – Year 0',
    title: 'The Purge',
    summary: 'Roughly 300 years of systematic suppression, forced erasure, and violence against bloodlines tied to forbidden resonance lines.'
  },
  {
    id: 'era-exodus',
    period: 'Jan – Feb, Year 0',
    title: 'The Final Exodus & Migration',
    summary: 'The final period of The Purge and the coordinated pilgrimage to the sacred sanctuary of Orynvell; part of the founding calendar year.'
  },
  {
    id: 'era-founding',
    period: 'March 6, Year 0',
    title: 'Coronation of Queen Maeryn Seraphima & Founding of Meridion',
    summary: 'Founding Day of sovereign Meridion. Maeryn Seraphima is crowned monarch; the Seven Realms Concord is ratified. Celebrated annually each March 6.',
    isMilestone: true
  },
  {
    id: 'era-consecration',
    period: 'April – Dec, Year 0',
    title: 'Sanctuary Consecration & First Structures',
    summary: 'Construction of the first permanent crystalline structures, archive halls, and civic foundations in Aureline, Orynvell.'
  },
  {
    id: 'era-maeryn',
    period: 'Year 0 – Present',
    title: 'Era of Maeryn',
    summary: 'The ongoing reign and cultural history of the matriarchal monarchy, the peaceful maintenance of the Seven Realms, and modern civic development.'
  }
];

export interface MoonState {
  name: string;
  description: string;
  visualAspect: string;
  phaseName: string;
  phaseIcon: string;
  illuminationPercent: number;
}

export interface CelestialState {
  radiance: MoonState;
  echo: MoonState;
  alignment: string;
  isEclipsing: boolean;
  cycle: number;
  monthName: string;
  dayOfMonth: number;
  weekday: string;
  isFoundingDay: boolean;
}

const LUNAR_PHASES = [
  { name: 'New Moon', icon: '🌑', illumination: 0 },
  { name: 'Waxing Crescent', icon: '🌒', illumination: 25 },
  { name: 'First Quarter', icon: '🌓', illumination: 50 },
  { name: 'Waxing Gibbous', icon: '🌔', illumination: 75 },
  { name: 'Full Moon', icon: '🌕', illumination: 100 },
  { name: 'Waning Gibbous', icon: '🌖', illumination: 75 },
  { name: 'Last Quarter', icon: '🌗', illumination: 50 },
  { name: 'Waning Crescent', icon: '🌘', illumination: 25 },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Calculates real-time celestial and lunar states for Radiance and Echo based on game cycle count.
 */
export function getCelestialState(cycle: number = 28): CelestialState {
  // Radiance: Outer Moon (Larger, distant, 28-day orbital resonance)
  const radianceIndex = Math.floor(cycle) % 8;
  const radiancePhase = LUNAR_PHASES[radianceIndex];

  // Echo: Inner Moon (Smaller, nearer, faster 18-day orbital resonance)
  const echoIndex = Math.floor(cycle * 1.55) % 8;
  const echoPhase = LUNAR_PHASES[echoIndex];

  // In-universe calendar calculation:
  // Cycle 0 starts on Jan 1, Year 0.
  const dayOfYear = (cycle * 3) % 365;
  let runningDays = dayOfYear;
  let monthIndex = 0;
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 0; m < daysInMonths.length; m++) {
    if (runningDays < daysInMonths[m]) {
      monthIndex = m;
      break;
    }
    runningDays -= daysInMonths[m];
  }
  const dayOfMonth = Math.floor(runningDays) + 1;
  const weekday = WEEKDAYS[Math.floor(cycle) % 7];
  const isFoundingDay = monthIndex === 2 && dayOfMonth === 6; // March 6

  let alignment = 'Harmonic Divergence';
  let isEclipsing = false;
  if (radianceIndex === echoIndex) {
    alignment = radianceIndex === 4 ? 'Grand Syzygy of Light' : 'Dual Eclipse Conjunction';
    isEclipsing = true;
  } else if (Math.abs(radianceIndex - echoIndex) === 4) {
    alignment = 'Counter-Phase Opposition';
  }

  return {
    radiance: {
      name: 'Radiance',
      description: 'Outer Moon — physically larger and farther away; appears large and luminous pale white in the sky.',
      visualAspect: 'Pale luminous pearl white with silvery coronal aura',
      phaseName: radiancePhase.name,
      phaseIcon: radiancePhase.icon,
      illuminationPercent: radiancePhase.illumination
    },
    echo: {
      name: 'Echo',
      description: 'Inner Moon — physically smaller and closer; appears smaller with a dark slate obsidian sheen.',
      visualAspect: 'Dark slate obsidian with reflective glassy luster',
      phaseName: echoPhase.name,
      phaseIcon: echoPhase.icon,
      illuminationPercent: echoPhase.illumination
    },
    alignment,
    isEclipsing,
    cycle,
    monthName: MONTHS[monthIndex],
    dayOfMonth,
    weekday,
    isFoundingDay
  };
}
