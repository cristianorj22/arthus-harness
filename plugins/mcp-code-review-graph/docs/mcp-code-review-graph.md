---
last-update: 2026-05-08
status: ativo
---

# MCP — code-review-graph

> Persistent incremental knowledge graph for token-efficient, context-aware code review. Parses your codebase with Tree-sitter, builds a structural graph, and exposes MCP tools for navigation/review/debug/refactor.

## What you get

- **4 skills** (auto-fire when relevant): `explore-codebase`, `review-changes`, `debug-issue-graph`, `refactor-safely`.
- **2 hooks**: Stop hook updates the graph incrementally (~1-2s for git diff); SessionStart hook reports graph state.
- **`.mcp.json` server**: project-local registration of the `code-review-graph` MCP server.

## Pre-requisites

You need **`uv`** (Python tool installer) on your PATH.

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or via Homebrew / pipx — see https://docs.astral.sh/uv/getting-started/installation/
```

Then install `code-review-graph` once globally:

```bash
uv tool install code-review-graph
```

Verify:

```bash
code-review-graph --version    # should print a version string
code-review-graph status       # in this project, should print graph stats (or "no graph yet")
```

## First-time setup in your project

After `npx create-arthus-harness <name>` includes this plugin, run:

```bash
code-review-graph build         # initial full graph build (one-shot, ~10-60s depending on size)
```

Subsequent updates happen automatically via the **Stop hook** (`code-review-graph update --skip-flows`, ~1-2s for git diff).

The graph DB is stored at `.code-review-graph/graph.db` (gitignored — it's a build artifact, not source).

## Verifying the MCP server is connected

In Claude Code:

1. The `harness-doctor` skill will list `code-review-graph` MCP tools as available if the server is reachable.
2. You can also manually check `.mcp.json` is at project root and `code-review-graph status` runs without errors.

## Troubleshooting

### "Command not found: uvx"

`uv` is not on PATH. Re-install per Pre-requisites above. Restart Claude Code after installing.

### "code-review-graph: command not found"

`uv tool install code-review-graph` was not run. Run it once.

### Graph won't update / hooks fail silently

Check the Stop hook isn't being skipped. Verify `.claude/settings.json` has the Stop hook entry pointing at `code-review-graph update --skip-flows`. The hook has 30s timeout.

### MCP server doesn't show in Claude Code

Check `.mcp.json` is at project root (not under `.claude/`). Restart Claude Code session.

## When to use the 4 skills vs alternatives

| Goal | Use this plugin's skill | Use core agent instead |
|---|---|---|
| Understand a 200kLOC codebase you've never seen | `explore-codebase` | — |
| Review a PR with 50 files changed | `review-changes` | (also pair with `code-reviewer` agent) |
| Debug a complex multi-component bug | `debug-issue-graph` | (pair with `debugger` agent) |
| Rename `userId` → `accountId` in 80 files | `refactor-safely` | — |
| Review a 3-file PR | — | `code-reviewer` agent (graph overhead not worth it) |
| Find dead exports | — | `refactor-cleaner` agent (knip/depcheck) |

The graph adds **~100-300 tokens per query** but saves you from reading dozens of files. Worth it for breadth tasks; overkill for surgical ones.

## Source

- Repo: https://github.com/upstash/code-review-graph (replace with actual repo if upstream moves)
- MCP spec: https://modelcontextprotocol.io
