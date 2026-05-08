# arthus-harness — Master Plan

> Síntese dos 4 reports Opus 4.7 em `analysis/`. Gerado 2026-05-08.
>
> **STATUS (2026-05-08):** ✅ **v1.0 implementada** — todas as decisões deste plano foram entregues, mais a integração da camada SDD (Spec-Driven Development) extraída do projeto Matrix-Prisma-Alloc. Estado atual em [`state.md`](./state.md). Mudanças versionadas em [`CHANGELOG.md`](./CHANGELOG.md). Análise da camada SDD em [`analysis/05-sdd-method-integration.md`](./analysis/05-sdd-method-integration.md).
>
> **Diferenças entre o plano original e o entregue:**
> - **3-layer stack** (Process · MISSION · principios-de-experiencia) → **5-layer stack** (Process · MISSION · Operational principles · SPEC/SDD · principios-de-experiencia). SPEC e Operational principles foram adicionadas após análise comparativa com `benth/` (Matrix project).
> - **Roadmap v0.1 → v0.5 → v1.0** consolidado em uma entrega única (user pediu "continue até v1.0"). Versão atual: 1.0.0 (não publicada em npm ainda).
> - **Open questions Q1-Q5** resolvidas durante implementação — ver [`RESOLVED-QUESTIONS.md`](./RESOLVED-QUESTIONS.md).
>
> Este documento permanece como **histórico** do reasoning original. Pra estado vivo, leia `state.md`.

---

## TL;DR

1. **arthus-harness é um gerador one-shot** (`npx create-arthus-harness <nome>`) que instala 3 camadas de proteção (processo, técnica, emocional) num projeto novo. **Não é boilerplate de stack.**
2. **v0.1 ship em 1 semana** — minimalista deliberado: 5 agentes + 2 skills + 2 hooks + 1 slash command + 3 camadas vivas. Tudo o mais (plugins, sync, MCP) é v0.5+.
3. **Strategy A (literal) + C (framework) coexistem no v0.1**: `principios-de-experiencia.md` chega com as 4 sensações GoParty comentadas como exemplo + framework "defina suas 3-5 sensações-âncora" — usuário decide na entrevista de bootstrap.

---

## 1. Contexto

`go-party-venue-hub` é a fonte. O harness extrai **forma** (3 camadas + skill auto-fire em UI + hook gate de processo + multi-agent review pre-merge), nunca **conteúdo** (Asaas, Veriff, RLS Supabase, Confiança/Alívio).

### Decisões já travadas com Cristiano (não relitigar)

| Pergunta | Decisão |
|---|---|
| Nível de genericidade | **(C)** Núcleo opinionated stack-agnóstico + plugins stack opt-in |
| Distribuição | **(A)** `npx create-arthus-harness <nome>` + **(D)** skill `init-project` (skill invoca o npx) |
| Experience principles | **(A)** literal por padrão, **(C)** framework opt-in — coexistem |
| Onde planejar | Pasta `arthus-harness/` na raiz do `go-party-venue-hub`, isolada |

---

## 2. Persona + JTBD

### Persona — Cristiano-em-6-meses

Solo dev, abre terminal numa segunda. Domínio novo (SaaS B2B / mobile / site / MVP cliente — não importa). Continua usando Claude Code. Continua com a mesma intuição: *não vendemos features, vendemos sensação*. Mesma alergia a hex hardcoded, dashboards genéricos, copy que culpa o usuário, componente de 2330 linhas.

### Job-to-be-done (o único que importa)

> **Quando começo um projeto novo, contrato arthus-harness pra que minha disciplina de produto-com-sensação e meu hábito de operar com Claude Code já estejam instalados — sem precisar lembrar como cheguei nisso em GoParty.**

Palavra-chave: **disciplina**, não scaffold. Scaffold é o veículo. O que viaja é o **gate emocional** ("isso preserva ou ameaça a sensação?") + o **gate técnico** (RLS, idempotência, secrets, hex, hooks, review pre-merge) já cabeados pro Claude Code disparar sozinho.

### JTBDs secundários

- **Atualizar harness uma vez e propagar a melhoria** pros projetos vivos (anti-drift).
- **Compartilhar com outro dev sem 4h de explicação** — onboarding via README < 30 min (v1.0+).

---

## 3. Critérios de sucesso (6 meses)

