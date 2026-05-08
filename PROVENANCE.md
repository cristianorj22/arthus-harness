# arthus-harness — Provenance

> O que veio de `go-party-venue-hub` e por quê. Separação dura entre **disciplina** (viaja) e **dust** (não viaja).

A regra mestra é a do anti-pattern #5 do PLAN: *"yesterday's wisdom encoded — Asaas/Veriff/Supabase vazam pra projetos sem essa stack"*. Pra evitar isso, cada artefato é classificado em uma de 4 categorias.

## Legenda

- 🟢 **DISCIPLINA** — viaja em core (forma universal). Testado em produção GoParty, generaliza.
- 🟡 **DISCIPLINA + GENERICIZE** — viaja em core com placeholders.
- 🔵 **PLUGIN** — viaja como opt-in (stack-specific).
- 🔴 **DUST** — não viaja. GoParty-only, sem valor pra harness.

---

## `.claude/`

### Agents

| Agente | Categoria | Notas |
|---|---|---|
| `code-reviewer.md` | 🟡 | Heavy GoParty refs (Asaas/Veriff). Skills frontmatter vira opt-in via plugin. |
| `typescript-reviewer.md` | 🟢 | Pure TS/JS — só remove menção a `_known-debt.md`. v0.2 (não v0.1). |
| `silent-failure-hunter.md` | 🟡 | Pattern universal. Skill `asaas-integration` vira opt-in. |
| `security-reviewer.md` | 🟡 | OWASP universal. Skills supabase/asaas viram plugins. v0.2. |
| `database-reviewer.md` | 🔵 `plugin-supabase` | Body é Supabase-specific. |
| `a11y-architect.md` | 🟡 | WCAG universal. ABNT NBR 17225 + LBI 13.146 (BR-specific) viram opt-in localização. |
| `refactor-cleaner.md` | 🟢 | knip/depcheck/ts-prune triple-evidence pattern é universal. |
| `code-archaeologist.md`, `database-architect.md`, `debugger.md`, `devops-engineer.md`, `documentation-writer.md`, `mobile-developer.md`, `performance-optimizer.md`, `seo-specialist.md`, `test-engineer.md` | 🔴 v0.1 / v1.0 | **Skills frontmatter referenciam skills que não existem** — bug pré-existente. v0.1 dropa; v1.0 fix com skill stubs. |
| `product-manager.md` | 🟢 | Generic PM workflow. Strip `skills:` line. |
| `_archive/*` (5 files) | 🔴 | Já archived; `_REASON.md` documenta. Não viaja. |

### Skills

| Skill | Categoria |
|---|---|
| `experience-principles/SKILL.md` | 🟢 (Strategy A) — **A peça de IP mais valiosa do harness.** |
| `journey-mapping/SKILL.md` | 🟡 (v0.5+ em core) | Pattern universal; paths viram config. |
| `supabase-rls-pattern/SKILL.md` | 🔵 `plugin-supabase` |
| `supabase-migration/SKILL.md` | 🔵 `plugin-supabase` |
| `asaas-integration/SKILL.md` | 🔵 `plugin-payment-asaas` |
| `i18n-pt-br/SKILL.md` | 🔵 `plugin-i18n-pt-br` |
| `design-system-enforcement/SKILL.md` | 🔵 `plugin-design-system` |
| `agent-tool-builder/`, `api-design-principles/`, `api-patterns/`, `api-security-best-practices/`, `architect-review/`, `architecture/`, `architecture-decision-records/` | 🟢 (v1.0) | Imported, generic. Não cabe em v0.1; entra em v1.0 quando 12 skills voltam. |
| `debug-issue.md`, `explore-codebase.md`, `refactor-safely.md`, `review-changes.md` (CRG-helper) | 🔵 `plugin-mcp-code-review-graph` |

### Hooks

| Hook | Categoria |
|---|---|
| `config-protection.cjs` | 🟡 | Lista `PROTECTED` parametrizada via `.claude/protected-paths.json`. |
| `post-edit-accumulator.cjs` | 🟢 | Pure plumbing. Sem GoParty refs. |
| `batch-format-typecheck.cjs` | 🟡 | Hardcoda `tsconfig.app.json` (Vite convention). Parametriza `TSC_PROJECT`. Lines 105-127 são journey-mapping bonus → opt-in se skill present. |
| `design-quality-check.cjs` | 🔵 `plugin-design-system` | 9 SIGNALS arrays — DS+pt-BR coupling pesado. |
| `journey-touch-reminder.cjs` | 🔵 `plugin-journey-mapping` | Hardcoda paths GoParty. |

### Commands

| Comando | Categoria |
|---|---|
| `code-review.md` | 🟡 (v0.1) |
| `review-pr.md` | 🟡 (v0.5) | 6 agentes hardcoded → list configurable. |
| `feature-dev.md` | 🟡 (v0.5) | Mentions Organizador/Anfitrião → `{{personas}}`. |
| `plan.md`, `prp-plan.md`, `prp-prd.md`, `refactor-clean.md`, `save-session.md` | 🟢 (v0.5/v1.0) |
| `design-check.md` | 🔵 `plugin-design-system` |
| `init-project.md` | 🔴 v0.1 | Substituído pelo skill `init-project` que invoca npx. |

### Templates (8)

`ADR.md`, `AGENT.md`, `SKILL.md`, `SPEC.md`, `RUNBOOK.md`, `CONTRACTS.md`, `TROUBLESHOOTING.md`, `USE-CASE.md` — todos 🟢. Genéricos, MADR-3.0 / standard. v0.1 ship 3 (ADR, RUNBOOK, SPEC); v0.5 completa.

