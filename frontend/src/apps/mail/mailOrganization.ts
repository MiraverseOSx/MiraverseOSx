import type { EmailItem } from '../../data/commsData';

export interface PersonalContact { id: string; name: string; address: string; groups: string[] }
export interface MailRule { id: string; field: 'sender' | 'subject'; contains: string; action: 'archive' | 'spam' | 'label'; label: string }
export interface MailMeta { spam?: boolean; snoozedUntil?: number; folder?: string; labels?: string[] }
export interface MailOrganization {
  contacts: PersonalContact[]; groups: string[]; labels: string[]; folders: string[];
  metadata: Record<string, MailMeta>; processedIds: string[];
  settings: { density: 'comfortable' | 'compact'; signature: string; autoRead: boolean; conversations: boolean };
  rules: MailRule[];
}
const names = (value: unknown): string[] => Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map(item => item.trim().slice(0, 40)))].slice(0, 32) : [];
export const emptyMailOrganization = (): MailOrganization => ({ contacts: [], groups: [], labels: [], folders: [], metadata: {}, processedIds: [], settings: { density: 'comfortable', signature: '', autoRead: true, conversations: true }, rules: [] });
export function restoreMailOrganization(value: unknown): MailOrganization {
  const result = emptyMailOrganization();
  if (!value || typeof value !== 'object') return result;
  const input = value as Partial<MailOrganization>;
  result.groups = names(input.groups); result.labels = names(input.labels); result.folders = names(input.folders);
  const addresses = new Set<string>();
  if (Array.isArray(input.contacts)) for (const contact of input.contacts) {
    if (!contact || typeof contact.id !== 'string' || typeof contact.name !== 'string' || typeof contact.address !== 'string') continue;
    const address = contact.address.trim().toLowerCase();
    if (!contact.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || addresses.has(address) || result.contacts.some(item => item.id === contact.id)) continue;
    addresses.add(address); result.contacts.push({ id: contact.id, name: contact.name.trim().slice(0, 80), address: address.slice(0, 254), groups: names(contact.groups).filter(group => result.groups.includes(group)) });
  }
  for (const [id, meta] of Object.entries(input.metadata || {})) {
    if (!meta || typeof meta !== 'object' || ['__proto__', 'constructor', 'prototype'].includes(id)) continue;
    result.metadata[id] = { spam: meta.spam === true, snoozedUntil: Number.isFinite(meta.snoozedUntil) ? meta.snoozedUntil : undefined, folder: result.folders.includes(meta.folder || '') ? meta.folder : undefined, labels: names(meta.labels).filter(label => result.labels.includes(label)) };
  }
  result.processedIds = Array.isArray(input.processedIds) ? [...new Set(input.processedIds.filter(id => typeof id === 'string'))] : [];
  const settings = input.settings;
  if (settings && typeof settings === 'object') result.settings = { density: settings.density === 'compact' ? 'compact' : 'comfortable', signature: typeof settings.signature === 'string' ? settings.signature.slice(0, 2000) : '', autoRead: settings.autoRead !== false, conversations: settings.conversations !== false };
  if (Array.isArray(input.rules)) result.rules = input.rules.filter(rule => rule && typeof rule.id === 'string' && ['sender', 'subject'].includes(rule.field) && typeof rule.contains === 'string' && rule.contains.trim() && ['archive', 'spam', 'label'].includes(rule.action)).map(rule => ({ id: rule.id, field: rule.field, contains: rule.contains.slice(0, 100), action: rule.action, label: typeof rule.label === 'string' && result.labels.includes(rule.label) ? rule.label : '' })).filter(rule => rule.action !== 'label' || rule.label).slice(0, 32);
  return result;
}
export function isSnoozed(meta: MailMeta | undefined, now = Date.now()) { return (meta?.snoozedUntil || 0) > now; }
export function groupConversations(emails: EmailItem[], enabled = true): EmailItem[] {
  const seen = new Set<string>();
  return emails.filter(mail => { const key = enabled ? mail.threadId || mail.id : mail.id; if (seen.has(key)) return false; seen.add(key); return true; });
}
export interface MailOrganizationActions {
  mailOrganization: MailOrganization;
  updateMailOrganization: (change: (value: MailOrganization) => MailOrganization) => void;
  organizeMail: (ids: string[], action: 'spam' | 'not-spam' | 'snooze' | 'folder' | 'label', value?: string | number) => void;
  savePersonalContact: (contact: Partial<PersonalContact>) => { ok: boolean; message: string };
  deletePersonalContact: (id: string) => void;
  processMailRules: (all?: boolean) => void;
}
export function createMailOrganizationActions(set: any, get: any): MailOrganizationActions {
  return {
    mailOrganization: emptyMailOrganization(),
    updateMailOrganization: change => set((state: any) => ({ mailOrganization: restoreMailOrganization(change(state.mailOrganization)) })),
    organizeMail: (ids, action, value) => set((state: any) => {
      const org: MailOrganization = state.mailOrganization; const metadata = { ...org.metadata };
      const validIds = ids.filter(id => state.emails.some((mail: EmailItem) => mail.id === id));
      for (const id of validIds) {
        const meta = { ...metadata[id] };
        if (action === 'spam' || action === 'not-spam') meta.spam = action === 'spam';
        if (action === 'snooze' && typeof value === 'number' && Number.isFinite(value)) meta.snoozedUntil = value;
        if (action === 'folder' && typeof value === 'string' && (value === '' || org.folders.includes(value))) { meta.folder = value || undefined; meta.spam = false; meta.snoozedUntil = undefined; }
        if (action === 'label' && typeof value === 'string' && org.labels.includes(value)) meta.labels = meta.labels?.includes(value) ? meta.labels.filter(label => label !== value) : [...(meta.labels || []), value];
        metadata[id] = meta;
      }
      return { mailOrganization: { ...org, metadata }, ...(action === 'folder' ? { archivedEmailIds: state.archivedEmailIds.filter((id: string) => !validIds.includes(id)), trashedEmailIds: state.trashedEmailIds.filter((id: string) => !validIds.includes(id)), emails: state.emails.map((mail: EmailItem) => validIds.includes(mail.id) ? { ...mail, folder: 'inbox' } : mail) } : {}) };
    }),
    savePersonalContact: contact => {
      const org: MailOrganization = get().mailOrganization;
      const name = contact.name?.trim(); const address = contact.address?.trim().toLowerCase();
      if (!name || !address || name.length > 80 || address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return { ok: false, message: 'Enter a name and a valid email address.' };
      if (org.contacts.some(item => item.address === address && item.id !== contact.id)) return { ok: false, message: 'This email address is already in your contacts.' };
      if (contact.id && !org.contacts.some(item => item.id === contact.id)) return { ok: false, message: 'Contact not found.' };
      const saved = { id: contact.id || `contact-${crypto.randomUUID()}`, name, address, groups: names(contact.groups).filter(group => org.groups.includes(group)) };
      set({ mailOrganization: { ...org, contacts: [...org.contacts.filter(item => item.id !== saved.id), saved] } });
      return { ok: true, message: 'Contact saved.' };
    },
    deletePersonalContact: id => set((state: any) => ({ mailOrganization: { ...state.mailOrganization, contacts: state.mailOrganization.contacts.filter((contact: PersonalContact) => contact.id !== id) } })),
    processMailRules: (all = false) => set((state: any) => {
      const org: MailOrganization = state.mailOrganization;
      const pending = state.emails.filter((mail: EmailItem) => all || !org.processedIds.includes(mail.id));
      if (!pending.length) return state;
      const metadata = { ...org.metadata }; const archived = new Set<string>(state.archivedEmailIds);
      for (const mail of pending) {
        if (mail.folder === 'sent' || mail.folder === 'outbox' || state.trashedEmailIds.includes(mail.id)) continue;
        for (const rule of org.rules) {
          if (!(rule.field === 'sender' ? `${mail.sender} ${mail.senderAddress || ''}` : mail.subject).toLowerCase().includes(rule.contains.toLowerCase())) continue;
          const meta = { ...metadata[mail.id] };
          if (rule.action === 'archive') archived.add(mail.id);
          if (rule.action === 'spam') meta.spam = true;
          if (rule.action === 'label') meta.labels = [...new Set([...(meta.labels || []), rule.label])];
          metadata[mail.id] = meta;
        }
      }
      return { archivedEmailIds: [...archived], mailOrganization: { ...org, metadata, processedIds: [...new Set([...org.processedIds, ...pending.map((mail: EmailItem) => mail.id)])] } };
    }),
  };
}
