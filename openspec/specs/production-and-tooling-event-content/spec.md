# production-and-tooling-event-content Specification

## Purpose
Provide a varied, validated production and tooling interruption pack whose incidents, outages, debt pressure, and temporary coding disruptions create accurate and recoverable engineering trade-offs.

## Requirements

### Requirement: The catalog supplies the MVP production and tooling event pack
The game SHALL provide approximately six production events and four tooling events, counting the expanded representative production event, and every definition SHALL be reachable under at least one valid run context.

#### Scenario: The complete pack is loaded
- **WHEN** the MVP interruption catalog is validated
- **THEN** it contains six production definitions and four tooling definitions without counting Product Owner, teammate, personal, or consequence-pack events

#### Scenario: Event topics are audited
- **WHEN** the production and tooling definitions are inspected
- **THEN** the pack collectively covers escalating error rates, latency, failed deployment, database pressure, GitHub or CI outage, AI assistant failure, and local environment trouble

#### Scenario: Reachability is audited
- **WHEN** each definition is evaluated across its documented eligible run contexts
- **THEN** every definition is eligible in at least one context and no definition is permanently unreachable

### Requirement: Production incidents can escalate from warning to outage
At least one production event SHALL progress through content-defined warning, degradation, and outage states with increasing severity, changed copy, and one-time effects.

#### Scenario: An incident is left unattended
- **WHEN** the configured production chain crosses all of its escalation deadlines during active game time
- **THEN** it progresses from warning through degradation to outage in order and applies each stage effect exactly once

#### Scenario: An incident is handled before outage
- **WHEN** the player resolves the production event before a later escalation deadline
- **THEN** its unentered outage stages and follow-ups never occur

### Requirement: Production pressure responds selectively to Technical Debt
Selected production definitions SHALL declare bounded Technical Debt modifiers for scheduling likelihood or authored escalation severity, while definitions without such declarations SHALL remain unchanged.

#### Scenario: Technical Debt is elevated
- **WHEN** a seeded selection or escalation evaluates a production definition with a declared debt modifier
- **THEN** its effective likelihood or severity changes by the declared bounded amount

#### Scenario: A production definition has no debt modifier
- **WHEN** Technical Debt changes for an event without declared debt-sensitive behavior
- **THEN** that event's weight, severity, identity, timing, and ordering remain unchanged

#### Scenario: Technical Debt changes after scheduling
- **WHEN** Technical Debt changes after a production event has already been queued or activated
- **THEN** its selected identity and due time remain stable and only a later explicitly declared escalation evaluation can use the new debt value

### Requirement: Tool disruptions are temporary and recoverable
Tooling events SHALL declare any coding block or slowdown as a bounded game-time disruption and SHALL restore neutral coding behavior exactly once when the declared duration ends.

#### Scenario: A tool outage blocks coding
- **WHEN** a choice or escalation activates a zero-speed tooling disruption
- **THEN** coding produces no task progress for its declared game-time duration and the workstation explains the active block

#### Scenario: A tool issue slows coding
- **WHEN** a choice or escalation activates a partial-speed tooling disruption
- **THEN** coding progress uses the declared bounded modifier until its authoritative game-time deadline

#### Scenario: A disruption expires
- **WHEN** active game time reaches a tooling disruption's deadline
- **THEN** that disruption concludes once and coding returns to the remaining combined modifier or neutral speed without requiring a scene restart

#### Scenario: The run is paused
- **WHEN** scene updates continue while authoritative game time is paused
- **THEN** no tooling disruption loses duration or concludes

### Requirement: External outages remain distinct from player-fixable incidents
Every production and tooling definition SHALL declare whether the underlying problem is externally controlled or player-fixable, and its available choices SHALL respect that classification.

#### Scenario: An external service is unavailable
- **WHEN** the player opens a GitHub, CI-provider, or AI-assistant outage classified as external
- **THEN** its choices offer responses such as wait, retry, switch workflow, or ignore and do not guarantee that the player directly repairs the service

#### Scenario: A player-fixable incident is active
- **WHEN** the player opens a production or local-environment problem classified as player-fixable
- **THEN** its choices may offer rollback, risky fast fix, or proper investigation with their declared costs and outcomes

### Requirement: Choice previews distinguish certain and uncertain outcomes
Every production and tooling choice SHALL accurately preview its certain immediate game-time and effect costs, and SHALL label probabilistic or delayed outcomes as uncertain rather than guaranteed.

#### Scenario: A choice has only immediate effects
- **WHEN** the decision is presented
- **THEN** its preview matches the exact immediate time, resource, Focus, task-progress, debt, or disruption effects applied on selection

#### Scenario: A choice has a delayed or probabilistic effect
- **WHEN** the decision is presented
- **THEN** its preview identifies the future or uncertain risk without promising a particular result

### Requirement: The production and tooling catalog fails validation before play
The game SHALL reject pack content with invalid totals, missing required topics, duplicate or unreachable identities, invalid incident classification, missing choices, inaccurate preview metadata, invalid effects or disruption durations, or broken escalation references.

#### Scenario: A malformed fixture is loaded
- **WHEN** validation receives a fixture with an invalid classification, coding disruption, choice preview, effect, or escalation chain
- **THEN** validation reports failure before any event can be scheduled or activated

#### Scenario: The production catalog is loaded
- **WHEN** validation receives the complete production and tooling pack
- **THEN** validation succeeds and preserves all definitions as presentation-independent content data
