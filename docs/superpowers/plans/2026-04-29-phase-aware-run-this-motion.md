# Phase-Aware Run This Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact phase-aware `Run this motion` launcher to the Overview so AIOMs can analyze the account, generate the right phase plan, draft follow-up, and save Account Memory without turning the Overview into a long workbench.

**Architecture:** Keep Overview as the command center. Add one phase-aware action panel attached to the current recommendation, using seeded prompts today and a guarded `GleanBridge` message path when Canvas button-click actions are available. Deeper Account Analysis and Plan Generation outputs should stay in a progressive drawer/workbench pattern, not as permanent Overview content.

**Tech Stack:** Single-file HTML/CSS/JavaScript artifact, guarded `window.GleanBridge`, Node.js validation scripts, Glean Canvas-safe single-file build.

---

## File Map

- `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`: Add the phase-aware action model, Overview panel markup, event handling, prompt generation, and guarded Glean action handoff.
- `/Users/jameskelley/Documents/Adoption OS/dist/glean_adoption_os.html`: Generated output from `npm run build`; do not edit directly.
- `/Users/jameskelley/Documents/Adoption OS/docs/v1-data-layer.md`: Document the phase-aware action launcher and source contract.
- `/Users/jameskelley/Documents/Adoption OS/docs/glean-artifact-runtime.md`: Add the smoke-test expectation for the launcher and fallback behavior.
- `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`: Add checks for phase-aware actions, guarded GleanBridge handoff, and fallback prompts.
- `/Users/jameskelley/Documents/Adoption OS/scripts/smoke-iframe.js`: Add a lightweight iframe assertion that the panel renders and the fallback buttons are present.

---

## Product Contract

The same four motions appear across phases, but the visible verbs and prompts change by phase.

| Phase | Panel Title | Analyze | Generate | Draft | Save |
|---|---|---|---|---|
| Prep | Run this Prep motion | Analyze prep risk | Generate success plan | Draft context follow-up | Save prep memory |
| Readiness | Run this Readiness motion | Analyze launch risk | Generate readiness plan | Draft blocker follow-up | Save readiness memory |
| Stickiness | Run this Stickiness motion | Analyze adoption momentum | Generate growth plan | Draft champion follow-up | Save adoption memory |
| Scale | Run this Scale motion | Analyze governance risk | Generate scale plan | Draft exec follow-up | Save scale memory |

Button behavior:

1. If `window.GleanBridge.postMessage` is available, send a `glean-send-message` payload with account, phase, action, and context.
2. If not available, fall back to `copyWithPromptFallback()` so local testing and non-enabled Canvas runtimes remain usable.
3. Do not call network APIs, browser storage, or external scripts from the artifact.
4. Do not claim a skill/action actually ran unless the bridge path confirms execution later. Initial slice only launches or copies the request.

---

## Task 1: Add Validation First

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/validate-artifact.js`

- [ ] **Step 1: Add validation checks for the new launcher**

Add these checks near the existing Overview and Client Health checks:

```js
['artifact includes phase-aware motion launcher', html.includes('id="phaseMotionLauncher"') && html.includes('getPhaseMotionActions(account)')],
['artifact includes all phase motion action types', html.includes("type: 'analyze_account'") && html.includes("type: 'generate_plan'") && html.includes("type: 'draft_followup'") && html.includes("type: 'save_account_memory'")],
['artifact includes guarded Glean action handoff', html.includes('function launchPhaseMotionAction') && html.includes("type: 'glean-send-message'") && html.includes('window.GleanBridge') && html.includes('copyWithPromptFallback')),
['artifact uses phase-specific action labels', html.includes('Analyze launch risk') && html.includes('Generate readiness plan') && html.includes('Draft champion follow-up') && html.includes('Save scale memory')]
```

- [ ] **Step 2: Run validation and confirm it fails**

Run:

```bash
npm run validate
```

Expected: FAIL on the new phase-aware motion launcher checks.

---

## Task 2: Add Phase-Aware Action Model

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`

- [ ] **Step 1: Add a phase motion action catalog**

