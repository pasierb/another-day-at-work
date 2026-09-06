## 1. Player Needs Domain

- [x] 1.1 Define validated, data-driven need configuration, stage, penalty, transition, critical-effect, snapshot, and synchronization-result types for Sleepiness and Toilet Need.
- [x] 1.2 Implement absolute game-time synchronization with bounded values, threshold-segment integration, ordered one-shot transitions, observer notifications, relief, and deterministic reset.
- [x] 1.3 Add domain tests for ordinary progression, pause-equivalent duplicate timestamps, large time jumps, bounds, stage penalties, ordered warnings, critical episode suppression and re-arming, relief, and reset.

## 2. Coding Penalty Integration

- [x] 2.1 Extend CodingSession with validated neutral-by-default runtime coding-speed and Focus-gain modifiers while preserving existing progress, Focus, Stamina, input, and completion behavior.
- [x] 2.2 Update the coding integration math so modifiers apply across an update without violating Focus or progress bounds, including zero/minimum modifiers and modifier removal.
- [x] 2.3 Extend CodingSession tests to prove neutral compatibility, reduced work and Focus gain under penalties, combined bounds, and immediate recovery after modifiers return to neutral.

## 3. Workday Orchestration

- [x] 3.1 Instantiate and reset PlayerNeeds with the workday, subscribe the scene to its authoritative snapshots, and synchronize it after continuous and explicit game-time advancement.
- [x] 3.2 Apply additional Stamina drain, need-derived coding modifiers, ordered warning feedback, and recoverable critical effects through existing domain commands with re-entrancy and duplicate-trigger guards.
- [x] 3.3 Ensure interruption choices, escalation effects, delayed consequences, and critical time jumps all finish synchronized to one authoritative clock without changing their existing behavior.

## 4. Workstation UI and Toilet Action

- [x] 4.1 Add compact Sleepiness and Toilet Need indicators that show current stage and relative severity within the existing non-overlapping workstation composition.
- [x] 4.2 Add a reusable enabled quick-action presentation and replace one placeholder with a guarded Toilet action supporting pointer and touch activation.
- [x] 4.3 Implement the bathroom sequence: cancel held coding, reduce Focus, spend configured game time, synchronize crossed need stages and effects, relieve Toilet Need, and update all views once.
- [x] 4.4 Disable the Toilet action during blocking decisions and after day completion, and clean up its input handlers and need subscriptions on scene shutdown.

## 5. Verification

- [x] 5.1 Run the complete unit-test suite and production build, fixing regressions without weakening existing contracts.
- [x] 5.2 Add and run a focused browser playtest that accelerates through all need stages and verifies visible penalties, pause behavior, action-time jumps, bathroom relief, and non-repeating critical consequences.
- [x] 5.3 Run the workstation layout playtest to confirm the new indicators and Toilet control remain readable, non-overlapping, and usable at supported desktop and touch-sized viewports.
