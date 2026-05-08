# Analysis 01 — `.claude/` audit

> Source: `code-archaeologist` agent (Opus 4.7) · 2026-05-08 · 82.821 tokens · 56 tool uses · 191s

---

# arthus-harness Extraction Audit — `.claude/` of go-party-venue-hub

## 1. Executive summary

- **The harness is two distinct things glued together.** A generic *engineering protection process* (lint+tsc batching, config-protection, multi-agent review, dead-code audit, plan gates) and a *GoParty domain layer* (Supabase RLS, Asaas, Veriff, design-system pipeline, pt-BR i18n, journey-mapping). Clean cut exists: agents declare domain via `skills:` frontmatter, hooks read project-specific paths. Extraction is mechanical, not architectural.
- **Skills already follow a plugin pattern.** Every domain skill has `paths:` glob scoping (e.g. `supabase-rls-pattern` lines 5-6, `asaas-integration` line 5, `experience-principles` line 5). They auto-fire only when matching files exist. **Drop the skill = drop the protection silently** — no errors. This is exactly what the plugin model needs.
- **`code-reviewer` and `a11y-architect` are the load-bearing pieces.** They wire 4 skills each (`design-system-enforcement, i18n-pt-br, experience-principles, journey-mapping`) — these two agents are the entire domain entry point. Genericizing them well solves 80% of the extraction.
- **Surprise specifics that look generic:** `config-protection.cjs` line 19 hardcodes `supabase/migrations/`; `batch-format-typecheck.cjs` lines 80-83 hardcode `tsconfig.app.json`; `design-quality-check.cjs` line 64 hardcodes Tailwind grid heuristics + lines 58 hardcodes pt-BR CTA strings. All trivially parameterizable.
- **The "10 imported antigravity agents" are dead weight for v0.1.** `code-archaeologist` through `test-engineer` (10 files) declare `skills: clean-code, refactoring-patterns, …` — none of which exist in `.claude/skills/`. They load broken. Either fix them at import time (skill stubs) or DROP from v0.1 and re-add when actually used.

## 2. Per-subdir inventory

### `agents/` (12 active + 5 archived)

| File | Classification | Reason | Genericization strategy |
|---|---|---|---|
| `code-reviewer.md` | **CORE_GENERICIZE** | Entry-point reviewer; well-structured checklist (security/types/RLS/UI). Heavy GoParty refs (line 1: "go-party-venue-hub", "Asaas/Veriff", line 38). | Replace `{{project_name}}`, `{{stack}}`, payment/KYC examples become "your payment provider"; skills list becomes opt-in: `skills: ${{plugins.skills}}` |
| `typescript-reviewer.md` | **CORE_KEEP** | Pure TS/JS review. Runs `tsc + eslint`. Only 1 GoParty mention (line 25). | Remove mention of `_known-debt.md`; otherwise generic. |
| `silent-failure-hunter.md` | **CORE_GENERICIZE** | Pattern is universal (empty catches, dangerous fallbacks). Examples reference Supabase/Asaas. | Skill `asaas-integration` becomes opt-in via plugin. Generic examples: REST/DB calls. |
| `security-reviewer.md` | **CORE_GENERICIZE** | OWASP review pattern is generic. Skills `supabase-rls-pattern`, `asaas-integration` are domain. | Strip GoParty Asaas/Veriff specifics → push to plugins. Keep OWASP + secret-detection skeleton. |
| `database-reviewer.md` | **PLUGIN_supabase** | Frontmatter line 5: `skills: supabase-rls-pattern, supabase-migration`. Body is Supabase-specific. | Move whole agent to `plugin-supabase`. |
| `a11y-architect.md` | **CORE_GENERICIZE** | WCAG/ARIA is universal. Body has ABNT NBR 17225 + LBI 13.146 (BR-specific) + GoParty-specific component refs. | Keep WCAG core; ABNT/LBI become locale-specific opt-in. Strip skill list → plugins inject. |
| `refactor-cleaner.md` | **CORE_KEEP** | knip/depcheck/ts-prune triple-evidence pattern is universal. Tier system (SAFE/CAUTION/DANGER) generalizes. | Remove project-specific examples in body. |
| `code-archaeologist.md` | **DROP (v0.1)** | Frontmatter line 6 declares `skills: clean-code, refactoring-patterns, code-review-checklist` — none exist. Loads broken. Generic value but not critical. | Re-add in v0.2 with skill stubs, or skip. |
| `database-architect.md` | **DROP (v0.1)** | Same broken-skills issue (line 6: `clean-code, database-design`). Overlap with `database-reviewer`. | Defer. |
| `debugger.md` | **DROP (v0.1)** | Broken skills (line 4). Useful in concept; not v0.1. | Defer. |
| `devops-engineer.md` | **DROP (v0.1)** | Broken skills (5 declared). Highly stack-dependent. | Defer to v0.2 plugin. |
| `documentation-writer.md` | **DROP (v0.1)** | Broken skills. Use only on demand. | Defer. |
| `mobile-developer.md` | **DROP** | RN/Flutter — out of scope. | Don't ship. |
| `performance-optimizer.md` | **DROP (v0.1)** | Broken skills. | Defer. |
| `product-manager.md` | **CORE_KEEP** (optional) | Generic PM workflow. Skills (`plan-writing, brainstorming`) don't exist but body works without. | Strip `skills:` line. |
| `seo-specialist.md` | **DROP** | Niche, broken skills. | Don't ship. |
| `test-engineer.md` | **CORE_KEEP** (optional) | Generic. Many skill refs broken (line 6). | Strip skill list. |
| `_archive/*` (5 files) | **DROP** | Already archived; documented why in `_REASON.md`. | Don't carry into harness. |

