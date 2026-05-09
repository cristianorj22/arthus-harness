# Docs/

Índice de toda a documentação do `app`. Mantém o status de cada subpasta — **canônica** (em uso) ou **arquivada** (mantida por contexto histórico).

> Documento desatualizado é pior que documento ausente. Antes de seguir um doc deste índice, confira a data de última edição (`git log -1 -- <path>`) e cruze com o código.

## Material canônico (em uso)

### Documentos de raiz Docs/ (alta frequência de leitura)

| Doc | Status | Conteúdo | Quando ler |
|---|---|---|---|
| [`state.md`](./state.md) | ★ hot snapshot | Estado atual da branch, último commit, decisões da sessão, próximos passos | **Toda nova sessão** — antes de qualquer outra coisa |
| [`roadmap.md`](./roadmap.md) | ★ canônico | Fases concluídas + fase atual + backlog priorizado + gates | Decisão de prioridade ou ao fechar feature |

### Pastas canônicas

| Pasta | Status | Conteúdo | Quando ler |
|---|---|---|---|
| [`produto/`](./produto/) | ★ canônico | PRODUTO.md (visão por dores) + requirements.md (RF/RNF/RN com IDs) + principios-de-experiencia.md + jornadas/ | Antes de criar feature; mudança de visão; toda mudança de UI/copy/fluxo |
| [`arquitetura/`](./arquitetura/) | ★ canônico | arquitetura-tecnica.md + diagrams/ (Mermaid) | Onboarding técnico; mudanças estruturais |
| [`PRPs/`](./PRPs/) | canônico | PRDs leves + planos de implementação para features grandes | Ao escopar feature ≥10 arquivos / ≥500 linhas |

## Material arquivado (não-canônico)

| Pasta | Status | Conteúdo | Critério de recuperação |
|---|---|---|---|
| [`archive/`](./archive/) | arquivado | Material histórico não mais ativo | Ver [`archive/INDEX.md`](./archive/INDEX.md) — três critérios concretos de recuperação |

## Relacionamentos com a raiz

| Documento na raiz | Relacionamento com Docs/ |
|---|---|
| [`../MISSION.md`](../MISSION.md) | Invariantes técnicas. `Docs/arquitetura/` operacionaliza implementação; `Docs/produto/requirements.md` rastreia em RNs testáveis. |
| [`../CLAUDE.md`](../CLAUDE.md) | Manual operacional. Aponta pra cá pra contexto de feature. |
| [`../AGENTS.md`](../AGENTS.md) | Brief curto pra AI tools. Em poucas linhas direciona pra `MISSION.md` + Docs principais. |
| [`../README.md`](../README.md) | Documentação pública. Lista as pastas deste índice. |

## Convenções

- **Linguagem**: PT-BR para docs institucionais. EN ou PT-BR para docs técnicos — manter consistência dentro de cada pasta.
- **Datas em commits e em headers**: ISO `YYYY-MM-DD`.
- **Naming**: kebab-case nos arquivos (`onboarding-anfitriao-prd.md`), PascalCase reservado para nomes próprios de produto.
- **Status de cada doc**: se desatualizado, marcar com `> ⚠️ Desatualizado em <data>: razão` no topo. Não deletar — arquivar.

## Workflow para adicionar um novo doc

1. Identifique a pasta certa (este índice ajuda).
2. Use kebab-case + descrição clara (`pricing-engine-prd.md`, não `prd.md`).
3. Comece com um header curto: `# Título — YYYY-MM-DD` + 1-2 linhas de propósito.
4. Linke daqui se for canônico (atualizar este README).
5. Se for transiente / experimental: prefixe com `_draft-` e exclua quando obsoleto.

## Workflow para arquivar um doc

1. Mova o arquivo para `archive/<YYYY-MM>_<topic>/`.
2. Crie/atualize `_REASON.md` na pasta arquivada explicando: o que era, por que arquivou, decisão que substituiu.
3. Atualize [`archive/INDEX.md`](./archive/INDEX.md) com o item novo.
4. Remova qualquer referência (link) a partir dos docs canônicos.

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-09.
