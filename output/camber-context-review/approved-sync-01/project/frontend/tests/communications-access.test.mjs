import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { membershipSource, channelAccess, senderAccess, restoreMailAccounts } = await import('../src/integration/communicationsAccess.ts');
const { restorePhoneThreads } = await import('../src/integration/phoneMessages.ts');
const { DEFAULT_PLAYER_EMAIL_ACCOUNTS, LEGACY_PLAYER_EMAIL_ACCOUNTS } = await import('../src/data/commsData.ts');
let sequence = 0;
function storage() {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } });
  globalThis.window = { localStorage: globalThis.localStorage };
  return values;
}
async function freshOS() { return (await import(`../src/store/useOSStore.ts?communications=${sequence++}`)).useOSStore; }
async function freshComms() { return (await import(`../src/store/useCommsStore.ts?communications=${sequence++}`)).useCommsStore; }
const message = { id: 'test-message', user: 'Member', team: 'Member', text: 'Institutional work', time: '09:00' };
const payload = { toAddress: 'registrar@cyacademy.edu', subject: 'Correspondence', body: 'Please review my schedule.', playerClearance: 5 };
async function administrator() { const os = await freshOS(); os.getState().loginUser({ name: 'Communications Administrator', isAdmin: true }); return os; }

test('new saves start with one personal mailbox and initial mail stays addressed to it after reload', async () => {
  storage(); const store = await freshComms();
  assert.equal(store.getState().playerAccounts.length, 1);
  assert.equal(store.getState().playerAccounts[0].accountType, 'personal');
  assert.equal(store.getState().playerAccounts[0].maid, '');
  assert.ok(store.getState().emails.every(mail => mail.recipientAddress === 'citizen@auremail.aure'));
  assert.match(store.getState().emails.find(mail => mail.id === 'MSG-002').body, /begin with one personal account/);
  store.getState().toggleStarEmail('MSG-001');
  const restored = await freshComms();
  assert.equal(restored.getState().playerAccounts.length, 1);
  assert.ok(restored.getState().emails.every(mail => mail.recipientAddress === 'citizen@auremail.aure'));
  assert.equal(restored.getState().emails.find(mail => mail.id === 'MSG-002').subject, 'Your personal AureMail account');
  assert.equal(restored.getState().sendEmail(payload).ok, true);
});

test('membership requires a real issued relationship or accepted contract, never rank, reputation, or affiliation text', () => {
  assert.equal(membershipSource({ isAdmin: true, affiliation: 'Cyacademy', careers: { medical: { rankIndex: 5 } }, reputation: { faith: 100 } }, 'medical'), null);
  assert.equal(membershipSource({ employmentContracts: { medical: { id: 'EMP:medical', track: 'medical' } } }, 'medical'), 'employment');
  assert.equal(membershipSource({ employmentContracts: { medical: { id: 'unrelated', track: 'medical' } } }, 'medical'), null);
  assert.equal(membershipSource({ organizationMemberships: { medical: { status: 'suspended' } }, employmentContracts: { medical: { id: 'EMP:medical', track: 'medical' } } }, 'medical'), null);
  for (const id of ['constructor', '__proto__', 'dm:voss', 'unknown']) assert.equal(channelAccess({}, id), false);
  assert.equal(channelAccess({}, 'city-alerts'), true);
});

test('membership administration checks the current signed-in administrator and does not create mailboxes or rewards', async () => {
  storage(); const os = await freshOS(); const comms = await freshComms();
  os.getState().loginUser({ name: 'Ordinary Citizen', credits: 400 });
  assert.equal(os.getState().setOrganizationMembership('cyacademy', 'active').ok, false);
  assert.equal(comms.getState().issueInstitutionalAccount({ organizationId: 'cyacademy', address: 'reader@cyacademy.edu' }).ok, false);
  os.getState().loginUser({ name: 'Membership Administrator', isAdmin: true });
  const before = structuredClone(os.getState().gameplay.player);
  assert.equal(os.getState().setOrganizationMembership('__proto__', 'active').ok, false);
  assert.equal(os.getState().setOrganizationMembership('cyacademy', 'bad-status').ok, false);
  assert.equal(os.getState().setOrganizationMembership('cyacademy', 'active').ok, true);
  assert.equal(channelAccess(os.getState().gameplay.player, 'cyacademy-core'), true);
  assert.equal(comms.getState().playerAccounts.length, 1);
  assert.equal(os.getState().gameplay.player.credits, before.credits);
  assert.equal(os.getState().gameplay.player.xp, before.xp);
  const restored = await freshOS();
  assert.equal(membershipSource(restored.getState().gameplay.player, 'cyacademy'), 'issued');
  restored.getState().logoutUser();
  assert.equal(restored.getState().setOrganizationMembership('cyacademy', 'revoked').ok, false);
});

