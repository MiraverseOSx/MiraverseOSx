export function canReadDocument(file: any, player: any, decrypted = false): boolean {
  const encrypted = file.security?.isEncrypted ?? file.isEncrypted;
  return !encrypted || decrypted || (player?.skills?.Cryptography?.level || 1) >= (file.security?.requiredLevel || 3);
}
export function documentActionDestination(trigger: string): { appId: string; section?: string } | undefined {
  switch (trigger) {
    case 'SUBMIT_CIVIC_REG':
    case 'SUBMIT_DGA_REGISTRATION': return { appId: 'passport', section: 'record' };
    case 'SYNC_FAITHMED': return { appId: 'browser', section: 'https://faithmed.aure/patient' };
    case 'LOAD_SPELLFORGE': return { appId: 'campus', section: 'magic' };
    case 'QUARANTINE_PRISM': return { appId: 'process' };
  }
}
