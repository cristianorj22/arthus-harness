# arthus-harness — Resolved Questions

> 2026-05-08. Respostas finais às 5 perguntas críticas de [OPEN-QUESTIONS.md](./OPEN-QUESTIONS.md). Decisões travadas.

## Q1 — Slug do auto-memory

**Decisão: A (projectName) com fallback de hash do git remote.**

```js
// algoritmo
const slug = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
const remote = await tryGitRemote();           // pode ser null
const hash = remote ? sha256(remote).slice(0, 6) : null;
const memorySlug = hash ? `${slug}-${hash}` : slug;
// → ~/.claude/projects/<memorySlug>/memory/
```

**Rationale.** Solo dev usa mesmo nome em qualquer máquina; portabilidade ganha. Hash do remote desambigua quando dois projetos colidem em nome (raro, mas acontece). Sem remote, slug puro funciona.

**Implementação.** Hook `post-edit-accumulator.cjs` lê do `.arthus-harness.json` o `memorySlug` calculado no scaffold time.

---

## Q2 — MCP servers

**Decisão: C (v0.1 não menciona; v0.5 plugin opt-in com `.mcp.json` local-only).**

**Rationale.** Tocar `~/.claude/settings.json` global é touchy — quebra outros projetos, vira pesadelo de manutenção. Plugin (`plugin-mcp-code-review-graph`, `plugin-mcp-supabase`) escreve `.mcp.json` na raiz do projeto bootstrappado, isolado. Cada projeto declara seus próprios MCP servers.

**v0.5 ship:**
- `plugin-mcp-code-review-graph` com `install.sh` que checa `uv` no PATH e configura `.mcp.json`
- `plugin-mcp-supabase` que configura `.mcp.json` com creds via env

---

## Q3 — `arthus-harness sync` UX em conflitos

**Decisão: C (default `.rej` non-bloqueante + flag `--interactive` opt-in).**

```bash
# default — non-bloqueante, escreve .rej, segue
npx arthus-harness sync

# opt-in interativo — prompt por conflito
npx arthus-harness sync --interactive

# CI/automated — falha se houver conflitos
npx arthus-harness sync --strict
```

**Rationale.** Solo dev usually está focado em outra coisa quando roda sync. 30 prompts interromperiam contexto. `.rej` files ficam disponíveis pra revisão depois. `--strict` permite uso em CI sem surpresas.

---

## Q4 — Escopo dos 5 agentes em v0.1

**Decisão: UX-first.**

| # | Agente | Por quê em v0.1 |
|---|---|---|
| 1 | `code-reviewer` | Entry-point reviewer; carrega `experience-principles` skill |
| 2 | `silent-failure-hunter` | Pattern universal (empty catches, dangerous fallbacks); barato |
| 3 | `a11y-architect` | **Guardião emocional** — também carrega `experience-principles` skill; WCAG é universal |
| 4 | `refactor-cleaner` | Triple-evidence pattern (knip/depcheck/ts-prune) — universal |
| 5 | `product-manager` | Cobre PM workflow; ajuda a fechar a divergência entre código e produto |

**Quem fica fora em v0.1 (entra em v0.2 ou v1.0):** `typescript-reviewer`, `security-reviewer`, `code-archaeologist`, `database-architect`, `database-reviewer` (plugin-supabase), `debugger`, `devops-engineer`, `documentation-writer`, `mobile-developer`, `performance-optimizer`, `seo-specialist`, `test-engineer`.

**Rationale.** O JTBD primário é "preservar disciplina de produto-com-sensação". Trocar `product-manager` por `typescript-reviewer` inverteria essa prioridade. `a11y-architect` é a peça que mais ativa o gate emocional (carrega `experience-principles` + WCAG). `typescript-reviewer` agrega valor MAS é technical-first, não UX-first — entra em v0.2 (1 semana depois) sem custo grande.

---

## Q5 — Order de extração de plugins

**Decisão (v0.5 → v1.0):**

| Ordem | Plugin | Razão |
|---|---|---|
| 1 | `design-system-pipeline` | Mais isolado (DESIGN.md → CSS, com `:root` contract). Valida plugin contract **simples**. |
| 2 | `supabase` | Mais superfície (skills + agent + edge functions + migrations). Valida **conflict resolution**. |
| 3 | `e2e-playwright` | Tem deps externas (`@playwright/test`, `@axe-core/playwright`). Valida **prompts:** adicionais. |
| 4 | `i18n` | Leve (JSON tree validator + skill `i18n-pt-br`). Valida **multi-locale templating**. |
| 5 | `payment-asaas` | Nicho (Asaas webhook + idempotência + skill `asaas-integration`). Valida **plugin-with-secrets**. |

**Stretch (v1.0+):**

- `plugin-mobile` (RN + Detox)
- `plugin-mcp-code-review-graph` (MCP server opt-in)
- `plugin-mcp-supabase`
- `plugin-payment-stripe` (alternative ao asaas)
- `plugin-i18n-en-us`, `plugin-i18n-es-es` (variants do plugin-i18n)