test('accepted WORKNET employment grants workplace channel membership without issuing an email account', async () => {
  storage(); const os = await freshOS(); const comms = await freshComms();
  os.getState().loginUser({ name: 'Medical Applicant', clearance: 3, credits: 400 });
  assert.equal(channelAccess(os.getState().gameplay.player, 'faith-medical-hub'), false);
  assert.equal(os.getState().acceptEmployment('medical').ok, true);
  assert.equal(channelAccess(os.getState().gameplay.player, 'faith-medical-hub'), true);
  assert.equal(comms.getState().playerAccounts.length, 1);
});

test('institutional issuance validates membership and domain, preserves account identity, and can suspend without deleting history', async () => {
  storage(); const os = await administrator(); const comms = await freshComms();
  assert.equal(comms.getState().issueInstitutionalAccount({ organizationId: 'cyacademy', address: 'reader@cyacademy.edu' }).ok, false);
  os.getState().setOrganizationMembership('cyacademy', 'active');
  for (const address of ['reader@evil.example', 'reader@cyacademy.edu.evil.example', 'bad name@cyacademy.edu']) assert.equal(comms.getState().issueInstitutionalAccount({ organizationId: 'cyacademy', address }).ok, false);
  assert.equal(comms.getState().issueInstitutionalAccount(null).ok, false);
  assert.equal(comms.getState().issueInstitutionalAccount({ organizationId: 'cyacademy', address: 'reader@cyacademy.edu' }).ok, true);
  const issued = comms.getState().playerAccounts[1];
  assert.equal(issued.organizationId, 'cyacademy');
  assert.equal(issued.issuanceSource, 'institution');
  assert.equal(issued.issuedBy, 'Communications Administrator');
  assert.equal(comms.getState().issueInstitutionalAccount({ organizationId: 'cyacademy', address: 'READER@cyacademy.edu' }).ok, true);
  assert.equal(comms.getState().playerAccounts.length, 2);
  assert.equal(comms.getState().playerAccounts[1].id, issued.id);
  assert.equal(comms.getState().sendEmail({ ...payload, fromAddress: issued.address }).ok, true);
  const mail = structuredClone(comms.getState().emails);
  comms.getState().updateAccountStatus(issued.address, 'suspended');
  assert.equal(comms.getState().sendEmail({ ...payload, fromAddress: issued.address }).ok, false);
  assert.deepEqual(comms.getState().emails, mail);
});

test('revoking membership blocks stale channel and sender actions immediately while keeping work and conversations', async () => {
  storage(); const os = await administrator(); const comms = await freshComms();
  os.getState().setOrganizationMembership('cyacademy', 'active');
  comms.getState().issueInstitutionalAccount({ organizationId: 'cyacademy', address: 'reader@cyacademy.edu' });
  assert.equal(comms.getState().addChatMessage('cyacademy-core', message), true);
  const before = structuredClone(comms.getState().messages);
  os.getState().setOrganizationMembership('cyacademy', 'revoked');
  assert.equal(comms.getState().addChatMessage('cyacademy-core', { ...message, id: 'late' }), false);
  assert.equal(comms.getState().sendEmail({ ...payload, fromAddress: 'reader@cyacademy.edu' }).ok, false);
  assert.equal(comms.getState().sendEmail({ ...payload, fromAddress: 'unknown@cyacademy.edu' }).ok, false);
  assert.equal(comms.getState().addChatMessage('city-alerts', message), false);
  assert.equal(comms.getState().addChatMessage('unknown-channel', message), false);
  assert.deepEqual(comms.getState().messages, before);
  assert.equal(comms.getState().sendEmail({ ...payload, fromAddress: 'citizen@auremail.aure' }).ok, true);
});

