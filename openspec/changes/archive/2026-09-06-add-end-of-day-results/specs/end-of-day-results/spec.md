## Purpose

Conclude each workday with an immutable, explainable evaluation, a deterministic humorous ending, and a clean path into a fresh replay.

## ADDED Requirements

### Requirement: The workday enters results exactly once at 17:00
The game SHALL create one terminal result when authoritative workday time first reaches 17:00, SHALL stop coding and further gameplay-system processing before presenting it, and SHALL retain the captured result unchanged until restart.

#### Scenario: Passive time reaches 17:00
- **WHEN** passive advancement first reaches the configured 17:00 boundary
- **THEN** coding input is cancelled, gameplay processing stops, and exactly one result is captured from the terminal run state

#### Scenario: An action reaches 17:00
- **WHEN** an action-time cost reaches or crosses 17:00 while a decision is being resolved
- **THEN** the selected action and its declared effects finish exactly once before the terminal result is captured

#### Scenario: Updates continue after results begin
- **WHEN** scene updates, held input, scheduler deadlines, or consequence deadlines occur after the result has been captured
- **THEN** no clock, task, event, need, booster, Focus, resource, metric, or result value changes

#### Scenario: Several terminal signals are observed
- **WHEN** multiple observers or updates notice the completed-day state
- **THEN** they expose the same single result and do not repeat terminal side effects or navigation

### Requirement: Results use a complete immutable run snapshot
The game SHALL capture the terminal workday resources, need values, completed tasks, interruption outcomes, incident history, booster counts, and other scoring evidence needed to reproduce the displayed evaluation without consulting mutable live state.

#### Scenario: A completed run is captured
- **WHEN** terminal evaluation begins
- **THEN** its result contains the final Stamina, PO Happiness, System Stability, Technical Debt, Sleepiness, Toilet Need, completed work, resolved incidents, coworker-interaction evidence, and Coffee and Coke Zero counts

#### Scenario: Live objects are later changed or reset
- **WHEN** mutable run-owned objects change after a terminal result was returned
- **THEN** the previously returned result remains unchanged

### Requirement: The score breakdown is deterministic and explainable
The game SHALL calculate a bounded total from documented data-driven rules for features completed, System Stability, PO Happiness, Stamina remaining, Technical Debt, coworker karma, incidents resolved, personal needs, and booster use, and SHALL retain each category's contribution for presentation.

#### Scenario: The same terminal evidence is evaluated twice
- **WHEN** identical terminal snapshots and scoring configuration are evaluated
- **THEN** they produce identical category contributions and the same total score

#### Scenario: Technical Debt and unmet needs are evaluated
- **WHEN** a terminal snapshot contains Technical Debt, Sleepiness, or Toilet Need pressure
- **THEN** their configured penalties are visible in the breakdown rather than being hidden inside another category

#### Scenario: Completed work and resolved pressure are evaluated
- **WHEN** a terminal snapshot records completed tasks, constructive coworker choices, or handled production and tooling incidents
- **THEN** the corresponding feature, coworker-karma, and incident contributions reflect that evidence exactly once

#### Scenario: Booster consumption is evaluated
- **WHEN** a run records Coffee or Coke Zero consumption
- **THEN** the breakdown reports both counts and applies only the documented booster scoring rules

### Requirement: Ending selection is deterministic and ordered
The game SHALL evaluate validated, data-driven ending rules in a documented priority order, SHALL choose exactly one winner with a stable tie-break, and SHALL provide seven reachable ending titles: Staff Engineer, 10x Engineer, Incident Commander, Promoted to Management, The Transcendent, Biological Incident, and Unicorn Day.

#### Scenario: A known fixture matches one ending
- **WHEN** terminal evidence satisfies a documented ending rule
- **THEN** the expected ending title and narrative are selected

#### Scenario: A fixture matches several endings
- **WHEN** terminal evidence satisfies more than one ending rule
- **THEN** the highest-priority matching rule wins, with stable declaration order breaking equal priorities

#### Scenario: No specialist ending matches
- **WHEN** terminal evidence satisfies none of the specialist rules
- **THEN** the Staff Engineer fallback is selected

#### Scenario: Ending configuration is invalid
- **WHEN** ending definitions have duplicate identities, duplicate priority and declaration order, unreachable thresholds, missing narratives, or no fallback
- **THEN** validation rejects the configuration before a run is evaluated

### Requirement: Catastrophic resources remain recoverable until results
The game SHALL NOT end a run early solely because Stamina, PO Happiness, or System Stability reaches zero, and SHALL use unrecovered zero-resource states as explicit ending and score evidence at 17:00.

#### Scenario: A resource reaches zero before 17:00
- **WHEN** Stamina, PO Happiness, or System Stability reaches zero while time remains
- **THEN** the workday remains active subject to the existing action-availability rules and the player may recover the resource

#### Scenario: A resource is still zero at 17:00
- **WHEN** terminal evaluation captures zero Stamina, PO Happiness, or System Stability
- **THEN** the score breakdown identifies the catastrophe and ending selection considers it according to the documented priority rules

#### Scenario: A zero resource is recovered
- **WHEN** a resource reaches zero and is restored above zero before 17:00
- **THEN** the run is evaluated from its recovered terminal value while retained run-history evidence remains available to rules that explicitly use history

### Requirement: Results presentation explains the outcome
The game SHALL replace active workstation interaction at results time with a readable results view containing the ending title, a short narrative, the total and category breakdown, key run statistics, and one restart action.

#### Scenario: Results are shown
- **WHEN** a terminal result is captured
- **THEN** the player can identify the awarded ending, why it was awarded, the total score, every scored category, and representative completed-work and incident statistics

#### Scenario: Gameplay controls are used behind results
- **WHEN** pointer, touch, or keyboard gameplay input occurs while results are visible
- **THEN** no hidden workstation action is performed

#### Scenario: Results use the minimum supported viewport
- **WHEN** the results view is displayed at the minimum supported viewport
- **THEN** the ending explanation, score breakdown, and restart action remain visible and non-overlapping

### Requirement: Restart creates an isolated fresh run
The game SHALL restart from results by disposing the completed run and creating a new run with the documented initial state and no retained timers, events, input, metrics, result state, or observer registrations.

#### Scenario: The player restarts from results
- **WHEN** the restart action is activated once
- **THEN** a new 09:00 workstation run begins with initial resources, needs, tasks, events, boosters, Focus, score evidence, and no result visible

#### Scenario: Held input spans restart
- **WHEN** pointer or keyboard input was held as results began or while restart was activated
- **THEN** the new run remains idle until a fresh press occurs

#### Scenario: Old deadlines would become due
- **WHEN** an event, consequence, disruption, or scene callback from the completed run would fire after restart
- **THEN** it cannot mutate or present anything in the new run

#### Scenario: Restart is activated repeatedly
- **WHEN** duplicate pointer or touch activation targets the restart control
- **THEN** exactly one fresh run is created for that activation sequence
