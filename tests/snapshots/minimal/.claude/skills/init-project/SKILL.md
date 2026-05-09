---
name: init-project
description: Use this skill when the user says "init this project", "bootstrap with arthus-harness", "set up arthus-harness here", or otherwise asks to initialize a fresh project with the arthus-harness baseline. Runs `npx create-arthus-harness` after a short interview.
context: main
allowed-tools: [Read, Glob, Bash]
memory: project
disable-model-invocation: false
---

# Init Project

## Purpose

Bootstrap a new project with the arthus-harness baseline (3 protection layers: process / technical / emotional). Runs the generator (`npx create-arthus-harness`) after a brief interview captures the inputs the generator needs.

This is the **on-ramp** skill — invoked once per project, then never again. After this runs, the harness is installed and the user's normal Claude Code workflow takes over.

## When to use

- User says "init this project", "bootstrap with arthus-harness", or "set up the harness here".
- User opens a fresh repo (or a soon-to-be-fresh one) and wants protection layers in place before writing code.
- User is starting a new client project / MVP / side project and wants the same disciplined Claude Code setup.

## When NOT to use

- The repo already has `.claude/` and `.arthus-harness.json` — that means the harness is installed; the user wants `harness-doctor` (drift check) or `arthus-harness sync` (update) instead.
- The user wants to **author** a new harness skill / agent / hook — that's regular editing, not bootstrap.
- The user is asking how arthus-harness works conceptually — answer the question, don't run the generator.

## Guard — refuse if project already initialized

Before doing anything else, check:

1. Does `package.json` exist in the cwd?
2. Does `.claude/settings.json` exist in the cwd?
3. Does `.arthus-harness.json` exist in the cwd?

If **any** of those exist, STOP. Tell the user:

> This directory already has a project. Running `init-project` would overwrite or conflict. If you want to:
> - Check drift vs current harness version → use `harness-doctor` skill.
> - Update to a newer harness version → run `npx arthus-harness sync` from this directory.
> - Start fresh anyway → cd to an empty parent directory and re-invoke me.

Do NOT proceed past the guard without explicit "yes, overwrite, I know what I'm doing" from the user.

## Steps

1. **Run the guard** (above) — verify: cwd is empty enough to scaffold safely. Exit with the message above if not.

2. **Interview the user** — ask only the minimum, in order. Wait for each answer before continuing:

   a. **Project name** — kebab-case slug. Example: `my-saas`, `client-mvp`. Verify: matches `^[a-z][a-z0-9-]*$`.

   b. **One-line description** — what the project does. Verify: <= 120 chars.

   c. **Stack plugins** — list available plugins (the generator prints them with `--list-plugins`). Ask which apply. Common: `supabase`, `design-system`, `e2e-playwright`, `i18n-pt-br`, `payment-asaas`. Verify: array of valid plugin names.

   d. **Experience principles strategy** — three options:
      - `A` (literal) — copy the pre-filled 4 sensations as-is, user adapts later.
      - `C` (framework) — empty template, user defines their own.
      - `both` — both, user picks per-doc.

      Verify: one of `A` / `C` / `both`.

3. **Confirm with the user** — print the chosen inputs back. Wait for "yes" / "go ahead" / "do it". Do NOT proceed without confirmation.

4. **Run the generator** — invoke:

   ```bash
   npx create-arthus-harness@latest <projectName> \
     --description "<description>" \
     --plugins <comma-separated> \
     --principles <A|C|both> \
     --in-place \
     --no-prompt
   ```

   `--in-place` tells the generator to scaffold INTO the current cwd (not create a subdirectory). `--no-prompt` skips the generator's own interactive prompts since we already gathered inputs.

   Verify: command exits 0; `.claude/`, `Docs/`, `MISSION.md`, `CLAUDE.md`, `.arthus-harness.json` exist after.

5. **Print the next steps** — show the user:

   ```
   Harness installed. Three things to do now:
     1. Read MISSION.md and adapt it to this project's invariants (~15 min).
     2. Read Docs/produto/principios-de-experiencia.md and define your sensations.
     3. Make your first commit — pre-commit hooks should fire.

   Then run your first feature task. Don't keep tuning the harness.
   ```

## Examples

### Example 1 — fresh client project

**Input:** "init this project"

**Output:**
- Skill asks 4 questions, confirms answers, runs `npx create-arthus-harness client-saas --description "B2B SaaS for X" --plugins supabase,design-system --principles A --in-place --no-prompt`.
- Reports installed files; prints next-steps message.

### Example 2 — already initialized

**Input:** "init this project" (in a dir that already has `.arthus-harness.json`)

**Output:** Refuses with the guard message; suggests `harness-doctor` instead.

## Escalation

- If `npx create-arthus-harness` is not found / fails → tell the user the package may not be published yet; they can `git clone` arthus-harness and run the generator from a local checkout.
- If the user wants flags not exposed by `--no-prompt` → drop the flag and let them go through the generator's own interactive prompts.
- Never: run the generator without confirmation; never overwrite an existing `.claude/`.

## References

- Generator source: `arthus-harness/src/`
- Architecture: `arthus-harness/PLAN.md`
- Sister skill (post-install): `harness-doctor`
