## Why

The workstation currently presents a hard-coded task list while the coding model can only advance one immutable task, so completing work ends the primary loop instead of moving the player through a day of engineering trade-offs. The next roadmap step makes the task queue authoritative and playable before the event catalog begins depending on task identity and history.

## What Changes

- Add a data-driven engineering task catalog with at least five tasks, including effort, priority, rewards, risk, and optional Technical Debt.
- Add deterministic queue state for task selection, per-task progress, one-time completion, completed-work history, and automatic selection of the next available task.
- Make the left task panel interactive and keep the laptop synchronized with the selected task.
- Charge an explicit Focus or game-time cost when the player switches away from an unfinished task, and require fresh coding input after switching.
- Apply task completion rewards exactly once and continue the coding loop on another task.
- Add one task-specific midpoint decision that triggers once when its progress threshold is crossed and resolves through the existing decision/effect infrastructure.
- Define an explicit all-tasks-complete state in which no task is selected and coding is disabled; procedural replacement tasks remain out of scope.

## Capabilities

### New Capabilities

- `engineering-task-queue`: Defines data-driven engineering tasks, selection and switching, independent progress, completion rewards, midpoint decisions, and task queue presentation.

### Modified Capabilities

- `hold-to-code-loop`: Changes coding from one immutable configured task to the task selected by the authoritative queue, including fresh-input behavior after task transitions and clear unavailability when no task remains.
- `delayed-consequences-and-tech-debt`: Routes task-progress effects to the authoritative selected task rather than progress stored exclusively by the single-task coding session.

## Impact

- Introduces a scene-independent task queue domain model and task content definitions.
- Refactors the boundary between `CodingSession` and `Workstation` so coding operates on the selected queue task without duplicating progress ownership.
- Replaces the static task-panel rows with snapshot-driven interactive UI.
- Extends task/effect integration and tests while reusing `DayState`, `InterruptionSession`, and `EffectEngine` contracts.
- Adds focused unit and browser playtests; no new runtime dependency or persistence format is required.