Add this near `phaseBackboneDefaults` or before `resourceCatalog`:

```js
const phaseMotionActionDefaults = {
  prep: {
    title: 'Run this Prep motion',
    context: 'Prep focuses on account baseline, stakeholder clarity, source gaps, and success criteria.',
    actions: [
      { type: 'analyze_account', label: 'Analyze prep risk', skill: 'Account Analysis', output: 'Prep risk read' },
      { type: 'generate_plan', label: 'Generate success plan', skill: 'Plan Generation', output: 'Success plan' },
      { type: 'draft_followup', label: 'Draft context follow-up', skill: 'Meeting Summarizer + Follow Up', output: 'Customer context follow-up' },
      { type: 'save_account_memory', label: 'Save prep memory', skill: 'Account Memory', output: 'Prep memory update' }
    ]
  },
  readiness: {
    title: 'Run this Readiness motion',
    context: 'Readiness focuses on launch blockers, training audience, enablement path, comms risk, and owner/date commitments.',
    actions: [
      { type: 'analyze_account', label: 'Analyze launch risk', skill: 'Account Analysis', output: 'Launch risk read' },
      { type: 'generate_plan', label: 'Generate readiness plan', skill: 'Plan Generation', output: 'Readiness plan' },
      { type: 'draft_followup', label: 'Draft blocker follow-up', skill: 'Meeting Summarizer + Follow Up', output: 'Blocker follow-up' },
      { type: 'save_account_memory', label: 'Save readiness memory', skill: 'Account Memory', output: 'Readiness memory update' }
    ]
  },
  stickiness: {
    title: 'Run this Stickiness motion',
    context: 'Stickiness focuses on usage quality, workflow adoption, champion motion, power-user evidence, and habit formation.',
    actions: [
      { type: 'analyze_account', label: 'Analyze adoption momentum', skill: 'Account Analysis', output: 'Adoption momentum read' },
      { type: 'generate_plan', label: 'Generate growth plan', skill: 'Plan Generation', output: 'Adoption growth plan' },
      { type: 'draft_followup', label: 'Draft champion follow-up', skill: 'Meeting Summarizer + Follow Up', output: 'Champion follow-up' },
      { type: 'save_account_memory', label: 'Save adoption memory', skill: 'Account Memory', output: 'Adoption memory update' }
    ]
  },
  scale: {
    title: 'Run this Scale motion',
    context: 'Scale focuses on governance, executive value proof, COE rhythm, expansion readiness, and durable operating model.',
    actions: [
      { type: 'analyze_account', label: 'Analyze governance risk', skill: 'Account Analysis', output: 'Governance risk read' },
      { type: 'generate_plan', label: 'Generate scale plan', skill: 'Plan Generation', output: 'Scale plan' },
      { type: 'draft_followup', label: 'Draft exec follow-up', skill: 'Meeting Summarizer + Follow Up', output: 'Executive follow-up' },
      { type: 'save_account_memory', label: 'Save scale memory', skill: 'Account Memory', output: 'Scale memory update' }
    ]
  }
};
```

- [ ] **Step 2: Add the helper**

Add this near `getPhaseBackbone`:

```js
function getPhaseMotionActions(account) {
  const phaseKey = account.phase || 'prep';
  return phaseMotionActionDefaults[phaseKey] || phaseMotionActionDefaults.prep;
}
```

- [ ] **Step 3: Run syntax validation**

Run:

```bash
node --check scripts/validate-artifact.js
npm run build
```

Expected: both commands pass.

---

## Task 3: Render The Overview Panel

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`

- [ ] **Step 1: Add Overview markup**

Inside `#strategicActionPanel`, after the current recommendation/action stack and before the evidence panel, add:

```html
<div class="motion-launcher" id="phaseMotionLauncher">
  <div>
    <div class="eyebrow" id="phaseMotionKicker">Run this motion</div>
    <h3 id="phaseMotionTitle">Run this motion</h3>
    <p class="muted" id="phaseMotionContext"></p>
  </div>
  <div class="motion-action-grid" id="phaseMotionActions"></div>
</div>
```

