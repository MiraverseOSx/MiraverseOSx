import { ORGANIZATIONS } from '../integration/communicationsAccess';

export function isLocalWorld(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname);
}

// Change credentials only: retain the character, economy, cases and career progress.
export function grantLocalCredentials(gameplay: any, issuedAt: string) {
  const player = gameplay.player;
  const memberships = { ...player.organizationMemberships };
  for (const org of ORGANIZATIONS) {
    if (memberships[org.id]?.status !== 'active') memberships[org.id] = {
      status: 'active', issuedAt, issuedBy: player.name, via: 'admin',
    };
  }
  return { ...gameplay, lockedApps: [], player: {
    ...player, isAdmin: true, clearanceLevel: 5, dgaVerified: true,
    organizationMemberships: memberships,
  } };
}
