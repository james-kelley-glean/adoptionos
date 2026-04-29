# V1 Data Layer

## Hard Constraint

This artifact must live inside the Glean product. The V1 data layer is designed for a Glean-native artifact first, with local review as a development convenience.

## Purpose

The data layer exists to help an AI Outcomes Manager decide the right strategic action, the best next step, and the best Glean resource to use for a client.

It is not a generic account dashboard data model. It is an operating layer on top of Adoption OS intelligence.

## Operating Spine

The V1 artifact should combine:

- What was: historical patterns, prior AIOM motions, Account Memory, Prism-derived context, known playbooks, and useful outputs from existing agents or skills.
- What is: current Adoption OS phase, client signals, source coverage, package reality, stakeholder context, usage, blockers, and active risks.
- What could be: recommended strategic action, best next step, recommended tool or agent, recommended asset, expected outcome, and Account Memory update.

## V1 Decision Question

Every field should support this question:

> Given this client's Adoption OS phase, current signals, package reality, and available Glean resources, what strategic action should the AIOM take next?

If a field does not help answer that, it should stay out of V1.

## Required Layers

### 1. Account Identity

What it serves: who owns the work and what account context changes the strategy.

Fields:

- accountName
- aiomOwner
- demOwner
- accountExecutive
- decisionOwner
- clientOwner
- gleanOwner
- segment
- region
- industry
- arrOrTcv
- packageType
- packageEntitlements
- renewalWindow

### 1A. Roster Verification

What it serves: lets the AIOM confirm that the portfolio belongs to them before the artifact loads portfolio-level intelligence.

Seeded V1 sources:

- Staffing Sheet: suggested client assignment and AIOM ownership.
- Salesforce-style roster data: account ownership, commercial context, and account identity.

Fields:

- sourceSummary
- suggestedClients
- suggestedBy
- selected
- verified
- verifiedRoster
- confirmed
- lastConfirmedAt
- aggregationStatus

Behavior:

- Suggested clients should appear before the portfolio table loads.
- The AIOM can verify all suggested clients, deselect clients that are not theirs, or add a missing client.
- Only clients in `verifiedRoster` should appear in the portfolio table after confirmation.
- A manually added client should remain visible with an `aggregationStatus` such as `Aggregating from Staffing Sheet / Salesforce` until fuller account intelligence is available.

### 2. Adoption OS State

What it serves: where the client is in the journey and which phase-specific motion applies.

Fields:

- currentAdoptionPhase
- selectedPhaseGuidance
- phaseObjective
- currentMilestone
- aiomNeedsToKnow
- decisionLens
- whatGoodLooksLike
- commonBlockers
- prismDecisionUse
- skillInputs
- nextMotion
- targetFunction
- targetAudience
- completedAdoptionActivities
- openAdoptionActivities
- overdueAdoptionActivities
- nextExpectedActivity
- phaseAssets
- functionPhaseStatus

Behavior:

- The Overview should lead with the Adoption OS phase backbone before generic risk, source, or weekly-priority detail.
- The current phase should expose its objective, current milestone, open adoption activities, overdue adoption activities, and phase-relevant assets.
- The phase toolbar should update the Overview guidance itself, not only Templates and Tools. If a selected phase is not the account's current phase, the artifact should show that phase's general AIOM guidance while clearly preserving the account's actual current phase.
- Each phase should explain what the AIOM needs to know, the decision lens, what good looks like, common blockers, how to use Prism, which skill-package inputs matter, and the next motion.
- Weekly or Monday priority should summarize what needs attention this week; it should not replace the operating model.
- A single client can have multiple functions in different phases at the same time. `functionPhaseStatus` should represent function, phase, and status so the AIOM can see where readiness, stickiness, or scale motions differ inside the same account.
- Phase-aware templates, tools, and recommended assets should remain filtered by phase and connected to the current account motion.

### 2A. Account Plan Contract

What it serves: connects Plan Generation output to the Adoption OS operating surface so the recommended action is grounded in the customer's business objective, north-star outcome, and current milestone path.

Prototype rule:

- Seeded or sample account plan data is acceptable while shaping the artifact locally.
- Launch requires live accountSnapshot assembly upstream from Glean-accessible sources before the artifact is used as production account intelligence.
- The artifact should render the prepared `accountPlan`; it should not directly fetch Salesforce, Sigma, Slack, Prism, or Drive data from inside Canvas.
- Every major plan field should carry source-state metadata so the AIOM can distinguish `live`, `sample`, `inferred`, `missing`, and `stale` inputs.

Fields:

