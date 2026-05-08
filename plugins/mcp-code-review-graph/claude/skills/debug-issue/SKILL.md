---
name: debug-issue-graph
description: Systematically debug issues using graph-powered code navigation (code-review-graph MCP). Companion to the `debugger` agent — graph navigation gives breadth, agent gives depth.
---

# Debug Issue (graph-powered)

Use the knowledge graph to systematically trace and debug issues.

## Steps

1. Use `semantic_search_nodes` to find code related to the issue.
2. Use `query_graph` with `callers_of` and `callees_of` to trace call chains.
3. Use `get_flow` to see full execution paths through suspected areas.
4. Run `detect_changes` to check if recent changes caused the issue.
5. Use `get_impact_radius` on suspected files to see what else is affected.

## Tips

- Check both callers and callees to understand the full context.
- Look at affected flows to find the entry point that triggers the bug.
- Recent changes are the most common source of new issues.

## Token Efficiency Rules

- ALWAYS start with `get_minimal_context(task="<your task>")` before any other graph tool.
- Use `detail_level="minimal"` on all calls. Only escalate to "standard" when minimal is insufficient.
- Target: complete any review/debug/refactor task in ≤5 tool calls and ≤800 total output tokens.

## Cross-link

- Pairs with the `debugger` agent (4-phase systematic debugging). Agent does the *thinking* (5 Whys, root cause); this skill does the *navigation* (callers, flows, impact).
