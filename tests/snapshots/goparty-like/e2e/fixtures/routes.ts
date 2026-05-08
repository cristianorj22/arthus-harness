/**
 * Centralized route map.
 *
 * Why: E2E tests should never hardcode paths. When a route moves, update it
 * here and all specs keep working. Cross-link with your router source-of-truth.
 *
 * Pattern: keep routes grouped by surface (public / authenticated / admin).
 * Use functions for routes with params: `venueDetails: (id: string) => ...`.
 */

export const ROUTES = {
  /** Public surfaces */
  public: {
    home: '/',
    login: '/login',
    signup: '/signup',
  },

  /** Authenticated user surfaces */
  app: {
    dashboard: '/dashboard',
    settings: '/settings',
    profile: '/profile',
  },

  /** Admin surfaces */
  admin: {
    home: '/admin',
    users: '/admin/users',
  },
} as const;

/** Storage state paths — used in `test.use({ storageState: AUTH_STATE_PATH.user })` */
export const AUTH_STATE_PATH = {
  user: 'e2e/.auth/user.json',
  admin: 'e2e/.auth/admin.json',
} as const;