### `skills/`

| File | Classification | Reason | Strategy |
|---|---|---|---|
| `supabase-rls-pattern/SKILL.md` | **PLUGIN_supabase** | Pure Supabase RLS doctrine. | `arthus-plugin-supabase` |
| `supabase-migration/SKILL.md` | **PLUGIN_supabase** | Supabase migration conventions. | Same plugin. |
| `asaas-integration/SKILL.md` | **PLUGIN_payment_asaas** | 100% Asaas (BR payment). | `arthus-plugin-payment-asaas`. |
| `i18n-pt-br/SKILL.md` | **PLUGIN_i18n_pt_br** | pt-BR specific glossary, ICU. | `arthus-plugin-i18n-pt-br` (template for other locales). |
| `design-system-enforcement/SKILL.md` | **PLUGIN_design_system** | Pipeline `DESIGN.md → src/index.css` is GoParty's. | `arthus-plugin-design-system` with token pipeline. |
| `experience-principles/SKILL.md` | **CORE_GENERICIZE (Strategy A literal)** | 4 sensações + 5 réguas. Per spec: ship literal default. | Ship as-is; provide `customize-experience-principles` skill (Strategy C) as opt-in for projects to fork. |
| `journey-mapping/SKILL.md` | **CORE_GENERICIZE** | Pattern (jornada per persona, recovery paths) is universal. Body has GoParty paths. | Genericize: `Docs/produto/jornadas/<persona>/<jornada>.md` becomes templated; mapping rules stay. |
| `agent-tool-builder/SKILL.md` | **CORE_KEEP** | Imported, generic, source-attributed. | Ship. |
| `api-design-principles/` (with assets/refs/resources) | **CORE_KEEP** | Generic REST guidance, no GoParty deps. | Ship full directory. |
| `api-patterns/` (10 files) | **CORE_KEEP** | Generic REST/GraphQL/tRPC. | Ship. |
| `api-security-best-practices/SKILL.md` | **CORE_KEEP** | OWASP API. Generic. | Ship. |
| `architect-review/SKILL.md` | **CORE_KEEP** | Generic. | Ship. |
| `architecture/` (5 files) | **CORE_KEEP** | DDD/hexagonal/patterns. Generic. | Ship. |
| `architecture-decision-records/SKILL.md` | **CORE_KEEP** | Generic ADR guidance. | Ship. |
| `debug-issue.md`, `explore-codebase.md`, `refactor-safely.md`, `review-changes.md` | **CORE_KEEP** | CRG-helper skills (4 .md). Tied to `code-review-graph` MCP. Mention as "optional — requires CRG MCP". | Ship; document MCP dependency. |

### `hooks/`

| File | Classification | Reason | Strategy |
|---|---|---|---|
| `config-protection.cjs` | **CORE_GENERICIZE** | Universal protection pattern. Line 19 hardcodes `supabase/migrations/`. | Make `PROTECTED` array configurable via `.claude/protected-paths.json`; ship sane defaults (tsconfig/eslint/vite/postcss/package.json/`.claude/settings.json`). Plugin-supabase appends `supabase/migrations/`. **Ship as bloqueante (exit 2)**. |
| `post-edit-accumulator.cjs` | **CORE_KEEP** | Pure plumbing. No project specifics. | Ship as-is. |
| `batch-format-typecheck.cjs` | **CORE_GENERICIZE** | Pattern is universal. Lines 80-83 hardcode `tsconfig.app.json`; line 57 assumes ESLint. Lines 105-127 are journey-mapping bonus (GoParty). | Parameterize `TSC_PROJECT` (default `tsconfig.json`), `LINT_CMD` (`eslint --fix`), make journey-hint section opt-in (only if `journey-mapping` skill present). **Ship lint bloqueante; tsc warning** (matches GoParty pragmatic stance). |
| `design-quality-check.cjs` | **PLUGIN_design_system** | 9 SIGNALS arrays — heavy DS+pt-BR coupling (line 58 `Comprar agora`, line 64 Tailwind class). Warning-only (exit 0). | Move to `plugin-design-system`. **Ship as warning** (already exit 0). |
| `journey-touch-reminder.cjs` | **DROP from core, ship in `plugin-journey-mapping`** | Lines 16-41 hardcode GoParty paths (organizador/booking, anfitriao/onboarding). | Ship as plugin opt-in with config file `journey-surfaces.json`. |

