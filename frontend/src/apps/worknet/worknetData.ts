import { getProfile as INSTITUTIONAL_REGISTRYProfile } from '../../game-content/characters/collections/INSTITUTIONAL_REGISTRY';
import {
  Shield, Stethoscope, Landmark, BookOpen, Cpu, Building, Compass, Sparkles, Briefcase, GraduationCap,
  Users, Calendar, Clock, Award, AlertCircle, FileCheck, Coffee, Send, ChevronRight, Activity
} from 'lucide-react';
import type { WorkplaceStationId } from '../JobWorkstationApp';

export interface InstitutionalTheme {
  id: WorkplaceStationId;
  name: string;
  fullName: string;
  shortOrg: string;
  tagline: string;
  focus: string;
  accentColor: string;
  secondaryColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  headerBg: string;
  headerBorder: string;
  cardBorder: string;
  icon: any;
  clearanceRequired: number;
  proceduralTier: "Tier 3: Multi-Stage Technical" | "Tier 2: Field Synthesis & Sampling" | "Tier 1: Agile Civic Dispatch";
  divisions: {
    id: string;
    name: string;
    head: string;
    description: string;
    staffCount: number;
  }[];
  supervisor: {
    id: string;
    name: string;
    title: string;
    department: string;
    avatar: string;
    personality: string;
    expectations: string;
    approvalRate: number;
  };
  coworkers: {
    id: string;
    name: string;
    title: string;
    division: string;
    avatar: string;
    status: 'Desk' | 'In Field' | 'In Meeting' | 'On Break';
    specialty: string;
    quote: string;
    trust: number;
    competence: number;
    familiarity: number;
    cooperation: number;
    conflictHistory: number;
  }[];
  routineDuties: {
    id: string;
    title: string;
    frequency: string;
    estUnits: number;
    description: string;
    rewardDesc: string;
  }[];
  externalApps: {
    id: string;
    title: string;
    description: string;
    appId: string;
  }[];
}

