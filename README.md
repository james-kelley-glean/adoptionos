# Glean Adoption OS

Glean Adoption OS is a single-file Glean artifact for AI Outcomes Managers. It turns account signals into a practical operating surface: what changed, why it matters, what to do next, and which Glean asset, agent, or skill to use.

## Recommended Workflow

1. Edit the source artifact in `src/glean_adoption_os.html`.
2. Keep operating premises in `prompts/` model-agnostic and vendor-neutral.
3. Run `npm run check`.
4. Upload or paste `dist/glean_adoption_os.html` back into Glean as the artifact-ready file.

## Commands

```bash
npm run build
npm run validate
npm run check
npm run glean:copy
npm run orchestrator:plan
npm run orchestrator:prompt -- roster-verification implementer
npm run agent:dev -- "Review the artifact and recommend the next smallest useful slice."
```

## Repo Structure

- `src/glean_adoption_os.html` - editable source artifact.
- `dist/glean_adoption_os.html` - generated Glean-ready artifact.
- `prompts/` - model-agnostic premises and prompt contracts.
- `docs/` - repo, runtime, and deployment guidance.
- `scripts/` - local build and validation checks.
- `integrations/openai-agents/` - optional OpenAI Agents SDK development workflow.

## Artifact Principles

- Keep the artifact self-contained unless live Glean data integration is explicitly added.
- Guard Glean-specific runtime APIs so the file can still run locally.
- Separate visible product copy from internal data keys.
- Treat seeded data as demo data until a live source contract exists.
- Preserve recommendation explainability: signal, rationale, next action, asset, and tool should stay inspectable.

## Optional OpenAI Agents SDK Workflow

The core repo is model-agnostic, but this repo also includes an optional OpenAI Agents SDK development assistant. See [docs/openai-agents-integration.md](docs/openai-agents-integration.md).

## Agentic Development

For agent-safe implementation flow, source-of-truth hierarchy, and CI expectations, see [docs/agentic-development.md](docs/agentic-development.md).

## V2 Skill And Data Map

For the V2 operating-system scope, skill contribution map, and software/source taxonomy, see [docs/v2-skill-value-and-software-map.md](docs/v2-skill-value-and-software-map.md).

## CI

GitHub Actions runs on all pushes and pull requests:

```bash
npm ci
npm run check
npm run check:dist
```

`check:dist` catches cases where `src/glean_adoption_os.html` changed but the generated Glean-ready artifact in `dist/` was not committed.

## Test In Glean

Run this command to build the artifact and copy a Glean Canvas-ready prompt plus the full HTML to your clipboard:

```bash
npm run glean:copy
```

Then paste into Glean Assistant and preview the interactive content in Canvas.
