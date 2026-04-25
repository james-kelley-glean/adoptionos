# Adoption OS V1 Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Glean-ready V1 Adoption OS Intelligence artifact today that lets an AIOM verify their client roster, inspect phase-led account intelligence, choose the best next strategic action, launch the right Glean resource, and capture the outcome back into the Prism loop.

**Architecture:** Keep the artifact as a single-file Glean-safe HTML output generated from `src/glean_adoption_os.html`. Use `orchestration/slices.json` as the autonomous slice source of truth, keep all live-source assumptions explicit, and preserve seeded data until Glean-native data contracts exist. The build should prioritize a complete in-product operating experience over backend integrations.

**Tech Stack:** Single-file HTML/CSS/JavaScript artifact, Node.js build/validation scripts, optional OpenAI Agents SDK development runner, Glean Artifact runtime constraints.

---

## File Map

- `src/glean_adoption_os.html`: Primary product surface and seeded data model.
- `dist/glean_adoption_os.html`: Generated Glean-ready artifact; never edit directly.
- `docs/v1-data-layer.md`: Data model, source taxonomy, and V1 boundary.
- `orchestration/slices.json`: Autonomous build slice definitions and acceptance criteria.
- `scripts/orchestrate-slices.js`: CLI that prints plans and sub-agent prompts from `slices.json`.
- `scripts/validate-artifact.js`: Runtime, product, and data-model validation gate.
- `docs/glean-artifact-runtime.md`: Glean placement and smoke-test checklist.
- `README.md`: Operator-facing repo workflow.

---

## Today Build Sequence

### Task 1: Roster Verification

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/v1-data-layer.md`
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`

- [ ] **Step 1: Generate the implementer prompt**

Run:

```bash
npm run orchestrator:prompt -- roster-verification implementer
```

Expected: Prompt includes `select all`, individual selection, missing-client add, verified roster state, and `npm run check`.

- [ ] **Step 2: Add validation checks before implementation**

Add checks in `scripts/validate-artifact.js` for these strings:

```js
['roster verification UI exists', html.includes('Verify client roster')],
['verified roster state exists', html.includes('verifiedClientIds')],
['missing client add path exists', html.includes('addMissingClient')],
['portfolio respects verified roster', html.includes('getVerifiedAccounts')]
```

Run:

```bash
npm run validate
```

Expected: FAIL until the UI/state exists.

- [ ] **Step 3: Implement roster verification**

In `src/glean_adoption_os.html`, add seeded roster data with:

```js
const aiomRoster = {
  suggestedSource: 'Salesforce + AIOM Staffing Sheet seeded snapshot',
  verifiedClientIds: ['amplify'],
  suggestedClients: [
    { id: 'amplify', name: 'Amplify', confidence: 'High', sources: ['Salesforce', 'AIOM Staffing Sheet'] }
  ],
  missingClientRequests: []
};
```

Add UI that supports:

- Select all suggested clients.
- Deselect individual clients.
- Add missing client by name.
- Confirm roster.
- Show aggregation status for manually added clients.

- [ ] **Step 4: Gate portfolio display from verified roster**

Create a helper in the artifact script:

```js
function getVerifiedAccounts() {
  const verified = new Set(appState.roster.verifiedClientIds);
  return accounts.filter(account => verified.has(account.id));
}
```

Use `getVerifiedAccounts()` for portfolio cards/table rendering.

- [ ] **Step 5: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

### Task 2: Aggregation Status Layer

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/v1-data-layer.md`
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`

- [ ] **Step 1: Generate the implementer prompt**

Run:

```bash
npm run orchestrator:prompt -- aggregation-status implementer
```

Expected: Prompt includes Salesforce, Staffing Sheet, Rocketlane, Sigma, Slack, Gong/meetings, Drive/Docs, Prism, confidence reason, and missing sources.

- [ ] **Step 2: Add validation checks**

Add checks for:

```js
['source coverage UI exists', html.includes('Source coverage')],
['source coverage status model exists', html.includes('sourceCoverageStatus')],
['missing source state exists', html.includes('missingSources')],
['confidence reason rendered', html.includes('confidenceReason')]
```

- [ ] **Step 3: Add source coverage model**

Each account should include:

