# Event Scheduling and Escalation

## Purpose
Schedule, age, escalate, and page sticky decisions against authoritative game time.

## Requirements

### Requirement: Eligible events spawn deterministically
The scheduler SHALL use seeded deterministic timing and declarative eligibility, including case status.

#### Scenario: A candidate becomes due
- **WHEN** its time and eligibility conditions are satisfied
- **THEN** it activates exactly once as a sticky

### Requirement: Ineligible candidates cannot block the queue
The scheduler SHALL discard queued candidates that no longer match current run context.

#### Scenario: A case opener remains queued after its case terminates
- **WHEN** scheduling synchronizes
- **THEN** the obsolete opener is cancelled and later eligible stickies may activate

### Requirement: Active stickies age continuously
Sticky aging and escalation SHALL continue during ordinary play and stop only for explicit lifecycle pauses or collapse.

#### Scenario: An unresolved sticky crosses its escalation boundary
- **WHEN** authoritative time reaches that boundary
- **THEN** its configured escalation occurs once while paging and backlog remain usable

