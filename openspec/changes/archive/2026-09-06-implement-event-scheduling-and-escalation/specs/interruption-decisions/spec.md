## MODIFIED Requirements

### Requirement: The vertical slice provides three representative interruption definitions
The game SHALL provide one Product Owner request, one production issue, and one teammate request as scheduler-eligible content, and each event SHALL offer at least two immediate trade-off choices.

#### Scenario: A fresh scheduled run begins
- **WHEN** the workstation initializes its representative interruption content
- **THEN** the Product Owner, production, and teammate sample definitions are eligible for seeded activation rather than all starting active

#### Scenario: Sample choices are inspected
- **WHEN** the player opens any activated sample event
- **THEN** its choices communicate distinct immediate costs and benefits using game time, bounded resources, or Focus

## ADDED Requirements

### Requirement: Active interruptions support explicit deferral
The game SHALL allow an active interruption that is not being decided or resolved to be postponed or ignored without opening its decision modal.

#### Scenario: The player postpones an alert
- **WHEN** the player postpones an eligible active interruption
- **THEN** it remains at its current stage and its next escalation deadline moves later by the content-defined postponement duration

#### Scenario: The player ignores an alert
- **WHEN** the player ignores an eligible active interruption that has another stage
- **THEN** it immediately enters its next stage and applies that stage's declared effects once

#### Scenario: Deferral targets an ineligible alert
- **WHEN** postpone or ignore targets a missing, deciding, resolving, resolved, or final-stage interruption
- **THEN** the command makes no state change and applies no effect

