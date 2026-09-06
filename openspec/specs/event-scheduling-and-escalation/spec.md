# Event Scheduling and Escalation Specification

## Purpose

Make interruptions arrive and worsen predictably over authoritative game time while remaining reproducible, capacity-bound, and safely paused during decisions.

## Requirements

### Requirement: Event scheduling is seeded and configurable
The game SHALL filter interruption definitions against an immutable snapshot of authoritative run context before each selection, SHALL schedule only eligible definitions using a supplied seed and configurable spawn intervals, and SHALL apply only declared bounded resource-based weight modifiers with no dependency on wall-clock time.

#### Scenario: Identical runs use the same seed
- **WHEN** two fresh runs use the same definitions, configuration, seed, run-context snapshots, resource values at each draw, and sequence of game-time updates
- **THEN** they produce the same ordered sequence of scheduled interruptions and spawn times

#### Scenario: Different update sizes cover the same game time
- **WHEN** two runs with the same seed and equivalent run-context history reach the same game time through different update increments
- **THEN** they expose the same scheduled interruption state

#### Scenario: A run is reset
- **WHEN** the scheduler is reset with its original seed and configuration
- **THEN** its pending work and random sequence return to the fresh-run state

#### Scenario: A definition conflicts with current run context
- **WHEN** an interruption's declarative eligibility predicate does not match the current task state or prior event-choice history
- **THEN** that definition is excluded from the current seeded selection without becoming active or queued

#### Scenario: No definitions are currently eligible
- **WHEN** a spawn deadline is evaluated and every definition is ineligible or has zero effective weight
- **THEN** no interruption is selected and the scheduler remains able to evaluate a later spawn opportunity

#### Scenario: An eligible weight responds to PO Happiness
- **WHEN** a definition declares a PO Happiness weight modifier and a selection occurs with a matching resource value
- **THEN** its effective weight changes by the declared bounded amount before the seeded draw

### Requirement: Scheduled activity follows game time and pause state
The game SHALL evaluate spawning and escalation against elapsed game time, SHALL perform no scheduler transition while active play is paused, and SHALL stop creating transitions once the workday is complete.

#### Scenario: Passive time is paused
- **WHEN** the run or decision layer is paused and scene updates continue
- **THEN** no interruption spawns or escalates

#### Scenario: A decision spends action time
- **WHEN** resolving a decision advances game time beyond one or more due deadlines
- **THEN** the open decision resolves before due scheduler transitions are processed in chronological order

#### Scenario: The workday ends
- **WHEN** elapsed game time reaches the configured end of day
- **THEN** no later spawn, escalation, or follow-up transition is activated

### Requirement: Active-event capacity is deterministic
The game SHALL enforce a positive configurable active-event limit and retain due events in a deterministic pending order when no active slot is available.

#### Scenario: The active queue is full
- **WHEN** an event becomes due while the active-event limit has been reached
- **THEN** the due event remains pending and no active event is displaced

#### Scenario: Capacity becomes available
- **WHEN** an active interruption resolves and one or more due events are pending
- **THEN** the earliest pending event activates first without performing another random selection

#### Scenario: Multiple events share a deadline
- **WHEN** multiple events become due at the same game time
- **THEN** their activation order is stable for the supplied seed and content order

### Requirement: Unresolved interruptions escalate through content-defined stages
An escalation-capable interruption SHALL define ordered stages with game-time deadlines, alert copy, severity, immediate effects, and optional follow-up identifiers, and each entered stage SHALL apply at most once.

#### Scenario: An interruption is left unattended
- **WHEN** its current escalation deadline is reached during active play
- **THEN** it enters the next configured stage at that deadline and exposes the stage's copy and severity

#### Scenario: Several stage deadlines are crossed
- **WHEN** one game-time update crosses multiple escalation deadlines
- **THEN** every crossed stage is entered once in chronological order and its declared immediate effects are emitted once

#### Scenario: The final stage is reached
- **WHEN** an interruption at its final configured stage remains unresolved
- **THEN** it stays at that stage without repeating its effects on later updates

#### Scenario: A stage requests a follow-up
- **WHEN** an entered escalation stage declares a valid follow-up event
- **THEN** that follow-up becomes due once and activates immediately or waits according to the active-event limit

