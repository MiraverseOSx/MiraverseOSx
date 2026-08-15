// Seed data for Comms in TypeScript format.

export interface EmailItem {
  id: string;
  sender: string;
  faction: string;
  subject: string;
  time: string;
  read: boolean;
  attachment: { type: string; amount: number; name: string; claimed: boolean } | null;
  body: string;
}

export interface ShadowChatItem {
  id: number;
  user: string;
  team: string;
  text: string;
  time: string;
}

export const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'MSG-001',
    sender: 'Cyacademy Registration Office',
    faction: 'Cyacademy Admin',
    subject: 'Welcome to MIRAVERSEOSX',
    time: '08:00 AM',
    read: false,
    attachment: { type: 'credits', amount: 100, name: 'REGISTRATION_CARD.pdf', claimed: false },
    body: `Welcome, player.
    
Your provisional Cyacademy registration has been received. Your record currently contains no verified credits, no active contacts, no declared career track, no reputation standing, and no confirmed housing beyond temporary placement.

This is expected. MIRAVERSEOSX begins from a clean state so every player builds their identity through choices, work, study, relationships, and discovery.

Regards,
Registration Office`,
  },
  {
    id: 'MSG-002',
    sender: 'MIRAVERSEOSX Account Services',
    faction: 'System Services',
    subject: 'Your Temporary Login Credentials',
    time: '08:05 AM',
    read: false,
    attachment: null,
    body: `Temporary access has been generated for player.
    
Initial permissions include Mail, File Explorer, Settings, and limited desktop navigation. 

Additional applications, folders, websites, and communication channels will unlock as player completes orientation tasks and earns system trust.`,
  },
  {
    id: 'MSG-003',
    sender: 'Cyacademy Residential Services',
    faction: 'Cyacademy Admin',
    subject: 'Housing Assignment: Dorm Access Pending',
    time: '08:10 AM',
    read: false,
    attachment: { type: 'credits', amount: 150, name: 'DORM_KEY.ics', claimed: false },
    body: `Player has been assigned a starter dorm room pending arrival confirmation. 

The room includes basic sleep access, minimal storage, and default furnishings only. Upgrades, decorations, visitors, and expanded property options must be earned through credits, reputation, permissions, and progression.

- Residential Services`,
  },
  {
    id: 'MSG-004',
    sender: 'Aureline Civic Identity Bureau',
    faction: 'Civic Bureau',
    subject: 'Aura Passport Activation Required',
    time: '08:15 AM',
    read: false,
    attachment: { type: 'credits', amount: 50, name: 'AURA_CONSENT_FORM.pdf', claimed: false },
    body: `Player’s Aura Passport is currently inactive. 

Open Aura Passport to confirm basic identity fields, student status, and provisional clearance. Aura records, reputation standings, medical history, property records, and restricted lineage fields will remain blank until verified through gameplay.`,
  },
  {
    id: 'MSG-005',
    sender: 'Faith Medical Group',
    faction: 'Faith Medical',
    subject: 'Faith Medical Portal Registration',
    time: '08:20 AM',
    read: false,
    attachment: { type: 'credits', amount: 100, name: 'INTAKE_SCAN_REQUEST.pdf', claimed: false },
    body: `Faith Medical Group has created a basic patient record for player. No diagnostics are currently on file. 

Visit faithmed.aure in Browser to review the patient portal, schedule an intake scan, and activate aura health tracking. Some records may remain restricted until proper clearance is granted.`,
  },
  {
    id: 'MSG-006',
    sender: 'MIRAVERSEOSX Comms Services',
    faction: 'System Services',
    subject: 'Communications Setup Notice',
    time: '08:25 AM',
    read: false,
    attachment: null,
    body: `Player currently has no saved contacts. 

- Phone handles calls, texts, voicemail, contacts, and emergencies. 
- Comms handles OS-native direct messages, group channels, system alerts, and encrypted rooms. 
- Mail handles official messages and records. 
- ChatMeet handles scheduled calls and meetings. 
- Pulse handles public posts and reputation. 

Communication access expands as player meets people and earns trust.`,
  },
  {
    id: 'MSG-007',
    sender: 'Cyacademy Student Systems',
    faction: 'Cyacademy Admin',
    subject: 'Notice Board Access Granted',
    time: '08:30 AM',
    read: false,
    attachment: null,
    body: `Player has been granted access to the Notice Board. 

- Tasks are small to-dos. 
- Quests grant XP, credits, lore, reputation, or items. 
- Missions come from jobs and career organizations. 
- Adventures are larger events or arcs. 
- The Journey is the ongoing life path and does not end permanently.`,
  },
  {
    id: 'MSG-008',
    sender: 'Dean Cassian Rook',
    faction: 'Cyacademy Faculty',
    subject: 'Orientation Schedule: Day One',
    time: '08:35 AM',
    read: false,
    attachment: { type: 'credits', amount: 200, name: 'DAY_ONE_SCHEDULE.ics', claimed: false },
    body: `Player, welcome to Cyacademy. 

Your first day is simple: confirm registration, activate Aura Passport, check your dorm assignment, review the Notice Board, and attend orientation. 

Do not enter restricted areas. Do not attempt to access the Old Factory Ward. If the operating system behaves strangely, report the incident before investigating alone.

- Cassian Rook
Dean of Students`,
  },
];

export const INITIAL_SHADOWCHAT_FEED: ShadowChatItem[] = [
  { id: 1, user: 'Phantom', team: 'Drifters', text: 'Syndicate patrol spotted near Sector 4 dead drop.', time: '10:01 AM' },
  { id: 2, user: 'NetRunner_X', team: 'Independent', text: 'Anyone got the decryption key for Voss Institute node 3?', time: '10:04 AM' },
  { id: 3, user: 'Drift', team: 'Drifters', text: 'Key posted in dead drop MSG-002. Keep it quiet.', time: '10:05 AM' },
];
