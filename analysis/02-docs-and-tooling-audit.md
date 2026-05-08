# Analysis 02 — Docs/scripts/CI/E2E audit

> Source: `general-purpose` agent (Opus 4.7) · 2026-05-08 · 102.712 tokens · 30 tool uses · 183s

---

# Arthus-harness — Audit

## 1. Executive summary

- **Strong harness DNA** lives in: `Docs/state.md` doc-as-handoff pattern, `produto/principios-de-experiencia.md` + skill (the most reusable single artifact in the repo), `scripts/sync-design-tokens.mjs` + `design-check.mjs` (DESIGN.md → CSS pipeline), `scripts/check_i18n.mjs`, the `.github/workflows/ci.yml` 3-job structure with continue-on-error escape valves, and the `e2e/` storageState+persona+AxeBuilder pattern. All of these are stack-agnostic enough to ship in core or near-core.
- **Pure GoParty domain knowledge** (escrow timeline, Asaas integration, Veriff KYC, venue-card, booking-flow component specs, financeiro/, institucional/) is **DROP**. Not harness material.
- **Strategy A is correct for v0.1** — ship the 4 sensações + 5 réguas literal, with one caveat: rename the file to `principios-de-experiencia.md` template that says "GoParty original. Edit freely. See Strategy C in CUSTOMIZATION.md if your product differs". The principles are 80% generic for any consumer product touching money/trust.
- **Strategy C should ship in v0.5+** as opt-in `experience-principles-framework/` with template + validator. Premature in v0.1; doc-only override is fine for the early adopters.
- **Plugin split**: `plugin_design_system` (DESIGN.md→CSS pipeline + check), `plugin_i18n` (json-tree validator), `plugin_e2e_playwright` (storageState pattern), `plugin_supabase` (RLS/migration/edge function skills, lifted from existing `.claude/skills/supabase-*`). Stack-specific deps (Vite, Tailwind, shadcn) only appear in plugins.

---

## 2. Inventory tables

### 2a. `Docs/` tree

| Item | Classification | Reason | Genericization strategy |
|---|---|---|---|
| `Docs/state.md` (hot snapshot per session) | **CORE_GENERICIZE** | The handoff-doc pattern is universal; content is GoParty-specific (commits, branches, fases) | Ship as `Docs/state.md.template` with `{{PROJECT_NAME}}`, empty branch/last-commit/maintainer, "session 1" example block. Skill `init-project` already exists — wire it. |
| `Docs/README.md` (canonical/legacy index) | **CORE_GENERICIZE** | Index pattern is universal | Template with placeholders for canônico/arquivado folders |
| `Docs/roadmap.md` | **CORE_GENERICIZE** | Phased roadmap pattern is generic | Template w/ "Fase 0 — bootstrap done, Fase 1 — first feature TBD" |
| `Docs/produto/principios-de-experiencia.md` | **CORE_KEEP** (Strategy A) | See deep-dive §3 | Ship literal, document override path |
| `Docs/produto/PRODUTO.md` (5 dores) | **CORE_GENERICIZE** | Dor-first product framing is reusable; the 5 dores are GoParty | Template "Dor 1 — TBD / Quem sofre / Como resolvemos" with 1 example block from GoParty as reference |
| `Docs/produto/requirements.md` (RF/RNF/RN with IDs) | **CORE_KEEP** | RF/RNF/RN with stable IDs is a generic discipline | Ship structure empty + 1 example RF |
| `Docs/produto/jornadas/` + `_template-jornada.md` | **CORE_KEEP** | Journey-mapping pattern (persona/edge cases/recovery/a11y branches/falha catastrófica) is universal | Keep `_template-jornada.md`, README, drop the GoParty persona folders |
| `Docs/arquitetura/arquitetura-tecnica.md` | **CORE_GENERICIZE** | The "1 doc to skip reading src/" pattern is gold | Template with section headers, no GoParty content |
| `Docs/arquitetura/diagrams/*.mmd` (booking-flow, payment-escrow, kyc-flow, rbac) | **DROP** | GoParty-specific Mermaid | Replace w/ 1 generic example diagram (auth-flow.mmd) |
| `Docs/design-system/DESIGN.md` (front-matter YAML) | **PLUGIN_design_system** | Format is universal; GoParty tokens are not | Template DESIGN.md with neutral palette + Inter/system font |
| `Docs/design-system/{tokens,brand,components,patterns}/` | **PLUGIN_design_system** (structure) + **DROP** (content) | Folder structure is reusable; GoParty venue-card/escrow-timeline/voice-and-tone/personas are not | Empty scaffold w/ `_template-component.md`, `_template-pattern.md` |
| `Docs/design-system/AGENTS.md` | **CORE_KEEP** | Generic "rules for AI in this folder" pattern | Templatize project name |
| `Docs/design-system/prompts/00–06` | **PLUGIN_design_system** | Phased build-out plan is reusable | Keep as opt-in scaffold |
| `Docs/financeiro/` | **DROP** | 100% Asaas/escrow GoParty | — |
| `Docs/institucional/` | **DROP** | Termos/plano-de-negócio GoParty | — |
| `Docs/implementacao/` | **DROP** | BIN-lookup, super-admin GoParty | — |
| `Docs/testes/` (cenários manuais) | **DROP** | Asaas/Veriff GoParty | — |
| `Docs/PRPs/{README.md, v2-migration.plan.md}` | **CORE_KEEP** (README) + **DROP** (v2-migration.plan.md) | PRP folder + naming convention is reusable; specific plan is not | Keep `README.md` template + naming convention |
| `Docs/archive/` + `INDEX.md` | **CORE_KEEP** (pattern) | Archival pattern is universal | Empty `archive/INDEX.md` template w/ `_REASON.md` convention documented |

