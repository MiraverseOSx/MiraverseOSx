import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 60000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4174', viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', trace: 'retain-on-failure', screenshot: 'only-on-failure', headless: true },
  webServer: [
    { command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm run storybook -- --host 127.0.0.1 --port 6006 --ci --no-open', url: 'http://127.0.0.1:6006', reuseExistingServer: false, timeout: 120000 },
  ],
});
