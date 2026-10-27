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
test('browser restores its page and bookmark after reload and reopening the window', async ({ page }) => {
  await login(page); await openApp(page, 'VERSENET');
  const browser = page.locator('.os-window[data-app=browser]');
  const address = browser.getByRole('textbox', { name: 'Search VerseNet or enter a web address', exact: true });
  await address.fill('https://firstfederal.aure/maintenance');
  await address.press('Enter');
  await expect(address).toHaveValue('https://firstfederal.aure/maintenance');
  await browser.getByRole('button', { name: 'Bookmark this page', exact: true }).click();
  await browser.getByRole('button', { name: 'Close', exact: true }).click();
  await openApp(page, 'VERSENET');
  await expect(address).toHaveValue('https://firstfederal.aure/maintenance');
  await page.reload(); await openApp(page, 'VERSENET');
  await expect(address).toHaveValue('https://firstfederal.aure/maintenance');
  await expect(browser.getByRole('button', { name: 'Remove current bookmark', exact: true })).toBeVisible();
});

test('PULSE opens the Dispatch website and preserves reading across reload', async ({ page }) => {
  await login(page); await openApp(page, 'PULSE');
  const portal = page.getByRole('region', { name: 'PULSE news portal', exact: true });
  await expect(portal.getByRole('heading', { name: 'PULSE', exact: true })).toBeVisible();
  await expect(portal.getByRole('searchbox')).toHaveCount(0);
  await portal.screenshot({ path: '../output/previews/pulse-portal.png' });
  await portal.getByRole('button', { name: 'Open Meridion Dispatch', exact: true }).click();
  const browser = page.locator('.os-window[data-app=browser]');
  const address = browser.getByRole('textbox', { name: 'Search VerseNet or enter a web address', exact: true });
  await expect(address).toHaveValue('https://dispatch.mer');
  const news = browser.getByRole('region', { name: 'The Meridion Dispatch', exact: true });
  await expect(news.getByRole('heading', { name: 'The front page', exact: true })).toBeVisible();
  await news.screenshot({ path: '../output/previews/meridion-dispatch.png' });
  await news.getByRole('button', { name: 'Economy', exact: true }).click();
  await news.getByRole('searchbox', { name: 'Search news', exact: true }).fill('contract compensation');
  await news.getByRole('searchbox', { name: 'Search news', exact: true }).press('Enter');
  await expect(news.getByRole('status')).toHaveText('1 story in this edition');
  await news.getByRole('button', { name: 'Before your next shift, read the terms', exact: true }).click();
  await expect(news.getByRole('article', { name: 'Before your next shift, read the terms', exact: true })).toBeVisible();
  await news.getByRole('button', { name: 'Save story', exact: true }).click();
  await expect(address).toHaveValue(/dispatch\.mer\/article\/employment-guide/);
  await page.reload(); await openApp(page, 'VERSENET');
  await expect(news.getByRole('article', { name: 'Before your next shift, read the terms', exact: true })).toBeVisible();
  await news.getByRole('button', { name: 'Back to edition', exact: true }).click();
  await expect(news.getByText('Read', { exact: true })).toBeVisible();
  await page.reload(); await openApp(page, 'PULSE');
  await expect(portal.getByText('1 story saved from the Dispatch.', { exact: true })).toBeVisible();
  await portal.getByRole('button', { name: 'Open saved stories', exact: true }).click();
  await expect(address).toHaveValue('https://dispatch.mer/saved');
  await expect(news.getByRole('button', { name: 'Before your next shift, read the terms', exact: true })).toBeVisible();
  await news.getByRole('button', { name: 'Unsave Before your next shift, read the terms', exact: true }).click();
  await expect(news.getByRole('heading', { name: 'Your shelf is quiet.', exact: true })).toBeVisible();
  await news.getByRole('button', { name: 'Show all news', exact: true }).click();
  await news.getByRole('searchbox', { name: 'Search news', exact: true }).fill('unfindable');
  await news.getByRole('searchbox', { name: 'Search news', exact: true }).press('Enter');
  await expect(news.getByRole('heading', { name: 'No stories found.', exact: true })).toBeVisible();
  await page.screenshot({ path: '../output/previews/dispatch-search.png', fullPage: false });
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
