---
# Architecture Decision Record — MADR 3.0
# Fill every field. Delete this comment block when done.
title: <Short imperative decision, e.g. "Adopt pnpm workspaces">
status: proposed        # proposed | accepted | deprecated | superseded
date: <YYYY-MM-DD>
deciders: [<owner handles>]        # who made the call
consulted: [<handles>]              # who gave input (optional)
informed: [<handles>]               # who was told after (optional)
supersedes: <ADR id or null>        # e.g. 0007-old-decision
superseded_by: <ADR id or null>
---

# <ADR title — same as frontmatter, without a trailing period>

<!--
  Style guide:
  - Keep the body between 200 and 400 words.
  - Write in past tense once status = accepted; present tense while proposed.
  - Link to specs, PRs, issues, and other ADRs with relative links.
  - Once accepted, the ADR is immutable. New insights -> new ADR that supersedes this one.
-->

## Context and Problem Statement

<!-- What situation prompted this decision? What constraints or pain points existed? -->
<Describe the forces at play in 2-4 sentences. Finish with a crisp question: "How should we X?">

## Decision Drivers

<!-- Ranked list of what matters. Use concrete constraints, not vague goals. -->
- <Driver 1, e.g. "Must not break existing adapter API">
- <Driver 2, e.g. "CI time budget < 6 min">
- <Driver 3>

## Considered Options

<!-- At least 2 options. Name them with short nouns, not full sentences. -->
1. <Option A>
2. <Option B>
3. <Option C>

## Decision Outcome

<!-- State the chosen option and the *why* in one paragraph. -->
Chosen option: **<Option X>**, because <one-sentence justification tied to the top driver>.

### Consequences

<!-- Be honest about the trade-offs you're accepting. -->
- Good: <expected benefit 1>
- Good: <expected benefit 2>
- Bad: <accepted cost or new risk 1>
- Bad: <accepted cost or new risk 2>

## Pros and Cons of the Options

### <Option A>

- Good: <...>
- Neutral: <...>
- Bad: <...>

### <Option B>

- Good: <...>
- Neutral: <...>
- Bad: <...>

### <Option C>

- Good: <...>
- Neutral: <...>
- Bad: <...>

## Links

<!-- Supersedes / superseded-by / related specs, PRs, issues. -->
- Related spec: <path or URL>
- Related ADR: <../adrs/NNNN-slug.md>
- Related PR: <#123>
