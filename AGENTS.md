# Agent Instructions

## Goal

Develop a Glean-hosted Adoption OS artifact that can be placed back inside Glean. The artifact should help AI Outcomes Managers convert account signals into adoption actions, reusable assets, and measurable next steps.

## Working Directory

Use `/Users/jameskelley/Documents/Adoption OS`.

## Operating Premises

- Be model-agnostic. Do not assume a specific provider, model family, tool runtime, or prompt syntax unless a task explicitly requires it.
- OpenAI Agents SDK is available as an optional development integration under `integrations/openai-agents/`; it is not the source of truth for artifact behavior.
- Keep source-of-truth instructions in `prompts/` and implementation guidance in `docs/`.
- Prefer explicit contracts over model-specific tricks.
- Keep the artifact runnable locally and inside Glean.
- Keep `window.GleanBridge` and any future Glean runtime APIs guarded.
- Respect Canvas sandbox constraints: no nested iframes, browser storage, outbound network calls, external font imports, or external script tags in the Glean-ready artifact.
- Treat the seeded account data as demo data unless live-source integration is explicitly in scope.
- Optimize for AIOM adoption workflow: signal, prioritization, next best action, recommended Glean asset/tool, and capture.

## Development Rules

- Edit `src/glean_adoption_os.html`; build to `dist/glean_adoption_os.html`.
- Run `npm run check` before calling work complete.
- Use `npm run agent:dev -- "<task>"` for optional OpenAI Agents SDK-assisted review or planning.
- Do not put generated artifact wrapper text, CDATA wrappers, or tool-call residue into source or dist files.
- Keep visible copy practical and Glean-native. Avoid over-clinical language.
- Preserve a clear path to live Glean integration, but do not invent backend dependencies without a source contract.

## Current Product Shape

The artifact includes:

- Account selector
- Overview dashboard
- Attention queue
- Next-best-action recommendation
- Templates library
- Tool/agent launcher library
- Signal timeline
- Portfolio ranking
- Prism capture workspace
- Secondary data model and widget audit

## Definition of Done

- The artifact builds into `dist/`.
- Validation passes.
- The Glean-ready file remains single-file HTML.
- Runtime-specific APIs are guarded.
- The user can tell what changed and how to place the artifact back inside Glean.
