## Why

The current interruption catalog has broad Product Owner and teammate coverage but only one representative production incident and no tooling disruptions. Chunk 11 expands the proven scheduler and consequence systems with the production and tooling pressure needed to make System Stability, task progress, and Technical Debt matter across a full workday.

## What Changes

- Add approximately six production events and four tooling events covering escalating errors, latency, failed deployment, database pressure, GitHub/CI outage, AI assistant failure, and local environment trouble.
- Provide context-appropriate rollback, risky fast fix, proper investigation, wait, retry, and ignore choices with distinct time, resource, Focus, task-progress, debt, delayed, or probabilistic trade-offs.
- Connect elevated Technical Debt to explicitly selected production event likelihood or severity while preserving seeded scheduling and one-time escalation behavior.
- Distinguish external outages from player-fixable incidents so choices and recovery behavior accurately represent what the player can control.
- Ensure tool disruptions slow or block coding only for their declared game-time duration, then recover exactly once without leaking state across pause, restart, or scene shutdown.
- Validate pack totals, topic coverage, reachability, effect previews, uncertainty labels, escalation chains, and malformed content before scheduling.
- Keep personal/consequence packs, final pacing, endings, presentation polish, and hardening outside this change.

## Capabilities

### New Capabilities

- `production-and-tooling-event-content`: The production and tooling event catalog, incident and outage classification, content coverage, recovery behavior, debt-sensitive pressure, escalation chains, accurate choice previews, and validation guarantees.

### Modified Capabilities

- `interruption-decisions`: Interruption content distinguishes player-fixable incidents from external outages and exposes validated coding-disruption and uncertainty metadata for accurate decision previews.
- `event-scheduling-and-escalation`: Selected production definitions may apply bounded Technical Debt modifiers to event likelihood or authored escalation severity without changing deterministic scheduling, pause behavior, or queued identities.
- `hold-to-code-loop`: Time-bounded tooling disruptions can block or slow coding through a presentation-independent run modifier and recover cleanly at an authoritative game-time deadline.

## Impact

- Expands content under `src/game/content` and extends the interruption/effect validation contracts under `src/game/domain`.
- Adds a small run-scoped coding-disruption model integrated with `CodingSession`, authoritative game time, and `Workstation` orchestration.
- Reuses the existing effect engine, consequence queue, seeded scheduler, task queue, alert lifecycle, and decision presentation rather than adding service-specific scene conditionals.
- Adds scene-independent catalog, debt, disruption, escalation, and malformed-fixture tests plus focused browser playtesting for production/tooling choices and recovery.
- Introduces no real network/service integration, external dependency, persistence, or roadmap scope from Chunks 12–16.
