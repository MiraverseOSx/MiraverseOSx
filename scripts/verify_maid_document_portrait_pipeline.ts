/**
 * MIRAVERSE OS x — MAID Identity Registry, Document Studio & Portrait Pipeline Acceptance Test Suite
 * Validates:
 * 1. Approved MAID Identity Registry Implementation Directive
 * 2. Phase 4: Nine-Document Packet Studio
 * 3. Phase 5: Local Fantasy Realism Portrait Pipeline
 */

// Polyfill minimal browser globals for Node test environment
if (typeof (global as any).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
  };
}
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {
    location: { origin: 'http://localhost:3000' },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    postMessage: () => {},
    localStorage: (global as any).localStorage,
  };
}

import {
  validateMaidFormat,
  allocateNextMaid,
  MaidIdentityService,
  type CanonicalPerson,
  type NewPersonInput
} from '../frontend/src/services/maidIdentityService';

import {
  buildSingleDocumentHtml,
  buildFullPacketHtml,
  recordIssuedSnapshot,
  renderAuraIdHtml,
  renderAuraPassportHtml,
  renderBirthCertificateHtml,
  renderFingerprintFormHtml,
  renderInvestigativeProfileHtml,
  renderResidencyRecordHtml,
  renderPhysicalSheetHtml,
  renderMedicalSummaryHtml,
  renderEducationEmploymentHtml,
  type CitizenRecord
} from '../frontend/src/services/documentPacketGenerator';