```js
sourceCoverageStatus: {
  salesforce: 'available',
  staffingSheet: 'available',
  rocketlane: 'seeded',
  sigma: 'seeded',
  slack: 'missing',
  meetings: 'seeded',
  drive: 'available',
  prism: 'seeded'
},
missingSources: ['Slack external channel'],
confidenceReason: 'Recommendation is high-confidence because phase, hours, milestone, and prior account context agree.'
```

- [ ] **Step 4: Render coverage**

Show available, seeded, and missing sources near each recommendation so an AIOM can tell whether the recommendation is supported or provisional.

- [ ] **Step 5: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

### Task 3: Adoption OS Phase Backbone

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/v1-data-layer.md`
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`

- [ ] **Step 1: Generate the implementer prompt**

Run:

```bash
npm run orchestrator:prompt -- adoption-os-phase-backbone implementer
```

Expected: Prompt frames weekly priority as a summary layer and Adoption OS phase as the operating model.

- [ ] **Step 2: Add validation checks**

Add checks for:

```js
['Adoption OS phase backbone visible', html.includes('Adoption OS phase')],
['phase objective visible', html.includes('phaseObjective')],
['open phase activities visible', html.includes('openAdoptionActivities')],
['phase assets visible', html.includes('phaseAssets')]
```

- [ ] **Step 3: Make phase the primary account lens**

For each account, render:

- Current phase.
- Phase objective.
- Current milestone.
- Open activities.
- Overdue activities.
- Phase-relevant assets.
- Function-level phase variation when available.

- [ ] **Step 4: Represent function variation**

Add or preserve a structure like:

```js
functionPhaseStatus: [
  { functionName: 'Sales', phase: 'Activate', nextActivity: 'Manager workflow enablement' },
  { functionName: 'Customer Success', phase: 'Embed', nextActivity: 'Use-case review and workflow reinforcement' }
]
```

- [ ] **Step 5: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

### Task 4: Strategic Action Module

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`

- [ ] **Step 1: Generate the implementer prompt**

Run:

```bash
npm run orchestrator:prompt -- strategic-action-module implementer
```

Expected: Prompt includes strategic action, rationale, best next step, owner, target audience, friction, tool, asset, and capture prompt.

- [ ] **Step 2: Add validation checks**

Add checks for:

```js
['strategic action module visible', html.includes('Strategic action')],
['best next step rendered', html.includes('bestNextStep')],
['recommended Glean resource rendered', html.includes('recommendedToolOrAgent')],
['primary friction type rendered', html.includes('primaryFrictionType')]
```

- [ ] **Step 3: Render the action card above secondary detail**

The first account screen should answer:

- Why now?
- What should I do next?
- Who is it for?
- What Glean tool/agent/skill/asset should I use?
- What should I capture after?

- [ ] **Step 4: Keep language operational**

Use AIOM-native language:

- `Best next step`
- `Why this matters`
- `Recommended Glean resource`
- `What to capture in Prism`

Avoid:

- `Dashboard`
- `AI-generated insight`
- `Diagnostic`
- `Prediction engine`

- [ ] **Step 5: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

### Task 5: Resource Launcher

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/v1-data-layer.md`

- [ ] **Step 1: Generate the implementer prompt**

Run:

```bash
npm run orchestrator:prompt -- resource-launcher implementer
```

Expected: Prompt includes mapping strategic actions to Glean agents, skills, tools, and assets.

- [ ] **Step 2: Add deterministic resource mappings**

Add a lookup table:

```js
const resourceCatalog = {
  align: ['Account Transition Agent', 'Success Planning Template', 'Stakeholder Map'],
  activate: ['AIOM Account Ramp Companion', 'Kickoff Deck Template', 'Comms Calendar'],
  embed: ['Optimal Agent Use Case Recommender', 'Workflow Workshop Template'],
  expand: ['Champion Enablement Plan', 'EBR Template'],
  govern: ['Agent Governance Checklist', 'Admin Operating Model Template'],
  proveValue: ['EBR Template', 'Impact Story Builder']
};
```

- [ ] **Step 3: Implement safe launcher behavior**

If a URL exists, render an explicit launch button. If no URL exists, render a copyable prompt or named resource instruction.

- [ ] **Step 4: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

### Task 6: Prism Capture Loop

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/v1-data-layer.md`
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`

- [ ] **Step 1: Generate the implementer prompt**

Run:

```bash
npm run orchestrator:prompt -- prism-capture-loop implementer
```

Expected: Prompt includes action taken, outcome, remaining blocker, commitments, what worked, what did not, and follow-up.

- [ ] **Step 2: Add validation checks**

