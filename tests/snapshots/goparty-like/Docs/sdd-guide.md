---
last-update: 2026-05-08
status: ativo
related:
  - ./SPEC.md
  - ../MISSION.md
  - ./roadmap.md
---

# Spec-Driven Development — guia do `app`

> Como aplicamos SDD aqui. Curto, prático, focado no contexto deste projeto.

## O que é SDD

**Especificação formal antes da implementação.** Em vez de codar e descobrir os contratos no caminho, definimos no [`SPEC.md`](./SPEC.md):

- **Contratos** entre componentes (input → output → acceptance)
- **Modelos de dados** versionados (autoridade + cadência)
- **Fluxos críticos** explícitos (Mermaid quando ≥ 3 componentes ou async/HITL)
- **Critérios de aceitação mensuráveis**

A spec é a fonte da verdade. **Código diverge ⇒ atualiza a spec, não o contrário.**

## Por que importa

Sem SDD em projeto não-trivial:

- Cada componente vira "caixa preta" que ninguém sabe o que entra/sai
- Mudança numa parte quebra outras em cascata sem que se saiba
- Onboarding de dev novo = leitura de código (lento)
- Testes ficam difíceis de escrever (sem critério claro de "passou")
- Bug em prod revela contrato implícito que ninguém documentou

Com SDD:

- Contratos são citáveis em audit log e PRs ("componente X violou AC-2 do contrato Y")
- Mudança numa parte = atualização cirúrgica do contrato sem mexer no resto
- Dev novo lê SPEC.md em 30 min e entende o sistema
- Testes nascem do contrato, não do código (`test_AC-1_<descricao>`)
- Bug em prod **vira atualização de SPEC** depois do fix

## Status lifecycle — `[STUB]` / `[DRAFT]` / `[STABLE]`

Toda subseção de SPEC.md (cada contrato, cada AC global, cada fluxo) tem **status visível**:

| Status | Significado | Quem pode mudar |
|---|---|---|
| `[STUB]` | Sabemos que existe; ainda não preenchemos. Tem que ter ponteiro pra pendência (P-NNN ou ADR-NNN ou TODO comentado). | Qualquer um, sem cerimônia |
| `[DRAFT]` | Conteúdo inicial escrito. Pode mudar livremente. Implementação ainda não congelou contra ele. | Autor + um reviewer |
| `[STABLE]` | Contrato congelado. Implementação depende dele. Mudança = breaking change. | **Requer ADR formal + plano de migração** |

**Regra mestra:** sem TODO solto. Se está incompleto, status é `[STUB]` + ponteiro.

## Workflow neste projeto

### Quando criar/atualizar uma spec

| Situação | Ação |
|---|---|
| Surge componente novo com superfície pública | Adicionar seção em `SPEC.md §2` com contrato `[STUB]` ou `[DRAFT]` |
| Mudança em regra de negócio | Atualizar [`requirements.md`](./produto/requirements.md) (RN-NNN) e referenciar no contrato afetado |
| Decisão arquitetural | ADR formal em `Docs/decisoes/ADR-NNN-*.md`; atualizar SPEC se mudar contrato |
| Novo critério de aceitação | Adicionar em `SPEC.md §5` (globais) ou na seção do componente |
| Bug em produção que revela contrato implícito | Refletir em `SPEC.md` depois do fix, com referência ao incident |

### Como escrever um bom contrato

Template já está em `SPEC.md §2.1`. Regras:

- **Tipos concretos.** Não "objeto", sim `list of {id_pedido, item_id, quantidade: int[1..999]}`.
- **AC mensurável.** "Respeitar limite" não é AC. "Soma das quantidades por pedido ≤ limite_pedido" é.
- **Status visível.** `[STUB]` / `[DRAFT]` / `[STABLE]` — sem ambiguidade.
- **Sem TODO solto.** Se incompleto: status `[STUB]` + ponteiro pra pendência.

### Como evoluir SPEC sem quebrar tudo

