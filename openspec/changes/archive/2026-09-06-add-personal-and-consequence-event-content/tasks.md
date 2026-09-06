## 1. Context and Content Contracts

- [x] 1.1 Add `personal` and `consequence` interruption categories while preserving compatibility for all existing catalog definitions and generic presentation behavior.
- [x] 1.2 Extend immutable run context and validated eligibility predicates with need stages, booster-use counts, incident occurrence history, and concluded-consequence identities.
- [x] 1.3 Add validated causal-provenance metadata for consequence definitions, including referenced events, choices, queue conclusions, incident history, and current-state causes.
- [x] 1.4 Add stable deduplication-key and bounded game-time cooldown metadata, rejecting malformed keys, durations, references, thresholds, and counts before scheduling.
- [x] 1.5 Add domain tests for valid and invalid new categories, contextual predicates, provenance, deduplication metadata, cooldown bounds, and backward compatibility.

## 2. Run History, Cooldowns, and Deterministic Scheduling

- [x] 2.1 Add run-scoped normalized history for booster counts, incident occurrences, resolved choices, and concluded consequences, with immutable snapshots and complete reset behavior.
- [x] 2.2 Track each handled definition or equivalence key's cooldown deadline against authoritative game time and expose it to scheduler eligibility.
- [x] 2.3 Filter active-equivalent and cooling-down candidates before weighted random selection without consuming an extra draw or changing runs where no filter applies.
- [x] 2.4 Add deterministic scheduler tests for active deduplication, cooldown start and expiry, pause behavior, queue capacity, identical-history replay, and unchanged legacy sequences.

## 3. Needs and Consequence Integration

- [x] 3.1 Include current sleepiness and toilet stages plus Coffee and Coke Zero consumption counts whenever the workstation builds authoritative interruption run context.
- [x] 3.2 Record resolved event choices, incident occurrences, and concluded delayed or probabilistic consequences with the stable identities required by consequence eligibility and provenance.
- [x] 3.3 Reconcile active personal warnings after authoritative need changes so relief dismisses or disables stale warnings without duplicating resolution or effects.
- [x] 3.4 Apply the documented effect, context-refresh, resolution-finalization, stale-warning cleanup, and scheduler-advance order for decisions and action-time changes.
- [x] 3.5 Add tests for threshold entry, bathroom relief, booster-count eligibility, resolving-state relief, consequence provenance, exact-once history, pause, and fresh-run reset.

## 4. Personal Event Pack

- [x] 4.1 Author exactly four presentation-independent personal definitions covering sleep warnings, bathroom urgency, coffee-related pressure, and an accidental mistake.
- [x] 4.2 Gate each definition by explicit current need, booster, or run-state facts and give equivalent warnings shared deduplication keys with sensible data-driven cooldowns.
- [x] 4.3 Give every personal event at least two distinct choices with concise copy and bounded time, resource, Focus, need, or booster-related trade-offs.
- [x] 4.4 Add content tests proving all four definitions are valid and reachable, warnings become eligible at declared thresholds, and relief suppresses matching warnings.

## 5. Consequence Event Pack

- [x] 5.1 Author exactly five presentation-independent consequence definitions covering coffee crashes, shortcut regressions, repeated incidents, and comedic follow-on mistakes.
- [x] 5.2 Give every consequence definition a validated, inspectable cause tied to a prior choice, concluded consequence, incident history, or current authoritative state.
- [x] 5.3 Ensure delayed or probabilistic outcomes remain explicitly uncertain and do not expose hidden outcomes through player-facing copy while retaining debug provenance.
- [x] 5.4 Add content tests proving all five definitions are valid, reachable only after their declared cause, mechanically distinct, and traceable to the expected history.

## 6. Catalog Assembly and Audit

- [x] 6.1 Assemble the personal and consequence packs with the existing 21 definitions exactly once, producing a 30-event MVP catalog without changing existing IDs or pulling in later content.
- [x] 6.2 Extend whole-catalog audit for the inclusive 25–30 total, exact four/five new split, required subjects, unique identities, reference integrity, reachability, provenance, equivalence metadata, and choice-pattern diversity.
- [x] 6.3 Add deliberately malformed fixtures proving invalid totals, unreachable definitions, missing causes, unknown references, conflicting deduplication data, invalid cooldowns, and equivalent choice signatures fail before scheduling.
- [x] 6.4 Add a deterministic accelerated-run fixture that deliberately advances required state and encounters at least one Product Owner, teammate, production, tooling, personal, and consequence event without errors.

## 7. Workstation Integration and Cleanup

- [x] 7.1 Wire the assembled 30-event catalog and enriched immutable run context into the workstation's existing scheduler and interruption session boundaries.
- [x] 7.2 Extend generic alerts and decisions for personal and consequence category labels, causal debug information, cooldown-aware availability, and current-state copy without event-ID conditionals.
- [x] 7.3 Ensure stale-warning dismissal stops held coding or decision state only when required and preserves exact-once choice effects, Focus disruption, and scheduler ordering.
- [x] 7.4 Ensure restart and scene shutdown clear event history, cooldowns, stale-warning state, observers, inputs, and all run-scoped listeners without adding wall-clock timers.

## 8. Verification

- [x] 8.1 Run the complete unit test suite and production build/type checks, resolving regressions while preserving roadmap Chunks 01–11 behavior.
- [x] 8.2 Run the seeded accelerated catalog scenario repeatedly and confirm identical ordering, all six categories, 30 valid definitions, exact-once resolutions, and no runtime errors.
- [x] 8.3 Browser-playtest sleep and toilet warnings through threshold and relief, repeated Coffee use through a crash consequence, and a shortcut through a traceable regression.
- [x] 8.4 Browser-playtest cooldown expiry, equivalent-warning deduplication, decision pause/action-time ordering, restart cleanup, and the largest mixed alert set with mouse and touch at supported viewport sizes.
