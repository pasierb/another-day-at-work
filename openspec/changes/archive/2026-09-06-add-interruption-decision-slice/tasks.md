## 1. Domain Time and Focus Commands

- [x] 1.1 Add a validated, observable action-time command to `DayState` that spends game minutes during pauses and clamps at the workday end.
- [x] 1.2 Add unit tests for action-time spending during a pause, end-of-day clamping, no-op behavior, and invalid costs.
- [x] 1.3 Add an observable bounded Focus-reduction command to `CodingSession` without changing task progress.
- [x] 1.4 Add unit tests for partial and over-bound Focus reductions and unchanged-state notification behavior.

## 2. Interruption Model and Content

- [x] 2.1 Define typed interruption, choice, immediate-effect, category, severity, and immutable snapshot contracts.
- [x] 2.2 Implement definition validation and an interruption session with initial activation, game-time age derivation, exclusive decision opening, and idempotent resolution.
- [x] 2.3 Create data-driven Product Owner, production, and teammate sample events with at least two clearly described immediate trade-off choices each.
- [x] 2.4 Add scene-independent tests for invalid definitions, initial active events, paused age behavior, exclusive opening, and duplicate-resolution prevention.

## 3. Workstation Decision Flow

- [x] 3.1 Replace the alerts placeholders with compact active-event views showing category, severity, game-time age, and copy.
- [x] 3.2 Add a blocking, non-dismissible decision scrim and card that fits the logical canvas and presents the selected event and all choice effects.
- [x] 3.3 On decision opening, clear every held coding source, apply the stable decision pause reason, and prevent underlying alert and coding interaction.
- [x] 3.4 Implement the guarded choice-resolution path to spend action time, mutate resources, reduce Focus, resolve the event once, and release only the decision pause.
- [x] 3.5 Ensure scene shutdown removes interruption observers and interactive handlers and cannot leave a pause or decision lifecycle active.

## 4. Verification

- [x] 4.1 Extend the browser playtest to open and resolve every sample event and verify its described HUD, clock, Focus, and alert-removal effects.
- [x] 4.2 Verify passive time and coding freeze behind the decision, unrelated pauses compose correctly, and held input cannot restart coding after resolution.
- [x] 4.3 Verify the alert list and decision card remain readable and non-overlapping at supported desktop and touch-sized viewports.
- [x] 4.4 Run the full unit test suite, production build, and focused browser playtest and resolve any regressions.
