## 1. Task Content and Queue Domain

- [x] 1.1 Define typed engineering task, priority, completion-effect, and midpoint-decision content contracts with validation for identities, effort, thresholds, choices, and effects.
- [x] 1.2 Add at least five varied MVP task definitions with effort, priority, reward/risk copy, completion effects, optional Technical Debt, and one multi-choice midpoint decision.
- [x] 1.3 Implement the scene-independent task queue with immutable snapshots, stable initial/automatic selection, independent bounded progress, completed-work history, and deterministic reset.
- [x] 1.4 Add queue unit tests for valid and invalid catalogs, selection no-ops, retained progress, boundary clamping, automatic selection, all-complete state, immutable snapshots, and reset.

## 2. Coding and Effect Integration

- [x] 2.1 Refactor `CodingSession` to own Focus, availability, and bounded work production while accepting the selected task's next work boundary instead of owning mutable task progress.
- [x] 2.2 Integrate queue work application with exact midpoint/completion boundaries and proportional Stamina cost, including continuous-versus-partitioned update coverage.
- [x] 2.3 Route selected-task progress reductions through the queue and verify completed tasks, absent selection, progress bounds, and triggered midpoint history remain protected.
- [x] 2.4 Execute completion transitions through `EffectEngine` after recording completion, and test that rewards, Technical Debt, history, and automatic selection occur exactly once.

## 3. Selection and Task Decision Lifecycle

- [x] 3.1 Add voluntary task-selection orchestration that applies the configured Focus reduction once, clears and blocks held input sources, rejects unavailable selections, and does not charge automatic selection.
- [x] 3.2 Implement one-shot midpoint transition state that caps work exactly at its threshold and cannot retrigger after progress rollback.
- [x] 3.3 Integrate the task-decision pause reason, game-time choice cost, ordered effect execution, exactly-once resolution, catch-up behavior, and fresh-input requirement.
- [x] 3.4 Extract or reuse decision-card presentation helpers while keeping task decisions separate from scheduler capacity, alert aging, escalation, and interruption lifecycle state.

## 4. Workstation Presentation

- [x] 4.1 Replace the static task rows with snapshot-driven interactive rows showing task title, identifier, priority, progress, and selected/completed states.
- [x] 4.2 Synchronize the laptop with the selected queue task and add clear temporary-unavailable and all-tasks-complete presentations.
- [x] 4.3 Disable task selection behind either decision type and clean up queue subscriptions, row listeners, modal objects, pause reasons, and held inputs on reset or scene shutdown.
- [x] 4.4 Fit all MVP task rows within the existing task region at supported desktop and touch-sized layouts without obscuring Technical Debt or other controls.

## 5. Verification

- [x] 5.1 Extend unit tests for fresh-input behavior across manual switches, automatic selection, midpoint decisions, completion, Stamina exhaustion, pause, and workday completion.
- [x] 5.2 Add a browser playtest that selects a task, makes partial progress, switches away and back, verifies retained progress and Focus cost, and completes successive tasks with rewards applied once.
- [x] 5.3 Add desktop and touch browser coverage for the midpoint decision, blocked background selection, exact threshold, choice effects, non-retriggering, queue/laptop synchronization, and minimum-viewport layout.
- [x] 5.4 Run `npm test` and `npm run build`, then perform a focused manual browser pass for pointer, touch, keyboard, resize, decision, and all-tasks-complete behavior with no console or asset errors.
