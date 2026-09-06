## Why

The player can currently lose Stamina but has no quick recovery action, leaving personal pressure one-sided. Coffee and Coke Zero add the MVP's first short-term recovery trade-offs and establish consumption state that later consequence events and end-of-day scoring can use.

## What Changes

- Add data-driven Coffee and Coke Zero booster definitions with distinct Stamina recovery and downside behavior.
- Track per-booster consumption counts and expose deterministic reset behavior.
- Increase a bounded, seeded Coffee Crash risk as Coffee is consumed without introducing the later Coffee Crash event content.
- Increase Toilet Need when Coke Zero is consumed.
- Add guarded Coffee and Coke Zero controls to the workstation quick-action bar with availability feedback and protection against duplicate activation.
- Add humorous escalating Coffee feedback based on consumption count.

## Capabilities

### New Capabilities

- `mvp-boosters`: Defines Coffee and Coke Zero activation, effects, consumption tracking, Coffee Crash risk, safeguards, reset behavior, and workstation feedback.

### Modified Capabilities

None.

## Impact

- Adds a presentation-independent booster domain model and focused unit coverage.
- Extends the player-needs model with a bounded, typed need mutation used by Coke Zero.
- Integrates booster actions with `DayState`, `PlayerNeeds`, and the existing quick-action UI in `Workstation`.
- Adds focused browser playtesting for pointer/touch activation, visible effects, availability, and layout.
- Introduces no new runtime dependency and does not add the Coffee Crash event, broader inventory, or end-of-day scoring.
