## Why

The current catalog covers stakeholder, teammate, production, and tooling pressure, but it does not yet turn the player's needs, booster use, and earlier shortcuts into the personal warnings and comedic payoffs required to reach the MVP's 25–30-event target. This change completes that content layer before the later pacing pass, while keeping eligibility and validation deterministic enough to balance safely.

## What Changes

- Add approximately four personal events covering sleepiness, bathroom urgency, coffee-related pressure, and accidental mistakes.
- Add approximately five consequence events covering coffee crashes, shortcut regressions, and repeated incidents, with every consequence traceable to prior choices or current run state.
- Extend interruption content and run context with validated need, booster-use, and prior-action eligibility facts needed to gate the new events.
- Add run-scoped cooldown and deduplication behavior so equivalent warnings do not stack and resolved needs suppress stale warnings.
- Audit the assembled catalog for a total of 25–30 reachable events, category coverage, traceability, and non-repetitive choice patterns.
- Add seeded accelerated-run coverage proving every category can be encountered without validation or runtime errors.
- Keep exact copy, numeric effects, cooldown durations, and thresholds data-driven for the later pacing and balance pass.
- Do not add events beyond the MVP count or pull forward workday pacing, endings, presentation polish, or post-MVP needs and inventory.

## Capabilities

### New Capabilities

- `personal-and-consequence-event-content`: Defines the personal and consequence packs, catalog-wide totals and audits, traceability, suppression, and seeded cross-category coverage.

### Modified Capabilities

- `interruption-decisions`: Adds personal and consequence categories plus typed, presentation-independent eligibility metadata for needs, booster use, and prior run actions.
- `event-scheduling-and-escalation`: Filters equivalent active warnings and cooldown-limited definitions against the current authoritative run context without compromising seeded scheduling.
- `player-needs`: Connects threshold warnings to interruption eligibility and ensures relief immediately makes the corresponding warning ineligible.
- `delayed-consequences-and-tech-debt`: Makes content-facing consequence events traceable to the prior decision or current state that caused them.

## Impact

- Affects interruption types and validation, run-context construction, seeded scheduling/filtering, needs and booster snapshots, catalog assembly, and workstation integration.
- Adds personal/consequence content modules and catalog audit/simulation tests; existing PO/team and production/tooling definitions remain compatible.
- No new runtime dependencies, persistence, network integration, or Phaser-specific content conditionals are introduced.
