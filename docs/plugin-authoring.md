# Plugin authoring

How to write a plugin for arthus-harness.

A plugin is a folder under `plugins/<name>/` that contributes files, scripts, deps, Claude assets (skills/agents/hooks/commands), CI jobs, env vars, and prompts to a generated project.

## Folder structure

```
plugins/<name>/
├── plugin.yaml              # manifest — required
├── templates/               # eta templates (optional, by convention)
│   └── …
├── helpers/                 # plain TS/JS files copied verbatim (optional)
├── scripts/                 # node scripts copied to scripts/ in the project (optional)
├── claude/                  # Claude assets contributed via `claude:` keys
│   ├── skills/<skill-name>/SKILL.md
│   ├── agents/<agent-name>.md
│   ├── hooks/<hook-name>.cjs
│   └── commands/<command-name>.md
└── docs/                    # markdown docs contributed via `docs:` (optional)
    └── …
```

The exact folder names under the plugin root (`templates/`, `helpers/`, `scripts/`, `docs/`) are conventional — what matters is what `plugin.yaml` references.

## `plugin.yaml` schema

Full schema (validated by zod in `src/plugin-loader.mjs`):

```yaml
name: <string>                       # required, unique
version: <semver>                    # default "0.1.0"
description: <string>                # optional, one-liner

requires:
  core: ">=1.0"                      # semver range; harness core API
  plugins: []                        # other plugins this depends on

conflicts: []                        # plugin names that can't coexist

contributes:
  files:
    - from: <path-or-glob>           # relative to plugin root
      to: <path>                     # relative to project root

  claude:
    skills: [<name>, …]              # folder copied from claude/skills/<name>/
    agents: [<name>, …]              # single file claude/agents/<name>.md
    hooks: [<name>, …]               # single file claude/hooks/<name>.cjs
    commands: [<name>, …]            # single file claude/commands/<name>.md
    settingsHooks:
      - event: PreToolUse | PostToolUse | Stop | SessionStart
        matcher: "Edit|Write|MultiEdit"   # regex (default)
        command: "node .claude/hooks/foo.cjs"
        timeout: 10                       # seconds (default)

  docs:
    - from: <path>
      to: <path>

  package:
    scripts:
      "<name>": "<command>"
    deps:
      "<package>": "<semver>"
    devDeps:
      "<package>": "<semver>"

  ci:
    jobs:
      - name: <string>
        run: <shell-command>

  env: [VAR_NAME, …]                 # advertised env vars (added to .env.example)

prompts:
  - name: <string>                   # passed back into eta context as `<name>`
    message: <string>
    type: input | confirm | select   # default "input"
    optional: <bool>                 # default false
```

Required fields: `name`. Everything else has a default.

## eta templating rules

Files ending `.eta` are rendered by [eta](https://eta.js.org). The output drops the `.eta` suffix.

- `<%= var %>` — interpolation (HTML-escaped by default; we disable that — output is raw).
- `<%- var %>` — explicit unescaped (harmless since auto-escape is off).
- `<% if (cond) { %>...<% } %>` — conditional.
- `<% for (const x of arr) { %>...<% } %>` — loop.

### Available context vars

Set up in `src/sync.mjs` (`buildContext`) and `src/index.mjs`:

| Var | Source | Example |
|---|---|---|
| `projectName` | prompt | `"my-app"` |
| `projectSlug` | derived (lowercase + dashes) | `"my-app"` |
| `description` | prompt | `"A SaaS for X"` |
| `plugins` | array of selected plugin names | `["supabase", "i18n"]` |
| `pluginsList` | comma-joined string | `"supabase, i18n"` |
| `principles` | `"A"` \| `"C"` \| `"both"` | `"A"` |
| `principlesIsLiteral` | bool — `"A"` or `"both"` | `true` |
| `principlesIsFramework` | bool — `"C"` or `"both"` | `false` |
| `memorySlug` | computed by `memory-slug.mjs` | `"my-app"` or `"my-app-a3f2c9"` |
| `harnessVersion` | from `package.json` | `"1.0.0"` |
| `nodeVersion` | hardcoded for now | `"20.x"` |
| `date` | ISO date | `"2026-05-08"` |
| `timestamp` | ISO timestamp | `"2026-05-08T13:40:00.000Z"` |
| `hasSupabase` | derived from `plugins` | `true` |
| `hasDesignSystem` | derived | `true` |
| `hasE2E` | derived | `false` |
| `hasI18n` | derived | `true` |
| `hasPaymentAsaas` | derived | `false` |

Plugin-defined `prompts:` answers are merged in by name.

## Conflict resolution

Run order: `loadCore` → `loadPlugin(...)` per plugin → `detectConflicts` → `mergeContributions`.

### Hard errors (throw)

- **Same file path** contributed by two contributions (except `.claude/settings.json` which merges).
- **Same `package.json` script name** contributed by two plugins.
- **Explicit `conflicts:`** declared and the conflicting plugin is selected.

To avoid file path collisions, namespace your contributions under `src/integrations/<plugin-name>/`, `scripts/<plugin-name>/`, etc.

### Soft warnings

- **Dep version mismatch** — config-merger picks higher semver and prints a warning. If you need a specific version, pin it in your project's `package.json` after generation.

## Testing your plugin

```bash
# from arthus-harness/ root
npm test                              # all tests
npm run test:snapshot                 # snapshot only
UPDATE_SNAPSHOTS=1 npm run test:snapshot   # regenerate fixtures
```

Add a snapshot for your plugin by creating a preset that includes it (or extending an existing preset's expected fixture). See `tests/snapshot.test.mjs`.

To smoke-test locally:

```bash
node bin/create.mjs --no-prompt --name test-app --plugins <your-plugin> /tmp/test-app
ls /tmp/test-app/
```

## Examples

The shipped plugins are reference implementations:

- `plugins/supabase/` — env vars, types regen script, RLS skill.
- `plugins/design-system-pipeline/` — script + CI job + skill.
- `plugins/payment-asaas/` — env-driven client + idempotency + skill.
- `plugins/i18n/` — validator script + locale templates + skill.
- `plugins/e2e-playwright/` — Playwright config + storageState pattern + axe helper.

Pattern: keep the plugin small and orthogonal. If two plugins always travel together, fold them into a preset (see `presets/*.yaml`) instead of cross-coupling.

## Submitting a plugin

1. Add `plugins/<name>/` with manifest + assets.
2. Add a snapshot fixture if the plugin lands in a preset.
3. Update `presets/*.yaml` if it should be part of one.
4. Open a PR with: a one-line description, the rationale (which user pain it solves), and the snapshot diff.
