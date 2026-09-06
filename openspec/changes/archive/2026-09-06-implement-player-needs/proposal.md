## Why

The workday currently pressures only project resources, so the player has no personal reason to stop coding. Sleepiness and toilet need add the MVP's physical trade-offs and establish the integration points later boosters and personal events require.

## What Changes

- Add bounded, game-time-driven Sleepiness and Toilet Need with named stages and deterministic reset behavior.
- Apply high-stage penalties to coding speed, Focus gain or Focus level, and Stamina without coupling the needs model to Phaser.
- Emit threshold warnings and one-shot, recoverable critical consequences without repeating them every frame.
- Add an interactive Toilet quick action that consumes game time, interrupts Focus, and relieves Toilet Need.
- Display both needs and their current stages in the workstation UI.

## Capabilities

### New Capabilities

- `player-needs`: Defines progression, stages, penalties, warnings, critical behavior, reset, and bathroom relief for Sleepiness and Toilet Need.

### Modified Capabilities

- `hold-to-code-loop`: Allows authoritative need penalties to modify coding speed and Focus gain while preserving existing input, bounds, and completion guarantees.

## Impact

- Adds a new domain model and focused tests under `src/game/domain` and `test`.
- Extends `CodingSession` with bounded runtime modifiers.
- Integrates need synchronization, warnings, critical effects, and the Toilet action into `Workstation`.
- Replaces some placeholder workstation UI with live need indicators and an enabled quick action.
- Adds no runtime dependency and changes no public package API.