export const INSTITUTIONAL_REGISTRY: Record<WorkplaceStationId, InstitutionalTheme> = {
  dga: {
    id: 'dga',
    proceduralTier: 'Tier 3: Multi-Stage Technical',
    name: 'Dept. of Global Affairs',
    fullName: 'Meridion Department of Global Affairs (DGA)',
    shortOrg: 'DGA',
    tagline: 'Civil Security, External Intelligence & Resonance Containment',
    focus: 'Investigations, intelligence, government assignments',
    accentColor: '#1e3a5f',
    secondaryColor: '#475569',
    badgeBg: '#f1f5f9',
    badgeBorder: '#cbd5e1',
    badgeText: '#1e293b',
    headerBg: '#0f172a',
    headerBorder: '#334155',
    cardBorder: '#e2e8f0',
    icon: Shield,
    clearanceRequired: 2,
    divisions: [
      { id: 'shield', name: 'Shield Defense Division', head: 'Cmdr. Helena Reyes', description: 'Perimeter fortifications, tactical patrols, and public infrastructure protection.', staffCount: 42 },
      { id: 'eyes', name: 'Eyes Intelligence Bureau', head: 'Director Ronald Sterling', description: 'SIGINT intercept analysis, regional telemetry surveillance, and undercover inquiry.', staffCount: 28 },
      { id: 'blackout', name: 'Blackout Containment Unit', head: 'Chief Inspector Vance Lowe', description: 'Deep-layer glitch suppression, PRISM quarantine, and PID anomaly containment.', staffCount: 16 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-dga"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-dga-1"),
      INSTITUTIONAL_REGISTRYProfile("cw-dga-2"),
      INSTITUTIONAL_REGISTRYProfile("cw-dga-3")
    ],
    routineDuties: [
      { id: 'rd-dga-1', title: 'Daily Carrier Telemetry Scan', frequency: 'Daily Shift', estUnits: 1, description: 'Sweep local microwave bands between 80.0 and 92.0 MHz for unauthorized packet bleeds.', rewardDesc: '+25 ₢ · +15 Career XP' },
      { id: 'rd-dga-2', title: 'Perimeter Seal Health Inspection', frequency: 'Twice Weekly', estUnits: 2, description: 'Verify SealLockCrypt integrity across Transit Junction gates 04 through 12.', rewardDesc: '+40 ₢ · +20 Career XP' }
    ],
    externalApps: [
      { id: 'dgaos', title: 'DGAOS Enterprise Console', description: 'Investigative dockets, forensic logs, and departmental operations.', appId: 'dgaos' },
      { id: 'trace', title: 'TRACE Forensics', description: 'Deep packet inspection and acoustic waveform analysis.', appId: 'dgaos' },
      { id: 'vault', title: 'VAULT Records', description: 'Access classified evidence attachments and case filings.', appId: 'files' }
    ]
  },
  faithmed: {
    id: 'faithmed',
    proceduralTier: 'Tier 3: Multi-Stage Technical',
    name: 'Faith Medical Group',
    fullName: 'Faith Medical Clinical & Bio-Resonance Group',
    shortOrg: 'Faith Medical',
    tagline: 'Comprehensive Inpatient Care, Bio-Aura Diagnostics & Veil Research',
    focus: 'Healthcare, medical research, clinical administration',
    accentColor: '#0f766e',
    secondaryColor: '#115e59',
    badgeBg: '#f0fdfa',
    badgeBorder: '#ccfbf1',
    badgeText: '#134e4a',
    headerBg: '#134e4a',
    headerBorder: '#0d9488',
    cardBorder: '#ccfbf1',
    icon: Stethoscope,
    clearanceRequired: 1,
    divisions: [
      { id: 'triage', name: 'Clinical Intake & Urgent Care', head: 'Dr. Aris Thorne', description: 'Acute inpatient stabilization, thermal flux assessment, and vital sign calibration.', staffCount: 36 },
      { id: 'veil', name: 'Veil Exposure Research Laboratory', head: 'Chief Biochemist Katherine Mercer', description: 'Veilwilt desync therapeutics, aura harmonization, and clinical trials.', staffCount: 22 },
      { id: 'records', name: 'Health Informatics & Medical Records', head: 'Admin Soren Lind', description: 'Patient chart archival, prescription verification, and public health telemetry.', staffCount: 18 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-faithmed"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-fm-1"),
      INSTITUTIONAL_REGISTRYProfile("cw-fm-2")
    ],
    routineDuties: [
      { id: 'rd-fm-1', title: 'Ward VITALS Calibration Sweep', frequency: 'Daily Shift', estUnits: 1, description: 'Verify inpatient telemetry transducers in Rooms 101-115.', rewardDesc: '+30 ₢ · +15 Career XP' },
      { id: 'rd-fm-2', title: 'Bio-Compress Inventory Audit', frequency: 'Weekly', estUnits: 1, description: 'Inspect sterile packaging on cryo and thermal compress kits.', rewardDesc: '+25 ₢ · +10 Career XP' }
    ],
    externalApps: [
      { id: 'vitals', title: 'VITALS Telemetry', description: 'Live biometric tracking, aura resonance, and health telemetry.', appId: 'vitals' },
      { id: 'docs', title: 'Document Studio', description: 'Clinical reports, discharge forms, and institutional certificates.', appId: 'documentStudio' }
    ]
  },
  finance: {
    id: 'finance',
    proceduralTier: 'Tier 3: Multi-Stage Technical',
    name: 'Oryn Dept. of Finance',
    fullName: 'Oryn Treasury & Municipal Revenue Administration',
    shortOrg: 'Treasury',
    tagline: 'Public Ledgers, Municipal Payroll, Taxation & Regional Grants',
    focus: 'Finance, banking, accounting, administration',
    accentColor: '#b45309',
    secondaryColor: '#78350f',
    badgeBg: '#fffbeb',
    badgeBorder: '#fef3c7',
    badgeText: '#78350f',
    headerBg: '#292524',
    headerBorder: '#d97706',
    cardBorder: '#fef3c7',
    icon: Landmark,
    clearanceRequired: 1,
    divisions: [
      { id: 'audit', name: 'Public Audit & Compliance Division', head: 'Chief Auditor Silas Oryn', description: 'Disbursement reconciliations, municipal ledger balances, and anti-fraud oversight.', staffCount: 30 },
      { id: 'payroll', name: 'Federal Payroll & Civic Grants Bureau', head: 'Comptroller Elise Vance', description: 'Citizen stipends, institutional salary distribution, and student scholarship allocations.', staffCount: 24 },
      { id: 'vaults', name: 'Currency Vault & Asset Custody', head: 'Custodian Marcus Vale', description: 'Physical and cryptographic reserve verification, bit token issuance, and reserve audits.', staffCount: 14 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-finance"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-fin-1"),
      INSTITUTIONAL_REGISTRYProfile("cw-fin-2")
    ],
    routineDuties: [
      { id: 'rd-fin-1', title: 'Daily Roll 400 Series Reconciliation', frequency: 'Daily Shift', estUnits: 1, description: 'Reconcile municipal credit outlays against registered citizen receipts.', rewardDesc: '+35 ₢ · +20 Career XP' },
      { id: 'rd-fin-2', title: 'Scholarship Routing Verification', frequency: 'Twice Weekly', estUnits: 1, description: 'Validate that Cyacademy tuition subsidies match student enrollment rosters.', rewardDesc: '+30 ₢ · +15 Career XP' }
    ],
    externalApps: [
      { id: 'finance', title: 'Finance Terminal', description: 'Ledgers, balances, currency rates, and account management.', appId: 'finance' },
      { id: 'docs', title: 'Document Studio', description: 'Disbursement rolls, payment certificates, and tax filings.', appId: 'documentStudio' }
    ]
  },
  archives: {
    id: 'archives',
    proceduralTier: 'Tier 2: Field Synthesis & Sampling',
    name: 'City Library & Royal Society',
    fullName: 'Royal Society Archival Research Node & Historical Conservatory',
    shortOrg: 'Royal Archives',
    tagline: 'Pre-Collapse Manuscripts, Sealed Codices & Cultural Preservation',
    focus: 'Historical research, manuscript restoration, academic preservation',
    accentColor: '#0369a1',
    secondaryColor: '#075985',
    badgeBg: '#f0f9ff',
    badgeBorder: '#e0f2fe',
    badgeText: '#0c4a6e',
    headerBg: '#0f172a',
    headerBorder: '#38bdf8',
    cardBorder: '#e0f2fe',
    icon: BookOpen,
    clearanceRequired: 2,
    divisions: [
      { id: 'restoration', name: 'Physical Restoration Lab', head: 'Conservator Maren Holt', description: 'Low-field magnetic foil restoration, parchment stabilization, and ink chemical recovery.', staffCount: 19 },
      { id: 'catalog', name: 'Pre-Collapse Classification Office', head: 'Archivist Julian Thorne', description: 'Cartography, dynastic lineage charters, and council transcript indexing.', staffCount: 22 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-archives"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-arc-1")
    ],
    routineDuties: [
      { id: 'rd-arc-1', title: 'Degraded Foil Micro-Card Pass', frequency: 'Daily Shift', estUnits: 1, description: 'Perform low-field recovery on LN-series batches before cataloging.', rewardDesc: '+30 ₢ · +20 Career XP' }
    ],
    externalApps: [
      { id: 'lore', title: 'Lore Explorer', description: 'Read historical codices, chronicles, and geographical surveys.', appId: 'lore' }
    ]
  },
  engineer: {
    id: 'engineer',
    proceduralTier: 'Tier 3: Multi-Stage Technical',
    name: 'Tech Labs & Infrastructure',
    fullName: 'Meridion Systems Engineering Deck & Infrastructure Directorate',
    shortOrg: 'Systems Engineering',
    tagline: 'Transit Grid Telemetry, Hardware Diagnostics & Signal Filtration',
    focus: 'Diagnostics, inspection, repair, testing, maintenance',
    accentColor: '#1d4ed8',
    secondaryColor: '#1e40af',
    badgeBg: '#eff6ff',
    badgeBorder: '#dbeafe',
    badgeText: '#1e3a8a',
    headerBg: '#1e293b',
    headerBorder: '#60a5fa',
    cardBorder: '#dbeafe',
    icon: Cpu,
    clearanceRequired: 1,
    divisions: [
      { id: 'transit', name: 'Glassline Telemetry & Relay Deck', head: 'Chief Engineer Kaelen Vance', description: 'Terminal junctions, capacitor arrays, and civic communication buses.', staffCount: 34 },
      { id: 'firmware', name: 'Firmware Architecture & Firewall Labs', head: 'Lead Developer Nadia Cruz', description: 'Bus telemetry revisions, adaptive harmonic firewalls, and hardware flashing.', staffCount: 20 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-engineer"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-eng-1")
    ],
    routineDuties: [
      { id: 'rd-eng-1', title: 'Glassline Terminal Junction 12 Inspection', frequency: 'Daily Shift', estUnits: 2, description: 'Check relay C4 traces, verify packet loss is 0%, and ensure 5.0V output.', rewardDesc: '+45 ₢ · +25 Career XP' }
    ],
    externalApps: [
      { id: 'process', title: 'Process Monitor', description: 'System performance, CPU/memory telemetry, and daemons.', appId: 'process' }
    ]
  },
  diplomat: {
    id: 'diplomat',
    proceduralTier: 'Tier 2: Field Synthesis & Sampling',
    name: 'Civic Administration & Council',
    fullName: 'High Council of Aureline Civic Administration',
    shortOrg: 'Civic Council',
    tagline: 'Inter-District Treaties, Public Petitions & Diplomatic Accord',
    focus: 'Administration, records, approvals, service coordination',
    accentColor: '#4338ca',
    secondaryColor: '#3730a3',
    badgeBg: '#eef2ff',
    badgeBorder: '#e0e7ff',
    badgeText: '#312e81',
    headerBg: '#1e1b4b',
    headerBorder: '#818cf8',
    cardBorder: '#e0e7ff',
    icon: Building,
    clearanceRequired: 2,
    divisions: [
      { id: 'treaties', name: 'Treaty Bureau & Resource Arbitration', head: 'Envoy Thalia Vane', description: 'Inter-regional parity agreements, resource negotiations, and pact drafting.', staffCount: 22 },
      { id: 'civic', name: 'Citizen Petitions & Public Hearing Office', head: 'Ombudsman Gregory Bell', description: 'Zoning disputes, civil arbitration, and municipal ordinance public sessions.', staffCount: 18 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-diplomat"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-dip-1")
    ],
    routineDuties: [
      { id: 'rd-dip-1', title: 'Inter-District Dispatch Review', frequency: 'Daily Shift', estUnits: 1, description: 'Review public grievances and draft formal acknowledgement dispatches.', rewardDesc: '+35 ₢ · +20 Career XP' }
    ],
    externalApps: [
      { id: 'mail', title: 'AureMail', description: 'Official inter-agency correspondence and civic dispatches.', appId: 'mail' },
      { id: 'comms', title: 'Comms', description: 'Secure diplomatic conference channels and assembly pings.', appId: 'comms' }
    ]
  },
  warden: {
    id: 'warden',
    proceduralTier: 'Tier 2: Field Synthesis & Sampling',
    name: 'Arcadia Ecological Reserve',
    fullName: 'Arcadia Biosphere Post & Ecological Conservation Ward',
    shortOrg: 'Arcadia Reserve',
    tagline: 'Botanical Dome Assays, Flora Sampling & Soil Ionization Control',
    focus: 'Ecology, biological surveys, environmental remediation',
    accentColor: '#047857',
    secondaryColor: '#065f46',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    badgeText: '#064e3b',
    headerBg: '#064e3b',
    headerBorder: '#34d399',
    cardBorder: '#a7f3d0',
    icon: Compass,
    clearanceRequired: 1,
    divisions: [
      { id: 'soil', name: 'Sub-Surface Soil & Hydrology Lab', head: 'Warden Corin Mercer', description: 'Veil ionization mapping, aquifer testing, and chelator dispersal.', staffCount: 17 },
      { id: 'canopy', name: 'Botanical Dome & Canopy Canopy Post', head: 'Ecologist Mara Finch', description: 'Crystalline flora preservation, pollen assays, and biosphere equilibrium.', staffCount: 15 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-warden"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-war-1")
    ],
    routineDuties: [
      { id: 'rd-war-1', title: 'Perimeter C14 Biosphere Assay', frequency: 'Daily Shift', estUnits: 2, description: 'Collect soil, water, and flora specimens to monitor spectral ionization.', rewardDesc: '+40 ₢ · +20 Career XP' }
    ],
    externalApps: [
      { id: 'field', title: 'Field Operations', description: 'Geographical maps, environmental telemetry, and field logs.', appId: 'fieldOperations' }
    ]
  },
  artist: {
    id: 'artist',
    proceduralTier: 'Tier 2: Field Synthesis & Sampling',
    name: 'Media & Performance Guild',
    fullName: 'The Velvet Cultural Studio & Media Guild',
    shortOrg: 'Velvet Cultural Studio',
    tagline: 'Holographic Arts, Civic Broadcasts, Soundscapes & Cultural Expression',
    focus: 'Arts, media, holographic production, performance',
    accentColor: '#be185d',
    secondaryColor: '#9d174d',
    badgeBg: '#fdf2f8',
    badgeBorder: '#fbcfe8',
    badgeText: '#831843',
    headerBg: '#4c0519',
    headerBorder: '#f472b6',
    cardBorder: '#fbcfe8',
    icon: Sparkles,
    clearanceRequired: 1,
    divisions: [
      { id: 'holo', name: 'Holographic Studio & Visual Stage', head: 'Artistic Director Vivienne Rose', description: 'Resonance lighting, gallery exhibitions, and architectural holos.', staffCount: 20 },
      { id: 'broadcast', name: 'Aureline Civic Broadcast Bureau', head: 'Producer Leo Sterling', description: 'Audio dramatizations, public announcements, and musical recordings.', staffCount: 16 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-artist"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-art-1")
    ],
    routineDuties: [
      { id: 'rd-art-1', title: 'Daily Civic Broadcast Soundcheck', frequency: 'Daily Shift', estUnits: 1, description: 'Calibrate harmonic equalization on the public broadcast array.', rewardDesc: '+30 ₢ · +20 Career XP' }
    ],
    externalApps: [
      { id: 'maispace', title: 'MAI.SPACE', description: 'Social network, music publishing, and community blog.', appId: 'maispace' }
    ]
  },
  questnotice: {
    id: 'questnotice',
    proceduralTier: 'Tier 1: Agile Civic Dispatch',
    name: 'Aureline Public Notice Board',
    fullName: 'QUESTNOTICE Civic Dispatch & Public Labor Board',
    shortOrg: 'Civic Dispatch',
    tagline: 'Neighborhood Odd Jobs, Deliveries, Quick Errands & Civic Aid',
    focus: 'Civic notices, neighborhood assistance, rapid assignments',
    accentColor: '#d97706',
    secondaryColor: '#b45309',
    badgeBg: '#fffbeb',
    badgeBorder: '#fde68a',
    badgeText: '#92400e',
    headerBg: '#451a03',
    headerBorder: '#fbbf24',
    cardBorder: '#fde68a',
    icon: Briefcase,
    clearanceRequired: 0,
    divisions: [
      { id: 'errands', name: 'Neighborhood Dispatch Desk', head: 'Coordinator Talia Moss', description: 'Community deliveries, shop deliveries, and domestic assistance.', staffCount: 12 },
      { id: 'urgent', name: 'Civic Rapid Response Office', head: 'Dispatcher Felix Ward', description: 'Lost item recovery, street lighting notices, and pet wellness requests.', staffCount: 10 }
    ],
    supervisor: INSTITUTIONAL_REGISTRYProfile("sup-questnotice"),
    coworkers: [
      INSTITUTIONAL_REGISTRYProfile("cw-qn-1")
    ],
    routineDuties: [
      { id: 'rd-qn-1', title: 'Morning District Notice Sorting', frequency: 'Daily Shift', estUnits: 1, description: 'Review public bulletin postings and remove expired neighborhood notices.', rewardDesc: '+20 ₢ · +10 Career XP' }
    ],
    externalApps: [
      { id: 'browser', title: 'VerseNet // Services', description: 'Public services and community trade boards.', appId: 'browser' }
    ]
  }
};

