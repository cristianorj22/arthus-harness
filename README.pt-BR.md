# arthus-harness

<p align="center">
  <a href="README.md">English</a> ·
  <strong>Português (Brasil)</strong> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.tr.md">Türkçe</a>
</p>

> Kit genérico de harness engineering pra Claude Code. Faz bootstrap de projetos novos com **5 camadas de proteção** (processo · invariantes técnicas · princípios operacionais · invariantes contratuais via SDD · invariantes emocionais) — extraído do `go-party-venue-hub`.

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Início rápido

```bash
npx create-arthus-harness meu-projeto
cd meu-projeto
```

O wizard pergunta **3 coisas** (preset · princípios · git-init) e gera um projeto com:

- 9 agentes especialistas (`code-reviewer`, `typescript-reviewer`, `silent-failure-hunter`, `security-reviewer`, `a11y-architect`, `refactor-cleaner`, `code-archaeologist`, `debugger`, `product-manager`)
- 4 skills (`experience-principles`, `init-project`, `harness-doctor`, `spec-keeper`)
- 3 hooks (`config-protection`, `post-edit-accumulator`, `batch-format-typecheck`)
- 5 slash commands (`/plan`, `/feature-dev`, `/code-review`, `/refactor-clean`, `/save-session`)
- 8 templates de doc (ADR, RUNBOOK, SPEC, etc.)
- **Stack documental de 5 camadas**: `MISSION.md` (invariantes técnicas) · `Docs/SPEC.md` (contratos entre componentes via SDD) · `Docs/sdd-guide.md` (método Spec-Driven Development) · `Docs/produto/PRODUTO.md` (visão + princípios operacionais) · `Docs/produto/principios-de-experiencia.md` (invariantes emocionais)
- Workflow CI com 5 jobs (lint, design-check, type-check, secrets-scan, npm-audit)
- Lockfile `.arthus-harness/lock.json` + `baseline/` pra `arthus-harness sync`

## O que é isso?

Cristiano passou meses construindo um harness sofisticado de Claude Code no `go-party-venue-hub`: 17 agentes especialistas, 12 skills, 4 hooks, 7 slash commands, 8 templates, integrações MCP, auto-memory, pipeline de design-system. Esse repo extrai as **formas** (disciplinas universais) num kit reutilizável, deixando o **conteúdo** (Asaas, Veriff, Supabase RLS, Confiança/Alívio) em plugins opt-in.

**O Job-To-Be-Done.** Quando você começa um projeto novo, quer que sua disciplina de "produto-com-sensação" + seu hábito de operar Claude Code já estejam instalados — sem ter que lembrar como você chegou nisso no projeto anterior.

## O que isso NÃO é

- ❌ Boilerplate React/Next/Vite (você traz sua stack)
- ❌ create-next-app / Yeoman / Cookiecutter (esses geram código de produto)
- ❌ Template SaaS / starter kit
- ❌ Dependência de runtime (gerador one-shot, zero footprint depois do bootstrap)

## As 5 camadas de proteção

> **MISSION** = nunca quebrar tecnicamente · **SPEC** = contratos entre componentes · **PRODUTO §Princípios** = como decidir tradeoffs · **principios-de-experiencia** = nunca quebrar emocionalmente. Cada camada tem severidade e cadência diferentes — não fundir. Detalhe em [`docs/architecture.md`](docs/architecture.md).

### 1. Camada de processo — hooks + slash commands

Todo commit passa por:

- **`config-protection.cjs`** (PreToolUse, **bloqueante**) — bloqueia edições em `tsconfig`, `eslint`, `package.json`, `MISSION.md`, etc. sem autorização explícita do usuário. Impede agentes de silenciar erros relaxando config.
- **`batch-format-typecheck.cjs`** (Stop, **lint bloqueante / tsc warning**) — roda ESLint nos arquivos editados na sessão ao final. Bloqueia Stop em lint errors. tsc é warning-only (dívida TS é incremental).
- **`post-edit-accumulator.cjs`** (PostToolUse, **warning**) — auto-memory: registra arquivos editados em `~/.claude/projects/<slug>/memory/`.
- **`/code-review`** slash command — roda 3 reviewers em paralelo antes do commit.

### 2. Invariantes técnicas — MISSION.md

Esqueleto vem com seções §1-§7 (Segurança, Idempotência, RBAC, Migrations, Quality, Process). Usuário preenche TODOs no scaffold via entrevista. Plugins auto-preenchem (ex: `plugin-supabase` popula §1 com regras de RLS).

### 3. Princípios operacionais — `Docs/produto/PRODUTO.md §Princípios operacionais`

3-7 princípios acionáveis distintos do MISSION. Cada um precisa ser (a) acionável em code review, (b) diferente do MISSION (tem tradeoff, pode ser quebrado com justificativa), (c) curto.

