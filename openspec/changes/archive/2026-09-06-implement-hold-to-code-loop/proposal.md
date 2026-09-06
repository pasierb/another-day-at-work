## Why

The workstation currently displays only a static coding mock-up, so the prototype lacks its primary tactile interaction. Adding Hold to Code now establishes the task-progression and Focus mechanics that later interruptions, needs, and task-queue changes will disrupt.

## What Changes

- Introduce an authoritative, testable current-task and coding-session model with configurable progress, Stamina drain, and Focus rates.
- Allow the player to code by holding the laptop control with a pointer or keyboard, including safe cancellation and mixed-input handling.
- Grow bounded Focus during uninterrupted coding and apply it as a coding-speed multiplier; decay Focus while coding is released so continuous holds outperform tapping.
- Stop coding when input is released, the workday is paused or complete, Stamina is exhausted, or the task completes.
- Replace the laptop's placeholder progress with live task progress, Focus multiplier, and pressed or disabled feedback.

## Capabilities

### New Capabilities

- `hold-to-code-loop`: Current-task progression, continuous coding input, Focus, Stamina cost, completion, and synchronized laptop feedback.

### Modified Capabilities

None.

## Impact

- Adds domain state for the current task and coding session alongside the existing `DayState`.
- Integrates coding updates and resource mutations into the `Workstation` scene update loop.
- Replaces the static laptop action and progress presentation with interactive UI state.
- Adds domain tests and extends browser playtesting for pointer, keyboard, cancellation, pause, exhaustion, and completion behavior.
- Introduces no new runtime dependencies and does not add multiple tasks or interruption behavior.
