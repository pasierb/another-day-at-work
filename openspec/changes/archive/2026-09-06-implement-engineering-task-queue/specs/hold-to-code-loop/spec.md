## MODIFIED Requirements

### Requirement: A coding session exposes one deterministic current task
The game SHALL perform coding against the task selected by the authoritative engineering task queue, SHALL expose that task's identifier, name, effort, bounded progress, and completion state, and SHALL expose no current task when the queue has no incomplete work.

#### Scenario: A fresh coding session begins
- **WHEN** a coding session is connected to a fresh task queue
- **THEN** it exposes the queue's selected task at zero progress with its configured identity and effort

#### Scenario: The selected task changes
- **WHEN** the queue selects a different incomplete task
- **THEN** the coding state exposes that task and its retained progress without carrying progress from the previous task

#### Scenario: The task reaches completion
- **WHEN** a coding update supplies enough work to finish the selected task
- **THEN** progress becomes exactly 100 percent and the task enters its completed state exactly once before the queue selects subsequent work

#### Scenario: Updates continue after completion
- **WHEN** further coding updates occur after one task completes and the queue selects subsequent work
- **THEN** the completed task remains at 100 percent, produces no additional completion transition, and receives no further work

#### Scenario: No incomplete task remains
- **WHEN** the queue contains no incomplete task
- **THEN** coding exposes no current task and cannot produce work

### Requirement: Coding honors workday and resource availability
The game SHALL allow coding only while the workday is running and incomplete, Stamina is greater than zero, and the engineering task queue has a selected incomplete task that is not waiting on a task decision.

#### Scenario: The workday is paused
- **WHEN** the workday is paused while coding input is active
- **THEN** task progress, Focus, and coding-related Stamina drain remain unchanged

#### Scenario: Stamina is exhausted during coding
- **WHEN** coding consumes the last available Stamina
- **THEN** Stamina stops at zero and no additional task progress is produced until Stamina becomes positive and the player performs a new coding press

#### Scenario: The workday ends
- **WHEN** the workday reaches its completion time while coding input is active
- **THEN** coding stops and produces no progress, Focus growth, or Stamina drain after the end of the workday

#### Scenario: The current task completes
- **WHEN** the selected task reaches 100 percent while coding input is active
- **THEN** coding stops for that input and does not begin the automatically selected task until the player performs a fresh coding press

#### Scenario: A task decision is pending
- **WHEN** selected-task progress reaches an unresolved decision threshold
- **THEN** coding stops and remains unavailable until that decision resolves

### Requirement: The laptop presents current coding state
The workstation laptop SHALL display the selected task identity and progress, Focus multiplier, and whether the coding control is idle, pressed, or disabled from authoritative coding and queue state.

#### Scenario: The workstation first appears
- **WHEN** the workstation creates a fresh coding session and task queue
- **THEN** the laptop displays the selected task at zero progress, the base Focus multiplier, and an available coding control

#### Scenario: Coding state changes
- **WHEN** task selection, task progress, Focus, held state, or availability changes
- **THEN** the corresponding laptop text, meter, and control feedback update to match the authoritative state

#### Scenario: Coding is disabled
- **WHEN** coding is unavailable because the workday is paused or complete, Stamina is exhausted, or a task decision is pending
- **THEN** the laptop clearly displays the applicable disabled reason and does not accept a coding press

#### Scenario: All work is complete
- **WHEN** no incomplete task remains
- **THEN** the laptop presents an all-tasks-complete state and keeps the coding control disabled
