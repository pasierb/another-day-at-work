## 1. Booster Domain Model

- [x] 1.1 Define validated, data-driven Coffee and Coke Zero configuration, activation-result, consumption-count, cooldown, availability, feedback, and snapshot types.
- [x] 1.2 Implement a presentation-independent booster session with guarded activation, independent authoritative-game-time cooldown deadlines, observer updates, and deterministic reset.
- [x] 1.3 Implement bounded monotonic Coffee Crash probability and seeded opportunity evaluation without scheduling or presenting a crash event.
- [x] 1.4 Add unit tests for exact Coffee/Coke Zero activation results, per-booster counts, escalating/fallback Coffee feedback, independent cooldowns, rejected duplicate/unavailable activation, probability bounds, seeded outcomes, validation, immutability, and reset.

## 2. Player Need Mutation

- [x] 2.1 Add a typed bounded external need-mutation command that preserves `PlayerNeeds` ownership and reports any ordered stage transitions caused by the mutation.
- [x] 2.2 Add unit tests proving positive, negative, clamped, and no-op need mutations update snapshots and transitions consistently without breaking passive synchronization, relief, or critical-episode guards.

## 3. Workstation Integration

- [x] 3.1 Create the booster session with each fresh workday and apply successful activation results through `DayState` and `PlayerNeeds`, including need transitions and existing critical-effect orchestration.
- [x] 3.2 Add Coffee and Coke Zero quick actions alongside Toilet, with distinct recovery labels, escalating Coffee feedback, consumption feedback, and concise disabled reasons.
- [x] 3.3 Refresh booster availability after frames, resource mutations, time jumps, decision transitions, and day completion; cancel held coding on activation and prevent activation at full Stamina or in blocked states.
- [x] 3.4 Clean up booster action listeners and run-scoped state on scene shutdown/restart so counts, cooldowns, random position, and armed pointer state cannot leak.

## 4. Verification

- [x] 4.1 Run the full unit test suite and production build, resolving any regressions while preserving the scope and behavior of Chunks 01–07.
- [x] 4.2 Add and run a focused browser playtest covering exact visible effects, bounds, escalating Coffee feedback, cooldown expiry/freeze, full-Stamina and decision blocking, and clean restart.
- [x] 4.3 Run pointer and touch-sized browser playtests to verify each gesture activates once and Coffee, Coke Zero, and Toilet remain readable and non-overlapping at supported viewports.