### `settings.json`

🟡 — base ship com 3 hooks core; plugins fazem merge via `arthus-harness install <plugin>`.

---

## `Docs/`

| Item | Categoria | Notas |
|---|---|---|
| `state.md` | 🟡 | Hot-snapshot pattern universal; conteúdo GoParty. |
| `MISSION.md` | 🟡 | Skeleton + plugin auto-fill (ver PLAN §6.2). |
| `roadmap.md` | 🟡 | Phased pattern reusable. |
| `produto/principios-de-experiencia.md` | 🟢 (Strategy A) — **A peça IP central.** |
| `produto/PRODUTO.md` (5 dores) | 🟡 | Dor-first framing reusable; 5 dores são GoParty. |
| `produto/requirements.md` | 🟢 | RF/RNF/RN com IDs estáveis. |
| `produto/jornadas/_template-jornada.md` | 🟢 | Persona-edge-recovery-a11y pattern universal. |
| `produto/jornadas/<persona>/<jornada>.md` | 🔴 | Jornadas concretas GoParty. |
| `arquitetura/arquitetura-tecnica.md` | 🟡 | "1 doc to skip reading src/" pattern é gold. |
| `arquitetura/diagrams/*.mmd` (booking-flow, payment-escrow, kyc-flow, rbac) | 🔴 | Replace com 1 example diagram. |
| `design-system/DESIGN.md` (front-matter YAML) | 🔵 `plugin-design-system` | Format universal; tokens GoParty. |
| `design-system/{tokens,brand,components,patterns}/` | 🔵 `plugin-design-system` (estrutura) + 🔴 (conteúdo) |
| `design-system/AGENTS.md` | 🟢 | "rules for AI in this folder" pattern. |
| `financeiro/`, `institucional/`, `implementacao/`, `testes/` | 🔴 | Asaas/escrow/Veriff/super-admin GoParty. |
| `PRPs/README.md` | 🟢 | PRP folder + naming convention. |
| `PRPs/v2-migration.plan.md` | 🔴 | Plano específico GoParty. |
| `archive/INDEX.md` + `_REASON.md` convention | 🟢 | Archival pattern universal. |

---

## `scripts/`

| Script | Categoria |
|---|---|
| `sync-design-tokens.mjs` | 🔵 `plugin-design-system` | Stack-coupled (shadcn HSL CSS vars + Tailwind). |
| `design-check.mjs` | 🔵 `plugin-design-system` | `ALLOWED_HEX_PATTERNS` lift to config. |
| `check_i18n.mjs` | 🟢 | Pure JSON tree-diff. Skipa silently se `src/locales/` ausente. |
| `docs-check.mjs` | 🟡 | Validador genérico de doc-references-code. GATE_DATE/STRICT pattern é gold. |
| `admin/email-confirmation/*.sql`, `seed-test-data.mjs`, `seed-for-account.mjs` | 🔴 | GoParty ops. |

---

## `.github/workflows/ci.yml`

| Job | Categoria |
|---|---|
| `lint-and-build` | 🟢 | npm install + lint + build universal. |
| `design-system` | 🔵 + 🟢 | Splits cleanly: `design:check` é plugin; `i18n:check` é core. |
| `type-check` (`continue-on-error: true`) | 🟢 | "Informational until strict" pattern é gold. Templatize com comment "remove once strict mode lands". |
| `secrets-scan` (gitleaks) | 🟢 | Universal. |
| `npm-audit --audit-level=high` (continue-on-error) | 🟢 | Universal. |

---

## `e2e/`

| Item | Categoria |
|---|---|
| `global-setup.ts` (storageState pattern) | 🔵 `plugin-e2e-playwright` | Pattern universal pra qualquer auth'd app; couplings (BASE_URL, V2 paths, label selectors) viram config. |
| `fixtures/test-users.ts` | 🟢 | TEST_USERS const + label/type pattern reusable. |
| `fixtures/v2-routes.ts` | 🟢 | "routes-as-typed-const" pattern universal. |
| `*.spec.ts` (calendar/v2-organizer/v2-host) | 🔴 | GoParty content. |
| AxeBuilder helper pattern | 🔵 `plugin-e2e-playwright` |

---

## Resumo numérico

| Categoria | Count | % |
|---|---|---|
| 🟢 DISCIPLINA (core, ship as-is) | ~25 | 25% |
| 🟡 DISCIPLINA + GENERICIZE | ~20 | 20% |
| 🔵 PLUGIN (v0.5+) | ~25 | 25% |
| 🔴 DUST (não viaja) | ~30 | 30% |

**v0.1 cut**: subset dos 🟢 + 🟡 (5 agentes + 2 skills + 2 hooks + 1 cmd + 3 templates + 3 camadas) = **~15 arquivos**. v1.0: ~70 arquivos quando 17 agentes + 12 skills + 4 plugins entram.

---

## Princípio mestre

> **Forma viaja. Conteúdo não.**

A *forma* "skill com `paths:` glob auto-fire" viaja. As *4 sensações concretas* (Confiança, Alívio, Clareza, Comemoração) viajam **literais** apenas porque (a) o usuário pode trocar em 5 segundos e (b) elas são opinionated default que serve produto-tocando-usuário-final em 80% dos casos.

A *forma* "MISSION.md numerado por seção" viaja. As *invariantes concretas* (Asaas idempotência, Veriff webhook signature) **não** viajam — viram plugin-fill.

Quando em dúvida: **a forma é o gate** (algo que reviewers possam citar — "MISSION §1.2", "Régua 3"); **o conteúdo é o domínio**.
