## 1. Terminal Result Contracts

- [x] 1.1 Define deeply immutable terminal-evidence, score-line, evaluated-result, and run-lifecycle contracts covering every specified score and ending input.
- [x] 1.2 Add validated data-driven scoring configuration with named contributions, finite bounds, a bounded total, and explicit Coffee/Coke Zero and catastrophe reporting.
- [x] 1.3 Add validated definitions for Staff Engineer, 10x Engineer, Incident Commander, Promoted to Management, The Transcendent, Biological Incident, and Unicorn Day with reachable predicates, priorities, stable declaration order, narratives, and an unconditional fallback.
- [x] 1.4 Implement pure terminal evaluation and deterministic ending selection without reading Phaser state, display copy, or mutable live objects.
- [x] 1.5 Add fixture tests for every score category, contribution bounds, immutable outputs, every ending, overlapping rules, tie-breaking, fallback behavior, and malformed score/ending configuration.

## 2. Run Evidence and Classification

- [x] 2.1 Add the minimal typed result-scoring metadata to existing interruption choices and validate required team-event karma and player-fixable incident classifications without changing content effects or eligibility.
- [x] 2.2 Extend run metrics to retain immutable resolved-choice category/classification facts, constructive coworker evidence, resolved incidents, relevant need episodes, and booster counts exactly once.
- [x] 2.3 Assemble a complete terminal evidence snapshot from workday resources, needs, task completion, interruptions, incidents, boosters, and run metrics.
- [x] 2.4 Add catalog and session tests proving scoring metadata is complete, the 30-event catalog and seeded selection remain compatible, repeated resolution cannot double-count evidence, and later resets cannot mutate captured evidence.

## 3. Terminal Session Lifecycle

- [x] 3.1 Add an explicit active/results lifecycle and idempotent finalization command to shared workday orchestration, producing one evaluated immutable result at 17:00.
- [x] 3.2 Finalize passive time only after synchronizing systems through the terminal instant, then prevent later clock, coding, scheduler, escalation, consequence, disruption, need, booster, resource, and metric changes.
- [x] 3.3 Complete an already accepted action-time decision and its declared effects exactly once before finalization when that action reaches 17:00, while suppressing later queued work.
- [x] 3.4 Preserve recoverable play when Stamina, PO Happiness, or System Stability reaches zero before 17:00 and expose any unrecovered terminal zero as score and ending evidence.
- [x] 3.5 Update headless simulation to consume the shared terminal result without changing deterministic replay, terminal time, pacing statistics, or representative policy behavior.
- [x] 3.6 Add orchestration tests for passive and action-time boundary crossings, simultaneous terminal signals, queued deadlines, resource-zero recovery, post-results no-ops, and fresh lifecycle state after reset.

## 4. Results Presentation and Replay

- [x] 4.1 Add a results presentation boundary or scene that consumes only the evaluated result and renders the ending title, short narrative, bounded total, all category contributions, and representative work/incident/booster statistics.
- [x] 4.2 Transition from the workstation exactly once at finalization, cancel all held coding sources, and block pointer, touch, keyboard, modal, task, alert, and quick-action interaction behind results.
- [x] 4.3 Add one guarded restart control that disposes the completed run and scene-owned subscriptions, timers, listeners, overlays, and callbacks before constructing a fresh 09:00 workstation session.
- [x] 4.4 Ensure a held pointer or keyboard source and duplicate touch activation cannot start coding or create multiple new sessions across restart.
- [x] 4.5 Add focused presentation/lifecycle tests for displayed explanation data, single transition, single restart, minimum-viewport layout, and stale completed-run callbacks failing to affect the new run.

## 5. Verification

- [x] 5.1 Run the complete unit test suite and production build/type checks, resolving regressions without adding presentation/audio polish, persistence, new mechanics/content, difficulty modes, or deployment work.
- [x] 5.2 Run the fixed-seed accelerated simulation matrix and verify every run captures one immutable 17:00 result while preserving deterministic reports and existing pacing bounds.
- [x] 5.3 Browser-playtest passive and decision-action transitions into results, confirm the ending and score explanation match observed run facts, and verify no hidden gameplay continues.
- [x] 5.4 Browser-playtest restart with mouse, touch, keyboard, held input, and duplicate activation, confirming a clean 09:00 run with no leaked timers, events, results, observers, or input.
- [x] 5.5 Browser-playtest the results view at desktop and the minimum supported touch viewport, confirming the ending, narrative, complete score breakdown, statistics, and restart action remain readable and non-overlapping.