Add checks for:

```js
['Prism capture loop includes action outcome', html.includes('actionOutcome')],
['Prism capture loop includes remaining blocker', html.includes('remainingBlocker')],
['Prism capture loop includes follow-up', html.includes('recommendedFollowUp')]
```

- [ ] **Step 3: Extend capture model**

Add capture fields:

```js
{
  actionTaken: '',
  actionOutcome: 'worked | stalled | needs-follow-up',
  remainingBlocker: '',
  ownerCommitment: '',
  dateCommitment: '',
  whatWorked: '',
  whatDidNotWork: '',
  recommendedFollowUp: ''
}
```

- [ ] **Step 4: Keep persistence session-local**

Do not use `localStorage`, `sessionStorage`, or network calls. Export/copy the Prism capture summary instead.

- [ ] **Step 5: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

### Task 7: Glean Runtime Readiness

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/glean-artifact-runtime.md`
- Modify: `/Users/jameskelley/Documents/Adoption OS/README.md`

- [ ] **Step 1: Generate the runtime reviewer prompt**

Run:

```bash
npm run orchestrator:prompt -- glean-runtime-readiness runtime-reviewer
```

Expected: Prompt focuses on single-file artifact safety, guarded GleanBridge usage, no storage, no network, no iframes, no external assets.

- [ ] **Step 2: Confirm validation covers runtime constraints**

Ensure `scripts/validate-artifact.js` contains checks for:

```js
['GleanBridge is runtime guarded', html.includes('if (window.GleanBridge)')],
['no nested iframe elements', !/<iframe\b/i.test(html)],
['no browser storage APIs', !/\b(localStorage|sessionStorage)\b/.test(html)],
['no network APIs', !/\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b/.test(html)],
['no external script tags', !/<script\b[^>]*\bsrc=/i.test(html)]
```

- [ ] **Step 3: Update runtime docs**

Document:

- Build command.
- Generated artifact location.
- In-Glean placement step.
- Smoke-test checklist.
- Known V1 seeded-data boundary.

- [ ] **Step 4: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

### Task 8: In-Glean Smoke Test Checklist

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/glean-artifact-runtime.md`

- [ ] **Step 1: Generate reviewer prompt**

Run:

```bash
npm run orchestrator:prompt -- in-glean-smoke-test spec-reviewer
```

Expected: Prompt checks roster verification, account clickthrough, strategic action, resource launcher, Prism capture, and export/copy behavior.

- [ ] **Step 2: Add checklist**

Checklist should include:

- Artifact opens inside Glean.
- Roster verification appears first or is clearly accessible.
- AIOM can confirm all suggested clients.
- AIOM can deselect incorrect clients.
- AIOM can add a missing client.
- Account view is phase-led.
- Strategic action and best next step are visible.
- Recommended resource is visible.
- Prism capture summary can be copied/exported.
- No runtime errors appear.

- [ ] **Step 3: Verify**

Run:

```bash
npm run check
```

Expected: PASS.

---

## Parallelization Plan

Run sequentially first where data dependencies matter:

1. `roster-verification`
2. `aggregation-status`
3. `adoption-os-phase-backbone`

Then parallelize if using sub-agents:

- Worker A: `strategic-action-module`
- Worker B: `resource-launcher`
- Worker C: `prism-capture-loop`

Final sequential close:

1. `glean-runtime-readiness`
2. `in-glean-smoke-test`
3. `npm run check`
4. Controller diff review

---

## Definition Of Done Today

- AIOM can verify their client roster.
- Verified clients drive the portfolio view.
- Each account has Adoption OS phase, source coverage, strategic action, best next step, and recommended Glean resource.
- AIOM can capture action outcome for Prism.
- AI Fluency is visible only as a Q2/Q3 placeholder.
- `npm run check` passes.
- `dist/glean_adoption_os.html` is ready to place back inside Glean.

## Biggest Risks

- The artifact gets too broad and feels like a dashboard instead of an AIOM operating surface.
- Seeded data appears more authoritative than it is.
- Resource launcher implies URLs or live integrations that do not exist yet.
- Function-level phase variation is under-modeled and weakens the Adoption OS story.
- Runtime constraints break if a worker adds storage, network calls, or external assets.

## What To Validate First

Validate the roster and phase-led account view before polishing anything else. If an AIOM cannot see the right clients and understand each client's Adoption OS phase, the rest of the experience will feel clever but not operational.
