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

test('Dispatch keeps search context through saved views and supports keyboard navigation', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  await login(page); await openApp(page, 'PULSE');
  await page.getByRole('button', { name: 'Open Meridion Dispatch', exact: true }).click();
  const browser = page.locator('.os-window[data-app=browser]');
  const news = browser.getByRole('region', { name: 'The Meridion Dispatch', exact: true });
  const address = browser.getByRole('textbox', { name: 'Search VerseNet or enter a web address', exact: true });
  await news.getByRole('button', { name: 'Economy', exact: true }).click();
  await news.getByRole('searchbox', { name: 'Search news', exact: true }).fill('contract compensation');
  await news.getByRole('searchbox', { name: 'Search news', exact: true }).press('Enter');
  await news.getByRole('button', { name: 'Save Before your next shift, read the terms', exact: true }).click();
  await news.getByRole('button', { name: 'Saved stories', exact: true }).click();
  await expect(address).toHaveValue('https://dispatch.mer/saved?section=economy&q=contract+compensation');
  await expect(news.getByRole('searchbox', { name: 'Search news', exact: true })).toHaveValue('contract compensation');
  await news.getByRole('button', { name: 'Saved stories', exact: true }).click();
  await expect(address).toHaveValue('https://dispatch.mer/section/economy?q=contract+compensation');
  await news.getByRole('button', { name: 'Before your next shift, read the terms', exact: true }).click();
  await expect(news.getByRole('heading', { name: 'Before your next shift, read the terms', exact: true })).toBeFocused();
  await news.getByRole('button', { name: 'Back to edition', exact: true }).click();
  await expect(news.getByRole('heading', { name: 'Economy', exact: true })).toBeFocused();
  await browser.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(news.getByRole('article', { name: 'Before your next shift, read the terms', exact: true })).toBeVisible();
  await browser.getByRole('button', { name: 'Forward', exact: true }).click();
  await expect(news.getByRole('searchbox', { name: 'Search news', exact: true })).toHaveValue('contract compensation');
  await address.fill('https://dispatch.mer/article/missing-story'); await address.press('Enter');
  await expect(news.getByRole('heading', { name: 'Story unavailable', exact: true })).toBeVisible();
  await news.getByRole('button', { name: 'Return to the front page', exact: true }).click();
  await expect(news.getByRole('heading', { name: 'The front page', exact: true })).toBeVisible();
  expect(failures).toEqual([]);
});

