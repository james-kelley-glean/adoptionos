# Model-Agnostic Premises

Use these premises when asking any model to help develop or revise the Adoption OS artifact.

## Product Premise

Glean Adoption OS is an internal artifact for AI Outcomes Managers. Its job is to turn fragmented adoption signals into clear account priorities, recommended next actions, and reusable Glean assets or tools.

## User Premise

The primary user is an AI Outcomes Manager managing multiple customer accounts. They need fast prioritization, practical next moves, and low-friction access to Glean resources, not an abstract analytics dashboard.

## Runtime Premise

The artifact is intended to reside inside Glean, but it must also run locally for development and review. Glean-specific APIs should be additive and guarded.

## Model Premise

Any capable coding or reasoning model should be able to work on this repo. Instructions should avoid provider-specific language unless the task is explicitly provider-specific.

## Provider Integration Premise

Provider-specific integrations may exist as optional accelerators. They should live under `integrations/` and must not become the source of truth for artifact behavior unless explicitly promoted by a product decision.

## Data Premise

Seeded account data is acceptable for prototype and demo use. Live data should only be introduced through an explicit source contract that defines fields, freshness, permissions, and fallback behavior.

## Recommendation Premise

Recommendations must remain explainable. The artifact should make it possible to inspect:

- Triggering signals
- Account phase
- Commercial or engagement risk
- Recommended next action
- Recommended document
- Recommended Glean tool or skill
- Suggested enablement asset

## Adoption Premise

The artifact should help drive behavior change. Prioritize workflows that make AIOMs more likely to act, follow up, communicate clearly, and reinforce adoption over time.
