# V2 Skill Value And Software Map

This is the V2 operating map for the Glean Adoption OS artifact. The product stays inside the Glean product as a phase-aware AIOM operating system. The artifact can show seeded data today, but these are the source contracts the live version should aggregate upstream before rendering.

## V2 Product Frame

V2 should answer five practical AIOM questions for each client:

1. What phase of Adoption OS is this account in, including where different functions are in different phases?
2. What is the best next step, and why now?
3. Who should the AIOM contact next?
4. What work is owned by the AIOM, by the client, or blocked elsewhere?
5. What does Prism say about account health, repeated blockers, prior action outcomes, and likely next motion?

The artifact should remain recommendation-first. Data exists to support action, not to become a generic dashboard.

## Skill Contributions

### Account Analysis

Adds the operating health layer:

- Account health rating, confidence, trend, risk drivers, and opportunity drivers.
- Metrics by team, function, or seat segment.
- Open work split into our tasks, their tasks, waiting, and overdue.
- Key contacts with role, engagement, last touch, and next contact reason.
- Support posture and blocker pattern.
- Source coverage so the AIOM knows what is real, missing, or only seeded.

V2 artifact surfaces created from this:

- Account health overlay.
- Who to contact.
- Task ownership.
- Seat and function map.
- Source coverage.

### Plan Generation

Adds the phase-aware plan spine:

- Business objective and north-star outcome.
- Current Adoption OS phase assessment.
- Milestones, success criteria, blockers, owners, and dates.
- Recommended resources and proven approaches.
- Plan evolution from what was true, what is true now, and what could be true next.

V2 artifact surfaces created from this:

- Phase backbone.
- Action stack.
- Top workflows.
- Package posture.
- Training readiness.
- Standard agent and skill pack.

### Triage Classification

Adds task intelligence and next-action routing:

- Classifies work as AIOM-owned, client-owned, waiting, internal, project item, meeting prep, risk signal, or info-only.
- Infers priority and likely account.
- Checks whether a task has already been handled through email, Slack, meeting notes, docs, or existing tasks.
- Produces execution-ready instructions: why it matters, what to do, who to contact, what to include, and what outcome to drive.

V2 artifact surfaces created from this:

- Task ownership split.
- Who to contact.
- Needs attention now.
- Prism capture prompts.
- Recommendation resource routing.

## Software And Data Sources

### Systems Of Record

- Salesforce: account identity, owner, segment, ARR, renewal, opportunity, stakeholder, and commercial context.
- AIOM Staffing Sheet: AIOM-to-client assignment verification and manual roster fallback.
- Rocketlane: project phase, milestones, package, hours, scope, implementation status, and blockers.
- Sigma / BigQuery / Post Sales Reporting: usage, adoption, WAU/MAU, feature depth, function-level adoption, assistant usage, agent usage, and seat activation.
- Support systems: Zendesk, Jira, ServiceCloud, or equivalent support-ticket systems for open issues, severity, age, and owner.

### Workstream Context

- Slack: account channels, internal channels, rollout channels, asks, blockers, decisions, and stakeholder activity.
- Gmail / email: sponsor engagement, customer commitments, follow-ups, decision records, and quiet-account signals.
- Google Calendar: touchpoint cadence, upcoming calls, no-touch gaps, and meeting-prep windows.
- Zoom, Gong, Scribe, or meeting transcripts: call summaries, commitments, objections, open questions, decision owners, and meeting outcomes.
- Google Drive / Docs / Slides / Sheets: success plans, MAPs, kickoff decks, EBRs, training plans, stakeholder maps, and account plan artifacts.
- User Tasks / scratchpad / daily notes: AIOM to-dos, captured asks, triage inputs, and unresolved work.

### Glean-Native Intelligence And Action

- Prism: underlying account health memory, repeated patterns, prior action outcomes, blockers, what worked, what did not work, and recommended follow-up.
- Glean Search: source retrieval and evidence lookup.
- Glean Assistant: synthesis, prompt fallback, and action explanation.
- Glean Skills: reusable execution workflows for account analysis, plan generation, task triage, meeting prep, and follow-up.
- Glean Agents: higher-order account workflows and recommended resource execution.
- Glean Artifacts / Canvas: the interactive AIOM operating surface.

### Future Placeholder

- AI Fluency: Q2/Q3 enrichment layer for function readiness, behavior change, leadership reinforcement, capability growth, and training recommendations. It should inform the health model later, but it is not required for V2 launch.

## V2 Data Objects

The live snapshot passed into the artifact should eventually include:

- `phaseObjective`
- `currentMilestone`
- `openAdoptionActivities`
- `overdueAdoptionActivities`
- `phaseAssets`
- `functionPhaseStatus`
- `strategicAction`
- `bestNextStep`
- `confidenceReason`
- `prismHealthSignal`
- `prismRiskPattern`
- `priorActionOutcome`
- `repeatedBlocker`
- `momentumSinceLastTouch`
- `recommendedPlayFromHistory`
- `healthImpact`
- `keyContacts`
- `taskOwnership`
- `seatDistribution`
- `sourceCoverageStatus`
- `missingSources`

## Live Data Rule

Inside Glean, the artifact should be treated as a rendered operating surface. Identity, roster verification, source scanning, and account snapshot assembly should happen upstream. The artifact should clearly label missing, provisional, or seeded sources so an AIOM can act without mistaking demo data for live truth.
