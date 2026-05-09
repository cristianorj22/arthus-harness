---
last-update: 2026-05-08
status: ativo
---

# Journey Mapping — guia

> Documentar **a sequência que o usuário percorre** numa surface — não a feature em si. Camada de proteção do **processo**, ao lado de MISSION (técnica) e principios-de-experiencia (emocional).

## O que é uma jornada

Documento markdown em `Docs/produto/jornadas/<persona>/<jornada>.md` que captura:

- **Sequência de passos** do user (numerados)
- **Edge cases** (e como cada um é tratado)
- **Multi-actor handoffs** (quando outro agente humano/sistema entra)
- **A11y branches** (`aria-live`, `role="alert"`, `aria-busy` por step)
- **Recovery paths** (o que fazer se um step falhar)
- **Falha catastrófica** (o que fazer se TUDO falhar)

## Estrutura de pastas

```
Docs/produto/jornadas/
├── JOURNEY-MAPPING.md          # este doc
├── _template-jornada.md         # template canônico (vem do core do harness)
├── _surfaces.json               # mapping surface → jornada (lido pelo hook)
├── _proposed/                   # jornadas aspiracionais (sem código por trás)
└── <persona>/                   # uma pasta por persona definida em PRODUTO.md
    ├── <jornada-1>.md
    └── <jornada-2>.md
```

## Frontmatter mandatório

```yaml
---
last-update: YYYY-MM-DD
status: active | aspirational | archived
persona: <id> # número da persona — referencia PRODUTO.md
sensacao-ancora-por-step:
  step-1: confianca
  step-2: alivio
surface-paths:
  - "src/components/checkout/**"
  - "supabase/functions/payment-webhook/**"
cognitive_load: low | medium | high
pausable: true | false
resumable: true | false
---
```

Os 3 últimos campos (`cognitive_load`, `pausable`, `resumable`) são a11y decision-points que mudam implementação. Sem eles, jornada está incompleta.

## `_surfaces.json` — surface mapping

Lido pelo hook `journey-touch-reminder.cjs`. Formato:

```json
[
  { "match": "src/components/checkout/", "journey": "user/checkout.md" }
]
```

`match` é substring (case-sensitive) contra o caminho relativo do arquivo editado. Quando bate, hook registra hint pro Stop hook surfar como warning informativo (nunca bloqueia).

## Workflow

1. **Surface nova ganhar fluxo** → cria jornada em `Docs/produto/jornadas/<persona>/`.
2. **Adicionar entrada em `_surfaces.json`** → mapping path → jornada.
3. **PR toca código de surface coberta** → hook hint dispara, lembra do dev pra atualizar jornada se mudou fluxo.
4. **Reviewer roda `code-reviewer`** → se aplicar skill `journey-mapping`, flag de drift.

## Severidades (em review)

Detalhe na skill `.claude/skills/journey-mapping/SKILL.md`. Resumo:

- **HIGH** — PR adiciona estado novo sem update na jornada.
- **MEDIUM** — drift > 120 dias com commits em surface-paths.
- **MEDIUM** — frontmatter incompleto (a11y decision-points).
- **LOW** — `surface-paths` aponta pra arquivo deletado/renomeado.

## Cross-link

- `.claude/skills/journey-mapping/SKILL.md` — checklist de review
- `.claude/hooks/journey-touch-reminder.cjs` — hint hook (PostToolUse)
- `Docs/produto/principios-de-experiencia.md` — sensação que cada step preserva
- `Docs/produto/jornadas/_template-jornada.md` — template canônico