### 2b. `scripts/`

| Item | Classification | Reason | Genericization strategy |
|---|---|---|---|
| `sync-design-tokens.mjs` | **PLUGIN_design_system** | Reads `Docs/design-system/DESIGN.md` front-matter, emits `src/index.css` :root vars. Stack-coupled (assumes shadcn-style HSL CSS vars + Tailwind hsl(var(--*)) consumption) — see `buildRootBlock` lines 156-195 | Ship in `plugin_design_system`; document the `:root` contract |
| `design-check.mjs` | **PLUGIN_design_system** | Same coupling; `ALLOWED_HEX_PATTERNS` (lines 76-83) hardcodes `integrations/supabase/types.ts` | Lift `ALLOWED_HEX_PATTERNS` to config (`design-check.config.json`); rest ports cleanly |
| `check_i18n.mjs` | **CORE_KEEP** | Pure JSON tree-diff, source-of-truth = `pt-BR.json`; lines 14-22 already skip silently if `src/locales/` absent | Make `SOURCE` configurable via env / `harness.config.json`; default `pt-BR.json` (matches user's i18n-source-of-truth global rule) |
| `docs-check.mjs` | **CORE_KEEP** (concept) — partly generic | Validates jornadas frontmatter + surface-paths existence — reusable for any "doc-references-code" pattern | Generalize to "any doc folder with frontmatter contract"; keep GATE_DATE/STRICT pattern (line 28-32) — that's a smart non-blocking-then-blocking ratchet |
| `admin/email-confirmation/*.sql` | **DROP** | GoParty Supabase ops | — |
| `seed-test-data.mjs`, `seed-for-account.mjs` | **DROP** | GoParty seed | — |

### 2c. `.github/workflows/ci.yml`

| Job | Classification | Reason | Genericization strategy |
|---|---|---|---|
| `lint-and-build` (lines 10-34) | **CORE_KEEP** | npm install + lint + build is universal Node | Templatize `node-version: 20.x` config |
| `design-system` (lines 36-55) — runs `design:check` + `i18n:check` | **PLUGIN_design_system** + **CORE_KEEP** (i18n line) | Splits cleanly: design-check is plugin, i18n-check is core | Document as "include this job if plugin_design_system enabled" |
| `type-check` with `continue-on-error: true` (lines 57-74) | **CORE_KEEP** | The "informational until strict" pattern is gold for any TS project | Templatize. Ship `continue-on-error: true` w/ comment "remove once strict mode lands" — pattern lifted from line 60 |
| `secrets-scan` (gitleaks, lines 76-93) | **CORE_KEEP** | Universal | Ship as-is |
| `npm-audit --audit-level=high` (lines 95-112) | **CORE_KEEP** | Universal | Ship with `continue-on-error: true` (matches line 98 pattern) |

### 2d. `e2e/`

| Item | Classification | Reason | Genericization strategy |
|---|---|---|---|
| `global-setup.ts` (login + storageState save) | **PLUGIN_e2e_playwright** | Pattern is universal for auth'd app; **GoParty couplings**: BASE_URL hardcoded `:8081` (line 15), V2-specific URL `/v2/auth` (line 23), label selectors `seu melhor email` / `palavra-chave` / `acessar plataforma` (lines 24-26), `auth-token` localStorage probe (line 29) | Ship as configurable: `harness.e2e.config.ts` exposes `loginUrl`, `emailField`, `passwordField`, `submitButton`, `successUrlPattern`, `sessionTokenProbe` (or a custom `loginFn`) |
| `fixtures/test-users.ts` | **CORE_KEEP** (pattern) | 3-persona shape (host/organizer/admin) is GoParty, but the **TEST_USERS const + label/type pattern** is reusable | Template w/ generic `admin` + `user` personas + comment block matching the actual file's DEV-ONLY warning |
| `fixtures/v2-routes.ts` | **CORE_KEEP** (pattern) | The "routes-as-typed-const, never hardcode in spec" pattern is universal — the user's i18n-source-of-truth rule maps cleanly to "routes-source-of-truth" | Template empty + 1 example route group; rename to `routes.ts` (drop V2 prefix) |
| `*.spec.ts` (calendar/v2-organizer/v2-host) | **DROP** | GoParty content | — |
| AxeBuilder pattern: `.include('main').withTags(['wcag2a','wcag2aa']).disableRules(['region'])` | **PLUGIN_e2e_playwright** | Generic — see lines 60-64, 104-108 of v2-organizer.spec.ts | Ship as helper `axeChecks(page, scope)` |

### 2e. `package.json` scripts

| Script | Classification | Reason | Genericization strategy |
|---|---|---|---|
| `dev`, `build`, `build:dev`, `preview` | **DROP** (Vite-specific) — emit via plugin | Vite-coupled | `plugin_vite` ships these |
| `lint` (`eslint .`) | **CORE_KEEP** | Universal | Ship literal |
| `type-check` (`tsc --noEmit -p tsconfig.app.json`) | **CORE_KEEP** | Universal TS | Use `tsconfig.json` default; let plugin override path |
| `design:sync`, `design:check`, `design:check:strict` | **PLUGIN_design_system** | Plugin scripts | Lift |
| `i18n:check` | **CORE_KEEP** | Pure JSON tree-diff, no stack | Ship literal |
| `docs:check`, `docs:check:strict` | **CORE_KEEP** | Generic doc validator | Ship as scaffold; opt out if `Docs/produto/jornadas/` not used |
| `check:all` (line 19: `lint && type-check && design:check && i18n:check && docs:check`) | **CORE_GENERICIZE** | The composite `check:all` umbrella is gold; specific entries depend on plugins | Generated by harness CLI based on enabled plugins |

---

## 3. Experience Principles deep-dive

**Are the 4 sensações + 5 réguas GoParty-specific?**

The 4 sensações:
- **Confiança** — explicitly framed as "meu dinheiro está protegido" (line 30 of principios-de-experiencia.md). Money/trust framing is GoParty-shaped, but **the meta-pattern** ("primary anchor sensation = whatever is most at risk in your product") generalizes.
- **Alívio, Clareza, Comemoração** — these are universal product emotions. Any product with stakes (medical app, fitness tracker, banking, education) hits them.

The 5 réguas:
- **Régua 1** (nunca culpar usuário) — universal. Apple/Mailchimp/Slack examples could replace GoParty examples 1:1. The good/bad table (line 54-59) is the most portable artifact in the repo.
- **Régua 2** (sempre próximo passo óbvio) — universal HCI principle.
- **Régua 3** (cuidar do que tem antes de criar mais) — universal.
- **Régua 4** (resolver com sequência antes de peça nova) — universal; the GoParty examples (Veriff, dados bancários) are illustrative only.
- **Régua 5** (tudo funciona ou diz o que está fazendo) — universal; the table on line 95-100 has zero GoParty coupling.

**Strategy A defense**: Ship literal. Three reasons:
1. Cristiano's voice/POV in this doc is the **most valuable IP** of the harness — it's what makes arthus-harness different from yet-another-claude-template. Diluting into placeholders kills that.
2. Adopters get a **working artifact day-1**. They override what doesn't fit (e.g., Cristiano's "minha decisão consciente" final line).
3. The single concrete coupling (`GerenciamentoAnfitriao.tsx 2330 linhas` on line 77) is harmless — reads as "here's a real example of Régua 3 violation." Replaceable in 5 seconds.

