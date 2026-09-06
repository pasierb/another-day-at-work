## 1. Deterministic Scheduling Foundation

- [x] 1.1 Add a resettable seeded random source with tests for repeatable sequences and independent seeds.
- [x] 1.2 Implement a framework-independent event scheduler with validated spawn-interval and active-limit configuration.
- [x] 1.3 Add scheduler tests proving frame-partition independence, deterministic same-deadline ordering, reset behavior, end-of-day suppression, and no wall-clock dependency.
- [x] 1.4 Implement the stable pending backlog and test full-capacity retention, resolution-driven draining, and no extra random draws while queued.

## 2. Escalation Content and Lifecycle

- [x] 2.1 Extend interruption definitions and snapshots with optional validated escalation stages, absolute next deadlines, immediate stage effects, postponement durations, follow-up IDs, and stable activation sequence.
- [x] 2.2 Refactor `InterruptionSession` to support an initially empty session and explicit activation while preserving exclusive opening and idempotent one-time resolution.
- [x] 2.3 Implement chronological stage advancement, final-stage stability, resolution cancellation, and immutable ordered transition batches.
- [x] 2.4 Implement idempotent postpone and ignore commands with lifecycle guards and content-defined timing behavior.
- [x] 2.5 Validate escalation/follow-up references and add unit tests for invalid graphs, multi-stage time jumps, one-time effects, follow-up requests, final stages, same-time resolution precedence, postpone, and ignore.

## 3. Representative Scheduled Content

- [x] 3.1 Convert the Product Owner, production, and teammate samples from constructor-activated fixtures into scheduler-eligible definitions without changing their existing decision trade-offs.
- [x] 3.2 Give representative samples content-defined escalation copy, severities, timings, effects, postponement durations, and at least one valid follow-up path.
- [x] 3.3 Add content tests proving every sample and cross-reference validates and that a known seed produces the documented sample sequence.

## 4. Workstation Integration and Alert Controls

- [x] 4.1 Instantiate and synchronize the scheduler from authoritative workday time, applying emitted effects through `DayState` and `CodingSession` without Phaser timers.
- [x] 4.2 Sequence choice resolution so action time is processed only after the selected interruption is final, then catch up other due transitions chronologically when no pause reason remains.
- [x] 4.3 Add alert-level postpone and ignore controls that do not open the decision modal and cannot act through an existing overlay.
- [x] 4.4 Render effective escalation copy/severity, pending/active counts as appropriate, deterministic severity-and-age ordering, and distinct urgent styling within the existing alerts region.
- [x] 4.5 Ensure restart and scene shutdown reset or release scheduler state, observers, input handlers, decision pause ownership, and pending transitions.

## 5. Verification

- [x] 5.1 Extend browser playtesting to verify a known seed's spawn order, ignored-event escalation through every stage, postpone timing, urgent reordering, and resolution cancellation.
- [x] 5.2 Verify scheduler and escalation transitions freeze during ordinary and decision pauses, while decision action-time deadlines catch up only after resolution.
- [x] 5.3 Verify the active-event limit and pending FIFO behavior in the running scene, including a follow-up generated while the alerts area is full.
- [x] 5.4 Verify alert controls and urgent presentation remain readable and operable with mouse and touch at supported desktop and portrait viewports.
- [x] 5.5 Run the full unit test suite, TypeScript/production build, and focused browser playtest and resolve regressions without pulling in Chunk 06 consequence behavior.
