---
description: Audit + remove dead code, unused deps, orphan exports. Tier-based safety (SAFE/CAUTION/DANGER). Solo dev maintenance — usar 1× por semana ou após features grandes.
allowed-tools: ["Read", "Glob", "Grep", "Agent", "Bash(git status:*)", "Bash(git diff:*)", "Bash(git log:*)", "Bash(npx knip:*)", "Bash(npx depcheck:*)", "Bash(npx ts-prune:*)", "Bash(npm install:*)", "Bash(npm run build:*)", "Bash(npm run lint:*)", "Bash(npm run type-check:*)"]
---

# /refactor-clean

Wrapper for the `refactor-cleaner` agent. Technical detail: [`.claude/agents/refactor-cleaner.md`](../agents/refactor-cleaner.md).

## Pre-checks (always before starting)

1. `git status --short` — worktree MUST be clean. If dirty: stop and ask for commit/stash.
2. `git log -1 --oneline` — record the base commit. If something goes wrong, that's where to revert.
3. `npm run build` — MUST pass before cleanup starts. Without a green build, no cleanup.

## Phases

### Phase 1 — Audit

Invoke the `refactor-cleaner` agent with default scope (all of `src/`):

```bash
npx knip --reporter codeowners 2>&1
npx depcheck 2>&1
npx ts-prune 2>&1
```

If `knip` / `depcheck` / `ts-prune` are not installed as devDeps:

```bash
npm install --no-save knip depcheck ts-prune
```

(`--no-save` keeps `package.json` untouched.)

Audit output: 3-tier table (SAFE / CAUTION / DANGER) — see template in agent file.

### Phase 2 — Approval

**Stop and show the report to the user.**

```
Found: <N SAFE> · <M CAUTION> · <P DANGER>

Can I remove the N SAFE? CAUTION items need your decision.
```

Wait for "ok" / "go" / equivalent. Without approval, NOTHING is removed.

### Phase 3 — Iterative removal

For each approved SAFE item:

1. Remove (Edit OR `git rm`).
2. `npm run build` — must pass.
3. `npm run lint` — must pass.
4. `git add <file>`.
5. `git commit -m "chore(cleanup): remove unused <item>"`.
6. Next item.

**1 item = 1 commit.** Each commit is independently revertible.

### Phase 4 — Documentation

- Update [`Docs/state.md`](../../Docs/state.md) with summary of what was cleaned.
- If any CAUTION became backlog, register in [`Docs/roadmap.md`](../../Docs/roadmap.md).

## Output at the end

```
✓ Cleanup closed
- N SAFE removed (commits <hash1>..<hashN>)
- M CAUTION moved to backlog in Docs/roadmap.md
- P DANGER remain (need product decision)

build: ✅
lint: ✅
type-check baseline: <before> → <after>  (must not increase)

Suggested next step: <branch policy / merge / next feature>
```

## When NOT to run

- Unstable branch / red build.
- Right after a big merge (let it stabilise 1-2 days).
- Without explicit user approval.

## Skip

- Don't touch tests "because they don't run".
- Don't delete docs (archive via `Docs/archive/`).
- Don't modify config files (config-protection hook blocks anyway).