**Caveat**: Ship a sibling `principios-de-experiencia.CUSTOMIZATION.md` with: "Replace 'meu dinheiro está protegido' if your product anchors on a different stake. Replace examples in good/bad tables. Keep the 5 réguas — they're universal."

**Strategy C — opt-in framework sketch (v0.5+)**:

```
Docs/produto/principios-de-experiencia/
├── README.md                  # what this folder is
├── principio-central.md       # 1-2 sentence anchor
├── sensacoes/                 # one .md per âncora
│   ├── _template.md           # frontmatter: name, surface, built-by, broken-by
│   └── confianca.md           # example
├── reguas/                    # one .md per régua
│   ├── _template.md           # frontmatter: name, examples-good, examples-bad, code-signals
│   └── 01-nunca-culpar.md
└── manifest.yaml              # canonical list — referenced by skill + validator
```

**Manifest.yaml shape**:
```yaml
principio-central: "..."
sensacoes:
  - { id: confianca, surface: [checkout, primeira-reserva] }
  - { id: alivio, surface: [confirmacao] }
reguas:
  - { id: 1, name: "Nunca culpar o usuário", priority: HIGH }
  - { id: 2, name: "...", priority: MEDIUM }
```

**Validator** (`scripts/experience-check.mjs`): reads `manifest.yaml`, asserts every listed sensação/régua has a corresponding `.md` with required frontmatter; warns if `paths:` glob in skill front-matter doesn't reference any code.

