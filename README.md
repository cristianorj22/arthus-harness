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

> **The discipline you spent months tuning in your last project, installed in 30 seconds in your next.**

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`arthus-harness` is a Claude Code scaffolder that bootstraps new projects with **5 layers of protection** pre-installed — agents, skills, hooks, slash commands, doc templates, operational principles, and emotional invariants. Not a stack boilerplate. Not a SaaS starter kit. It's your **way of operating Claude Code**, packaged into one `npx` command that runs once, leaves the project ready to work with discipline, and disappears. You start the next project **above** where the previous one ended — not from scratch.

## Quick start

```bash
npx create-arthus-harness my-project
cd my-project
```

What you'll see:

```
✔ Project name: my-project
✔ Preset: minimal
✔ Principles strategy: A (literal default)
✔ Init git? Yes

Created my-project/
  → 9 agents, 4 skills, 3 hooks, 5 slash commands
  → MISSION.md, SPEC.md, principios-de-experiencia.md ready
  → .git initialized

cd my-project && claude
```

## Why this exists

You spend three months tuning your Claude Code on a project. You write an agent that catches silent bugs. You configure a hook that blocks Claude from "fixing" `tsconfig` to make lint pass. You document UX rules the reviewer learned to apply. You create a slash command that runs 3 reviewers in parallel before every commit. It works beautifully. You know what each piece does and why it's there.

Then you open a new project.

And there's Claude Code back to factory state. No agents. No hooks. No `MISSION.md` that prevented you from making the same RLS mistake four times. No principles file that made every error message be born saying the next step, instead of blaming the user. You look, sigh, and start manually copying `.claude/` from the old project — knowing half the content is domain-specific and will pollute the new one, and the other half is universal but you don't have energy to separate.

That's the problem. Claude Code lets you **create projects fast**, but discipline doesn't travel with you. Every new project regresses to the world's average level. The compounding effect of you getting better with each project doesn't happen — or it happens **inside** a single project, and dies when it dies.

`arthus-harness` extracts the universal part of this (the **forms**: agents, hooks, skills, templates) and leaves domain-specific content opt-in (the **content** via plugins). You run `npx create-arthus-harness` once, answer 3 questions, and the new project is born with 9 agents, 4 skills, 3 hooks, 5 slash commands, and the 5-layer documentation stack already installed. It's not a fixed template: it has a lockfile, baseline, real 3-way merge — when the harness evolves, you pull the improvements without losing your work.

The insight is simple: every new project should start **above** where the previous one ended. Not by copying files in a panic. Not by re-learning the same lessons. Discipline is the only thing that compounds — and it only compounds if you package it somewhere that travels with you.

## Problems this solves

### 🔥 Repeated setup on every new project

> **Sound familiar?**
>
> "I started a new project and spent 4 hours manually copying `.claude/agents/` from the old project, deciding file by file what was universal and what was specific to that domain. By the time I finished, I had no energy left to start the actual feature."

**How `arthus-harness` solves it:** `npx create-arthus-harness my-project` + 3 questions. 30 seconds later you have 9 agents, 4 skills, 3 hooks, 5 slash commands installed — only the universal ones. Domain-specific content comes opt-in via plugins.

### 🔥 Agent silencing errors by relaxing config

> **Sound familiar?**
>
> "Claude was struggling to make the build pass. When I reviewed the diff, I noticed it had gone into `tsconfig.json` and turned off `strictNullChecks`. Build passed, sure. Along with 200 silenced errors. Discovered them in production 2 weeks later."

**How `arthus-harness` solves it:** The `config-protection.cjs` hook is PreToolUse and **blocking** — any Edit/Write to `tsconfig`, `eslint`, `package.json`, `MISSION.md`, migrations is interrupted with an explicit authorization request. Claude can't silence errors by relaxing config without you seeing.

### 🔥 No memory between sessions

> **Sound familiar?**
>
> "Every new session I lose 10 minutes explaining the current state to Claude: which feature I'm on, what we decided last Friday, why we didn't use the obvious approach. Three sessions a week, that's half an hour wasted — and Claude still ends up going down a path we'd already discarded."

**How `arthus-harness` solves it:** The `post-edit-accumulator` hook records edited files in auto-memory per session. Slash command `/save-session` saves a snapshot (branch, last commit, decisions, next step) read at the start of the next session. Doc templates (ADR, RUNBOOK, SPEC) give a place for architectural decisions to not live only in your head.

### 🔥 PRs without consistent checklist

> **Sound familiar?**
>
> "Today I reviewed my PR before merging and caught 3 things. Last week I reviewed another one the same size and merged without seeing anything. Wasn't bad faith — the criterion changed depending on my mood. You can't trust review that depends on how rested I was."