- accountPlan
- planStatus
- lastReviewed
- businessObjective
- northStarOutcome
- currentPhaseAssessment
- milestones
- milestone.name
- milestone.target
- milestone.status
- milestone.successCriteria
- milestone.resources
- blockers
- successCriteria
- keyContacts
- planEvolution
- sourcesUsed
- sourceState
- sourceStateLabel

Behavior:

- The Overview should show a compact plan spine before the phase backbone: business objective, north-star outcome, plan status, next milestone, primary blocker, and source state.
- New or unreviewed plans should be marked `DRAFT`; stale plans should be marked `NEEDS REFRESH`; reviewed plans can become `ACTIVE`.
- Plan evolution should preserve why the business objective, north-star outcome, phase, or milestone path changed.
- `sourcesUsed` should show what was found, inferred, missing, or stale so launch readiness depends on evidence rather than hidden assumptions.

### 3. Current Signals

What it serves: what is true right now and what needs attention.

Fields:

- usageTrend
- wau
- mau
- seatActivation
- assistantUsageSignal
- agentUsageSignal
- trainingAttendance
- officeHoursParticipation
- openSupportIssues
- stakeholderSignal
- sponsorSignal
- recentCallThemes
- knownBlockers
- sourceCoverage
- sourceCoverageStatus
- missingSources
- supportingSources
- dataConfidence
- confidenceReason

### 3A. Account Evidence Contract

What it serves: gives the AIOM evidence behind the recommendation without turning Adoption OS into a generic reporting dashboard.

Prototype rule:

- Sample account evidence can be used in local prototype data.
- Launch requires live `accountSnapshot` assembly upstream from Sigma / BigQuery, Salesforce, Prism, Slack, meetings, support, docs, and other relevant Glean-accessible sources.
- The artifact should render prepared `accountEvidence`; it should not query live systems directly from Canvas.
- Progressive detail should always be available: the AIOM should see a compact evidence summary by default and be able to expand into metrics, functions, open items, risks, wins, support posture, and sources checked.

Fields:

- accountEvidence
- healthRating
- healthTrend
- confidence
- summary
- topMetricSignal
- topQualitativeSignal
- sourceCompleteness
- metricsSnapshot
- metric.label
- metric.value
- metric.delta
- metric.sourceState
- sixMonthTrendSummary
- functionMetrics
- stalenessFlags
- openItems
- supportPosture
- risks
- wins
- sourcesChecked

Behavior:

- The default view remains action-first. Evidence explains why the recommendation is credible; it does not replace the recommendation.
- Evidence only earns screen space if it changes the next action, confidence, timing, owner path, or source verification need.
- Details on demand should preserve source states such as `live`, `sample`, `inferred`, `missing`, and `stale`.
- Live launch should treat Sigma / BigQuery usage metrics as the quantitative baseline while cross-checking qualitative signals from Prism, Slack, meetings, support, email, docs, and CRM.

### 3B. Overview Simplification Rule

What it serves: keeps the Overview usable for an AIOM who needs to decide what to do next, not audit every available account signal at once.

Behavior:

- The default Overview should operate as an AIOM command center.
- The always-visible path should stay limited to the strategic action, recommendation evidence, account plan spine, and follow-up split.
- More operating context must remain available progressively for phase lanes, workflows, package posture, training readiness, contacts, tasks, sources, and platform health.
- Supporting detail should not be removed; it should be tucked behind progressive disclosure unless it changes the immediate action.

### 4. Capacity And Commercial Context

What it serves: what the AIOM can realistically do and how urgent the motion is.

Fields:

- hoursRemaining
- hoursUsed
- hoursRisk
- packageConstraints
- outOfScopeRequests
- customWorkNeeded
- saRequired
- renewalRisk
- commercialRisk
- engagementLevel

### 5. Historical Intelligence

What it serves: what has worked before and how Prism can make the system more useful over time.

Fields:

- prismSummary
- prismHealthSignal
- prismRiskPattern
- priorActionOutcome
- repeatedBlocker
- momentumSinceLastTouch
- priorAIOMActions
- priorMotionsUsed
- priorOutcomes
- actionTaken
- actionOutcome
- outcomeEvidence
- remainingBlocker
- ownerDateCommitments
- whatWorked
- whatDidNotWork
- recommendedFollowup
- similarClientPattern
- knownFailureMode
- recommendedPlayFromHistory
- toolsThatWorkedBefore
- healthImpact

Behavior:

- The AIOM-facing tab should be named `Client Health`, not `Prism`, because the user need is account condition and risk, not the internal source label.
- Client Health should collapse the former Signals and Prism surfaces into one view: one account read, usage metrics, AIOM worry items, four health drivers, expandable evidence, and outcome capture.
- The Client Health read should synthesize risk into a decision panel: current read, what changed, why now, AIOM move, and recommended resource or asset. It should not render every worry as an equal-priority card.
- Health drivers should default to a 2x2 scan: Assistant usage, Agent usage, blockers, and timing or commercial pressure.
- The Client Health navigation item should show a small review notification when the selected account has high-priority health signals, critical issues, source gaps, or evidence items that need source verification.
- Evidence should be compact by default and expandable into source freshness, source gaps, top signals, and signal history.
- Every evidence item should carry a direct source affordance. If the live source URL is unavailable, the item must be visibly labeled as needing source verification rather than presented as fully grounded evidence.
- Evidence items should include `group`, `title`, `body`, `sourceSystem`, `sourceTitle`, `sourceUrl`, `sourceState`, `severity`, and `freshness`.
- Prism should remain available as a health input, but not as the primary visible navigation label or assumed writeback destination. Account Memory should be the visible capture destination until direct Prism writeback is confirmed.
- The account view should explain what Prism or the upstream health payload tells the AIOM about client health: health signal, risk pattern, prior action outcome, repeated blocker, momentum since last touch, recommended play from history, source confidence, and expected health impact.
- Outcome capture should stay session-local inside the artifact. No browser storage APIs, live network calls, iframes, external scripts, or external CSS are allowed.

### 5A. Account Memory + Health Loop

What it serves: closes the loop between recommendation, action, outcome, and the next Client Health recommendation.

Health input fields:

- prismHealthSignal
- prismRiskPattern
- priorActionOutcome
- repeatedBlocker
- momentumSinceLastTouch
- recommendedPlayFromHistory
- healthImpact

Outcome capture fields:

- actionTaken
- actionOutcome
- remainingBlocker
- ownerDateCommitments
- whatWorked
- whatDidNotWork
- recommendedFollowup

Behavior:

- The Client Health workspace should preload the recommended action and health input so the AIOM understands why the account is healthy, stuck, risky, or improving.
- The AIOM should be able to capture whether the recommended action worked, what happened, what blocker remains, who owns the next commitment, what worked, what did not work, and the recommended follow-up.
- The capture summary should clearly identify what should be saved as Account Memory after the customer touch.
- The capture summary should include the recommended action and the outcome loop so future recommendations can learn from what actually happened.

### 6. Strategic Action Layer

What it serves: the actual recommendation.

Fields:

- strategicAction
- strategicRationale
- bestNextStep
- recommendedMotion
- primaryFrictionType
- recommendedToolOrAgent
- recommendedSkill
- recommendedAsset
- expectedOutcome
- capturePrompt

Behavior:

- The Overview recommendation surface should use AIOM-native language: Strategic action, Best next step, Why this matters, Recommended Glean resource, and Account Memory update.
- Strategic action, rationale, next step, owner, target audience, friction, recommended resource, recommended asset, and Account Memory update prompt should be visible without opening the data model.
- Every strategic action must resolve to a recommended Glean resource before it renders.

### 7. Resource Catalog

What it serves: maps the strategic motion to the best Glean agent, skill, tool, or reusable asset.

Required seeded resources:

- AIOM Briefing Report
- Client Adoption Strategy Chatbot
- What We Heard Agent
- Common Client Inquiries Prep
- Glean Change Briefing Agent
- Glean Tip Drop Agent
- Prompt Crafter
- Custom Prompt Generator for Specific Client
- Glean Guided: Agent Build Partner
- Audit My Agent
- Glean Q&A Bot
- Joint Success Planning Builder
- EBR Generator
- AIOM QBR Deck Creator
- HackaComms
- AIOM Account Ramp Companion
- Meeting Summarizer + Follow Up
- Optimal Agent Use Case Recommender

Behavior:

- Resource mapping should consider motion, Adoption OS phase, primary friction type, target audience, and recommended asset.
- Each resource card should carry visible metadata for Adoption OS stage, job category, resource type, creator or owner, and status.
- Category should describe the job the resource serves, such as Account Strategy, Communication, Builder Enablement, Enablement Planning, Governance & Support, Adoption Strategy, or Value Proof.
- The V1 catalog should stay curated to AIOM adoption motions rather than exposing every internal productivity resource.
- Template and asset additions should replace weaker duplicates when possible; do not add companion resources as separate cards unless they create a materially different AIOM action.
- Current non-duplicative asset set includes Self-Serve Training / LMS Module Outline, Status Report Template, Incentive Ideation Resource Pack, Platform Governance Follow-Up Pack, and Special Events Blueprint + Comms Bundle.
- If a direct Glean URL exists, the CTA should open the resource and prefill or copy client context where supported.
- Missing direct URLs must degrade to copyable prompt behavior so the AIOM still has an executable next step.
- Recommended assets should sit next to the Glean resource rather than appearing as a separate generic dashboard widget.