### `commands/`

| File | Classification | Reason | Strategy |
|---|---|---|---|
| `code-review.md` | **CORE_GENERICIZE** | Local diff or PR via `gh`. Generic. | Replace project name; allowed-tools list with shell commands stays. |
| `review-pr.md` | **CORE_GENERICIZE** | 6-agent parallel review. Hardcodes 6 agent names. | Make agent list configurable; default = core 6. |
| `feature-dev.md` | **CORE_GENERICIZE** | 5-phase workflow. Mentions Organizador/Anfitrião/Admin (line 14). | Replace personas with `{{personas}}` parameter. |
| `plan.md` | **CORE_KEEP** | "WAIT for CONFIRM" gate is universal. Mentions personas in line 21. | Trivial parameterization. |
| `prp-plan.md`, `prp-prd.md` | **CORE_KEEP** | Adapted from PRPs-agentic-eng (Wirasm, attributed). Generic. | Ship. |
| `refactor-clean.md` | **CORE_KEEP** | Wraps `refactor-cleaner` agent. Knip/depcheck. | Ship. |
| `design-check.md` | **PLUGIN_design_system** | Tied to DESIGN.md pipeline. | Move to plugin. |
| `save-session.md` | **CORE_KEEP** | Pure session capture. | Ship. |
| `init-project.md` | **DROP — replaced by `npx create-arthus-harness`** | Bootstrapping is now the npm CLI's job. Keep as legacy reference if needed; primary flow is npx. | The skill `init-project` (secondary distribution) replaces this. |

### `templates/`

| File | Classification | Reason | Strategy |
|---|---|---|---|
| `ADR.md` | **CORE_KEEP** | MADR 3.0 standard. | Ship. |
| `AGENT.md` | **CORE_KEEP** | Generic agent persona scaffold. | Ship. |
| `SKILL.md` | **CORE_KEEP** | Skill scaffold. | Ship. |
| `SPEC.md` | **CORE_KEEP** | Generic. | Ship. |
| `RUNBOOK.md` | **CORE_KEEP** | Incident playbook scaffold. | Ship. |
| `CONTRACTS.md` | **CORE_KEEP** | Agent handoff contracts. | Ship. |
| `TROUBLESHOOTING.md` | **CORE_KEEP** | Generic error file. | Ship. |
| `USE-CASE.md` | **CORE_KEEP** | Generic. | Ship. |

### `settings.json` — **CORE_GENERICIZE**

Line 1-83: hooks wired. Lines 41-46 reference `journey-touch-reminder.cjs` (drop in core). Lines 64, 76 reference `code-review-graph` CLI (optional MCP).

Strategy: ship a base `settings.json` with config-protection + post-edit-accumulator + batch-format-typecheck. Plugins append via merge tool (`arthus-harness install <plugin>` patches settings.json).

## 3. The 3 layers of protection

### Process layer (hooks + slash commands)

**Bloqueantes ship in core:**
- `config-protection.cjs` — exit 2 on protected file edits without auth keywords (universal value).
- `batch-format-typecheck.cjs` — exit 2 on lint errors in edited files (universal). Tsc stays warning-only.
- `/plan` command — gate "WAIT for CONFIRM" is non-negotiable to fight vibes-coding (Karpathy guideline).

**Warnings ship in core:**
- `post-edit-accumulator.cjs` — bookkeeping only.

**Bloqueantes ship in plugins:**
- `journey-touch-reminder.cjs` → `plugin-journey-mapping` (warning).
- `design-quality-check.cjs` → `plugin-design-system` (warning).

**Slash commands:** core ships `/code-review`, `/review-pr`, `/feature-dev`, `/plan`, `/prp-plan`, `/prp-prd`, `/refactor-clean`, `/save-session`. Plugins add `/design-check` (DS plugin), and stack-specific commands as needed.

### Technical invariants (MISSION.md / supabase-rls-pattern / asaas-integration)

- **Core skeleton:** ship a `MISSION.md.template` with sections: §1 Security/Auth, §2 Money (placeholder), §3 Data (placeholder), §6 Migration hygiene. The *form* is universal (numbered invariants reviewers can cite as "MISSION §1.2"); the *content* is project-specific. The init CLI prompts user for invariants and fills the template.
- **Plugin invariants:** `supabase-rls-pattern`, `supabase-migration` ship with `plugin-supabase`. `asaas-integration` ships with `plugin-payment-asaas`. Adding the plugin auto-wires the skill in security-reviewer/database-reviewer via settings merge.

