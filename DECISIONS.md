# arthus-harness — Decisões arquiteturais

> Consolidação. Cada decisão tem rationale curto. Para deep-dive, ver `analysis/03-architecture-design.md`.

| # | Área | Decisão | Rationale |
|---|---|---|---|
| 1 | **Genericidade** | Núcleo opinionated stack-agnóstico + plugins stack opt-in (opção C de 3 alternativas) | Preserva valor da disciplina (3 camadas + skill auto-fire) sem amarrar stack. Travado com Cristiano. |
| 2 | **Distribuição** | npm package primário (`create-arthus-harness`) + GitHub repo como source canônico (não dois canais paralelos) | npx é UX one-liner. GH dá inspeção/issues/PRs. Tags = npm versions. |
| 3 | **Bootstrap entry points** | `npx create-arthus-harness <nome>` (terminal) + skill `init-project` (in-Claude-Code) — skill **invoca** o npx, não duplica lógica | 1 source of truth. Skill fica ~50 linhas. Bug fix propaga. |
| 4 | **Folder structure do package** | Monorepo: `src/` (scaffolder TS) + `core/` (templates ALWAYS shipped) + `plugins/` (opt-in) + `presets/` (named bundles) — em **um único npm package** | Single source of truth, sem duplicação entre scaffolder e templates. |
| 5 | **Plugin manifest** | `plugin.yaml` (zod-validated) declarando contributions: files, claude (skills/agents/hooks/commands), docs, package fragments, ci jobs, env vars, prompts adicionais | YAML > package.json field — human-friendly, suporta comentários. |
| 6 | **Templating engine** | [eta](https://eta.js.org) (4kb, JS expressions `<%= %>` / `<% if %>`) | Mustache: logic-less demais (sem `{{#if}}`). Handlebars: pesado. eta evita colisão com `{{var}}` de Vue/Angular. |
| 7 | **Conflict resolution** | Hard error em script duplo + file path duplo. First-plugin-wins em skill/agent name. Higher semver em deps mismatch. | Solo dev: hard error é mais seguro que silent merge. |
| 8 | **Versionamento** | Generator-style com snapshot lockfile (`.arthus-harness.json`). `npx arthus-harness sync` aplica patches direcionados, 3-way merge em arquivos modificados, conflitos viram `.rej` (non-bloqueante) | Submódulo: read-only mata workflow. Fork: rebase hell. Snapshot: harness para de evoluir. Generator + fingerprint: lightweight, opt-in. **v0.5+.** |
| 9 | **Camada processo — hooks** | Core ship: `config-protection.cjs` (bloqueante) + `batch-format-typecheck.cjs` (lint bloq, tsc warning) + `post-edit-accumulator.cjs` (warning). Plugins: `journey-touch-reminder` + `design-quality-check`. | Universal vs project-specific. Mantém pragma GoParty (lint > type-check). |
| 10 | **Camada técnica — MISSION.md** | Template com **forma universal + conteúdo TBD**. Plugins auto-preenchem (supabase: §1+§4; payment: §2). | 70%-full beats blank page. Forma é o gate ("MISSION §1.2"), conteúdo é específico. |
| 11 | **Camada emocional — principios-de-experiencia.md** | **Strategy A literal + C framework coexistem em v0.1.** Skill `experience-principles` é content-agnostic (lê o arquivo dinamicamente, sem GoParty hardcoded). Wizard pergunta: *"Em uma frase: o que você vende além da feature?"* | Strategy A: zero custo, opinionated default funciona. Strategy C: framework pra quem quer customizar. Skill content-agnostic resolve a tensão. |
| 12 | **v0.1 cut size** | 5 agentes + 2 skills + 2 hooks + 1 slash command + 3 templates + 3 camadas vivas. Deadline 1 semana. | Reconcilia divergência entre Plan agent (17 agentes) e product-manager (5). Deadline é o gate — fail fast. |
| 13 | **Plugin order de extração** | v0.5 começa com `supabase` (mais complexo, valida conflict resolution) e `web-react-vite` (mais isolado, valida contract simples). Depois `e2e-playwright`, `i18n`, `payment-asaas`. | Confirmação pendente em [OPEN-QUESTIONS.md §5](./OPEN-QUESTIONS.md). |
