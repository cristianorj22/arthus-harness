# Jornadas de usuário

> **Camada de proteção do PROCESSO** — ao lado de `MISSION.md` (técnico) e `principios-de-experiencia` (emocional). Aqui documentamos a **sequência de passos** que cada persona percorre, com edge cases, recovery paths, multi-actor handoffs e gates de a11y.

## Quando atualizar

**Toque este doc sempre que**:

- Mudar fluxo crítico (checkout, onboarding, gestão, autenticação, KYC, pagamento, cancelamento).
- Adicionar feature nova que muda o caminho de uma persona.
- Bug em produção revelar edge case não documentado — vira step da jornada.
- **Antes** de implementar feature inexistente — jornada `aspirational` em [`_proposed/`](./_proposed/) vira spec executável.

## Estrutura

```
jornadas/
├── README.md                          # este arquivo
├── _template-jornada.md               # template canônico (copie quando criar uma nova jornada)
├── _proposed/                         # jornadas aspirational (sem implementação ainda)
└── <persona>/                         # uma pasta por persona — preencha conforme PRODUTO.md
    └── <slug-jornada>.md
```

## Sistema de status

| Status | Onde fica | Significa |
|---|---|---|
| **`active`** | pasta da persona | Feature dedicada existe (código que a jornada documenta) |
| **`aspirational`** | pasta da persona | Feature parcialmente existe, jornada documenta o estado-alvo |
| **`draft`** | `_proposed/` | Wishlist puro — nem feature nem produto decidiu fazer |

## Anti-padrões — não fazer

- **Doc de cerimônia** — escrita pra cumprir tabela. Toda jornada começa com "Por que esta jornada existe?" em 1 parágrafo.
- **Doc-especulação** sem flag — tudo aspirational vai pra `_proposed/`, não polui pasta da persona.
- **Mermaid só com happy path** — sad path é onde está o ROI. Sempre inclua.
- **Documentar tudo de uma vez** — escopo bloqueado em 1-2 jornadas iniciais; expansão só após validação.
- **Doc sem hipótese falsificável** — campo obrigatório no frontmatter.
- **Diagrama bonito sem ligação ao código** — `surface-paths` no frontmatter aponta arquivos reais.

## Cross-links com outros docs

- [`PRODUTO.md`](../PRODUTO.md) — visão de produto + dores
- [`requirements.md`](../requirements.md) — RF/RNF/RN numerados (jornadas referenciam por step)
- [`principios-de-experiencia`](../principios-de-experiencia) — sensações + réguas (jornada marca sensação por step)
- [`../arquitetura/diagrams/`](../../arquitetura/diagrams/) — diagramas técnicos. Jornada mostra "o que o user sente"; `.mmd` mostra "o que o sistema faz".
- [`MISSION.md`](../../../MISSION.md) — invariantes técnicos não-negociáveis
