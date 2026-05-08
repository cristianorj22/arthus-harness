import { test, expect } from '@playwright/test';
import { ROUTES, AUTH_STATE_PATH } from './fixtures/routes';
import { axeChecks } from './helpers/axe';

/**
 * Example E2E spec for <%= projectName %>.
 *
 * Pattern: each surface gets 2-3 tests:
 *   1. Smoke — page loads, key element visible
 *   2. A11y — AxeBuilder critical violations = 0
 *   3. Golden path — the happy-flow user journey for that surface
 *
 * `test.use({ storageState })` swaps the persona for the file.
 */

test.use({ storageState: AUTH_STATE_PATH.user });

test.describe('Dashboard — smoke', () => {
  test('loads without redirecting to login', async ({ page }) => {
    await page.goto(ROUTES.app.dashboard);
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain(ROUTES.public.login);
  });

  test('a11y — no CRITICAL violations', async ({ page }) => {
    await page.goto(ROUTES.app.dashboard);
    await page.waitForLoadState('networkidle');
    const critical = await axeChecks(page, 'main', { impact: 'critical' });
    expect(critical, 'dashboard should have no CRITICAL a11y violations').toHaveLength(0);
  });

  // Golden path placeholder — replace with the real happy-flow for this surface.
  test.skip('golden path — TODO', async ({ page }) => {
    await page.goto(ROUTES.app.dashboard);
    // 1. Click the primary CTA
    // 2. Fill the form
    // 3. Assert success state
  });
});
