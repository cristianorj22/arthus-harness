---
description: Validate UI changes against the design system tokens defined in Docs/design-system/DESIGN.md.
argument-hint: "[file-path or empty for current diff]"
allowed-tools: ["Read", "Glob", "Grep", "Bash(git diff:*)", "Bash(git status:*)", "Bash(npm run design:*)", "Bash(node scripts/sync-design-tokens.mjs)"]
---

# /design-check

**Input**: $ARGUMENTS — optional file path. If empty, check `git diff` files matching `*.tsx`, `*.css`, `*.module.css`.

## What it does

1. Runs `npm run design:check` (the script in `scripts/design-check.mjs`).
2. If `--strict` is passed in $ARGUMENTS, runs `npm run design:check:strict` instead — also fails on hard-coded hex values outside the tokens defined in `DESIGN.md`.
3. Loads tokens from `Docs/design-system/DESIGN.md` front-matter (YAML).
4. For each candidate file (or files in `git diff` if none specified), scans for:
   - Hard-coded hex colors not present in `colors.*` tokens.
   - (Future) Hard-coded font-family / font-size not in typography tokens.
   - (Future) Border-radius not in the `rounded.*` scale.
5. Cross-checks `Docs/design-system/DESIGN.md` ↔ `src/index.css` for token drift (declared tokens that didn't make it into `:root`).
6. Outputs a violations table:

```
## Design check — <file>

| Severity | Token violation | Location | Suggested fix |
|---|---|---|---|
| HIGH | hard-coded #FF6B00 | Welcome.tsx:124 | reference token via `hsl(var(--<name>))` or add to DESIGN.md |
| MEDIUM | radius arbitrary | VenueCard.tsx:33 | use rounded-{sm|md|lg|xl} |
```

7. Verdict:
   - All tokens valid, no drift → **APPROVE**.
   - Drift between DESIGN.md / index.css → **BLOCK** (run `npm run design:sync`).
   - Hex violations only (non-strict) → **WARNING**.
   - Hex violations in `--strict` → **BLOCK**.

## How Claude integrates this

When the user invokes `/design-check`:

1. Run `npm run design:check` (or `:strict` if requested).
2. Read `Docs/design-system/DESIGN.md` front-matter for context.
3. Print the report; do not auto-fix.
4. If drift detected, suggest the fix (`npm run design:sync` regenerates `src/index.css`).

## Configuration

Optional `design-check.config.json` at project root:

```json
{
  "allowedHexPatterns": [
    "\\.test\\.tsx?$",
    "\\.spec\\.tsx?$",
    "vite-env\\.d\\.ts$"
  ]
}
```

Files matching any of these regex patterns skip the hex-violation check (useful for tests, generated files, vendor code).

## Future hooks

The PostToolUse hook `design-quality-check.cjs` (registered by this plugin) gives lighter-weight warnings on every Edit / Write — caught earlier than this command. It does NOT block; it only signals.