export interface DynamicWorkplaceEvent {
  id: string;
  stationId: WorkplaceStationId;
  title: string;
  category: 'Staffing Shortage' | 'Telemetry Anomaly' | 'Citizen Surge' | 'Urgent Maintenance';
  severity: 'Moderate' | 'High' | 'Routine';
  description: string;
  actionLabel: string;
  staminaCost: number;
  rewardCredits: number;
  rewardXP: number;
  impactSummary: string;
  consequencesIfIgnored: string;
}

export const CANONICAL_DYNAMIC_EVENTS: DynamicWorkplaceEvent[] = [
  {
    id: 'dyn-dga-01',
    stationId: 'dga',
    title: 'Surge Coverage: Relay 88A Micro-Spike',
    category: 'Telemetry Anomaly',
    severity: 'High',
    description: 'Investigator Mireille is testifying at the Assembly. Eyes Bureau needs an authorized officer to monitor microwave burst packets on 88.2 MHz.',
    actionLabel: 'Cover Monitoring Post (10 min)',
    staminaCost: 5,
    rewardCredits: 40,
    rewardXP: 25,
    impactSummary: 'Deepens cooperation with Eyes Bureau; locks down suspicious carrier packet leaks.',
    consequencesIfIgnored: 'Unmonitored carrier leak could delay case file cross-referencing.'
  },
  {
    id: 'dyn-fm-01',
    stationId: 'faithmed',
    title: 'Emergency Inpatient Intake Surge',
    category: 'Citizen Surge',
    severity: 'High',
    description: 'Three high-load synthesis workers arrived exhibiting acute thermal flux (39.0°C+). Dr. Thorne requests intake prep and VITALS sensor attachment.',
    actionLabel: 'Assist Inpatient Triage (10 min)',
    staminaCost: 6,
    rewardCredits: 50,
    rewardXP: 30,
    impactSummary: 'Increases Faith Medical trust; provides immediate relief to overwhelmed ward staff.',
    consequencesIfIgnored: 'Longer patient wait times and slight dip in department satisfaction rating.'
  },
  {
    id: 'dyn-fin-01',
    stationId: 'finance',
    title: 'Disbursement Roll 402 Balancing Discrepancy',
    category: 'Staffing Shortage',
    severity: 'Moderate',
    description: 'An unexpected 2,400 credit variance surfaced in the civic housing repair ledger. Chief Auditor Silas needs an urgent dual-signature reconciliation pass.',
    actionLabel: 'Reconcile Roll 402 Ledger (8 min)',
    staminaCost: 5,
    rewardCredits: 45,
    rewardXP: 25,
    impactSummary: 'Maintains 100% audit integrity; strengthens Silas’s evaluation of your precision.',
    consequencesIfIgnored: 'End-of-cycle payroll queue may require temporary administrative hold.'
  },
  {
    id: 'dyn-eng-01',
    stationId: 'engineer',
    title: 'Glassline Terminal 14 Grounding Alarm',
    category: 'Urgent Maintenance',
    severity: 'High',
    description: 'Telemetry alerts show intermittent ground faulting along Glassline Terminal 14. Lead Engineer Kaelen needs an emergency lockout and continuity check.',
    actionLabel: 'Perform Continuity Check (12 min)',
    staminaCost: 7,
    rewardCredits: 55,
    rewardXP: 30,
    impactSummary: 'Prevents transit system interruption; earns commendation from Infrastructure Directorate.',
    consequencesIfIgnored: 'Transit line speed reductions during evening rush cycle.'
  }
];

