# Design System pipeline

> Contract for how design tokens flow from a single source-of-truth file
> to runtime CSS variables consumed by Tailwind / shadcn.

## Overview

```
┌──────────────────────────────┐
│ Docs/design-system/DESIGN.md │   ← source-of-truth (you edit this)
│ (front-matter YAML)          │
└──────────────┬───────────────┘
               │
               │  npm run design:sync
               │  (scripts/sync-design-tokens.mjs)
               ▼
┌──────────────────────────────┐
│ src/index.css                │   ← generated; :root block is owned by sync
│ :root { --primary: ... }     │
└──────────────┬───────────────┘
               │
               │  Tailwind reads via hsl(var(--<name>))
               ▼
┌──────────────────────────────┐
│ tailwind.config.ts           │   ← maps theme.colors.<name> → var(--<name>)
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Components / pages           │   ← use `bg-primary`, `text-foreground`, etc.
└──────────────────────────────┘
```

## The :root contract

`scripts/sync-design-tokens.mjs` owns everything between `:root {` and the matching `}` in `src/index.css`. **Anything you write inside that block by hand will be overwritten on the next sync.**

To add styles outside the contract — utility classes, layer rules, animations — put them outside `:root { ... }`. Those are yours.

```css
/* src/index.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* MANAGED by sync-design-tokens.mjs — do not edit by hand */
  }

  body {
    @apply bg-background text-foreground;   /* ← yours, kept */
  }
}

/* Custom utility — yours, kept. */
.glass-card {
  backdrop-filter: blur(12px);
  background: hsl(var(--card) / 0.6);
}
```

## DESIGN.md front-matter shape

The script understands three top-level keys:

```yaml
---
version: 0.1.0          # optional; surfaced in the generated CSS comment

colors:
  # name: "#RRGGBB"
  primary: "#1E3A8A"
  background: "#FFFFFF"
  foreground: "#0F172A"

aliases:
  # alias: existing-color-name
  # Output: --alias gets the same HSL channels as --existing-color-name.
  # Useful for shadcn names (--primary, --secondary) pointing at brand tokens.
  brand: primary

rounded:
  # raw CSS values (NOT converted)
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"  # also exposed as --radius (shadcn default)
  xl: "1rem"
---
```

The script:

1. Converts each `colors.<name>` hex to HSL channels and emits `--<name>: H S% L%;`.
2. For each `aliases.<name>: <target>` it emits `--<name>: <H S% L% of target>;`.
3. Emits `--radius: <rounded.lg>` if `rounded.lg` is defined.

Tailwind config plugs in via:

```ts
// tailwind.config.ts (excerpt)
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      // ... mirror the names from DESIGN.md
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
}
```

## Workflow when adding a token

1. Edit `Docs/design-system/DESIGN.md` front-matter — add the entry under `colors`, `aliases`, or `rounded`.
2. Run `npm run design:sync` → regenerates the `:root` block in `src/index.css`.
3. (If new color) update `tailwind.config.ts` → map `theme.colors.<name>` to `'hsl(var(--<name>))'`.
4. Use the token: `bg-<name>` / `text-<name>` / `hsl(var(--<name>))`.
5. `npm run design:check` should be green.
6. Commit `DESIGN.md`, `src/index.css`, and `tailwind.config.ts` together.

## Validation

`npm run design:check` (default — non-strict):

- BLOCKS on drift between `DESIGN.md` tokens and `src/index.css` `:root` block.
- WARNS on hard-coded hex literals in `src/`.

`npm run design:check:strict`:

- BLOCKS on hard-coded hex literals too.

CI runs the default mode (`design-system-check` job). Move to strict once the codebase is clean.

## Configuration

Optional `design-check.config.json` at project root:

```json
{
  "allowedHexPatterns": [
    "\\.test\\.tsx?$",
    "vite-env\\.d\\.ts$",
    "integrations/.*/types\\.ts$"
  ]
}
```

Patterns are JS regex strings (matched against paths relative to project root). Use them sparingly — every entry is a place where the design system is no longer enforced.

## Why this design

- **Single edit surface.** Designers and devs both edit `DESIGN.md`. No drift between three different files.
- **Generated CSS, but contained.** Sync script only owns `:root { ... }` — leaves the rest of `src/index.css` for hand-written utilities. No big-bang regeneration.
- **Tailwind compatibility.** HSL channels (not full `hsl(...)` values) keep `hsl(var(--primary) / 0.5)` opacity modifier syntax working.
- **Forward-compatible.** Add new categories (typography, shadows) by extending the script's `buildXxxBlock` helpers. The contract stays the same.
