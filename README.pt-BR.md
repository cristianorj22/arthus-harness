<p align="center">
  <img src="assets/logo.png" width="240" alt="arthus-harness mascot — capivara com harness de escalada" />
</p>

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

> **A disciplina que você levou meses pra ajustar no projeto anterior, instalada em 30 segundos no próximo.**

[![npm version](https://img.shields.io/npm/v/create-arthus-harness.svg)](https://www.npmjs.com/package/create-arthus-harness)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`arthus-harness` é um scaffolder Claude Code que faz bootstrap de projetos novos com **5 camadas de proteção** pré-instaladas — agentes, skills, hooks, slash commands, templates de doc, princípios operacionais e invariantes emocionais. Não é boilerplate de stack. Não é starter kit de SaaS. É a sua **forma de operar Claude Code**, empacotada num `npx` que roda uma vez, deixa o projeto pronto pra trabalhar com disciplina, e some. Você começa o próximo projeto **acima** do nível em que o anterior terminou — não do zero.

## Início rápido

```bash
npx create-arthus-harness meu-projeto
cd meu-projeto
```

O que você vê:

```
✔ Project name: meu-projeto
✔ Preset: minimal
✔ Principles strategy: A (literal default)
✔ Init git? Yes

Created meu-projeto/
  → 9 agents, 4 skills, 3 hooks, 5 slash commands
  → MISSION.md, SPEC.md, principios-de-experiencia.md ready
  → .git initialized

cd meu-projeto && claude
```

## Por que isso existe

Você passa três meses ajustando seu Claude Code num projeto. Escreve um agente que pega bug silencioso. Configura um hook que bloqueia o Claude de "consertar" o tsconfig pra fazer o lint passar. Documenta umas réguas de UX que o reviewer aprendeu a aplicar. Cria um slash command que roda 3 reviewers em paralelo antes de cada commit. Funciona lindo. Você sabe o que cada peça faz e por que está ali.

Aí você abre um projeto novo.

E lá está o Claude Code de novo no estado de fábrica. Sem agentes. Sem hooks. Sem o `MISSION.md` que te impedia de cometer 4 vezes o mesmo erro de RLS. Sem aquele arquivo de princípios que fazia toda mensagem de erro nascer dizendo o próximo passo, em vez de culpar o usuário. Você olha, suspira, e começa a copiar `.claude/` na mão do projeto antigo — sabendo que metade do conteúdo é específico daquele domínio e vai sujar o novo, e a outra metade é universal mas você não tem energia pra separar.

Esse é o problema. Claude Code te deixa **criar projetos rápido**, mas a disciplina não viaja com você. Cada projeto novo regride pro nível médio do mundo. O composto de você ficar melhor a cada projeto não acontece — ou acontece **dentro** de um único projeto, e morre quando ele morre.

`arthus-harness` extrai a parte universal disso (as **formas**: agentes, hooks, skills, templates) e deixa em opt-in a parte específica de cada domínio (as **conteúdos** via plugins). Você roda `npx create-arthus-harness` uma vez, responde 3 perguntas, e o projeto novo nasce com 9 agentes, 4 skills, 3 hooks, 5 slash commands e a stack documental de 5 camadas já instalada. Não é template fixo: tem lockfile, baseline, 3-way merge real — quando o harness evolui, você puxa as melhorias sem perder seu trabalho.

A insight é simples: cada projeto novo deveria começar **acima** do nível em que o anterior terminou. Não copiando arquivos no susto. Não reaprendendo as mesmas lições. A disciplina é a única coisa que compõe — e ela só compõe se você a empacotar num lugar que viaja com você.

## Problemas que isso resolve

### 🔥 Setup repetido a cada projeto novo

> **Você já passou por isso?**
>
> "Comecei um projeto novo e fiquei 4 horas copiando `.claude/agents/` na mão do projeto antigo, decidindo arquivo por arquivo o que era universal e o que era específico daquele domínio. Quando terminei, já não tinha mais energia pra começar a feature."

**Como o `arthus-harness` resolve:** `npx create-arthus-harness meu-projeto` + 3 perguntas. 30s depois você tem 9 agentes, 4 skills, 3 hooks, 5 slash commands instalados — só os universais. Conteúdo específico de domínio entra opt-in via plugins.

### 🔥 Agente que silencia erro relaxando config

> **Você já passou por isso?**
>
> "O Claude estava com problema pra fazer build passar. Ao revisar o diff, percebi que ele tinha entrado no `tsconfig.json` e desligado `strictNullChecks`. Build passou, sim. Junto com 200 erros silenciados. Em produção descobri 2 semanas depois."

**Como o `arthus-harness` resolve:** O hook `config-protection.cjs` é PreToolUse e **bloqueante** — qualquer Edit/Write em `tsconfig`, `eslint`, `package.json`, `MISSION.md`, migrations é interrompido com pedido de autorização explícita. O Claude não consegue silenciar erro relaxando config sem você ver.

### 🔥 Falta de memory entre sessões

> **Você já passou por isso?**
>
> "Toda sessão nova eu perco 10 minutos explicando pro Claude o estado atual: em qual feature estou, qual decisão tomamos sexta-feira, por que não usamos a abordagem óbvia. Três sessões na semana, isso é meia hora morta — e o Claude ainda assim segue um caminho que a gente já tinha descartado."

**Como o `arthus-harness` resolve:** Hook `post-edit-accumulator.cjs` registra arquivos editados em auto-memory por sessão. Slash command `/save-session` salva snapshot do estado (branch, último commit, decisões, próximo passo) num arquivo lido no início da próxima. Templates de doc operacional (ADR, RUNBOOK, SPEC) dão lugar pra decisão arquitetural não morar só na sua memória.

### 🔥 PR sem checklist consistente

> **Você já passou por isso?**
>
> "Hoje revisei meu PR antes de mergear e peguei 3 coisas. Semana passada revisei outro do mesmo tamanho e mergeei sem ver nada. Não foi má-fé — foi que o critério mudou conforme meu humor. Não tem como confiar em review que depende de quão dormido eu estava."

**Como o `arthus-harness` resolve:** Slash command `/code-review` invoca múltiplos reviewers em paralelo (`code-reviewer`, `silent-failure-hunter`, `security-reviewer`, `typescript-reviewer`, `a11y-architect`) — cada um com checklist próprio. Não depende do seu humor. Reviewers acumulam padrões em memory por projeto, ficando mais afiados a cada PR.

### 🔥 Erros de UX que repetem em todo projeto

> **Você já passou por isso?**
>
> "De novo eu deixei passar uma mensagem de erro 'Algo deu errado. Tente novamente.' — sem dizer o quê deu errado, sem dizer o próximo passo, sem dizer se foi culpa do usuário ou do sistema. É a quarta vez no mesmo ano que eu lembro disso só na revisão final, com tudo já em produção."

**Como o `arthus-harness` resolve:** Camada 5 — `principios-de-experiencia.md` ship com 4 sensações-âncora + 5 réguas operacionais. A skill `experience-principles` é content-agnostic e auto-fire em arquivos de UI/copy. Você define as suas réguas; a skill garante que sejam aplicadas.

### 🔥 Decisões arquiteturais perdidas

> **Você já passou por isso?**
>
> "Três meses depois, alguém pergunta no PR: 'por que vocês não usaram X?'. Ninguém lembra. Eu lembrava na época, escrevi na cabeça, achei que era óbvio. Não documentei porque tava na inércia. Agora a gente vai discutir tudo de novo."

**Como o `arthus-harness` resolve:** Template `ADR.md` ship por padrão. Camada 4 (Spec-Driven Development) torna `Docs/SPEC.md` o lugar formal pra contratos. Quando alguém quebra `[STABLE]` sem ADR, `code-reviewer` flageia HIGH.

### 🔥 Drift entre código e doc

> **Você já passou por isso?**
>
> "Refatorei o módulo de pagamento, esqueci de atualizar o `Docs/arquitetura/`. Seis semanas depois um dev novo entra, lê a doc, segue ela, e fica perdido no código que mudou. Eu virei o gargalo de onboarding sem perceber."

**Como o `arthus-harness` resolve:** Camada 4 (SPEC) + agente `code-reviewer` flageiam **MEDIUM** quando superfície pública muda sem update de SPEC. Skill `spec-keeper` mantém o `Docs/SPEC.md` vivo e exige status (`[STUB]` / `[DRAFT]` / `[STABLE]`) por contrato. Doc desatualizada não passa em review — vira commit boundary, não memory leak.

## O que isso te abre

### 📈 Composto entre projetos

**Antes:** lição aprendida no projeto A morria lá.
**Agora:** vira melhoria do harness. `arthus-harness sync` puxa atualizações pro projeto vivo sem perder seu trabalho. Cada projeto novo começa **acima** do anterior.

### 📈 Multi-projeto sem regressão de disciplina

**Antes:** 3 projetos paralelos = 3 níveis diferentes de disciplina.
**Agora:** todos nascem com a mesma stack documental, mesmos hooks bloqueantes, mesmos reviewers. Solo dev escala pra N projetos sem "imposto de regressão".

### 📈 Spec-Driven Development sem tooling pesado

**Antes:** SDD parecia coisa de empresa grande com OpenAPI generators, Stoplight, equipes de QA.
**Agora:** `Docs/SPEC.md` é Markdown com tabela `Input → Output → Acceptance → Status`. Status lifecycle 3 níveis. SDD finalmente cabe em projeto solo.

### 📈 Contratos como guard-rail, não cerimônia

**Antes:** "formalizar contrato" virava reunião + Notion que ninguém lia.
**Agora:** contrato vive ao lado do código, no mesmo PR. Quebrar `[STABLE]` exige ADR. Quebrar `[DRAFT]` é livre. Formalidade proporcional à maturidade.

### 📈 Plugins opt-in em vez de starter kit gordo

**Antes:** template SaaS vinha com tudo embolado mesmo se você só ia usar metade.
**Agora:** core ship 9 agentes universais. 7 plugins entram opt-in. Footprint enxuto, contexto limpo pro Claude.

### 📈 UX consistente sem UX team

**Antes:** réguas básicas viviam só na sua cabeça.
**Agora:** Camada 5 transforma suas réguas em code review automático via skill auto-fire. Qualidade de UX team sem ter UX team.

## Pra quem isso é

### ✅ Use `arthus-harness` se você...

- Já operou Claude Code o suficiente pra ter opiniões sobre o que falta no setup default — agentes próprios, hooks bloqueantes, skills com `paths:` scoping, slash commands customizados.
- É solo dev ou time pequeno (≤5 pessoas) que não tem QA / UX / DevOps separados, e por isso quer essas disciplinas instaladas como código no projeto.
- Toca múltiplos projetos em paralelo e está cansado de cada um regredir pro nível médio.
- Acredita que disciplina técnica e cuidado com UX/UI são tipos diferentes de invariante — e quer ferramenta que respeite essa distinção (camadas separadas, severidades separadas).
- Quer que decisões arquiteturais virem ADR, contratos virem SPEC, e princípios virem reviewer automático — em vez de morar só na sua cabeça.

### ❌ NÃO use se você...

- Procura template React/Next/Vite com auth + landing + dashboard pronto. `arthus-harness` é stack-agnóstico — você traz a stack.
- Quer "começar a vibrar com Claude Code" sem ainda ter feito o esforço de entender o que é agente, hook, skill, slash command. O harness é overhead pra quem está no dia 1; vire produtivo no Claude Code primeiro, depois venha empacotar sua disciplina.
- Trabalha em time grande com QA/SRE/DevRel dedicados — esse pessoal já provê externamente o que o harness encapsula como código.
- Não tolera cerimônia mínima. As 5 camadas exigem hábito de manter `MISSION` / `SPEC` / princípios atualizados. Se quer "0 fricção pra mergear o que for", o harness vai te incomodar — propositadamente.

## As 5 camadas de proteção

| # | Camada | Doc | Severidade de violação |
|---|---|---|---|
| 1 | **Processo** | hooks `.cjs` + slash commands | Bloqueante (exit 2) |
| 2 | **Técnica** (não-negociável) | `MISSION.md` | Incidente (rotacionar chaves, post-mortem) |
| 3 | **Princípios operacionais** | `PRODUTO.md §Princípios` | Discussão (cite em PR) |
| 4 | **Contratual (SDD)** | `SPEC.md` + `sdd-guide.md` | Review (PR rejeitado) |
| 5 | **Emocional** | `principios-de-experiencia.md` | Skill auto-fire em UI/copy |

Cada camada com severidade e cadência diferentes — não fundir. Detalhe em [`docs/architecture.md`](docs/architecture.md).

## Comandos da CLI

```bash
# Bootstrap projeto novo
npx create-arthus-harness meu-projeto
# → 30s, 3 perguntas, projeto pronto pra usar Claude Code com disciplina

# Atualizar projeto existente quando harness evolui
arthus-harness sync
# → 3-way merge: arquivos não tocados auto-update; modificados ganham .rej

# Diagnosticar drift
arthus-harness doctor
# → reporta versão atual vs instalada + plugins + missing files

# Adicionar plugin a projeto existente
arthus-harness add-plugin supabase
# → contribuições do plugin merged em .claude/ + package.json + .env.example
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
| `mcp-code-review-graph` | MCP server code-review-graph (Tree-sitter knowledge graph) + 4 skills auxiliares + 2 settingsHooks. Requer `uv` + `uv tool install code-review-graph`. |

## Comparação

| | `arthus-harness` | `create-t3-app` | `cookiecutter` | manual `cp -r` |
|---|---|---|---|---|
| Scaffolda `.claude/` | ✅ | ❌ | ❌ | ✅ (manual) |
| Scaffolda código de produto | ❌ | ✅ | ✅ | ✅ |
| Atualizável (`sync`) com 3-way merge | ✅ | ❌ | ❌ | ❌ |
| Plugins opt-in | ✅ | ⚠️ via opts | ⚠️ via hooks | ❌ |
| Stack-agnóstico | ✅ | ❌ (Next-only) | ✅ | ✅ |
| Stack documental de 5 camadas | ✅ | ❌ | ❌ | ❌ |

## Construído nos ombros de gigantes

- [`create-t3-app`](https://create.t3.gg) — pattern de CLI scaffolder + filosofia opinionated
- [`cookiecutter`](https://cookiecutter.readthedocs.io) — lifecycle de template + inspiração do hook system
- [Anthropic Skills](https://github.com/anthropics/skills) — spec do skill format
- [`PRPs-agentic-eng`](https://github.com/Wirasm/PRPs-agentic-eng) por Wirasm — slash command patterns adaptados (`/code-review`, `/plan`, `/feature-dev`)
- [`everything-claude-code`](https://github.com/affaan-m/everything-claude-code) — pattern de README multi-idioma
- 6 meses operando um marketplace de produção real — onde os agentes/skills/hooks foram battle-tested antes de virar harness

## Documentação

- [PLAN.md](PLAN.md) — master plan (arquitetura + roadmap)
- [DECISIONS.md](DECISIONS.md) — 13 decisões arquiteturais com rationale
- [PROVENANCE.md](PROVENANCE.md) — disciplina vs dust audit
- [CHANGELOG.md](CHANGELOG.md) — histórico de versões
- [docs/plugin-authoring.md](docs/plugin-authoring.md) — como escrever um plugin
- [docs/upgrade-guide.md](docs/upgrade-guide.md) — `arthus-harness sync` deep-dive
- [docs/architecture.md](docs/architecture.md) — estrutura de pastas + plugin contract

## Aviso de yak-shaving

> Se você passar > 2 horas tunando arthus-harness em vez do projeto real, **pare**.

O harness é meio, não fim. Abre uma issue e segue. A skill `init-project` é desenhada pra forçar o próximo prompt a ser sobre o **produto**, não o harness.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cristianorj22/arthus-harness&type=Date)](https://star-history.com/#cristianorj22/arthus-harness&Date)

## Licença

MIT © 2026 Cristiano Moraes
