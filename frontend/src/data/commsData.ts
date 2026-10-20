// Canonical AureMail & Comms Seed Data (Decisions 006-011)

export type EmailAccountType = 'personal' | 'academic' | 'work' | 'institutional';
export type EmailAttachmentKind = 'file' | 'record' | 'form' | 'grant' | 'payment' | 'reward';
export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'outbox' | 'archive' | 'trash';
export type EmailDeliveryStatus = 'delivered' | 'sent' | 'queued' | 'blocked_clearance' | 'blocked_trust' | 'failed';

export interface AureMailAccount {
  id: string;
  address: string;
  label: string;
  accountType: EmailAccountType;
  institution: string;
  roleLabel: string;
  maid: string;
  verified: boolean;
  status: 'active' | 'provisional' | 'suspended' | 'revoked';
  requiredClearance?: number;
  signature?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  kind: EmailAttachmentKind;
  /**
   * Decision 011: Strictly separates ordinary file/record/form attachments (isReward: false)
   * from verified one-time rewards/payments/grants (isReward: true).
   */
  isReward: boolean;
  type: string;
  amount: number;
  xp?: number;
  claimed: boolean;
  mockKey?: string;
  previewTitle?: string;
  previewText?: string;
  targetApp?: string;
  version?: string;
  provenance?: string;
  requiresFormSubmission?: boolean;
}

export interface EmailItem {
  assignmentId?: string;
  id: string;
  threadId?: string;
  parentId?: string;
  sender: string;
  senderAddress?: string;
  senderMaid?: string;
  recipient?: string;
  recipientAddress?: string;
  cc?: string[];
  bcc?: string[];
  faction: string;
  subject: string;
  time: string;
  timestamp?: string;
  read: boolean;
  folder?: EmailFolder;
  deliveryStatus?: EmailDeliveryStatus;
  verifiedSender?: boolean;
  institutionalSeal?: string;
  suspicious?: boolean;
  encrypted?: boolean;
  requiredClearance?: number;
  labels?: string[];
  npcKey?: string;
  linkedApp?: string;
  auditLog?: string[];
  attachment: { type: string; amount: number; name: string; claimed: boolean } | null;
  attachments?: EmailAttachment[];
  body: string;
}

export interface AureMailDirectoryContact {
  id: string;
  name: string;
  address: string;
  category: 'citizen' | 'npc' | 'institution';
  accountType: EmailAccountType;
  role: string;
  institution: string;
  faction: string;
  maid?: string;
  npcKey?: string;
  requiredClearance: number;
  requiredTrust?: number;
  verified: boolean;
  description?: string;
}

export interface ShadowChatItem {
  id: number;
  user: string;
  team: string;
  text: string;
  time: string;
}

export const DEFAULT_PLAYER_EMAIL_ACCOUNTS: AureMailAccount[] = [
  {
    id: 'acc-personal',
    address: 'citizen@auremail.aure',
    label: 'Primary Personal Mail',
    accountType: 'personal',
    institution: 'AureMail Public Relay',
    roleLabel: 'Verified Citizen',
    maid: 'MAID-OR-00481926',
    verified: true,
    status: 'active',
    signature: 'Sent via AureMail Personal Relay · MAID-OR-00481926',
  },
  {
    id: 'acc-academic',
    address: 'scholar@cyacademy.edu',
    label: 'Cyacademy Academic Mail',
    accountType: 'academic',
    institution: 'Cyacademy University',
    roleLabel: 'Enrolled Scholar',
    maid: 'MAID-OR-00481926',
    verified: true,
    status: 'active',
    signature: 'Cyacademy Student Systems · Academic Relay',
  },
  {
    id: 'acc-work',
    address: 'contractor@worknet.aure',
    label: 'WorkNet Professional Mail',
    accountType: 'work',
    institution: 'WorkNet Municipal Registry',
    roleLabel: 'Assigned Contractor',
    maid: 'MAID-OR-00481926',
    verified: true,
    status: 'active',
    signature: 'WorkNet Verified Assignment Relay',
  },
  {
    id: 'acc-institutional-dga',
    address: 'liaison@dga.gov',
    label: 'DGA Civic Liaison Desk',
    accountType: 'institutional',
    institution: 'Department of Global Affairs',
    roleLabel: 'Provisional Field Liaison',
    maid: 'MAID-OR-00481926',
    verified: true,
    status: 'active',
    requiredClearance: 1,
    signature: 'DGA Field Liaison · Directive 14-B Authenticated',
  },
  {
    id: 'acc-institutional-faith',
    address: 'intake.fellow@faithmed.aure',
    label: 'Faith Medical Clinical Desk',
    accountType: 'institutional',
    institution: 'Faith Medical Group',
    roleLabel: 'Clinical Support Fellow',
    maid: 'MAID-OR-00481926',
    verified: true,
    status: 'active',
    requiredClearance: 1,
    signature: 'Faith Medical Group · Clinical Telemetry Division',
  },
];

