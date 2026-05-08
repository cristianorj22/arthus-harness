# arthus-harness — Open questions

> Perguntas que precisam de resposta antes de começar implementação. As 5 primeiras são críticas pra v0.1; as 2 últimas podem esperar v0.5.

## Críticas pra v0.1

### Q1 — Slug do auto-memory

O hook `post-edit-accumulator.cjs` escreve em `~/.claude/projects/<slug>/memory/`. **Como o slug é derivado num projeto bootstrappado?**

- **Opção A:** do `projectName` answer (ex: `arthus-harness-meu-app`) — portátil entre máquinas se você usa o mesmo nome.
- **Opção B:** do `cwd` (ex: `c--Users-Cristiano-projetos-meu-app`) — quebra se você renomeia a pasta ou clona em outra máquina.
- **Opção C:** do `git remote origin url` hash — mais estável, mas exige remote configurado no first commit.

**Recomendação:** **A** (do projectName). Solo dev usa mesmo nome em qualquer máquina; portabilidade > unicidade.

---

### Q2 — Configuração de MCP servers

`go-party-venue-hub` usa MCP `code-review-graph` (`uv tool install` Python) e MCP `supabase`. **O harness configura MCP no bootstrap, ou deixa user-level?**

- **Opção A:** harness configura. Precisa patcher de `~/.claude/settings.json` (touchy — global state, conflitos com outros projetos).
- **Opção B:** harness só documenta + deixa user copiar do README. Zero touch em global state.
- **Opção C:** v0.1 nem menciona MCP; v0.5 adiciona como opt-in plugin com setup script.

**Recomendação:** **C**. v0.1 simplifica. v0.5 ship MCP como plugin (`plugin-mcp-code-review-graph`) com `install.sh` que checa `uv` no PATH e configura `.mcp.json` local-only (não global).

---

### Q3 — `arthus-harness sync` UX em conflitos

Quando `sync` encontra arquivo modificado pelo user que diverge da nova versão do template:

- **Opção A:** prompt interativo por conflito. Friendly em first run, irritante em projeto antigo com 30 conflitos.
- **Opção B:** escreve `.rej` files e lista no stdout. Não-bloqueante. Solo dev pode revisar depois.
- **Opção C:** flag `--interactive` opt-in; default é B.

**Recomendação:** **C**. Default não-bloqueante; opt-in pra interativo. Solo dev tipicamente tem foco em outra coisa quando roda sync.

---

### Q4 — Escopo dos agentes em core

Cristiano: **5 agentes em v0.1, 17 em v1.0**. Mas: quais 5?

**Recomendação atual (do product-manager report):** `code-reviewer`, `silent-failure-hunter`, `a11y-architect`, `refactor-cleaner`, `product-manager`.

**Tensão:** `code-archaeologist` report sugeriu trocar `a11y-architect` + `product-manager` por `typescript-reviewer`. Diferença: a11y/product-manager privilegiam camada emocional/UX; typescript-reviewer privilegia rigor TS.

**Decisão pendente:** mantém os 5 do product-manager (UX-first) ou troca por:
- `code-reviewer`, `typescript-reviewer`, `silent-failure-hunter`, `a11y-architect`, `refactor-cleaner` (technical-first)?

**Minha recomendação:** **mantém UX-first** (`product-manager` em vez de `typescript-reviewer`). Camada emocional é o IP que Cristiano explicitamente quer preservar. typescript-reviewer entra em v0.2 (1 semana depois).

---

### Q5 — Order de extração de plugins (v0.5)

Plan agent sugeriu: `design-system-pipeline` (mais isolado, valida contract simples) → `supabase` (mais complexo, valida conflict resolution) → `e2e-playwright` → `i18n` → `payment-asaas`.

**Tensão:** se o próximo projeto real do Cristiano for SaaS B2B com Supabase, faz sentido extrair `supabase` PRIMEIRO (own-dogfood) em vez de `design-system-pipeline`.

**Pergunta:** qual o domínio mais provável do próximo projeto? Backend-heavy (supabase first) ou UI-heavy (design-system first)?

---

## Podem esperar v0.5+

### Q6 — Versão pinada de Claude Code

`.arthus-harness.json` declara qual versão de Claude Code foi testada. Quando Anthropic muda formato (skill spec, agent frontmatter):

- **Opção A:** harness desatualiza, user fica sabendo via skill `harness-doctor`.
- **Opção B:** harness mantém compat shims pra N versões.

**Recomendação:** A. Aceita custo de plataforma. Não vira biblioteca de compat.

---

### Q7 — Estratégia de testes do harness

Como testar que `npx create-arthus-harness <nome>` produz output correto?

- **Opção A:** snapshot tests (rodar com cada preset, comparar tree gerada com fixture esperada). Frágil mas explícito.
- **Opção B:** e2e tests (gerar projeto, rodar `npm install`, rodar `npm run check:all`, assertar pass). Lento mas valida funcionalidade.
- **Opção C:** ambos. Snapshot pra estrutura, e2e pra funcional.

**Recomendação:** **C** mas v0.1 só A (mais rápido de configurar). E2e em v0.5 quando pipeline CI estabilizar.

---

## Como travar

Resposta sugerida pode ser qualquer formato — markdown, voice memo transcrito, conversa com Claude Code que vira commit. O importante é decidir antes de começar a codar.

Recomendação: 1 sessão de 30 min lendo PLAN.md + DECISIONS.md + estas perguntas, decidir as 5 críticas, depois `git commit "docs(arthus-harness): trava decisões pra v0.1"` na branch atual antes de criar o repo separado.
