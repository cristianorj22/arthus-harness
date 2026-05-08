---
description: Gate "WAIT for CONFIRM" — produces a detailed plan BEFORE touching code. Different from /feature-dev which executes; /plan only plans and requires approval.
allowed-tools: ["Read", "Glob", "Grep", "Agent", "Bash(git status:*)", "Bash(git diff:*)", "Bash(git log:*)"]
---

# /plan

Anti-pattern this command fights: **vibes-coding** — generating 200 lines before knowing if the approach is right. Karpathy guideline #1: *"Think before coding."*

`/plan` produces a detailed plan, **does NOT touch code**, and requires explicit confirmation before proceeding.

**Input:** $ARGUMENTS — description of the feature / bug / refactor.

## Phases

### Phase 1 — Discovery

- Restate the request in your own words. Confirm understanding.
- Identify what's being requested:
  - New feature? Bug fix? Refactor? Performance?
- Identify affected persona/user (refer to [`Docs/produto/PRODUTO.md`](../../Docs/produto/PRODUTO.md) for personas defined in this project).
- Identify success criteria: how would we know it's done?

If ambiguous, **ask before continuing**. Don't guess.

### Phase 2 — Codebase exploration

Use `Glob` / `Grep` / `Read` (not Edit/Write):

- Where in `src/` does this functionality land?
- Is there similar code / reusable hook / established pattern?
- Which migrations / endpoints / components will be touched?
- Which skills from `.claude/skills/` apply? (experience-principles, supabase-rls-pattern, design-system-enforcement)
- **SDD check:** does this touch a public surface? If yes, [`Docs/SPEC.md §2`](../../Docs/SPEC.md) needs update. Note in plan.

Output of this phase: 5-10 lines of technical context.

### Phase 3 — Plan

Structured document:

```markdown
## Plan: <feature title>

### What
<1 paragraph describing what will be done>

### Why
<1 paragraph: pain it solves / requirement it fulfils — cite RF-XX.YY if applicable>

### Persona affected
<see Docs/produto/PRODUTO.md>

### SPEC sections affected (if any)
<list §X.Y entries from Docs/SPEC.md, or "no public surface change">

### Acceptance criteria (testable)
- [ ] AC-1: <criterion>
- [ ] AC-2: <criterion>

### Files to touch (with 1-line purpose each)
- `src/components/<X>.tsx` — adds <Y>
- `supabase/migrations/YYYYMMDDHHMMSS_<...>.sql` — creates table <Z>
- ...

### Migrations needed
<sketch SQL or "none">

### Types to regenerate
<yes / no — `npm run supabase:gen-types`>

### Skills loaded (.claude/skills/)
- experience-principles (always for UI/copy)
- supabase-rls-pattern (if RLS)
- supabase-migration (if migration)
- design-system-enforcement (if UI)

### Test plan
- Manual: <steps>
- Unit: <which functions>
- E2E: <golden path>

### Risks
- <risk 1> · mitigation: <action>
- <risk 2> · mitigation: <action>

### Rollback story
If this explodes in prod, how do I roll back?
- <rollback plan>

### Estimate
<X minutes / hours / sprints>

### Pre-implementation checklist
- [ ] Read relevant skills
- [ ] Read [`MISSION.md`](../../MISSION.md) if touching auth/RLS/payment/data
- [ ] Read [`Docs/SPEC.md`](../../Docs/SPEC.md) if touching public surfaces
- [ ] Confirmed not duplicating existing code
- [ ] Update [`Docs/produto/requirements.md`](../../Docs/produto/requirements.md) with new RF if applicable
- [ ] Update [`Docs/SPEC.md`](../../Docs/SPEC.md) §2 if contract changes
- [ ] Update [`Docs/state.md`](../../Docs/state.md) at session end
```

### Phase 4 — WAIT for CONFIRM

**Stop and present the plan. DO NOT TOUCH CODE.**

Message to user:
```
Plan ready. Before implementing, I need OK.

Ask:
- Any item in the plan you would adjust?
- Acceptance criteria correct?
- Risks I identified are correct?
- Can I proceed to implementation?
```

Wait for response. If "ok" / "go" / "proceed" → invoke `/feature-dev` or implement directly. If adjustments requested → re-do plan.

## When to use `/plan` vs `/feature-dev`

| Scenario | Command |
|---|---|
| I have a vague idea, want to think before coding | `/plan` |
| Plan is already clear, want to implement | `/feature-dev` or direct |
| Complex multi-phase feature | `/plan` first, then `/feature-dev` |
| Obvious bug fix (1-3 lines) | direct, no `/plan` |
| Migration / RLS change | `/plan` ALWAYS (high stakes) |
| Public surface change (per SDD) | `/plan` ALWAYS — SPEC update required |

## Anti-patterns `/plan` avoids

- ❌ "I'll start coding and see where I get" — no "done" criterion
- ❌ Implementing without understanding existing context — duplication guaranteed
- ❌ Forgetting to update `requirements.md` / `SPEC.md` / `state.md` at end
- ❌ Push to main without rollback story (in risky features)

## Cross-links

- [`/feature-dev`](./feature-dev.md) — execution post-plan
- [`/code-review`](./code-review.md) — after implementation
- [`Docs/sdd-guide.md`](../../Docs/sdd-guide.md) — SPEC update discipline
- [`Docs/produto/requirements.md`](../../Docs/produto/requirements.md) — RF to reference
