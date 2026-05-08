# PRPs — Product Requirement Prompts

Pasta para **PRDs leves** + **planos de implementação** de features grandes.

## Quando usar

✅ Use PRP para:
- Features grandes (≥10 arquivos, ≥500 linhas)
- Cross-cutting (toca auth + DB + UI + integração externa)
- Stake alto (payment, KYC, compliance, segurança)
- Quando você precisa **pensar antes de codar** — vibes-coding seria caro

❌ NÃO use PRP para:
- Bug fixes pequenos (1-3 arquivos)
- Feature isolada de 1 página
- Iteração rápida em UI

Para o caso pequeno, ir direto pra implementação basta.

## Fluxo

```
1. Ideia       → user
2. PRD         → Docs/PRPs/<slug>.prd.md     # captura o problema, não a solução
3. Plan        → Docs/PRPs/<slug>.plan.md    # plano de implementação derivado do PRD
4. Implement   → código (referencia PRD + plan como contexto)
5. Review      → /code-review
6. Commit/PR   → git/gh manuais (PT-BR conventional)
```

## Convenção de naming

```
Docs/PRPs/<slug>.prd.md     # PRD
Docs/PRPs/<slug>.plan.md    # Plan derivado do PRD
```

`<slug>` é kebab-case curto: `host-availability-calendar`, `escrow-flow`, `b2b-corporate-billing`.

## Cross-links

- [`Docs/produto/requirements.md`](../produto/requirements.md) — RF/RNF/RN com IDs estáveis (PRD novo gera RFs novos aqui)
- [`Docs/roadmap.md`](../roadmap.md) — execução
- [`MISSION.md`](../../MISSION.md) — invariantes que constringem o PRP

## PRPs ativos

(Vazio inicialmente. Cada feature grande aparece aqui conforme aprovada.)

## Política de arquivamento

PRP fechado (feature em produção, RFs verificados):
1. Mover `<slug>.prd.md` e `<slug>.plan.md` para `Docs/PRPs/_archive/<YYYY-MM>/`.
2. Atualizar `Docs/state.md` com referência ao commit/PR final.
3. Marcar RFs em `Docs/produto/requirements.md` como ✅.