**Skill auto-fire generalizability**: Yes, fully. The pattern at `.claude/skills/experience-principles/SKILL.md` lines 4-5:
```yaml
allowed-tools: ["Read", "Grep", "Glob"]
paths: ["src/**/*.{ts,tsx,jsx,css}", "src/**/messages*.{ts,tsx}", "src/**/copy*.{ts,tsx}", ...]
```
…is the canonical Claude Code skill scoping pattern. Generalizes to any project. In Strategy C, the skill template would replace concrete `paths:` with `{{UI_PATHS}}` placeholder filled at `init-project` time (e.g., for Next.js: `app/**/*.{ts,tsx}`; for SvelteKit: `src/routes/**/*.svelte`).

---

## 4. `plugin_design_system` contract

**Pipeline**: `Docs/design-system/DESIGN.md` (YAML front-matter) → `npm run design:sync` → `src/index.css` `:root` block → Tailwind reads `hsl(var(--*))`.

**Plugin contract**:

```
plugin_design_system/
├── plugin.json              # { needs: ["postcss"], optional: ["tailwind"] }
├── scripts/
│   ├── sync-design-tokens.mjs  # parameterized: DESIGN_PATH, CSS_PATH from harness.config
│   └── design-check.mjs        # ALLOWED_HEX_PATTERNS from harness.config.designCheck
├── templates/
│   ├── DESIGN.md.template      # empty front-matter scaffold (colors/aliases/rounded)
│   ├── index.css.template      # empty :root block w/ marker comments
│   └── tailwind.config.ts.snippet  # the hsl(var(--*)) consumption pattern
├── ci/
│   └── design-system.job.yml   # the workflow job, lifted from ci.yml lines 36-55
└── docs/
    └── PIPELINE.md             # "DESIGN.md → CSS" explainer
```

