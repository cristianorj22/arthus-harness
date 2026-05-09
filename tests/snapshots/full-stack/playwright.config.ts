import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — <%= projectName %>.
 *
 * Default: headed mode with slowMo so dev can watch the run visually.
 * For CI: `HEADLESS=1 npx playwright test`.
 */
const isHeadless = process.env.HEADLESS === '1';
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL,
    headless: isHeadless,
    launchOptions: {
      slowMo: isHeadless ? 0 : 250,
    },
    viewport: { width: 1440, height: 900 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
});