export interface ScheduledShiftItem {
  id: string;
  day: string;
  timeSlot: string;
  institutionId: WorkplaceStationId;
  institutionName: string;
  dutyTitle: string;
  location: string;
  isMandatory: boolean;
  status: 'Scheduled' | 'Completed' | 'Leave Approved' | 'Pending';
}

export const INITIAL_SCHEDULE_ITEMS: ScheduledShiftItem[] = [
  {
    id: 'sch-01',
    day: 'Today (Cycle Active)',
    timeSlot: '09:00 - 12:00',
    institutionId: 'dga',
    institutionName: 'Department of Global Affairs',
    dutyTitle: 'Tactical Console Briefing & SIGINT Sweep',
    location: 'DGA Building, Floor 4, Suite 402',
    isMandatory: true,
    status: 'Scheduled'
  },
  {
    id: 'sch-02',
    day: 'Today (Cycle Active)',
    timeSlot: '13:30 - 16:30',
    institutionId: 'faithmed',
    institutionName: 'Faith Medical Group',
    dutyTitle: 'Ward Patient Telemetry & Chart Maintenance',
    location: 'Faith Sanctuary Hospital, Ward B',
    isMandatory: false,
    status: 'Scheduled'
  },
  {
    id: 'sch-03',
    day: 'Tomorrow',
    timeSlot: '10:00 - 11:30',
    institutionId: 'finance',
    institutionName: 'Oryn Dept. of Finance',
    dutyTitle: 'Audit Committee Disbursement Sync',
    location: 'Treasury Chambers, Conference Room 2',
    isMandatory: true,
    status: 'Scheduled'
  },
  {
    id: 'sch-04',
    day: 'Cycle Day 4',
    timeSlot: '14:00 - 17:00',
    institutionId: 'engineer',
    institutionName: 'Systems Engineering Deck',
    dutyTitle: 'Relay Maintenance & Power Lockout Testing',
    location: 'Glassline Terminal Junction 12',
    isMandatory: false,
    status: 'Scheduled'
  }
];


