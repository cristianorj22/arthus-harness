# CLAUDE.md — app

Manual operacional para o Claude Code trabalhando neste projeto.

> **Hierarquia documental** (leia em ordem quando ganhar contexto novo)
>
> 1. **`Docs/state.md`** — **LEIA PRIMEIRO em toda nova sessão.** Hot snapshot: branch, último commit, decisões recentes, próximo passo. Atualizar ao fim de cada sessão.
> 2. **`MISSION.md`** — invariantes **técnicas** não-negociáveis (segurança, integridade, secrets). Leia antes de tocar auth, dados sensíveis, pagamento, integrações externas.
> 3. **`Docs/SPEC.md`** — **fonte da verdade dos contratos** entre componentes. Mudança em superfície pública (API, schema, edge function, migration) atualiza este doc **antes** de codar. Método em [`./Docs/sdd-guide.md`](./Docs/sdd-guide.md).
> 4. **`Docs/produto/principios-de-experiencia.md`** — invariantes **emocionais** não-negociáveis (sensação a preservar). **MISSION** = nunca quebrar tecnicamente; **SPEC** = contratos entre componentes; **principios-de-experiencia** = nunca quebrar emocionalmente.
> 5. **`Docs/produto/PRODUTO.md`** — North Star + dores + **princípios operacionais** (intermediário entre MISSION e tradeoffs do dia-a-dia).
> 6. **`AGENTS.md`** — brief curto pra qualquer AI tool (Codex, Cursor, GitHub Coding Agent — todos leem `AGENTS.md`).
> 7. **`CLAUDE.md`** (este arquivo) — operações: stack, comandos, conventions, file map. Específico Claude.
> 8. **`Docs/roadmap.md`** + **`Docs/arquitetura/`** — fases + arquitetura técnica.

---

## Stack

> **TODO** — preencher conforme o projeto evolui. Recomendado: Node 20+ (CI), local 22.x funciona.

| Camada | Ferramenta |
|---|---|
| Linguagem | TODO |
| Runtime | Node 20.x+ |
| Frontend | TODO |
| Backend | Supabase (Postgres + Auth + Storage + Realtime + Edge Functions) |
| Pagamentos | TODO |
| Package manager | TODO |

## Setup local

Pré-requisitos: Node 20.x+, npm.

```bash
git clone <repo>
cd app
cp .env.example .env       # preencha segredos reais — nunca commit
npm install
npm run dev
```

Variáveis de ambiente essenciais (lista completa em `.env.example`):

| Variável | Onde |
|---|---|
| `VITE_SUPABASE_URL` | Cliente. |
| `VITE_SUPABASE_ANON_KEY` | Cliente. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Edge functions only.** Nunca importar no cliente. |
| `<TODO>` | <TODO> |

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server local |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint em todo o repo |
| `npm run type-check` | `tsc --noEmit` (informacional até strict mode estabilizar) |
| `npm test` | Suite de testes (TODO wirar) |
| `npm run design:sync` | Gera CSS a partir do `Docs/design-system/DESIGN.md` |
| `npm run design:check` | Valida paridade DESIGN ↔ CSS (CI bloqueia em drift) |
| `npm run db:reset` | Reseta DB local (Supabase CLI) |
| `npm run check:all` | `lint && type-check && design:check` |

## File map (src/)

```
src/
├── TODO         # estrutura por camada/feature — preencher conforme stack
└── ...
```

> **Princípio**: estrutura por **feature** > estrutura por **tipo** quando o projeto cresce. Refactor é caro depois — pense antes do primeiro commit grande.

## File map (raiz)

```
.claude/                    Stack Claude Code (este arquivo descreve)
├── agents/                 9 agentes especializados (core) + plugin agents
├── commands/               5 slash commands (/plan, /feature-dev, /code-review, /refactor-clean, /save-session)
├── hooks/                  3 hooks (.cjs)
└── settings.json           Hooks registrados

Docs/
├── state.md                ★ HOT — leia primeiro em cada sessão
├── SPEC.md                 ★ Fonte da verdade dos contratos entre componentes
├── sdd-guide.md            Método Spec-Driven Development (workflow, status lifecycle)
├── roadmap.md              Fases + backlog priorizado
├── README.md               Índice mestre
├── produto/                ★ PRODUTO.md (visão + princípios operacionais) + requirements.md (RF/RNF/RN com IDs) + jornadas/
├── arquitetura/            arquitetura-tecnica.md + diagrams/ (Mermaid)
├── PRPs/                   PRDs leves + planos de implementação (features grandes)
└── archive/                Histórico arquivado (ver INDEX.md)

MISSION.md                  ★ Invariantes não-negociáveis
AGENTS.md                   Brief para qualquer AI tool
CLAUDE.md                   Este arquivo
README.md                   Documentação pública
```

