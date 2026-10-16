// Intelligence, OSINT, SIGINT, Geolocation, Cryptanalysis, and Admiralty Source Reliability

export interface OsintSearchResult {
  id: string;
  queryTerm: string;
  category: 'Corporate Shell' | 'Domain & IP' | 'Banking SWIFT' | 'Biometric Watchlist' | 'Maritime Cargo';
  title: string;
  source: string;
  snippet: string;
  metadata: Record<string, string>;
  reliabilityScore: string; // e.g. "B2"
  threatLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  linkedCaseId?: string;
}

export interface SigintIntercept {
  id: string;
  sourceFrequency: string;
  protocol: 'Sat-Com Thuraya-3' | 'VHF Encrypted Marine' | 'SIP Cellular Relay' | 'Darknet Mesh';
  interceptTime: string;
  originGeo: string;
  targetGeo: string;
  encryptionStatus: 'Decrypted' | 'Partial Hash Break' | 'AES-256 Hardened';
  rawIntercept: string;
  translatedText: string;
  flaggedKeywords: string[];
  reliability: string;
  caseId: string;
}

export interface CipherChallenge {
  id: string;
  title: string;
  algorithm: 'Substitution' | 'Hex Byte Stream' | 'Base64 Obfuscated' | 'One-Time Pad';
  encodedPayload: string;
  solutionKey: string;
  plaintext: string;
  solved: boolean;
  hint: string;
  caseId: string;
}

export interface SatelliteGeoTarget {
  id: string;
  label: string;
  facility: string;
  coordinates: string; // e.g. "47°22'35.8\"N 8°32'53.1\"E"
  gridSquare: string;
  sensorType: 'SAR Radar (Synthetic Aperture)' | 'High-Res Optical 30cm' | 'Thermal IR Infrared';
  lastPassTime: string;
  analysisSummary: string;
  threatAssessment: string;
  caseId: string;
}

export interface IntelWatchlistEntry {
  id: string;
  primaryName: string;
  aliases: string[];
  citizenship: string;
  biometricCode: string;
  threatCategory: 'Weapons Proliferation' | 'State-Sponsored Clandestine' | 'Cyber Sabotage';
  knownAssociates: string[];
  lastConfirmedLocation: string;
  admiraltyRating: 'A1' | 'B2' | 'C3' | 'D4' | 'E5' | 'F6';
  notes: string;
  caseId: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Person' | 'Organization' | 'Vessel' | 'Location' | 'Account';
  category: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
  verified: boolean;
}

export const INITIAL_OSINT_DATABASE: OsintSearchResult[] = [
  {
    id: 'OSINT-01',
    queryTerm: 'Phoenix Biotech Ltd',
    category: 'Corporate Shell',
    title: 'Phoenix Biotech S.A. Commercial Registry (Canton of Zurich)',
    source: 'Swiss Commercial Register & OpenCorporates',
    snippet:
      'Incorporated 2021. Primary activities listed as "Specialty Organophosphate Chemical Synthesis & Agrochemical Formulation". Registered address at Dufourstrasse 14, Zurich. Beneficial ownership held by bearer share fiduciary.',
    metadata: {
      RegistrationNumber: 'CHE-419.882.109',
      ManagingDirector: 'Julian Paul Vance (Resigned 2024)',
      WarehouseFacility: 'Pier 42 North Marine Terminal, Bay 18',
      PrimaryBank: 'Credit Helvetia (Escrow Account #CH93-0024)',
    },
    reliabilityScore: 'A1 (Completely Reliable / Confirmed)',
    threatLevel: 'Severe',
    linkedCaseId: 'INT-2026-0941',
  },
  {
    id: 'OSINT-02',
    queryTerm: '7XYZ89',
    category: 'Maritime Cargo',
    title: 'Automated License Plate Sighting - Municipal Harbor Logistics Fleet',
    source: 'Harbor Transportation Authority / ALPR Camera Hub #14',
    snippet:
      'Vehicle: 2024 Mercedes Sprinter High-Roof Van (Deep Navy). Registered to Apex Marine Freight (subsidiary of Phoenix Biotech). Recorded entering Pier 42 at 02:40 UTC, following Embassy Row departure.',
    metadata: {
      VIN: 'WDB9066331S889102',
      RegisteredOwner: 'Apex Marine Freight Services LLC',
      DriverPermitBadge: 'Badge #1184 (Assigned to V. Krell)',
    },
    reliabilityScore: 'A2 (Completely Reliable / Probably True)',
    threatLevel: 'High',
    linkedCaseId: 'INT-2026-0941',
  },
  {
    id: 'OSINT-03',
    queryTerm: 'Viktor Krell',
    category: 'Biometric Watchlist',
    title: 'Interpol Red Notice Reference #A-8812/2025',
    source: 'Interpol General Secretariat & DGA Watchlist',
    snippet:
      'Subject: Viktor Krell, aka "The Glassmaker". Former military chemical synthesis specialist. Known broker of clandestine fluorophosphate and neurotoxic precursors. Traveled under false passport "Julian Holt".',
    metadata: {
      Aliases: 'Julian Holt, V. Korolyov, The Glassmaker',
      Height: '184 cm',
      Hair: 'Graying Dark',
      EyeColor: 'Blue',
      FingerprintAFIS: 'NCIC Class 14-U-29-W-12',
    },
    reliabilityScore: 'A1 (Official Federal Biometric)',
    threatLevel: 'Severe',
    linkedCaseId: 'INT-2026-0941',
  },
  {
    id: 'OSINT-04',
    queryTerm: 'M/V Phoenix Dawn',
    category: 'Maritime Cargo',
    title: 'Automated Identification System (AIS) Vessel Tracking - Pier 42',
    source: 'Global Maritime Satellite AIS Transponder Feed',
    snippet:
      'Container freighter M/V Phoenix Dawn (IMO 9482104, Panama Flag). Moored at Pier 42 Berth 3. Scheduled departure for international waters at 22:00 UTC tonight. Cargo manifest lists 40ft refrigerated containers.',
    metadata: {
      IMO: '9482104',
      VesselType: 'Refrigerated Cargo Carrier',
      Flag: 'Panama',
      Destination: 'Rotterdam (Declared) / Unknown Clandestine Offload',
    },
    reliabilityScore: 'B1 (Usually Reliable / Confirmed)',
    threatLevel: 'High',
    linkedCaseId: 'INT-2026-0941',
  },
];

