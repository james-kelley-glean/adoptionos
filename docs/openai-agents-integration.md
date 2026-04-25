# OpenAI Agents SDK Integration

## Recommendation

Use OpenAI Agents SDK as an optional development accelerator, not as the core artifact runtime. The Glean Adoption OS artifact should remain portable and model-agnostic unless a future product decision explicitly requires an OpenAI-backed runtime.

## Why This Fits

The SDK is useful for:

- Coordinating repo development tasks.
- Running specialist review perspectives.
- Adding typed tools for reading repo context and running validation.
- Preserving traces for complex development workflows.

The SDK should not be required for:

- Opening the artifact locally.
- Building `dist/glean_adoption_os.html`.
- Placing the artifact back inside Glean.

## Current Setup

- SDK package: `@openai/agents`
- Schema package: `zod`
- Agent entrypoint: `integrations/openai-agents/run-dev-agent.mjs`
- Slice entrypoint: `integrations/openai-agents/run-slice-orchestrator.mjs`
- Agent definitions: `integrations/openai-agents/adoption-os-dev-agent.mjs`
- Validation: `npm run validate:agents`

## Usage

```bash
export OPENAI_API_KEY="sk-..."
npm run agent:dev -- "Review the repo and recommend the next smallest useful slice."
```

For the agentic build plan:

```bash
npm run orchestrator:plan
npm run orchestrator:prompt -- roster-verification implementer
npm run agent:slice -- roster-verification plan
```

Use `orchestrator:prompt` when Codex is dispatching local sub-agents. Use `agent:slice` when you want the optional OpenAI development orchestrator to plan or review a slice from the same source of truth.

Optional:

```bash
export OPENAI_AGENT_MODEL="gpt-5.4"
```

## Design Boundary

Keep provider-specific code under `integrations/openai-agents/`. If another provider or local model workflow is added later, it should live beside this integration rather than replacing repo-level premises.

## What To Validate First

- Does the agent actually improve development speed?
- Are specialist perspectives useful or too heavy?
- Should the agent be allowed to edit files later, or remain review/advisory first?
