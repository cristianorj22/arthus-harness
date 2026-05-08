# Architecture

How arthus-harness is laid out and how the render pipeline works.

## Top-level folders

```
arthus-harness/
├── bin/                # CLI entrypoints
│   ├── create.mjs      # `npx create-arthus-harness <name>` — bootstraps a new project
│   └── cli.mjs         # `arthus-harness <command>` — sync, add-plugin, doctor
├── src/                # implementation
│   ├── index.mjs       # main scaffold flow (create.mjs → here)
│   ├── cli.mjs         # cli.mjs subcommand dispatcher
│   ├── plugin-loader.mjs    # parses plugin.yaml, resolves files, returns Contributions
│   ├── conflict-resolver.mjs # validates the union of contributions
│   ├── config-merger.mjs     # merges files, scripts, deps, settings.json hooks
│   ├── render.mjs            # eta wrapper
│   ├── memory-slug.mjs       # ~/.claude/projects/<slug>/ algorithm
│   ├── prompts.mjs           # interactive prompt loop
│   ├── sync.mjs              # `arthus-harness sync` implementation
│   ├── add-plugin.mjs        # `arthus-harness add-plugin <name>`
│   ├── doctor.mjs            # `arthus-harness doctor`
│   ├── git.mjs               # git init helpers
│   └── utils.mjs             # walkFiles, pathExists, ensureDir, readJson
├── core/               # files that ship in every generated project
│   ├── .claude/        # settings.json.eta + hooks/ + experience-principles skill
│   └── Docs/produto/   # principios-de-experiencia (literal + framework variants)
├── plugins/            # opt-in feature bundles
│   ├── supabase/
│   ├── design-system-pipeline/
│   ├── payment-asaas/
│   ├── i18n/
│   └── e2e-playwright/
├── presets/            # named bundles of plugins
│   ├── goparty-like.yaml
│   ├── web-supabase.yaml
│   └── minimal.yaml
├── docs/               # this file + plugin-authoring + upgrade-guide
├── tests/              # node:test suite
│   ├── snapshot.test.mjs
│   ├── conflict-resolver.test.mjs
│   ├── plugin-loader.test.mjs
│   └── snapshots/<preset>/   # generated fixtures
└── package.json
```

## Render pipeline

```
   ┌──────────────────┐
   │ user runs        │
   │ create-arthus…   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐    interactive prompts            answers
   │ prompts.mjs      │ ─────────────────────────▶  { projectName, plugins, … }
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ loadCore(core/)  │ ──▶ Contribution { name: "core", files, settingsHooks, … }
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────────────┐
   │ for each plugin in answers.plugins:  │
   │   loadPlugin(plugins/<name>/)        │ ──▶ Contribution[] (one per plugin)
   └────────┬─────────────────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ detectConflicts([...])   │ ──▶ throws on hard errors, warns on soft
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ mergeContributions(...)  │ ──▶ { files, package, ciJobs, env }
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ for each merged file:    │
   │   if .template:          │
   │     render(content, ctx) │
   │   write to disk          │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ write .arthus-harness    │  ── lockfile: version, answers, plugin list,
   │   .json (lockfile)       │     fingerprints (sha256 of every file written)
   └──────────────────────────┘
```

The lockfile is the contract sync relies on later. See [`upgrade-guide.md`](upgrade-guide.md).

## Plugin contract — surfaces

A `Contribution` (returned by `loadPlugin`) has these surfaces:

| Surface | Where it lands | Ownership |
|---|---|---|
| `files[]` | anywhere in project root | first-wins (after conflict check) |
| `claude.skills` | `.claude/skills/<name>/SKILL.md` (and subfiles) | folder-per-skill, no overlap allowed |
| `claude.agents` | `.claude/agents/<name>.md` | one file, no overlap |
| `claude.hooks` | `.claude/hooks/<name>.cjs` | one file, no overlap |
| `claude.commands` | `.claude/commands/<name>.md` | one file, no overlap |
| `claude.settingsHooks` | merged into `.claude/settings.json` `hooks` arrays | append-only, multiple plugins ok |
| `docs[]` | anywhere (typically `Docs/`) | first-wins |
| `package.scripts` | `package.json` `scripts` | one plugin per script name (hard error) |
| `package.deps` | `package.json` `dependencies` | merged, higher semver wins |
| `package.devDeps` | `package.json` `devDependencies` | same |
| `ci.jobs` | `.github/workflows/ci.yml` jobs | dedup by name, append |
| `env[]` | `.env.example` | dedup by name |
| `prompts[]` | feeds into context for eta rendering | scoped to that plugin's templates |