export const INITIAL_SIGINT_INTERCEPTS: SigintIntercept[] = [
  {
    id: 'SIG-941-01',
    sourceFrequency: '448.250 MHz (Narrowband FM)',
    protocol: 'VHF Encrypted Marine',
    interceptTime: '02:44:18 UTC',
    originGeo: 'Pier 42 Marine Terminal',
    targetGeo: 'M/V Phoenix Dawn Bridge',
    encryptionStatus: 'Decrypted',
    rawIntercept: '78 30 63 61 72 67 6f 20 6c 6f 61 64 65 64 2e 20 6b 72 65 6c 6c 20 6f 6e 20 62 6f 61 72 64',
    translatedText:
      '“Glassmaker to Bridge: Package delivered to Embassy contact as scheduled. Vance reacted within minutes. Seal Container 4-Alpha immediately. Prepare lines to cast off by 22:00.”',
    flaggedKeywords: ['Glassmaker', 'Package delivered', 'Vance', 'Container 4-Alpha', 'Cast off'],
    reliability: 'A1 (Direct Live Audio Intercept)',
    caseId: 'INT-2026-0941',
  },
  {
    id: 'SIG-941-02',
    sourceFrequency: '1626.5 MHz (Inmarsat-C Channel B)',
    protocol: 'Sat-Com Thuraya-3',
    interceptTime: '03:12:05 UTC',
    originGeo: 'Zurich Offshore Server',
    targetGeo: 'Harbor Warehouse 18 Relay',
    encryptionStatus: 'Partial Hash Break',
    rawIntercept: 'SWIFT wire CH-990-21 CONFIRMED EUR 1,250,000 RELEASED UPON TOXIN ADMISSION.',
    translatedText:
      '“Payment confirmed from Zurich fiduciary. Final tranche released upon confirmation of ambassador cessation. Burn the mobile terminals.”',
    flaggedKeywords: ['SWIFT', 'Payment confirmed', 'Toxin', 'Burn mobile terminals'],
    reliability: 'B2 (Usually Reliable / Probably True)',
    caseId: 'INT-2026-0941',
  },
];

export const INITIAL_CIPHER_CHALLENGES: CipherChallenge[] = [
  {
    id: 'CIPHER-01',
    title: 'Pier 42 Encrypted Shipping Manifest Note',
    algorithm: 'Hex Byte Stream',
    encodedPayload: '50 48 4f 45 4e 49 58 2d 42 41 54 43 48 2d 4e 32 36 2d 56 45 4e 4f 4d',
    solutionKey: 'HEX_ASCII',
    plaintext: 'PHOENIX-BATCH-N26-VENOM',
    solved: false,
    hint: 'Standard two-digit hexadecimal ASCII representation.',
    caseId: 'INT-2026-0941',
  },
  {
    id: 'CIPHER-02',
    title: 'Krell Burner Phone Dead Drop Coordinates',
    algorithm: 'Substitution',
    encodedPayload: 'PBBEQVANGRF: CVRE SBREG-GJB, JNERUBHFR RVTUGGRA',
    solutionKey: 'ROT13',
    plaintext: 'COORDINATES: PIER FORTY-TWO, WAREHOUSE EIGHTEEN',
    solved: false,
    hint: 'Classic Caesar rotational cipher with 13-character shift.',
    caseId: 'INT-2026-0941',
  },
];

