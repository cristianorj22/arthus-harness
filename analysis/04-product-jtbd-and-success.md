# Analysis 04 — Product strategy / JTBD / success

> Source: `product-manager` agent (Opus 4.7) · 2026-05-08 · 40.011 tokens · 91s

---

# arthus-harness — Product Strategy

## 1. Persona

**Cristiano-em-6-meses** abre um terminal numa segunda-feira de novembro. A ideia nova não é mais GoParty — pode ser um SaaS B2B, um app mobile React Native, um site de conteúdo, um MVP pra um cliente. O domínio mudou. O que **não** mudou:

- Ele continua **solo dev**, com janela curta de foco entre demandas concorrentes.
- Ele continua usando **Claude Code** como par de programação principal.
- Ele continua com a mesma intuição de produto: *não vendemos features, vendemos sensação*.
- Ele continua com a mesma alergia a: dashboards genéricos, copy de erro que culpa o usuário, hex hardcoded, componente de 2330 linhas, "vamos resolver isso adicionando uma feature".

**Dores que ele vai sentir no dia 1 do projeto novo:**

1. *"Como é que era aquele hook de pre-commit que rodava ESLint só nos arquivos editados na sessão?"* — muscle memory operacional perdida.
2. *"Eu preciso reescrever as 4 sensações + 5 réguas? Mas elas eram de GoParty…"* — confusão entre **invariante transferível** (a forma — preservar sensação como gate de produto) e **conteúdo específico** (Confiança/Alívio/Clareza/Comemoração — pertencem a GoParty).
3. *"Será que ainda preciso de `silent-failure-hunter` se esse projeto não tem Supabase?"* — agentes acoplados a stack invisível.
4. *"Tô tunando o harness há 3 dias e ainda não escrevi uma linha do produto."* — yak shaving instalado.

**Modelo mental:** *"Quero abrir o terminal, rodar um comando, e ter o mesmo nível de proteção que GoParty terminou — sem importar GoParty inteiro."*

**Expectativa não-negociável:** as **3 camadas de proteção** (MISSION = invariantes técnicas · principios-de-experiencia = invariantes emocionais · CLAUDE.md = manual operacional) chegam **vivas e adaptáveis**, não como template morto.

---

## 2. Job-to-be-done

**Primário (o único que importa):**

> **Quando começo um projeto novo, contratar arthus-harness pra que minha disciplina de produto-com-sensação e meu hábito de operar com Claude Code já estejam instalados — sem que eu precise lembrar como eu cheguei nisso em GoParty.**

A palavra-chave é **disciplina**, não scaffold. Scaffold é o veículo. O que está sendo transferido é o **gate emocional** ("isso preserva ou ameaça a sensação?") e o **gate técnico** (RLS, idempotência, secrets, hex, hooks, review pre-merge) já cabeados pro Claude Code disparar sozinho.

**Secundários (nice, não obrigatórios):**

- **JTBD-2:** *Atualizar o harness uma vez e propagar a melhoria pros projetos vivos* (anti-drift).
- **JTBD-3:** *Eventualmente compartilhar com outro dev sem precisar explicar 4 horas* — onboarding via README em < 30 min.

---

## 3. Success criteria (6 meses)

1. **Time-to-first-commit-with-protection < 30 min**: de `npx create-arthus-harness foo` até primeiro commit que já passa por hooks (ESLint + secret-scan + experience-principles auto-fire em arquivos UI).
2. **Zero re-typing**: Cristiano não cola o mesmo prompt de agente entre projetos. Os 7 agentes "core" + 4 skills "core" chegam pré-instalados e funcionam sem edição.
3. **Experience-principles dispara em ≥ 80% das mudanças que tocam UI/copy** no projeto novo (medido por: % de PRs em arquivos `*.tsx`/`*.css`/copy onde a skill `experience-principles` foi consultada).
4. **MISSION.md adaptado em < 15 min** no bootstrap — o template tem placeholders `<DOMAIN_INVARIANTS>` que o `init-project` skill preenche por entrevista guiada (Q&A: "esse projeto tem pagamento? KYC? PII? webhook?").
5. **Cristiano consegue identificar arthus-harness atrasado**: skill `harness-doctor` roda `arthus-harness check` e reporta drift do projeto vs. versão atual em < 10s.
6. **Projeto novo nunca regride abaixo do nível em que GoParty terminou** em: ausência de hex hardcoded, ausência de secrets em código, presença das 3 camadas (MISSION + principios + CLAUDE), pre-commit hook funcional. Validador automatizado.

---

## 4. Anti-patterns + mitigações

| # | Anti-pattern | Mitigação |
|---|---|---|
| 1 | **Over-genericização** — vira "yet another boilerplate". | Opinionated por default. Plugins **opt-in**, não opt-out. Sem flags pra desligar as 3 camadas. |
| 2 | **Plugin fatigue** no bootstrap. | Wizard com **3 perguntas** apenas: *(1) tem backend persistente?* *(2) tem pagamento/PII?* *(3) é web ou mobile?*. Resto deduzido. Máximo 5 plugins na v0.1. |
| 3 | **Drift** — projetos forkam e harness apodrece. | `arthus-harness sync` aplica patches direcionados (não overwrite). Versionamento semântico do harness com CHANGELOG. Skill `harness-doctor` roda em `SessionStart`. |
| 4 | **Maintenance overhead duplo** (harness + projetos). | Nada de submódulo git. Harness é ponto-no-tempo: cada projeto carrega snapshot + recibo de versão. Updates são **explícitos**, nunca automáticos. |
| 5 | **Yesterday's wisdom encoded** — padrões GoParty (Asaas, Veriff, Supabase) vazam pra projetos sem essa stack. | **Separação dura entre forma e conteúdo**. Forma (3 camadas + 5 réguas operacionais como **template estrutural**) viaja. Conteúdo (Asaas, Confiança/Alívio, RLS Supabase) **não viaja** — fica em plugins. |
| 6 | **Yak shaving** (tunar harness em vez de shippar). | Regra explícita no README: *"Se você passou > 2h tunando arthus-harness em vez do produto, pare. Volta pro produto, abre issue no harness, segue."* `init-project` skill termina com `git commit "chore: harness instalado"` e força o próximo prompt a ser sobre o **produto**. |
| 7 | **Experience-principles transfer falha** — chega como markdown decorativo, não como gate. | Strategy A (literal) + C (framework) ambas chegam. Skill `experience-principles` tem `paths:` glob auto-fire em `*.tsx`/`*.css`/copy files. Wizard pergunta na entrevista: *"Em uma frase: o que você está vendendo, além da feature?"* — resposta vira a frase central do `principios-de-experiencia.md` do projeto novo. |