**Configuration knobs** (in `harness.config.json`):
```json
{
  "design_system": {
    "designPath": "Docs/design-system/DESIGN.md",
    "cssPath": "src/index.css",
    "rootBlockMarker": ":root {",
    "hexCheck": { "allowedPatterns": ["\\.test\\.tsx?$", "/types\\.ts$"] }
  }
}
```

**The `:root` contract** that `spliceCss` (lines 197-221 of sync-design-tokens.mjs) depends on:
- `src/index.css` MUST contain a `:root {` block.
- Content between `{` and matching `}` is owned by the script.
- Outside that block is user territory.

This is the only opinionated coupling — projects that don't want CSS-vars-in-`:root` (e.g., CSS-in-JS shops, Vanilla Extract) opt out of the plugin. v0.1 ships shadcn/Tailwind shape; v0.5+ could add adapter for tokens-as-TS-export.

---

## 5. `plugin_e2e_playwright` — generic for any auth'd app?

**Pattern (4 components)**:
1. `global-setup.ts` — logs each persona once, saves storageState JSON.
2. `fixtures/test-users.ts` — typed const of personas, never hardcoded in specs.
3. `fixtures/routes.ts` — typed routes const, never hardcoded paths.
4. `AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa']).disableRules(['region']).analyze()` — scoped a11y check, filters by `impact: 'critical'`.

**Generic for any auth'd app**: yes, with the configurability noted above (section 2d). The 4-component split is what makes it portable — labels/URLs/probes are config, structure is plugin.

**Plugin contract**:

```
plugin_e2e_playwright/
├── plugin.json
├── templates/
│   ├── global-setup.ts.template      # parameterized loginFn or label-based
│   ├── playwright.config.ts.template
│   ├── fixtures/
│   │   ├── test-users.ts.template
│   │   └── routes.ts.template
│   └── example.spec.ts.template       # smoke + axe + golden path
└── helpers/
    └── axe.ts                          # axeChecks(page, scope, opts) helper
```

**The persona-driven storageState pattern** is the killer feature. Most teams handroll login-per-test (slow, flaky). Saving storage state once and `test.use({ storageState: ... })` per spec is ~10x faster. Worth being a default in arthus-harness.

**Caveat**: Locks adopters into `@playwright/test` + `@axe-core/playwright`. v0.1: only Playwright supported. v0.5+: optional `plugin_e2e_cypress` mirror.

---

## 6. Recommendations

### Ship in v0.1

1. **`principios-de-experiencia.md` Strategy A** — literal copy of GoParty's doc + skill (`.claude/skills/experience-principles/SKILL.md`) + sibling `CUSTOMIZATION.md` for override path. This is the harness's signature artifact — the thing a developer can't get from any other React/TS template. Includes the global karpathy-guidelines.md + react-hooks-discipline.md from user's `~/.claude/rules/` baked into `.claude/rules/` of the harness.
2. **Doc structure scaffold + `init-project` skill wiring** — `Docs/{state.md, README.md, roadmap.md, produto/, arquitetura/, PRPs/, archive/}.template` + the `init-project` skill (already exists in `.claude/commands/init-project.md`) extended to fill placeholders. Plus `MISSION.md.template` with §1 (security invariants) generic + §2-N as project fills.
3. **CI 5-job structure** (`lint-and-build`, `design-system`, `type-check` w/ continue-on-error, `secrets-scan`, `npm-audit`) — direct lift from `.github/workflows/ci.yml`. The continue-on-error ratchet pattern (lines 60, 98) is a best practice worth defaulting.

### Defer to v0.5+

1. **Strategy C (experience-principles framework with manifest.yaml + validator)** — premature. v0.1 adopters customize via doc edits; if 3+ projects ask for programmatic override, ship the framework.
2. **Multi-stack plugins beyond Vite/Playwright/Supabase** — Next.js / SvelteKit / Cypress / Drizzle adapters wait. v0.1 opinionates: React+Vite+TS+Playwright+Supabase (matches Cristiano's actual stack and `Docs/PRPs/` already documents this assumption). Adding Next.js plugin in v0.5 is straightforward once the plugin contract stabilizes from v0.1 feedback.
