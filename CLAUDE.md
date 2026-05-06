# CLAUDE.md

## Branching Workflow

- **Never implement directly on `main`.** All work must happen on a feature branch.
- **Every branch must be created from a GitHub issue.** Use `gh issue develop <issue-number> --checkout` to create and check out the branch — do not invent branch names manually (no `feat/...`, `fix/...`, etc.).
- If no issue exists for the work, create one first (`gh issue create ...`), then create the branch from it with `gh issue develop`.
- **Commit and push frequently while working on a branch.** After each logically-complete step (a passing test, a working helper, a finished refactor pass), make a focused commit and push it. Do not save up many unrelated changes for one big commit at the end.

## Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

Pre-commit auto-fixes on files you've already changed are fine; don't expand scope to fix pre-existing issues in untouched files.

The test: Every changed line should trace directly to the user's request.

## Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Design Constraints

- **Brand colors are defined in `PROJECT_CONTEXT.md`** — use them exactly. Palette: Black, White, Gold (`#F7C07D`) as primary accent, Cream (`#FEE5C5`), Sienna (`#A76941`), Rust (`#903516`), Patina (`#6A9A8B`), Deep Sea (`#4B7178`), and a gray ramp. Amber (`#FFA14F`) used sparingly.
- **White background.** No dark mode.
- **No Tailwind.** The current app uses inline styles — match the existing visual language. CSS modules or styled-components are acceptable only if introduced consistently.
- **Fonts:** `system-ui` / `-apple-system` / `sans-serif` stack. Clean and professional.
- **This is a planning tool, not a dashboard.** Edit interactions should be fast and low-friction — think Notion or Linear, not a BI tool.

## Out of Scope

- **Don't redesign the roadmap visualization.** The current layout (swim lanes, AI ribbons with waypoints, two-panel split) is intentional and has been iterated on extensively. Improve code quality, not visual design.
- **No in-app authentication.** Auth is handled at the infrastructure layer (Cloudflare Access), not in the app code.
- **Don't over-engineer the backend.** Supabase with simple tables is the right level of complexity. No GraphQL, no complex relational models, no real-time subscriptions.
- **Don't add features beyond what was asked.** Scope is intentionally constrained — surface ideas, don't ship them unprompted.
