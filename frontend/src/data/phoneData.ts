// Initial phone data structures extracted from PhoneWidget.js

export interface SmsMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
}

export interface Voicemail {
  id: number;
  sender: string;
  duration: string;
  time: string;
  text: string;
}

export interface EvidenceItem {
  id: number;
  title: string;
  type: string;
  tag: string;
  note: string;
}

export const INITIAL_SMS_THREADS: Record<string, SmsMessage[]> = {
  'Aelita': [
    { id: 1, sender: 'Aelita', text: 'I felt a sudden shift in the Veil near the Supercomputer vault...', time: '09:15' },
  ],
  'Jeremie': [
    { id: 2, sender: 'Jeremie', text: 'I updated the Process Monitor logs. Keep an eye on PRISM memory spikes.', time: '09:05' },
  ],
  'Dr. Voss': [
    { id: 3, sender: 'Dr. Voss', text: 'Student, verify your Aethercore frequency before Lab 4.', time: '09:12' },
  ],
  'Odd': [
    { id: 4, sender: 'Odd', text: 'Got the laser arrow rig reloaded for the twilight drill!', time: '09:10' },
  ],
  'Yumi': [
    { id: 5, sender: 'Yumi', text: 'Sector 7 looks clear, but stay alert. The DGA is monitoring the perimeter.', time: '08:55' },
  ],
  'Ulrich': [
    { id: 6, sender: 'Ulrich', text: 'Training grounds are open if you want to spar before class.', time: '08:40' },
  ],
  'Sissi': [
    { id: 7, sender: 'Sissi', text: 'House Vector dusk briefing at 20:00. Don’t be late.', time: '09:02' },
  ],
  'Nerya': [
    { id: 8, sender: 'Nerya', text: 'Your aura frequency bears a distinct celestial mark... we should speak.', time: '08:30' },
  ],
  'Null Cantor': [
    { id: 9, sender: 'Null Cantor', text: '[CORRUPTED SIGNAL]: The Purge was not the end. The Veil is waiting.', time: '03:14' },
  ],
};

export const INITIAL_VOICEMAILS: Voicemail[] = [
  { id: 1, sender: 'Dean Cassian Rook', duration: '0:42', time: '08:30 AM', text: 'Player, orientation requires your verified Aura Passport stamp.' },
  { id: 2, sender: 'Unknown Number', duration: '0:18', time: '09:05 AM', text: '[ENCRYPTED VOICEMAIL]: Old Factory Ward lower floor has active data bleed.' },
];

export const INITIAL_EVIDENCE_ITEMS: EvidenceItem[] = [
  { id: 1, title: 'Sector 7 Data Bleed', type: 'photo', tag: 'DGA Breach', note: 'Unregistered frequency recorded near dead drop.' },
  { id: 2, title: 'Purge Genealogy Fragment', type: 'document', tag: 'Archivist Record', note: 'Lineage key matches Seraphima mark.' },
];
