# Agentic Development Guide

## Purpose

This repo is designed so coding agents can make bounded changes without breaking the Glean-ready artifact. The artifact must remain a single-file HTML output that can be placed back inside the Glean product.

## Source Of Truth

1. `AGENTS.md` - startup instructions and repo-level guardrails.
2. `prompts/premises.md` - durable product premises.
3. `docs/v1-data-layer.md` - data contract and source taxonomy.
4. `orchestration/slices.json` - build slices, write scopes, requirements, and acceptance criteria.
5. `docs/glean-artifact-runtime.md` - Glean runtime and smoke-test requirements.

## Required Agent Workflow

1. Pick a slice from `orchestration/slices.json`.
2. Generate the worker prompt:

```bash
npm run orchestrator:prompt -- <slice-id> implementer
```

3. Keep edits inside the declared `writeScope`.
4. Run the full validation gate:

```bash
npm run check
```

5. Review the generated artifact in `dist/glean_adoption_os.html`.
6. Confirm generated output is committed when source changes affect the artifact:

```bash
npm run check:dist
```

## Guardrails For Agents

- Edit `src/glean_adoption_os.html`, not `dist/glean_adoption_os.html` directly.
- Preserve `dist/glean_adoption_os.html` as generated output.
- Do not introduce browser storage APIs, outbound network calls, nested iframes, external scripts, or external CSS imports.
- Keep `window.GleanBridge` method-guarded.
- Treat seeded data as seeded data; do not imply live connector truth without a source contract.
- Keep OpenAI Agents SDK code inside `integrations/openai-agents/`; it is a development accelerator, not artifact runtime.
- Do not commit secrets. `.env.example` may contain empty placeholders only.

## CI Gate

GitHub Actions runs on pushes and pull requests to `main`:

- `npm ci`
- `npm run check`
- `npm run check:dist`

This means a commit should fail CI if:

- The artifact does not build.
- Runtime validation fails.
- agent integration files have syntax errors.
- orchestration config is invalid.
- `dist/glean_adoption_os.html` is stale after building.

## Optional OpenAI Agent Workflow

Use the OpenAI Agents SDK only when helpful for planning or review:

```bash
npm run agent:dev -- "Review the repo and recommend the next smallest useful slice."
npm run agent:slice -- roster-verification plan
```

These commands require `OPENAI_API_KEY` locally and are not part of CI.
