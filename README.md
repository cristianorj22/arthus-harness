# arthus-harness

<p align="center">
  <strong>English</strong> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

> Generic Claude Code harness engineering kit. Bootstraps new projects with **5 layers of protection** (process · technical invariants · operational principles · contractual invariants via SDD · experience invariants) — extracted from `go-party-venue-hub`.

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick start

```bash
npx create-arthus-harness my-project
cd my-project
```

The wizard asks **3 questions** (preset · principles · git-init) and generates a project with:

- 5 specialist agents (`code-reviewer`, `silent-failure-hunter`, `a11y-architect`, `refactor-cleaner`, `product-manager`)
- 3 skills (`experience-principles`, `init-project`, `harness-doctor`)
- 3 hooks (`config-protection`, `post-edit-accumulator`, `batch-format-typecheck`)
- 1 slash command (`/code-review`)
- 8 doc templates (ADR, RUNBOOK, SPEC, etc.)
- **5-layer doc stack**: `MISSION.md` (technical invariants) · `Docs/SPEC.md` (component contracts, Spec-Driven Development) · `Docs/sdd-guide.md` (SDD method) · `Docs/produto/PRODUTO.md` (vision + operational principles) · `Docs/produto/principios-de-experiencia.md` (emotional invariants)
- 5-job CI workflow (lint, design-check, type-check, secrets-scan, npm-audit)
- `.arthus-harness.json` lockfile for `arthus-harness sync`

## What is this?

Cristiano spent months building a sophisticated Claude Code harness in `go-party-venue-hub`: 17 specialist agents, 12 skills, 4 hooks, 7 slash commands, 8 templates, MCP integrations, auto-memory, design-system pipeline. This repo extracts the **forms** (universal disciplines) into a reusable kit while leaving **content** (Asaas, Veriff, Supabase RLS, Confiança/Alívio) in opt-in plugins.

**The Job-To-Be-Done.** When you start a new project, you want your discipline of "produto-com-sensação" + your habit of operating Claude Code already installed — without remembering how you got there in the previous project.

## What this is NOT

- ❌ Boilerplate React/Next/Vite (you bring your stack)
- ❌ create-next-app / Yeoman / Cookiecutter (those generate product code)
- ❌ SaaS template / starter kit
- ❌ Runtime dependency (one-shot generator, zero footprint after bootstrap)

## The 5 layers of protection

> **MISSION** = nunca quebrar tecnicamente · **SPEC** = contratos entre componentes · **PRODUTO §Princípios** = como decidir tradeoffs · **principios-de-experiencia** = nunca quebrar emocionalmente. Cada camada tem severidade e cadência diferentes — não fundir. Detalhe em [`docs/architecture.md`](docs/architecture.md).

### 1. Process layer — hooks + slash commands

Every commit goes through:

- **`config-protection.cjs`** (PreToolUse, **bloqueante**) — blocks edits to `tsconfig`, `eslint`, `package.json`, `MISSION.md`, etc. without explicit user authorization. Prevents agents from silencing errors by relaxing config.
- **`batch-format-typecheck.cjs`** (Stop, **lint bloqueante / tsc warning**) — runs ESLint scoped to files edited in the session at end. Bloqueia Stop em lint errors. tsc é warning-only (TS debt is incremental).
- **`post-edit-accumulator.cjs`** (PostToolUse, **warning**) — auto-memory: records edited files in `~/.claude/projects/<slug>/memory/`.
- **`/code-review`** slash command — runs 5 reviewers in parallel before commit.

### 2. Technical invariants — MISSION.md

Skeleton ships with §1-§7 sections (Segurança, Idempotência, RBAC, Migrations, Quality, Process). User fills TODOs at scaffold time via interview. Plugins auto-fill (e.g., `plugin-supabase` populates §1 with RLS rules).

### 3. Operational principles — `Docs/produto/PRODUTO.md §Princípios operacionais`

