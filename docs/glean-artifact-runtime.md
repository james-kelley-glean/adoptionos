# Glean Artifact Runtime Notes

## Target

The deployable artifact is `dist/glean_adoption_os.html`.

## Runtime Expectations

- The artifact should run as standalone HTML.
- Glean-specific actions should use `window.GleanBridge` only when available.
- Local development should not fail when `window.GleanBridge` is missing.
- Export or menu actions should be additive, not required for basic page function.
- Canvas interactive content runs in a locked-down `sandbox="allow-scripts"` frame with no persistent browser storage and no outbound network calls.
- Do not use nested `<iframe>` elements, `localStorage`, `sessionStorage`, external scripts, external CSS imports, `fetch`, `XMLHttpRequest`, `WebSocket`, or `EventSource`.
- Use system fonts and inline/CSS-only visuals unless Glean explicitly supports a safe embedded source.

## Current GleanBridge Use

The artifact registers an `Export as PDF` action only when `window.GleanBridge.postMessage` and `window.GleanBridge.onMessage` are available. Outside Glean, or in a host that exposes a partial bridge, that block is skipped.

## Placement Back Into Glean

1. Run `npm run check`.
2. Use `dist/glean_adoption_os.html`.
3. Place the generated single-file HTML into the intended Glean artifact surface.
4. Smoke test:
   - Strategic action is the first Overview surface.
   - Roster verification appears in Portfolio.
   - AIOM can verify all suggested clients.
   - AIOM can deselect clients that are not theirs.
   - AIOM can add a missing client and see aggregation status.
   - Portfolio table only shows verified clients after confirmation.
   - Adoption OS phase backbone shows phase objective, current milestone, open activities, overdue activities, phase assets, and function-level phase status.
   - Source coverage shows available, provisional, missing, and needs-verification states without implying live data.
   - Recommended Glean resource launches or degrades to copyable prompt behavior.
   - Prism health input renders as part of client health.
   - Prism outcome capture includes action taken, action outcome, remaining blocker, owner/date commitments, what worked, what did not work, and recommended follow-up.
   - Copy into Prism summary is recoverable if clipboard access is blocked.
   - Tabs work.
   - Attention items can be marked done.
   - Export action appears in Glean, if supported by the runtime.

## Future Live Data Contract

Before adding live data, define:

- Source name
- Field names
- Refresh cadence
- Permission model
- Empty-state behavior
- Confidence or freshness indicator
- Fallback to seeded data, if any
