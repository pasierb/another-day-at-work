## Purpose

Complete the MVP interruption catalog with validated personal pressures and cause-linked comedic consequences while keeping every definition reachable, bounded, and suitable for deterministic playtests.

## ADDED Requirements

### Requirement: The catalog supplies the MVP personal and consequence packs
The game SHALL provide approximately four personal events and five consequence events, and every definition SHALL be reachable under at least one documented valid run context.

#### Scenario: The complete catalog is loaded
- **WHEN** the assembled MVP interruption catalog is validated
- **THEN** it contains between 25 and 30 definitions inclusive, including four personal and five consequence definitions

#### Scenario: Required subjects are audited
- **WHEN** the personal and consequence definitions are inspected
- **THEN** they collectively cover sleep warnings, bathroom urgency, coffee crashes, shortcut regressions, repeated incidents, and accidental mistakes

#### Scenario: Reachability is audited
- **WHEN** each new definition is evaluated across its documented run contexts
- **THEN** every definition is eligible in at least one context and no definition is permanently unreachable

### Requirement: Personal events follow authoritative needs and booster state
Personal event eligibility SHALL derive from current authoritative need stages, booster-use history, or other explicitly declared run state and SHALL not depend on presentation state or wall-clock time.

#### Scenario: A need reaches a warning stage
- **WHEN** sleepiness or toilet need enters the stage declared by a matching personal event
- **THEN** that event becomes eligible for seeded scheduling

#### Scenario: A need is below a warning stage
- **WHEN** the underlying need does not satisfy a personal event's declared threshold
- **THEN** that event is ineligible

#### Scenario: Coffee use creates personal pressure
- **WHEN** the run's coffee-use count satisfies a coffee-related event's declared condition
- **THEN** the event becomes eligible without changing unrelated event eligibility

### Requirement: Consequence events are traceable to a cause
Every consequence event SHALL declare an eligibility cause based on a prior resolved event choice, a concluded consequence, repeated incident history, or current authoritative state, and SHALL expose that cause for validation and debug inspection.

#### Scenario: A shortcut regression becomes eligible
- **WHEN** the player previously selected the shortcut choice declared by a regression event
- **THEN** that consequence event is eligible and identifies the originating event and choice

#### Scenario: A required cause is absent
- **WHEN** a consequence event's declared prior action or state has not occurred
- **THEN** the event remains ineligible

#### Scenario: A repeated incident is traced
- **WHEN** the configured incident-history condition is met
- **THEN** its repeat consequence identifies the relevant incident history rather than appearing as an unrelated random event

### Requirement: Equivalent warnings are deduplicated and cooled down
The catalog SHALL assign equivalent warnings a stable deduplication key and SHALL support bounded game-time cooldowns so active or recently handled equivalents cannot be scheduled repeatedly.

#### Scenario: An equivalent warning is active
- **WHEN** a scheduling attempt evaluates a definition whose deduplication key matches an active interruption
- **THEN** the candidate is rejected without creating a second equivalent warning

#### Scenario: A warning is inside its cooldown
- **WHEN** a handled definition or equivalent warning is evaluated before its game-time cooldown deadline
- **THEN** it remains ineligible

#### Scenario: A cooldown expires while the cause remains
- **WHEN** authoritative game time reaches the cooldown deadline and the event's other eligibility conditions still hold
- **THEN** the definition may become eligible again through the normal seeded scheduler

### Requirement: The combined catalog resists invalid and repetitive content
Catalog validation SHALL reject invalid category totals, unreachable definitions, untraceable consequences, conflicting deduplication metadata, and events whose choices repeat equivalent trade-off patterns without meaningful distinction.

#### Scenario: A malformed personal or consequence fixture is loaded
- **WHEN** a definition has no reachable context, a missing consequence cause, invalid cooldown metadata, or equivalent choices
- **THEN** validation fails before the definition can be scheduled

#### Scenario: The complete catalog is audited
- **WHEN** the assembled MVP catalog is validated
- **THEN** its category totals, reachability, consequence causes, deduplication keys, and choice-pattern diversity all pass

### Requirement: A seeded accelerated run can exercise every category
The game SHALL provide deterministic accelerated-run coverage that can encounter content from every MVP category without validation failures, duplicate resolution, or runtime errors.

#### Scenario: An accelerated catalog run is replayed
- **WHEN** two fresh runs use the same content, seed, run-state transitions, and game-time updates
- **THEN** they encounter the same ordered eligible events and outcomes

#### Scenario: Cross-category coverage is exercised
- **WHEN** the documented seeded accelerated-run fixture progresses through its configured state transitions
- **THEN** it encounters at least one Product Owner, teammate, production, tooling, personal, and consequence event without errors