## Slash commands (`.claude/commands/`)

5 slash commands core:

| Comando | Quando |
|---|---|
| `/plan` | **Antes** de codar feature de risco. Gate "WAIT for CONFIRM" — produz plano detalhado, NÃO toca código. |
| `/feature-dev` | Feature nova >30 min. Workflow 6 fases: Discovery → Explore → Plan → Implement → Review → Summary. |
| `/code-review` | Antes de commit local (escopo pequeno) ou antes de merge em main. Roda 3 reviewers em paralelo + `database-reviewer` se tocar migrations/edge functions. |
| `/refactor-clean` | Limpeza periódica (1× semana). Audit knip/depcheck/ts-prune com tier SAFE/CAUTION/DANGER. Sempre pede aprovação antes de remover. |
| `/save-session` | Hand-off entre sessões. Salva em `.claude/session-data/` (gitignored) — what worked, what didn't, exact next step. |

## Agentes (`.claude/agents/`)

9 agentes core + agentes adicionais via plugins:

| Agente | Quando usar | Origem |
|---|---|---|
| `code-reviewer` | Toda mudança de código. Carrega skill `experience-principles` + `design-system-enforcement`. Inclui SPEC drift check (MEDIUM em mudança de superfície pública sem update). | core |
| `typescript-reviewer` | Mudanças TS/TSX/JS/JSX. Roda `npm run type-check` + `npm run lint`. CRITICAL/HIGH/MEDIUM categorias. | core |
| `silent-failure-hunter` | Mudanças em chamadas externas / catches que escondem erro / fallbacks perigosos. | core |
| `security-reviewer` | Auth, secrets, edge functions, validação de input externo, OWASP Top 10. Carrega skill `supabase-rls-pattern`.  | core |
| `a11y-architect` | UI nova / formulários / fluxos críticos. WCAG 2.1 AA. Carrega skill `experience-principles`. | core |
| `refactor-cleaner` | Audit semanal de dead code (knip/depcheck/ts-prune). Tier SAFE/CAUTION/DANGER. | core |
| `code-archaeologist` | Legacy code / refactor / undocumented systems. Strangler Fig pattern. | core |
| `debugger` | Bug systemático (4 fases: reproduce → isolate → understand → fix). 5 Whys + git bisect. | core |
| `product-manager` | Discovery / requirement gathering / user story writing. | core |
| `database-reviewer` | Mudanças em migrations / SQL / edge functions Supabase. Carrega skills `supabase-rls-pattern` + `supabase-migration`. | plugin-supabase |

> Próximas adições: `documentation-writer`, `devops-engineer`, `mobile-developer`, `performance-optimizer` — entram quando justificado por uso real.

## Skills (`.claude/skills/`)

3 skills core do harness (mais adicionadas pelos plugins escolhidos: supabase, design-system-pipeline, e2e-playwright):

| Skill | Resumo |
|---|---|
| `experience-principles` | Invariantes emocionais — 4 sensações + 5 réguas (Strategy A literal — adapte exemplos pro seu domínio). Auto-fire em UI/copy/fluxos. |
| `design-system-enforcement` | Sem hex hardcoded, token references, design:check antes de commit. |
| `supabase-rls-pattern` | RLS por tabela, `(select auth.uid())`, índices obrigatórios em FK referenciadas por policy. |


## Hooks (`.claude/hooks/`)

3 hooks ativos:

| Hook | Quando | O que faz |
|---|---|---|
| `config-protection.cjs` | PreToolUse Edit/Write | Bloqueia edição de tsconfig/eslint/vite/tailwind/postcss/package.json sem autorização explícita |
| `post-edit-accumulator.cjs` | PostToolUse Edit/Write | Registra path em `.claude/.session-edits.txt` (consumido pelo batch hook) |
| `batch-format-typecheck.cjs` | Stop | Roda `eslint --fix` (bloqueia em erro) + `tsc --noEmit` (warning) nos arquivos editados na sessão |

