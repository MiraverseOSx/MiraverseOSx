import { INITIAL_SMS_THREADS, type SmsMessage } from '../data/phoneData';
export const LEGACY_DIRECT_CONTACTS: Record<string, string> = {
  'dm:voss': 'Dr. Voss', 'dm:riven': 'Riven', 'dm:odd': 'Odd', 'dm:aelita': 'Aelita', 'dm:jeremie': 'Jeremie',
};
export const SOCIAL_PHONE_CONTACTS: Record<string, string> = { jeremie: 'Jeremie', aelita: 'Aelita', sissi: 'Sissi', odd: 'Odd', voss: 'Dr. Voss', riven: 'Riven', mara: 'Mara', rowan: 'Rowan' };
export function personalThreadAccess(player: any, contact: string) {
  const id = Object.keys(SOCIAL_PHONE_CONTACTS).find(id => SOCIAL_PHONE_CONTACTS[id] === contact);
  return !id || !player?.maiSpaceWorld?.blocked?.includes(id);
}
export function restorePhoneThreads(saved: unknown, legacy: Record<string, unknown> = {}): Record<string, SmsMessage[]> {
  legacy = legacy && typeof legacy === 'object' ? legacy : {};
  const threads: Record<string, SmsMessage[]> = {};
  const source = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : INITIAL_SMS_THREADS;
  for (const [contact, entries] of Object.entries(source)) {
    if (['__proto__', 'constructor', 'prototype'].includes(contact) || !Array.isArray(entries)) continue;
    threads[contact] = entries.filter(entry => entry && ['string', 'number'].includes(typeof entry.id) && typeof entry.text === 'string' && typeof entry.sender === 'string' && typeof entry.time === 'string').map(entry => ({ ...entry }));
  }
  for (const [channel, contact] of Object.entries(LEGACY_DIRECT_CONTACTS)) {
    if (!Array.isArray(legacy[channel])) continue;
    const existing = threads[contact] || [];
    const ids = new Set(existing.map(entry => entry.id));
    for (const entry of legacy[channel] as any[]) {
      if (!entry || !['string', 'number'].includes(typeof entry.id) || typeof entry.user !== 'string' || typeof entry.text !== 'string') continue;
      const id = `comms:${channel}:${entry.id}`;
      if (!ids.has(id)) { existing.push({ id, sender: entry.user, text: entry.text, time: typeof entry.time === 'string' ? entry.time : '' }); ids.add(id); }
    }
    threads[contact] = existing;
  }
  return threads;
}
