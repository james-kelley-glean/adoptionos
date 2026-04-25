# Task Brief Template

Use this with any model when requesting work on the Adoption OS artifact.

## Objective

Improve the Glean Adoption OS artifact so it better supports AIOM account prioritization and adoption execution inside Glean.

## Scope

In scope:

- Source artifact: `src/glean_adoption_os.html`
- Supporting docs: `docs/`
- Model-agnostic prompts: `prompts/`
- Build and validation scripts: `scripts/`

Out of scope unless explicitly requested:

- Backend services
- Live data connectors
- Provider-specific prompt features
- Full route/API rewrites

## Requirements

- Preserve single-file artifact output in `dist/glean_adoption_os.html`.
- Keep Glean runtime APIs guarded.
- Run `npm run check`.
- Keep recommendations explainable and action-oriented.
- Do not introduce generated wrapper residue.

## Output Expected

- Brief summary of changes
- Validation run and result
- Any assumptions or risks
- Recommended next step
