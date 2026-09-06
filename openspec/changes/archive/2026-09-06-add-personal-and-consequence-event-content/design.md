## Context

See `proposal.md` for motivation. The assembled catalog currently contains 21 events: six Product Owner, five teammate, six production, and four tooling definitions. Eligibility can inspect selected/completed tasks, resolved events and choices, and resources; the scheduler is seeded and uses authoritative game time. Player needs, booster counts, and consequence feedback already exist as separate domain state, but they are not part of interruption eligibility, and interruption categories do not yet include personal or consequence content.

Chunk 12 must add roughly four personal and five consequence events, bringing the current catalog to 30 without changing pacing globally. Timed behavior must continue to freeze through the authoritative workday clock, and content must stay presentation-independent.

## Goals / Non-Goals

**Goals:**

- Assemble exactly four personal and five consequence definitions under the existing catalog boundary.
- Make need, booster, prior-choice, incident-history, and concluded-consequence conditions deterministic and independently testable.
- Prevent stale or repetitive warnings through explicit equivalence keys, authoritative-time cooldowns, and relief synchronization.
- Preserve scheduler randomness isolation and expose enough provenance for catalog audits and later balance tooling.
- Keep Phaser responsible only for wiring current domain snapshots and rendering generic alerts/decisions.

**Non-Goals:**

- Do not tune time bands, global spawn weights, or session duration; Chunk 13 owns pacing and balance.
- Do not add new needs, boosters, inventory, ending rules, final visual/audio polish, or more than 30 MVP events.
- Do not replace the consequence queue with interruption events or persist history between runs.

## Decisions

### Extend immutable run context with normalized facts

Add typed facts for need stages, booster counts, incident occurrence counts, and concluded consequence IDs to the immutable context used by eligibility. Extend eligibility predicates with narrowly typed comparisons rather than arbitrary callbacks. This preserves validation, serialization-like inspection, and deterministic tests.

Alternative considered: let content supply predicate functions. Rejected because functions hide dependencies, cannot be audited for reachability, and encourage content logic to leak across modules.

### Keep consequence execution and consequence event content distinct

The existing queue continues to own timed/probabilistic effect execution. Consequence-category interruptions are player-facing follow-on dilemmas whose eligibility cites a causal provenance record. Queue conclusions and resolved choices append normalized run-history facts that definitions may reference.

Alternative considered: render every queued effect as an interruption. Rejected because it would change established exact-once timing semantics and turn automatic consequences into modal decisions.

### Model repetition control as catalog metadata plus run-scoped history

Definitions may declare a stable equivalence key and non-negative cooldown duration. The scheduler filters candidates against active equivalence keys and last-handled game-time records before weighted selection. Cooldowns use authoritative game time, are cleared on reset, and do not progress while paused. Filtering happens before the scheduler's weighted random draw so identical histories remain replayable.

Alternative considered: encode one-off suppression into each definition's eligibility tree. Rejected because it duplicates policy, makes equivalent warnings difficult to audit, and does not generalize to cooldowns.

### Reconcile active need warnings immediately after authoritative state changes

After needs advance or are relieved, the orchestration layer rebuilds run context and asks the interruption session to dismiss active, non-deciding personal warnings whose threshold is no longer satisfied. If a matching decision is already resolving, normal exact-once resolution finishes; stale effects cannot execute again. The same synchronization point updates scheduler eligibility.

Alternative considered: leave already active warnings visible until chosen. Rejected because the roadmap explicitly requires warnings to stop after relief and stale urgency copy would contradict authoritative state.

### Validate the complete catalog at one assembly boundary

Keep the two new content packs data-only and extend the whole-catalog audit to verify the inclusive 25–30 total, exact four/five new split, required subjects, reachability contexts, valid references, cause provenance, equivalence metadata, and distinct choice signatures. A deterministic harness drives state transitions needed to encounter at least one event in all six categories; it uses the scheduler's seed rather than a second selection algorithm.

Alternative considered: validate each module only in isolation. Rejected because cross-pack IDs, category totals, reachability, and repeated choice patterns are catalog-wide properties.

### Keep UI integration generic and cleanup run-scoped

The workstation supplies needs, boosters, histories, and concluded consequences when building run context, and extends generic category labels/styles for personal and consequence events. It does not branch on individual event IDs. Reset and scene shutdown clear cooldown/history state and unsubscribe existing domain observers; no wall-clock timers are added.

## Risks / Trade-offs

- [Adding facts to run context can make snapshots bulky] → Store compact primitives and immutable ID/count collections only; keep authored copy and effects in content definitions.
- [A 30-event catalog may make cross-category seeded coverage fragile] → Use a fixed test fixture with deliberate state transitions and bounded scheduling windows, and separately test eligibility predicates directly.
- [Relief and decision resolution can race in orchestration order] → Define one synchronization order: apply action/effects, refresh authoritative context, finish exact-once resolution, then dismiss other stale warnings and advance scheduling.
- [Cooldown filtering can perturb established seeded sequences] → Filter before random selection and assert unchanged sequences when no cooldown or equivalence rule applies.
- [Cause metadata could reveal uncertain outcomes] → Expose provenance to validation/debug state while player copy continues to use declared certainty metadata.
- [Choice-diversity audits can overfit wording] → Compare normalized mechanical signatures and require meaningful mechanical distinction, not lexical uniqueness.

## Migration Plan

1. Extend category, run-context, eligibility, provenance, equivalence, and cooldown contracts while keeping every existing definition valid by default.
2. Add run-scoped event history/cooldown tracking and scheduler/session filtering with deterministic domain tests.
3. Connect current needs, booster counts, resolved choices, incident history, and concluded consequence records to context construction and relief synchronization.
4. Author four personal and five consequence definitions, then assemble and audit the full 30-event catalog.
5. Add unit, seeded accelerated-run, and focused browser coverage; run the full test suite and production build/type checks.

Rollback removes the additive definitions and metadata and restores the prior 21-event catalog. No persisted data, dependency, or external migration is involved.

## Open Questions

- Exact event copy, numeric effects, need thresholds, cooldown durations, and per-definition weights may be tuned during implementation as data-only values, provided the exact four/five split, inclusive catalog limit, traceability, suppression, and deterministic acceptance requirements remain satisfied.