1. **Time-to-first-protected-commit < 30 min** — de `npx` até primeiro commit que já passa por hooks (lint + secret-scan + experience-principles auto-fire em UI).
2. **Zero re-typing** — Cristiano não cola o mesmo prompt de agente entre projetos.
3. **experience-principles dispara em ≥ 80% das mudanças que tocam UI/copy** no projeto novo.
4. **MISSION.md adaptado em < 15 min** no bootstrap — `init-project` skill faz entrevista guiada (pagamento? KYC? PII? webhook?) e preenche.
5. **Skill `harness-doctor` reporta drift do projeto vs versão atual em < 10s** (v0.5+).
6. **Projeto novo nunca regride abaixo do nível em que GoParty terminou** — validador automatizado (sem hex, sem secrets, 3 camadas presentes, pre-commit funcional).

---

## 4. Anti-patterns + mitigações

| # | Anti-pattern | Mitigação |
|---|---|---|
| 1 | **Over-genericização** — vira "yet another boilerplate" | Opinionated por default. Plugins **opt-in**, não opt-out. Sem flags pra desligar 3 camadas. |
| 2 | **Plugin fatigue** no bootstrap | Wizard com **3 perguntas** (backend persistente? pagamento/PII? web ou mobile?). Resto deduzido. Máximo 5 plugins na v0.1. |
| 3 | **Drift** — projetos forkam e harness apodrece | `arthus-harness sync` aplica patches direcionados (não overwrite). SemVer + CHANGELOG. Skill `harness-doctor` em `SessionStart`. |
| 4 | **Maintenance overhead duplo** (harness + projetos) | Sem submódulo git. Snapshot lockfile (`.arthus-harness.json`) + updates explícitos via `sync`. |
| 5 | **Yesterday's wisdom encoded** — Asaas/Veriff/Supabase vazam pra projetos sem essa stack | **Separação dura forma vs conteúdo**. Forma viaja em core; conteúdo em plugins. |
| 6 | **Yak shaving** | Regra explícita: "se passou > 2h tunando harness em vez do produto, pare". `init-project` termina forçando próximo prompt sobre o **produto**. |
| 7 | **Experience-principles transfer falha** — chega como markdown decorativo, não gate | Skill `experience-principles` tem `paths:` glob auto-fire em `*.tsx`/`*.css`/copy. Wizard: *"Em uma frase: o que você vende além da feature?"* — resposta vira frase central do `principios-de-experiencia.md`. |

### Riscos específicos como meta-tool

| Risco | Mitigação |
|---|---|
| Anthropic muda formato (skill spec, agent frontmatter) | Versão Claude Code declarada em `.arthus-harness.json`. CHANGELOG referencia versão testada. |
| 2 semanas tunando o harness em vez de começar projeto novo | **v0.1 deadline duro: 1 semana.** Se passar, v0.1 cancelada → "copy CLAUDE.md por enquanto". |
| Harness herda toda dust de GoParty | Bootstrap começa com purga deliberada (ver [PROVENANCE.md](./PROVENANCE.md)). |

---

## 5. Arquitetura

### 5.1 Folder structure (do package arthus-harness)

```
arthus-harness/
├── package.json                  # publishes "create-arthus-harness"
├── bin/create.mjs                # entry: npx create-arthus-harness <nome>
├── src/                          # scaffolder code (TS, compiled)
│   ├── prompts.ts
│   ├── render.ts                 # eta templating (§5.3)
│   ├── plugin-loader.ts          # zod-validated manifests
│   ├── conflict-resolver.ts
│   ├── git.ts
│   └── sync.ts                   # arthus-harness sync (v0.5+)
├── core/                         # ALWAYS shipped — opinionated baseline
│   ├── .claude/
│   │   ├── settings.json.eta
│   │   ├── agents/               # 5 in v0.1 (see §10.1)
│   │   ├── skills/               # 2 in v0.1
│   │   ├── commands/             # 1 in v0.1
│   │   ├── hooks/                # 2 in v0.1
│   │   └── templates/            # 3 in v0.1
│   ├── Docs/
│   │   ├── state.md.eta
│   │   ├── arquitetura/arquitetura-tecnica.md.eta
│   │   └── produto/
│   │       ├── PRODUTO.md.eta
│   │       ├── requirements.md.eta
│   │       └── principios-de-experiencia/
│   │           ├── strategy-A.literal.md
│   │           └── strategy-C.framework.md
│   ├── MISSION.md.eta
│   ├── CLAUDE.md.eta
│   └── AGENTS.md.eta
├── plugins/                      # OPT-IN — v0.5+
│   ├── supabase/
│   ├── design-system-pipeline/
│   ├── e2e-playwright/
│   ├── i18n/
│   └── payment-asaas/
├── presets/                      # named bundles
│   ├── goparty-like.yaml
│   └── minimal.yaml
└── docs/
    ├── README.md
    ├── plugin-authoring.md
    └── upgrade-guide.md
```

