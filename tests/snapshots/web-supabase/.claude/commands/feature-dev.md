---
description: Guided feature development — Discovery → Plan → Implement → Review. Use for any non-trivial feature (more than ~30 min of work).
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Agent", "Bash"]
---

# /feature-dev

A structured workflow that emphasises understanding existing code before writing new code. Six phases, with checkpoints between each.

## Phase 1 — Discovery

- Read the request carefully. Restate it back if ambiguous.
- Identify:
  - **Persona affected**: see [`Docs/produto/PRODUTO.md`](../../Docs/produto/PRODUTO.md).
  - **Acceptance criteria**: how do we know this is done? (Concrete: "user can do X and see Y").
  - **Constraints**: deadline, performance, RLS.
- Ask clarifying questions before exploring. **Do not start coding.**

## Phase 2 — Codebase exploration

Use the `Explore` agent for breadth. For depth, use Glob/Grep/Read directly.

Trace the relevant slice end-to-end:

- **Frontend**: route in `src/App.tsx` → page → components → hooks → backend calls.
- **Backend**: Supabase migration → RLS policy → edge function → client call.
- **Cross-cutting**: i18n strings, design tokens, auth boundary.

Output of this phase: a 5-10 line summary of what already exists and where the change attaches.

## Phase 3 — Architecture & plan

Use the `Plan` agent for design-heavy tasks. Output should include:

1. Files to add / change (with one-line purpose).
2. Migrations needed (with table/RLS sketch).
3. Type changes (Supabase regenerate? new zod schema?).
4. UI surfaces (which components / pages).
5. **SPEC update** (if contract changes — see [`Docs/sdd-guide.md`](../../Docs/sdd-guide.md)).
6. Test plan (unit / integration / manual).
7. Risks and rollback story.

**Wait for user approval** before implementing.

## Phase 4 — Implement

- Follow the approved plan; deviate only with user buy-in.
- Prefer small commits with clear messages.
- For UI: run dev server, click through the flow, verify in browser before declaring done.
- For migrations: apply locally first, regenerate types, then push.
- TDD where it pays — payment / auth / business invariants.
- **Update [`Docs/SPEC.md`](../../Docs/SPEC.md)** if you changed any public surface.
- **Update [`Docs/produto/requirements.md`](../../Docs/produto/requirements.md)** with new RF/RNF/RN ID if applicable.

## Phase 5 — Review

Run `/code-review` (local mode). Address CRITICAL and HIGH findings. Verify validation passes.

## Phase 6 — Summary

Print to user:

```
Feature: <name>
Files changed: <n>
Migrations: <list or none>
SPEC sections updated: <list or none>

Verified:
- <how each acceptance criterion was checked>

Follow-ups (out of scope):
- <list>

Test instructions:
- <how the user can verify themselves>
```

Update [`Docs/state.md`](../../Docs/state.md) at session end (use `/save-session`).
