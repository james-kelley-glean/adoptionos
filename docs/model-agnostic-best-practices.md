# Model-Agnostic Repo Best Practices

## Recommendation

Use stable product premises, explicit contracts, and validation scripts instead of model-specific prompting patterns. This makes the repo portable across Codex, Claude, Gemini, local models, or future Glean-native agent runtimes.

## Best Practices

- Keep durable premises in `prompts/premises.md`.
- Use `prompts/task-brief-template.md` for repeatable task handoffs.
- Keep implementation rules in `AGENTS.md`.
- Keep artifact runtime notes in `docs/glean-artifact-runtime.md`.
- Validate the generated artifact with scripts instead of trusting model claims.
- Keep source and deployable output separate: `src/` for editing, `dist/` for Glean.
- Prefer plain HTML/CSS/JS until live data or component reuse justifies a framework.
- Use guarded runtime APIs so local and Glean-hosted execution both work.
- Avoid provider-specific prompt instructions like hidden chain-of-thought, model-only XML conventions, or tool names in core product docs.
- Keep provider-specific development helpers in `integrations/`, with OpenAI Agents SDK isolated under `integrations/openai-agents/`.

## Tradeoffs

| Choice | Benefit | Tradeoff |
|---|---|---|
| Single-file artifact | Easy to paste/upload into Glean | Less modular than a full app |
| Plain HTML/CSS/JS | Portable and low-dependency | Manual structure can get large |
| Seeded demo data | Fast review loop | Must not be mistaken for live intelligence |
| Guarded Glean APIs | Works locally and in Glean | Runtime-specific behavior needs separate testing |
| Model-agnostic prompts | Easy to switch models | Less optimized for any one provider |
| Optional OpenAI Agents SDK layer | Strong agent workflow for development | Adds provider-specific dependency outside the core artifact |

## Biggest Risk

The artifact can look operational before the underlying data is operational. Keep demo data, live data, and recommendation confidence clearly separated.
