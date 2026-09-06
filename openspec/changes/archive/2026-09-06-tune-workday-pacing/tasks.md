## 1. Pacing Profiles and Time Bands

- [x] 1.1 Define typed immutable pacing-profile and time-band contracts covering normal and developer/test time scales, spawn intervals, category weights, escalation pressure, need drain, and guardrail values.
- [x] 1.2 Add validation for exact ordered 09:00–17:00 coverage, the five named bands, finite bounded modifiers and thresholds, known category/need keys, and valid profile identities.
- [x] 1.3 Implement pure active-band lookup and interval splitting so frame updates and action-time jumps crossing several boundaries produce step-size-independent results.
- [x] 1.4 Add domain tests for valid profiles, malformed gaps/overlaps/order/bounds, exact boundaries, multi-band jumps, pause stability, and normal-versus-developer profile behavior.

## 2. Band-Aware Scheduling and Escalation

- [x] 2.1 Extend scheduler configuration to resolve band-specific spawn intervals and category weight modifiers at each authoritative due time while composing existing PO Happiness and Technical Debt weights within bounds.
- [x] 2.2 Apply band-specific escalation pressure to remaining content-defined delays without skipping, repeating, or reordering stages and without changing already queued event identities.
- [x] 2.3 Add deterministic flood protection based on active-plus-pending pressure that defers ordinary spawns without exceeding capacity, dropping candidates, or changing pending order.
- [x] 2.4 Add authoritative-game-time quiet tracking and trigger the next eligible opportunity through the existing seeded selection pipeline without forcing ineligible content.
- [x] 2.5 Add scheduler/session tests for quieter morning weights, 14:00–16:00 pressure, boundary deadlines, flood deferral/recovery, eligible and empty quiet deadlines, pause behavior, random-draw stability, and identical seeded replay.

## 3. Band-Aware Needs and Shared Run Orchestration

- [x] 3.1 Extend need progression to apply each crossed band's configured Sleepiness and Toilet Need rates while preserving thresholds, chronological transitions, exact-once critical episodes, and neutral omitted modifiers.
- [x] 3.2 Extract presentation-independent workday orchestration for clock, coding, tasks, scheduler, interruptions, needs, boosters, consequences, and disruptions using the established action and synchronization order.
- [x] 3.3 Move workstation runtime wiring to the shared orchestration without changing input, decision pauses, action-time processing, content eligibility, recovery actions, or the 17:00 terminal clock boundary.
- [x] 3.4 Ensure run reset and scene shutdown clear pacing counters, pending deadlines, observers, inputs, and debug objects without introducing wall-clock timers or listener leaks.
- [x] 3.5 Add regression tests for multi-band need accumulation, pause and action-time jumps, orchestration exact-once ordering, fresh-run reset, and compatibility with Chunks 01–12 behavior.

## 4. Seeded Simulation and Balance Reports

- [x] 4.1 Add a deterministic player-policy contract that chooses only currently legal coding, decision, task-switch, bathroom, and booster actions and rejects invalid or non-progressing policies descriptively.
- [x] 4.2 Implement a headless full-day runner over the shared orchestration that terminates exactly at 17:00 for a validated profile, seed, time step, and player policy.
- [x] 4.3 Report per-band spawns and resolutions, quiet durations, peak active/pending pressure, resource and need extrema, critical and recovery windows, task progress/completions, booster use, and the terminal snapshot.
- [x] 4.4 Define a documented fixed seed and representative-policy matrix, then add replay tests proving identical inputs yield identical reports and different simulation step sizes preserve equivalent game-time outcomes.
- [x] 4.5 Add automated balance assertions that morning pressure is lower than 14:00–16:00, all simulations reach 17:00, floods and long empty periods stay within configured bounds, and representative runs retain recovery from one critical resource without guaranteeing success.

## 5. Balance Tuning and Debug Visibility

- [x] 5.1 Tune the five band boundaries and normal-profile clock, spawn, weight, escalation, need, task/resource, booster, and guardrail values using the simulation matrix while keeping all values data-driven.
- [x] 5.2 Tune the developer/test profile to complete materially faster than normal while retaining the same rules, event catalog, eligibility behavior, and seeded ordering guarantees.
- [x] 5.3 Expose an immutable debug snapshot containing profile, seed, active band, event pressure, quiet duration, and compact resource/need statistics.
- [x] 5.4 Add a compact development-flagged workstation overlay or run summary, disabled and non-interactive by default, that remains readable without covering primary controls at the minimum supported viewport.
- [x] 5.5 Add tests for diagnostics enablement/default absence, snapshot accuracy, viewport fit, and cleanup on reset and scene shutdown.

## 6. Verification

- [x] 6.1 Run the complete unit test suite and production build/type checks, resolving regressions without adding endings, new mechanics/content, named difficulty modes, presentation polish, or deployment work.
- [x] 6.2 Run the full fixed-seed simulation matrix repeatedly and record evidence for 17:00 completion, per-band pressure, guardrail bounds, recovery availability, and deterministic reports.
- [x] 6.3 Browser-playtest an accelerated full day through every pacing band, including an action-time boundary jump, decision pause, flood protection, quiet-period behavior, a critical-resource recovery, and clean 17:00 stop with no console errors.
- [x] 6.4 Browser-playtest the debug overlay at desktop and minimum supported touch viewport, then confirm normal presentation hides it and resize/shutdown leaves no stale UI or listeners.
- [x] 6.5 Time a representative normal-profile manual run excluding decision/tab pauses and verify it completes within 10–20 real minutes while always offering a meaningful action and keeping one critical-resource state recoverable.
