---
# Handoff contract between two agents (or agent <-> system).
# One file per producer/consumer pair. Version contracts; don't silently break them.
producer: <agent-slug>
consumer: <agent-slug>
version: 1.0.0             # semver; bump major on breaking changes
---

# <Producer> -> <Consumer>

<!--
  A contract is the *agreed shape* of data passed between two agents.
  Invariants listed here must hold for every handoff. If one breaks,
  the consumer should reject the handoff, not silently adapt.
-->

## Input schema

<!-- What the producer sends. Use a schema the tooling can validate. -->
```yaml
# or JSON Schema / Zod / TS type
task_id: string            # uuid v4
context:
  summary: string          # <= 500 chars
  files_touched: string[]  # repo-relative paths
  decisions: string[]      # each item links to an ADR id
ready_for: string          # must match consumer's accepted phases
```

## Output schema

<!-- What the consumer returns when it finishes. -->
```yaml
status: ok | rejected | partial
artifacts:
  - path: string
    kind: string           # adr | spec | patch | report
summary: string
next_handoff: <agent-slug or null>
```

## Errors

<!-- Explicit error codes the consumer may return. -->
| Code | Meaning | Producer action |
|---|---|---|
| `E_SCHEMA_MISMATCH` | Input did not match schema | Fix producer, retry |
| `E_MISSING_CONTEXT` | Required context field empty | Gather context, retry |
| `E_OUT_OF_SCOPE` | Task not in consumer's domain | Re-route handoff |

## Invariants

<!-- What must always be true. Violating one = bug, not a user error. -->
- <Invariant 1, e.g. "Every `decisions[]` entry resolves to an existing ADR file.">
- <Invariant 2>
- <Invariant 3>

## Examples

### Valid handoff

```yaml
task_id: 3f6c...
context:
  summary: "Document the adapter protocol as ADR 0001."
  files_touched: [coda/docs/adrs/0001-adapter-protocol.md]
  decisions: []
ready_for: review
```

### Rejected handoff

```yaml
status: rejected
summary: "Missing `decisions[]` — ADR draft references an undocumented policy."
```

## Change log

<!-- Bumps require a note. Breaking change = major bump + migration note. -->
- **1.0.0** — <YYYY-MM-DD> — Initial contract.
