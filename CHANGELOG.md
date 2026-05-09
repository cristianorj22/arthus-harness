# Changelog

All notable changes to arthus-harness are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [SemVer](https://semver.org/).

## [Unreleased]

## [1.0.1] — 2026-05-08

### Changed — brand-neutralization

- **Preset renamed**: `goparty-like` → `full-stack` (preset that ships supabase + design-system + asaas + i18n + e2e + journey-mapping). Old name leaked an unrelated product brand into the wizard prompt.
- **Templates anonymized**: `core/Docs/produto/PRODUTO.md.eta`, `core/Docs/state.md.eta`, `core/Docs/produto/principios-de-experiencia/strategy-A.literal.md.eta`, `core/Docs/produto/principios-de-experiencia/strategy-C.framework.md.eta`, `core/.claude/skills/init-project/SKILL.md`, `core/.claude/agents/a11y-architect.md.eta` — all references to a specific product replaced with neutral placeholders / generic examples ("marketplace fintech", "[Produto]").
- **Wizard prompt** in `src/prompts.mjs` — Strategy A description no longer cites a specific product.
- Snapshot fixtures regenerated for the new preset name.

### Migration note

- Existing projects with `preset: goparty-like` in their lockfile (`.arthus-harness/lock.json`) are unaffected — the preset name is recorded but not re-resolved on `arthus-harness sync`. New projects use `full-stack`.



### Added — Bundle 4: `plugin-mcp-code-review-graph` (opt-in MCP)

- **`plugins/mcp-code-review-graph/`** (new plugin) — wires the code-review-graph MCP server (Tree-sitter knowledge graph for token-efficient navigation/review/debug/refactor). Ships:
  - `files/.mcp.json` — project-local MCP server registration (NOT global — never touches `~/.claude/`).
  - `claude/skills/{explore-codebase,review-changes,debug-issue,refactor-safely}/SKILL.md` — 4 task-oriented skills with token-efficiency rules.
  - `settingsHooks` — Stop hook (`code-review-graph update --skip-flows`, 30s) + SessionStart hook (`code-review-graph status`, 10s).
  - `docs/mcp-code-review-graph.md` — uv install + first-time setup + troubleshooting + when-to-use vs core agents.
- Pre-requisites documented: `uv` (Python tool installer) + `uv tool install code-review-graph` once.
- `prompts.mjs::ALL_PLUGINS` — added `mcp-code-review-graph` to multi-select.
- **NOT** added to `full-stack` preset by default — opt-in by name to avoid forcing the uv install on users who don't want it.

### Added — Bundle 3: real 3-way merge in `arthus-harness sync`

**Layout migration** (breaking but unpublished):
- Lockfile moved from `.arthus-harness.json` (project root) → `.arthus-harness/lock.json` (folder).
- New: `.arthus-harness/baseline/` directory mirrors generated tree with **rendered templates as they were at last successful render**. This is the BASE in 3-way merge.
- Backward-compat: `findLockPath()` reads either layout; always writes new layout. Migration is automatic on first sync.

**3-way merge semantics** in `src/sync.mjs`:
- Inputs: BASE (`.arthus-harness/baseline/<file>`), LOCAL (current file), REMOTE (re-rendered template).
- Decisions per file:
  - **newFile** — target doesn't exist → write REMOTE
  - **identical** — LOCAL == REMOTE → no-op
  - **noBaseline** — file exists but no baseline → write `.rej`, update baseline (or fail in `--strict`)
  - **autoUpdate** — BASE == LOCAL → safely overwrite with REMOTE
  - **userKept** — BASE == REMOTE → keep LOCAL (template unchanged)
  - **merged** — diff3 clean merge → write merged
  - **conflict** — diff3 conflict → write file with `<<<<<<<` markers + `.rej` with new template (don't update baseline)
- New `--force` flag — re-runs sync even if version unchanged (useful for testing).
- Uses [`node-diff3`](https://www.npmjs.com/package/node-diff3) for line-level merge.

**Doctor enhancements:**
- Reports lockfile location (legacy vs new) + baseline presence.
- JSON mode includes `lockfileLocation` + `hasBaseline` fields.
- Recommends `arthus-harness sync` to regenerate baseline if missing.

**add-plugin enhancement:**
- Writes baseline files for the new plugin's contributions (so future sync can 3-way-merge them).
- Migrates lockfile to new layout if it was at legacy path.

**New tests** in `tests/sync.test.mjs`:
- Layout: lockfile + baseline present after scaffold.
- Preserves user edits (BASE != LOCAL, BASE == REMOTE → userKept).
- Auto-updates files user did not touch (BASE == LOCAL → autoUpdate).

**Snapshot test:** updated to skip `.arthus-harness/` (new layout) in addition to `.arthus-harness.json` (legacy).

### Added — `plugin-journey-mapping` + skill `spec-keeper` (core)

- **`plugins/journey-mapping/`** (new plugin) — User journey docs in `Docs/produto/jornadas/<persona>/<jornada>.md` capturing sequence + edge cases + multi-actor handoffs + a11y branches + recovery paths + falha catastrófica. Ships:
  - `claude/skills/journey-mapping/SKILL.md` — review checklist + severity rules.
  - `claude/hooks/journey-touch-reminder.cjs` — PostToolUse hook reading `Docs/produto/jornadas/_surfaces.json` to map paths → journeys (substring match, no regex). Always informational (never blocks).
  - `files/Docs/produto/jornadas/_surfaces.json.template` — example config.
  - `docs/journey-mapping.md` — written to `Docs/produto/jornadas/JOURNEY-MAPPING.md` in target.
  - Wires `settingsHooks` for the PostToolUse handler.
  - Added to `full-stack` preset.
- **`core/.claude/skills/spec-keeper/SKILL.md`** (new core skill) — Companion to SDD method. Auto-fires on common public surface paths (api/**, edge-functions/**, migrations/**, integrations clients). Reminds when SPEC.md §2 needs update. Content-agnostic, gracefully no-ops if SPEC.md doesn't have §2.
- **`src/index.mjs` + `src/sync.mjs`** — added `hasJourneyMapping` to render context.
- **`src/prompts.mjs`** — added journey-mapping to multi-select plugin list.

### Added — 4 core agents + 4 slash commands

Pre-publish additions to v1.0 baseline (still v1.0 since not yet on npm).

**Agents (4 new core):**
- `typescript-reviewer.md.eta` — TS/JS reviewer running `npm run type-check` + `npm run lint`. CRITICAL/HIGH/MEDIUM categories per security/types/async/error/idiomatic/React/perf. Includes SDD drift check (public surface change without SPEC update).
- `security-reviewer.md.eta` — OWASP Top 10 + project-specific (RLS audit if Supabase, payment integrity if Asaas, secret detection always). Plugin-aware skills frontmatter.
- `code-archaeologist.md` — Legacy/refactor specialist. Strangler Fig pattern + characterization testing + Chesterton's Fence philosophy.
- `debugger.md` — Systematic root-cause analysis (4 phases: reproduce → isolate → understand → fix). 5 Whys, binary search, git bisect.

**Slash commands (4 new):**
- `/plan.md.eta` — "WAIT for CONFIRM" gate. Produces structured plan with AC, files, SPEC update flag, risks, rollback. Does NOT touch code until user approves. Anti-vibes-coding discipline.
- `/feature-dev.md.eta` — 6-phase workflow (Discovery → Explore → Plan → Implement → Review → Summary). For features >30 min.
- `/refactor-clean.md.eta` — knip/depcheck/ts-prune audit with SAFE/CAUTION/DANGER tier. 1 item = 1 commit. Always requires approval.
- `/save-session.md.eta` — Session hand-off file in `.claude/session-data/`. Template captures what worked, what failed, exact next step.

**Updates:**
- `core/CLAUDE.md.eta` — agents table (5 → 9 core), slash commands table (1 → 5 core), file map updated.

### Notes

- Total core agents: 5 → **9**. Total core slash commands: 1 → **5**.
- All new agents/commands respect plugin gating (Supabase/Asaas/i18n/DesignSystem) via eta conditionals.
- Snapshot fixtures regenerated.
- Still **v1.0.0** — package.json version unchanged per user direction (publish first, then bump).

## [1.0.0] — 2026-05-08

### Added — initial release

**CLI scaffolder** (`npx create-arthus-harness <name>`)

- 3-question wizard (preset / principles / custom plugins).
- Eta templating engine for `<%= var %>` / `<% if %>` syntax.
- Plugin loader with zod-validated `plugin.yaml` manifests.
- Conflict resolver (hard error on script/file path collisions; first-wins on agent/skill names).
- Memory slug computation: `projectName` + `sha256(gitRemote).slice(0,6)` if remote configured.
- `.arthus-harness.json` lockfile written at scaffold time (preset, plugins, fingerprints).
- Optional `git init` + first commit + `npm install`.

**Sub-commands** (`arthus-harness <cmd>`)

- `sync` — re-render templates with same answers, 3-way merge on user-modified files, default `.rej` non-blocking, `--interactive` opt-in, `--strict` for CI.
- `doctor` — reports drift between project and harness version in <10s.
- `add-plugin <name>` — adds a plugin to existing project.

**Core (always shipped)**

- 5 agents: `code-reviewer`, `silent-failure-hunter`, `a11y-architect`, `refactor-cleaner`, `product-manager`.
- 3 skills: `experience-principles` (content-agnostic — reads project's `principios-de-experiencia.md`), `init-project` (one-shot bootstrap), `harness-doctor` (drift checker).
- 3 hooks: `config-protection.cjs` (bloqueante PreToolUse), `post-edit-accumulator.cjs` (warning PostToolUse), `batch-format-typecheck.cjs` (Stop — lint bloqueante, tsc warning).
- 1 slash command: `/code-review`.
- 8 templates: ADR, AGENT, CONTRACTS, RUNBOOK, SKILL, SPEC, TROUBLESHOOTING, USE-CASE.
- 3 layers of protection — wired:
  - **Process**: hooks + `/code-review` gate.
  - **Technical invariants**: `MISSION.md.eta` template with §1-§7 skeleton.
  - **Experience invariants**: `principios-de-experiencia.md` with **Strategy A literal** (default) + **Strategy C framework** (opt-in) coexisting.
- `Docs/` skeleton: `state.md`, `roadmap.md`, `produto/{PRODUTO,requirements,principios-de-experiencia,jornadas}`, `arquitetura/`, `PRPs/`, `archive/`.
- `.github/workflows/ci.yml.eta` — 5-job structure (lint-and-build, design-system, type-check w/ continue-on-error, secrets-scan, npm-audit).

**Plugins (opt-in)**

- `plugin-design-system-pipeline` — `DESIGN.md → src/index.css` pipeline + `design:check` validator + `design-quality-check.cjs` hook + `/design-check` slash command.
- `plugin-supabase` — `database-reviewer` agent + `supabase-rls-pattern` & `supabase-migration` skills + edge function templates.
- `plugin-e2e-playwright` — storageState pattern + persona fixtures + AxeBuilder helper + Playwright config templates.
- `plugin-i18n` — JSON tree validator (`check_i18n.mjs`) + `i18n-source-of-truth` skill + locale templates.
- `plugin-payment-asaas` — webhook HMAC validator + idempotency middleware + `asaas-integration` skill.

**Presets**

- `full-stack.yaml` — full stack (supabase + design-system + asaas + i18n + e2e).
- `web-supabase.yaml` — supabase + design-system + e2e.
- `minimal.yaml` — core only.

**Tests**

- Snapshot tests per preset (compare generated tree to fixture).
- Conflict resolver unit tests.
- Plugin loader unit tests (zod validation paths).

**Documentation**

- `README.md` — installation + 3-question walkthrough + provenance.
- `docs/plugin-authoring.md` — how to write a new plugin.
- `docs/upgrade-guide.md` — `arthus-harness sync` deep-dive + 3-way merge semantics.
- `docs/architecture.md` — folder structure + plugin contract + render pipeline.

### Notes

- Provenance documented in [PROVENANCE.md](PROVENANCE.md): which artifacts came from `go-party-venue-hub`, which were generalized.
- Open questions resolved in [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md).
- Master plan in [PLAN.md](PLAN.md).

[Unreleased]: https://github.com/cristianorj22/arthus-harness/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/cristianorj22/arthus-harness/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/cristianorj22/arthus-harness/releases/tag/v1.0.0
