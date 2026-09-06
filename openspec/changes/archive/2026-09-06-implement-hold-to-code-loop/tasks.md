## 1. Coding Domain

- [x] 1.1 Add immutable task and coding-session configuration and snapshot types with validated progress, effort, Focus, and rate bounds.
- [x] 1.2 Implement deterministic coding updates for task progress, Focus growth and release decay, available-Stamina limits, and one-time completion.
- [x] 1.3 Add coding availability and input-request transitions that stop work for pause, day completion, exhaustion, task completion, or cancellation.
- [x] 1.4 Add domain tests covering initialization, frame-rate-independent updates, Focus bounds and tapping comparison, Stamina exhaustion, paused time, and exact-once completion.

## 2. Workstation Integration

- [x] 2.1 Create and clean up the coding session with the workstation lifecycle and feed it elapsed game time derived from DayState advancement.
- [x] 2.2 Apply coding-session Stamina costs through DayState and synchronize workday availability back into coding state without boundary overshoot.
- [x] 2.3 Implement independent pointer and keyboard held-source tracking with global release, cancellation, blur, unavailable-state, and shutdown cleanup.

## 3. Laptop Presentation

- [x] 3.1 Replace the disabled placeholder with an interactive Hold to Code control exposing idle, pressed, and disabled feedback.
- [x] 3.2 Bind current-task identity, numeric progress, progress meter, and Focus multiplier to coding snapshots.
- [x] 3.3 Preserve the workstation composition at the supported resolution and ensure changing control states do not overlap adjacent laptop content.

## 4. Verification

- [x] 4.1 Extend the browser playtest to verify pointer hold and release, keyboard equivalence, mixed input, cancellation or blur cleanup, and disabled states.
- [x] 4.2 Verify a task completes exactly once, uninterrupted holding outperforms spaced tapping, and progress stops immediately on release, pause, exhaustion, and completion.
- [x] 4.3 Run the unit-test suite and production build, then resolve any failures introduced by the change.
