## 1. AI Mode Content and Validation

- [x] 1.1 Define typed prompt-mode and plan-mode profiles for phase durations, batch work, revision costs, evidence thresholds, quality bounds, and player-facing copy.
- [x] 1.2 Implement catalog validation for identifiers, numeric bounds, outcome/effect content, revision ceilings, and the invariant that plan mode is slower but no worse in batch size, evidence, or adverse-outcome likelihood.
- [x] 1.3 Add focused tests for valid profiles and every rejected mode/content boundary.

## 2. Deterministic AI Work-Cycle Domain

- [x] 2.1 Build the presentation-independent phase state machine for available, planning, generating, and review states with immutable snapshots and validated task/cycle/batch identities.
- [x] 2.2 Implement authoritative game-time advancement, prompt and plan phase transitions, bounded disruption speed, pause behavior, and exact generation boundaries.
- [x] 2.3 Generate deterministic immutable batches from seeded run context, including bounded proposed work, file/test evidence, visible signals, frozen outcomes, and revision tiers.
- [x] 2.4 Implement idempotent approve, revise, cancel, and reset transitions, including stale-action rejection and bounded quality improvement.
- [x] 2.5 Add partition-independence, deterministic replay, Focus monotonicity, disruption recovery, lifecycle cancellation, and exact-once transition tests.

## 3. Workday, Queue, and Consequence Integration

- [x] 3.1 Replace the continuous code action in `WorkdaySession` policy and orchestration with start-mode, approve-batch, and revise-batch actions while preserving legal-action priority during decisions.
- [x] 3.2 Advance AI phases through authoritative workday deltas and integrate pause owners, personal needs, Stamina gating, and the existing disruption ledger.
- [x] 3.3 Route approval through the queue's next-work boundary and effect engine so task decisions, completions, discarded overflow, technical debt, delayed consequences, and repeated actions resolve exactly once.
- [x] 3.4 Preserve stable review batches across interruption decisions, and cancel incompatible state across task switches, end of day, results, reset, restart, and shutdown.
- [x] 3.5 Update full-day policies and integration tests to exercise both modes, revision decisions, task boundaries, interruption overlap, and terminal results deterministically.

## 4. Focus and Balance Migration

- [x] 4.1 Replace continuous Focus gain, decay, and speed multiplication with bounded review-effectiveness state while preserving explicit Focus mutations used by existing needs, effects, recovery, and task switching.
- [x] 4.2 Apply Focus and mode profiles when freezing visible batch evidence, and verify that later Focus mutations cannot alter an existing batch or its outcome.
- [x] 4.3 Retune profile values for mode duration, batch size, review costs, Focus thresholds, and adverse outcomes using seeded workday simulations so prompt and plan strategies remain viable.
- [x] 4.4 Update affected personal-need, tooling, pacing, and end-of-day tests to assert the new semantics without weakening their existing bounds and exact-once guarantees.

## 5. Workstation Review Experience

- [x] 5.1 Replace the Hold to Code control with accessible Prompt Mode and Plan Mode actions, active phase progress, clear disabled reasons, and discrete keyboard/touch activation.
- [x] 5.2 Build a review card showing task, mode, proposed work, changed-file/test evidence, concern or uncertainty signals, and idempotent Approve Changes and Request Changes actions.
- [x] 5.3 Update task, Focus, disruption, pause, interruption, all-work-complete, and responsive layout rendering for every AI cycle phase.
- [x] 5.4 Replace hold/typing guidance and audio feedback with concise AI-mode trade-off, generation, review-ready, approval, and revision feedback.
- [x] 5.5 Replace held-source diagnostics and interaction plumbing with cycle phase, progress, identifiers, evidence, and action availability; remove obsolete hold cancellation behavior after all consumers migrate.

## 6. Verification and Documentation

- [x] 6.1 Replace hold-oriented unit and browser scenarios with prompt, plan, approve, revise, stale/double action, pause, focus/visibility, resize, task switch, results, restart, and minimum-touch-viewport scenarios.
- [x] 6.2 Run the full unit, type-check, build, seeded simulation, and browser playtest suites and resolve regressions.
- [x] 6.3 Perform a manual playtest focused on whether approval presents a real judgment, plan mode feels slower but safer, revision has a meaningful cost, and neither mode dominates trivially.
- [x] 6.4 Update README controls, gameplay explanation, and playtest instructions to describe the AI change-review loop and remove Hold to Code references.

