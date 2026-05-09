---
last-update: 2026-05-09
status: ativo
maintainer: app — review trimestral
strategy: A-literal
related:
  - MISSION.md
  - ./CUSTOMIZATION.md
---

# Princípios de Experiência — app

> **Strategy A (literal default).** Este arquivo chega pré-preenchido com 4 sensações + 5 réguas operacionais. **Use, edite, ou troque.** Quando algo soar específico do exemplo (escrow, fornecedor, reserva), substitua pelo equivalente do seu domínio. Os comentários `<!-- example — replace -->` marcam onde.
>
> Se preferir começar do zero com framework guiado, veja `./CUSTOMIZATION.md` (Strategy C).

## O princípio central

> **Não vendemos features. Vendemos a sensação de [X].**

<!-- example: para um marketplace fintech: [X] = "pagar e poder dormir tranquilo".
     Para um SaaS B2B: [X] = "deployar sexta-feira à tarde sem medo".
     Para um app de saúde: [X] = "saber que estou cuidando de mim".
     Para fintech: [X] = "ver pra onde vai cada centavo, sem surpresa".
     Substitua acima pela frase do SEU produto. Pergunta-âncora:
     "se a feature funcionasse perfeitamente, qual sensação a pessoa sentiria?" -->

A feature é o veículo. A sensação é o produto. Toda decisão — UX, copy, fluxo, tela vazia, mensagem de erro, escolha de roadmap — passa por uma pergunta única: **isso preserva ou ameaça a sensação?**

## As 4 sensações-âncora

A sensação central se desdobra em quatro estados que perseguimos em momentos específicos da jornada.

### 1. Confiança — "[meu dinheiro está protegido]"

<!-- example: marketplace fintech: "meu dinheiro está protegido". Substitua pela frase âncora
     do momento mais sensível do seu produto. Em SaaS: "meu deploy não vai quebrar prod".
     Em saúde: "esse profissional é real e é bom". Em fintech: "minha grana está
     onde eu pus, e ninguém mais mexe". -->

Sentida no momento mais sensível da jornada (ex.: checkout, primeira reserva, ao confirmar pagamento). Construída por **linguagem clara sobre o que está acontecendo, prazos visíveis, status acompanhável**. Quebrada por jargão técnico, status enigmáticos ("processando…"), ausência de quem-é-responsável-pelo-quê.

### 2. Alívio — "[achei o lugar, posso descansar]"

<!-- example: marketplace fintech: "achei o que preciso, parou de ser incerteza".
     SaaS: "achei a integração, cabeça sai do problema". Saúde: "agendei a consulta,
     não preciso mais pesquisar". Substitua pela frase do momento "ufa" do seu produto. -->

Sentida quando o usuário **termina de buscar/decidir e a incerteza para**. É o momento "ufa". Construída por confirmação imediata, próximo passo claro, ausência de letra miúda. Quebrada por novos pedidos depois do "obrigado" ou por incertezas residuais ("aguarde aprovação…" sem prazo).

### 3. Clareza — "sei exatamente o que vai acontecer"

Sentida durante toda a jornada. É o oposto de surpresa. Construída por timelines visíveis, valores sem taxa surpresa, política em linguagem humana. Quebrada por qualquer "depende", "sujeito a análise", "pode levar até X dias úteis" sem contexto adicional.

### 4. Comemoração — "deu certo, agora é festa"

<!-- example: marketplace fintech: pós-evento, liberação de pagamento. SaaS: deploy concluído com sucesso.
     Saúde: alta médica. Substitua pelo equivalente do seu produto. -->

Sentida pós-conclusão. É o **único momento em que celebrar sem pudor é o ponto**. Construída por reconhecimento ("deu tudo certo, parabéns!") e micro-rituais de fechamento. Quebrada por silêncio ou pela inversão (review pedido como obrigação chata).

## As 5 réguas operacionais

Cinco regras concretas que cascateiam do princípio central. Servem como checklist de revisão de qualquer mudança de UX.

### Régua 1 — Nunca culpar o usuário

A Apple não culpa. Toda mensagem termina com **próximo passo** ou **o que a gente vai fazer**. Erro nunca é o fim da conversa.

| ❌ Não | ✅ Sim |
|---|---|
| "CPF inválido." | "Esse CPF tem dígito a mais — confere os 11 números?" |
| "Nenhum resultado encontrado." | "Não achei nada com esses filtros. Quer afrouxar?" |
| "Erro ao processar pagamento." | "Esse cartão não passou. Pode ser limite, dados ou bloqueio do banco. Tenta outro?" |
| "Sessão expirada." | "Faz tempo desde o seu último clique — bora entrar de novo? Seu rascunho está salvo." |

**Sinais de violação no código** (grep targets):

