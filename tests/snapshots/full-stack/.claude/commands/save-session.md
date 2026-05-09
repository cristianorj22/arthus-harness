---
description: Save current session state to .claude/session-data/ so the next session can pick up with full context.
allowed-tools: ["Read", "Write", "Glob", "Grep", "Bash(git diff:*)", "Bash(git log:*)", "Bash(git status:*)", "Bash(git branch:*)", "Bash(npm run type-check:*)", "Bash(npm run lint:*)", "Bash(mkdir:*)"]
---

# /save-session

Capture what happened — what was built, what worked, what failed, what's left — and write it to a dated file in the **project-local** session store.

## When to use

- End of a working session before closing.
- Before context limits force compaction (run this first, then start fresh).
- After solving a thorny problem worth remembering.
- Any time you're handing off to a future session.

## Process

### 1. Gather context

- `git diff` and `git diff --staged` — see what changed.
- Recall what was discussed, attempted, decided, abandoned.
- Note any errors hit and how (or if) they were resolved.
- Run quick validation if relevant: `npm run type-check`, `npm run lint`.

### 2. Ensure folder exists

```bash
mkdir -p .claude/session-data
```

This is project-local (gitignored — see `.gitignore`) — different from `~/.claude/session-data/` global.

### 3. Write the file

Path: `.claude/session-data/YYYY-MM-DD-<short-id>-session.md`

Short-id: 6-12 chars `[a-z0-9-]`. Examples: `auth-fix`, `payment-flow`, `bug42-checkout`.

### 4. Populate every section

An incomplete file is worse than honest "Nothing yet" entries. Use the template below verbatim — write "N/A" rather than skipping.

### 5. Show file to user, ask for confirmation

```
Session saved to .claude/session-data/<filename>

Anything to correct or add before we close?
```

Edit if asked.

---

## Template

```markdown
# Session: YYYY-MM-DD

**Started:** <approx>
**Last updated:** <now>
**Project:** app
**Branch:** <git branch>
**Topic:** <one line>

---

## What we are building

<1-3 paragraphs. Someone with zero memory of this session must understand
the goal: what / why / how it fits into the larger system.>

---

## What WORKED (with evidence)

<Only confirmed working. For each, the evidence: test passed, ran in browser,
Postman 200, DB row visible, etc. Without evidence → move to "Not tried".>

- **<thing>** — confirmed by: <specific evidence>

If nothing yet: "Nothing confirmed working yet — all approaches still in progress or untested."

---

## What did NOT work (and exactly why)

<The most important section. For each failure, the exact reason so the next
session doesn't blindly retry. "didn't work" is not useful.>

- **<approach>** — failed because: <error / reason>

If nothing failed: "No failed approaches yet."

---

## What has NOT been tried yet

- <approach / idea>

If nothing queued: "No specific untried approaches identified."

---

## Current state of files

| File | Status | Notes |
|---|---|---|
| `path/to/file.ts` | Complete    | <what it does> |
| `path/to/file.ts` | In progress | <what's done, what's left> |
| `path/to/file.ts` | Broken      | <what's wrong> |
| `path/to/file.ts` | Not started | <planned> |

If none: "No files modified this session."

---

## SPEC sections touched (per SDD)

<List §X.Y entries from Docs/SPEC.md updated this session, or "none">

---

## Decisions made

- **<decision>** — reason: <why over alternatives>

---

## Blockers & open questions

- <blocker / question>

---

## Exact next step

<The single most important thing to do when resuming. Precise enough that
restart requires zero thinking about where to begin.>

---

## Environment & setup notes

<Only if non-standard. Otherwise omit.>
```

## Cross-links

- [`Docs/state.md`](../../Docs/state.md) — hot snapshot, updated alongside session-data files
- [`Docs/sdd-guide.md`](../../Docs/sdd-guide.md) — SDD method (track SPEC sections touched)
