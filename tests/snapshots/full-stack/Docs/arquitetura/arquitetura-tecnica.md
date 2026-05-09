---
last-update: 2026-05-09
status: ativo (esqueleto — preencher)
gatilho-update: ao mudar stack, adicionar integração externa, ou refactor estrutural
maintainer: TODO (decisões), Claude (manutenção textual ao tocar áreas)
---

# Arquitetura técnica — app

> Documento técnico consolidado. Substitui ler `src/` inteiro pra entender o sistema. Não duplica `MISSION.md` (princípios) nem `CLAUDE.md` (operações) — esse aqui descreve **como o sistema é construído**.

## Sumário

1. [Visão de alto nível](#1-visão-de-alto-nível)
2. [Stack por camada](#2-stack-por-camada)
3. [Domínios](#3-domínios)
4. [Fluxo principal](#4-fluxo-principal)
5. [Integrações externas](#5-integrações-externas)
6. [Decisões críticas](#6-decisões-críticas)
7. [Diagramas](#7-diagramas)
8. [Limitações conhecidas](#8-limitações-conhecidas)

---

## 1. Visão de alto nível

> TODO — desenhar diagrama ASCII ou prosa de 1 parágrafo descrevendo: cliente → servidor → integrações externas. Princípio central: **dados sensíveis nunca atravessam o cliente**.

```
┌──────────────────────────────────────────────────────────────────┐
│  Cliente (browser / mobile)                                      │
│  TODO — descrever o que o cliente faz                            │
└──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────┐
│  Servidor / Backend                                              │
│  TODO — descrever o backend                                      │
│  • Supabase (Postgres + Auth + Storage + Edge Functions)        │
└──────────────────────────────────────────────────────────────────┘
            │           │
            ▼           ▼
       Integrações  externas (TODO listar)
```

## 2. Stack por camada

| Camada | Tecnologia | Por quê |
|---|---|---|
| **Build / Dev** | TODO | TODO |
| **Linguagem** | TODO | TODO |
| **UI lib** | TODO | TODO |
| **Estilo** | Tailwind + CSS vars (tokens DS) | Tokens DS direto em CSS; sem CSS-in-JS bundle cost |
| **State server** | TODO | TODO |
| **State client** | TODO | TODO |
| **Forms** | TODO | TODO |
| **Roteamento** | TODO | TODO |
| **Backend** | Supabase (Postgres + Auth + Storage + Realtime) | Tudo-em-um pra MVP solo dev; RLS dá multi-tenancy sem escrever middleware |
| **Edge functions** | Supabase Edge Functions (Deno) | Server-only secrets, integração externa, webhook handlers |
| **Pagamentos** | Asaas (BR — PIX/Boleto/Cartão) | Compliance BR, escrow nativo via subcontas + main wallet |
| **Package manager** | TODO (npm / bun / pnpm) | TODO |

## 3. Domínios

> TODO — listar os domínios de negócio do seu projeto. Cada domínio agrupa: tabelas/entities, edge functions/endpoints, hooks frontend, componentes UI, RFs em requirements.md.

| Domínio | Responsabilidade | Surfaces principais |
|---|---|---|
| **TODO** | TODO | TODO |

## 4. Fluxo principal

> TODO — descrever o fluxo crítico do produto (ex: "buscar venue → reservar → pagar → confirmar"). Vincule cada step ao diagrama Mermaid em `diagrams/`.

## 5. Integrações externas

| Serviço | O que faz | Onde |
|---|---|---|
| **Supabase** | Postgres + Auth + Storage + Realtime + Edge Functions | Tudo o que envolve dados |
| **Asaas** | Gateway de pagamento BR (PIX/Boleto/Cartão) + escrow | Edge functions `asaas-*` |
| **TODO** | TODO | TODO |

## 6. Decisões críticas

> Decisões arquiteturais que vale registrar com **porquê**. Cada uma pode virar um ADR completo em `Docs/PRPs/_adr/` quando o impacto for grande.

| Decisão | Razão | Quando reavaliar |
|---|---|---|
| TODO | TODO | TODO |

## 7. Diagramas

Ver pasta [`diagrams/`](./diagrams/). Convenção: `<flow>.mmd` (Mermaid).

Diagramas iniciais:
- [`auth-flow.mmd`](./diagrams/auth-flow.mmd) — fluxo de autenticação genérico

> Adicione um diagrama por fluxo crítico. Cada jornada em `Docs/produto/jornadas/` referencia o diagrama correspondente.

## 8. Limitações conhecidas

> TODO — listar dívidas técnicas e gaps conhecidos. Cada item deveria ter ticket no roadmap.

- TODO

---

> Bootstrapped from arthus-harness v1.0.0 on 2026-05-09.
