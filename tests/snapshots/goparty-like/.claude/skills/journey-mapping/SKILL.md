---
name: journey-mapping
description: User journey docs in Docs/produto/jornadas/<persona>/<jornada>.md — capture sequence of steps + edge cases + multi-actor handoffs + a11y branches + recovery paths + falha catastrófica. Use when reviewing or writing surfaces that affect user flow (booking, onboarding, plan subscription, payment, cancellation, etc.). When a PR touches a surface that has a journey, ask "this surface change is in jornada X — was the journey updated?".
allowed-tools: ["Read", "Grep", "Glob", "Bash(git log:*)", "Bash(git diff:*)"]
paths:
  - "Docs/produto/jornadas/**/*.md"
  - "Docs/produto/jornadas/_surfaces.json"
version: 1.0
priority: HIGH
---

# Journey mapping enforcement

> **Source-of-truth**: `Docs/produto/jornadas/` — one folder per persona, one `.md` per journey.
>
> **Principle**: journeys document the **sequence of steps** the user goes through, with edge cases, recovery paths, multi-actor handoffs, and a11y gates. Process protection layer — alongside `MISSION.md` (technical) and `principios-de-experiencia.md` (emotional).

## Surface mapping

The file `Docs/produto/jornadas/_surfaces.json` lists which code paths map to which journeys. When the `journey-touch-reminder.cjs` hook detects you editing a matching path, it logs a reminder for the Stop hook to surface.

Format:
```json
[
  { "match": "src/components/booking/", "journey": "organizador/booking-e-checkout.md" },
  { "match": "supabase/functions/payment-webhook/", "journey": "organizador/booking-e-checkout.md" }
]
```

Match is **substring** (relative path). Keep it simple; no regex needed for MVP.

## When to apply

Auto-fire when editing or reviewing code in any path listed in `_surfaces.json`. Plus:

- New journey created in `Docs/produto/jornadas/<persona>/`
- Edits to existing `.md` in `Docs/produto/jornadas/`

## Review checklist

### 1. Read the journey first
Before reviewing the PR/diff, open the relevant journey (same surface). If the surface has no journey documented:

- **Backlog Tier 2** — flag as **MEDIUM** and suggest creating the journey if the PR is large enough to warrant.
- **Surface aspirational** — verify if there's a journey in `_proposed/`. If not, **HIGH** (feature without executable spec).

### 2. Did the PR change user flow?
If yes, the journey must reflect:

- Steps added / removed / reordered
- New states (e.g., new enum value)
- New branches (e.g., new payment method, new gate)
- New recovery paths (e.g., new "Try again" button)
- Multi-actor handoffs (e.g., now also notifies admin)

**Violation signals in the PR:**

- Diff that adds new `if (status === 'X')` without journey update → **HIGH** (new state not documented)
- Diff that adds branch (ALREADY_SUBSCRIBED, idempotent retry) without update → **HIGH**
- Diff that fires notification on new trigger → **MEDIUM** (multi-actor handoff)
- Diff that adds `aria-live` or `role="alert"` → **LOW** (a11y good; but check if journey doc has the correct mechanism)

### 3. Frontmatter validation
If the journey was updated, verify:

- `last-update` changed to today's date
- `surface-paths` still point to existing files (rename/delete propagated)
- `status` correct (`active` if documenting current code, `aspirational` if documenting non-existent feature — should be in `_proposed/`)
- A11y mandatory fields present: `cognitive_load`, `pausable`, `resumable`

### 4. Cross-link with other skills

- `experience-principles` — journey should mark **anchor sensation per step** in frontmatter `sensacao-ancora-por-step:`. If the PR changes step and sensation no longer fits, drift signal.
- `i18n-source-of-truth` (if installed) — new copy in PR should appear (or be referenced) in journey as "state X announces Y" for screen readers.
- `design-system-enforcement` (if installed) — empty state / loading / error from PR should match "States → ARIA mechanism" table of journey.

## Severities

| Symptom | Severity | Action |
|---|---|---|
| PR adds new state (enum, branch) without journey update | **HIGH** | Block: surface code changed, journey lies |
| PR adds feature without existing journey on covered surface | **HIGH** | Create journey before merging (or move to `_proposed/` if aspirational) |
| Journey `last-update` > 120 days AND commits in `surface-paths` | **MEDIUM** | Accumulated drift — update or mark `status: archived` |
| PR changes copy/UX but journey doesn't cite the state | **MEDIUM** | New error/empty state message must appear |
| Backlog Tier 2 surface without journey | **MEDIUM** | Suggest creating; doesn't block |
| Frontmatter incomplete (missing `cognitive_load`, `pausable`, `resumable`) | **MEDIUM** | A11y decision-points must be explicit |
| `surface-paths` pointing to deleted/renamed file | **LOW** | Update the glob |

## Output template

```
[HIGH] New state in flow not documented in journey
File: src/components/Foo.tsx:142
Diff: +if (status === 'awaiting_dispute') { ... }
Related journey: Docs/produto/jornadas/<persona>/<journey>.md
Issue: New state 'awaiting_dispute' appears in code without corresponding step in journey.
       The "Detailed steps" table doesn't cite dispute; the swimlane mermaid has no
       branch for that state. Drift between code and doc.
Fix: Update the journey with the new step + anchor sensation + recovery path.
     `last-update` should go to today.
```

## Anti-patterns to flag

- **Doc-museum**: journey `last-update` old + surface touched many times since. Mark drift.
- **Doc-speculation**: journey with `status: active` but no code behind it. Move to `_proposed/`.
- **Pretty diagram without cross-link**: mermaid without `surface-paths` or RF-XX.YY referenced.
- **Multi-actor without swimlane**: journey with 2+ actors but linear mermaid of 1 flow. Force `sequenceDiagram` or `flowchart` with `subgraph`.
- **A11y as afterthought**: "A11y critical announcements" / "Focus management map" empty or missing in critical journey.
- **Sad path absent**: only happy path. Cancellation, error, timeout, race condition must be in `## Edge cases + sad paths`.

## When NOT to apply

- Pure layout components (Grid, Container, Card layout-only)
- Utility functions / helpers
- Migrations / SQL without visible surface
- Refactors that don't change behavior
- Edits to other docs (markdown only)

## Source

`Docs/produto/jornadas/JOURNEY-MAPPING.md` — convention, status, sunset planning.
`Docs/produto/jornadas/_template-jornada.md` — canonical template.
`Docs/produto/jornadas/_surfaces.json` — surface → journey mapping (read by hook).
