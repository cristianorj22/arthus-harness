---
name: design-system-enforcement
description: How to consume Design System tokens — never hex hardcoded, always token references, design:check before commit, single source-of-truth in DESIGN.md. Use when writing or reviewing UI / CSS / Tailwind classes.
allowed-tools: ["Read", "Grep", "Glob", "Bash(npm run design:*)", "Bash(git diff:*)"]
paths: ["src/**/*.{ts,tsx,css}", "src/index.css", "tailwind.config.ts", "Docs/design-system/**"]
version: 1.0
priority: HIGH
---

# Design System enforcement

> **Source-of-truth**: `Docs/design-system/DESIGN.md` (front-matter YAML).
>
> Pipeline: `DESIGN.md` → `scripts/sync-design-tokens.mjs` → `src/index.css` (`:root { ... }`) → `tailwind.config.ts` reads via `hsl(var(--*))`.
>
> Edit `DESIGN.md` first. Always.

## The contract

1. **No hex literals in components / CSS** — only token references.
2. **No font-size / spacing in raw px** when a token covers it.
3. **DESIGN.md leads, src/index.css follows.** Edit YAML, run `npm run design:sync`, commit both.
4. **`npm run design:check` is green** before every commit that touches `Docs/design-system/`, `src/index.css`, or `tailwind.config.ts`.

## How to reference a token

### From Tailwind classes (preferred)

```tsx
// Token via Tailwind utility (assumes tailwind.config.ts maps theme.colors to CSS vars)
<button className="bg-primary text-primary-foreground rounded-lg px-6 py-3">
  Submit
</button>

<div className="bg-card text-foreground border border-border rounded-xl p-5">
  ...
</div>
```

### From inline / module CSS

```css
.card {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}
```

### From component spec / docs

```markdown
| State | Token |
|---|---|
| Rest | `{colors.card}`, `{elevation.card-rest}` |
| Hover | `{elevation.card-hover}` |
```

## What NEVER to do

```tsx
// Hex hardcoded
<div style={{ backgroundColor: '#1E3A8A' }}>...</div>

// Inline color in Tailwind via brackets
<div className="bg-[#1E3A8A]">...</div>

// Magic radius
<div className="rounded-[18px]">...</div>

// Spacing not in scale
<div className="p-[14px]">...</div>

// Custom shadow
<div className="shadow-[0_4px_8px_black]">...</div>

// Font-size in raw px
<h2 style={{ fontSize: '23px' }}>...</h2>
```

The validator (`scripts/design-check.mjs`) catches hex literals. The rest depends on review.

## When you genuinely need a new token

Don't shortcut by hard-coding. Add the token:

1. Edit `Docs/design-system/DESIGN.md` front-matter:
   ```yaml
   colors:
     ...
     accent-warm: "#F97316"   # ★ added: highlight for callouts
   ```
2. (Optional) document intent in a satellite file under `Docs/design-system/tokens/`.
3. Run sync: `npm run design:sync` → regenerates `src/index.css`.
4. Verify: `npm run design:check` shows green.
5. Use in components via `bg-accent-warm` / `hsl(var(--accent-warm))`.

## Patterns by component family (typical shadcn-aligned defaults)

| Family | Default tokens |
|---|---|
| Button (primary) | `bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold` |
| Button (secondary) | `bg-secondary text-secondary-foreground rounded-lg px-6 py-3 font-semibold` |
| Card | `bg-card text-card-foreground rounded-xl border border-border p-5 shadow-sm` |
| Input | `bg-card border border-input rounded-md px-4 py-3 focus:ring-2 focus:ring-ring` |

Adjust to your brand by editing tokens in `DESIGN.md`, not by inlining hex values.

## Layered radius rule

When a smaller-radius element nests inside a larger-radius one:
- Outer card `rounded-xl` → inner image `rounded-lg` or `rounded-md`.
- At most **two visible radii** in the same composition.

## Spacing rhythm

Use a 4px base scale (`p-1` = 4px, `p-2` = 8px, ...). Lean toward the larger option when ambiguous.

## How AI agents use this

When generating or reviewing UI:

1. Read `Docs/design-system/DESIGN.md` front-matter once for tokens.
2. Use **only** Tailwind utilities that resolve to tokens (`bg-primary`, `rounded-lg`) or CSS-var references (`hsl(var(--primary))`).
3. If a needed token doesn't exist — propose adding to DESIGN.md, don't shortcut.
4. Run `npm run design:check` before declaring "done".

## Audit checklist (review)

When reviewing UI changes:

- [ ] No hex literals in changed `*.tsx` / `*.css` files (`grep -nE '#[0-9a-fA-F]{6}'`).
- [ ] No magic spacing (`p-[14px]`, `gap-[7px]`).
- [ ] No magic radius (`rounded-[N px]`).
- [ ] Colors come from token names: `bg-{primary|secondary|...}`.
- [ ] If new token added: DESIGN.md updated and `design:sync` ran.
- [ ] `npm run design:check` is green.
- [ ] If `tailwind.config.ts` was touched, the change references CSS vars via `hsl(var(--*))` (no inline hex).

## See also

- `Docs/design-system/DESIGN.md` (canonical)
- `Docs/design-system/PIPELINE.md` (pipeline contract)
- `scripts/sync-design-tokens.mjs`, `scripts/design-check.mjs`
