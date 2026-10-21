import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { restoreMailOrganization, groupConversations, conversationMessageIds, isSnoozed } = await import('../src/apps/mail/mailOrganization.ts');
const { sanitizeMailHtml, mailHtmlToText } = await import('../src/apps/mail/richText.ts');
const { savedMailFiles } = await import('../src/apps/mail/savedMailFiles.ts');
let sequence = 0;
function storage() { const data = new Map(); globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; globalThis.window = { localStorage: globalThis.localStorage }; return data; }
async function fresh() { return (await import(`../src/store/useCommsStore.ts?mail=${sequence++}`)).useCommsStore; }

test('older and malformed mail preferences gain safe independent defaults', () => {
  assert.equal(restoreMailOrganization(undefined).settings.density, 'comfortable');
  const restored = restoreMailOrganization({ contacts: [null, { id: 'x', name: 'X', address: 'invalid' }], rules: [null, { action: 'delete-everything' }], settings: { signature: {}, density: 'bad' }, metadata: { x: { labels: ['missing'], snoozedUntil: 'never' } } });
  assert.deepEqual(restored.contacts, []); assert.deepEqual(restored.rules, []); assert.deepEqual(restored.metadata.x.labels, []); assert.equal(restored.metadata.x.snoozedUntil, undefined);
});
test('contacts and group membership support edit, deletion and reload', async () => {
  storage(); const store = await fresh();
  store.getState().updateMailOrganization(org => ({ ...org, groups: ['Work', 'Friends'] }));
  assert.equal(store.getState().savePersonalContact({ name: 'Test Reader', address: 'reader@example.aure', groups: ['Work'] }).ok, true);
  const contact = store.getState().mailOrganization.contacts[0];
  assert.equal(store.getState().savePersonalContact({ name: 'Duplicate', address: contact.address }).ok, false);
  store.getState().savePersonalContact({ ...contact, name: 'Updated Reader', groups: ['Friends'] });
  assert.equal((await fresh()).getState().mailOrganization.contacts[0].name, 'Updated Reader');
  store.getState().updateMailOrganization(org => ({ ...org, groups: [] }));
  assert.deepEqual(store.getState().mailOrganization.contacts[0].groups, []);
  store.getState().deletePersonalContact(contact.id);
  assert.equal((await fresh()).getState().mailOrganization.contacts.length, 0);
});
test('labels, folders, spam and snooze persist without editing attachment rewards', async () => {
  storage(); const store = await fresh(); const id = store.getState().emails[0].id;
  const attachments = JSON.stringify(store.getState().emails[0].attachments);
  store.getState().updateMailOrganization(org => ({ ...org, labels: ['Follow up'], folders: ['Projects'] }));
  store.getState().organizeMail([id, 'unknown'], 'label', 'Follow up');
  store.getState().organizeMail([id], 'spam');
  store.getState().organizeMail([id], 'snooze', Date.now() + 3600000);
  let restored = (await fresh()).getState();
  assert.equal(restored.mailOrganization.metadata[id].spam, true); assert.equal(isSnoozed(restored.mailOrganization.metadata[id]), true);
  assert.equal(isSnoozed(restored.mailOrganization.metadata[id], Date.now() + 7200000), false);
  store.getState().moveToTrashEmail(id);
  store.getState().organizeMail([id], 'folder', 'Projects');
  restored = (await fresh()).getState();
  assert.equal(restored.trashedEmailIds.includes(id), false); assert.equal(restored.mailOrganization.metadata[id].folder, 'Projects');
  assert.equal(restored.mailOrganization.metadata[id].spam, false); assert.equal(isSnoozed(restored.mailOrganization.metadata[id]), false);
  assert.deepEqual(restored.mailOrganization.metadata[id].labels, ['Follow up']); assert.equal(JSON.stringify(restored.emails.find(mail => mail.id === id).attachments), attachments);
  store.getState().organizeMail([id], 'label', 'Follow up');
  assert.deepEqual(store.getState().mailOrganization.metadata[id].labels, []);
  store.getState().updateMailOrganization(org => ({ ...org, folders: [] }));
  assert.equal(store.getState().mailOrganization.metadata[id].folder, undefined);
});
test('rules process new incoming mail once and can be applied explicitly to existing mail', async () => {
  storage(); const store = await fresh();
  store.getState().processMailRules();
  store.getState().updateMailOrganization(org => ({ ...org, labels: ['Research'], rules: [{ id: 'one', field: 'subject', contains: 'test topic', action: 'label', label: 'Research' }, { id: 'two', field: 'sender', contains: 'researcher', action: 'archive', label: '' }] }));
  const mail = { id: 'mail-rule-test', sender: 'Researcher', subject: 'A TEST TOPIC', body: 'Hello.', folder: 'inbox' };
  store.getState().addEmail(mail); store.getState().processMailRules();
  assert.equal(store.getState().archivedEmailIds.includes(mail.id), true);
  assert.deepEqual(store.getState().mailOrganization.metadata[mail.id].labels, ['Research']);
  store.getState().toggleArchiveEmail(mail.id); store.getState().processMailRules();
  assert.equal(store.getState().archivedEmailIds.includes(mail.id), false);
  const again = await fresh(); again.getState().processMailRules();
  assert.equal(again.getState().archivedEmailIds.includes(mail.id), false);
  again.getState().processMailRules(true); assert.equal(again.getState().archivedEmailIds.includes(mail.id), true);
});
test('conversation list groups by explicit thread while preserving message order', () => {
  const messages = [{id:'1',threadId:'a'}, {id:'2',threadId:'a'}, {id:'3',subject:'Same'}, {id:'4',subject:'Same'}];
  assert.deepEqual(groupConversations(messages).map(mail => mail.id), ['1','3','4']);
  assert.equal(groupConversations(messages, false).length, 4);
});
test('rich text retains formatting and strips executable markup and attributes', () => {
  const html = sanitizeMailHtml('<p onclick="bad()">Hello <b>world</b> &amp; friends</p><script>alert(1)</script><img src=x onerror=bad()><svg onload=bad()></svg><a href="javascript:bad()">Link</a>');
  assert.equal(html, '<p>Hello <b>world</b> &amp; friends</p>Link');
  assert.equal(mailHtmlToText('<p>Hello <b>world</b></p><div>Second line &amp; more</div>'), 'Hello world\nSecond line & more');
  assert.equal(sanitizeMailHtml(sanitizeMailHtml(html)), html);
});
test('rich drafts and sent mail keep formatting and custom signatures after hydration', async () => {
  storage(); const store = await fresh();
  store.getState().updateMailOrganization(org => ({ ...org, settings: { ...org.settings, signature: 'Local signature <safe>', density: 'compact', autoRead: false } }));
  const draft = store.getState().saveDraft({ toAddress: 'reader@example.aure', subject: 'Format test', body: 'Hello world', bodyHtml: '<p>Hello <b>world</b></p>' });
  assert.equal((await fresh()).getState().drafts.find(item => item.id === draft.id).bodyHtml, '<p>Hello <b>world</b></p>');
  const sent = store.getState().sendEmail({ toAddress: draft.toAddress, subject: draft.subject, body: draft.body, bodyHtml: draft.bodyHtml });
  assert.equal(sent.ok, true); assert.match(sent.sentMessage.bodyHtml, /<b>world<\/b>/); assert.match(sent.sentMessage.bodyHtml, /&lt;safe&gt;/);
  const restored = (await fresh()).getState();
  assert.equal(restored.mailOrganization.settings.autoRead, false); assert.equal(restored.mailOrganization.settings.density, 'compact');
  assert.equal(restored.emails.find(item => item.id === sent.sentMessage.id).bodyHtml, sent.sentMessage.bodyHtml);
  store.getState().markEmailRead(sent.autoReplyMessage.id); store.getState().moveToTrashEmail(sent.autoReplyMessage.id);
  const last = (await fresh()).getState(); assert.equal(last.readEmailIds.includes(sent.autoReplyMessage.id), true); assert.equal(last.trashedEmailIds.includes(sent.autoReplyMessage.id), true);
});

