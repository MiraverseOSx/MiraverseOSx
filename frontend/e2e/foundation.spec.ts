import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Isolated offline test"}' }));
  await page.route(/^https:\/\//, route => route.abort());
});
async function login(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign In / Login Boot', exact: true }).click();
  await page.getByPlaceholder('e.g. CY-9021-PLAYER or admin').fill('admin');
  await page.getByRole('button', { name: 'START LOGIN BOOT', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Open Orbit', exact: true })).toBeVisible();
}
async function openApp(page: Page, code: string) {
  await page.getByRole('button', { name: 'Open Orbit', exact: true }).click();
  await page.getByRole('button', { name: `Select ${code}`, exact: true }).click();
  await page.locator('.drawer-launch').click();
}
test('manual case intake stays isolated and survives reload', async ({ page }) => {
  await login(page); await openApp(page, 'DGAOS');
  await page.getByRole('button', { name: 'UNLOCK DGA COMMAND SHELL', exact: true }).click();
  const dga = page.locator('.os-window[data-app=dgaos]');
  await dga.getByRole('button', { name: 'Maximize', exact: true }).click();
  await dga.locator('button[title^="Cases ("]').click();
  await dga.getByRole('button', { name: 'NEW CASE', exact: true }).click();
  await dga.locator('#incident-narrative').fill('An unaccompanied parcel was reported at a station. No person has been identified.');
  await dga.getByRole('textbox', { name: 'Case Title (Optional)', exact: true }).fill('Station parcel inquiry');
  await dga.getByRole('button', { name: 'Create Case File', exact: true }).click();
  const saved = await page.evaluate(async () => {
    const { getDGAState } = await import('/src/dgaos/lib/dga-store.ts');
    const { processSimulationTick } = await import('/src/dgaos/lib/simulation/simulation-engine.ts');
    let state = structuredClone(getDGAState());
    const id = state.activeCaseId;
    for (let i = 0; i < 26; i++) state = processSimulationTick(state).updatedState;
    const c = state.cases.find(item => item.id === id)!;
    return { id, source: c.creationSource, evidence: c.evidence.length, people: c.people.length,
      alienMessages: state.communications.filter(item => item.caseId === id).map(item => item.body),
      library: localStorage.getItem('DGAOS_WORKSTATION_STATE_V3') };
  });
  expect(saved.id).toMatch(/^INC-\d{2}-\d{4,}$/);
  expect(saved.source).toBe('manual'); expect(saved.evidence).toBe(0); expect(saved.people).toBe(0);
  expect(saved.alienMessages.join(' ')).not.toMatch(/Vance|Thorne|Phoenix|Embassy/);
  expect(saved.library).toContain('Station parcel inquiry');
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('DGAOS_WORKSTATION_STATE_V3')!).cases.find(item => item.id === JSON.parse(localStorage.getItem('DGAOS_WORKSTATION_STATE_V3')!).activeCaseId).title)).toBe('Station parcel inquiry');
});

test('world backup download and restore retains TRACE drafts and removes newer case drafts', async ({ page }) => {
  await login(page);
  await page.evaluate(async () => {
    const { mirrorWorldEntries } = await import('/src/backend/worldMirrors.ts');
    await mirrorWorldEntries({ trace_records_v2: '[{"id":"stale-IDB-record"}]' });
    localStorage.setItem('trace_records_v2', JSON.stringify([{ id: 'EV-test', kind: 'evidence', caseId: 'INC-test' }]));
    localStorage.setItem('trace_drafts_v2', JSON.stringify({ 'EX-test': { caseId: 'INC-test', data: { notes: 'Keep these notes' } } }));
    localStorage.setItem('trace_exam_draft_EX-test', JSON.stringify({ draft: 'Unsubmitted work' }));
  });
  await openApp(page, 'SETTINGS');
  const settings = page.locator('.os-window[data-app=settings]');
  await settings.locator('button[data-section=save]').click();
  const downloadPromise = page.waitForEvent('download');
  await settings.getByRole('button', { name: 'Download world backup', exact: true }).click();
  const download = await downloadPromise;
  const raw = await readFile((await download.path())!, 'utf8');
  const backup = JSON.parse(raw);
  expect(JSON.parse(backup.entries.trace_drafts_v2)['EX-test'].data.notes).toBe('Keep these notes');
  await page.evaluate(() => {
    localStorage.setItem('trace_drafts_v2', '{}');
    localStorage.setItem('trace_exam_draft_newer', '{}');
  });
  await settings.getByLabel('Choose world backup', { exact: true }).setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
  await expect(settings.getByRole('button', { name: 'Restore selected backup', exact: true })).toBeVisible();
  await Promise.all([
    page.waitForEvent('load'),
    settings.getByRole('button', { name: 'Restore selected backup', exact: true }).click(),
  ]);
  await expect(page.getByRole('button', { name: 'Open Orbit', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('trace_drafts_v2')!)['EX-test']?.data.notes)).toBe('Keep these notes');
  expect(await page.evaluate(() => localStorage.getItem('trace_exam_draft_newer'))).toBeNull();
  const restoredRecordIds = await page.evaluate(async () => {
    const { traceDurableStore } = await import('/src/dgaos/services/traceDurableStore.ts');
    await traceDurableStore.init();
    return traceDurableStore.getRecords().map(item => item.id);
  });
  expect(restoredRecordIds).toEqual(['EV-test']);
  expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('miraverse-world-backup-')))).toBe(true);
});
