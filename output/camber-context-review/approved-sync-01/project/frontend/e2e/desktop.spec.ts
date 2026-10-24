import { test, expect, type Page } from '@playwright/test';

// Every test has a fresh browser context on a separate origin. Never touch the real save API.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Isolated offline browser test"}' }));
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
  await page.getByRole('button', { name: `Select ${code}`, exact: true }).dblclick();
}
test('desktop apps open, maximize and retain appearance after reload', async ({ page }) => {
  const failures: string[] = []; page.on('pageerror', error => failures.push(error.message));
  await login(page);
  await openApp(page, 'SETTINGS');
  await page.getByLabel('System appearance', { exact: true }).selectOption('dark');
  await page.getByLabel('Interface density', { exact: true }).selectOption('comfortable');
  await expect(page.locator('html')).toHaveAttribute('data-mira-appearance', 'dark');
  await page.getByRole('button', { name: 'Maximize', exact: true }).click();
  await expect(page.locator('.os-window[data-app=settings]')).toHaveAttribute('data-maximized', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Open Orbit', exact: true })).toBeVisible();
  await openApp(page, 'SETTINGS');
  await expect(page.getByLabel('Interface density', { exact: true })).toHaveValue('comfortable');
  await expect(page.getByLabel('System appearance', { exact: true })).toHaveValue('dark');
  await openApp(page, 'WORKNET');
  await expect(page.getByRole('heading', { name: /Your work, in view/ })).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('.os-window[data-app=jobs]')).toBeVisible();
  await expect(page.getByText('This app could not display its workspace.')).toHaveCount(0);
  expect(failures).toEqual([]);
});
test('MAI.SPACE layer sorting is keyboard accessible and draft order survives reopening', async ({ page }) => {
  await login(page); await openApp(page, 'mai.space');
  await page.getByRole('button', { name: '✧ Customize', exact: true }).click();
  await page.getByText('Layer order', { exact: true }).click();
  const list = page.getByRole('list', { name: 'Profile section layer order' });
  const before = await list.getByRole('listitem').allTextContents();
  const handle = list.getByRole('button', { name: 'Reorder Profile', exact: true });
  await handle.focus(); await handle.press('Space');
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await handle.press('ArrowDown');
  await expect(page.getByRole('status').filter({ hasText: 'moved over droppable area module-1' })).toBeVisible();
  await handle.press('Space');
  await expect.poll(() => list.getByRole('listitem').allTextContents()).not.toEqual(before);
  const after = await list.getByRole('listitem').allTextContents();
  await page.reload(); await openApp(page, 'mai.space');
  await page.getByRole('button', { name: '✧ Customize', exact: true }).click();
  await page.getByText('Layer order', { exact: true }).click();
  await expect(page.getByRole('list', { name: 'Profile section layer order' }).getByRole('listitem')).toHaveText(after);
});
test('evidence board connects sources, reopens originals and removes player hypotheses', async ({ page }) => {
  await page.goto('http://127.0.0.1:6006/iframe.html?id=miraverse-evidence-board--acquired-sources&viewMode=story');
  await page.getByRole('combobox', { name: 'From', exact: true }).selectOption('audit');
  await page.getByRole('combobox', { name: 'To', exact: true }).selectOption('statement');
  await page.getByLabel('Connection note', { exact: true }).fill('Compare timestamps');
  await page.getByRole('button', { name: 'Connect sources', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Compare timestamps' })).toBeVisible();
  await page.getByRole('button', { name: 'Open original source', exact: true }).first().click();
  await expect(page.getByText('Original reader requested: audit', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove connection Compare timestamps', exact: true }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Compare timestamps' })).toHaveCount(0);
});
test('Broad Street board uses acquired sources and restores player connections after reload', async ({ page }) => {
  await login(page); await openApp(page, 'WORKNET');
  const worknet=page.locator('.os-window[data-app=jobs]');
  await worknet.getByRole('button',{name:'Maximize',exact:true}).click();
  await worknet.getByRole('button',{name:'Opportunities',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search opportunities',exact:true}).fill('Broad Street');
  await page.getByRole('button',{name:'Review assignment & employment terms',exact:true}).click();
  await page.getByRole('button',{name:'Accept Broad Street assignment',exact:true}).click();
  await page.getByRole('button',{name:'I’ve read the briefing · begin investigation',exact:true}).click();
  for (const title of ['Vault access audit','HVAC thermal and smoke record']) {
    await page.locator('.os-window[data-active=true] .case-source-grid article').filter({has:page.getByRole('heading',{name:title,exact:true})}).getByRole('button',{name:'Open original source',exact:true}).click();
    const original=page.getByRole('region',{name:title,exact:true});
    await original.getByRole('button',{name:'Acquire source for case notebook',exact:true}).click();
    await original.getByRole('button',{name:'Open DGAOS evidence notebook',exact:true}).click();
    await expect(page.getByRole('region',{name:'Broad Street evidence board',exact:true})).toBeVisible();
  }
  const board=page.getByRole('region',{name:'Broad Street evidence board',exact:true});
  await expect(board.locator('.react-flow__node')).toHaveCount(2);
  await board.getByRole('combobox',{name:'From',exact:true}).selectOption('access-audit');
  await board.getByRole('combobox',{name:'To',exact:true}).selectOption('thermal-log');
  await board.getByLabel('Connection note',{exact:true}).fill('Compare original timestamps');
  await board.getByRole('button',{name:'Connect sources',exact:true}).click();
  await expect(board.getByRole('listitem').filter({hasText:'Compare original timestamps'})).toBeVisible();
  await page.reload(); await openApp(page,'DGAOS');
  await page.getByRole('button',{name:'UNLOCK DGA COMMAND SHELL',exact:true}).click();
  await page.getByRole('button',{name:'Case notebook',exact:true}).click();
  await expect(page.getByRole('region',{name:'Broad Street evidence board',exact:true}).getByRole('listitem').filter({hasText:'Compare original timestamps'})).toBeVisible();
  await page.locator('.os-window[data-app=dgaos]').getByRole('button',{name:'Maximize',exact:true}).click();
  await page.getByRole('region',{name:'Broad Street evidence board',exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:'../output/previews/tools-evidence-board.png',fullPage:false});
});
