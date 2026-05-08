---
name: spec-keeper
description: Auto-fire when editing files that look like public surfaces (API endpoints, edge functions, migrations, exported clients). Reads Docs/SPEC.md and reminds whether the change needs a SPEC §2 update. Companion to the SDD method documented in Docs/sdd-guide.md.
allowed-tools: ["Read", "Glob", "Grep"]
paths:
  - "src/api/**/*.{ts,tsx,js,jsx}"
  - "src/lib/api/**/*.{ts,tsx,js,jsx}"
  - "src/server/**/*.{ts,tsx,js,jsx}"
  - "src/integrations/*/client.{ts,js}"
  - "src/integrations/*/types.{ts,d.ts}"
  - "supabase/functions/**/*.{ts,js}"
  - "supabase/migrations/**/*.sql"
  - "Docs/SPEC.md"
version: 1.0
priority: HIGH
---

# Spec Keeper

> Companion to the **Spec-Driven Development** method documented in [`Docs/sdd-guide.md`](../../../Docs/sdd-guide.md).
>
> When you edit a file that looks like a **public surface** of a component, this skill reminds you whether `Docs/SPEC.md §2` needs an update. **Reminder, not enforcement** — the `code-reviewer` agent does the actual gating in PR review.

## When to apply

Auto-fire when the working file matches one of these patterns:

- `src/api/**`, `src/lib/api/**`, `src/server/**` — typical REST/RPC surface
- `src/integrations/*/client.{ts,js}` — exported client with a public method shape
- `src/integrations/*/types.{ts,d.ts}` — types crossing component boundaries
- `supabase/functions/**` — edge function entry points
- `supabase/migrations/**` — DB schema changes (column types, table names = contract)
- `Docs/SPEC.md` itself — when editing the spec, check downstream consumers

## How to apply

### Step 1 — Read SPEC.md
Open `Docs/SPEC.md`. Find §2 "Contratos de componentes". Note which contracts exist and their statuses.

### Step 2 — Identify the affected contract
The file you're editing likely corresponds to one of the listed components. Heuristics:

- Filename / folder name often matches `§2.X <componente>` heading
- For migrations: column/table names mentioned in `§3 Modelo de dados` ownership table
- If you can't find a matching contract, the surface is **undocumented** — that's its own warning (suggest creating a `[STUB]` entry).

### Step 3 — Classify the change

| Change | SPEC update required? |
|---|---|
| New exported function / endpoint / handler | YES — add `[STUB]` or `[DRAFT]` entry to §2 |
| New column / table | YES — update §3 ownership table; add to §2 if column belongs to a contract |
| Renaming a public symbol (function, type, column) | YES — breaking change. Update §2 + add changelog entry §7. If contract was `[STABLE]`, requires ADR in `Docs/decisoes/`. |
| Changing input/output shape | YES — same as rename |
| Adding optional input field | Optional (consider noting in §2 contract) |
| Adding new field to output | Optional but recommended (downstream consumers may rely on shape) |
| Implementation refactor (no signature change) | NO |
| Adding test for existing AC | NO (unless test reveals gap in AC, then add to §6) |

### Step 4 — Surface the reminder
Output to user (one-line):

```
[spec-keeper] You edited <file>. SPEC.md §2.<X> "<componente>" — does this change update the contract? See Docs/sdd-guide.md.
```

If you can't find a matching `§2.X` contract:

```
[spec-keeper] You edited <file> but no matching contract in Docs/SPEC.md §2. Consider adding a [STUB] entry. See Docs/sdd-guide.md "Quando criar/atualizar uma spec".
```

## Severity

This skill is **informational**. Do not block the user. Do not edit any file (Read/Grep/Glob only). The actual review-gate enforcement is in the `code-reviewer` agent (MEDIUM severity on SPEC drift).

## When NOT to apply

- Pure internal refactors (renaming a private helper, extracting a function with same signature).
- Test files (`*.test.*`, `*.spec.*`).
- Build/config files (`tsconfig.json`, `vite.config.ts`, etc — these are gated by `config-protection.cjs` hook).
- Generated files (`*.generated.ts`, `types/database.ts` from Supabase gen-types).
- Documentation files (other than `Docs/SPEC.md` itself).

## Cross-link

- [`Docs/SPEC.md`](../../../Docs/SPEC.md) — formal spec
- [`Docs/sdd-guide.md`](../../../Docs/sdd-guide.md) — method
- `code-reviewer` agent — does the actual MEDIUM gating in PR review
- `Docs/decisoes/README.md` — when ADR is required (breaking change to `[STABLE]`)

## Source

This skill is **content-agnostic** — it knows the SDD method but not your specific contracts. Your `Docs/SPEC.md` is the source of truth. If your project doesn't use SDD, the skill no-ops gracefully (doesn't suggest updates if SPEC.md doesn't have §2).