test('news layouts remain readable in light and dark appearance and narrow windows', async ({ page }) => {
  await login(page);
  async function appearance(value: string) {
    await openApp(page, 'SETTINGS');
    await page.getByLabel('System appearance', { exact: true }).selectOption(value);
    await page.locator('.os-window[data-app=settings]').getByRole('button', { name: 'Close', exact: true }).click();
  }
  async function checkReadability(root: ReturnType<Page['locator']>) {
    const results = await root.locator('h1, h2, p').evaluateAll(elements => {
      const luminance = (color: string) => {
        const rgb = (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number).map(value => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      return elements.filter(element => element.getBoundingClientRect().width > 0).map(element => {
        let ancestor: Element | null = element;
        let background = 'rgba(0, 0, 0, 0)';
        while (ancestor && (background === 'rgba(0, 0, 0, 0)' || background === 'transparent')) {
          background = getComputedStyle(ancestor).backgroundColor; ancestor = ancestor.parentElement;
        }
        const a = luminance(getComputedStyle(element).color), b = luminance(background);
        return { text: element.textContent, contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
      });
    });
    for (const result of results) expect(result.contrast, result.text || 'News text').toBeGreaterThanOrEqual(4.5);
    expect(await root.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  }
  await appearance('light'); await openApp(page, 'PULSE');
  const pulseWindow = page.locator('.os-window[data-app=pulse]');
  await pulseWindow.getByRole('button', { name: 'Maximize', exact: true }).click();
  const portal = page.getByRole('region', { name: 'PULSE news portal', exact: true });
  await checkReadability(portal);
  await portal.screenshot({ path: '../output/previews/pulse-redesign-light.png' });
  await pulseWindow.getByRole('button', { name: 'Restore window', exact: true }).click();
  await appearance('dark'); await openApp(page, 'PULSE');
  await pulseWindow.getByRole('button', { name: 'Maximize', exact: true }).click();
  await checkReadability(portal);
  await portal.screenshot({ path: '../output/previews/pulse-redesign-dark.png' });
  await portal.getByRole('button', { name: 'Open Meridion Dispatch', exact: true }).click();
  const browser = page.locator('.os-window[data-app=browser]');
  await browser.getByRole('button', { name: 'Maximize', exact: true }).click();
  const news = browser.getByRole('region', { name: 'The Meridion Dispatch', exact: true });
  await checkReadability(news);
  await news.screenshot({ path: '../output/previews/dispatch-redesign-dark.png' });
  await browser.getByRole('button', { name: 'Restore window', exact: true }).click();
  await pulseWindow.getByRole('button', { name: 'Restore window', exact: true }).click();
  await appearance('light'); await openApp(page, 'VERSENET');
  await browser.getByRole('button', { name: 'Maximize', exact: true }).click();
  await checkReadability(news);
  await news.screenshot({ path: '../output/previews/dispatch-redesign-light.png' });
  await browser.getByRole('button', { name: 'Close', exact: true }).click();
  await openApp(page, 'PULSE');
  await pulseWindow.getByRole('button', { name: 'Maximize', exact: true }).click();
  await page.setViewportSize({ width: 760, height: 900 });
  await checkReadability(portal);
  await portal.screenshot({ path: '../output/previews/pulse-redesign-narrow.png' });
});

test('directory edits open at the selected card and changes survive reload', async ({ page }) => {
  await login(page); await openApp(page, 'VERSENET');
  const browser = page.locator('.os-window[data-app=browser]');
  await browser.getByRole('button', { name: 'Service Directory', exact: true }).click();
  const directory = browser.getByRole('region', { name: 'Service Directory', exact: true });
  const search = directory.getByRole('searchbox', { name: 'Search services', exact: true });
  const edit = directory.getByRole('button', { name: 'Edit Faker.tools', exact: true });
  await edit.scrollIntoViewIfNeeded(); await edit.click();
  const dialog = page.getByRole('dialog', { name: 'Edit service', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Name', exact: true })).toBeFocused();
  await dialog.getByRole('textbox', { name: 'Destination', exact: true }).fill('javascript:alert(1)');
  await dialog.getByRole('button', { name: 'Save service', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Enter a website address');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0); await expect(edit).toBeFocused();
  await search.fill('Faker'); await edit.click();
  await dialog.getByRole('textbox', { name: 'Name', exact: true }).fill('Research library');
  await dialog.getByRole('textbox', { name: 'Category', exact: true }).fill('Research');
  await dialog.getByRole('textbox', { name: 'Purpose', exact: true }).fill('My reference tools and documents.');
  await dialog.getByRole('textbox', { name: 'Destination', exact: true }).fill('example.com/library');
  await dialog.screenshot({ path: '../output/previews/service-editor.png' });
  await dialog.getByRole('button', { name: 'Save service', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(directory.getByRole('heading', { name: 'Research library', exact: true })).toBeVisible();
  await expect(directory.getByRole('status').filter({ hasText: 'Saved Research library.' })).toBeVisible();
  await page.reload(); await openApp(page, 'VERSENET');
  const saved = directory.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Research library', exact: true }) });
  await expect(saved.getByText('example.com/library', { exact: true })).toBeVisible();
  await expect(saved.getByText('My reference tools and documents.', { exact: true })).toBeVisible();
  await openApp(page, 'SETTINGS');
  await page.getByLabel('System appearance', { exact: true }).selectOption('dark');
  await page.locator('.os-window[data-app=settings]').getByRole('button', { name: 'Close', exact: true }).click();
  await openApp(page, 'VERSENET');
  await directory.getByRole('button', { name: 'Add service', exact: true }).click();
  const add = page.getByRole('dialog', { name: 'Add a service', exact: true });
  await add.getByRole('textbox', { name: 'Name', exact: true }).fill('Local notes');
  await add.getByRole('textbox', { name: 'Category', exact: true }).fill('My tools');
  await add.getByRole('textbox', { name: 'Destination', exact: true }).fill('file:///C:/Tools/notes.html');
  await add.screenshot({ path: '../output/previews/service-editor-dark.png' });
  await add.getByRole('button', { name: 'Save service', exact: true }).click();
  await directory.getByRole('combobox', { name: 'Filter service category', exact: true }).selectOption('My tools');
  await directory.getByRole('button', { name: 'Remove Local notes', exact: true }).click();
  await expect(directory.getByRole('combobox', { name: 'Filter service category', exact: true })).toHaveValue('All');
  await expect(directory.getByRole('heading', { name: 'Research library', exact: true })).toBeVisible();
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
