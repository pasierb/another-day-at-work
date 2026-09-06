## Why

The workstation has a functional workday and coding loop, but the player still has no competing demands or decisions. A representative interruption slice is the next dependency needed to prove the game's central CODE → INTERRUPTION → DECISION → CONSEQUENCE → CODE loop before scheduling, escalation, and delayed consequences add complexity.

## What Changes

- Introduce typed, data-driven interruption and choice definitions with category, severity, age, concise copy, and immediate effects.
- Present three initially active sample interruptions—one Product Owner request, one production issue, and one teammate request—in the alerts region.
- Add a single decision overlay that pauses passive workday advancement, cancels active coding input, and offers at least two immediate trade-off choices.
- Resolve a selected choice exactly once by spending game time, mutating bounded resources, reducing Focus, and removing the handled interruption.
- Resume the decision-owned pause after resolution while preserving any unrelated pause reasons.
- Keep random spawning, escalation, ignore/postpone behavior, delayed consequences, and the full event library out of this slice.

## Capabilities

### New Capabilities

- `interruption-decisions`: Typed interruption content, active-alert presentation, modal decision flow, and one-time immediate choice resolution.

### Modified Capabilities

- `day-state-and-resource-hud`: Add an explicit way for gameplay actions to spend game time even while passive clock advancement is paused.
- `hold-to-code-loop`: Add explicit bounded Focus disruption and require decision opening to cancel held coding inputs until a fresh press.

## Impact

- Adds an interruption/decision domain boundary and a small content-data module under `src/game`.
- Extends `DayState` and `CodingSession` with narrow commands used by immediate choice effects.
- Replaces the alerts placeholders in `Workstation` with active event views and adds a decision overlay within the existing logical resolution.
- Adds framework-independent domain tests and expands the browser playtest; no new runtime dependency or persistence format is introduced.