- [ ] **Step 2: Add CSS**

Add near the action/card CSS:

```css
.motion-launcher {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  margin-top: 16px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255,255,255,0.72);
}

.motion-action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(150px, 1fr));
  gap: 8px;
}

.motion-action-button {
  min-height: 42px;
  justify-content: flex-start;
}
```

Add this to the existing mobile media query:

```css
.motion-launcher,
.motion-action-grid {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 3: Add DOM references**

In the `ui` object, add:

```js
phaseMotionLauncher: document.getElementById('phaseMotionLauncher'),
phaseMotionKicker: document.getElementById('phaseMotionKicker'),
phaseMotionTitle: document.getElementById('phaseMotionTitle'),
phaseMotionContext: document.getElementById('phaseMotionContext'),
phaseMotionActions: document.getElementById('phaseMotionActions'),
```

- [ ] **Step 4: Render phase-aware buttons**

Add this function near `renderNextMove`:

```js
function renderPhaseMotionLauncher(account) {
  const motion = getPhaseMotionActions(account);
  ui.phaseMotionKicker.textContent = `Run this ${phases[account.phase].label} motion`;
  ui.phaseMotionTitle.textContent = motion.title;
  ui.phaseMotionContext.textContent = motion.context;
  ui.phaseMotionActions.innerHTML = motion.actions.map(action => `
    <button class="buttonlike motion-action-button" data-motion-action="${escapeHtmlAttr(action.type)}">
      ${escapeHtml(action.label)}
    </button>
  `).join('');
}
```

- [ ] **Step 5: Call the render function**

In `renderAll()`, immediately after `renderNextMove(account);`, add:

```js
renderPhaseMotionLauncher(account);
```

- [ ] **Step 6: Verify render**

Run:

```bash
npm run check
```

Expected: validation still fails only if Task 4 handoff is not implemented yet; build and script syntax should pass.

---

## Task 4: Add Safe Skill/Agent Handoff

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/src/glean_adoption_os.html`

- [ ] **Step 1: Add prompt builder**

Add this near `buildResourcePrompt` or `getCapturePrompt`:

```js
function buildPhaseMotionPrompt(account, action) {
  const phase = phases[account.phase];
  const evidence = getAccountEvidence(account);
  const missingSources = getMissingSources(account);
  const prismHealth = getPrismHealthContext(account);
  return [
    `Run Adoption OS action: ${action.label}`,
    `Use skill/modeling pattern: ${action.skill}`,
    `Account: ${account.name}`,
    `Phase: ${phase.label}`,
    `Business context: ${account.business}`,
    `Recommended move: ${account.nextMove.title}`,
    `Best next step: ${account.nextMove.session}`,
    `Why now: ${account.nextMove.why}`,
    `Evidence confidence: ${evidence.confidence}`,
    `Client Health signal: ${prismHealth.prismHealthSignal}`,
    `Risk pattern: ${prismHealth.prismRiskPattern}`,
    `Missing or verification-needed sources: ${missingSources.length ? missingSources.join(', ') : 'None flagged'}`,
    `Output needed: ${action.output}`,
    'Keep the output concise, AIOM-ready, source-aware, and tied to owner/date next steps.'
  ].join('\n');
}
```

- [ ] **Step 2: Add guarded launch function**

Add this near `copyWithPromptFallback`:

```js
function launchPhaseMotionAction(actionType) {
  const account = getAccount();
  const motion = getPhaseMotionActions(account);
  const action = motion.actions.find(item => item.type === actionType);
  if (!action) return;
  const prompt = buildPhaseMotionPrompt(account, action);
  if (window.GleanBridge && typeof window.GleanBridge.postMessage === 'function') {
    window.GleanBridge.postMessage({
      actionId: `adoption-os-${action.type}`,
      type: 'glean-send-message',
      metadata: {
        displayLabel: action.label,
        context: prompt
      }
    });
    showToast(`${action.label} sent to Glean`);
    return;
  }
  copyWithPromptFallback(prompt);
  showToast(`${action.label} prompt ready`);
}
```

