import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import mailData from '../data/emails.json';
import { INITIAL_SHADOWCHAT_FEED } from '../data/commsData';

// Normalized Comms data with local persistence
export const useCommsStore = create(
  persist(
    (set, get) => ({
      // Email
      emails: mailData,

      // Channels and Directs (Clean names without hashtags)
      channels: [
        { id: 'secure-relay', name: 'Shadow Relay', team: 'Ops' },
        { id: 'briefings', name: 'Faculty Briefings', team: 'Faculty' },
        { id: 'dga-ops', name: 'DGA Ops', team: 'Agency' },
        { id: 'cyacademy-core', name: 'Cyacademy Core', team: 'Students' },
      ],
      directs: [
        { id: 'dm:voss', name: 'Dr. Voss' },
        { id: 'dm:riven', name: 'Riven' },
        { id: 'dm:odd', name: 'Odd' },
      ],

      messages: {
        'secure-relay': INITIAL_SHADOWCHAT_FEED,
        'briefings': [
          { id: 'b-1', user: 'Dean Rook', team: 'Faculty', text: 'Orientation block begins at 20:00 sharp.', time: '08:40 AM' },
        ],
        'dga-ops': [
          { id: 'd-1', user: 'Mara Quell', team: 'Agency', text: 'Ops window: verify Sector 7 nodes. Squad of four.', time: '09:10 AM' },
        ],
        'cyacademy-core': [
          { id: 'c-1', user: 'Aelita', team: 'Students', text: 'Notice any energy fluctuations near Lab 4?', time: '09:15 AM' }
        ],
        'dm:voss': [ { id: 'dmv-1', user: 'Dr. Voss', team: 'Direct', text: 'Keep your relay sanitized. Report any PRISM anomalies immediately.', time: '09:22 AM' } ],
        'dm:riven': [ { id: 'dmr-1', user: 'Riven', team: 'Direct', text: 'Got a shortcut to the factory? Meet near Block C stairs.', time: '09:05 AM' } ],
        'dm:odd': [ { id: 'dmo-1', user: 'Odd', team: 'Direct', text: 'Heard a rumor: cafeteria pie heals +5 aura. Scientific.', time: '08:55 AM' } ],
      },

      addChatMessage: (key, entry) => {
        const current = get().messages[key] || [];
        set({ messages: { ...get().messages, [key]: [...current, entry] } });
      },

      addEmail: (email) => {
        const current = get().emails || [];
        set({ emails: [...current, email] });
      },
    }),
    { name: 'miraverse-comms' }
  )
);
