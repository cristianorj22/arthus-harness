---
name: review-changes
description: Perform a structured code review using change detection and impact analysis from the code-review-graph MCP. Use when reviewing a PR or local diff that touches multiple files and you need to understand blast radius before judging risk.
---

# Review Changes

Perform a thorough, risk-aware code review using the knowledge graph.

## Steps

1. Run `detect_changes` to get risk-scored change analysis.
2. Run `get_affected_flows` to find impacted execution paths.
3. For each high-risk function, run `query_graph` with `pattern="tests_for"` to check test coverage.
4. Run `get_impact_radius` to understand the blast radius.
5. For any untested changes, suggest specific test cases.

## Output Format

Provide findings grouped by risk level (high/medium/low) with:

- What changed and why it matters
- Test coverage status
- Suggested improvements
- Overall merge recommendation

## Token Efficiency Rules

- ALWAYS start with `get_minimal_context(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.

## Cross-link

- Pairs with `code-reviewer` agent — reviewer reads code-level patterns; this skill provides structural impact data.
- For tiny diffs (< 5 files), prefer the `code-reviewer` agent without invoking the graph.
