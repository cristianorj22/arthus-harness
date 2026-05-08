---
last-update: 2026-05-08
status: ativo
maintainer: Cristiano
related:
  - PLAN.md
  - DECISIONS.md
  - CHANGELOG.md
---

# arthus-harness — state.md (meta)

> Hot snapshot do **harness em si** (não dos projetos que ele bootstrappa).
> Atualizar ao final de cada sessão significativa.

## Status atual

**Versão:** 1.0.0 (não publicado em npm ainda — escopo crescendo no [Unreleased] do CHANGELOG)
**Smoke test:** ✅ minimal (45 files), web-supabase (68 files), goparty-like (92 files)
**Test suite:** ✅ 18/18 testes passando (15 unit + 3 snapshot)
**Snapshot baselines:** ✅ gerados pra todos os 3 presets

## Composição atual do harness

- **9 agentes core**: code-reviewer, typescript-reviewer, silent-failure-hunter, security-reviewer, a11y-architect, refactor-cleaner, code-archaeologist, debugger, product-manager
- **4 skills core**: experience-principles, init-project, harness-doctor, spec-keeper
- **5 slash commands core**: /plan, /feature-dev, /code-review, /refactor-clean, /save-session
- **3 hooks core**: config-protection.cjs (bloqueante), post-edit-accumulator.cjs (warning), batch-format-typecheck.cjs (lint bloqueante / tsc warning)
- **7 plugins opt-in**: supabase, design-system-pipeline, e2e-playwright, i18n, payment-asaas, journey-mapping, **mcp-code-review-graph**
- **3 presets**: goparty-like (6 plugins, mcp-* opt-in by name), web-supabase (3 plugins), minimal (0 plugins)
- **5 layers de proteção docs**: Process · MISSION · Operational principles · SPEC (SDD) · Experience principles
- **3-way merge sync**: lockfile + baseline em `.arthus-harness/`, real diff3 merge via `node-diff3`. Migrou de `.arthus-harness.json` (legacy) automaticamente.

## Sessão atual (2026-05-08)

### Marcos
- **v1.0 entregue completa** — 5 agentes core + 3 skills + 3 hooks + 1 slash command + 8 templates + 5 plugins (supabase, design-system-pipeline, e2e-playwright, i18n, payment-asaas) + 3 presets (goparty-like, web-supabase, minimal).
- **CLI scaffolder funcional** — `npx create-arthus-harness <name>` + `arthus-harness sync|doctor|add-plugin`.
- **5-layer doc stack** definido: Process · MISSION · Operational principles · SPEC (SDD) · Experience principles.
- **SDD layer adicionada** depois do v1.0 inicial — extraída do projeto Matrix-Prisma-Alloc (`benth/`).

### Bugs corrigidos durante a sessão
1. 3 arquivos meus (Strategy A/C, experience-principles SKILL) sem extensão `.eta` → renomeados.
2. Eta `<% // %>` blocks com apóstrofo (`project's`) → removidos (eta parser quebra).
3. `stripGlob` não tratava backslashes Windows → normalizou.
4. `--in-place` flag missing em `index.mjs` (referenciado pelo skill `init-project`) → adicionado.
5. `--json` flag missing em `doctor.mjs` (referenciado pelo skill `harness-doctor`) → adicionado.
6. Eta `autoTrim` consumia newlines em front-matter YAML → desativado.
7. `CLAUDE.md.eta` listava `typescript-reviewer` + `security-reviewer` como core (não estão); `refactor-cleaner` + `product-manager` faltando → corrigido.
8. `/code-review.md.eta` referenciava `security-reviewer` (não existe em nenhum plugin) → removido.

### Decisões tomadas
- **5 agents core (UX-first):** `code-reviewer`, `silent-failure-hunter`, `a11y-architect`, `refactor-cleaner`, `product-manager`.
- **`typescript-reviewer` + `security-reviewer` ficam pra v0.5+** — não cabem em escopo enxuto v1.0.
- **Strategy A + C coexistem** em todo bootstrap — usuário escolhe ou pega ambos.
- **SPEC drift severity = MEDIUM** em v1.0; escalar pra BLOCKING em v0.2+ se adoção pegar.
- **Generator-style versioning** — snapshot lockfile + `arthus-harness sync` 3-way merge.
- **Templating: eta** com `autoTrim: false` (markdown é whitespace-sensitive).

## Próximos passos (não-bloqueantes)

### Alta prioridade — antes de publish em npm
- [x] ~~Rodar snapshot tests com `UPDATE_SNAPSHOTS=1`~~ ✅ baselines gerados
- [x] ~~Adicionar `core/Docs/decisoes/README.md`~~ ✅ implementado
- [ ] Criar repo `github.com/cristianorj22/arthus-harness` e mover esta pasta inteira pra raiz.
- [ ] `npm login` + `npm publish` (validar que `npx create-arthus-harness` funciona numa máquina limpa).

