# OpenAI Agents SDK Integration

This folder is an optional provider-specific layer for developing the Glean Adoption OS artifact. The core artifact remains model-agnostic; this integration gives James a practical OpenAI Agents SDK workflow for repo work.

## What It Adds

- A development orchestrator agent for Adoption OS work.
- An optional slice runner that reads `orchestration/slices.json`.
- Specialist agents exposed as tools:
  - Product strategist
  - Implementation reviewer
  - Glean runtime reviewer
- Repo tools for reading files, listing files, and running `npm run check`.

## Install

Dependencies are installed at the repo root:

```bash
npm install
```

Set your API key:

```bash
export OPENAI_API_KEY="sk-..."
```

Optional model override:

```bash
export OPENAI_AGENT_MODEL="gpt-5.4"
```

## Run

```bash
npm run agent:dev -- "Review the artifact and recommend the next smallest useful slice."
```

To plan or review one execution slice from the shared orchestration config:

```bash
npm run agent:slice -- roster-verification plan
npm run agent:slice -- strategic-action-module review
npm run agent:slice -- glean-runtime-readiness runtime-review
```

## Boundary

Use this layer for development assistance. Do not make the Glean artifact depend on OpenAI SDK runtime code unless that becomes an explicit product requirement.

## Current SDK Pattern

The JavaScript Agents SDK uses:

- `Agent` to define agents with instructions, tools, handoffs, and model settings.
- `run` to execute an agent.
- `tool` plus `zod` to define typed function tools.
- Agent-as-tool or handoffs for multi-agent workflows.