### Requirement: Handling cancels future escalation
Resolving an interruption SHALL cancel all unentered escalation stages and follow-ups belonging to that interruption without affecting already active independent events.

#### Scenario: An event resolves before its deadline
- **WHEN** the player completes a choice for an escalating interruption
- **THEN** its future stages and unactivated follow-ups never occur

#### Scenario: Resolution races with a due deadline
- **WHEN** resolution and escalation are evaluated at the same game time
- **THEN** an already accepted resolution wins and the event does not escalate or emit stage effects

### Requirement: Alert presentation prioritizes urgency
The alerts area SHALL order unresolved interruptions by severity first and age second, while preserving deterministic order for equal values, and SHALL visually distinguish urgent alerts.

#### Scenario: An interruption becomes more severe
- **WHEN** escalation raises an active interruption's severity
- **THEN** the alerts area updates its copy and styling and reorders it according to the new urgency

#### Scenario: Alerts have equal severity and age
- **WHEN** two active alerts have equal severity and displayed age
- **THEN** their relative order remains stable across renders

### Requirement: Selected event weights respond deterministically to Technical Debt
The game SHALL support content-defined base event weights with optional bounded Technical Debt modifiers, SHALL evaluate them when selecting a new scheduled event, and SHALL preserve deterministic selection for identical seeds and state.

#### Scenario: Technical Debt changes a selected event weight
- **WHEN** an eligible event declares a debt weight modifier and event selection occurs at elevated Technical Debt
- **THEN** its effective selection weight changes by the declared bounded amount before the seeded draw

#### Scenario: An event has no debt weight modifier
- **WHEN** eligible content does not declare a Technical Debt weight modifier
- **THEN** its configured base weight is unchanged by Technical Debt

#### Scenario: Weighted schedules are replayed
- **WHEN** two fresh runs use identical event content, scheduler seed, Technical Debt values at each draw, and game-time updates
- **THEN** they produce the same ordered sequence of scheduled interruptions and spawn times

#### Scenario: Technical Debt changes after an event is queued
- **WHEN** Technical Debt changes after an interruption has already been scheduled, activated, or placed in the capacity backlog
- **THEN** that interruption retains its existing identity, due time, and ordering

### Requirement: Authored production escalation can respond to Technical Debt
The game SHALL allow a production escalation stage to declare a bounded Technical Debt severity modifier, SHALL evaluate it only when that stage is entered, and SHALL preserve all scheduling and escalation ordering for identical seeds, state, and time updates.

#### Scenario: A debt-sensitive stage is entered
- **WHEN** a production event enters a stage with a declared Technical Debt severity modifier
- **THEN** the stage's effective severity is derived from current Technical Debt and remains within the declared severity bounds

#### Scenario: Technical Debt changes before stage entry
- **WHEN** Technical Debt changes after event activation but before a debt-sensitive stage is entered
- **THEN** the stage uses the value at entry without changing the event identity, escalation deadline, or prior stages

#### Scenario: A stage has no debt modifier
- **WHEN** an escalation stage is entered without declared debt-sensitive severity behavior
- **THEN** Technical Debt does not change its authored severity

#### Scenario: The run is replayed
- **WHEN** two fresh runs use identical content, seed, Technical Debt history, pause history, and game-time updates
- **THEN** they produce the same effective production severities and ordered transitions

### Requirement: Scheduling respects deduplication and game-time cooldowns
The seeded scheduler SHALL exclude definitions whose stable deduplication key conflicts with an active event or whose bounded cooldown has not expired, using authoritative game time and current immutable run context.

#### Scenario: Two eligible warnings are equivalent
- **WHEN** one eligible definition has the same deduplication key as an active event
- **THEN** the scheduler excludes it without consuming an additional event activation or exceeding the active limit

#### Scenario: A handled warning remains on cooldown
- **WHEN** the scheduler evaluates the definition before its authoritative game-time cooldown deadline
- **THEN** it is excluded from weighted selection

#### Scenario: The run is paused
- **WHEN** scene updates occur while authoritative game time is paused
- **THEN** no event cooldown loses duration or becomes eligible

#### Scenario: Deterministic scheduling is replayed
- **WHEN** two runs use identical seeds, content, state history, active events, cooldown history, and game-time updates
- **THEN** they produce the same candidate filtering, event order, and spawn times