- `error.message` jogado direto na UI sem tradução.
- Strings com "inválido", "incorreto", "falhou" sem próximo passo.
- HTTP status como copy (`"Erro 422"`, `"Status 500"`).
- `toast({ description: error.message })` cru.

### Régua 2 — Sempre um próximo passo óbvio

Toda tela tem **uma** ação primária. Tudo o mais é secundário. Tela com 8 ações concorrentes é tela que paralisa.

**Sinais de violação:**

- Tela com 3+ botões `variant="default"` lado a lado.
- Empty state sem CTA (`<p>Nenhum X encontrado.</p>` — só isso).
- Dashboard com mosaico de cards iguais sem destaque visual pra próxima ação pendente.
- Modal com 2 botões primários (deveria ter 1 primário + 1 ghost/outline).

### Régua 3 — Cuidar do que tem antes de criar mais

Antes de adicionar feature nova, perguntar: **o que já existe está sendo usado bem? Tem peso, atrito, mensagem confusa?** Olhar carinhoso pro produto atual vence feature mirabolante.

**Sinais de violação ao revisar PR:**

- Componente >400 linhas com 6+ `useState` recebendo MAIS funcionalidade. Régua 3 manda **refatorar antes** (extrair custom hook, reducer, ou splitting).
- Backlog de "ajustes pequenos de UX" sendo adiado em nome da próxima feature — flag explicitamente.

### Régua 4 — Resolver com sequência antes de resolver com peça nova

Muita dor de produto se resolve com **timing**, não com mais feature. Espalhar o que precisa acontecer ao longo do tempo.

**Sinais de violação:**

- Onboarding pedindo tudo numa tela.
- Selo único "verificado" em vez de camadas progressivas.
- Filtros avançados expostos no primeiro nível em vez de progressivos.

**Pergunta-âncora** ao revisar fluxo: *isso pode ser sequenciado? Que parte só precisa acontecer no momento X, não no Y?*

### Régua 5 — Tudo simplesmente funciona — ou a gente diz exatamente o que está fazendo

Spinner mudo de 8s é bug, não loading. Operação assíncrona sem narrativa = violação.

| ❌ Não | ✅ Sim |
|---|---|
| Spinner girando sem texto. | "Confirmando — leva uns segundos." |
| `<div className="loading" />` cru. | `<Skeleton />` com a estrutura prevista. |
| `Status: PROCESSING`. | "Em análise. Avisamos por email assim que confirmar (até 5 minutos)." |

**Sinais de violação:**

- `<Loader2 className="animate-spin" />` sem `<span className="sr-only">` ou texto adjacente.
- Estados `isLoading` que renderizam apenas spinner em vez de skeleton estruturado.
- Operação >2s sem feedback intermediário.
- Status PR/SNAKE_CASE exibido cru (`PENDING`, `RECEIVED_IN_CASH`) sem tradução humana.

**A11y cross-check** — mecanismos não são intercambiáveis:

- **Conteúdo substituído** (skeleton → resultado): `aria-busy="true"` no container; skeleton placeholders ficam `aria-hidden="true"`.
- **Mensagem de progresso inline**: `role="status"` + `aria-live="polite"` + texto descritivo.
- **Erro/sucesso assíncrono dinâmico**: ver Régua 1 (`role="alert"` para bloqueante, `aria-live="polite"` para validação).
- **`prefers-reduced-motion`** (WCAG 2.3.3): skeleton com `animate-pulse` precisa respeitar `@media (prefers-reduced-motion: reduce) { animation: none }`.

## Anti-padrão geral

> "Vamos resolver isso adicionando uma feature."

Quase sempre a resposta correta é uma das anteriores: melhorar copy, simplificar fluxo, sequenciar no tempo, dar próximo passo claro. Feature nova é **último recurso**, não primeiro reflexo.

Sintoma: discussão começa em "qual feature vamos lançar este mês" em vez de "qual sensação não está sendo entregue hoje".

## Como usar este documento

**Quando invocar:**

- Antes de aprovar um novo fluxo de UX (onboarding, checkout, gestão).
- Em revisão de copy de erro, estado vazio ou mensagem do sistema.
- Em discussão de roadmap, quando aparecer uma proposta de feature nova.
- Em refatoração de componente >400 linhas (Régua 3).

**Quem invoca:**

- Você (`app` owner), em qualquer decisão de produto.
- Reviewers de código que mexam com UI/UX (`code-reviewer`, `a11y-architect`).
- Skill `experience-principles` (auto-fire em arquivos `.tsx`/`.jsx`/`.css`/copy).

## Atualização deste doc

Princípios não sobem de uma sessão de brainstorm — eles emergem de **padrões que se repetem**. Adicionar uma régua nova só depois de ver a violação acontecer **3+ vezes**. Atualização é decisão consciente — sempre acompanhada de explicação no commit.

---

> **Source**: template Strategy A literal do `arthus-harness v1.0.0`. Edição é encorajada.