**How `arthus-harness` solves it:** The `/code-review` slash command invokes multiple reviewers in parallel (`code-reviewer`, `silent-failure-hunter`, `security-reviewer`, `typescript-reviewer`, `a11y-architect`) — each with its own checklist. Doesn't depend on your mood. Reviewers accumulate patterns in memory per project, getting sharper with each PR.

### 🔥 UX errors that repeat across every project

> **Sound familiar?**
>
> "Once again I let through an error message saying 'Something went wrong. Try again.' — without saying what went wrong, without saying the next step, without saying if it was the user's or the system's fault. Fourth time this year I only remember this in final review, with everything already in production."

**How `arthus-harness` solves it:** Layer 5 — `principios-de-experiencia.md` ships with 4 anchor sensations + 5 operational rules. The `experience-principles` skill is content-agnostic and auto-fires on UI/copy files. You define your rules; the skill ensures they're applied.

### 🔥 Lost architectural decisions

> **Sound familiar?**
>
> "Three months later, someone asks in PR review: 'why didn't you use X?'. Nobody remembers. I remembered at the time, wrote it in my head, thought it was obvious. Didn't document because I was on a roll. Now we're going to discuss it all over again."

**How `arthus-harness` solves it:** `ADR.md` template ships by default. Layer 4 (Spec-Driven Development) makes `Docs/SPEC.md` the formal place for component contracts. When someone breaks `[STABLE]` without an ADR, `code-reviewer` flags it HIGH.

### 🔥 Drift between code and docs

> **Sound familiar?**
>
> "I refactored the payment module, forgot to update `Docs/arquitetura/`. Six weeks later a new dev joins, reads the doc, follows it, and gets lost in code that changed. I became the onboarding bottleneck without realizing."

**How `arthus-harness` solves it:** Layer 4 (SPEC) + `code-reviewer` agent flag **MEDIUM** when public surface changes without SPEC update. `spec-keeper` skill keeps `Docs/SPEC.md` alive and requires status (`[STUB]` / `[DRAFT]` / `[STABLE]`) per contract. Outdated docs don't pass review — become a commit boundary, not a memory leak.

## What this opens up for you

### 📈 Compounding across projects

**Before:** lessons learned in project A died there.
**Now:** they become harness improvements. `arthus-harness sync` pulls updates into a live project without losing your work. Every new project starts **above** the previous one.

### 📈 Multi-project without discipline regression

**Before:** 3 parallel projects = 3 different discipline levels.
**Now:** all are born with the same documentation stack, same blocking hooks, same reviewers. Solo dev scales to N projects without "regression tax".

### 📈 Spec-Driven Development without heavy tooling

**Before:** SDD seemed like enterprise stuff with OpenAPI generators, Stoplight, dedicated QA teams.
**Now:** `Docs/SPEC.md` is Markdown with `Input → Output → Acceptance → Status` table. 3-tier status lifecycle. SDD finally fits in a solo project.

### 📈 Contracts as guardrails, not ceremony

**Before:** "let's formalize the contract" became a meeting + Notion doc nobody read.
**Now:** the contract lives next to the code, in the same PR. Breaking `[STABLE]` requires ADR. Breaking `[DRAFT]` is free. Formality proportional to maturity.

### 📈 Opt-in plugins instead of bloated starter kit

**Before:** SaaS template came with everything bundled even if you'd only use half.
**Now:** core ships 9 universal agents. 7 plugins come opt-in. Lean footprint, clean context for Claude.

### 📈 Consistent UX without UX team

**Before:** basic UX rules lived only in your head.
**Now:** Layer 5 turns your rules into automatic code review via auto-firing skill. Quality of UX team without having UX team.

## Who this is for

### ✅ Use `arthus-harness` if you...

- Have operated Claude Code enough to have opinions about what's missing in default setup — your own agents, blocking hooks, skills with `paths:` scoping, custom slash commands.
- Are a solo dev or small team (≤5 people) without separate QA / UX / DevOps, and want those disciplines installed as code in the project.
- Work on multiple parallel projects and are tired of each one regressing.
- Believe technical discipline and care for UX/UI are different kinds of invariant — and want a tool that respects that distinction (separate layers, separate severities).
- Want architectural decisions to become ADRs, contracts to become SPEC, principles to become automatic reviewer.

### ❌ Don't use it if you...

