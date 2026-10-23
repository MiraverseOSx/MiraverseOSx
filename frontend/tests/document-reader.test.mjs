import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { canReadDocument, documentActionDestination } from '../src/components/widgets/documentAccess.ts';
import { normalizeDocument } from '../src/components/widgets/documentModel.ts';
import { MOCK_DOCUMENTS } from '../src/data/mockDocuments.ts';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.')) throw error; return next(`${specifier}.ts`, context); } } });
const { attachmentDocument } = await import('../src/apps/mail/attachmentDocument.ts');
const { savedMailFiles } = await import('../src/apps/mail/savedMailFiles.ts');

test('all built-in VAULT files resolve to authored content with distinct reader types', () => {
  const keys = ['dga-registration', 'personal-log', 'system-audit', 'purge-archive', 'firewall-mod', 'cryofreeze-mod', 'void-shield', 'bleed-manipulation', 'aura-scan', 'aura-lean', 'net-relay', 'aethercore-sys', 'prism-bleed', 'corrupted-bleed', 'glassline-map', 'intercept-sig'];
  for (const key of keys) {
    assert.ok(MOCK_DOCUMENTS[key], key);
    const document = normalizeDocument(MOCK_DOCUMENTS[key]);
    assert.equal(typeof document.content.bodyText, 'string');
    assert.ok(document.content.bodyText.length > 30, key);
    assert.notEqual(document.meta.author, 'Not recorded');
  }
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['personal-log']).kind, 'note');
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['system-audit']).kind, 'log');
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['aura-scan']).kind, 'clinical');
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['dga-registration']).kind, 'form');
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['glassline-map']).kind, 'map');
});

test('legacy section documents retain their text, form fields, map data and archive lock', () => {
  const note = normalizeDocument(MOCK_DOCUMENTS['personal-log']);
  assert.match(note.content.bodyText, /factory basement/);
  assert.equal(note.meta.author, 'Previous Occupant');
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['dga-registration']).content.formFields.length, 4);
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['glassline-map']).content.mapData.nodes.length, 4);
  assert.equal(normalizeDocument(MOCK_DOCUMENTS['purge-archive']).security.isEncrypted, true);
});

test('mail and saved assignment formats retain metadata and plain text without mutating records', () => {
  for (const content of ['Plain text mail', { title: 'Report', bodyText: 'Submitted findings.' }]) {
    const source = { filename: 'Saved.txt', extension: '.txt', meta: { classification: 'Saved mail', author: 'Sender' }, security: { isEncrypted: true, requiredLevel: 4 }, content };
    const before = structuredClone(source);
    const result = normalizeDocument(source);
    assert.equal(result.type, 'txt'); assert.equal(result.kind, 'note');
    assert.equal(typeof result.content.bodyText, 'string');
    assert.equal(result.security.requiredLevel, 4);
    assert.equal(result.meta.author, 'Sender');
    assert.deepEqual(source, before);
  }
});

test('unrelated mail attachments keep their own content and remain identical in VAULT', () => {
  const attachment = { id: 'medical', name: 'Referral.pdf', previewTitle: 'Clinical referral', previewText: 'Baseline screening requested.' };
  const mail = { id: 'clinical', sender: 'Faith Medical', subject: 'Screening', body: 'Bring the referral to intake.', attachments: [attachment] };
  const document = attachmentDocument(attachment, mail);
  assert.equal(document.name, 'Referral.pdf');
  assert.match(document.content.bodyText, /Baseline screening requested/);
  assert.equal(document.content.formFields, undefined);
  const saved = savedMailFiles([mail], ['clinical_medical']);
  assert.deepEqual(saved[0].document, document);
  const known = attachmentDocument({ ...attachment, name: 'Registration.osform', mockKey: 'dga-registration' }, mail);
  assert.equal(known.content.formFields.length, 4);
});

test('encrypted records require decryption or their stated skill level before inspection', () => {
  const document = normalizeDocument({ security: { isEncrypted: true, requiredLevel: 4 }, content: 'Restricted record' });
  assert.equal(canReadDocument(document, { skills: { Cryptography: { level: 3 } } }), false);
  assert.equal(canReadDocument(document, { skills: { Cryptography: { level: 4 } } }), true);
  assert.equal(canReadDocument(document, {}, true), true);
  assert.equal(canReadDocument(document, {}), false);
});

test('legacy document actions route to their owner without issuing credits or agency credentials', () => {
  assert.deepEqual(documentActionDestination('SUBMIT_CIVIC_REG'), { appId: 'passport', section: 'record' });
  assert.deepEqual(documentActionDestination('SUBMIT_DGA_REGISTRATION'), { appId: 'passport', section: 'record' });
  assert.deepEqual(documentActionDestination('QUARANTINE_PRISM'), { appId: 'process' });
  assert.deepEqual(documentActionDestination('LOAD_SPELLFORGE'), { appId: 'campus', section: 'magic' });
  assert.equal(documentActionDestination('unknown'), undefined);
});
