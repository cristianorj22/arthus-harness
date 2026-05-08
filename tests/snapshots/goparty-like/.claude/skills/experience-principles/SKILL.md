---
name: experience-principles
description: Preserve experience invariants when reviewing or writing UI / copy / fluxos / mensagens de erro / empty states / loading. Reads `Docs/produto/principios-de-experiencia.md` dynamically — works with whatever sensações + réguas the project defined.
allowed-tools: ["Read", "Grep", "Glob"]
paths: ["src/**/*.{ts,tsx,jsx,vue,svelte,css}", "src/**/messages*.{ts,tsx}", "src/**/copy*.{ts,tsx}", "Docs/produto/principios-de-experiencia.md", "Docs/produto/principios-de-experiencia/*.md"]
version: 1.0
priority: HIGH
---

# Experience Principles — app

> **Source-of-truth**: `Docs/produto/principios-de-experiencia.md` (Strategy A literal) **or** `Docs/produto/principios-de-experiencia/strategy-C.framework.md` (Strategy C framework).
>
> This skill is **content-agnostic** — it reads whatever the project defined. If you renamed sensações, replaced phrases, or built your own from scratch, the skill follows.

## When to apply

Auto-fire when reviewing or writing:

- JSX / TSX / Vue / Svelte that renders visible copy (not pure layout components).
- Mensagens de erro, validação, empty state, loading, success.
- Fluxos críticos (checkout, onboarding, cancelamento, pagamento — whatever applies to your project).
- Componentes em refactor (especialmente >400 linhas — dispara Régua 3 universal).
- Qualquer string visível ao usuário.

## How to apply

**Step 1 — Load the principles:**

Read `Docs/produto/principios-de-experiencia.md` (or `strategy-C.framework.md` if Strategy C is active). Identify:

- The **princípio central** (1 sentence — what the product *sells beyond features*).
- The **N sensações-âncora** (named emotional states + their surface + their builders/breakers).
- The **M réguas operacionais** (concrete rules with examples + violation signals).

**Step 2 — Apply to the current change:**

For each visible string, copy line, error message, empty state, loading state in the diff:

1. Which sensação does this surface aim to deliver?
2. Which régua, if any, is at risk?
3. Is there a concrete violation signal (e.g., `error.message` raw, spinner without text, empty CTA)?

**Step 3 — Report findings:**

Use this format:

```
[SEVERITY] Régua <N> violada — <régua name>
File: src/path/to/file.tsx:42
Atual: <code snippet>
Sensação ameaçada: <name from principios doc>
Sugestão: <concrete fix>
```

## Severity defaults

These apply unless the project's principios doc says otherwise:

- **HIGH** — Régua 1 (mensagens de erro hostis) violada em qualquer surface visível ao usuário final.
- **HIGH** — Régua 5 (loading silencioso) violada em flow crítico (checkout, pagamento, onboarding).
- **HIGH** — Régua 3 (acumulação) violada quando PR adiciona funcionalidade a componente >400 linhas / 6+ `useState` sem refactor.
- **MEDIUM** — Régua 2 (próximo passo óbvio) violada.
- **MEDIUM** — Régua 4 (sequência antes de feature nova) violada.
- **MEDIUM** — Régua 5 fora de flow crítico.

## Universal violation signals (apply regardless of project domain)

These patterns are bad UX in any product touching end-users:

### Régua 1 (Nunca culpar o usuário) — independente de domínio:

- `error.message` jogado direto na UI sem tradução.
- Strings com "inválido", "incorreto", "falhou" sem próximo passo.
- HTTP status como copy (`"Erro 422"`, `"Status 500"`).
- `toast({ description: error.message })` cru.
- Validação Zod com `.message()` técnico em vez de orientado a ação.

### Régua 2 (Próximo passo óbvio):

- Tela com 3+ botões `variant="default"` lado a lado.
- Empty state sem CTA (apenas `<p>Nenhum X encontrado.</p>`).
- Modal com 2 botões primários.

### Régua 3 (Cuidar do que tem antes):

- PR adiciona feature em componente >400 linhas / 6+ `useState`.
- PR ignora backlog de "polishing" do componente que está sendo expandido.

### Régua 5 (Tudo funciona ou diz o que faz):

- `<Loader2 className="animate-spin" />` sem `<span className="sr-only">` ou texto adjacente.
- `isLoading` que renderiza apenas spinner em vez de skeleton estruturado.
- Operação >2s sem feedback intermediário.
- Status SNAKE_CASE / enum exibido cru sem tradução humana.
- Skeleton com `animate-pulse` sem `prefers-reduced-motion` (WCAG 2.3.3).

## A11y cross-check

Mecanismos a11y de loading/error não são intercambiáveis:

- **Conteúdo substituído** (skeleton → resultado): `aria-busy="true"` no container, removido quando completo. Skeleton placeholders ficam `aria-hidden="true"`.
- **Mensagem de progresso inline**: `role="status"` + `aria-live="polite"` + texto descritivo.
- **Erro bloqueante** (impede submit): `role="alert"` no container — anúncio interrompe leitura atual.
- **Validação não-bloqueante inline** (campo perdeu foco com erro): `aria-live="polite"` — anúncio espera pausa natural.

`<span className="sr-only">Carregando…</span>` solto dentro de spinner SEM `aria-live` no ancestral é texto invisível **não anunciado dinamicamente** se o elemento já estava no DOM.

## Anti-padrão geral

> "Vamos resolver isso adicionando uma feature."

Sintoma: PR descreve "adicionar X feature" mas o problema-raiz era copy ruim, fluxo confuso ou ausência de próximo passo. Flag e pergunte:

> *Qual sensação não está sendo entregue hoje? Resolver feature ou copy?*

## Cross-link com outras skills

- `i18n-source-of-truth` — copy precisa estar no idioma source-of-truth. Esta skill checa **se** a copy preserva sensação.
- `design-system-enforcement` — empty states usam tokens. Esta skill checa **se** o empty state tem CTA (Régua 2).
- `journey-mapping` (se plugin instalado) — flag drift entre código e jornada documentada.
- a11y review — `aria-label`/`sr-only` em loading; esta skill checa **se** o loading tem narrativa.

## Quando NÃO aplicar

- Componentes puros de layout (Grid, Flex, Container) — sem copy, sem estado.
- Utility functions / helpers / hooks que não tocam UI direta.
- Migrations / SQL / edge functions / backend handlers sem surface visível.
- Código de testes (`*.test.*`, `*.spec.*` descreve comportamento, não é UX).

## Source

`Docs/produto/principios-de-experiencia.md` é decisão consciente. Princípios não sobem de brainstorm — emergem de padrões repetidos. Adicionar régua nova só depois de ver a violação 3+ vezes.
