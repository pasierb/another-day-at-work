## Why

The interruption systems currently replay only three representative definitions, so the workday lacks the stakeholder and coworker dilemmas needed to test sustained attention pressure. Chunk 10 expands that proven system with a validated, state-aware Product Owner and team event pack while preserving later production, tooling, personal, and consequence content for their own roadmap chunks.

## What Changes

- Add approximately six Product Owner events and five Slack/team events covering status requests, small scope changes, estimates, junior help, QA findings, and review requests.
- Give every event multiple choices, escalation copy, and distinct, accurately previewed game-time, resource, Focus, task-progress, or Technical Debt trade-offs.
- Add declarative eligibility predicates based on task and prior-event state so events do not contradict completed work or resolved choices.
- Allow low PO Happiness to increase bounded Product Owner pressure without creating a self-sustaining or unstoppable event loop.
- Add catalog-level validation for missing choices, invalid effects, invalid escalation data, references, and malformed eligibility, with a deliberately malformed test fixture.
- Add at least one ignored teammate path that escalates into a public-channel consequence.
- Keep production, tooling, personal, and consequence event packs outside this change.

## Capabilities

### New Capabilities

- `po-and-team-event-content`: The Product Owner and team event catalog, its coverage and reachability, contextual eligibility, stakeholder-pressure behavior, escalation outcomes, and validation guarantees.

### Modified Capabilities

- `event-scheduling-and-escalation`: Event selection filters definitions against an immutable run-context snapshot and supports a bounded PO Happiness weight modifier without changing seeded replay or queued identities.
- `interruption-decisions`: Interruption definitions gain validated declarative eligibility metadata while remaining presentation-independent and resolvable through the existing decision lifecycle.

## Impact

- Expands interruption content under `src/game/content` and the definition/validation contracts under `src/game/domain`.
- Extends scheduler selection inputs and `Workstation` orchestration with run-context facts derived from authoritative task, resource, and interruption state.
- Adds scene-independent catalog, eligibility, weighting, and malformed-fixture tests plus focused browser playtesting for the expanded alerts and decision content.
- Introduces no external dependency, persistence, network integration, or code from roadmap Chunks 11–16.
