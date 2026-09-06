## MODIFIED Requirements

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
