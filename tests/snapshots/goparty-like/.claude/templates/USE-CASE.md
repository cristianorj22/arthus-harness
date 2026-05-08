---
# One concrete user scenario. Not a feature list.
id: <NNN-slug>                    # e.g. 004-spin-up-content-team
persona: <persona slug>           # e.g. indie-founder, platform-engineer
complexity: medium                # low | medium | high
status: draft                     # draft | validated | deprecated
---

# <Use case title — active voice, user-oriented>

<!--
  A use case narrates one specific user journey end-to-end.
  It is NOT a spec (how) and NOT a feature list (what we build).
  It is the "story we want to be true".
-->

## Scenario

<One paragraph telling the story. "A founder wants to ..." Specific names, tools, outputs.>

## Actors

<!-- Human + agent participants. -->
- **<Human actor>** — <their goal>
- **<Agent actor>** — <their role>
- **<System actor>** — <e.g. GitHub, Slack>

## Preconditions

<!-- What must be true before the scenario starts. -->
- <Precondition 1, e.g. "User has a Coda workspace provisioned">
- <Precondition 2>

## Flow

<!-- Numbered, literal. A developer should be able to reproduce it step by step. -->
1. <Step 1: user/agent action + system response>
2. <Step 2>
3. <Step 3>
4. <Step 4>
5. <Step 5>

## Expected outcome

<!-- Observable signals. Not vibes. -->
- <Outcome 1, e.g. "An ADR file exists at docs/adrs/0004-...">
- <Outcome 2>

## Variations

<!-- Interesting branches that share the same trunk. -->
- **<Variation A>**: <what changes>
- **<Variation B>**: <what changes>

## Failure modes

<!-- What can go wrong, and how the system should respond. -->
- <Failure 1> -> <expected recovery>
- <Failure 2> -> <expected recovery>

## Related

- Spec: <../specs/...>
- ADR: <../adrs/...>
- Runbook: <../runbooks/...>