## V1 Watch Fields

These fields are lightweight in V1 but important to preserve before the model expands:

- decisionOwner: who has to decide or unblock the next motion.
- targetFunction: which function or audience the motion is primarily serving.
- confidenceReason: why the artifact trusts or does not trust the recommendation.
- actionOutcome: whether the prior recommended action worked, stalled, or needs follow-up.
- primaryFrictionType: the main adoption friction, such as stakeholder, enablement, governance, technical, value, or scope friction.
- packageEntitlements: what the customer actually bought and what support is in scope.
- supportingSources: the concrete sources behind the recommendation.

## Software Source Taxonomy

The artifact should represent source systems by job, not just by connector name.

## Aggregation Status Layer

The V1 artifact must show source coverage as seeded aggregation status, not as live connector truth. Each verified account should expose `sourceCoverageStatus` by required source category and a `missingSources` list that is visible to the AIOM.

Required source categories:

- Salesforce
- AIOM Staffing Sheet
- Rocketlane
- Sigma
- Slack
- Gong/meetings
- Docs/Drive
- Prism

Each source category should include:

- status: available, missing, needs verification, or provisional.
- reason: a human-readable explanation of why the status is trusted, missing, or provisional.
- sources: supporting seeded source names, such as a Slack channel, Staffing Sheet, Salesforce-style row, recommended doc, meeting notes, or Prism view.

Behavior:

- Missing sources should be visible in the source registry, not hidden inside JSON.
- The recommendation should show a confidence reason near the next-best-action copy.
- Pending or manually added accounts should show provisional status for roster and ownership sources, then missing status for categories that have not aggregated yet.
- Seeded data must be labeled as seeded aggregation status so the artifact does not imply live data.

### Systems Of Record

These systems define account identity, package reality, adoption metrics, and blockers.

- Salesforce: account identity, ownership, ARR or TCV, package, renewal, segment, and account context.
- Rocketlane: project state, hours remaining, hours used, package capacity, and milestone status.
- Sigma or adoption dashboards: WAU, MAU, seat activation, adoption score, usage trend, stickiness, and agent usage.
- Support or Zendesk: open issues, escalations, technical blockers, and unresolved support friction.

### Workstream Context

These systems explain what happened, what was promised, and who is engaged.

- Slack: internal and external account channels, rollout updates, stakeholder responsiveness, and coordination context.
- Email or Gmail: sponsor responsiveness, formal follow-ups, quiet stakeholder signals, and client commitments.
- Calendar, Zoom, Gong, or meeting notes: scheduled sessions, attendance, call themes, blockers, decisions, sentiment, and follow-ups.
- Google Drive, Docs, Slides, or Sheets: success plans, kickoff decks, adoption plans, templates, trackers, and client-ready deliverables.

### Glean-Native Intelligence And Action

These systems make the artifact useful inside Glean.

- Prism: derived account context, historical patterns, account signals, and prior actions.
- Account Memory: AIOM-reviewed client context, outcome evidence, remaining blockers, owner/date commitments, what worked, what did not work, and recommended follow-up.
- Glean Search: internal research across account context, Adoption OS resources, and supporting assets.
- Glean Assistant: account question answering and assisted synthesis.
- Glean Agents and Skills: action layer for transition briefs, adoption strategy, enablement planning, change briefs, prompt/workflow support, and EBR generation.
- Glean Artifacts: the in-product operating surface where AIOMs review, decide, act, and capture.

### Future Enrichment

- AI Fluency: Q2/Q3 enrichment for function-level capability, confidence, behavior change, leadership reinforcement, and capability growth.

## V1 Strategic Motions

- Align: outcomes, stakeholders, scope, success criteria, executive pull.
- Activate: launch readiness, training, comms, user enablement.
- Embed: workflow workshops, use-case adoption, habit formation.
- Expand: champions, power users, function-level scaling, agent programs.
- Govern: agent governance, operating model, admin ownership, COE setup.
- Prove Value: EBR, success plan, impact story, renewal or expansion narrative.

## AI Fluency Placeholder

AI Fluency is a Q2/Q3 enrichment layer and is not required for V1. When available, it should improve the historical and strategic action layers with function-level signals for confidence, usage quality, behavior change, leadership reinforcement, and capability growth.

## V1 Boundary

For this week, seeded data is acceptable if it is explicit and explainable. Live data should only be added after each source has a defined field list, refresh cadence, permission model, empty-state behavior, and confidence indicator.
