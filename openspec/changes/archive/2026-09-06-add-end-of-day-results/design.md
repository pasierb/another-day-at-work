## Context

See `proposal.md` for motivation and `specs/end-of-day-results/spec.md` for behavior. The current `DayState` clamps at 17:00, `WorkdaySession` coordinates all domain systems for headless simulations, and `Workstation` owns scene input and lifecycle cleanup while delegating run state to that session. Existing snapshots already expose final resources, needs, task completion, interruption outcomes, incident counts, and booster consumption, but no single immutable terminal aggregate exists and coworker-karma evidence is not yet explicitly classified.

The results flow must finish an action that reaches 17:00 before capture, prevent every later domain transition, and reuse the same evaluation rules in tests, simulations, and Phaser presentation. Chunk 15 owns presentation/audio polish, so this change uses the established primitives and visual hierarchy.

## Goals / Non-Goals

**Goals:**

- Make terminal capture and result evaluation presentation-independent, immutable, deterministic, and directly fixture-testable.
- Give one owner responsibility for the active-to-results transition and make its ordering explicit for passive and action-time completion.
- Preserve enough typed run history to explain every score category and ending without parsing display copy or inferring from mutable content after the run.
- Dispose and reconstruct run-scoped scene and domain state through the existing lifecycle boundary on replay.

**Non-Goals:**

- Do not create persistence, leaderboards, achievements, analytics, a generalized campaign/session history, or difficulty-specific ending tables.
- Do not redesign the workstation, add animation or audio, author new events/tasks, or retune pacing and balance outside result-rule constants.
- Do not introduce early hard game-over transitions; existing resource bounds and action availability remain authoritative until 17:00.

## Decisions

### Capture a dedicated terminal record at the session boundary

Add an immutable terminal snapshot assembled by the presentation-independent session from `DayState`, task queue, interruptions, needs, boosters, and run metrics. The session owns an explicit active/results lifecycle and an idempotent finalize command. Its ordinary advance/action entry points reject or no-op after finalization as appropriate, so Phaser, simulations, and tests share one freeze guarantee.

For a passive tick, synchronize all systems only through the actual time delta ending at 17:00, then finalize. For a decision or other action whose cost reaches 17:00, complete the already accepted action and its effects/resolution in the established exact-once order, perform synchronization through the terminal instant, release its pause owner, then finalize. No later queued deadline is processed.

Alternative considered: let `Workstation` notice `DayState.isDayComplete` and read live objects directly. Rejected because simulations would use different behavior, repeated scene updates could recapture divergent values, and hidden domain updates could continue behind the overlay.

### Keep scoring and ending selection as pure validated configuration

Create pure evaluation functions over the terminal record and immutable configuration. Scoring rules produce named line items, raw evidence, signed contributions, and a bounded total. Exact weights and thresholds live together as data and receive validation for finite ranges, unique identities, complete categories, and a valid fallback.

Ending definitions contain stable IDs, user-facing titles/narratives, integer priority, declaration order, and predicates over typed terminal facts. Evaluation sorts by priority and declaration order and selects the first match. Seven rules cover the named GDD endings; `Staff Engineer` is the unconditional lowest-priority fallback, making every run resolvable. Specialist thresholds must be achievable with the five-task MVP catalog, even when a title's illustrative GDD copy mentions a more exaggerated result.

Alternative considered: encode the ending tree as scene conditionals. Rejected because ordering would be difficult to validate, fixtures could not test it without Phaser, and later copy changes could accidentally alter behavior.

### Record result evidence at the action boundary

Extend run metrics with immutable typed resolution facts rather than recomputing them from UI text. Each handled interruption record retains event ID, category, incident classification where relevant, chosen choice ID, and a small result-scoring classification. Coworker karma is derived from explicit scoring tags on existing team-event choices; incidents resolved count completed player-fixable production/tooling decisions and remain distinct from merely spawned, escalated, or external incidents. Need history retains enough information to distinguish terminal pressure from severe episodes such as sustained bathroom urgency. Booster scoring uses the existing consumption counts.

The tags classify existing choices for evaluation and do not add or change event effects. Catalog validation rejects missing/invalid result tags only where a result category requires them.

Alternative considered: infer karma and incident resolution from resource deltas or choice labels. Rejected because identical effects can represent different intent, copy is not a stable API, and resource clamping loses the original contribution.

### Separate result model from its Phaser view

Use a results view/scene that accepts the immutable evaluated result and renders title, narrative, line items, key statistics, and a guarded restart control using current shapes, text, scale rules, and input primitives. Entering results first cancels all held coding sources and disables workstation interactivity; scene shutdown removes subscriptions, timers, listeners, and overlays. The result view never reads live run state.

Restart is a single guarded transition that destroys the completed session and re-enters `Workstation`, whose existing `create` path constructs a new session. Input state is cleared on both sides so replay requires a fresh press.

Alternative considered: reset the same session in place beneath a modal. Rejected because stale callbacks and observers are harder to prove absent and the results snapshot could retain aliases to reset objects.

### Treat zero resources as terminal evidence, not an early exit

Stamina, PO Happiness, and System Stability at zero continue to use existing mechanics until 17:00. A terminal zero produces a visible catastrophe line item and participates in ending predicates. Recovery above zero removes the terminal-zero condition; historical conditions are considered only by rules that name retained episode evidence. This preserves the GDD preference for funny consequences over harsh failure and does not add hidden rescue mutations.

Alternative considered: transition immediately to results at the first zero. Rejected because it contradicts the roadmap's recoverable-crisis requirement and would shorten the paced workday unpredictably.

## Risks / Trade-offs

- [Terminal action ordering could omit or duplicate effects] → Centralize finalization in `WorkdaySession`, specify passive and accepted-action paths separately, and test boundary crossings with queued events/consequences and open decisions.
- [Current scene methods still directly coordinate some actions around the shared session] → Route terminal-sensitive entry points through session commands or one lifecycle guard before adding results, then regression-test existing exact-once behavior.
- [Retrofitting scoring tags could accidentally alter catalog reachability] → Keep tags additive, validate them independently of scheduler eligibility, and assert the assembled 30-event catalog and seeded schedules remain unchanged.
- [Seven endings can overlap heavily] → Document priority in data, add one fixture per ending plus overlap fixtures, and require the fallback to be last.
- [A result screen may overflow before Chunk 15 polish] → Use a compact fixed layout at the existing logical resolution and verify desktop plus the minimum supported touch viewport.
- [Restart can leak scene callbacks or held input] → Reuse scene shutdown cleanup, guard transition activation, and test old timers/deadlines and input sources against a new session identity.

## Migration Plan

1. Add terminal evidence, scoring configuration, ending definitions, validation, and pure evaluators with fixture tests.
2. Extend run metrics and existing content metadata only enough to provide typed karma, incident, catastrophe, and need evidence while preserving scheduling and effect behavior.
3. Add the idempotent session finalization lifecycle and route workstation/simulation terminal handling through it.
4. Add the results presentation and guarded fresh-session restart, then verify scene cleanup and fresh-input behavior.
5. Run the complete unit suite, production build/type checks, accelerated full-day simulation, and browser playtests at supported viewports.

Rollback removes the results evaluator/view and restores the prior terminal clock behavior. No persisted data, dependency, network contract, or data migration is involved.

## Open Questions

- Exact scoring weights and specialist-ending thresholds are implementation-time balance constants; they may be tuned within the specified categories, reachability, deterministic priority, fallback, and explanation requirements without changing the behavior contract.