export interface DelegationTask {
  id: string;
  stationId: WorkplaceStationId;
  title: string;
  requiredRole: string;
  estUnits: number;
  description: string;
  rewardDesc: string;
  minCompetence: number;
}

export interface SubordinateLeaveRequest {
  id: string;
  subordinateName: string;
  subordinateId: string;
  stationId: WorkplaceStationId;
  shiftDuty: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

export const INITIAL_DELEGATION_TASKS: DelegationTask[] = [
  {
    id: 'dt-dga-01',
    stationId: 'dga',
    title: 'Archive Carrier Packet Log Audit',
    requiredRole: 'Senior Field Analyst',
    estUnits: 2,
    description: 'Cross-reference 88.2 MHz packet traces against unregistered Netrunner mac-addresses.',
    rewardDesc: '+35 Department Merit · +20 ₢',
    minCompetence: 75
  },
  {
    id: 'dt-dga-02',
    stationId: 'dga',
    title: 'Perimeter Barrier Seal Diagnostics',
    requiredRole: 'Tactical Dispatch Coordinator',
    estUnits: 1,
    description: 'Perform routine cryptographic handshake verification at Gate 07.',
    rewardDesc: '+25 Department Merit · +15 ₢',
    minCompetence: 70
  },
  {
    id: 'dt-fm-01',
    stationId: 'faithmed',
    title: 'Ward Inpatient Triage Log Review',
    requiredRole: 'Resident Bio-Aura Clinician',
    estUnits: 1,
    description: 'Audit 15 inpatient charts for thermal flux calibration and symptom clearance.',
    rewardDesc: '+30 Department Merit · +20 ₢',
    minCompetence: 80
  },
  {
    id: 'dt-fin-01',
    stationId: 'finance',
    title: 'Regional Grant Roll Balancing',
    requiredRole: 'Senior Ledger Analyst',
    estUnits: 2,
    description: 'Reconcile scholarship stipends disbursed to Cyacademy against student rosters.',
    rewardDesc: '+40 Department Merit · +25 ₢',
    minCompetence: 80
  },
  {
    id: 'dt-eng-01',
    stationId: 'engineer',
    title: 'Glassline Terminal 12 Firmware Flashing',
    requiredRole: 'Lead Relay Diagnostics Specialist',
    estUnits: 2,
    description: 'Deploy Bus Telemetry v2.4 patch image to secondary junction nodes.',
    rewardDesc: '+45 Department Merit · +25 ₢',
    minCompetence: 85
  }
];

export const INITIAL_SUBORDINATE_LEAVES: SubordinateLeaveRequest[] = [
  {
    id: 'sub-lv-01',
    subordinateName: 'Vance Lowe',
    subordinateId: 'cw-dga-1',
    stationId: 'dga',
    shiftDuty: 'Evening SIGINT Carrier Sweep',
    reason: 'Field acoustic calibration at Seraphima Tower',
    status: 'Pending'
  },
  {
    id: 'sub-lv-02',
    subordinateName: 'Soren Lind',
    subordinateId: 'cw-fm-2',
    stationId: 'faithmed',
    shiftDuty: 'Afternoon Intake Desk Coverage',
    reason: 'Bio-resonance recovery following high-load synthesis intake',
    status: 'Pending'
  },
  {
    id: 'sub-lv-03',
    subordinateName: 'Tobias Gale',
    subordinateId: 'cw-fin-2',
    stationId: 'finance',
    shiftDuty: 'Disbursement Roll Verification',
    reason: 'Annual civic audit testimony before Council',
    status: 'Pending'
  }
];
