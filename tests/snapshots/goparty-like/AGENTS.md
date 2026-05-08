# AGENTS.md

Brief para qualquer AI coding agent (Codex, Cursor, GitHub Coding Agent, Claude Code) trabalhando em **app**. Sister files:

- **`MISSION.md`** — invariantes técnicas não-negociáveis. Leia antes de tocar segurança, secrets, integrações externas, auth, schema de dados.
- **`Docs/produto/principios-de-experiencia.md`** — invariantes emocionais não-negociáveis. Leia antes de tocar UI, copy, mensagens de erro, empty states, loading states ou qualquer fluxo voltado ao usuário.
- **`CLAUDE.md`** — manual operacional: comandos, conventions, file map. Leia para ground truth.
- **`.claude/agents/*`** — reviewers especializados. Use eles em vez de improvisar.
- **`.claude/commands/*`** — workflows pré-definidos. Prefira sobre comandos ad-hoc.

## TL;DR

- **Stack**: TODO (preencher após bootstrap).
- **Branch**: feature em `feat/*`, bug em `fix/*`, limpeza em `chore/*`. Squash em `main`. Commits em **PT-BR conventional**.
- **Quality gates**: hooks em `.claude/settings.json` bloqueiam edição de configs (tsconfig, eslint, vite, package.json) sem autorização explícita; ESLint roda nos arquivos editados ao final da sessão (`Stop` hook).
- **Copy**: PT-BR é source-of-truth. Toda string nova passa pelo dicionário (ou marca para extração — não adicione hardcoded debt).
- **Tokens**: tokens de design vivem em `Docs/design-system/DESIGN.md`. Nunca hard-code cor/spacing/radius/elevation em componente.


## Workflow recomendado

1. Nova sessão → ler `Docs/state.md` (hot snapshot).
2. Feature nova → ler `MISSION.md` (constraints) + jornada relevante em `Docs/produto/jornadas/` (se existir).
3. Antes de commit → `/code-review`. Bloquear merge em CRITICAL.
4. UI mudou → ler `Docs/produto/principios-de-experiencia.md` (a sensação que está sendo preservada).
5. Final da sessão → atualizar `Docs/state.md` com o que rolou.

## What NOT to do

- Não relaxar `tsconfig*.json`, `eslint.config.*`, `vite.config.*` ou similares para silenciar erros. Conserte o código. Os hooks bloqueiam isso de qualquer jeito.
- Não introduzir tokens de design hard-coded — sempre referenciar via CSS var / classe utilitária.
- Não bypassar autenticação/autorização em código de cliente. Use endpoints servidor-side com validação.
- Não escrever strings hardcoded em componentes — passe pelo dicionário (ou marque para extração).
- Não adicionar mensagens de erro, empty states ou loading states sem checar `Docs/produto/principios-de-experiencia.md`. `error.message` cru em UI, `<Loader />` sem narrativa, empty state sem CTA — todos violam.
- Não criar novos `*.md` de planejamento sem checar `Docs/archive/INDEX.md` primeiro — recuperar antes de duplicar.

## When stuck

- Leia `MISSION.md` uma vez.
- Procurar antes de perguntar: search é mais rápido que ler arquivo inteiro.
- Para orientação ampla: spawn um sub-agent de exploração.
- Quando descobertas forem críticas: pare e pergunte ao usuário — não siga silenciosamente.

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-08.
