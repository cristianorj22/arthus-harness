# Analysis 05 — SDD method integration

> Source: `code-archaeologist` agent (Opus 4.7) · 2026-05-08
> Captured **after** v1.0 implementation, when user pointed at a 6-doc folder (`benth/`) using Spec-Driven Development methodology and asked whether to integrate.

---

## Context

After v1.0 of arthus-harness shipped (5-layer doc stack: Process · MISSION · principios-de-experiencia · PRODUTO · roadmap+arquitetura), user pointed at `benth/` — 6 markdown files documenting a **Spec-Driven Development** method applied to a multi-agent platform project (Matrix Energia rateio).

User asked: "does it make sense to adapt our structure or do we already have this?"

The agent analysis below classified each pattern from benth/ as **already-have**, **gap-worth-filling**, or **anti-pattern-to-avoid**, and proposed concrete integration as a v1.1.0 minor release.

---

# SDD Method Integration Plan for arthus-harness

## 1. SDD method core (what's universally valuable)

These patterns from `spec-driven-guide.md` generalize to any non-trivial project, not just agentic platforms:

1. **Spec-before-code as gating discipline.** A formal artifact precedes implementation; if code diverges, you update the spec first. Applies to any system with stable contracts (HTTP APIs, DB schemas, message queues, modules with public surface).

2. **Status lifecycle with three states (`[STUB]` / `[DRAFT]` / `[STABLE]`).** Makes "incomplete" first-class. Forbids silent TODOs. Each transition has rules: STUB requires a pointer to the open question (P-NNN/ADR-NNN); STABLE locks the contract behind ADR.

3. **Acceptance Criteria must be measurable.** `"respect minimum quota"` is rejected; `"sum of percentages per group = 100% ± minimum_quota"` is accepted. Anything not testable fails review. Universal — applies to RFs, ADRs, test names.

4. **Concrete types over abstract nouns.** "object" gets rejected; `list of {id_deal, id_uc, distribuidora, percentual: float[0..100]}` is the bar. Every contract field has type + constraint + description.

5. **Test naming references AC IDs.** `test_AC-1_soma_percentuais_eq_100` — tests are bidirectionally linked to spec. A failing test says which contract clause was violated. Universal pattern, language-agnostic.

6. **Contract-change-without-spec-update is PR rejection.** Single rule, enforced in review. Without it, drift is guaranteed within one quarter.

7. **Spec versioning + backward-compat windows.** Semver on the spec doc itself; breaking change in `[STABLE]` requires ADR + migration plan + N-cycle compat window. Generalizes from agents to API versions, schema versions, event payload versions.

8. **State.md references which spec section was touched.** Session checkpoints close the loop: "this session updated SPEC §2.4 + RN-009". Auditable session history maps to spec deltas.

9. **Bug-in-prod reveals implicit contract → reflect in SPEC after fix.** Production incidents are spec discoveries. The fix isn't done until the spec captures the now-explicit contract that was implicitly violated.

10. **Explicit "when NOT to use SDD" carve-out.** Spike/POC ≤ 1 day, experiments folder, pure refactor. Prevents process bureaucracy on throwaway code, which is what kills adoption.

---

## 2. SPEC.md template structure (universal vs domain-specific)

| Section | Universal? | Verdict |
|---|---|---|
| §1 Visão geral | Universal | Keep — every project has layers/components |
| §2 Contratos de agentes | Agentic-specific terminology | **Genericize to "Component contracts"** — same Input/Output/Acceptance/Status pattern works for services, modules, edge functions, workers, anything with a boundary |
| §3 Contratos de capabilities (skills) | Agentic-specific | **Merge into §2** — capabilities are just lower-level components. Don't introduce two layers unless project actually has both |
| §4 Modelo de dados | Universal | Keep — every project has entities, storage, ownership table |
| §5 Fluxos BPMN | Universal but optional | Keep as **"Critical flows"** — only required when flow has 3+ components or HITL/async steps. Mermaid > BPMN textual |
| §6 ACs globais | Universal | Keep — system-level invariants that no single contract owns (cycle time, cost ceiling, audit retention) |
| §7 Plano de testes | Universal | Keep — but lighter than benth's. Just contract tests + golden masters reference |
| §8 Changelog | Universal | Keep — versioning the doc itself is the discipline |

**Recommended generic skeleton** (drop §3, fold capabilities into §2): 7 sections.

---

## 3. Layered documentation gap

**Is "contractual invariants" a real 4th layer?** Yes — distinct from MISSION.

- **MISSION** = invariants that protect users/business when violated cause harm (security, integrity, idempotency). Cross-cutting, system-level, rarely change.
- **SPEC contracts** = invariants that protect *components from each other*. Local to a boundary. Change with feature evolution. Versioned.