export const AUREMAIL_DIRECTORY: AureMailDirectoryContact[] = [
  // Institutional Bureaus & Desks
  {
    id: 'dir-cyacademy-reg',
    name: 'Cyacademy Registration Office',
    address: 'registrar@cyacademy.edu',
    category: 'institution',
    accountType: 'institutional',
    role: 'Academic Registrar & Enrollment',
    institution: 'Cyacademy University',
    faction: 'Cyacademy Admin',
    maid: 'MAID-OR-00000101',
    requiredClearance: 1,
    verified: true,
    description: 'Handles academic enrollment, transcripts, orientation schedules, and fellowship grants.',
  },
  {
    id: 'dir-cyacademy-housing',
    name: 'Cyacademy Residential Services',
    address: 'housing@cyacademy.edu',
    category: 'institution',
    accountType: 'institutional',
    role: 'Residential & Housing Operations',
    institution: 'Cyacademy Residential Services',
    faction: 'Cyacademy Admin',
    maid: 'MAID-OR-00000102',
    requiredClearance: 1,
    verified: true,
    description: 'Manages Unit 4B suite access, comfort inspections, and residential relocation stipends.',
  },
  {
    id: 'dir-civic-bureau',
    name: 'Aureline Civic Identity Bureau',
    address: 'registry@orynvell.gov',
    category: 'institution',
    accountType: 'institutional',
    role: 'MAID & Aura Passport Authority',
    institution: 'Orynvell Civic Registry',
    faction: 'Civic Bureau',
    maid: 'MAID-OR-00000103',
    requiredClearance: 1,
    verified: true,
    description: 'Authoritative bureau for MAID records, Aura Passport activation, and official identity documents.',
  },
  {
    id: 'dir-faith-intake',
    name: 'Faith Medical Group Intake',
    address: 'intake@faithmed.aure',
    category: 'institution',
    accountType: 'institutional',
    role: 'Clinical Triage & Patient Records',
    institution: 'Faith Medical Group',
    faction: 'Faith Medical',
    maid: 'MAID-OR-00000104',
    requiredClearance: 1,
    verified: true,
    description: 'Receives diagnostic scan requests, clinical chart updates, and Veilwilt treatment reports.',
  },
  {
    id: 'dir-dga-dispatch',
    name: 'DGAOS Field Dispatch Desk',
    address: 'dispatch@dga.gov',
    category: 'institution',
    accountType: 'institutional',
    role: 'Forensic & Intelligence Intake',
    institution: 'Department of Global Affairs',
    faction: 'DGA',
    maid: 'MAID-OR-00000105',
    requiredClearance: 1,
    verified: true,
    description: 'Official intake for DGAOS / TRACE forensic case leads, anomaly telemetry, and warrant requests.',
  },
  {
    id: 'dir-dga-high-command',
    name: 'DGA High Command Directorate',
    address: 'command.classified@dga.gov',
    category: 'institution',
    accountType: 'institutional',
    role: 'Classified Compartmented Operations',
    institution: 'Department of Global Affairs',
    faction: 'DGA',
    maid: 'MAID-OR-00000199',
    requiredClearance: 3,
    verified: true,
    description: 'Restricted Level 3+ directorate channel for compartmented intelligence operations.',
  },
  {
    id: 'dir-worknet-relay',
    name: 'WorkNet Assignment Relay',
    address: 'assignments@worknet.aure',
    category: 'institution',
    accountType: 'work',
    role: 'Institutional Contract Verification',
    institution: 'WorkNet Municipal Registry',
    faction: 'Civic Bureau',
    maid: 'MAID-OR-00000106',
    requiredClearance: 1,
    verified: true,
    description: 'Processes institutional job deliverables, contract verifications, and career progression filings.',
  },
  // Core Story NPCs
  {
    id: 'dir-dean-rook',
    name: 'Dean Cassian Rook',
    address: 'c.rook@cyacademy.edu',
    category: 'npc',
    accountType: 'academic',
    role: 'Dean of Students',
    institution: 'Cyacademy University',
    faction: 'Cyacademy Faculty',
    maid: 'MAID-OR-00010201',
    npcKey: 'rook',
    requiredClearance: 1,
    verified: true,
    description: 'Oversees student conduct, orientation schedules, and campus safety directives.',
  },
  {
    id: 'dir-dr-voss',
    name: 'Dr. Sharon Voss',
    address: 's.voss@cyacademy.edu',
    category: 'npc',
    accountType: 'academic',
    role: 'Senior Aura & Systems Researcher',
    institution: 'Cyacademy Research Division',
    faction: 'Cyacademy Faculty',
    maid: 'MAID-OR-00010202',
    npcKey: 'voss',
    requiredClearance: 1,
    requiredTrust: 40,
    verified: true,
    description: 'Leads PRISM anomaly research and subterranean frequency analysis.',
  },
  {
    id: 'dir-aelita',
    name: 'Aelita Schaeffer',
    address: 'aelita.s@cyacademy.edu',
    category: 'npc',
    accountType: 'academic',
    role: 'Core Resonance Specialist',
    institution: 'Cyacademy University',
    faction: 'Cyacademy Admin',
    maid: 'MAID-OR-00010203',
    npcKey: 'aelita',
    requiredClearance: 1,
    requiredTrust: 30,
    verified: true,
    description: 'Researches Veil tower harmonics, AETHERCORE echoes, and archive memory traces.',
  },
  {
    id: 'dir-jeremie',
    name: 'Jeremie Belpois',
    address: 'j.belpois@cyacademy.edu',
    category: 'npc',
    accountType: 'academic',
    role: 'Lead Systems Engineer',
    institution: 'Cyacademy Lab 4',
    faction: 'Cyacademy Admin',
    maid: 'MAID-OR-00010204',
    npcKey: 'jeremie',
    requiredClearance: 1,
    requiredTrust: 30,
    verified: true,
    description: 'Maintains Sub-Conduit diagnostic relays, firewall modules, and SpellForge compilers.',
  },
  {
    id: 'dir-odd',
    name: 'Odd Della Robbia',
    address: 'odd.dr@auremail.aure',
    category: 'npc',
    accountType: 'personal',
    role: 'Student Tactician & Scout',
    institution: 'Cyacademy University',
    faction: 'Cyacademy Admin',
    maid: 'MAID-OR-00010205',
    npcKey: 'odd',
    requiredClearance: 1,
    verified: true,
    description: 'Campus scout, social connector, and reconnaissance lead.',
  },
  {
    id: 'dir-riven',
    name: 'Riven Asterwind',
    address: 'riven@worknet.aure',
    category: 'npc',
    accountType: 'work',
    role: 'Netrunner Specialist',
    institution: 'Independent / Vector',
    faction: 'Vector',
    maid: 'MAID-OR-00010206',
    npcKey: 'riven',
    requiredClearance: 1,
    requiredTrust: 45,
    verified: true,
    description: 'Handles conduit routing, dead-drop analysis, and Old Factory Ward reconnaissance.',
  },
  // Canonical Registry Citizens (MAID linked)
  {
    id: 'dir-elara-vale',
    name: 'Elara Vale',
    address: 'elara.vale@cyacademy.edu',
    category: 'citizen',
    accountType: 'academic',
    role: 'Senior Resonance Archivist',
    institution: 'Cyacademy Archive',
    faction: 'Cyacademy Admin',
    maid: 'MAID-OR-00000001',
    npcKey: 'rowan',
    requiredClearance: 1,
    verified: true,
    description: 'Canonical Citizen #1 · Senior Resonance Archivist in the Central Library.',
  },
  {
    id: 'dir-miracle-jerome',
    name: 'Dr. Miracle Jerome',
    address: 'm.jerome@faithmed.aure',
    category: 'citizen',
    accountType: 'institutional',
    role: 'Chief Aura Diagnostician',
    institution: 'Faith Medical Group',
    faction: 'Faith Medical',
    maid: 'MAID-OR-00000002',
    npcKey: 'ilyra',
    requiredClearance: 1,
    verified: true,
    description: 'Canonical Citizen #2 · Attending physician overseeing Veilwilt & Aura calibration.',
  },
  {
    id: 'dir-julian-vance',
    name: 'Dr. Julian Paul Vance',
    address: 'j.vance@dga.gov',
    category: 'citizen',
    accountType: 'institutional',
    role: 'Lead Forensic Investigator',
    institution: 'DGA / TRACE',
    faction: 'DGA',
    maid: 'MAID-OR-00000003',
    requiredClearance: 1,
    verified: true,
    description: 'Canonical Citizen #3 · Directs TRACE forensic case reviews and DGA evidence verification.',
  },
];

