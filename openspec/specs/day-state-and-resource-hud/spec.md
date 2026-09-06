# Day State and Resource HUD Specification

## Purpose

Provide one observable, deterministic source of truth for a workday's clock and bounded resources, and keep their workstation displays synchronized with it.

## Requirements

### Requirement: A fresh workday has a deterministic initial state
The game SHALL create a fresh workday at 09:00 with Stamina, PO Happiness, System Stability, and Technical Debt set to documented configured initial values.

#### Scenario: A new run begins
- **WHEN** a fresh workday is created with the default configuration
- **THEN** the clock reads 09:00, the day is running, Stamina is 75, PO Happiness is 75, System Stability is 75, and Technical Debt is 0

#### Scenario: A run is reset
- **WHEN** a workday containing changed time, resources, or pause state is reset
- **THEN** all time and resource values return to their configured initial values and the workday returns to its configured initial running state

### Requirement: Workday time advances deterministically
The game SHALL advance workday time from 09:00 toward 17:00 according to one configurable conversion between elapsed real time and elapsed game time, and SHALL clamp the clock at 17:00.

#### Scenario: Running time advances
- **WHEN** a running workday receives a positive elapsed-time update
- **THEN** its game time advances by the elapsed time multiplied by the configured time scale

#### Scenario: A large update crosses the end of the day
- **WHEN** an elapsed-time update would advance the clock beyond 17:00
- **THEN** the clock becomes exactly 17:00 and subsequent updates do not advance it further

#### Scenario: Equal updates produce equal results
- **WHEN** two fresh workdays use the same configuration and receive the same sequence of elapsed-time updates
- **THEN** they expose the same resulting time and day progress

### Requirement: Workday time can be paused safely
The game SHALL support independently identified pause reasons and SHALL advance time only when no pause reason remains active.

#### Scenario: A paused workday receives an update
- **WHEN** at least one pause reason is active and elapsed time is updated
- **THEN** the workday time and day progress remain unchanged

#### Scenario: One of multiple pauses is released
- **WHEN** multiple pause reasons are active and only one is resumed
- **THEN** the workday remains paused

#### Scenario: The final pause is released
- **WHEN** the last active pause reason is resumed and the workday has not reached 17:00
- **THEN** later elapsed-time updates advance the workday again

### Requirement: Resource mutations remain within their bounds
The game SHALL expose typed mutations for Stamina, PO Happiness, System Stability, and Technical Debt and SHALL constrain every resource to the inclusive range from 0 to 100.

#### Scenario: A resource changes within its bounds
- **WHEN** a resource receives a mutation whose result is between 0 and 100
- **THEN** the full mutation is applied to that resource without changing the other resources

#### Scenario: A resource would exceed its maximum
- **WHEN** a resource mutation would produce a value greater than 100
- **THEN** that resource becomes exactly 100

#### Scenario: A resource would fall below its minimum
- **WHEN** a resource mutation would produce a value less than 0
- **THEN** that resource becomes exactly 0

### Requirement: State changes are observable without requiring a scene
The workday state SHALL notify registered observers after an effective time, resource, pause, resume, or reset change, and SHALL allow observers to unsubscribe.

#### Scenario: A resource mutation changes state
- **WHEN** a registered observer is present and a resource value changes
- **THEN** the observer receives the updated workday snapshot immediately

#### Scenario: A clamped mutation has no effect
- **WHEN** a mutation leaves a resource unchanged because it is already at the applicable bound
- **THEN** observers are not notified of a false state change

#### Scenario: An observer unsubscribes
- **WHEN** an observer unsubscribes and the workday later changes
- **THEN** that observer receives no further notifications

### Requirement: The workstation presents current workday state
The workstation SHALL display the current time, day progress, Stamina, PO Happiness, System Stability, and Technical Debt from the authoritative workday state.

#### Scenario: The workstation first appears
- **WHEN** the Workstation scene is ready with a fresh default workday
- **THEN** its clock, day progress, and four resource displays match the fresh workday snapshot

#### Scenario: A resource changes
- **WHEN** an observed resource value changes
- **THEN** the corresponding label, numeric value, and meter update without changing an unrelated resource display

#### Scenario: Workday time advances
- **WHEN** observed workday time advances
- **THEN** the clock and day-progress display update to represent the same current game time

#### Scenario: Technical Debt is displayed
- **WHEN** the workstation presents the current workday state
- **THEN** Technical Debt remains visually separate from the three primary resource meters

#### Scenario: The scene ends
- **WHEN** the Workstation scene shuts down
- **THEN** it stops observing and advancing that scene's workday state

### Requirement: Gameplay actions can spend workday time
The game SHALL provide an explicit action-time mutation that advances the workday by a non-negative amount of game time independently of passive elapsed-real-time updates and SHALL clamp the result at 17:00.

#### Scenario: An action spends time during a decision pause
- **WHEN** a choice spends a positive number of game minutes while its decision pause is active
- **THEN** the workday clock advances by that game-time cost and the decision pause remains active

#### Scenario: An action cost crosses the end of the day
- **WHEN** an action's game-time cost would move the clock beyond 17:00
- **THEN** the clock becomes exactly 17:00 and day progress becomes complete

#### Scenario: An invalid action-time cost is supplied
- **WHEN** an action-time mutation receives a negative or non-finite amount
- **THEN** the mutation is rejected without changing workday time