The proof they're different: MISSION violations are incident-grade (rotate keys, post-mortem). Contract violations are review-grade (PR rejected, rollback the diff). Different severity, different cadence, different reviewers.

**Is "operational principles" a real 5th layer?** Looking at benth's `project.md` "Princípios de produto" (humano-no-comando, citável-por-padrão, falha-vocal, LGPD-first, custo-previsível): these are **neither** technical absolutes (a violation isn't an incident) **nor** emotional (they're about engineering posture). They're **operational defaults** — how you bias decisions when MISSION doesn't dictate.

→ Add SPEC as 4th layer; promote operational principles inside PRODUTO.md as 5th.

Final stack:
1. **Process** (CLAUDE.md, AGENTS.md, hooks)
2. **Technical non-negotiables** (MISSION.md)
3. **Operational principles** (PRODUTO.md §Princípios — promoted)
4. **Contractual invariants** (SPEC.md — new)
5. **Emotional non-negotiables** (principios-de-experiencia)

---

## 4. Recommended additions (cut list)

### Essential
- **E1** `core/Docs/SPEC.md.eta` — 7-section skeleton
- **E2** `core/Docs/sdd-guide.md.eta` — generic SDD method doc
- **E3** Update `core/CLAUDE.md.eta` — wire SPEC into hierarchy + "contract changes require SPEC update" rule
- **E4** Status lifecycle `[STUB]`/`[DRAFT]`/`[STABLE]` documented in sdd-guide.md, referenced from SPEC.md

### Valuable
- **V1** Promote `core/Docs/produto/PRODUTO.md.eta §Princípios` from 7-line TODO to first-class operational principles
- **V2** Strengthen `PRODUTO.md.eta §Não-goals` (3-5 entries minimum, rationale)
- **V3** Test naming convention `test_AC-XX_<desc>` documented in sdd-guide + CLAUDE.md
- **V4** Update `code-reviewer` agent — flag MEDIUM on public surface change without SPEC update; HIGH on `[STABLE]` break without ADR

### Nice-to-have
- **N1** Skill `spec-keeper` auto-fire (defer)
- **N2** "SPEC sections touched" field in state.md.eta (defer)
- **N3** Sibling template `COMPONENT-CONTRACT.md` (defer)

---

## 5. Anti-patterns / what NOT to import

1. **"Wave/Onda" sprint vocabulary** — project-internal jargon for Discovery phase
2. **`vibecoding vs baseline tradicional` two-column estimates** — PMO theater
3. **The very large data-ownership table (§4.1)** — keep pattern, ship 2-3 example rows not 8
4. **Per-disco/per-tenant agent multiplication** — solves a 24-distributor problem nobody else has
5. **`Convenção numérica` header** — glossary belongs in PRODUTO.md, not SPEC

---

## 6. Versioning

**v1.1.0 (minor)** — additive feature, backward-compatible.

> **Note:** user later requested keeping v1.0 since not yet published. The SDD additions ship in v1.0 instead, with the v1.1 changelog entry rolled back. Logically still a minor-bump set of changes.

---

## 7. Open questions resolved with Cristiano

| Q | User decision | Notes |
|---|---|---|
| Q1 | Operational principles inside PRODUTO.md | Avoids file proliferation |
| Q2 | SPEC drift severity = MEDIUM in v1.0 | Escalate to BLOCKING in v0.2+ if adoption sticks |
| Q3 | Status lifecycle `[STUB]`/`[DRAFT]`/`[STABLE]` | Locked as harness convention |
| Q4 | No `/spec-update` slash command in v1.0 | Pure doc + reviewer enforcement first |
| Q5 | Keep `CONTRACTS.md` template + add SPEC pattern | Different cases (handoff vs component surface) |

---

## Implementation status

✅ **Implemented** as part of v1.0 (after rollback of v1.1 bump per user request):
- E1–E4 (essentials)
- V1–V4 (valuable)
- All 5 anti-patterns avoided

⏸ **Deferred to v0.5+:**
- N1–N3 (nice-to-have)
- Escalation of SPEC drift severity to BLOCKING

---

## Files referenced

- Source: `c:\Users\Cristiano\go-party-venue-hub\benth\` (6 markdown files — Matrix-Prisma-Alloc project docs)
- Implementation: `arthus-harness/core/Docs/SPEC.md.eta`, `arthus-harness/core/Docs/sdd-guide.md.eta`, updates to `CLAUDE.md.eta`, `PRODUTO.md.eta`, `code-reviewer.md.eta`