Exemplos (comentados no template — substitua pelos seus): "Humano no comando" · "Citável por padrão" · "Falha vocal" · "LGPD-first" · "Custo previsível".

### 4. Invariantes contratuais — `Docs/SPEC.md` (Spec-Driven Development)

Especificação formal de contratos entre componentes — `Input → Output → Acceptance → Status`. Status lifecycle `[STUB]` / `[DRAFT]` / `[STABLE]`. Quebra de `[STABLE]` exige ADR + plano de migração.

Agente `code-reviewer` flageia **MEDIUM** quando superfície pública muda sem update de SPEC; **HIGH** se quebrar `[STABLE]` sem ADR. Método em [`core/Docs/sdd-guide.md.eta`](core/Docs/sdd-guide.md.eta).

### 5. Invariantes emocionais — `Docs/produto/principios-de-experiencia.md`

A peça-IP. Duas estratégias coexistem:

- **Strategy A (literal default).** Ship com as 4 sensações-âncora do GoParty (Confiança, Alívio, Clareza, Comemoração) + 5 réguas operacionais — verbatim, com comentários marcando GoParty-specifics pra fácil override.
- **Strategy C (framework opt-in).** Ship com scaffold vazio-mas-tipado + manifest.yaml — define suas próprias N sensações, M réguas; skill `experience-principles` lê dinamicamente.

Skill `experience-principles` é **content-agnostic** — lê o que está no arquivo do seu projeto. Sem GoParty hardcoded.

## Comandos da CLI

```bash
# Bootstrap de projeto novo
npx create-arthus-harness meu-projeto [--preset=goparty-like|web-supabase|minimal] [--principles=A|C|both]

# Dentro de projeto existente bootstrappado de arthus-harness:
arthus-harness sync                 # atualiza templates pra última versão, .rej em conflitos
arthus-harness sync --interactive   # prompt por conflito
arthus-harness sync --strict        # falha em qualquer conflito (pra CI)
arthus-harness doctor               # checa drift entre projeto e versão atual de arthus
arthus-harness add-plugin <nome>    # adiciona plugin a projeto existente
```

## Plugins (opt-in)

| Plugin | O que ship |
|---|---|
| `design-system-pipeline` | Pipeline `DESIGN.md → src/index.css` + validador `design:check` + slash command `/design-check` + hook `design-quality-check.cjs` |
| `supabase` | Agente `database-reviewer` + skills `supabase-rls-pattern` & `supabase-migration` + templates de edge function |
| `e2e-playwright` | Pattern `storageState` + persona fixtures + helper `AxeBuilder` + config Playwright |
| `i18n` | Validador JSON tree + skill `i18n-source-of-truth` + templates de locale |
| `payment-asaas` | Asaas webhook HMAC + middleware de idempotência + skill `asaas-integration` |
| `journey-mapping` | `Docs/produto/jornadas/` + hook `journey-touch-reminder` (lembra quando você toca código de surface coberta por jornada) |
| `mcp-code-review-graph` | MCP server code-review-graph (Tree-sitter knowledge graph) + 4 skills auxiliares + 2 settingsHooks (Stop + SessionStart). Requer `uv` + `uv tool install code-review-graph`. |

## Distribuição

- **Primário:** npm package `create-arthus-harness` (funciona com `npx` direto).
- **Source:** `github.com/cristianorj22/arthus-harness` — público, tags = versões npm, releases auto-publicadas via GH Actions.

## Versionamento

- Generator-style com snapshot lockfile (`.arthus-harness/lock.json`) + diretório `baseline/`.
- `arthus-harness sync` re-renderiza templates usando suas respostas salvas, aplica **3-way merge real** via `node-diff3` em arquivos modificados pelo usuário. Default não-bloqueante (escreve `.rej` em conflitos); opt-in interativo.
- SemVer: bumps majors sinalizam mudanças que quebram templates; minors adicionam plugins/agentes.

## Documentação

- [PLAN.md](PLAN.md) — master plan (arquitetura + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 decisões arquiteturais com rationale
- [PROVENANCE.md](PROVENANCE.md) — o que veio do `go-party-venue-hub` (disciplina vs dust)
- [RESOLVED-QUESTIONS.md](RESOLVED-QUESTIONS.md) — 5 decisões críticas resolvidas
- [CHANGELOG.md](CHANGELOG.md) — histórico de versões
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — como escrever um plugin
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` deep-dive
- [docs/architecture.md](docs/architecture.md) — estrutura de pastas + plugin contract

## Aviso de yak-shaving

> Se você passar > 2 horas tunando arthus-harness em vez do projeto real, **pare**.

O harness é meio, não fim. Abre uma issue no source repo e segue. A skill `init-project` é desenhada pra forçar o próximo prompt a ser sobre o **produto**, não o harness.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## Licença

MIT © 2026 Cristiano Moraes
