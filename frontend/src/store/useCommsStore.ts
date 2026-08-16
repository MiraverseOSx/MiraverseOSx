import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Email inbox — will be populated from DataGrip SQLite pipeline (miraverse.db → Emails table).
const mailData: any[] = [];

export interface ChannelItem {
  id: string;
  name: string;
  readOnly?: boolean;
  desc?: string;
  npcKey?: string;
  title?: string;
  req?: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  team: string;
  text: string;
  time: string;
}

export interface CommsState {
  emails: any[];
  tier0Channels: ChannelItem[];
  tier1Channels: ChannelItem[];
  tier2Channels: ChannelItem[];
  directs: ChannelItem[];
  lockedChannels: ChannelItem[];
  corruptedChannels: string[];
  investigationFlags: number;
  encryptionActive: boolean;
  messages: Record<string, ChatMessage[]>;

  addChatMessage: (key: string, entry: ChatMessage) => void;
  addEmail: (email: any) => void;
  toggleEncryption: () => void;
  incrementInvestigationFlags: () => void;
  purgeChannelCorruption: (channelId: string) => void;
}

export const useCommsStore = create<CommsState>()(
  persist(
    (set, get) => ({
      // Email Dispatches — awaiting DataGrip seed
      emails: mailData,

      // ── Comms Portal Channel Tiers ──
      // Tier 0: System & Civic Alerts (Read-only broadcasts)
      tier0Channels: [
        { id: 'city-alerts', name: 'Municipal Hazards & Curfew', readOnly: true, desc: 'City-wide broadcast feed for curfews and hazard warnings.' },
        { id: 'dga-bulletins', name: 'DGA Security Bulletins', readOnly: true, desc: 'Official DGA surveillance and enforcement broadcasts.' }
      ],

      // Tier 1: District & Faction Rooms (Unlocked via reputation/tasks)
      tier1Channels: [
        { id: 'glassline-district', name: 'Glassline Resident Hub', desc: 'Civic forum for Glassline District residents.' },
        { id: 'cyacademy-core', name: 'Cyacademy Labs & Core', desc: 'Student discussion channel for tech & lab studies.' },
        { id: 'faith-medical-hub', name: 'Faith Medical Triage Network', desc: 'Patient telemetry and intake discussion.' }
      ],

      // Tier 2: Squad & Quest Coordination (Tactical mission channels)
      tier2Channels: [
        { id: 'squad-ops-ironspire', name: 'Operation Ironspire Squad', desc: 'Tactical channel for Commander Halvorn intel heist.' },
        { id: 'subconduit-sweep', name: 'Sub-Conduit Patrol Group', desc: 'Temporary network sweep channel for DGA ops.' }
      ],

      // Tier 3: Direct Citizen Links (1-on-1 NPC Affinity chats)
      directs: [
        { id: 'dm:voss', name: 'Dr. Voss', npcKey: 'voss', title: 'Cyacademy Senior Researcher' },
        { id: 'dm:riven', name: 'Riven', npcKey: 'riven', title: 'Netrunner Specialist' },
        { id: 'dm:odd', name: 'Odd', npcKey: 'odd', title: 'Student Tactician' },
        { id: 'dm:aelita', name: 'Aelita', npcKey: 'aelita', title: 'Core Specialist' },
        { id: 'dm:jeremie', name: 'Jeremie', npcKey: 'jeremie', title: 'Systems Engineer' }
      ],

      // Grayed-Out Teasers (Locked Channels)
      lockedChannels: [
        { id: 'lock:black-market', name: 'Black Market Underground Relay', req: 'ACCESS DENIED: INSUFFICIENT CITIZEN TIER' },
        { id: 'lock:high-command', name: 'DGA High Command Subnet', req: 'ACCESS DENIED: LEVEL 3 OS CLEARANCE REQUIRED' },
        { id: 'lock:factory-ward', name: 'Old Factory Ward Bleed Channel', req: 'ACCESS DENIED: VEILWILT RESISTANCE REQUIRED' },
        { id: 'lock:oracle-main', name: 'ORACLE-9 Mainframe Core', req: 'ACCESS DENIED: REPUTATION TIER TOO LOW' }
      ],

      // Channel States (Corruption, Encryption, Investigation)
      corruptedChannels: ['glassline-district'],
      investigationFlags: 0,
      encryptionActive: false,

      // Initial Messages Feed
      messages: {
        'city-alerts': [
          { id: 'ca-1', user: 'Municipal Warden', team: 'System', text: 'NOTICE: Sector 4 curfew active from 22:00 to 06:00. Maintain citizen clearance.', time: '08:00 AM' }
        ],
        'dga-bulletins': [
          { id: 'db-1', user: 'Director Vane', team: 'DGA', text: 'BULLETIN: Unregistered encrypted packets detected in Sub-Aureline. DGA wardens active.', time: '08:15 AM' }
        ],
        'glassline-district': [
          { id: 'gl-1', user: 'Resident-99', team: 'Citizen', text: 'D̶a̶t̶a̶ ̶b̶l̶e̶e̶d̶ detected near tram corridor! System noise glitching feeds.', time: '08:30 AM' }
        ],
        'cyacademy-core': [
          { id: 'c-1', user: 'Aelita', team: 'Students', text: 'Notice any energy fluctuations near Lab 4?', time: '09:15 AM' }
        ],
        'faith-medical-hub': [
          { id: 'fm-1', user: 'Dr. Ilyra Saint', team: 'Medical', text: 'Intake patients experiencing Veilwilt: report to Marlowe Springs immediately.', time: '08:45 AM' }
        ],
        'squad-ops-ironspire': [
          { id: 'so-1', user: 'Drift', team: 'Tactical', text: 'Squad ready for Ironspire intel extraction. Keep channel clear of warden bots.', time: '09:00 AM' }
        ],
        'subconduit-sweep': [
          { id: 'sc-1', user: 'Agent Vance', team: 'DGA', text: 'Sweeping conduit gateways. Report unauthorized PRISM signatures.', time: '09:05 AM' }
        ],
        'dm:voss': [ { id: 'dmv-1', user: 'Dr. Voss', team: 'Direct', text: 'Keep your relay sanitized. Report any PRISM anomalies immediately.', time: '09:22 AM' } ],
        'dm:riven': [ { id: 'dmr-1', user: 'Riven', team: 'Direct', text: 'Got a shortcut to the factory? Meet near Block C stairs.', time: '09:05 AM' } ],
        'dm:odd': [ { id: 'dmo-1', user: 'Odd', team: 'Direct', text: 'Heard a rumor: cafeteria pie heals +5 aura. Scientific.', time: '08:55 AM' } ],
        'dm:aelita': [ { id: 'dma-1', user: 'Aelita', team: 'Direct', text: 'I found a strange frequency trace in the subterranean lab. Can you analyze it?', time: '09:12 AM' } ],
        'dm:jeremie': [ { id: 'dmj-1', user: 'Jeremie', team: 'Direct', text: 'System diagnostics look stable for now. Let me know if you need code patches.', time: '09:18 AM' } ]
      },

      addChatMessage: (key, entry) => {
        const current = get().messages[key] || [];
        set({ messages: { ...get().messages, [key]: [...current, entry] } });
      },

      addEmail: (email) => {
        const current = get().emails || [];
        set({ emails: [...current, email] });
      },

      toggleEncryption: () => set((s) => ({ encryptionActive: !s.encryptionActive })),

      incrementInvestigationFlags: () => set((s) => ({ investigationFlags: s.investigationFlags + 1 })),

      purgeChannelCorruption: (channelId) => set((s) => ({
        corruptedChannels: s.corruptedChannels.filter((c) => c !== channelId)
      }))
    }),
    { name: 'miraverse-comms' }
  )
);
