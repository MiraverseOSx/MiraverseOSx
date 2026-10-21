import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { restoreMailOrganization, groupConversations, isSnoozed } = await import('../src/apps/mail/mailOrganization.ts');
const { sanitizeMailHtml, mailHtmlToText } = await import('../src/apps/mail/richText.ts');
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
