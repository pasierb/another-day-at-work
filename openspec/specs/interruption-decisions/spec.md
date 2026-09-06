# Interruption Decisions Specification

## Purpose

Provide the first complete interruption decision loop through typed event content, visible active alerts, paused trade-off decisions, and deterministic immediate consequences.

## Requirements

### Requirement: Interruption content defines testable immediate decisions
The game SHALL represent each interruption as content data containing a stable identifier, category, severity, concise copy, activation time, optional declarative eligibility metadata, and at least two choices whose labels, descriptions, game-time costs, resource effects, Focus effects, and stable outcome identities can be inspected without constructing the workstation scene.

#### Scenario: Content is loaded
- **WHEN** the interruption definitions are read
- **THEN** each definition exposes all alert, eligibility, and choice data without requiring category-specific behavior embedded in presentation code

#### Scenario: Invalid content is supplied
- **WHEN** an interruption lacks a stable identity, alert metadata, two resolvable choices, or contains malformed eligibility or outcome metadata
- **THEN** the invalid definition is rejected before it can become active

#### Scenario: A choice resolves
- **WHEN** the player resolves an interruption choice
- **THEN** the stable event and choice outcome identities become available to later eligibility evaluation without coupling content to presentation state

### Requirement: The vertical slice provides three representative interruption definitions
The game SHALL provide one Product Owner request, one production issue, and one teammate request as scheduler-eligible content, and each event SHALL offer at least two immediate trade-off choices.

#### Scenario: A fresh scheduled run begins
- **WHEN** the workstation initializes its representative interruption content
- **THEN** the Product Owner, production, and teammate sample definitions are eligible for seeded activation rather than all starting active

#### Scenario: Sample choices are inspected
- **WHEN** the player opens any activated sample event
- **THEN** its choices communicate distinct immediate costs and benefits using game time, bounded resources, or Focus

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

### Requirement: Active alerts communicate current interruption state
The alerts region SHALL display every unresolved representative interruption with its category, severity, age in game time, and concise copy, and SHALL allow an unresolved alert to open its decision.

#### Scenario: Game time advances with unresolved alerts
- **WHEN** an active interruption remains unresolved while the workday clock advances
- **THEN** its displayed age advances from its activation game time

#### Scenario: Workday time is paused
- **WHEN** the workday is paused while an interruption remains active
- **THEN** the interruption's age remains unchanged

#### Scenario: An alert is selected
- **WHEN** the player activates an unresolved alert while no other decision is open
- **THEN** that alert's decision is presented

### Requirement: A decision exclusively pauses active play
The game SHALL present at most one decision at a time, SHALL pause passive workday advancement and coding while it is open, and SHALL not allow dismissal without resolving a choice.

#### Scenario: A decision opens during coding
- **WHEN** the player opens an interruption while coding input is active
- **THEN** coding stops, passive workday advancement pauses, and the selected event's copy and choices are shown

#### Scenario: Another alert is activated behind the decision
- **WHEN** the player attempts to activate another alert while a decision is already open
- **THEN** the original decision remains the sole active decision

#### Scenario: The player attempts to dismiss the decision
- **WHEN** the player uses a generic close or cancel action without selecting a choice
- **THEN** the decision remains open and the event remains unresolved

### Requirement: A selected choice resolves exactly once
The game SHALL apply one selected choice's declared game-time, resource, and Focus effects, remove its interruption from the active alerts, and release only the decision-owned pause exactly once.

#### Scenario: A choice is selected
- **WHEN** the player activates an available choice for the open interruption
- **THEN** its declared effects are applied, the event is marked resolved and removed, and the decision overlay closes

#### Scenario: A choice activation is repeated
- **WHEN** repeated input attempts to activate a choice after its event has begun or completed resolution
- **THEN** no effect is applied more than once and no second resolution is recorded

#### Scenario: Another pause reason is active
- **WHEN** a decision resolves while an unrelated pause reason remains active
- **THEN** the decision-owned pause is released but the workday remains paused

#### Scenario: Play resumes after resolution
- **WHEN** the decision-owned pause was the final pause reason and the workday has not ended
- **THEN** passive time may advance again, but coding remains stopped until the player performs a fresh coding press

### Requirement: Interruption choices support future consequences
The game SHALL allow interruption choice content to declare validated immediate, delayed, and probabilistic effects that can be inspected without constructing the workstation scene, and the decision SHALL become resolved before any deadlines crossed by its action time are processed.

#### Scenario: A choice declares future effects
- **WHEN** interruption content is loaded with a delayed or probabilistic effect
- **THEN** its timing, probability branches, nested effects, feedback, and Technical Debt modifiers are available as typed content data

#### Scenario: Choice action time crosses a consequence deadline
- **WHEN** resolving a choice advances game time beyond an already queued consequence deadline
- **THEN** the selected interruption resolves exactly once before the crossed consequence is processed

### Requirement: The representative production decision covers four response patterns
The representative production interruption SHALL provide distinct Hotfix, Investigate Properly, Rollback, and Ignore choices whose displayed previews distinguish certain immediate costs from uncertain future outcomes.

#### Scenario: Production choices are inspected
- **WHEN** the representative production decision is opened
- **THEN** all four response patterns are available with accurate time, resource, Focus, debt, and uncertainty previews

#### Scenario: Rollback is selected
- **WHEN** the player chooses Rollback
- **THEN** the configured safer immediate stability recovery and bounded current-task progress loss are applied without creating hotfix debt

#### Scenario: Ignore is selected
- **WHEN** the player chooses Ignore in the decision
- **THEN** the configured immediate cost or future incident risk is applied once and the decision resolves normally

### Requirement: Interruption content describes incident control and coding disruption
The game SHALL allow interruption definitions and effects to declare whether an incident is external or player-fixable, and to declare a validated time-bounded coding block or slowdown whose certain behavior can be previewed without constructing the workstation scene.

#### Scenario: Incident metadata is inspected
- **WHEN** production or tooling content is loaded
- **THEN** its control classification and any coding disruption amount and duration are available as typed presentation-independent data

#### Scenario: Invalid incident metadata is supplied
- **WHEN** content contains an unsupported control classification, non-finite disruption value, value outside its bounds, non-positive duration, or misleading certain-outcome preview
- **THEN** the definition is rejected before it can become active

#### Scenario: An uncertain outcome is inspected
- **WHEN** a choice includes a probabilistic or delayed effect
- **THEN** presentation data distinguishes the uncertain outcome from its certain immediate costs

### Requirement: Interruption content supports personal and consequence context
The game SHALL recognize personal and consequence interruption categories and SHALL allow definitions to declare validated need-stage, booster-count, incident-history, and concluded-consequence eligibility facts without requiring a Phaser scene.

#### Scenario: Personal and consequence content is loaded
- **WHEN** valid personal and consequence definitions are inspected
- **THEN** their categories and eligibility facts are available as typed presentation-independent data

#### Scenario: Authoritative run context is created
- **WHEN** interruption eligibility is evaluated
- **THEN** the immutable context includes the current need stages, booster counts, resolved event choices, incident history, and concluded consequence identities required by the catalog

#### Scenario: Invalid contextual metadata is supplied
- **WHEN** a definition contains an unsupported category, unknown need or booster, invalid threshold or count, unknown referenced event or choice, or malformed consequence cause
- **THEN** the definition is rejected before activation