test('conversation actions expand selected threads, preserve unrelated mail and survive reload', async () => {
  storage(); const store = await fresh();
  const sent = store.getState().sendEmail({ toAddress: 'reader@example.aure', subject: 'Thread actions', body: 'Hello.' });
  const ids = conversationMessageIds(store.getState().emails, [sent.autoReplyMessage.id]);
  assert.deepEqual(new Set(ids), new Set([sent.sentMessage.id, sent.autoReplyMessage.id]));
  store.getState().bulkUpdateEmails(ids, 'archive');
  assert.ok(ids.every(id => store.getState().archivedEmailIds.includes(id)));
  assert.equal(store.getState().archivedEmailIds.length, 2);
  store.getState().bulkUpdateEmails(ids, 'trash');
  assert.ok(ids.every(id => (store.getState().trashedEmailIds.includes(id))));
  store.getState().organizeMail(ids, 'folder', '');
  const again = (await fresh()).getState();
  assert.ok(ids.every(id => !again.trashedEmailIds.includes(id)));
  assert.equal(again.emails.find(mail => mail.id === sent.sentMessage.id).folder, 'sent');
  assert.deepEqual(conversationMessageIds(again.emails, [sent.autoReplyMessage.id], false), [sent.autoReplyMessage.id]);
});
test('label drops are idempotent while the toggle control removes a label deliberately', async () => {
  storage(); const store = await fresh(); const id = store.getState().emails[0].id;
  store.getState().updateMailOrganization(org => ({ ...org, labels: ['Notes'] }));
  for (let repeat = 0; repeat < 2; repeat++) store.getState().organizeMail([id], 'add-label', 'Notes');
  assert.deepEqual(store.getState().mailOrganization.metadata[id].labels, ['Notes']);
  store.getState().organizeMail([id], 'label', 'Notes');
  assert.deepEqual(store.getState().mailOrganization.metadata[id].labels, []);
});
test('saved names resolve to their address and canonical directory metadata enforces clearance', async () => {
  storage(); const store = await fresh();
  store.getState().savePersonalContact({ name: 'Saved Reader', address: 'different-address@example.aure' });
  const result = store.getState().sendEmail({ toAddress: 'Saved Reader', subject: 'Name lookup', body: 'Hello.' });
  assert.equal(result.sentMessage.recipientAddress, 'different-address@example.aure');
  assert.equal(result.autoReplyMessage.verifiedSender, false);
  const held = store.getState().sendEmail({ toAddress: 'canonical.restricted@dga.gov', subject: 'Clearance', body: 'Hello.', playerClearance: 1, recipientContact: { name: 'Canonical Restricted', address: 'canonical.restricted@dga.gov', category: 'citizen', accountType: 'institutional', requiredClearance: 4, institution: 'DGA', faction: 'DGA', role: 'Restricted', verified: true } });
  assert.equal(held.ok, false); assert.equal(held.deliveryStatus, 'blocked_clearance'); assert.equal(held.sentMessage.folder, 'outbox');
});
test('saved attachments appear once in File Explorer with source links and no objective or reward fields', async () => {
  storage(); const store = await fresh();
  assert.equal(store.getState().saveAttachmentToVault('missing', 'missing').ok, false);
  assert.equal(store.getState().saveAttachmentToVault('MSG-001', 'att-reg-grant').ok, false);
  store.getState().saveAttachmentToVault('MSG-001', 'att-reg-card');
  assert.equal(store.getState().saveAttachmentToVault('MSG-001', 'att-reg-card').alreadySaved, true);
  const restored = (await fresh()).getState();
  const files = savedMailFiles(restored.emails, restored.savedAttachmentIds);
  assert.equal(files.length, 1); assert.equal(files[0].dir, '/downloads/auremail');
  assert.equal(files[0].mailId, 'MSG-001'); assert.match(files[0].body, /Cyacademy/);
  for (const key of ['assignmentId','mockKey','amount','xp','isReward']) assert.equal(files[0][key], undefined);
  restored.requestMailMessage(files[0].mailId);
  assert.equal(store.getState().mailRequest, undefined);
  const requestStore = await fresh(); assert.equal(requestStore.getState().mailRequest.id, 'MSG-001');
  assert.equal(restored.submitAttachmentForm('MSG-001', 'att-reg-card').ok, false);
});
test('malformed mailbox entries and collections recover without crashing the reader', async () => {
  const saved = storage();
  saved.set('miraverse-comms', JSON.stringify({ state: { emails: [null, {}, { id: 'ok', sender: 'Reader', subject: 'Recover', body: 'Readable', labels: {}, attachments: [null] }], drafts: [null, { id: 'd', subject: 'Draft', body: 'Hello' }], readEmailIds: null, trashedEmailIds: ['ok', 12] }, version: 0 }));
  const store = await fresh();
  assert.equal(store.getState().emails.length, 1); assert.deepEqual(store.getState().emails[0].attachments, []);
  assert.deepEqual(store.getState().readEmailIds, []); assert.deepEqual(store.getState().trashedEmailIds, ['ok']);
  assert.equal(store.getState().drafts[0].toAddress, '');
});
test('restoring imported folder states really restores mail and held attachments cannot become rewards', async () => {
  storage(); const store = await fresh();
  store.getState().addEmail({ id: 'old-trash', folder: 'trash', sender: 'Reader', subject: 'Old trash', body: 'Hello' });
  store.getState().bulkUpdateEmails(['old-trash'], 'restore');
  assert.equal(store.getState().emails.find(mail => mail.id === 'old-trash').folder, 'inbox');
  const result = store.getState().sendEmail({ toAddress: 'command.classified@dga.gov', subject: 'Held', body: 'Hello', bodyHtml: '<b>Hello</b>', playerClearance: 1, attachments: [{ id: 'outgoing', name: 'copy.grant', isReward: true, amount: 500, xp: 900 }] });
  assert.equal(result.ok, false); assert.equal(result.sentMessage.attachments[0].isReward, false); assert.equal(result.sentMessage.attachments[0].amount, 0); assert.equal(result.sentMessage.bodyHtml, '<b>Hello</b>');
});
test('rapid drafts and transmissions receive distinct stable IDs', async () => {
  storage(); const store = await fresh(); const originalNow = Date.now; Date.now = () => 1000;
  try {
    const first = store.getState().saveDraft({ subject: 'One', body: 'A' }); const second = store.getState().saveDraft({ subject: 'Two', body: 'B' });
    assert.notEqual(first.id, second.id);
    const send = () => store.getState().sendEmail({ toAddress: 'reader@example.aure', subject: 'Rapid', body: 'Hello.' });
    const a = send(); const b = send();
    assert.equal(new Set([a.sentMessage.id, a.autoReplyMessage.id, b.sentMessage.id, b.autoReplyMessage.id]).size, 4);
    assert.notEqual(a.sentMessage.threadId, b.sentMessage.threadId);
  } finally { Date.now = originalNow; }
});