---

## 5. Riscos específicos como meta-tool

| Risco | Mitigação |
|---|---|
| **Anthropic muda formato** (skill spec, agent frontmatter, hook API). | Versão pinada de Claude Code declarada em `arthus-harness.json`. Skill `harness-doctor` checa compatibilidade. CHANGELOG do harness referencia versão Claude Code testada. Aceito como custo de plataforma — não tentar suportar N versões. |
| **Cristiano gasta 2 semanas tunando harness** em vez de começar projeto novo. | v0.1 tem deadline duro: **1 semana**. Se passar, v0.1 é cancelada, vira "copy GoParty CLAUDE.md por enquanto". O harness só existe se ele **shippa rápido**. |
| **Harness herda toda dust de GoParty** (Stripe órfão, hooks duplicados, 534 hex hardcoded sendo "normal"). | Bootstrap do harness começa com **purga deliberada**: lista o que de GoParty é **dívida** (não viaja) vs. **disciplina** (viaja). Documentado em `arthus-harness/PROVENANCE.md`. Sem isso, vira "GoParty.zip renomeado". |

---

## 6. v0.1 cut list — ship em 1 semana

**SIM (v0.1):**

- CLI: `npx create-arthus-harness <nome>` clona template + roda `init-project` skill (entrevista 3 perguntas).
- **3 camadas de proteção** chegam vivas: `MISSION.md` (template com placeholders), `Docs/produto/principios-de-experiencia.md` (Strategy A literal das 4 sensações **comentadas como exemplo GoParty** + Strategy C framework: "defina suas 3-5 sensações-âncora aqui"), `CLAUDE.md` (manual operacional adaptado).
- **5 agentes core**: `code-reviewer`, `silent-failure-hunter`, `a11y-architect`, `refactor-cleaner`, `product-manager`. Sem skills wired além de `experience-principles`.
- **2 skills core**: `experience-principles` (com `paths:` glob auto-fire em UI), `init-project` (one-shot, auto-deleta após rodar).
- **2 hooks**: `config-protection.cjs`, `batch-format-typecheck.cjs`. Outros não.
- **1 slash command**: `/code-review`. Outros não.
- **Templates de docs**: `ADR.md`, `RUNBOOK.md`, `SPEC.md`. Outros não.
- README de 1 página + `PROVENANCE.md` (o que veio de GoParty, o que é genérico).

**NÃO (v0.1):**

- Plugin Supabase. Plugin Asaas. Plugin Stripe. Plugin Mapbox.
- MCP code-review-graph wired.
- Playwright + storageState pattern.
- Design system pipeline (`design:sync`).
- i18n validator.
- 17 agentes / 12 skills / 7 templates / 4 hooks completos.
- `harness-doctor`, `arthus-harness sync`, `arthus-harness check`.

**v0.5 (mês 1):** plugin `supabase` (RLS skill + migration skill), plugin `web-react` (design-system pipeline + Playwright), `harness-doctor`, `/review-pr` slash command, MCP code-review-graph opt-in.

**v1.0 (mês 3):** plugin `payments` (Asaas/Stripe abstratos), plugin `mobile`, `arthus-harness sync` (patch-based update), 12 skills genéricas importadas, segundo dev usa sem fricção.

---

## 7. Non-goals — o que arthus-harness explicitamente NÃO é

- **Não é** boilerplate React/Next/Vite. Não escolhe framework por você. Você traz seu Vite; harness instala disciplina por cima.
- **Não é** Yeoman generator / Cookiecutter / `create-next-app`. Esses geram código de produto. Arthus-harness gera **camada de operação com Claude Code** — sobreposta a qualquer stack.
- **Não é** monorepo / starter kit / SaaS template.
- **Não é** opinionado sobre **domínio de produto** (não tem auth pronto, não tem billing pronto, não tem dashboard pronto).
- **Não é** ferramenta de equipe — é ferramenta solo. Multi-dev é v1.0+.
- **Não é** distribuído como dependency npm runtime. É um **gerador one-shot** + skill `init-project` que se auto-deleta. Zero footprint em runtime.
- **Não é** substituto pra MISSION.md específico do projeto. É **andaime** pra você escrever o seu em 15 min.
- **Não é** um produto. Não tem usuários além de Cristiano (e talvez 1-2 devs amigos). Não escala. Quando não servir mais, descarta.

---

**Resumo opinativo:** o ponto inteiro é o **gate de sensação chegar vivo**. Se na semana 1 Cristiano consegue rodar `npx create-arthus-harness saas-novo`, responder 3 perguntas, e em 30 min ter um projeto onde o Claude Code já recusa hex hardcoded, já dispara `experience-principles` em arquivo `.tsx`, e já tem MISSION com invariantes do domínio dele preenchidos — a v0.1 ganhou. Tudo o resto é v0.5+.
