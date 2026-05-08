---
# Claude Code Skill — copy and fill.
# The `description` is the trigger phrase the model reads to decide whether to invoke
# the skill. Keep it one sentence, start with "Use this skill when...".
name: <skill-slug>                            # kebab-case, unique per repo
description: Use this skill when <explicit trigger: user intent, file pattern, or command>.
context: fork                                 # fork | main   (fork = isolated subagent)
allowed-tools: [Read, Grep, Glob, Bash, Edit] # whitelist; omit tools you don't need
memory: project                               # project | user | local
disable-model-invocation: false               # true = invokable only via Skill tool
---

# <Skill display name>

<!--
  The body below is loaded into context when the skill fires.
  Keep it under ~400 lines. Pull long reference material into linked files.
-->

## Purpose

<One paragraph. What problem does this skill solve for the user? What is the outcome?>

## When to use

<!-- Explicit triggers so the model (and humans reading this) agree on scope. -->
- <Trigger 1: e.g. "User asks to migrate a MADR 2.x ADR to 3.0">
- <Trigger 2>
- <Trigger 3>

## When NOT to use

<!-- The inverse is often more useful than the positive list. -->
- <Anti-trigger 1: e.g. "The task is refactoring, not documentation">

## Steps

<!-- Numbered, verifiable. Each step should have a check the model can run. -->
1. <Action> — verify: <check>
2. <Action> — verify: <check>
3. <Action> — verify: <check>

## Examples

### Example 1 — <short title>

**Input:** <user message or file>
**Output:** <what the skill produces>

### Example 2 — <short title>

**Input:** <...>
**Output:** <...>

## Escalation

<!-- What should the skill do when it hits a boundary? -->
- If <condition>, stop and ask the user: "<exact question>".
- If <condition>, hand off to skill `<other-skill>`.
- Never: <hard-block: e.g. "rewrite ADRs with status = accepted">.

## References

- <Related docs or ADRs>
