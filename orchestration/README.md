# Agentic Orchestration

## Purpose

This folder defines how Codex should run autonomous build work for the Adoption OS artifact with sub-agents while keeping the artifact safe to place inside the Glean product.

The orchestrator does not replace engineering judgment. It creates a repeatable control layer:

1. Pick the next slice.
2. Generate a focused implementer prompt.
3. Dispatch a worker sub-agent with a clear write scope.
4. Dispatch review sub-agents for spec fit and runtime safety.
5. Run the repo validation gate.

## Hard Constraint

The final artifact must live inside the Glean product. Sub-agents must preserve the single-file Glean artifact output at `dist/glean_adoption_os.html` and must not introduce browser storage, network calls, iframes, external scripts, or external CSS imports.

## Commands

```bash
npm run orchestrator:plan
npm run orchestrator:validate
npm run orchestrator:prompt -- roster-verification implementer
npm run orchestrator:prompt -- roster-verification spec-reviewer
npm run orchestrator:prompt -- roster-verification runtime-reviewer
```

## Controller Rules

- The main Codex agent is the controller and integrator.
- Use one worker sub-agent per slice.
- Tell every worker they are not alone in the codebase and must not revert edits made by others.
- Keep write scopes disjoint when running workers in parallel.
- After a worker returns, run the relevant review prompt with a separate reviewer sub-agent.
- Run `npm run check` before calling a slice complete.

## Slice Order

1. `roster-verification`
2. `aggregation-status`
3. `strategic-action-module`
4. `adoption-os-phase-backbone`
5. `resource-launcher`
6. `prism-capture-loop`
7. `glean-runtime-readiness`
8. `in-glean-smoke-test`

## Completion Gate

A slice is not complete until:

- Its acceptance criteria pass.
- `npm run check` passes.
- The controller has inspected the diff.
- Any Glean runtime risk has been resolved or explicitly documented.
