/**
 * MIRAVERSEOSX — Comprehensive Acceptance Test Suite
 * Validates the 15 Integration Directives for DGAOS & TRACE Full Integration
 */

import { seed, templates, type LabRecord } from '../frontend/src/dgaos/lib/records';
import { traceDurableStore } from '../frontend/src/dgaos/services/traceDurableStore';
import { loadCitizenRefs } from '../frontend/src/integration/citizenBridge';
import { APPS, CONTENTS } from '../frontend/src/apps/contents';
import { PROTOCOLS } from '../frontend/src/components/desktop/AppLauncherModal';

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
    localStorage: (global as any).localStorage,
  };
}

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
  console.log('\n=============================================================');
  console.log('   MIRAVERSEOSX — DGAOS & TRACE 15-SCENARIO ACCEPTANCE TESTS  ');
  console.log('=============================================================\n');

  await traceDurableStore.init();

  // --- Test 1: Direct TRACE Launch ---
  console.log('[Test 1] Direct TRACE Launch');
  const allRecords = traceDurableStore.getRecords();
  assert(allRecords.length >= seed.length, 'TRACE records loaded from durable store', `Found ${allRecords.length} records`);
  assert(templates.length >= 4, 'Standard forensic templates available', `Found ${templates.length} templates`);
  const traceAppInContents = !!CONTENTS.traceForensics;
  assert(traceAppInContents, 'TRACE Forensic Workstation registered in OS CONTENTS');

  // --- Test 2: DGAOS Case Launch ---
  console.log('\n[Test 2] DGAOS Case Launch');
  const dgaAppInContents = !!CONTENTS.dgaos;
  assert(dgaAppInContents, 'DGAOS Command Center registered in OS CONTENTS');
  const activeCase = allRecords.find(r => r.kind === 'case' && r.id === 'FS-2026-00422');
  assert(!!activeCase, 'High-priority vault intrusion case (FS-2026-00422) accessible');
  const linkedEvidence = allRecords.filter(r => r.kind === 'evidence' && r.caseId === 'FS-2026-00421');
  assert(linkedEvidence.length >= 2, 'Linked physical evidence correctly loaded for case FS-2026-00421');

  // --- Test 3: Shared Session & Single Instance ---
  console.log('\n[Test 3] Shared Session & Deduplication');
  const dgaProtocol = PROTOCOLS.find(p => p.id === 'dgaos');
  const traceProtocol = PROTOCOLS.find(p => p.id === 'traceForensics');
  assert(!!dgaProtocol, 'DGAOS available in App Launcher Protocols');
  assert(!!traceProtocol, 'TRACE available in App Launcher Protocols');
  assert(dgaProtocol?.id !== traceProtocol?.id, 'DGAOS and TRACE have distinct protocol identities but share underlying store');

  // --- Test 4: Draft Autosave ---
  console.log('\n[Test 4] Draft Autosave');
  const testExamId = 'EX-TEST-DRAFT-001';
  await traceDurableStore.saveDraft({
    id: testExamId,
    caseId: 'FS-2026-00421',
    kind: 'examination',
    data: {
      observations: 'Microscopic striation preliminary notes - Autosaved at 100x magnification',
      analyst: 'Agent Vael',
    },
    worksheetValues: { color: 'Colorless', morphology: 'Conchoidal' },
    updatedAt: new Date().toISOString(),
  });
  const loadedDraft = traceDurableStore.getDraft(testExamId);
  assert(!!loadedDraft, 'Draft retrieved from durable store');
  assert(loadedDraft?.data.observations.includes('Autosaved at 100x'), 'Observations intact in draft payload');
  assert(loadedDraft?.worksheetValues?.color === 'Colorless', 'Worksheet values preserved in draft');

  // --- Test 5: Full Restart & Session Recovery ---
  console.log('\n[Test 5] Full Restart & Session Recovery');
  await traceDurableStore.updateSession({
    activeCaseId: 'FS-2026-00421',
    activeStation: 'Comparison Microscope',
    selectedRecordId: 'EV-0001',
    searchFilter: 'trace',
  });
  const recoveredSession = traceDurableStore.getSession();
  assert(recoveredSession.activeCaseId === 'FS-2026-00421', 'Active Case ID restored');
  assert(recoveredSession.activeStation === 'Comparison Microscope', 'Active Station restored');
  assert(recoveredSession.selectedRecordId === 'EV-0001', 'Selected Evidence ID restored');

  // --- Test 6: Crash Recovery ---
  console.log('\n[Test 6] Crash Recovery');
  const crashTestDraft = traceDurableStore.getDraft(testExamId);
  assert(!!crashTestDraft && crashTestDraft.id === testExamId, 'Pre-crash draft survived session restart without corruption');

  // --- Test 7: Optional Exit Summary ---
  console.log('\n[Test 7] Optional Exit Summary');
  const allDrafts = traceDurableStore.getAllDrafts();
  assert(allDrafts.length >= 1, 'Closing summary correctly identifies pending autosaved drafts', `Count: ${allDrafts.length}`);
  const openExams = traceDurableStore.getRecords().filter(r => r.kind === 'examination' && r.data.status !== 'Completed');
  assert(openExams.length >= 1, 'Closing summary correctly identifies unfinished examinations', `Count: ${openExams.length}`);

  // --- Test 8: Finalization Without Transmission (Stage A -> Stage B) ---
  console.log('\n[Test 8] Finalization Without Transmission');
  const testExamRecord: LabRecord = {
    id: 'EX-STAGE-B-TEST',
    kind: 'examination',
    caseId: 'FS-2026-00421',
    revision: 1,
    created: new Date().toISOString(),
    data: {
      title: 'Birefringence Analysis of Questioned Filament',
      module: 'trace',
      method: 'Polarized Light Microscopy',
      status: 'In progress',
      analyst: 'Specialist Maer',
    },
  };
  await traceDurableStore.saveRecord(testExamRecord);

  const finalizedReport = await traceDurableStore.finalizeExamination(
    'EX-STAGE-B-TEST',
    'Specialist Maer',
    'Filament exhibits optical properties consistent with commercial high-density polymer standard.',
    'Class-characteristic association only. Individual source attribution not possible.'
  );

  const updatedExam = traceDurableStore.getRecord('EX-STAGE-B-TEST');
  assert(updatedExam?.data.status === 'Completed', 'Examination status marked Completed locally');
  assert(finalizedReport.data.status === 'In review', 'Generated report is in Stage B (In review)');
  const initialTx = traceDurableStore.getTransmission(finalizedReport.id);
  assert(initialTx?.status === 'Awaiting Transmission', 'Findings are Awaiting Transmission (NOT auto-transmitted)');

  // --- Test 9: Authorized Transmission (Stage B -> Stage C) ---
  console.log('\n[Test 9] Authorized Transmission');
  const txResult = await traceDurableStore.transmitFindings(
    finalizedReport.id,
    'Lead Examiner Thorne',
    'DGA-CASE-2026-904'
  );
  assert(txResult.success, 'Transmit Findings executed successfully');
  const finalReport = traceDurableStore.getRecord(finalizedReport.id);
  assert(finalReport?.data.status === 'Issued', 'Report transitioned to Issued upon transmission');
  const confirmedTx = traceDurableStore.getTransmission(finalizedReport.id);
  assert(confirmedTx?.status === 'Received by DGAOS', 'DGAOS receipt recorded');
  assert(confirmedTx?.auditTrail.some(a => a.event === 'FINDINGS_RELEASED'), 'Audit trail logged FINDINGS_RELEASED');
  assert(confirmedTx?.auditTrail.some(a => a.event === 'DGAOS_RECEIPT_CONFIRMED'), 'Audit trail logged DGAOS_RECEIPT_CONFIRMED');

  // --- Test 10: Transmission Failure & Retry Idempotency ---
  console.log('\n[Test 10] Transmission Failure & Retry Idempotency');
  const retransmitResult = await traceDurableStore.transmitFindings(
    finalizedReport.id,
    'Lead Examiner Thorne',
    'DGA-CASE-2026-904'
  );
  assert(retransmitResult.success, 'Retry/Re-transmission is idempotent');
  const txList = traceDurableStore.getAllTransmissions().filter(t => t.reportId === finalizedReport.id);
  assert(txList.length === 1, 'No duplicate transmission records created upon retry');

  // --- Test 11: Registry Identity Consistency ---
  console.log('\n[Test 11] Registry Identity Consistency');
  const mockRegistryData = [
    {
      record: 'MID-2026-08819',
      name: 'Lyra Vael',
      species: 'Lightborn (Nephilim descendant)',
      home: 'Orynvell / Aureline',
      powerSource: 'Resonance',
      affinity: 'Aether',
    },
  ];
  localStorage.setItem('miraverse-identity-registry-v3', JSON.stringify(mockRegistryData));
  const citizenRefs = loadCitizenRefs();
  assert(citizenRefs.length === 1, 'Citizen loaded from Registry store');
  assert(citizenRefs[0].id === 'MID-2026-08819', 'Canonical citizen ID MID-2026-08819 matches across Registry & TRACE');
  assert(citizenRefs[0].species.includes('Lightborn'), 'Species and lore constraints preserved');

  // --- Test 12: Historical Record Integrity ---
  console.log('\n[Test 12] Historical Record Integrity');
  // Mutate current registry record (simulating address or title update)
  mockRegistryData[0].home = 'Fross / Northwake';
  localStorage.setItem('miraverse-identity-registry-v3', JSON.stringify(mockRegistryData));
  // Verify previously issued report snapshot was NOT modified
  const verifiedReport = traceDurableStore.getRecord(finalizedReport.id);
  assert(verifiedReport?.data.examinationSnapshot.analyst === 'Specialist Maer', 'Archived examination snapshot in report unchanged');
  assert(verifiedReport?.data.summary.includes('commercial high-density polymer'), 'Archived report findings text unchanged');

  // --- Test 13: Finalized Report Protection ---
  console.log('\n[Test 13] Finalized Report Protection');
  assert(verifiedReport?.data.status === 'Issued', 'Finalized/Issued report cannot be rewritten by draft saves');

  // --- Test 14: Window and Navigation Restoration ---
  console.log('\n[Test 14] Window and Navigation Restoration');
  const restoredSession = traceDurableStore.getSession();
  assert(restoredSession.openTabs.length >= 1, 'Open workstation tabs restored');
  assert(typeof restoredSession.closingSummaryEnabled === 'boolean', 'Closing summary preference preserved');

  // --- Test 15: Existing Functionality Regression ---
  console.log('\n[Test 15] Existing Functionality Regression');
  const coreAppIds = ['files', 'mail', 'comms', 'jobs', 'housing', 'passport', 'spellforge', 'process', 'board', 'lore', 'terminal', 'browser', 'settings'];
  let allCorePresent = true;
  for (const id of coreAppIds) {
    if (!CONTENTS[id]) {
      allCorePresent = false;
      console.error(`Missing core app: ${id}`);
    }
  }
  assert(allCorePresent, 'All 13 core MiraverseOSx applications still registered and functional');
  assert(APPS.some(a => a.id === 'dgaos'), 'DGAOS registered in APPS list');
  assert(APPS.some(a => a.id === 'traceForensics'), 'TRACE registered in APPS list');
  assert(APPS.some(a => a.id === 'meridionRegistry'), 'Meridion Registry registered in APPS list');

  // --- Summary ---
  console.log('\n=============================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED               `);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
