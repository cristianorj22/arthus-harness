---
last-update: 2026-05-09
status: ativo (esqueleto — preencher)
maintainer: TODO (visão), revisão trimestral
---

# Produto — app

> Documento de **visão de produto** orientado por dores reais. Não é o plano de negócios completo e não é a especificação técnica (essa vive em [`requirements.md`](./requirements.md) + [`../arquitetura/arquitetura-tecnica.md`](../arquitetura/arquitetura-tecnica.md)).

## Princípio

> **Vendemos sensação de TODO, não feature TODO.**
>
> Substitua TODO pela sensação que o seu produto entrega (ex: "pagar e poder dormir tranquilo", "encontrar emprego e saber que está protegido", "estudar com confiança no resultado"). A feature é o veículo; a sensação é o produto.

## Tese em uma linha

> TODO — escreva em uma linha **a dor que você resolve**. Se você precisa de mais de uma linha, ainda não está claro.

Exemplo (referência de um marketplace fintech): "A celebração brasileira ainda é negociada na confiança — e quando a confiança falha, alguém perde dinheiro. **[Produto] resolve a confiança financeira do evento**, ponta a ponta."

## 5 dores reais e como resolvemos

> Cada dor é um **drama narrado** (não uma feature). Quem sofre + o quê acontece de errado + como você resolve.

### Dor 1 — TODO

**Quem sofre**: TODO (persona específica).

**O drama**:
> "TODO — escreva como o usuário descreveria a situação em primeira pessoa. 2-4 frases. Inclua um detalhe concreto (valor, prazo, número) que torne a dor real."

**Como [SEU PRODUTO] resolve**:
- TODO
- TODO
- TODO

| Antes | Com [SEU PRODUTO] |
|---|---|
| TODO | TODO |

### Dor 2 — TODO

**Quem sofre**: TODO.

**O drama**:
> "TODO"

**Como resolvemos**:
- TODO

### Dor 3 — TODO

**Quem sofre**: TODO.

**O drama**:
> "TODO"

**Como resolvemos**:
- TODO

### Dor 4 — TODO

**Quem sofre**: TODO.

**O drama**:
> "TODO"

**Como resolvemos**:
- TODO

### Dor 5 — TODO

**Quem sofre**: TODO.

**O drama**:
> "TODO"

**Como resolvemos**:
- TODO

<!--
Exemplo (referência — apagar após preencher):

### Dor 1 — "Paguei antes, mas o fornecedor sumiu"

**Quem sofre**: Cliente (B2C) — pessoa física pagando um serviço crítico.

**O drama**:
> "Paguei R$ 3.500 por um serviço. Faltam 2 semanas pro evento. O fornecedor não responde mais. Procurei outro — não tem disponibilidade. Achei que pagar antes era pra garantir; na verdade me trancou."

**Como [Produto] resolve**:
- **Escrow**: dinheiro fica retido na plataforma, não vai pro fornecedor antes da entrega
- **Liberação automática pós-entrega**: dinheiro só transita 48h após confirmação das duas partes
- **Disputa formal**: cliente abre disputa, plataforma media, valor volta se houver fraude
-->

## Personas

> TODO — definir N personas. Detalhamento completo em `Docs/design-system/brand/personas.md` (se você usar o plugin design-system).

| Persona | Idade | Frequência | Sucesso emocional |
|---|---|---|---|
| **TODO** | TODO | TODO | TODO |

## Diferenciação vs concorrência

> TODO — listar 3-5 concorrentes diretos/adjacentes e qual seu diferencial.

| Concorrente | DNA deles | Diferencial nosso |
|---|---|---|
| TODO | TODO | TODO |

## Roadmap em fases

Detalhe operacional em [`../roadmap.md`](../roadmap.md).

## Métricas que importam

Não-vaidosas:
- TODO

Vaidosas (evitar):
- TODO

## Fora de escopo (intencional)

> **Por que esta seção importa.** Non-goals explícitos evitam scope creep, evitam revisões perdidas com features que nunca vão sair, e evitam falsas promessas a stakeholders. **Liste 3-5 itens** antes do bootstrap ser considerado completo. Cada item começa com **NÃO** e diz o que essa decisão libera (tempo? complexidade? risco?).

`app` **NÃO** é (e não pretende ser):

- ❌ **TODO** — exemplo: "NÃO é uma alternativa a [concorrente X]. Liberamos não tentar copiar feature parity."
- ❌ **TODO** — exemplo: "NÃO atende [segmento Y] nesta versão. Liberamos focar em [segmento principal]."
- ❌ **TODO** — exemplo: "NÃO suporta [funcionalidade Z] no MVP. Decisão revisitável em F3."
- ❌ TODO
- ❌ TODO

> Mudança nesta lista exige justificativa em commit (`docs(produto): adiciona X ao escopo — motivação`).

## Princípios operacionais

> **Camada intermediária.** `MISSION.md` define o que **nunca quebrar tecnicamente**. `principios-de-experiencia.md` define o que **nunca quebrar emocionalmente**. Esta seção define **como decidir tradeoffs no dia-a-dia** quando MISSION e principios não dizem nada.
>
> **Liste 3-7 princípios.** Cada um deve ser:
> 1. **Acionável** — alguém revisando código pode citar e dizer "esse PR viola o princípio X".
> 2. **Diferente de MISSION** — princípio não é invariante; tem tradeoff implícito; pode ser quebrado com justificativa.
> 3. **Curto** — frase declarativa de 4-7 palavras + 1 frase explicando.

Princípios do `app`:

1. **TODO — princípio 1.** TODO — frase explicativa (1 linha) sobre o tradeoff que esse princípio assume.
2. **TODO — princípio 2.** TODO.
3. **TODO — princípio 3.** TODO.

<!--
EXEMPLOS de princípios operacionais (apague ao preencher os seus):

1. **Humano no comando.** Toda decisão crítica passa por checkpoint visível antes de virar ação. Tradeoff: mais latência em operações de alto risco, em troca de zero "AI fez sozinho" como surpresa.

2. **Citável por padrão.** Componente nunca decide sem citar fonte (memória, regra, ADR). Tradeoff: docs ficam mais verbosas; auditoria fica trivial.

3. **Falha vocal.** Quando algo externo muda (portal, API, regra), o sistema alerta antes de tentar workaround. Tradeoff: mais ruído de alerta; menos drift silencioso.

4. **LGPD-first.** Dados pessoais ficam em infra própria; LLMs externos recebem dados redigidos. Tradeoff: pipelines mais complexos; conformidade legal sem retrabalho.

5. **Custo previsível.** Orçamento mensal de LLM monitorado; fallback para scripts determinísticos onde houver ROI. Tradeoff: às vezes scripts mais bobos vencem o LLM caro.
-->

> **Como usar:** em PR description, cite o princípio quando relevante (`feat(checkout): aplica "humano no comando" — adiciona dupla confirmação > R$ 1k`). Em discussão de tradeoff, refira por nome.

## Cross-links

- [`../../MISSION.md`](../../MISSION.md) — invariantes não-negociáveis
- [`./requirements.md`](./requirements.md) — RF/RNF/RN com IDs estáveis
- [`./principios-de-experiencia.md`](./principios-de-experiencia.md) — invariantes emocionais
- [`./jornadas/`](./jornadas/) — sequência de passos por persona
- [`../arquitetura/arquitetura-tecnica.md`](../arquitetura/arquitetura-tecnica.md) — como construímos
- [`../roadmap.md`](../roadmap.md) — execução

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-09.
