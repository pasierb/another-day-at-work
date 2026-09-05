## Why

The workstation currently shows representative but inert resource and clock values, so later gameplay has no authoritative model for time or player-facing run state. A framework-independent day state and live HUD are needed before coding, interruptions, and consequences can safely mutate shared values.

## What Changes

- Introduce an authoritative workday state with a 09:00 start, bounded resources, configurable clock speed, pause/resume behavior, and deterministic reset.
- Provide typed resource mutations and state-change notifications so gameplay systems can update state without directly owning HUD elements.
- Replace the workstation's static Stamina, PO Happiness, System Stability, Technical Debt, clock, and day-progress placeholders with live state-backed displays.
- Keep state logic testable without constructing a Phaser scene.
- Stop this change at 17:00 without introducing results, failure states, passive drain, or balance-dependent pacing behavior.

## Capabilities

### New Capabilities

- `day-state-and-resource-hud`: Defines workday timekeeping, bounded run resources, pause/reset semantics, state observation, and their live workstation presentation.

### Modified Capabilities

None.

## Impact

- Adds domain state and shared constants under `src/game` and connects them to the Workstation scene and UI components.
- Replaces static HUD and clock placeholder values while preserving the existing workstation-shell layout and scaling contract.
- Adds automated coverage for state behavior that does not require Phaser scene construction.
- Adds no runtime dependency, persistence, failure handling, or end-of-day results flow.
