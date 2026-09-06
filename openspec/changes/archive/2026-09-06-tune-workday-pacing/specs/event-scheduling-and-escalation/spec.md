## ADDED Requirements

### Requirement: Scheduling responds to the active pacing band
The game SHALL select spawn intervals, category weight modifiers, and escalation-pressure modifiers from the pacing band active at the relevant authoritative game-time deadline, and SHALL apply all modifiers within validated bounds before seeded selection or escalation.

#### Scenario: Morning scheduling is evaluated
- **WHEN** a spawn opportunity occurs in the configured morning band
- **THEN** the scheduler uses that band's spawn interval and category weights for the seeded selection

#### Scenario: A deadline crosses into a new band
- **WHEN** a spawn or escalation deadline is evaluated after authoritative time has entered another pacing band
- **THEN** the transition uses the new band's configuration without changing the identity or original ordering of already queued events

#### Scenario: Category pressure varies by band
- **WHEN** otherwise equivalent eligible catalogs are evaluated in two bands with different category modifiers
- **THEN** only the declared categories receive their bounded band-specific weight changes

#### Scenario: Escalation pressure increases
- **WHEN** an unresolved event is evaluated in a band with an escalation-pressure modifier
- **THEN** its remaining content-defined escalation timing changes by the declared bounded rule without skipping, repeating, or reordering stages

### Requirement: Scheduler guardrails are deterministic and capacity-safe
The scheduler SHALL apply configured flood and quiet-period guardrails using authoritative game time and stable ordering, without exceeding active capacity, discarding due events, or consuming undocumented random draws.

#### Scenario: Flood protection activates
- **WHEN** configured active-plus-pending pressure reaches its flood threshold
- **THEN** later ordinary spawn opportunities are deferred or suppressed according to configuration while existing active and pending events retain their identities and order

#### Scenario: A quiet-period deadline is reached
- **WHEN** the configured maximum quiet duration expires and at least one event is eligible
- **THEN** a spawn opportunity occurs using the normal seeded eligibility and weighting pipeline

#### Scenario: No event is eligible at the quiet deadline
- **WHEN** a quiet-period deadline is reached but all definitions are ineligible or have zero weight
- **THEN** no invalid event is forced and the next guardrail evaluation remains deterministic

#### Scenario: Scheduling is paused
- **WHEN** a decision or run pause prevents authoritative game time from advancing
- **THEN** flood and quiet-period guardrail durations do not advance

