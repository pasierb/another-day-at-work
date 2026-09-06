## Purpose

Provide the primary continuous coding interaction, including task progress, Focus momentum, Stamina cost, safe input handling, and synchronized laptop feedback.

## ADDED Requirements

### Requirement: A coding session exposes one deterministic current task
The game SHALL initialize a coding session with one configured current task containing an identifier, name, effort, progress, and completion state, and SHALL constrain task progress to the inclusive range from 0 to 100 percent.

#### Scenario: A fresh coding session begins
- **WHEN** a coding session is created with the default current task
- **THEN** the task exposes its configured identity and effort, has zero progress, and is incomplete

#### Scenario: The task reaches completion
- **WHEN** a coding update supplies enough work to finish the current task
- **THEN** progress becomes exactly 100 percent and the task enters its completed state exactly once

#### Scenario: Updates continue after completion
- **WHEN** further coding updates occur after the current task is complete
- **THEN** progress remains at 100 percent and no additional completion transition occurs

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
The game SHALL expose bounded Focus as a coding-speed multiplier, SHALL increase it at a configured rate while coding, and SHALL decay it at a configured rate while coding is available but released.

#### Scenario: Coding is held continuously
- **WHEN** the player codes without releasing the control
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

### Requirement: Coding honors workday and resource availability
The game SHALL allow coding only while the workday is running and incomplete, Stamina is greater than zero, and the current task is incomplete.

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
- **WHEN** the current task reaches 100 percent while coding input is active
- **THEN** coding stops and the coding control becomes unavailable

### Requirement: The laptop presents current coding state
The workstation laptop SHALL display the current task identity, task progress, Focus multiplier, and whether the coding control is idle, pressed, or disabled from the authoritative coding state.

#### Scenario: The workstation first appears
- **WHEN** the workstation creates a fresh coding session
- **THEN** the laptop displays the configured current task at zero progress, the base Focus multiplier, and an available coding control

#### Scenario: Coding state changes
- **WHEN** task progress, Focus, held state, or availability changes
- **THEN** the corresponding laptop text, meter, and control feedback update to match the current coding state

#### Scenario: Coding is disabled
- **WHEN** coding is unavailable because the workday is paused or complete, Stamina is exhausted, or the task is complete
- **THEN** the laptop clearly displays a disabled control and does not accept a coding press