import {
  buildPortraitPrompt,
  generateProceduralPortrait,
  persistCitizenPortrait
} from '../frontend/src/services/portraitService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details || 'Assertion failed'}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n========================================================================');
  console.log('   MIRAVERSEOSX — MAID IDENTITY, DOCUMENT STUDIO & PORTRAIT ACCEPTANCE   ');
  console.log('========================================================================\n');

  // Clear storage for clean run
  localStorage.clear();

  // -------------------------------------------------------------------------
  // SECTION 1: MAID Format & Region Validation
  // -------------------------------------------------------------------------
  console.log('[Suite 1] MAID Format & Regional Code Validation');

  const validMaid = validateMaidFormat('MAID-OR-00481926');
  assert(validMaid.valid === true, 'MAID-OR-00481926 is valid format');
  assert(validMaid.region === 'OR' && validMaid.sequence === '00481926', 'Extracted OR region and 8-digit sequence');

  const unconfirmedRegion = validateMaidFormat('MAID-LU-00481926');
  assert(unconfirmedRegion.valid === false, 'Non-confirmed region (LU) rejected');
  assert(unconfirmedRegion.error?.includes('Creative Director'), 'Creative Director confirmation error returned');

  const invalidFormat = validateMaidFormat('MRD-8492-319');
  assert(invalidFormat.valid === false, 'Legacy MRD-8492-319 rejected by MAID validator');

  const malformed = validateMaidFormat('MAID-OR-1234');
  assert(malformed.valid === false, 'Non-8-digit sequence rejected');

  // -------------------------------------------------------------------------
  // SECTION 2: Atomic Monotonic Sequence Allocation
  // -------------------------------------------------------------------------
  console.log('\n[Suite 2] Monotonic Sequence Allocation & Concurrency');

  const seq1 = allocateNextMaid([]);
  const seq2 = allocateNextMaid([]);
  assert(seq1.startsWith('MAID-OR-'), 'Generated MAID prefix starts with MAID-OR-');
  assert(seq1 !== seq2, 'Consecutive allocations produce distinct numbers');

  const num1 = parseInt(seq1.split('-')[2], 10);
  const num2 = parseInt(seq2.split('-')[2], 10);
  assert(num2 === num1 + 1, 'Sequences are strictly monotonic (+1 increment)');

  // -------------------------------------------------------------------------
  // SECTION 3: Workflow 1 — Add Person
  // -------------------------------------------------------------------------
  console.log('\n[Suite 3] Workflow 1: Add Person in Orynvell');

  const newPersonData: NewPersonInput = {
    name: 'Aurelia Vance',
    registrationRegion: 'Orynvell',
    dob: '1998-09-12',
    place: 'Northwake, Fross', // Born in Fross, but registered in Orynvell!
    home: 'Aureline, Orynvell',
    species: 'Luminari',
    ancestry: 'Lightborn · Seraphima Lineage',
    abilities: 'Photonic resonance shields, starlight illumination',
    powerSource: 'PRISM resonance',
    affinity: 'Gold · wealth / commerce / influence',
    occupation: 'Civic Archivist'
  };

  const addResult = await MaidIdentityService.addPerson(newPersonData);
  assert(addResult.success === true, 'Successfully added person in Orynvell');
  assert(!!addResult.person.maid && addResult.person.maid.startsWith('MAID-OR-'), 'Issued official permanent MAID', addResult.person.maid || '');
  assert(addResult.person.registrationRegionCode === 'OR', 'Recorded initial registration region as OR');
  assert(addResult.person.place === 'Northwake, Fross', 'Birthplace preserved separately without altering region code');
  assert(addResult.person.legacyAliases.length > 0, 'Generated legacy alias alias');

  // Duplicate check
  const duplicateAttempt = await MaidIdentityService.addPerson(newPersonData);
  assert(duplicateAttempt.success === false, 'Duplicate person name + DOB rejected');

  // Unauthorized region issuance rejection
  const badRegionAttempt = await MaidIdentityService.addPerson({
    ...newPersonData,
    name: 'Sylvia Frost',
    dob: '2002-01-15',
    registrationRegion: 'Fross' as any
  });
  assert(badRegionAttempt.success === false, 'Rejected registration outside authorized Orynvell (OR) region');

  // -------------------------------------------------------------------------
  // SECTION 4: Immutability Guarantee
  // -------------------------------------------------------------------------
  console.log('\n[Suite 4] Immutability Guarantee');

  const originalMaid = addResult.person.maid!;
  const updateResult = await MaidIdentityService.updatePerson(addResult.person.id, {
    home: 'Deep Glass Ward, Aureline Central',
    occupation: 'Senior Resonance Director'
  });

  assert(updateResult.success === true, 'Profile updated successfully');
  assert(updateResult.person.maid === originalMaid, 'MAID remains strictly unchanged after residence and job update');
  assert(updateResult.person.registrationRegionCode === 'OR', 'Registration region code remains strictly immutable');
  assert(updateResult.person.home === 'Deep Glass Ward, Aureline Central', 'Updated home residence reflected');

  // -------------------------------------------------------------------------
  // SECTION 5: Legacy MRD Migration & Idempotency
  // -------------------------------------------------------------------------
  console.log('\n[Suite 5] Non-destructive Idempotent Migration');

  // Inject legacy pre-MAID data
  const legacySeed = [
    {
      record: 'MRD-8492-319',
      name: 'Elara Vale',
      dob: '2001-04-18',
      place: 'Northwake, Fross',
      home: 'Aureline, Orynvell',
      species: 'Frostborn',
      registrationRegion: 'Orynvell' // Confirmed registration region
    },
    {
      record: 'MRD-5501-882',
      name: 'Darius Thorne',
      dob: '1989-11-04',
      place: 'Rhyna, Lumia',
      home: 'Southwake, Fross',
      species: 'Shadowkin'
      // No registration region specified: must become pending_migration!
    }
  ];
  localStorage.setItem('miraverse-identity-registry-v3', JSON.stringify(legacySeed));

  // Run migration pass 1
  const migration1 = await MaidIdentityService.migrateLegacyRegistry();
  assert(migration1.backupCreated === true, 'Pre-migration backup safely created');
  assert(migration1.migratedCount >= 1, 'Confirmed legacy record migrated with newly assigned MAID');
  assert(migration1.pendingCount >= 1, 'Unconfirmed legacy record marked as pending migration');

  // Check pending record did NOT receive an unauthorized guess
  const dariusLookup = await MaidIdentityService.lookupPerson('MRD-5501-882');
  assert(dariusLookup.status === 'pending_migration', 'Darius Thorne status is pending_migration');
  assert(dariusLookup.person?.maid === null, 'Darius Thorne was NOT given a guessed MAID');

  // Run migration pass 2 (Idempotency verification)
  const migration2 = await MaidIdentityService.migrateLegacyRegistry();
  assert(migration2.migratedCount === 0 && migration2.pendingCount === 0, 'Second migration pass is completely idempotent (0 new items)');
  assert(migration2.alreadyMigratedCount >= 2, 'All existing records detected and skipped');

  // Confirm pending registration workflow
  const confirmResult = await MaidIdentityService.confirmPendingRegistration(dariusLookup.person!.id, 'OR');
  assert(confirmResult.success === true, 'Pending registration successfully confirmed for Orynvell');
  assert(confirmResult.person.maid !== null, 'Darius Thorne now assigned permanent MAID', confirmResult.person.maid || '');
  assert(confirmResult.person.legacyAliases.includes('MRD-5501-882'), 'Legacy MRD-5501-882 preserved in legacyAliases');

  // -------------------------------------------------------------------------
  // SECTION 6: Authoritative Search Workflows
  // -------------------------------------------------------------------------
  console.log('\n[Suite 6] Authoritative Lookup Workflows');

  // 1. By MAID
  const lookupByMaid = await MaidIdentityService.lookupPerson(originalMaid);
  assert(lookupByMaid.status === 'found', 'Lookup by exact MAID succeeded');
  assert(lookupByMaid.matchedBy === 'maid', 'Matched via maid strategy');

  // 2. By Legacy Alias (MRD-8492-319)
  const lookupByLegacy = await MaidIdentityService.lookupPerson('MRD-8492-319');
  assert(lookupByLegacy.status === 'found', 'Lookup by legacy alias MRD-8492-319 succeeded');
  assert(lookupByLegacy.matchedBy === 'legacy_alias', 'Matched via legacy_alias strategy');
  assert(lookupByLegacy.person?.name === 'Elara Vale', 'Resolved to Elara Vale');

  // 3. By Name
  const lookupByName = await MaidIdentityService.lookupPerson('Elara Vale');
  assert(lookupByName.status === 'found', 'Lookup by citizen name succeeded');

  // 4. Not Found
  const lookupMissing = await MaidIdentityService.lookupPerson('NON-EXISTENT-CITIZEN-999');
  assert(lookupMissing.status === 'not_found', 'Non-existent query returned not_found');

  // -------------------------------------------------------------------------
  // SECTION 7: Phase 4 — Nine-Document Packet Generator
  // -------------------------------------------------------------------------
  console.log('\n[Suite 7] Phase 4: Nine-Document Packet Generation');

  const testCitizen: CitizenRecord = {
    name: 'Elara Vale',
    dob: '2001-04-18',
    place: 'Northwake, Fross',
    record: 'MRD-8492-319',
    maid: 'MAID-OR-00481926',
    passport: 'AUR-782194',
    address: '142 Moonwell Way, Aureline',
    phone: '+1 (202) 555-0142',
    email: 'elara.vale@example.com',
    district: 'Glassline District',
    height: '174 cm',
    eyes: 'Violet-Gray',
    hair: 'Silver-Black',
    build: 'Slender',
    blood: 'A+ (Aura Calibrated)',
    mark: 'Faint crystalline frost markings along left wrist',
    species: 'Frostborn',
    ancestry: 'Lightborn · Ellawen Lineage',
    abilities: 'Cryo-constructs, starlight resonance',
    powerSource: 'PRISM resonance & Aether',
    affinity: 'Violet · knowledge / illusion / memory',
    home: 'Aureline, Orynvell',
    category: 'Student / academy',
    affiliation: 'Cyacademy Central Campus',
    occupation: 'Resonance Analyst',
    clearance: 'Academic Clearance II',
    medical: 'Faith Medical Group · intake verified',
    residency: 'Cyacademy Dormitory 4B',
    history: 'Intake registration completed',
    status: 'ACTIVE / VERIFIED',
    links: 'Coordinates academic study group'
  };

  // Render all 9 individual documents
  const doc1 = renderAuraIdHtml(testCitizen);
  assert(doc1.includes('MAID-OR-00481926') && doc1.includes('MRD-8492-319'), 'Doc 1: Aura ID renders MAID and legacy MRD');

  const doc2 = renderAuraPassportHtml(testCitizen);
  assert(doc2.includes('AURA PASSPORT') && doc2.includes('MAID-OR-00481926'), 'Doc 2: Aura Passport renders MAID');

  const doc3 = renderBirthCertificateHtml(testCitizen);
  assert(doc3.includes('CERTIFICATE OF LIVE BIRTH') && doc3.includes('MAID-OR-00481926'), 'Doc 3: Birth Certificate renders MAID');

  const doc4 = renderFingerprintFormHtml(testCitizen);
  assert(doc4.includes('FORM TRACE-10-PRINT') && doc4.includes('MAID-OR-00481926'), 'Doc 4: Ten-Print Biometrics renders MAID');

  const doc5 = renderInvestigativeProfileHtml(testCitizen);
  assert(doc5.includes('INVESTIGATIVE SUBJECT PROFILE') && doc5.includes('MAID-OR-00481926'), 'Doc 5: Investigative Profile renders MAID');

  const doc6 = renderResidencyRecordHtml(testCitizen);
  assert(doc6.includes('OFFICIAL DOMICILE &amp; RESIDENCY') && doc6.includes('MAID-OR-00481926'), 'Doc 6: Residency Record renders MAID');

  const doc7 = renderPhysicalSheetHtml(testCitizen);
  assert(doc7.includes('PHYSICAL IDENTIFICATION SHEET') && doc7.includes('MAID-OR-00481926'), 'Doc 7: Physical ID Sheet renders MAID');

  const doc8 = renderMedicalSummaryHtml(testCitizen);
  assert(doc8.includes('MEDICAL IDENTITY SUMMARY') && doc8.includes('MAID-OR-00481926'), 'Doc 8: Medical Summary renders MAID');

  const doc9 = renderEducationEmploymentHtml(testCitizen);
  assert(doc9.includes('ACADEMIC &amp; EMPLOYMENT SERVICE') && doc9.includes('MAID-OR-00481926'), 'Doc 9: Education Record renders MAID');

  // Render combined dossier packet
  const fullPacketHtml = buildFullPacketHtml(testCitizen);
  assert(fullPacketHtml.includes('DOCUMENT 1 OF 9') && fullPacketHtml.includes('ACADEMIC &amp; EMPLOYMENT'), 'Full Packet combines all 9 documents with page breaks');

  // Record formal issuance snapshot
  const snapshot = recordIssuedSnapshot({
    documentType: 'FULL_NINE_DOCUMENT_PACKET',
    citizenRecordId: testCitizen.maid!,
    citizenName: testCitizen.name,
    issuedAt: new Date().toISOString(),
    issuingAuthority: 'Aureline Civic Identity Administration',
    version: '1.0'
  });
  assert(!!snapshot.id && snapshot.id.startsWith('ISSUE-'), 'Logged formal document issuance snapshot');
  assert(!!snapshot.hash, 'Generated immutable document verification hash');

  // -------------------------------------------------------------------------
  // SECTION 8: Phase 5 — Local Fantasy Portrait Pipeline
  // -------------------------------------------------------------------------
  console.log('\n[Suite 8] Phase 5: Local Fantasy Portrait Pipeline');

  const idPrompt = buildPortraitPrompt(testCitizen, 'id');
  assert(idPrompt.prompt.includes('headshot') && idPrompt.prompt.includes('Frostborn'), 'Synthesized passport ID prompt with species notes');

  const expressivePrompt = buildPortraitPrompt(testCitizen, 'expressive');
  assert(expressivePrompt.prompt.includes('Cinematic') && expressivePrompt.prompt.includes('Violet'), 'Synthesized expressive portrait prompt with PRISM resonance');

  const proceduralSvg = generateProceduralPortrait(testCitizen, 777);
  assert(proceduralSvg.startsWith('data:image/svg+xml;utf8,'), 'Generated high-resolution procedural portrait data URI');
  assert(proceduralSvg.includes('Frostborn') || proceduralSvg.includes('AURA'), 'Procedural portrait includes species styling and official AURA stamp');

  const saved = persistCitizenPortrait(originalMaid, proceduralSvg);
  assert(saved === true, 'Persisted generated portrait to canonical & legacy identity stores');

  // Verify lookup has updated portrait
  const refreshedLookup = await MaidIdentityService.lookupPerson(originalMaid);
  assert(refreshedLookup.person?.portraitData === proceduralSvg, 'Authoritative lookup returns persisted portrait');

  // -------------------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED / ${failed} FAILED                     `);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite crashed with error:', err);
  process.exit(1);
});
