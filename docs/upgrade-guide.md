# Upgrade guide — `arthus-harness sync`

How to upgrade a project that was bootstrapped from arthus-harness when a new harness version ships.

## When to run sync

You upgraded the harness in your global npm cache (`npm i -g create-arthus-harness@latest`) and want one of your existing projects to pick up:

- New plugins added to your project's plugin set (after `arthus-harness add-plugin`).
- Updated templates in `core/` or `plugins/<name>/` (e.g. a new lint rule, a smarter hook).
- Bug fixes in scaffolded scripts.

```bash
cd path/to/your-project
npx arthus-harness sync
```

If you've never run sync since bootstrap and the harness has a new version, sync re-renders every template against the answers stored in `.arthus-harness.json` and writes the output back into your project — being smart about your local edits.

## Sync algorithm

For each file the harness ships:

1. **Load** the template from the new version of the harness.
2. **Render** with the answers from `.arthus-harness.json`.
3. **Compare** the freshly rendered content to what's currently on disk.
4. **Classify** the file based on its lockfile fingerprint:

| Case | What sync does |
|---|---|
| File doesn't exist on disk | Write the new file (`+ new`). |
| File matches old fingerprint (untouched by you) | Overwrite with new content (`~ updated`). |
| File doesn't match old fingerprint and new == current | No-op (coincidental match). |
| File doesn't match old fingerprint AND differs from new (you edited it) | **Conflict** — see flag behaviour below. |

5. **Update** the lockfile fingerprints to match the new on-disk state.

The fingerprint is `sha256` over the rendered content, first 12 hex chars. Stored in `.arthus-harness.json` under `fingerprint`.

## Default behaviour — `.rej` files

Without flags, sync is **non-blocking**: when it finds a user-modified file that differs from the new template, it writes the new template alongside the original as `<file>.rej`. Your version stays the active one.

```
src/integrations/asaas/client.ts        ← your version, untouched
src/integrations/asaas/client.ts.rej    ← what the new harness would have written
```

You can then diff and merge at your leisure:

```bash
git diff --no-index src/integrations/asaas/client.ts src/integrations/asaas/client.ts.rej
```

When done, delete the `.rej` file.

## `--interactive`

Prompts you per conflict:

```bash
npx arthus-harness sync --interactive
```

Three options per file:

- **Keep my version (skip)** — leave the file alone, don't write `.rej`.
- **Overwrite with new template** — discard your changes.
- **Write new template as .rej (review later)** — same as default.

Use this when you want to triage live, especially after a major harness upgrade.

## `--strict`

Fails the command on any conflict. Designed for CI:

```bash
npx arthus-harness sync --strict
```

Exit code 1 if any file would have been written as `.rej`. The lockfile is still updated for files that synced cleanly.

A common workflow:

1. CI runs `arthus-harness sync --strict` on a scheduled job.
2. If it fails, a human runs interactive sync locally and resolves conflicts.
3. Commit + push.

## Resolving `.rej` files

Three paths:

### Manual diff

```bash
diff -u src/integrations/asaas/client.ts src/integrations/asaas/client.ts.rej
```

Pick changes to take, edit the live file, delete the `.rej`.

### `git mergetool` style

If your project has 3 versions of the file in git — original (lockfile fingerprint), yours (HEAD), and new template (`.rej`) — you can use a merge tool:

```bash
git checkout <commit-where-fingerprint-matches> -- src/integrations/asaas/client.ts.base
# now you have .ts (yours), .ts.rej (theirs), .ts.base (common ancestor)
git merge-file src/integrations/asaas/client.ts \
  src/integrations/asaas/client.ts.base \
  src/integrations/asaas/client.ts.rej
```

In practice this is rarely worth it — manual diff is faster for small files.

### Accept theirs

If the new template is strictly better (e.g. a security fix you missed):

```bash
mv src/integrations/asaas/client.ts.rej src/integrations/asaas/client.ts
```

## SemVer policy

`arthus-harness` follows semver — what changes signal:

| Bump | What it means |
|---|---|
| **MAJOR** | Breaking template change. After upgrade, `.rej` files expected; manual review required. Examples: renamed core files, new required prompts, plugin removed. |
| **MINOR** | Adds plugins, agents, skills, hooks. Existing files generally unchanged; `+ new` files appear. |
| **PATCH** | Bug fixes inside templates. Files may auto-update if untouched; conflicts only on edited files. |

Read the `CHANGELOG.md` before running sync on a major bump.

## What sync does NOT touch

- Files outside the harness contribution set (everything you wrote yourself).
- Your `package.json` (scripts/deps from new plugins are not auto-merged on sync — use `arthus-harness add-plugin <name>` for that).
- Your `.env` files.
- Your git history.

## Recovery if sync goes wrong

```bash
# undo the file changes
git checkout -- .

# remove .rej files
git clean -fd '*.rej'

# the lockfile was also updated — restore it
git checkout -- .arthus-harness.json
```

If you committed a bad sync, `git revert <sync-commit>` undoes it cleanly because every change sync makes is in the working tree, not the index.
