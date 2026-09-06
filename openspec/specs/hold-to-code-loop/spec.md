# Hold to Code Loop Specification

## Purpose

Provide the primary continuous coding interaction, including task progress, Focus momentum, Stamina cost, safe input handling, and synchronized laptop feedback.

## Requirements

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

### Requirement: Holding an available coding control performs work
The game SHALL perform coding work continuously while at least one supported coding input is held and SHALL stop immediately when no supported input remains active.

#### Scenario: Pointer input is held
- **WHEN** the player presses and continues holding the laptop coding control with a pointer while coding is available
- **THEN** task progress increases continuously and Stamina decreases at their configured rates

#### Scenario: Keyboard input is held
- **WHEN** the player presses and continues holding the coding keyboard control while coding is available
- **THEN** it produces the same coding behavior as holding with a pointer

#### Scenario: The final active input is released
- **WHEN** the player releases the only active coding input
- **THEN** task progress and coding-related Stamina drain stop immediately

#### Scenario: One of multiple inputs is released
- **WHEN** pointer and keyboard coding inputs are both active and one is released
- **THEN** coding continues until the remaining input is also released or coding otherwise becomes unavailable

### Requirement: Interrupted input cannot leave coding active
The game SHALL clear the affected held-input state when pointer interaction is cancelled or leaves the game, keyboard state is cancelled, the browser loses focus, or the scene shuts down.

#### Scenario: Pointer hold is cancelled
- **WHEN** an active pointer hold is cancelled or terminates outside the coding control
- **THEN** that pointer no longer keeps coding active

#### Scenario: Browser focus is lost
- **WHEN** the browser loses focus while a coding input is held
- **THEN** all held coding inputs are cleared and coding stops

#### Scenario: Coding becomes unavailable while held
- **WHEN** a held coding input remains physically down as coding becomes unavailable and later available again
- **THEN** coding does not restart until the player performs a new coding press

### Requirement: Focus rewards uninterrupted coding
The game SHALL expose bounded Focus as a coding-speed multiplier, SHALL increase it at a configured rate while coding, and SHALL decay it at a configured rate while coding is available but released. Authoritative external coding-speed and Focus-gain modifiers SHALL be applied to their respective rates without changing Focus bounds, and SHALL default to neutral behavior when no modifier is active.

#### Scenario: Coding is held continuously
- **WHEN** the player codes without releasing the control and no external modifier is active
- **THEN** Focus rises toward its configured maximum and increases the rate of subsequent task progress

#### Scenario: Coding is released
- **WHEN** the player releases all coding inputs before the task completes
- **THEN** Focus decays toward its base multiplier without changing task progress or draining coding-related Stamina

#### Scenario: Continuous holding is compared with tapping
- **WHEN** two equivalent sessions spend the same total time actively coding but one repeatedly releases long enough for Focus to decay
- **THEN** the uninterrupted session has made more task progress

#### Scenario: Focus reaches either bound
- **WHEN** continued growth or decay would move Focus beyond its configured range
- **THEN** Focus remains at the corresponding bound and its multiplier remains valid

#### Scenario: Personal needs slow coding
- **WHEN** an authoritative personal-need modifier below one is active during coding
- **THEN** task progress or Focus gain is reduced according to the relevant modifier while existing Focus and progress bounds remain intact

#### Scenario: Personal need penalty is removed
- **WHEN** all external modifiers return to their neutral value
- **THEN** subsequent coding uses the configured base rates without requiring a new coding session

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

### Requirement: Interruptions can disrupt Focus explicitly
The game SHALL support an explicit configured Focus reduction, constrain the resulting Focus to its existing bounds, and immediately expose the resulting multiplier to observers.

#### Scenario: Resolving an interruption reduces Focus
- **WHEN** an interruption choice applies a Focus reduction smaller than the current Focus
- **THEN** Focus and its multiplier decrease by the declared bounded amount without changing task progress

#### Scenario: A Focus reduction exceeds current Focus
- **WHEN** an interruption applies a Focus reduction greater than the current Focus
- **THEN** Focus stops at its minimum and the multiplier remains at its valid base value

### Requirement: Opening an interruption decision requires fresh coding input
The game SHALL cancel all held coding sources when an interruption decision opens and SHALL require a new coding press after the decision closes.

#### Scenario: A held input spans a decision
- **WHEN** a pointer or coding key remains physically held while a decision opens and then resolves
- **THEN** coding does not restart until that input is released and pressed again
