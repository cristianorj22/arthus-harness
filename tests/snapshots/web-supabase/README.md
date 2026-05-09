# app

app — bootstrapped from arthus-harness v1.0.0

## Setup

Pré-requisitos: Node 20.x+, npm.

```bash
git clone <repo>
cd app
cp .env.example .env       # preencha segredos reais
npm install
npm run dev
```

## Stack

> TODO — preencher após bootstrap. Recomendado documentar:
>
> - Linguagem + runtime
> - Framework de UI
> - Backend / DB
> - Pagamentos (se aplicável)
> - Pacote de testes

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server local |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Suite de testes |
| `npm run design:check` | Valida design tokens vs CSS gerado |


## Estrutura do projeto

```
app/
├── .claude/                Stack Claude Code (agents, commands, skills, hooks)
├── Docs/
│   ├── state.md            Hot snapshot da branch atual — leia primeiro
│   ├── roadmap.md          Fases + backlog priorizado
│   ├── produto/            PRODUTO.md (visão) + requirements.md (RF/RNF/RN) + jornadas/
│   ├── arquitetura/        arquitetura-tecnica.md + diagrams/ (Mermaid)
│   ├── PRPs/               PRDs leves para features grandes
│   └── archive/            Material arquivado (com _REASON.md)
├── src/                    Código (TODO — preencher conforme stack)
├── MISSION.md              Invariantes não-negociáveis
├── AGENTS.md               Brief para qualquer AI tool
├── CLAUDE.md               Manual operacional Claude Code
└── README.md               Este arquivo
```

## Documentação

| Doc | Conteúdo |
|---|---|
| [`Docs/state.md`](Docs/state.md) | Estado atual — leia em toda sessão |
| [`MISSION.md`](MISSION.md) | Invariantes técnicas |
| [`Docs/produto/principios-de-experiencia.md`](Docs/produto/principios-de-experiencia.md) | Invariantes emocionais |
| [`CLAUDE.md`](CLAUDE.md) | Manual operacional (comandos, file map) |
| [`AGENTS.md`](AGENTS.md) | Brief curto para AI tools |
| [`Docs/produto/PRODUTO.md`](Docs/produto/PRODUTO.md) | Visão de produto por dores |
| [`Docs/produto/requirements.md`](Docs/produto/requirements.md) | RF/RNF/RN com IDs estáveis |
| [`Docs/arquitetura/arquitetura-tecnica.md`](Docs/arquitetura/arquitetura-tecnica.md) | Como o sistema é construído |
| [`Docs/roadmap.md`](Docs/roadmap.md) | Fases + backlog |

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-09.
