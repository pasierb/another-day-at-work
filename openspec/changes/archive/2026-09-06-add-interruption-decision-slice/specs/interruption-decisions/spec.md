## Purpose

Provide the first complete interruption decision loop through typed event content, visible active alerts, paused trade-off decisions, and deterministic immediate consequences.

## ADDED Requirements

### Requirement: Interruption content defines testable immediate decisions
The game SHALL represent each interruption as content data containing a stable identifier, category, severity, concise copy, activation time, and at least two choices whose labels, descriptions, game-time costs, resource effects, and Focus effects can be inspected without constructing the workstation scene.

#### Scenario: Content is loaded
- **WHEN** the representative interruption definitions are read
- **THEN** each definition exposes all alert and choice data without requiring category-specific behavior embedded in presentation code

#### Scenario: Invalid content is supplied
- **WHEN** an interruption lacks a stable identity, alert metadata, or two resolvable choices
- **THEN** the invalid definition is rejected before it can become active

### Requirement: The vertical slice starts with three representative interruptions
The game SHALL make one Product Owner request, one production issue, and one teammate request active without random scheduling, and each event SHALL offer at least two immediate trade-off choices.

#### Scenario: A fresh vertical-slice run begins
- **WHEN** the workstation initializes its representative interruption content
- **THEN** exactly the Product Owner, production, and teammate sample events are available as active alerts

#### Scenario: Sample choices are inspected
- **WHEN** the player opens any sample event
- **THEN** its choices communicate distinct immediate costs and benefits using game time, bounded resources, or Focus

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