The conflict resolver enforces these rules during `detectConflicts`. Source: `src/conflict-resolver.mjs`.

## Memory slug algorithm

Used to compute the path under `~/.claude/projects/<slug>/memory/`. Implementation: `src/memory-slug.mjs`.

```
1. slugify(projectName)
   → lowercase, [a-z0-9-] only, strip leading/trailing dashes
   → e.g. "Go Party!" → "go-party"

2. tryGetRemote(targetDir)
   → git config --get remote.origin.url, with 1.5s timeout
   → most fresh scaffolds: targetDir doesn't exist yet → returns null

3. if no remote:
     return slug
   else:
     hash = sha256(remote).slice(0, 6)
     return `${slug}-${hash}`
```

**Why include the remote hash?** Two unrelated projects named "blog" by different teams shouldn't collide in the global memory store. The hash disambiguates without forcing global uniqueness on the project name.

**Why 6 chars?** `16^6 = 16M` possible suffixes — collision-resistant for any realistic number of projects per developer, and short enough to type. The trade-off is portability vs uniqueness; 6 hex chars is the chosen balance.

**Why is it OK to be `null` on first scaffold?** The slug stabilizes once the lockfile is written. On the next `sync`, if a remote exists by then, the hash is recomputed and added — but the lockfile carries the original slug forward, so no churn.

## Why eta over Mustache / Handlebars

- **Mustache** is logic-less. Conditional blocks (`<% if (cond) { %>`) need ugly partials.
- **Handlebars** is heavy and has its own DSL.
- **eta** is small (one dep), uses real JavaScript inside `<% %>`, and runs on Node natively.

We disable HTML auto-escape (`autoEscape: false`) because we're generating code, not markup. We enable `useWith` (`useWith: true`) so templates write `<%= projectName %>` instead of `<%= it.projectName %>`. See `src/render.mjs`.

## Why these layers

The triple of (`core/`, `plugins/`, `presets/`) gives:

- **Always-on baseline** — `core/` is always rendered, ensures every generated project has the same Claude harness, settings hooks, and experience principles.
- **Opt-in feature bundles** — `plugins/` lets a project pick the relevant invariants without inheriting unrelated weight (a SaaS without payments doesn't need Asaas).
- **Curated bundles** — `presets/` removes decision paralysis. "I want a stack-shaped app" → one preset name.

The split also keeps the contract stable: changing `core/` is breaking (major bump); adding plugins is non-breaking (minor bump).

## The 5-layer documentation stack

Every project bootstrapped from arthus-harness gets 5 distinct layers of documentation, each with a different cadence, severity, and reviewer:

| # | Layer | Where | Severity of violation | Cadence |
|---|---|---|---|---|
| 1 | **Process** | `.claude/hooks/*.cjs` + `/code-review` | Bloqueante (exit 2) | Real-time on every Edit/Write |
| 2 | **Technical invariants** | `MISSION.md` | Incident-grade — rotate keys, post-mortem | Cross-cutting, rare changes |
| 3 | **Operational principles** | `Docs/produto/PRODUTO.md` `§Princípios operacionais` | Discussion-grade — cite in PR | Stable, refined over months |
| 4 | **Contractual invariants** | `Docs/SPEC.md` (Spec-Driven Development) | Review-grade — PR rejected | Per-component, versioned |
| 5 | **Emotional invariants** | `Docs/produto/principios-de-experiencia.md` | Skill auto-fire on UI/copy | Rare changes, per-product |

The layers are **complementary, not overlapping**:

- **MISSION** ≠ **SPEC**: MISSION protects users/business (security, integrity); SPEC protects components from each other (contracts). MISSION violations are incidents; SPEC violations are reviews.
- **MISSION** ≠ **operational principles**: MISSION is non-negotiable absolute; operational principles guide trade-offs when MISSION is silent.
- **SPEC** ≠ **PRODUTO**: SPEC is per-boundary contract; PRODUTO is cross-cutting product vision.

The **Spec-Driven Development** method (layer 4) is documented in [`core/Docs/sdd-guide.md.eta`](../core/Docs/sdd-guide.md.eta) and uses a status lifecycle (`[STUB]` / `[DRAFT]` / `[STABLE]`) with mandatory ADRs for breaking changes to `[STABLE]` contracts.

The `code-reviewer` agent enforces drift between code (public surfaces) and SPEC.md as **MEDIUM** severity in v1.0; consider escalating to BLOCKING in a future version once teams adapt.