- Are looking for a React/Next/Vite template with auth + landing + dashboard ready. `arthus-harness` is stack-agnostic — you bring the stack.
- Want to "start vibing with Claude Code" without yet understanding what an agent, hook, skill, slash command is. The harness is overhead for someone on day 1; become productive in Claude Code first, then come package your discipline.
- Work in a large team with dedicated QA/SRE/DevRel — those folks already provide externally what the harness encapsulates as code. ROI drops.
- Don't tolerate minimum ceremony. The 5 layers require habit of keeping `MISSION` / `SPEC` / principles updated. If you want "0 friction to merge anything", the harness will bother you — on purpose.

## The 5 layers of protection

| # | Layer | Doc | Severity of violation |
|---|---|---|---|
| 1 | **Process** | hooks `.cjs` + slash commands | Blocking (exit 2) |
| 2 | **Technical** (non-negotiable) | `MISSION.md` | Incident-grade (rotate keys, post-mortem) |
| 3 | **Operational principles** | `PRODUTO.md §Princípios` | Discussion (cite in PR) |
| 4 | **Contractual (SDD)** | `SPEC.md` + `sdd-guide.md` | Review (PR rejected) |
| 5 | **Emotional** | `principios-de-experiencia.md` | Skill auto-fire on UI/copy |

Each layer with different severity and cadence — don't merge them. Detail in [`docs/architecture.md`](docs/architecture.md).

## CLI commands

```bash
# Bootstrap a new project
npx create-arthus-harness my-project
# → 30s, 3 questions, project ready to use Claude Code with discipline

# Update existing project when harness evolves
arthus-harness sync
# → 3-way merge: untouched files auto-update; modified ones get .rej

# Diagnose drift
arthus-harness doctor
# → reports current vs installed version + plugins + missing files

# Add plugin to existing project
arthus-harness add-plugin supabase
# → plugin contributions merged into .claude/ + package.json + .env.example
```

## Plugins (opt-in)

| Plugin | What it ships |
|---|---|
| `design-system-pipeline` | `DESIGN.md → src/index.css` pipeline + `design:check` validator + `/design-check` slash command + `design-quality-check.cjs` hook |
| `supabase` | `database-reviewer` agent + `supabase-rls-pattern` & `supabase-migration` skills + edge-function templates |
| `e2e-playwright` | `storageState` pattern + persona fixtures + `AxeBuilder` helper + Playwright config |
| `i18n` | JSON tree validator + `i18n-source-of-truth` skill + locale templates |
| `payment-asaas` | Asaas webhook HMAC + idempotency middleware + `asaas-integration` skill |
| `journey-mapping` | `Docs/produto/jornadas/` + `journey-touch-reminder` hook (reminds when you touch code in a surface covered by a journey) |
| `mcp-code-review-graph` | code-review-graph MCP server (Tree-sitter knowledge graph) + 4 helper skills + 2 settingsHooks. Requires `uv` + `uv tool install code-review-graph`. |

## Comparison

| | `arthus-harness` | `create-t3-app` | `cookiecutter` | manual `cp -r` |
|---|---|---|---|---|
| Scaffolds `.claude/` | ✅ | ❌ | ❌ | ✅ (manual) |
| Scaffolds product code | ❌ | ✅ | ✅ | ✅ |
| Updatable (`sync`) with 3-way merge | ✅ | ❌ | ❌ | ❌ |
| Opt-in plugins | ✅ | ⚠️ via opts | ⚠️ via hooks | ❌ |
| Stack-agnostic | ✅ | ❌ (Next-only) | ✅ | ✅ |
| 5-layer doc stack | ✅ | ❌ | ❌ | ❌ |

## Built on shoulders of

- [`create-t3-app`](https://create.t3.gg) — CLI scaffolder pattern + opinionated philosophy
- [`cookiecutter`](https://cookiecutter.readthedocs.io) — template lifecycle + hook system inspiration
- [Anthropic Skills](https://github.com/anthropics/skills) — skill format spec
- [`PRPs-agentic-eng`](https://github.com/Wirasm/PRPs-agentic-eng) by Wirasm — slash command patterns adapted (`/code-review`, `/plan`, `/feature-dev`)
- [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) — multi-language README pattern
- 6 months operating a real production marketplace — where the agents/skills/hooks were battle-tested before becoming a harness

## Documentation

- [PLAN.md](PLAN.md) — master plan (architecture + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 architectural decisions with rationale
- [PROVENANCE.md](PROVENANCE.md) — discipline vs dust audit
- [CHANGELOG.md](CHANGELOG.md) — version history
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — how to write a plugin
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` deep-dive
- [docs/architecture.md](docs/architecture.md) — folder structure + plugin contract

## Yak-shaving warning

> If you spend > 2 hours tuning arthus-harness instead of the actual project, **stop**.

The harness is the means, not the end. Open an issue and move on. The `init-project` skill is designed to force the next prompt to be about the **product**, not the harness.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## License

MIT © 2026 Cristiano Moraes