export const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'MSG-001',
    threadId: 'THR-001',
    sender: 'Cyacademy Registration Office',
    senderAddress: 'registrar@cyacademy.edu',
    senderMaid: 'MAID-OR-00000101',
    recipient: 'Player Scholar',
    recipientAddress: 'scholar@cyacademy.edu',
    faction: 'Cyacademy Admin',
    subject: 'Welcome to MIRAVERSEOSX',
    time: '08:00 AM',
    timestamp: '2026-03-06T08:00:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'CYACADEMY-REGISTRAR-SEAL',
    labels: ['Onboarding', 'Academic', 'Official'],
    linkedApp: 'passport',
    attachment: { type: 'credits', amount: 100, name: 'REGISTRATION_CARD.pdf', claimed: false },
    attachments: [
      {
        id: 'att-reg-card',
        name: 'REGISTRATION_CARD.pdf',
        kind: 'record',
        isReward: false,
        type: 'document',
        amount: 0,
        xp: 0,
        claimed: false,
        mockKey: 'dga-registration',
        previewTitle: 'Provisional Scholar Registration Record',
        previewText: 'Official enrollment record linked to MAID-OR-00481926. Opening or saving this file does not grant currency.',
        targetApp: 'docstudio',
        version: 'v1.0-canonical',
        provenance: 'Signed by Cyacademy Registration Office · MAID-OR-00000101',
      },
      {
        id: 'att-reg-grant',
        name: 'ORIENTATION_STIPEND_VOUCHER.grant',
        kind: 'grant',
        isReward: true,
        type: 'credits',
        amount: 100,
        xp: 50,
        claimed: false,
        previewTitle: 'Verified Orientation Stipend Grant (+₡100 / +50 XP)',
        previewText: 'One-time verified institutional arrival stipend issued by the Cyacademy Bursar.',
        provenance: 'Verified Bursar Disbursement #CYA-GRANT-001',
      },
    ],
    body: `Welcome, player.
    
Your provisional Cyacademy registration has been received. Your record currently contains no verified credits, no active contacts, no declared career track, no reputation standing, and no confirmed housing beyond temporary placement.

This is expected. MIRAVERSEOSX begins from a clean state so every player builds their identity through choices, work, study, relationships, and discovery.

Enclosed are two separate items:
1. Your official REGISTRATION_CARD.pdf record (for inspection or archiving in File Explorer / Document Studio).
2. Your one-time verified Orientation Stipend Grant (+₡100 / +50 XP).

Regards,
Registration Office`,
  },
  {
    id: 'MSG-002',
    threadId: 'THR-002',
    sender: 'MIRAVERSEOSX Account Services',
    senderAddress: 'accounts@auremail.aure',
    senderMaid: 'MAID-OR-00000100',
    recipient: 'Player Citizen',
    recipientAddress: 'citizen@auremail.aure',
    faction: 'System Services',
    subject: 'Your Verified Multi-Account AureMail Credentials',
    time: '08:05 AM',
    timestamp: '2026-03-06T08:05:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'MIRAVERSE-CORE-SEAL',
    labels: ['System', 'Accounts'],
    attachment: null,
    attachments: [],
    body: `Your canonical citizen identity (MAID-OR-00481926) has been linked to your verified AureMail accounts:

• Personal: citizen@auremail.aure
• Academic: scholar@cyacademy.edu
• Professional: contractor@worknet.aure
• Institutional Liaison: liaison@dga.gov & intake.fellow@faithmed.aure

You can view all incoming messages in the Combined Inbox, switch to an individual account mailbox, or choose which verified sender address to use when composing or replying.`,
  },
  {
    id: 'MSG-003',
    threadId: 'THR-003',
    sender: 'Cyacademy Residential Services',
    senderAddress: 'housing@cyacademy.edu',
    senderMaid: 'MAID-OR-00000102',
    recipient: 'Player Scholar',
    recipientAddress: 'scholar@cyacademy.edu',
    faction: 'Cyacademy Admin',
    subject: 'Housing Assignment: Unit 4B Access Pending',
    time: '08:10 AM',
    timestamp: '2026-03-06T08:10:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'RESIDENTIAL-SERVICES-SEAL',
    labels: ['Housing', 'Official'],
    linkedApp: 'housing',
    attachment: { type: 'credits', amount: 150, name: 'HOUSING_KEY.ics', claimed: false },
    attachments: [
      {
        id: 'att-housing-key',
        name: 'HOUSING_KEY.ics',
        kind: 'file',
        isReward: false,
        type: 'file',
        amount: 0,
        xp: 0,
        claimed: false,
        previewTitle: 'Unit 4B Digital Access Credential & Lease Schedule',
        previewText: 'Digital keycard schedule for Unit 4B in HOMECRAFT. Inspect or save to your Vault.',
        targetApp: 'housing',
        version: 'v1.0',
        provenance: 'Signed by Cyacademy Residential Services',
      },
      {
        id: 'att-housing-stipend',
        name: 'HOUSING_SETTLEMENT_ALLOWANCE.grant',
        kind: 'grant',
        isReward: true,
        type: 'credits',
        amount: 150,
        xp: 50,
        claimed: false,
        previewTitle: 'Verified Housing Settlement Allowance (+₡150 / +50 XP)',
        previewText: 'One-time verified allowance to assist with initial suite calibration and furnishings.',
        provenance: 'Residential Treasury Disbursement #RES-150',
      },
    ],
    body: `Player has been assigned a starter housing suite (Unit 4B) pending arrival confirmation. 

The suite includes basic sleep access, minimal storage, and default furnishings only. Upgrades, decorations, visitors, and expanded property options must be earned through credits, reputation, permissions, and progression.

Your digital keycard file (HOUSING_KEY.ics) is attached alongside a separate one-time Housing Settlement Allowance.

- Residential Services`,
  },
  {
    id: 'MSG-004',
    threadId: 'THR-004',
    sender: 'Aureline Civic Identity Bureau',
    senderAddress: 'registry@orynvell.gov',
    senderMaid: 'MAID-OR-00000103',
    recipient: 'Player Citizen',
    recipientAddress: 'citizen@auremail.aure',
    faction: 'Civic Bureau',
    subject: 'Aura Passport Activation & Consent Form Required',
    time: '08:15 AM',
    timestamp: '2026-03-06T08:15:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'ORYNVELL-CIVIC-SEAL',
    labels: ['Civic', 'Identity', 'Action Required'],
    linkedApp: 'passport',
    attachment: null,
    attachments: [
      {
        id: 'att-aura-consent',
        name: 'AURA_CONSENT_FORM.osform',
        kind: 'form',
        isReward: false,
        type: 'form',
        amount: 0,
        xp: 0,
        claimed: false,
        requiresFormSubmission: true,
        previewTitle: 'Directive 14-B Biometric & Aura Registry Consent Form',
        previewText: 'Official interactive civic form. Inspect or submit directly to the Aureline Civic Identity Bureau.',
        targetApp: 'passport',
        version: 'v2.4-osform',
        provenance: 'Aureline Civic Identity Bureau · MAID-OR-00000103',
      },
    ],
    body: `Player’s Aura Passport is currently provisional. 

Open Aura Passport or complete and submit the attached AURA_CONSENT_FORM.osform to confirm basic identity fields, student status, and provisional clearance. Per Directive 14-B, opening or filing a civic form is an administrative record action and does not automatically dispense currency.`,
  },
  {
    id: 'MSG-005',
    threadId: 'THR-005',
    sender: 'Faith Medical Group',
    senderAddress: 'intake@faithmed.aure',
    senderMaid: 'MAID-OR-00000104',
    recipient: 'Player Citizen',
    recipientAddress: 'citizen@auremail.aure',
    faction: 'Faith Medical',
    subject: 'Faith Medical Portal Registration & Intake Order',
    time: '08:20 AM',
    timestamp: '2026-03-06T08:20:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'FAITH-MEDICAL-CADUCEUS',
    labels: ['Medical', 'Clinical'],
    linkedApp: 'browser',
    attachment: null,
    attachments: [
      {
        id: 'att-intake-scan',
        name: 'INTAKE_SCAN_REQUEST.pdf',
        kind: 'record',
        isReward: false,
        type: 'document',
        amount: 0,
        xp: 0,
        claimed: false,
        previewTitle: 'Clinical Intake Order & Baseline Aura Chart',
        previewText: 'Clinical referral for Veilwilt screening at Faith Medical Group. Save to Vault or inspect.',
        targetApp: 'browser',
        version: 'v1.2-clinical',
        provenance: 'Dr. Miracle Jerome · Faith Medical Intake (MAID-OR-00000002)',
      },
    ],
    body: `Faith Medical Group has created a basic patient record for player. Initial screening indicates mild environmental Veilwilt exposure requiring a baseline diagnostic scan.

Visit faithmed.aure in Browser or reply to this thread to coordinate with Dr. Miracle Jerome's clinical triage desk. The attached INTAKE_SCAN_REQUEST.pdf is your clinical chart referral.`,
  },
  {
    id: 'MSG-006',
    threadId: 'THR-006',
    sender: 'MIRAVERSEOSX Comms Services',
    senderAddress: 'relay@auremail.aure',
    senderMaid: 'MAID-OR-00000100',
    recipient: 'Player Citizen',
    recipientAddress: 'citizen@auremail.aure',
    faction: 'System Services',
    subject: 'AureMail & Communications Architecture Guide',
    time: '08:25 AM',
    timestamp: '2026-03-06T08:25:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'MIRAVERSE-COMMS-SEAL',
    labels: ['Guide', 'System'],
    linkedApp: 'comms',
    attachment: null,
    attachments: [],
    body: `Welcome to the MIRAVERSEOSX Communications Suite:

• AureMail (Universal Email): Handles all personal, academic, professional, and institutional correspondence across your verified MAID-linked addresses (@auremail.aure, @cyacademy.edu, @worknet.aure, @dga.gov, @faithmed.aure), including threaded conversations, official document filings, and verified disbursements.
• COMMS Portal: Handles real-time OS-native chat rooms, municipal alert feeds, tactical squad channels, and instant direct messaging.
• Mai.space / Pulse: Handles social profiles, public bulletins, friendships, and community reputation.

As you build trust, clearance, and institutional standing, additional contacts in the Universal AureMail Directory will accept direct correspondence.`,
  },
  {
    id: 'MSG-007',
    threadId: 'THR-007',
    sender: 'Cyacademy Student Systems',
    senderAddress: 'systems@cyacademy.edu',
    senderMaid: 'MAID-OR-00000101',
    recipient: 'Player Scholar',
    recipientAddress: 'scholar@cyacademy.edu',
    faction: 'Cyacademy Admin',
    subject: 'Chronicle & Notice Board Access Granted',
    time: '08:30 AM',
    timestamp: '2026-03-06T08:30:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'CYACADEMY-SYSTEMS-SEAL',
    labels: ['Academic', 'Chronicle'],
    linkedApp: 'notice',
    attachment: null,
    attachments: [],
    body: `Player has been granted access to the Chronicle & Notice Board. 

- Tasks are verified daily or institutional to-dos. 
- Quests grant XP, credits, lore, reputation, or items once their underlying world objectives are accomplished. 
- Missions come from WorkNet jobs and career organizations. 
- Adventures are larger multi-stage events or story arcs. 
- The Journey is your ongoing life path across Miraverse.`,
  },
  {
    id: 'MSG-008',
    threadId: 'THR-008',
    sender: 'Dean Cassian Rook',
    senderAddress: 'c.rook@cyacademy.edu',
    senderMaid: 'MAID-OR-00010201',
    recipient: 'Player Scholar',
    recipientAddress: 'scholar@cyacademy.edu',
    faction: 'Cyacademy Faculty',
    subject: 'Orientation Schedule: Day One & Dean’s Fellowship',
    time: '08:35 AM',
    timestamp: '2026-03-06T08:35:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    institutionalSeal: 'DEAN-OF-STUDENTS-SEAL',
    labels: ['Faculty', 'Orientation', 'Official'],
    npcKey: 'rook',
    linkedApp: 'notice',
    attachment: { type: 'credits', amount: 200, name: 'DAY_ONE_SCHEDULE.ics', claimed: false },
    attachments: [
      {
        id: 'att-day-one-schedule',
        name: 'DAY_ONE_SCHEDULE.ics',
        kind: 'file',
        isReward: false,
        type: 'file',
        amount: 0,
        xp: 0,
        claimed: false,
        previewTitle: 'Cyacademy Day One Orientation Syllabus',
        previewText: 'Official orientation itinerary and restricted-zone safety briefing.',
        targetApp: 'docstudio',
        version: 'v1.0',
        provenance: 'Office of Dean Cassian Rook · MAID-OR-00010201',
      },
      {
        id: 'att-dean-fellowship',
        name: 'DEANS_FELLOWSHIP_DISBURSEMENT.payment',
        kind: 'payment',
        isReward: true,
        type: 'credits',
        amount: 200,
        xp: 50,
        claimed: false,
        previewTitle: 'Verified Dean’s Fellowship Disbursement (+₡200 / +50 XP)',
        previewText: 'One-time verified academic fellowship payment authorized by Dean Cassian Rook.',
        provenance: 'Authorized by Dean Cassian Rook · Voucher #ROOK-200',
      },
    ],
    body: `Player, welcome to Cyacademy. 

Your first day is simple: confirm registration, activate Aura Passport, check your housing assignment, review the Notice Board, and attend orientation. 

Do not enter restricted areas. Do not attempt to access the Old Factory Ward. If the operating system behaves strangely, reply directly to my office or report the incident to DGAOS before investigating alone.

I have attached your Day One Orientation Schedule alongside your verified Dean's Fellowship Disbursement.

- Cassian Rook
Dean of Students`,
  },
  {
    id: 'MSG-009',
    threadId: 'THR-009',
    sender: 'Aelita Schaeffer',
    senderAddress: 'aelita.s@cyacademy.edu',
    senderMaid: 'MAID-OR-00010203',
    recipient: 'Player Citizen',
    recipientAddress: 'citizen@auremail.aure',
    faction: 'Cyacademy Admin',
    subject: 'Subterranean Lab Harmonic Readings',
    time: '09:10 AM',
    timestamp: '2026-03-06T09:10:00.000Z',
    read: false,
    folder: 'inbox',
    deliveryStatus: 'delivered',
    verifiedSender: true,
    labels: ['Personal', 'Research', 'Story'],
    npcKey: 'aelita',
    linkedApp: 'spellforge',
    attachment: null,
    attachments: [
      {
        id: 'att-harmonic-log',
        name: 'VEIL_HARMONIC_TRACE_04.log',
        kind: 'file',
        isReward: false,
        type: 'file',
        amount: 0,
        xp: 0,
        claimed: false,
        previewTitle: 'Sub-Conduit Harmonic Waveform Log #04',
        previewText: 'Captured 88.2 MHz resonance trace from the subterranean lab. Save to File Explorer for analysis.',
        targetApp: 'files',
        version: 'v1.1-trace',
        provenance: 'Aelita Schaeffer · MAID-OR-00010203',
      },
    ],
    body: `Hey! I noticed your AureMail relay just came online.

Jeremie and I captured an unusual 88.2 MHz resonance trace near Lab 4 this morning. I attached the raw waveform log (VEIL_HARMONIC_TRACE_04.log) so you can inspect it or save it to your File Explorer vault.

Reply to this email whenever you have a moment—let me know if you want to cross-check it with Dr. Voss or test a filter in SpellForge!

— Aelita`,
  },
];

export const INITIAL_SHADOWCHAT_FEED: ShadowChatItem[] = [
  { id: 1, user: 'Phantom', team: 'Drifters', text: 'Syndicate patrol spotted near Sector 4 dead drop.', time: '10:01 AM' },
  { id: 2, user: 'NetRunner_X', team: 'Independent', text: 'Anyone got the decryption key for Voss Institute node 3?', time: '10:04 AM' },
  { id: 3, user: 'Drift', team: 'Drifters', text: 'Key posted in dead drop MSG-002. Keep it quiet.', time: '10:05 AM' },
];
