## ADDED Requirements

### Requirement: Interruption choices mutate explicit task responsibilities
The game SHALL allow validated choice effects to set or extend a deadline, add effort, or activate an authored task by stable task identifier without depending on the currently selected task.

#### Scenario: A choice assigns a deadline
- **WHEN** a valid deadline-setting effect resolves
- **THEN** its target active task receives a deadline relative to the post-action authoritative time

#### Scenario: A choice extends an absent deadline
- **WHEN** a deadline-extension effect targets an active task without a deadline
- **THEN** the effect is a documented no-op and does not mutate another task

#### Scenario: The player changes selection during an interruption chain
- **WHEN** a later targeted task effect resolves after another task became selected
- **THEN** only the task identified by the effect is mutated

#### Scenario: Invalid task mutation content is loaded
- **WHEN** an effect references an unknown task, a non-positive duration or effort amount, or a non-dormant activation target
- **THEN** the catalog is rejected before play begins

