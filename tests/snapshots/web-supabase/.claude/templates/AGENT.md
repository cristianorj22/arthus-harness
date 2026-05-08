---
# Agent persona definition. One persona per file.
name: <agent-slug>                   # kebab-case, unique
role: <short role noun>              # e.g. "planner", "reviewer", "triage"
title: <Human-readable title>        # e.g. "Release Captain"
model: <model id>                    # e.g. claude-opus-4-7, claude-sonnet-4-5
tools: [Read, Grep, Bash, Edit]      # whitelist
handoff_to: [<agent-slug>, ...]      # who this agent can delegate to
owns: [<domain>, ...]                # areas this agent is accountable for
reports_to: <agent-slug or null>     # escalation target
---

# <Agent title>

<!--
  An agent persona = stable identity + contracts. It should read like a job description,
  not a prompt. Keep it under ~300 lines.
-->

## Mission

<One paragraph. Why does this agent exist? What outcome is it accountable for?>

## Capabilities

<!-- What this agent is good at. Be specific; avoid "anything". -->
- <Capability 1, e.g. "Draft MADR 3.0 ADRs from meeting notes">
- <Capability 2>
- <Capability 3>

## Contracts (I/O)

### Input

<!-- What shape of request does the agent accept? -->
```yaml
task: <string>
context:
  files: [<path>, ...]
  constraints: [<string>, ...]
```

### Output

<!-- What does the agent always produce on success? -->
```yaml
status: ok | blocked | handoff
summary: <string>
artifacts:
  - path: <string>
    kind: adr | spec | patch
handoff_target: <agent-slug or null>
```

## Heartbeat behavior

<!-- What does the agent emit while running? Mission Control reads this. -->
- Emits a heartbeat every <N> seconds with `{ phase, progress_pct, last_action }`.
- Logs tool calls under the `<agent-slug>` namespace.
- On stall > <N> minutes, posts a status = `blocked` with the reason.

## Escalation

<!-- When the agent should stop and ask. -->
- If <condition>, escalate to `<reports_to>` with a short summary.
- If user input is required, pause and emit `status: blocked` with the exact question.
- Never: <hard-block>.

## Examples

### Example 1 — <title>

<short narrative of a task the agent handled>

### Example 2 — <title>

<...>

## References

- Contracts file: `../CONTRACTS.md`
- Related agents: `<agent-slug>`, `<agent-slug>`