### 5.2 Core ↔ plugin contract

Manifest format: **`plugin.yaml`** (não `package.json` field — YAML é human-friendly e suporta comentários).

```yaml
name: supabase
version: 0.5.0
description: Supabase (Postgres + Auth + Storage + Edge Functions)
requires:
  core: ">=0.5"
  plugins: []
conflicts: []
contributes:
  files:
    - from: files/**
      to: ./
  claude:
    skills: [supabase-rls-pattern, supabase-migration]
    agents: [database-reviewer]
    hooks: []
    commands: []
  docs:
    - from: docs/supabase.md
      to: Docs/arquitetura/supabase.md
  package:
    scripts: { db:reset: "supabase db reset" }
    deps: { "@supabase/supabase-js": "^2.45.0" }
  ci:
    jobs:
      - name: supabase-check
        run: "npm run db:lint"
  env: [VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY]
prompts:
  - { name: supabaseProjectRef, message: "Supabase project ref", optional: true }
```

**Conflict resolution:**

| Conflito | Estratégia |
|---|---|
| Mesmo `package.json` script (ex: dois plugins com `db:reset`) | **Hard error** ao scaffold, lista offenders, aborta |
| Mesmo file path | Hard error. Plugins devem namespace sob `src/integrations/<plugin>/` |
| Mesmo Claude skill/agent name | First plugin wins (ordem do preset); warn |
| `package.json` deps version mismatch | Pega higher semver, warn |

### 5.3 Scaffolder flow (`npx create-arthus-harness <nome>`)

