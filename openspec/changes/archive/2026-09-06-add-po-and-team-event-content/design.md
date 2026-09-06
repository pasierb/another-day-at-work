## Context

The current implementation has three validated interruption definitions, a seeded weighted scheduler, an `InterruptionSession` lifecycle, a reusable effect engine, and an engineering task queue. Scheduler selection currently sees definition weights and Technical Debt but no task or choice history; interruption snapshots retain resolved event IDs but not selected choice IDs. `Workstation` is the composition root for these models. See `proposal.md` and the delta specs for the Chunk 10 behavior.

## Goals / Non-Goals

**Goals:**

- Keep the eleven-event Product Owner/team catalog declarative and testable without Phaser.
- Evaluate contextual eligibility and PO pressure from a stable per-selection snapshot without transferring state ownership to content or the scheduler.
- Preserve seed replay, random-stream isolation, pause semantics, queue stability, and one-time effects.
- Make content coverage, reference integrity, and reachability auditable before a run starts.
- Keep scene input/listener cleanup and content presentation compatible with the existing workstation lifecycle.

**Non-Goals:**

- Add the production/tooling, personal, or consequence packs from Chunks 11 and 12.
- Tune final day phases, spawn rates, or difficulty curves from Chunk 13.
- Build a general scripting language, arbitrary callbacks, persistent narrative state, or category-specific UI.
- Change active-event capacity, escalation timing semantics, or the existing consequence random stream.

## Decisions

### Compose one validated MVP interruption catalog

Split content into focused modules if useful, but export one stable combined catalog used by validation and the workstation. Expand or replace the existing representative PO and teammate definitions so the combined relevant totals are exactly six and five; retain the representative production event independently and do not count it toward this pack.

This avoids duplicate variants of the same sample being simultaneously schedulable and gives tests one authoritative catalog. The alternative—append eleven new definitions beside all samples—would overshoot the roadmap's approximate contribution and preserve redundant content.

### Use a small declarative eligibility vocabulary

Add optional predicates composed from stable facts needed by this chunk: selected/completed task IDs, resolved event IDs, and resolved event-choice outcome IDs. Support explicit all/any matching only where the authored pack needs it, validate every referenced task/event/choice against the loaded catalogs, and reject empty or contradictory predicates. Do not permit functions in content.

The scene builds an immutable context snapshot from `EngineeringTaskQueue`, interruption outcome history, and current resources at each spawn selection. The scheduler asks a pure eligibility evaluator to filter candidates. The alternative—callbacks closing over scene models—would be difficult to validate, serialize, or replay and would couple content to Phaser.

### Record stable resolution outcomes in the interruption domain

Extend resolved history with immutable records containing event ID and choice ID, while retaining the existing resolved-ID view if needed for compatibility. Commit the outcome as part of final one-time resolution, reset it with the session, and expose it to eligibility only after resolution is final.

This makes later events traceable to actual choices and avoids inferring narrative state from resource totals. The alternative—have `Workstation` maintain a second choice-history collection—would split lifecycle ownership and make restart cleanup easier to miss.

### Generalize bounded resource-sensitive selection weights

Represent the Chunk 10 PO Happiness modifier as validated content data analogous to the existing bounded Technical Debt modifier, with an explicit resource, direction/coefficient, and minimum/maximum effective weight. Evaluate modifiers only when a candidate is selected; queued candidates never reweight. Configure conservative caps and retain positive teammate weight at low PO Happiness.

This reuses one deterministic selection pipeline and permits unit tests to inject exact resource snapshots. The alternative—spawn an extra PO event whenever happiness crosses a threshold—would consume capacity outside the seeded scheduler and could create the prohibited feedback loop.

### Separate structural validation from catalog audit

Keep definition-level checks responsible for identities, choices, effects, escalation timings, follow-up graphs, eligibility syntax, and weight bounds. Add catalog audit for cross-references, category/topic totals, and reachability across a documented finite matrix of task/outcome contexts. Tests include deliberately malformed fixtures for each required failure family.

This allows small fixtures to test individual definitions while the shipped catalog receives stronger whole-pack guarantees. The alternative—one monolithic validator requiring the full production catalog—would make focused domain tests cumbersome.

### Model the public-channel escalation as authored event flow

Give at least one ignored teammate request a later stage whose copy clearly moves the complaint into a public channel and whose one-time effects and optional follow-up use the existing escalation path. The outcome remains traceable through stable source/follow-up IDs and does not introduce the general consequence-event pack reserved for Chunk 12.

The alternative—special-case a toast in `Workstation`—would not be independently testable and would bypass escalation cancellation.

### Preserve current timing and cleanup boundaries

Eligibility and weighting run only at spawn selection. Scheduler and escalation synchronization remain driven by authoritative game time and freeze under existing pauses. Content creates no timers or listeners. `Workstation` continues to dispose scene subscriptions and interactive objects on shutdown; the interruption session and scheduler reset all new run-scoped history and pending state for restart.

The alternative—reevaluate active or queued events whenever a resource/task changes—would retroactively change deterministic identities and ordering.

## Risks / Trade-offs

- [Eleven verbose decisions may overflow the current alert or modal layout] → Keep alert copy concise, reuse the scroll/fit constraints already established, and add desktop and minimum touch-viewport browser coverage.
- [Eligibility rules can accidentally eliminate the whole pool] → Audit documented contexts, define deterministic no-selection behavior, and ensure broadly eligible fallback PO/team definitions remain available.
- [Resource weighting can amplify low PO Happiness] → Bound modifiers, preserve non-PO selection probability, and test repeated low-happiness draws rather than adding immediate spawns.
- [Cross-catalog references can make module initialization cyclic] → Validate at the assembled catalog boundary and keep content modules data-only.
- [Adding outcome history can disturb existing lifecycle tests] → Preserve current resolved IDs and add outcome records additively with exact-once and reset tests.

## Migration Plan

1. Extend interruption content contracts, resolution history, eligibility predicates, and structural validation with compatibility tests for existing definitions.
2. Add the pure context evaluator and resource-sensitive weight calculation, then extend scheduler selection without changing already queued candidates or random ownership.
3. Author and assemble six Product Owner and five team definitions, including escalation paths, trade-offs, eligibility references, and the public-channel chain.
4. Add catalog audits and malformed fixtures for topic totals, cross-references, reachability, choices, effects, escalation, and eligibility.
5. Integrate immutable run-context snapshots into `Workstation`, then verify event decisions and expanded alert presentation at supported viewports.
6. Run unit tests, build/type checks, and focused seeded browser playtests.

Rollback restores the representative sample catalog and removes eligibility/outcome extensions from scheduler composition. No persisted data or external migration is involved.

## Open Questions

- Exact copy, numeric costs, escalation delays, and conservative weight caps may be tuned during implementation as data-only values, provided all specified coverage, distinct-trade-off, bounded-pressure, and replay requirements remain satisfied.