### Experience invariants (principios-de-experiencia / experience-principles skill)

**Strategy A (literal default — ship as-is):**
- Skill `experience-principles/SKILL.md` ships **verbatim** with the 4 sensações (Confiança, Alívio, Clareza, Comemoração) + 5 réguas operacionais.
- Companion file `Docs/produto/principios-de-experiencia.md.template` ships in core scaffold (init CLI creates it).
- Wired by default in `code-reviewer` and `a11y-architect` agents (via skills frontmatter).
- **Rationale:** Cristiano's 4 sensações are an opinionated stance that costs nothing to inherit and gives every new project a non-trivial UX baseline immediately. Most users won't customize; those who do will appreciate the reference.

**Strategy C (customization framework — opt-in):**
- Provide `arthus-harness customize experience-principles` CLI command that:
  1. Copies skill+md to `.claude/skills/experience-principles-custom/` (override path).
  2. Opens guided 4-question wizard: "What is your product's core promise? What anxiety does it relieve?…"
  3. Generates project-specific sensações + réguas.
- Ship a meta-skill `experience-principles-customizer` documenting the *process* (how the GoParty principles emerged from observed patterns over time, not from brainstorm).

## 4. Surprises / gotchas

- **`code-reviewer.md` and `a11y-architect.md` declare 4 skills each (`skills: design-system-enforcement, i18n-pt-br, experience-principles, journey-mapping`).** If the harness ships these agents but the user doesn't install the corresponding plugins, the skills are missing — Claude loads the agent but the skills frontmatter references nothing. Same broken-skills bug the archived antigravity agents had. **Fix:** init CLI must either (a) ship core+all-plugins by default and let user remove, or (b) run a post-install validator that strips skill refs to skills that aren't installed.
- **`design-quality-check.cjs` line 58** has pt-BR specific CTA blocklist (`Comprar agora`, `Saiba mais`, `Cadastre-se grátis`) mixed with English (`Get Started`, `Click here`). Looks generic — isn't. Plugin should split per-locale.
- **`batch-format-typecheck.cjs` line 81** hardcodes `tsconfig.app.json` (Vite convention, not standard). Default Node/Next projects use `tsconfig.json`. Surprise breakage for first non-Vite user.
- **`journey-mapping` skill is more generic than it looks.** The pattern (jornada per persona, recovery paths, multi-actor handoffs, a11y branches) is gold for any product with non-trivial UX. Worth promoting from plugin to core (with paths configurable).
- **`code-review-graph` MCP dependency** is referenced in `settings.json` lines 64 and 76. It's a `uv tool install` Python package — adding non-trivial setup burden. Recommend ship as **optional** with graceful degradation (hook should noop if `code-review-graph` not in PATH).
- **All 10 imported antigravity agents** have broken `skills:` frontmatter referencing skills that don't exist in `.claude/skills/`. They've been sitting broken in production. Either the user never invoked them, or the skill loader silently ignores missing refs. Worth confirming Claude Code's actual behavior before shipping.

## 5. Recommendation

**Ship in v0.1:**
1. **Core CLI (`npx create-arthus-harness <name>`) generating:** `.claude/{settings.json, hooks/, agents/, skills/, commands/, templates/}` with the **CORE_KEEP + CORE_GENERICIZE** items only — that's 4 agents (code-reviewer, typescript-reviewer, silent-failure-hunter, refactor-cleaner) wired with experience-principles + journey-mapping skills + 8 commands + 8 templates + 3 hooks (config-protection, post-edit-accumulator, batch-format-typecheck) parameterized via init prompts.
2. **One reference plugin: `plugin-supabase`** — proves the plugin model. Ships `database-reviewer` agent + `supabase-rls-pattern` skill + `supabase-migration` skill. Install via `npx create-arthus-harness add-plugin supabase`. Establishes pattern for future plugins.
3. **Experience principles literal (Strategy A) + Strategy C scaffold** — ship the GoParty 4 sensações verbatim as the default ethos. Include `arthus-harness customize experience-principles` as a stretch goal (can be a doc-only walkthrough in v0.1, full CLI in v0.2).

**Defer to v0.2+:**
1. **The 10 imported antigravity agents** (code-archaeologist, debugger, devops-engineer, etc.). They have broken `skills:` declarations and need either skill stubs created or wholesale rewrite. Not worth blocking v0.1.
2. **Plugins for design-system, payment-asaas, i18n-pt-br, journey-mapping.** Wait until 1-2 outside users actually request them — risk of over-fitting to GoParty. The CLI scaffold should leave clear extension points (`.claude/plugins/` directory + manifest format) but not pre-build these.
