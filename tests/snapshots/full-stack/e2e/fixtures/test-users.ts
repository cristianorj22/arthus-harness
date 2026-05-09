/**
 * Test users — DEV ONLY.
 *
 * These accounts must exist in your dev/test backend. Create them via your
 * signup flow or seed script. Weak passwords are intentional for ergonomics —
 * NEVER provision these in production.
 *
 * Add personas as your test surface grows (e.g. host, organizer, owner).
 * Each new persona needs:
 *   1. an entry here
 *   2. a `loginAndSave` call in `e2e/global-setup.ts`
 *   3. a corresponding `e2e/.auth/<persona>.json` (created by global-setup)
 */

export const TEST_USERS = {
  user: {
    email: process.env.E2E_USER_EMAIL || 'user@test.local',
    password: process.env.E2E_USER_PASSWORD || 'Test123!',
    type: 'user' as const,
    label: 'Standard user',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@test.local',
    password: process.env.E2E_ADMIN_PASSWORD || 'Test123!',
    type: 'admin' as const,
    label: 'Administrator',
  },
} as const;

export type TestUser = (typeof TEST_USERS)[keyof typeof TEST_USERS];
