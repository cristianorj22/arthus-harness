---
name: harness-doctor
description: Use this skill at SessionStart (or on demand) to report arthus-harness drift, plugin state, and recommended sync actions. Reads `.arthus-harness.json` and runs `npx arthus-harness doctor` — informational only, never blocks.
context: main
allowed-tools: [Read, Glob, Bash]
memory: project
disable-model-invocation: false
---

# Harness Doctor

## Purpose

Report whether the project's installed arthus-harness is up to date and consistent with declared plugins. Detects drift between `.arthus-harness.json` (lockfile) and the live `.claude/` tree, surfaces plugin recommendations, and tells the user whether `arthus-harness sync` is needed.

This is a **diagnostic** skill — never modifies the project. The user runs `sync` themselves once they've reviewed findings.

## When to use

- Beginning of a new session in a project that has `.arthus-harness.json` (auto-fire candidate).
- User asks "is my harness up to date?" / "any harness drift?" / "run harness doctor".
- After pulling main and noticing harness files changed.
- Before starting a major feature, to ensure baseline is current.

## When NOT to use

- Project doesn't have `.arthus-harness.json` — that means arthus-harness is not installed; suggest `init-project` skill instead.
- User wants to **change** harness state (add plugin, upgrade) — that's `arthus-harness sync` / `arthus-harness add`, not doctor.
- User wants to author harness assets — regular editing.

## Steps

1. **Locate lockfile** — verify: `.arthus-harness.json` exists in cwd. If not, exit politely:
   > No `.arthus-harness.json` found. This project doesn't appear to use arthus-harness. Want me to bootstrap it? (use `init-project` skill).

2. **Read lockfile** — parse `.arthus-harness.json`. Capture:
   - `harnessVersion` (semver of arthus-harness used)
   - `plugins[]` (installed plugin names + versions)
   - `principlesStrategy` (A / C / both)
   - `installedAt` timestamp

3. **Run doctor CLI** — invoke:

   ```bash
   npx arthus-harness@latest doctor --json
   ```

   Capture stdout (JSON report). If the CLI is unreachable, fall back to local checks (step 4) and note "CLI unreachable, partial report".

4. **Local sanity checks** (always run, even if CLI worked) — verify each:
   - `.claude/settings.json` exists and is valid JSON.
   - All hooks referenced in `settings.json` exist on disk.
   - All agents declared in lockfile exist in `.claude/agents/`.
   - All skills declared in lockfile exist in `.claude/skills/`.
   - `MISSION.md`, `CLAUDE.md`, `Docs/produto/principios-de-experiencia.md` exist.

5. **Compose report** — print to user:

   ```
   ## Harness doctor — <projectName>

   Installed: arthus-harness@<version> · principles: <A|C|both>
   Plugins:   <list with versions>

   ### Drift
   - <N items, or "none">

   ### Missing files
   - <list, or "none">

   ### Recommendations
   - <"All good — no action needed" | "Run `npx arthus-harness sync` to upgrade to <newer version>" | "Plugin <X> declared but missing — run `npx arthus-harness add <X>`">
   ```

6. **Suggest next action** — one line. Never run the action automatically. The user decides.

## Examples

### Example 1 — clean project

**Input:** SessionStart auto-fire (project has `.arthus-harness.json`)

**Output:**
```
Harness doctor — my-saas
Installed: arthus-harness@1.0.2 · principles: A
Plugins: supabase@1.0.1, design-system@1.0.0

Drift: none
Missing files: none
Recommendation: All good — no action needed.
```

### Example 2 — drift detected

**Input:** "run harness doctor"

**Output:**
```
Harness doctor — client-mvp
Installed: arthus-harness@1.0.0 · principles: both
Plugins: supabase@1.0.0

Drift:
  - core: 1.0.0 installed → 1.1.3 available
  - plugin-supabase: 1.0.0 installed → 1.0.4 available (security patch)

Missing files:
  - .claude/agents/silent-failure-hunter.md (declared, not found)

Recommendation: Run `npx arthus-harness sync` to apply patches and restore missing files.
```

## Escalation

- If `npx arthus-harness@latest` is unavailable → run local checks only and report "CLI unreachable; cannot detect upstream version".
- If `.arthus-harness.json` is malformed → tell the user; suggest reinstall (`init-project` after backing up custom assets).
- Never: auto-run `sync` or modify any file. Doctor is read-only.

## References

- Lockfile schema: `arthus-harness/src/lockfile.schema.json`
- Sister skill (install): `init-project`
- CLI source: `arthus-harness/bin/`