- [ ] **Step 3: Add event delegation**

Near the other event listeners, add:

```js
document.getElementById('phaseMotionActions').addEventListener('click', event => {
  const button = event.target.closest('[data-motion-action]');
  if (!button) return;
  launchPhaseMotionAction(button.dataset.motionAction);
});
```

- [ ] **Step 4: Verify local fallback**

Run:

```bash
npm run check
```

Expected: PASS.

---

## Task 5: Update Docs And Smoke Test

**Files:**
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/v1-data-layer.md`
- Modify: `/Users/jameskelley/Documents/Adoption OS/docs/glean-artifact-runtime.md`
- Modify: `/Users/jameskelley/Documents/Adoption OS/scripts/smoke-iframe.js`

- [ ] **Step 1: Update data-layer doc**

Add a section under the Strategic Action Layer:

```md
### 6A. Phase-Aware Run This Motion

What it serves: lets the AIOM execute the recommendation without leaving the Adoption OS command center.

Behavior:

- The launcher appears on Overview directly under the recommended move.
- It adapts visible verbs and prompt context to the current Adoption OS phase.
- It always includes four actions: analyze account, generate plan, draft follow-up, and save Account Memory.
- In Glean, each action should send a guarded `glean-send-message` request with account, phase, evidence, source gaps, and desired output.
- Outside Glean, each action must degrade to a copyable prompt.
- The launcher should not render full skill outputs on Overview; deeper output belongs in a drawer, workbench, or returned Glean follow-up.
```

- [ ] **Step 2: Update runtime doc**

Add to the smoke-test checklist:

```md
- Phase-aware `Run this motion` launcher appears on Overview.
- Launcher labels change based on account phase.
- Launcher buttons either send a guarded Glean message or degrade to copyable prompts outside Glean.
```

- [ ] **Step 3: Update iframe smoke test**

In `scripts/smoke-iframe.js`, add assertions equivalent to:

```js
await expectText('#phaseMotionTitle', /Run this .* motion/);
await expectCount('[data-motion-action]', 4);
```

If the smoke helper does not have `expectText` or `expectCount`, implement the same check using the existing page evaluation pattern:

```js
const motionState = await frame.evaluate(() => ({
  title: document.querySelector('#phaseMotionTitle')?.textContent || '',
  actions: document.querySelectorAll('[data-motion-action]').length
}));
assert(/Run this .* motion/.test(motionState.title), 'missing phase motion title');
assert(motionState.actions === 4, 'expected four phase motion actions');
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run check
npm run smoke:iframe
npm run check:dist
```

Expected: all pass.

---

## Task 6: Commit

**Files:**
- Stage only the files changed in this slice.

- [ ] **Step 1: Inspect status**

Run:

```bash
git status --short
```

Expected: `.gitignore` and `v2-overview-mock.png` may still be unrelated local changes. Do not stage them unless explicitly requested.

- [ ] **Step 2: Stage this slice**

Run:

```bash
git add src/glean_adoption_os.html dist/glean_adoption_os.html docs/v1-data-layer.md docs/glean-artifact-runtime.md scripts/validate-artifact.js scripts/smoke-iframe.js docs/superpowers/plans/2026-04-29-phase-aware-run-this-motion.md
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "Add phase-aware Adoption OS motion launcher"
```

Expected: commit succeeds with only the phase-aware launcher slice staged.

---

## Self-Review

- Spec coverage: The plan covers the phase-aware launcher, phase-specific labels, Account Analysis, Plan Generation, follow-up drafting, Account Memory, safe GleanBridge handoff, local fallback, docs, validation, smoke test, build, and commit.
- Placeholder scan: No `TBD`, `TODO`, or undefined future work is required to complete the slice.
- Type consistency: The action type values are consistent across validation, prompt building, button data attributes, and launch handling.
- Scope check: This plan intentionally does not build a full workbench/drawer. It creates the Overview launcher and safe handoff only.
