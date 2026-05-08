# Decisões — `<%= projectName %>`

> **ADRs (Architecture Decision Records)** vivem aqui. Use o template em [`../../.claude/templates/ADR.md`](../../.claude/templates/ADR.md).

## Quando criar um ADR

- Decisão arquitetural que afeta **múltiplos componentes** (ex: escolha de banco, runtime, framework).
- Mudança em contrato `[STABLE]` no [`SPEC.md`](../SPEC.md) — toda quebra de stable exige ADR + plano de migração.
- Decisão que você **vai esquecer por que tomou** em 3 meses (regra prática).
- Conflito entre invariantes de [`MISSION.md`](../../MISSION.md) e necessidade de produto — ADR documenta o tradeoff.

## Convenção de nome

```
ADR-NNN-<slug-curto-em-kebab-case>.md
```

- `NNN` = sequencial 3 dígitos (`ADR-001`, `ADR-002`, ...).
- Slug curto descreve o assunto, não a conclusão (`ADR-001-orquestrador`, não `ADR-001-escolhemos-temporal`).

## Status lifecycle

Cada ADR tem status visível no front-matter:

| Status | Significado |
|---|---|
| `proposed` | Rascunho aberto. Discussão em curso. |
| `accepted` | Decidido. Implementação em andamento ou concluída. |
| `deprecated` | Substituído por outro ADR (referenciar). |
| `superseded` | Quando outro ADR explicitamente substitui (linkar). |

## Cross-link com SPEC

Ver [`../sdd-guide.md`](../sdd-guide.md) — método Spec-Driven Development. Resumo da relação:

- **SPEC.md** declara contratos `[STUB]` / `[DRAFT]` / `[STABLE]`.
- **Quebra de `[STABLE]`** exige ADR aqui + plano de migração.
- **Decisão de stack** (banco, runtime, hosting) precede SPEC — vira ADR antes de SPEC ganhar contratos finais.

## Index

| ADR | Tema | Status | Data |
|---|---|---|---|
| _vazio_ | _Crie o primeiro ADR quando precisar_ | — | — |

<!--
Exemplo de entrada (apague ao adicionar real):

| [ADR-001](./ADR-001-orquestrador.md) | Orquestrador (Temporal vs LangGraph vs n8n) | accepted | 2026-05-08 |
| [ADR-002](./ADR-002-runtime.md) | Agent runtime | proposed | 2026-05-09 |
-->
