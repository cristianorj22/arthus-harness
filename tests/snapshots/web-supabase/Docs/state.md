---
last-update: 2026-05-08
branch: main
last-commit: bootstrap from arthus-harness v1.0.0
maintainer: TODO (atualizar a cada sessão)
---

# State — app

> **Hot snapshot do projeto.** Atualizado a cada sessão de trabalho. Documento AI-handoff: a próxima sessão (humana ou Claude) lê isto e sabe onde retomar **sem precisar pedir contexto**.

## Quem está mantendo

- **Humano**: TODO
- **AI**: Claude Code. Atualiza este arquivo no fim de cada sessão antes de fechar.

## Branch atual

- **Ativa**: `main`
- **Último commit**: `bootstrap from arthus-harness v1.0.0`
- **Status worktree**: limpo (recém-bootstrapped).

## Sessão 1 — 2026-05-08

- Branch: main
- Last commit: bootstrap from arthus-harness v1.0.0
- Status: bootstrap concluído. Próximos passos: revisar `Docs/produto/principios-de-experiencia.md` (Strategy A literal — adaptar exemplos GoParty pro seu domínio), preencher `MISSION.md` TODOs, planejar primeira feature.

## Estado do sistema agora

### Código
- TODO — rodar `npm install` e validar `npm run lint`, `npm run build`, `npm run type-check`.

### Stack Claude Code instalada
- **5 agents**: code-reviewer, typescript-reviewer, silent-failure-hunter, security-reviewer, a11y-architect
- **1 slash command**: `/code-review`
- **3 hooks**: config-protection (PreToolUse), post-edit-accumulator (PostToolUse), batch-format-typecheck (Stop)
- **Skills core**: experience-principles + design-system-enforcement + supabase-rls-pattern
- `MISSION.md` / `AGENTS.md` / `CLAUDE.md` na raiz

## Pendências de bootstrap

1. **Preencher `MISSION.md` TODOs** — invariantes específicas do seu projeto (segurança, idempotência, RBAC, migrations).
2. **Adaptar `Docs/produto/principios-de-experiencia.md`** — Strategy A traz exemplos literais de GoParty; substitua por exemplos do seu domínio mantendo a estrutura das 4 sensações + 5 réguas.
3. **Preencher `Docs/produto/PRODUTO.md`** — sua tese de produto + N dores que você resolve.
4. **Preencher `Docs/arquitetura/arquitetura-tecnica.md`** — stack + domínios + fluxo principal.
5. **Definir primeira feature do roadmap** em `Docs/roadmap.md`.

## Como retomar na próxima sessão

1. Leia este arquivo (`Docs/state.md`).
2. `git log --oneline -10` pra confirmar último commit.
3. Cheque pendências de bootstrap acima.
4. **Antes de codar**: leia `MISSION.md` e a jornada relevante em `Docs/produto/jornadas/` (se existir).
5. **Antes de commit**: `/code-review`.
6. **Ao final da sessão**: atualize este `state.md` com o que rolou.

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-08.