export const SATELLITE_GEO_TARGETS: SatelliteGeoTarget[] = [
  {
    id: 'SAT-01',
    label: 'Target Alpha: Pier 42 Chemical Warehouse 18',
    facility: 'Phoenix Biotech Coastal Storage Compound',
    coordinates: "40°42'46.2\"N 74°00'48.9\"W",
    gridSquare: 'SECTOR-NY-04-HARBOR',
    sensorType: 'High-Res Optical 30cm',
    lastPassTime: '06:15 UTC (USA-326 Reconnaissance Sat)',
    analysisSummary:
      'Optical overhead imagery confirms dark Mercedes Sprinter van (Plate 7XYZ89) parked in loading bay 3. Two individuals in high-visibility hazmat gear spotted transferring pressurized cryogenic cylinders to refrigerated marine container.',
    threatAssessment: 'Active clandestine chemical weapons staging and imminent maritime exfiltration.',
    caseId: 'INT-2026-0941',
  },
  {
    id: 'SAT-02',
    label: 'Target Beta: Embassy Row Suite 400 Perimeter',
    facility: 'Diplomatic Enclave North Wing',
    coordinates: "38°54'52.1\"N 77°03'14.8\"W",
    gridSquare: 'SECTOR-DC-01-EMBASSY',
    sensorType: 'Thermal IR Infrared',
    lastPassTime: '05:50 UTC (SAR Sentinel-2 Radar)',
    analysisSummary:
      'Thermal signature indicates cooling of Suite 400 air handling intake units following emergency HazMat sealing by DGA agents. Zero unauthorized movement detected along perimeter fence line.',
    threatAssessment: 'Crime scene quarantined under federal biohazard seal.',
    caseId: 'INV-2026-0417',
  },
];

export const WATCHLIST_ROSTER: IntelWatchlistEntry[] = [
  {
    id: 'WL-01',
    primaryName: 'Viktor Krell',
    aliases: ['"The Glassmaker"', 'Julian Holt', 'Viktor Korolyov'],
    citizenship: 'Stateless / Forged Swiss Passport',
    biometricCode: 'BIO-KRELL-991',
    threatCategory: 'Weapons Proliferation',
    knownAssociates: ['Elena Rostova', 'Julian Paul Vance', 'Red Dawn Logistics'],
    lastConfirmedLocation: 'Pier 42 Maritime Terminal, Warehouse 18',
    admiraltyRating: 'A1',
    notes: 'Primary broker of clandestine organophosphate batches. Extremely dangerous. Carries concealed cyanide secondary antidote.',
    caseId: 'INT-2026-0941',
  },
  {
    id: 'WL-02',
    primaryName: 'Dr. Julian Paul Vance',
    aliases: ['"The Architect"', 'J. Vance, PhD'],
    citizenship: 'United States',
    biometricCode: 'BIO-VANCE-330',
    threatCategory: 'State-Sponsored Clandestine',
    knownAssociates: ['Viktor Krell', 'Phoenix Biotech Board of Trustees'],
    lastConfirmedLocation: 'Departed Embassy Row at 04:45 UTC',
    admiraltyRating: 'B2',
    notes: 'Former Chief Chemist at Phoenix Biotech. Brother of Ambassador Vance. Motivated by multi-million euro patent settlement and geopolitical espionage.',
    caseId: 'INV-2026-0417',
  },
];

export const NETWORK_GRAPH_DATA: { nodes: GraphNode[]; links: GraphLink[] } = {
  nodes: [
    { id: 'Krell', label: 'Viktor Krell ("Glassmaker")', type: 'Person', category: 'Broker' },
    { id: 'JulianVance', label: 'Dr. Julian Vance', type: 'Person', category: 'Synthesizer / Brother' },
    { id: 'AmbassadorVance', label: 'Ambassador Vance', type: 'Person', category: 'Victim' },
    { id: 'PhoenixBiotech', label: 'Phoenix Biotech Ltd', type: 'Organization', category: 'Shell Entity' },
    { id: 'Pier42', label: 'Pier 42 Warehouse 18', type: 'Location', category: 'Chemical Depot' },
    { id: 'PhoenixDawn', label: 'M/V Phoenix Dawn', type: 'Vessel', category: 'Escape Freighter' },
    { id: 'Embassy400', label: 'Embassy Suite 400', type: 'Location', category: 'Crime Scene' },
    { id: 'CreditHelvetia', label: 'Credit Helvetia Escrow', type: 'Account', category: 'Financial Conduit' },
  ],
  links: [
    { source: 'PhoenixBiotech', target: 'Pier42', relation: 'Leases Facility', verified: true },
    { source: 'JulianVance', target: 'PhoenixBiotech', relation: 'Chief Chemist', verified: true },
    { source: 'JulianVance', target: 'Krell', relation: 'Supplied Recipe', verified: true },
    { source: 'Krell', target: 'Embassy400', relation: 'Delivered Toxin', verified: true },
    { source: 'Krell', target: 'Pier42', relation: 'Staging Escape', verified: true },
    { source: 'Pier42', target: 'PhoenixDawn', relation: 'Loading Cargo', verified: true },
    { source: 'AmbassadorVance', target: 'Embassy400', relation: 'Target of Poisoning', verified: true },
    { source: 'PhoenixBiotech', target: 'CreditHelvetia', relation: 'SWIFT Wire Transfer', verified: true },
  ],
};