**Templating engine: [eta](https://eta.js.org)** — 4kb, JS expressions (`<%= var %>` / `<% if %>`), evita colisão com `{{var}}` de Vue/Angular.

**Prompts (3 perguntas, conforme anti-pattern #2):**

1. `projectName` (default: dir name, slugified)
2. `preset` — quick-pick: `goparty-like` / `minimal` / `custom`
3. `principles` — `strategy-A` (literal) / `strategy-C` (framework) / `both`

Se `custom`:

4. `hasBackend` (boolean → infere supabase plugin)
5. `hasPayment` (boolean → infere payment plugin)
6. `target` — `web` / `mobile` (infere e2e-playwright vs detox)

**Fluxo:**

```
load core/ → user picks plugins → validate manifests (zod) →
topological sort by requires → merge passes (files → claude → docs → package → ci → env) →
conflict check → render eta → write to disk →
chmod +x .claude/hooks/*.cjs → npm install → git init → first commit →
print next-steps banner
```

### 5.4 Skill `init-project` (in-Claude-Code)

**Recomendação:** skill **invoca** o npx scaffolder com `--no-prompt --preset=... --plugins=...` — não duplica lógica.

| Pro (invoca) | Con (invoca) |
|---|---|
| 1 source of truth — bug fix no scaffolder ajuda ambos | Requer Node + npx (sempre disponível em dev) |
| Skill fica ~50 linhas | Levemente mais lento (npx download once, depois cache) |
| Versionamento alinhado automaticamente | — |

Quando usar skill vs npx: skill é pra quando o user já está no Claude Code num diretório vazio e quer bootstrap sem sair. npx é cold-start no terminal antes de abrir Claude Code.

### 5.5 Distribuição

**Decisão:** **npm primário** + **GitHub repo como source canônico** (não dois canais paralelos).

- Publica `create-arthus-harness` (sem scope, pra `npx create-arthus-harness x` funcionar).
- Repo `github.com/cristianorj22/arthus-harness` público; tags = npm versions; releases auto-published via GH Actions on tag.

### 5.6 Versionamento (v0.5+)

**Decisão:** **generator-style com snapshot lockfile** (`.arthus-harness.json`).

```json
{
  "version": "0.5.0",
  "preset": "goparty-like",
  "plugins": ["supabase", "design-system-pipeline"],
  "principles": "A",
  "answers": { "projectName": "meu-app" },
  "fingerprint": {
    ".claude/hooks/config-protection.cjs": "sha256:abc...",
    "MISSION.md": "sha256:def..."
  }
}
```

`npx arthus-harness sync`:

1. Lê `.arthus-harness.json`
2. Fetch latest harness version
3. Re-render templates com mesmas answers
4. Para cada arquivo: fingerprint match? overwrite. Modificado? 3-way merge.
5. Conflitos viram `.rej` files (não-bloqueante, solo dev friendly).

Por que não submódulo/subtree: `.claude/` vira read-only — mata workflow "edita um hook nesse projeto".
Por que não fork: rebase hell.
Por que não snapshot puro: harness para de evoluir nos projetos.

---

## 6. As 3 camadas de proteção — como viajam

### 6.1 Processo — hooks + slash commands

| Hook | Modo | Onde |
|---|---|---|
| `config-protection.cjs` | **Bloqueante** (PreToolUse, exit 2) | Core. Universal — protege tsconfig, eslint, package.json, `.claude/settings.json`, MISSION. Lista `PROTECTED` parametrizada via `.claude/protected-paths.json`. |
| `batch-format-typecheck.cjs` | **Bloqueante** lint, **warning** tsc (Stop) | Core. Roda `npm run check:all` (scripts adicionados pelos plugins). No-op se script ausente. Parametriza `TSC_PROJECT` (default `tsconfig.json`). |
| `post-edit-accumulator.cjs` | **Warning** | Core. Auto-memory em `~/.claude/projects/<slug>/memory/`. |
| `journey-touch-reminder.cjs` | **Warning** | Plugin `journey-mapping` (v0.5+). Off se sem `Docs/produto/jornadas/`. |
| `design-quality-check.cjs` | **Warning** | Plugin `design-system-pipeline` (v0.5+). |

**Slash commands core:** v0.1 só `/code-review`. v0.5: `/plan`, `/feature-dev`, `/review-pr`, `/refactor-clean`, `/save-session`. v1.0: `/prp-plan`, `/prp-prd`.

### 6.2 Invariantes técnicas — `MISSION.md`

Skeleton com **forma universal, conteúdo TBD**:

```markdown
# MISSION.md

## §1 Segurança
- Secrets nunca no client. Lista de env vars: TODO
- RLS habilitada (TODO se aplicável — auto-filled pelo plugin supabase)

## §2 Idempotência
- Operações financeiras / side-effects externos: idempotency key.
- TODO: lista os endpoints/handlers.

## §3 Isolamento RBAC — TODO
## §4 Migrations — Forward-only. Reversibilidade testada em staging.
## §5 [Project-specific] — TODO
```

Plugins auto-fill: `supabase` preenche §1 e §4 com regras concretas; `payment-asaas` preenche §2.

### 6.3 Invariantes emocionais — `principios-de-experiencia.md`

**Skill `experience-principles` é content-agnostic** — lê o arquivo dinamicamente, não tem GoParty hardcoded.

**Strategy A (default, literal):** ships principios-de-experiencia.md com 4 sensações + 5 réguas GoParty literais, **comentadas como exemplo**. Sensação `Confiança`/`Alívio`/`Clareza`/`Comemoração` viraram comments tipo `<!-- exemplo GoParty: troque pelo que seu produto vende além da feature -->`.

**Strategy C (opt-in framework):** ships com seções vazias-mas-tipadas + manifest:

```yaml
# Docs/produto/principios-de-experiencia/manifest.yaml
principio-central: "..."
sensacoes:
  - { id: <id>, surface: [<surface_paths>] }
reguas:
  - { id: 1, name: "...", priority: HIGH }
```

Validador `scripts/experience-check.mjs` (v0.5+) garante que `paths:` glob no skill referencia código existente.

**Por que ambos no v0.1:** custo zero ship Strategy A literal; quem quiser Strategy C tem framework pronto. Wizard pergunta na bootstrap: *"Em uma frase: o que você vende além da feature?"* — resposta vira frase central.

---

## 7. Roadmap

### 7.1 v0.1 — semana 1 (deadline duro)

**SIM — ship:**

- ✅ CLI `npx create-arthus-harness <nome>` com 3 prompts
- ✅ **3 camadas de proteção vivas:**
  - `MISSION.md.eta` (template com placeholders)
  - `Docs/produto/principios-de-experiencia.md` Strategy A literal **comentada como exemplo GoParty** + Strategy C framework (ambos files coexistem; wizard escolhe qual usar)
  - `CLAUDE.md.eta` (manual operacional adaptado)
- ✅ **5 agentes core:** `code-reviewer`, `silent-failure-hunter`, `a11y-architect`, `refactor-cleaner`, `product-manager`
- ✅ **2 skills core:** `experience-principles` (com `paths:` glob auto-fire em UI), `init-project` (one-shot, auto-deleta)
- ✅ **2 hooks:** `config-protection.cjs`, `batch-format-typecheck.cjs`
- ✅ **1 slash command:** `/code-review`
- ✅ **3 templates:** `ADR.md`, `RUNBOOK.md`, `SPEC.md`
- ✅ README + [PROVENANCE.md](./PROVENANCE.md)

**NÃO — defer:**

- ❌ Plugin Supabase / Asaas / Stripe / Mapbox
- ❌ MCP code-review-graph wired
- ❌ Playwright + storageState pattern
- ❌ Design system pipeline (`design:sync`)
- ❌ i18n validator
- ❌ 17 agentes / 12 skills / 7 templates / 4 hooks completos
- ❌ `harness-doctor`, `arthus-harness sync`

### 7.2 v0.5 — mês 1

- Plugin `supabase` (RLS skill + migration skill + database-reviewer agent) — **valida o plugin contract**
- Plugin `web-react-vite` (design-system pipeline + Playwright storageState pattern)
- Skill `harness-doctor`
- Slash commands: `/review-pr`, `/plan`, `/refactor-clean`, `/save-session`, `/feature-dev`
- MCP code-review-graph opt-in
- `arthus-harness sync` (patch-based update)
- Hook `journey-touch-reminder.cjs` (no plugin journey-mapping)
- Hook `design-quality-check.cjs` (no plugin design-system-pipeline)

### 7.3 v1.0 — mês 3

- Plugin `payments` (Asaas/Stripe abstratos)
- Plugin `mobile` (RN + Detox)
- 12 skills genéricas importadas (api-design-principles, architecture, etc.)
- 17 agentes completos
- Multi-dev support (segundo dev usa sem fricção)
- Versionamento + sync robusto com 3-way merge
- Preset `goparty-like` 100% reproduz GoParty stack

---

## 8. Decisões consolidadas

Ver [DECISIONS.md](./DECISIONS.md) — 13 decisões com rationale.

## 9. Open questions

Ver [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md) — 7 perguntas pra Cristiano travar antes de começar implementação.

---

## 10. Próximos passos sugeridos

1. **Cristiano lê:** este PLAN + DECISIONS + OPEN-QUESTIONS (~25 min total).
2. **Resolve open questions** (5 das 7 são críticas pra v0.1).
3. **Decisão go/no-go:**
   - **Go:** criar repo `github.com/cristianorj22/arthus-harness`, mover esta pasta inteira pra raiz do novo repo, começar pelo cut list de v0.1. Deadline: 1 semana.
   - **No-go:** congelar planejamento aqui, voltar quando próximo projeto começar.
4. **Se go:** primeiro PR no novo repo é `feat: bootstrap from go-party-venue-hub provenance` — copia os ~15 arquivos do cut list v0.1 + adapta com placeholders.

---

## Apêndice — divergências reconciliadas entre os 4 agentes

Os 4 agentes Opus 4.7 divergiram em 4 pontos. Como reconcilei:

| # | Divergência | Resolução |
|---|---|---|
| 1 | **Tamanho de v0.1** — code-archaeologist: 4 agentes / Plan: 17 agentes / product-manager: 5 agentes | Sigo product-manager (deadline 1 semana é o gate). 5 agentes em v0.1, 17 em v1.0. |
| 2 | **Strategy C timing** — code-archaeologist + general-purpose dizem v0.5+; product-manager diz v0.1 com Strategy A | Ambos coexistem em v0.1 (custo de markdown adicional é zero); validador da Strategy C (scripts/experience-check.mjs) fica em v0.5. |
| 3 | **MCP code-review-graph** — code-archaeologist: optional graceful degradation; product-manager: v0.5 | v0.5 opt-in. v0.1 não inclui (reduz superfície de bug e setup Python `uv`). |
| 4 | **17 agentes em core?** — Plan agent: sim (markdown é barato); product-manager: 5 só | 5 em v0.1, mas estrutura em `core/.claude/agents/` permite adicionar a granel quando aprovados. v1.0 chega aos 17. |

Os 4 reports brutos estão em `analysis/` — leitura recomendada se quiser entender o reasoning de cada agente.
