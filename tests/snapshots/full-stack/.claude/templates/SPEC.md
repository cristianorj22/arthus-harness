---
# Technical specification. "How we're going to build it."
# A SPEC is mutable; an ADR is immutable. If the design changes fundamentally,
# update the spec and write a new ADR for the change.
title: <Short noun phrase, e.g. "Agent run persistence">
status: draft              # draft | review | approved | implemented | archived
owner: <handle>
rfc_link: <URL or null>    # link to PR/issue where this was discussed
---

# <Spec title>

<!-- Keep it focused on a single subsystem. Split large specs into multiple files. -->

## Problem

<2-4 sentences. What is broken or missing today? Why does it matter now?>

## Goals / Non-goals

### Goals

<!-- Concrete, testable. -->
- <Goal 1, e.g. "Persist every agent run to `agent_runs` within 100ms p95">
- <Goal 2>

### Non-goals

<!-- Explicit out-of-scope items, to prevent scope creep during review. -->
- <Non-goal 1>
- <Non-goal 2>

## Design

<!-- Describe the chosen approach. Diagrams welcome; link to assets. -->

### Overview

<Prose + optional ASCII/Mermaid diagram.>

### Data model

```ts
// TS types, SQL DDL, or JSON schema — whichever fits.
```

### Components

- **<Component 1>** — <responsibility>
- **<Component 2>** — <responsibility>

### Sequence

1. <Step>
2. <Step>
3. <Step>

## API

<!-- Only the surfaces that change or are added. -->

```ts
// Function signatures, HTTP endpoints, event shapes.
```

## Migration

<!-- How to get from today's state to the new state. -->
- <Step 1: schema change / deploy order>
- <Step 2: backfill>
- <Step 3: feature flag rollout>
- <Rollback plan: ...>

## Open questions

<!-- Things the author could not resolve. Tag each with the person who needs to answer. -->
- [ ] <Question 1> — @<handle>
- [ ] <Question 2> — @<handle>

## References

- ADR: <../adrs/...>
- Related spec: <../specs/...>