test('old accounts, drafts, claim IDs, and messages survive migration without silently authorizing institutional sends', async () => {
  const values = storage(); await administrator();
  const saved = { playerAccounts: LEGACY_PLAYER_EMAIL_ACCOUNTS, emails: [{ id: 'historical-mail', sender: 'Sender', subject: 'Keep original', body: 'Original content', recipientAddress: 'scholar@cyacademy.edu', attachment: null }], drafts: [{ id: 'old-draft', fromAddress: 'scholar@cyacademy.edu', subject: 'Unfinished', body: 'Keep me', attachments: [] }], savedAttachmentIds: ['old-file'], submittedFormIds: ['old-form'], messages: { 'cyacademy-core': [message] } };
  values.set('miraverse-comms', JSON.stringify({ state: saved, version: 0 }));
  const store = await freshComms();
  assert.equal(store.getState().playerAccounts.length, 5);
  assert.equal(store.getState().emails[0].recipientAddress, 'scholar@cyacademy.edu');
  assert.equal(store.getState().drafts[0].body, 'Keep me');
  assert.deepEqual(store.getState().savedAttachmentIds, ['old-file']);
  assert.deepEqual(store.getState().submittedFormIds, ['old-form']);
  assert.deepEqual(store.getState().messages['cyacademy-core'], [message]);
  assert.equal(store.getState().sendEmail({ ...payload, fromAddress: 'scholar@cyacademy.edu' }).ok, false);
  assert.equal(senderAccess({ organizationMemberships: { cyacademy: { status: 'active' } } }, store.getState().playerAccounts[1]), false);
});

test('personal Comms history migrates to phone once, preserves the source, and phone texts and drafts persist', async () => {
  const values = storage();
  const direct = [{ id: 'direct-old', user: 'Dr. Voss', team: 'Direct', text: 'Original personal conversation', time: '09:00' }];
  values.set('miraverse-comms', JSON.stringify({ state: { messages: { 'dm:voss': direct } }, version: 0 }));
  const store = await freshComms();
  assert.equal(store.getState().phoneThreads['Dr. Voss'].filter(item => item.id === 'comms:dm:voss:direct-old').length, 1);
  assert.deepEqual(store.getState().messages['dm:voss'], direct);
  store.getState().setPhoneDraft('Dr. Voss', 'Unfinished phone text');
  assert.equal(store.getState().sendPhoneMessage('Dr. Voss', 'New personal message'), true);
  assert.equal(store.getState().addChatMessage('dm:voss', message), false);
  store.getState().requestPhoneMessages('Dr. Voss');
  const restored = await freshComms();
  assert.equal(restored.getState().phoneRequest, undefined);
  assert.equal(restored.getState().phoneDrafts['Dr. Voss'], 'Unfinished phone text');
  assert.equal(restored.getState().phoneThreads['Dr. Voss'].filter(item => item.text === 'New personal message').length, 1);
  restored.getState().migratePersonalThreads();
  assert.equal(restored.getState().phoneThreads['Dr. Voss'].filter(item => item.id === 'comms:dm:voss:direct-old').length, 1);
  assert.equal(restored.getState().sendPhoneMessage('constructor', 'invalid'), false);
});

test('malformed saved access data fails closed and a diagnostic cannot be awarded twice', async () => {
  storage(); const comms = await freshComms();
  assert.equal(comms.getState().purgeChannelCorruption('glassline-district'), true);
  assert.equal(comms.getState().purgeChannelCorruption('glassline-district'), false);
  assert.equal(comms.getState().purgeChannelCorruption('unknown'), false);
  assert.equal(restoreMailAccounts([null, {}, { id: 'broken', address: 'invalid', accountType: 'personal' }], DEFAULT_PLAYER_EMAIL_ACCOUNTS).length, 1);
  assert.doesNotThrow(() => restorePhoneThreads({ constructor: [], broken: [null, {}] }, null));
});
