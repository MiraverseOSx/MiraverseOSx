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
    supervisor: {
      id: 'sup-dga',
      name: 'Director Ronald Sterling',
      title: 'Deputy Director of Operational Intelligence',
      department: 'Department of Global Affairs // Directorate',
      avatar: 'RS',
      personality: 'Methodical, exacting, values verifiable primary evidence and strict protocol over hunches.',
      expectations: 'Primary evidence citations must match filed dockets. Zero tolerance for unverified allegations.',
      approvalRate: 88
    },
    coworkers: [
      {
        id: 'cw-dga-1',
        name: 'Vance Lowe',
        title: 'Senior Field Analyst',
        division: 'Blackout Containment',
        avatar: 'VL',
        status: 'Desk',
        specialty: 'Root-layer anomaly triangulation & signal decryption',
        quote: 'If the carrier frequency is drifting even half a megahertz, don’t sign off yet.',
        trust: 76,
        competence: 92,
        familiarity: 68,
        cooperation: 80,
        conflictHistory: 10
      },
      {
        id: 'cw-dga-2',
        name: 'Mireille Chen',
        title: 'Investigative Case Officer',
        division: 'Eyes Intelligence Bureau',
        avatar: 'MC',
        status: 'In Meeting',
        specialty: 'Witness correspondence & cross-registry financial correlation',
        quote: 'Paper trails don’t glitch out. People just stop reading footnote disclosures.',
        trust: 84,
        competence: 88,
        familiarity: 72,
        cooperation: 86,
        conflictHistory: 4
      },
      {
        id: 'cw-dga-3',
        name: 'Sergeant Derek Brody',
        title: 'Tactical Dispatch Coordinator',
        division: 'Shield Defense Division',
        avatar: 'DB',
        status: 'In Field',
        specialty: 'Perimeter SealLockCrypt protocols & field equipment supply',
        quote: 'Lock the blast barrier first. Analyze the anomalous packets when everyone is breathing.',
        trust: 70,
        competence: 82,
        familiarity: 55,
        cooperation: 78,
        conflictHistory: 15
      }
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
    supervisor: {
      id: 'sup-faithmed',
      name: 'Dr. Aris Thorne',
      title: 'Chief Medical Officer',
      department: 'Faith Medical // Central Clinical Directorate',
      avatar: 'AT',
      personality: 'Compassionate yet rigorously clinical. Prioritizes patient stabilization and clean documentation.',
      expectations: 'All diagnostic entries must cross-reference VITALS-Sync telemetry. Patient comfort comes first.',
      approvalRate: 94
    },
    coworkers: [
      {
        id: 'cw-fm-1',
        name: 'Katherine Mercer',
        title: 'Resident Bio-Aura Clinician',
        division: 'Veil Exposure Laboratory',
        avatar: 'KM',
        status: 'Desk',
        specialty: 'High-load synthesis stabilization and thermal compress calibration',
        quote: 'Veilwilt desync is terrifying, but standard warm compress and rest resolve 90% of acute spikes.',
        trust: 90,
        competence: 95,
        familiarity: 82,
        cooperation: 92,
        conflictHistory: 2
      },
      {
        id: 'cw-fm-2',
        name: 'Soren Lind',
        title: 'Clinical Intake Specialist',
        division: 'Clinical Intake & Urgent Care',
        avatar: 'SL',
        status: 'Desk',
        specialty: 'Rapid triage intake & pharmaceutical counter-indications',
        quote: 'Make sure their chart is signed before discharging. Oryn Treasury will not pay an unverified admission.',
        trust: 82,
        competence: 86,
        familiarity: 74,
        cooperation: 88,
        conflictHistory: 6
      }
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
    supervisor: {
      id: 'sup-finance',
      name: 'Silas Oryn',
      title: 'Chief Auditor of the Treasury',
      department: 'Oryn Department of Finance // Audit Directorate',
      avatar: 'SO',
      personality: 'Exact, meticulous, calm. Believes that an unbalanced ledger of even one credit erodes civic trust.',
      expectations: 'Every debit must have a matching credited allocation. No unsigned adjustment slips.',
      approvalRate: 85
    },
    coworkers: [
      {
        id: 'cw-fin-1',
        name: 'Elise Vance',
        title: 'Senior Ledger Analyst',
        division: 'Public Audit & Compliance',
        avatar: 'EV',
        status: 'Desk',
        specialty: 'Inter-regional routing variances and municipal grant reconciliations',
        quote: 'When the municipal debit doesn’t balance, always check the scholarship roll first.',
        trust: 85,
        competence: 94,
        familiarity: 70,
        cooperation: 86,
        conflictHistory: 4
      },
      {
        id: 'cw-fin-2',
        name: 'Tobias Gale',
        title: 'Disbursement Officer',
        division: 'Federal Payroll Bureau',
        avatar: 'TG',
        status: 'In Meeting',
        specialty: 'Credit transfer queue batching and verified recipient authorization',
        quote: 'Pay people on cycle. Everything else in government can wait, but payroll cannot.',
        trust: 78,
        competence: 83,
        familiarity: 62,
        cooperation: 80,
        conflictHistory: 8
      }
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
    supervisor: {
      id: 'sup-archives',
      name: 'Julian Thorne',
      title: 'Grand Archivist & Custodian of Sealed Codices',
      department: 'Royal Society // Archival Division',
      avatar: 'JT',
      personality: 'Scholarly, patient, protective of antique knowledge. Insists on non-invasive examination methods.',
      expectations: 'Never apply harsh solvents to magnetic foil. Handle all lineage seals under harmonic resonance.',
      approvalRate: 91
    },
    coworkers: [
      {
        id: 'cw-arc-1',
        name: 'Maren Holt',
        title: 'Master Conservator',
        division: 'Physical Restoration Lab',
        avatar: 'MH',
        status: 'Desk',
        specialty: 'Low-field foil recovery & harmonic de-crystallization',
        quote: 'A degraded micro-card is still talking to you if you calibrate the sensor correctly.',
        trust: 88,
        competence: 96,
        familiarity: 76,
        cooperation: 90,
        conflictHistory: 3
      }
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
    supervisor: {
      id: 'sup-engineer',
      name: 'Kaelen Vance',
      title: 'Chief Systems Architect',
      department: 'Infrastructure Directorate // Systems Engineering',
      avatar: 'KV',
      personality: 'Pragmatic, direct, safety-obsessed. Will test a relay three times before clearing transit power.',
      expectations: 'Isolate power BEFORE touching the board. Lock out transit mains or face immediate disciplinary review.',
      approvalRate: 86
    },
    coworkers: [
      {
        id: 'cw-eng-1',
        name: 'Nadia Cruz',
        title: 'Lead Relay Diagnostics Specialist',
        division: 'Glassline Telemetry Deck',
        avatar: 'NC',
        status: 'Desk',
        specialty: 'Oscilloscope voltage drop calculations & capacitor replacements',
        quote: 'If C4 drops by four volts, don’t look for ghosts in the software. Replace the 470 microfarad cap.',
        trust: 86,
        competence: 94,
        familiarity: 75,
        cooperation: 88,
        conflictHistory: 5
      }
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
    supervisor: {
      id: 'sup-diplomat',
      name: 'Thalia Vane',
      title: 'Senior Envoy of the Aureline Assembly',
      department: 'Civic Administration // Diplomatic Chancery',
      avatar: 'TV',
      personality: 'Diplomatic, articulate, focused on enduring consensus and mutual concession.',
      expectations: 'Both parties must leave the table feeling their core requirements were heard and respected.',
      approvalRate: 90
    },
    coworkers: [
      {
        id: 'cw-dip-1',
        name: 'Gregory Bell',
        title: 'Consensus Arbitrator',
        division: 'Treaty Bureau',
        avatar: 'GB',
        status: 'Desk',
        specialty: 'Solar-core and cryo-coolant reciprocal parity frameworks',
        quote: 'Never push for a signature until both sides have confirmed their resource guarantees.',
        trust: 80,
        competence: 88,
        familiarity: 65,
        cooperation: 82,
        conflictHistory: 6
      }
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
    supervisor: {
      id: 'sup-warden',
      name: 'Corin Mercer',
      title: 'Chief Warden of Arcadia Reserve',
      department: 'Arcadia Biosphere // Central Ward',
      avatar: 'CM',
      personality: 'Rugged, observant, attuned to minute shifts in environmental resonance.',
      expectations: 'Sample containers must be sealed and labeled immediately upon collection. Never mix test tubes.',
      approvalRate: 92
    },
    coworkers: [
      {
        id: 'cw-war-1',
        name: 'Mara Finch',
        title: 'Field Ecologist',
        division: 'Canopy Canopy Post',
        avatar: 'MF',
        status: 'In Field',
        specialty: 'Perimeter C14 soil, water, and crystalline flora assays',
        quote: '18% ionization is high, but crystalline chelators can bring it right back into balance.',
        trust: 85,
        competence: 90,
        familiarity: 70,
        cooperation: 87,
        conflictHistory: 4
      }
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
    supervisor: {
      id: 'sup-artist',
      name: 'Vivienne Rose',
      title: 'Artistic Director',
      department: 'Velvet Cultural Studio // Executive Board',
      avatar: 'VR',
      personality: 'Passionate, expressive, sharp eye for resonance harmony and aesthetic impact.',
      expectations: 'Technique matters, but authentic emotional connection with the audience matters more.',
      approvalRate: 91
    },
    coworkers: [
      {
        id: 'cw-art-1',
        name: 'Leo Sterling',
        title: 'Resident Sound Designer',
        division: 'Civic Broadcast Bureau',
        avatar: 'LS',
        status: 'Desk',
        specialty: 'Acoustic harmonic filters and ambient broadcast mastering',
        quote: 'Music isn’t just background in Meridion—it stabilizes citizen mood and cognitive clarity.',
        trust: 82,
        competence: 91,
        familiarity: 73,
        cooperation: 85,
        conflictHistory: 6
      }
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
    supervisor: {
      id: 'sup-questnotice',
      name: 'Talia Moss',
      title: 'Civic Dispatch Coordinator',
      department: 'QUESTNOTICE // District Center',
      avatar: 'TM',
      personality: 'Friendly, brisk, community-centered. Loves getting everyday problems solved quickly.',
      expectations: 'Be courteous to merchants and residents. Complete deliveries within stated timeframes.',
      approvalRate: 96
    },
    coworkers: [
      {
        id: 'cw-qn-1',
        name: 'Felix Ward',
        title: 'Dispatch Assistant',
        division: 'Neighborhood Dispatch Desk',
        avatar: 'FW',
        status: 'Desk',
        specialty: 'District routing and courier package verification',
        quote: 'Taking care of the little things keeps the city running just as much as the High Council.',
        trust: 85,
        competence: 86,
        familiarity: 78,
        cooperation: 90,
        conflictHistory: 2
      }
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
