import { chromium, type Browser } from '@playwright/test';
import { TEST_USERS, type TestUser } from './fixtures/test-users';

/**
 * Global setup — logs personas once and saves storageState per persona for reuse.
 *
 * Tests opt into a persona via:
 *   test.use({ storageState: 'e2e/.auth/<persona>.json' });
 *
 * The default chromium project uses `user.json`. Add more personas in `loginAndSave`
 * calls below as your test surface grows.
 *
 * Reqs: dev server running at BASE_URL (default http://localhost:3000).
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

// TODO(arthus-harness): adapt these to your auth UI labels.
// Defaults assume a standard login form with "Email" + "Password" + a submit button.
const AUTH = {
  loginPath: process.env.E2E_LOGIN_PATH || '/login',
  emailLabel: /email/i,
  passwordLabel: /password|senha/i,
  submitLabel: /sign in|log in|entrar|acessar/i,
  // Regex matching successful post-login URL. Tighten for your app.
  successUrl: /\/(dashboard|home|app)/i,
};

async function loginAndSave(browser: Browser, user: TestUser, storagePath: string) {
  const context = await browser.newContext({ baseURL: BASE_URL });
  const page = await context.newPage();

  // eslint-disable-next-line no-console
  console.log(`[global-setup] Logging in as ${user.label} (${user.email})…`);
  await page.goto(AUTH.loginPath);
  await page.getByLabel(AUTH.emailLabel).fill(user.email);
  await page.getByLabel(AUTH.passwordLabel).fill(user.password);
  await page.getByRole('button', { name: AUTH.submitLabel }).click();

  // Wait for an auth-token in localStorage as a session-ready signal.
  // If your stack stores the session in cookies only, replace with a URL-wait.
  await page.waitForFunction(
    () =>
      Object.keys(localStorage).some((k) => k.toLowerCase().includes('auth') || k.toLowerCase().includes('token')),
    { timeout: 15_000 },
  );

  await page.waitForURL(AUTH.successUrl, { timeout: 15_000 });

  // eslint-disable-next-line no-console
  console.log(`[global-setup]   ${user.label} OK · final URL: ${page.url()}`);
  await context.storageState({ path: storagePath });
  await context.close();
}

export default async function globalSetup() {
  const browser = await chromium.launch();
  try {
    // Sequential — auth backends may struggle with aggressive parallelism.
    await loginAndSave(browser, TEST_USERS.user, 'e2e/.auth/user.json');
    await loginAndSave(browser, TEST_USERS.admin, 'e2e/.auth/admin.json');
  } finally {
    await browser.close();
  }
}
