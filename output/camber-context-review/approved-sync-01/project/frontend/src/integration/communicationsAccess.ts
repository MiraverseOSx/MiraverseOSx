import type { AureMailAccount } from '../data/commsData';

export const ORGANIZATIONS = [
  { id: 'cyacademy', name: 'Cyacademy', domain: 'cyacademy.edu', type: 'academic' },
  { id: 'dga', name: 'Department of Global Affairs', domain: 'dga.gov', type: 'institutional' },
  { id: 'medical', name: 'Faith Medical Group', domain: 'faithmed.aure', type: 'institutional' },
  { id: 'archivist', name: 'Royal Archives', domain: 'archives.orynvell.gov', type: 'work' },
  { id: 'finance', name: 'Oryn Treasury', domain: 'finance.oryn.gov', type: 'work' },
  { id: 'engineer', name: 'Systems Engineering', domain: 'worknet.aure', type: 'work' },
  { id: 'diplomat', name: 'Civic Administration', domain: 'worknet.aure', type: 'work' },
  { id: 'warden', name: 'Arcadia Reserve', domain: 'worknet.aure', type: 'work' },
  { id: 'artist', name: 'Cultural Studio', domain: 'worknet.aure', type: 'work' },
] as const;
export type OrganizationId = typeof ORGANIZATIONS[number]['id'];
export interface OrganizationMembership { status: 'active' | 'suspended' | 'revoked'; issuedAt: string; issuedBy: string; via?: 'admin' | 'invitation' | 'self_left' }
export interface OrganizationInvitation {
  id: string;
  organizationId: OrganizationId;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  invitedAt: string;
  invitedBy: string;
  note?: string;
  respondedAt?: string;
}
export const organization = (id: unknown) => ORGANIZATIONS.find(item => item.id === id);
export function membershipSource(player: any, id: string): 'issued' | 'employment' | null {
  if (!organization(id)) return null;
  const explicit = player?.organizationMemberships?.[id];
  if (explicit) return explicit.status === 'active' ? 'issued' : null;
  const contract = player?.employmentContracts?.[id];
  return contract?.id === `EMP:${id}` && contract.track === id ? 'employment' : null;
}
export function invitationForOrganization(player: any, id: string): OrganizationInvitation | null {
  if (!organization(id)) return null;
  const invite = player?.organizationInvitations?.[id];
  if (!invite || typeof invite !== 'object' || invite.organizationId !== id) return null;
  if (!['pending', 'accepted', 'declined', 'revoked'].includes(invite.status)) return null;
  return invite as OrganizationInvitation;
}
export function canAcceptInvitation(player: any, id: string): boolean {
  const invite = invitationForOrganization(player, id);
  return Boolean(invite && invite.status === 'pending');
}
export const CHANNEL_ORGANIZATIONS: Record<string, string | null> = {
  'city-alerts': null,
  'dga-bulletins': null,
  'glassline-district': null,
  'cyacademy-core': 'cyacademy',
  'faith-medical-hub': 'medical',
  'squad-ops-ironspire': 'dga',
  'subconduit-sweep': 'dga',
  'royal-archives-desk': 'archivist',
  'oryn-treasury-ledger': 'finance',
  'worknet-engineering-grid': 'engineer',
  'civic-council-chambers': 'diplomat',
  'arcadia-reserve-watch': 'warden',
  'cultural-studio-stage': 'artist',
};
export function channelAccess(player: any, id: string): boolean {
  if (!Object.hasOwn(CHANNEL_ORGANIZATIONS, id)) return false;
  const required = CHANNEL_ORGANIZATIONS[id];
  return !required || Boolean(membershipSource(player, required));
}
export function channelOrganization(id: string): string | undefined {
  return organization(CHANNEL_ORGANIZATIONS[id])?.name;
}
export function channelsForOrganization(orgId: string): string[] {
  if (!organization(orgId)) return [];
  return Object.entries(CHANNEL_ORGANIZATIONS)
    .filter(([, owner]) => owner === orgId)
    .map(([channelId]) => channelId);
}
export function senderAccess(player: any, account: AureMailAccount | undefined): boolean {
  if (!account || account.status !== 'active') return false;
  if (account.accountType === 'personal') return true;
  return account.issuanceSource === 'institution' && Boolean(account.organizationId && membershipSource(player, account.organizationId));
}

// Register the OS authority after initialization, avoiding a circular store import.
interface Authority { player: any; identity: any; isLoggedIn: boolean }
let readAuthority: () => Authority = () => ({ player: {}, identity: {}, isLoggedIn: false });
export function registerCommunicationsAuthority(reader: () => Authority) { readAuthority = reader; }
export function communicationsAuthority(): Authority { return readAuthority(); }

export function restoreMailAccounts(saved: unknown, starter: AureMailAccount[]): AureMailAccount[] {
  if (!Array.isArray(saved)) return starter.map(account => ({ ...account }));
  const seen = new Set<string>();
  let hasPersonal = false;
  const accounts = saved.filter(account => account && typeof account.id === 'string' && typeof account.address === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.address)
    && ['personal', 'academic', 'work', 'institutional'].includes(account.accountType)).filter(account => {
      const address = account.address.toLowerCase();
      if (seen.has(address)) return false;
      if (account.accountType === 'personal') {
        if (hasPersonal) return false;
        hasPersonal = true;
      }
      seen.add(address); return true;
    }).map(account => ({ ...account, label: typeof account.label === 'string' ? account.label : account.address,
      roleLabel: typeof account.roleLabel === 'string' ? account.roleLabel : 'Retained mailbox',
      institution: typeof account.institution === 'string' ? account.institution : 'Unspecified',
      status: account.accountType === 'personal' ? 'active' : (['active', 'provisional', 'suspended', 'revoked'].includes(account.status) ? account.status : 'provisional'),
      issuanceSource: account.accountType === 'personal' ? 'starter' : (account.issuanceSource || 'legacy') }));
  if (!accounts.some(account => account.accountType === 'personal')) accounts.unshift({ ...starter[0] });
  return accounts;
}
