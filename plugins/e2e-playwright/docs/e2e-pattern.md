# E2E pattern — Playwright + storageState + AxeBuilder

> Imported by the `e2e-playwright` arthus-harness plugin. Adapted from go-party-venue-hub.

## Why storageState

Logging in inside every test is slow, flaky, and hides regressions in the auth flow when one of the auth tests fails. The pattern:

1. **Once per suite**, in `e2e/global-setup.ts`, log every persona via the real UI and dump the resulting `localStorage` + cookies to `e2e/.auth/<persona>.json`.
2. **Inside each spec**, opt into a persona with `test.use({ storageState: AUTH_STATE_PATH.user })`. Playwright loads the saved state — no login, no race, no flakes.

When auth itself is what you're testing, write a dedicated `auth.spec.ts` that does NOT use storageState, lives outside this pattern, and validates the full login flow once.

## Files this plugin scaffolds

| File | What it is |
|---|---|
| `e2e/global-setup.ts` | Login each persona, save storage state. Adapt the `AUTH` constants to your login UI. |
| `e2e/fixtures/test-users.ts` | Persona definitions. Reads `E2E_*` env vars with sensible defaults. |
| `e2e/fixtures/routes.ts` | Centralized route map — never hardcode paths in specs. |
| `e2e/example.spec.ts` | Smoke + a11y + golden path placeholder per surface. |
| `e2e/helpers/axe.ts` | `axeChecks(page, scope, opts)` — focused a11y assertions. |
| `playwright.config.ts` | Headed by default with `slowMo` for dev; `HEADLESS=1` for CI. |

## Adding a new persona

1. Add an entry to `TEST_USERS` in `e2e/fixtures/test-users.ts`.
2. Add a `loginAndSave(...)` call in `e2e/global-setup.ts`.
3. Add the storage path to `AUTH_STATE_PATH` in `e2e/fixtures/routes.ts`.
4. In your specs, opt in: `test.use({ storageState: AUTH_STATE_PATH.<persona> })`.

## A11y — why scope to `main`

Most page chrome (header, footer, sidebar) is shared and contributes the same axe violations on every page. Scoping to `main` keeps the report focused on the surface under test, makes regressions visible, and reduces noise. See `helpers/axe.ts`.

The default `disableRules: ['region']` skips landmark warnings that fire when running against a chunk of a page rather than a full document.

## Running

```bash
npm run test:e2e:install    # installs Playwright browsers (once)
npm run test:e2e            # runs the suite (headed, with slowMo)

HEADLESS=1 npm run test:e2e # CI mode
```

## Common gotchas

- **First-run flakiness**: global-setup hits the real backend. Make sure the dev server is up and the test users exist before running.
- **storageState stale**: if your auth tokens expire daily, regenerate by deleting `e2e/.auth/*.json` and re-running.
- **Selector drift**: prefer `getByRole`, `getByLabel` over CSS selectors. They survive design changes.
- **Hardcoded paths in specs**: always import from `fixtures/routes.ts`. PR review should reject hardcoded paths.