1. **Versionamento.** `SPEC.md` tem `version` no front-matter (semver). Toda mudança incrementa.
2. **Compatibilidade.** Break change em contrato `[STABLE]` exige ADR formal e plano de migração.
3. **Backward-compat window.** Componentes em produção devem aceitar inputs antigos por **N ciclos** (definir N por projeto — recomendação default: 2 sprints) antes de remover.

## Test naming — `test_AC-XX_<descrição>`

Tests bidirecionalmente linkados a SPEC. Convenção:

```
test_AC-1_idempotencia_rodar_2x_produz_mesmo_output
test_AC-2_credencial_invalida_retorna_401_sem_distinguir
test_AC-G03_audit_log_retem_minimo_24_meses
```

**Por que.** Quando um teste falha, o nome diz qual AC do SPEC foi violado. Sem essa convenção, "test failed" é só ruído. Aplicar **especialmente** nos ACs `[STABLE]`.

## Adoção SDD — checklist

Para considerar que SDD está em uso "de verdade" no projeto:

- [ ] [`SPEC.md`](./SPEC.md) referenciada em PRs (changelog menciona "atualiza SPEC §X")
- [ ] Cada componente com superfície pública tem contrato `[DRAFT]` ou `[STABLE]` antes de receber commit de implementação
- [ ] PRs sem update de spec quando mudam contrato são **flagged em review** (severidade MEDIUM no `code-reviewer`)
- [ ] Onboarding de dev novo lê SPEC.md no primeiro dia
- [ ] Testes referenciam ACs (`test_AC-1_...`)
- [ ] Decisões viram ADRs, ADRs alteram SPEC, SPEC alimenta testes
- [ ] `state.md` atualiza ao final de cada sessão com referência à seção SPEC mexida (se houve)

## Quando NÃO usar SDD

SDD adiciona disciplina, e disciplina tem custo. Não use em:

- **Spike / POC descartável** — código que não vai pra `main`, validação técnica de 1 dia
- **Code experimental em `experiments/`** — claramente marcado, nunca produção
- **Refactor puro sem mudança de contrato** — se ninguém de fora vê diferença, SPEC não muda

Para **tudo que vai pra `main`** e tem superfície externa, SDD é o default.

## Anti-patterns comuns

| ❌ Anti-pattern | ✅ Correção |
|---|---|
| Adicionar feature sem atualizar SPEC | PR rejeitado em review (`code-reviewer` flag MEDIUM); abrir PR com SPEC update primeiro |
| AC vago tipo "respeitar limite" | "Soma das quantidades por pedido ≤ `limite_pedido`" |
| Tipo abstrato `objeto` ou `dict` | `{id_pedido: string, items: list of {...}}` |
| Status implícito (sem `[STUB]`/`[DRAFT]`/`[STABLE]`) | Sempre status visível na seção |
| `[STABLE]` quebrado sem ADR | Reverter + criar ADR antes da mudança |
| TODO solto em SPEC | `[STUB]` + ponteiro pra P-NNN ou ADR-NNN |

## Cross-links

- [`./SPEC.md`](./SPEC.md) — a especificação formal
- [`../MISSION.md`](../MISSION.md) — invariantes técnicas (complementam ACs do SPEC; MISSION é cross-cutting, SPEC é per-componente)
- [`./produto/PRODUTO.md`](./produto/PRODUTO.md) — visão de produto + princípios operacionais
- [`./produto/requirements.md`](./produto/requirements.md) — RF/RNF/RN com IDs estáveis (referenciados nos contratos)
- [`./produto/principios-de-experiencia.md`](./produto/principios-de-experiencia.md) — invariantes emocionais (sensação a preservar)
- [`./roadmap.md`](./roadmap.md) — fases e marcos

## Recursos externos

- [Stripe — API versioning](https://stripe.com/blog/api-versioning) — SemVer aplicado a contratos públicos
- [martinfowler.com — ContractTest](https://martinfowler.com/bliki/ContractTest.html) — testes que validam o contrato, não a implementação
- [Anthropic — Building agents with the SDK](https://docs.anthropic.com/) — quando aplicável

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-08.