3-7 actionable principles distinct from MISSION. Each must be (a) actionable in code review, (b) different from MISSION (has tradeoff, can be broken with justification), (c) short.

Examples (commented in template — replace with your own): "Humano no comando" · "Citável por padrão" · "Falha vocal" · "LGPD-first" · "Custo previsível".

### 4. Contractual invariants — `Docs/SPEC.md` (Spec-Driven Development)

Formal specification of contracts between components — `Input → Output → Acceptance → Status`. Status lifecycle `[STUB]` / `[DRAFT]` / `[STABLE]`. Breaking change to `[STABLE]` requires ADR + migration plan.

`code-reviewer` agent flags **MEDIUM** when public surface changes without SPEC update; **HIGH** when breaking `[STABLE]` without ADR. Method in [`core/Docs/sdd-guide.md.eta`](core/Docs/sdd-guide.md.eta).

### 5. Experience invariants — `Docs/produto/principios-de-experiencia.md`

The peça-IP. Two strategies coexist:

- **Strategy A (literal default).** Ships GoParty's 4 sensações-âncora (Confiança, Alívio, Clareza, Comemoração) + 5 réguas operacionais — verbatim, with comments marking GoParty-specifics for easy override.
- **Strategy C (framework opt-in).** Ships an empty-but-typed scaffold + manifest.yaml — define your own N sensações, M réguas; skill `experience-principles` reads dynamically.

Skill `experience-principles` is **content-agnostic** — it reads whatever's in your project's file. No GoParty knowledge hardcoded.

## CLI commands

```bash
# Bootstrap a new project
npx create-arthus-harness my-project [--preset=goparty-like|web-supabase|minimal] [--principles=A|C|both]

# Inside an existing project bootstrapped from arthus-harness:
arthus-harness sync                 # update templates to latest version, .rej on conflicts
arthus-harness sync --interactive   # prompt per conflict
arthus-harness sync --strict        # fail on any conflict (for CI)
arthus-harness doctor               # check drift between project and current arthus version
arthus-harness add-plugin <name>    # add a plugin to existing project
```

## Plugins (opt-in)

| Plugin | What it ships |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` pipeline + `design:check` validator + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` & `supabase-migration` skills + edge-function templates |
| `e2e-playwright` | `storageState` pattern + persona fixtures + `AxeBuilder` helper + Playwright config |
| `i18n` | JSON tree validator + `i18n-source-of-truth` skill + locale templates |
| `payment-asaas` | Asaas webhook HMAC + idempotency middleware + `asaas-integration` skill |

## Distribution

- **Primary:** npm package `create-arthus-harness` (this works with `npx` out of the box).
- **Source:** `github.com/cristianorj22/arthus-harness` — public, tags = npm versions, releases auto-published via GH Actions.

## Versioning

- Generator-style with snapshot lockfile (`.arthus-harness.json`).
- `arthus-harness sync` re-renders templates using your saved answers, applies 3-way merge on user-modified files. Default non-blocking (writes `.rej`); opt-in interactive.
- SemVer: major bumps signal breaking template changes; minor adds plugins/agents.

## Documentation

- [PLAN.md](PLAN.md) — master plan (architecture + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 architectural decisions with rationale
- [PROVENANCE.md](PROVENANCE.md) — what came from `go-party-venue-hub` (disciplina vs dust)
- [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md) — 5 critical decisions resolved
- [CHANGELOG.md](CHANGELOG.md) — version history
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — how to write a plugin
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` deep-dive
- [docs/architecture.md](docs/architecture.md) — folder structure + plugin contract

## Yak-shaving warning

> If you spend > 2 hours tuning arthus-harness instead of the actual project, **stop**.

The harness is the means, not the end. Open an issue at the source repo and move on. The `init-project` skill is designed to force the next prompt to be about the **product**, not the harness.

## License

MIT © 2026 Cristiano Moraes