### Implementado pós-v1.0 inicial (v0.5+ shipped)
- [x] ~~Agents: typescript-reviewer, security-reviewer, code-archaeologist, debugger~~ ✅
- [x] ~~Plugin journey-mapping (skill + hook + _surfaces.json config + docs)~~ ✅
- [x] ~~Skill spec-keeper~~ ✅ (em core, content-agnostic, auto-fire em paths típicos de superfície pública)
- [x] ~~Slash commands: /plan, /feature-dev, /refactor-clean, /save-session~~ ✅
- [x] ~~Refactor presets-loader.mjs (single source of truth)~~ ✅ (consolida hardcoded lists em 2 lugares)

### Backlog v0.6+
- [ ] Plugin `mcp-code-review-graph` (opt-in MCP, escreve `.mcp.json` local + script de install)
- [ ] Plugin `mcp-supabase` (opt-in MCP)
- [ ] Real 3-way merge no `arthus-harness sync` (atualmente fingerprint match → overwrite; mismatch → `.rej`. Diff3 word-level seria mais útil.)
- [ ] Escalar SPEC drift de MEDIUM → BLOCKING (após adoção sticking ≥ 2 meses)
- [ ] Plugin `payment-stripe` (alternativa ao asaas)
- [ ] Plugin `mobile-rn-detox`
- [ ] CI/CD do harness — publish auto on tag via GitHub Actions

### Dívida técnica conhecida
- **Snapshot tests** validam estrutura mas não testam runtime. Real `arthus-harness sync` upgrade flow não tem teste e2e.
- **`journey-touch-reminder.cjs`** usa substring match no `_surfaces.json` (sem regex). Bom pra MVP; pode evoluir pra parser do frontmatter `surface-paths:` das jornadas (self-contained design).
- **Preset YAML não suporta** override per-prompt (ex: principles default per-preset). Hoje principles é runtime-only.
- **plugins/**: `requires.plugins` declared mas **não enforced** pela topo-sort. Plugin que precisa de outro hard-dep só funciona se ambos estiverem no preset. Adicionar validation seria valioso.

### v1.x (eventualmente)
- [ ] Plugin `mobile` (RN + Detox).
- [ ] Plugin `payment-stripe` (alternativa ao asaas).
- [ ] Plugin `i18n-en-us`, `plugin-i18n-es-es` (variants do i18n base).
- [ ] CI/CD do harness — publish auto on tag via GitHub Actions.

## Pontos de atenção pra próxima sessão

- **Yak shaving warning** — esta sessão entregou v1.0 completa; **próximo trabalho deveria ser usar o harness, não tunar mais**. Se decidir adicionar feature, abrir issue antes.
- **PLAN.md / DECISIONS.md / OPEN-QUESTIONS.md** — escritos antes da implementação. Ainda valiosos como histórico, mas não refletem 100% o estado final (especialmente: open questions já resolvidos, SDD layer adicionada após). Considerar "freeze" desses docs com nota de status.
- **Análise SDD em `analysis/05-sdd-method-integration.md`** — capturada após sessão de revisão. Útil pra futuras decisões sobre evoluir o método.

## Arquivos tocados nesta sessão (resumo)

**Novos (~40 arquivos novos):**
- bin/, src/ (CLI scaffolder completo)
- core/.claude/* (5 agents, 3 skills, 3 hooks, 1 cmd, 8 templates, settings.json.eta)
- core/Docs/* (state, MISSION, CLAUDE, AGENTS, README, SPEC, sdd-guide, PRODUTO, requirements, principios-de-experiencia A+C+manifest, jornadas, arquitetura, PRPs, archive)
- core/.github/workflows/ci.yml.eta
- 5 plugins/* (supabase, design-system-pipeline, e2e-playwright, i18n, payment-asaas)
- 3 presets/*.yaml
- 3 docs/* (plugin-authoring, upgrade-guide, architecture)
- 3 tests/*.test.mjs

**Editados (na sessão de revisão):**
- CLAUDE.md.eta (hierarquia, agents table, file map)
- code-review.md.eta (security-reviewer reference)
- code-reviewer.md.eta (SPEC drift section)
- PRODUTO.md.eta (princípios operacionais + non-goals)
- README.md (5-layer stack)
- docs/architecture.md (5-layer doc stack section)
- src/render.mjs (autoTrim: false)
- package.json (version 1.0.0)
- CHANGELOG.md (v1.0.0 only — v1.1 reverted per user)
