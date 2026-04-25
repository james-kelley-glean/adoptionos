# Canvas Sandbox Findings

Source: Glean Help Docs, `Interactive content | Glean`, updated Apr 24, 2026, URL `https://docs.glean.com/user-guide/assistant/html-artifacts`.

## Confirmed Constraints

- Interactive content is rendered as HTML inside a secure sandbox.
- The sandbox uses `sandbox="allow-scripts"`, isolates the content from the parent app, and gives it a null origin.
- Executed HTML cannot access Glean cookies, Glean `localStorage`, `sessionStorage`, or the parent DOM.
- CSP blocks outbound network requests with `connect-src 'none'`.
- Nested frames are disallowed.
- Form submissions are restricted.
- Images and fonts are limited to safe sources to reduce URL-based exfiltration risk.
- Interactive content has no persistent client-side storage; reruns start from a clean slate.

## Repo Implications

- Render Prism context inline instead of with a nested iframe.
- Use session-only in-memory state for UI affordances.
- Do not load Google Fonts or other external font/image/script hosts.
- Do not add `fetch`, `XMLHttpRequest`, `WebSocket`, or similar network APIs to the artifact.
- Keep live data collection in an external Glean Agent/action flow unless Glean provides an explicit artifact-safe source contract.