## Convenções de código

- **Naming**: PascalCase componentes, `useX` hooks, camelCase variáveis. Preferir EN para nomes técnicos novos.
- **Imports**: alias `@/` resolvido pra `src/` quando configurado. Evite `../../../`.
- **Estrutura**: por **feature** > por **tipo**. Refactor é caro; pense antes do primeiro commit grande.
- **Hooks**: 6 `useState` ou >400 linhas em componente → pausar, perguntar se não vira custom hook ou `useReducer`.
- **Comentários**: minimalistas. Apenas o **porquê** quando não-óbvio. Não documentar **o quê** — bom naming faz isso.
- **Test naming (SDD)**: testes que validam um AC do SPEC seguem `test_AC-<id>_<descrição>` — ex: `test_AC-1_idempotencia_rodar_2x_produz_mesmo_output`. Liga teste a contrato; falha aponta exatamente qual cláusula quebrou. Ver [`Docs/sdd-guide.md`](Docs/sdd-guide.md).

## Convenções de commit

> Conventional Commits em **PT-BR**:
>
> `<tipo>(<escopo>): <descrição>`
>
> Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
>
> Exemplos:
> - `feat(auth): adiciona recuperação de senha por email`
> - `fix(checkout): corrige cálculo de total com desconto`
> - `chore(seguranca): rotaciona chave de webhook`

## Quando pedir ajuda ao Claude

- Mudança em auth / secrets / pagamento → invocar `security-reviewer` + ler `MISSION.md §1`.
- Mudança em RLS / migration → invocar `security-reviewer` + ler skill `supabase-rls-pattern`.
- **Mudança em superfície pública** (API, schema, edge function, migration, payload de evento) → atualizar `Docs/SPEC.md §2` **antes** de codar. Contrato `[STABLE]` quebrado exige ADR. Ver [`Docs/sdd-guide.md`](Docs/sdd-guide.md).
- UI nova → ler **`Docs/produto/principios-de-experiencia.md`** (sensação a preservar). + `Docs/design-system/DESIGN.md` (tokens).
- **Copy de erro / empty state / loading / mensagem de sistema** → aplicar Régua 1 (nunca culpar usuário, sempre próximo passo) + Régua 5 (narrar o que está acontecendo, não spinner mudo).
- **Fluxo novo (onboarding, checkout, cancelamento)** → invocar Régua 2 (uma ação primária por tela) + Régua 4 (resolver com sequência antes de empilhar feature).
- Componente >400 linhas → pausar e perguntar antes de adicionar mais.
- Erro silencioso suspeito → invocar `silent-failure-hunter`.
- Acessibilidade (formulário, fluxo crítico) → invocar `a11y-architect`.
- Antes de codar feature de risco → considerar criar PRD em `Docs/PRPs/`.

## Session ops — operação eficiente do Claude Code

Patterns que reduzem custo e aumentam qualidade.

### Rewind > Correct (Double-Esc)

Quando uma tentativa do Claude falhou, **reverta o turn** (Double-Esc) em vez de pedir "não, tenta de novo". Reverter remove a tentativa fracassada do contexto. Pedir "tenta outra coisa" mantém a tentativa errada poluindo o reasoning das próximas.

> Hábito: tentativa errada → Esc Esc → reformula prompt → manda fresh.

### Subagent mental test

Antes de invocar um sub-agent, pergunte:

> "Vou precisar do **output cru das tools** do agente, ou só da **conclusão**?"

- Conclusão only (review report, planning summary) → fork pra subagent. Os tool calls pesados ficam no sub-context, não no main.
- Output cru (precisa do conteúdo de arquivo lido pra próxima decisão) → mantém no main.

### `/compact <hint>` mid-task vs `/clear` no boundary

- **Mid-task** sentindo contexto pesado → `/compact "trabalhando em <feature>, foco em <X>"`. Mantém o eixo da sessão.
- **Task boundary** (acabou feature, vai começar outra coisa) → `/clear` + brief escrito à mão sobre próximo objetivo. **Não compactar** entre tasks — compact mantém junk irrelevante.

> Regra de ouro: compact é o modelo no estado **menos inteligente**. Use com hint específico ou prefira clear+brief.

### `/btw` pra side questions

Pergunta tangencial no meio de uma feature ("aliás, como configura X?") — `/btw <pergunta>` consulta sem poluir o histórico da feature.

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-08.
