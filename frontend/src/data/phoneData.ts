import { getProfile as phone_contactProfile } from '../game-content/characters/collections/phone-contact';
// Initial phone data structures extracted from PhoneWidget.js

export interface SmsMessage {
  id: number | string;
  sender: string;
  text: string;
  time: string;
  source?: 'phone' | 'mai.space';
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
  'Aelita': phone_contactProfile("Aelita"),
  'Jeremie': phone_contactProfile("Jeremie"),
  'Dr. Voss': phone_contactProfile("Dr. Voss"),
  'Odd': phone_contactProfile("Odd"),
  'Yumi': phone_contactProfile("Yumi"),
  'Ulrich': phone_contactProfile("Ulrich"),
  'Sissi': phone_contactProfile("Sissi"),
  'Nerya': phone_contactProfile("Nerya"),
  'Null Cantor': phone_contactProfile("Null Cantor"),
};

export const INITIAL_VOICEMAILS: Voicemail[] = [
  { id: 1, sender: 'Dean Cassian Rook', duration: '0:42', time: '08:30 AM', text: 'Player, orientation requires your verified Aura Passport stamp.' },
  { id: 2, sender: 'Unknown Number', duration: '0:18', time: '09:05 AM', text: '[ENCRYPTED VOICEMAIL]: Old Factory Ward lower floor has active data bleed.' },
];

export const INITIAL_EVIDENCE_ITEMS: EvidenceItem[] = [
  { id: 1, title: 'Sector 7 Data Bleed', type: 'photo', tag: 'DGA Breach', note: 'Unregistered frequency recorded near dead drop.' },
  { id: 2, title: 'Purge Genealogy Fragment', type: 'document', tag: 'Archivist Record', note: 'Lineage key matches Seraphima mark.' },
];
