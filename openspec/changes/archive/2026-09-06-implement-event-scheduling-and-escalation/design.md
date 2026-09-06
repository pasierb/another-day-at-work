## Context

The `Workstation` scene currently advances a framework-independent `DayState`, synchronizes a `CodingSession`, and gives an `InterruptionSession` the resulting elapsed game time. The interruption session validates content and owns `active → deciding → resolving → resolved`, but its constructor activates every definition immediately and definitions have only one copy/severity state. Choice action time can advance the authoritative clock while the decision pause is held. See `proposal.md` for motivation and the delta specs for behavioral requirements.

## Goals / Non-Goals

**Goals:**

- Keep selection, timing, escalation, and capacity behavior testable without Phaser or real timers.
- Preserve one authority for interruption lifecycle and one authority for workday time.
- Make random consumption and same-deadline ordering explicit enough for deterministic tests.
- Keep content declarative so later event-library and consequence changes extend it rather than replace it.
- Ensure scheduler cleanup consists of dropping owned state/subscriptions rather than cancelling ambient timers.

**Non-Goals:**

- Add probabilistic or delayed consequences, Technical Debt weighting, or final balance curves from later chunks.
- Add the full event library or day-phase pacing content.
- Introduce persistence, background execution, a general event bus, or Phaser timer ownership.
- Change the existing choice-effect vocabulary beyond reusing immediate effects for escalation stages.

## Decisions

### Separate scheduling policy from interruption lifecycle

Add a framework-independent scheduler that owns the seedable random source, next spawn deadline, eligible definition pool, pending due events, and active limit. Extend the interruption session with explicit activation, escalation, postpone, ignore, and cancellation-safe resolution commands. The scene supplies authoritative elapsed game time and applies emitted declarative effects through existing domain objects.

This keeps the scheduler concerned with *when and which* while the session remains concerned with *what state an event is in*. Alternative considered: merge everything into `InterruptionSession`. That creates one large model whose selection policy, lifecycle invariants, and presentation-facing snapshots become difficult to evolve independently.

### Use a tiny injected deterministic random source

Define a minimal random interface or seeded generator local to the game domain, and derive every interval and eligible-content selection from it. Consume randomness only when a new scheduled candidate is created; moving a due candidate through the capacity backlog does not draw again. Reset reconstructs the generator from the original seed.

Alternative considered: call `Math.random` and mock it in tests. Global randomness makes sequence ownership implicit and makes reset or parallel tests fragile.

### Represent timing as absolute game-time deadlines

Store the next spawn time and each event's next escalation time as elapsed-game-millisecond deadlines. An update receives the current game time and drains all due transitions in `(deadline, stable sequence)` order. No Phaser or wall-clock timer is created.

Alternative considered: decrement remaining durations by frame delta. Absolute deadlines are less sensitive to frame partitioning and naturally support action-time jumps.

### Make staged content additive to the existing base definition

Extend definitions with optional ordered escalation stages. Each stage declares its delay from the previous stage, replacement copy/severity, zero or more existing immediate effects, optional follow-up IDs, and a postpone duration. The active record stores its current stage index, next deadline, and stable activation sequence; snapshots expose the effective stage values.

Base definitions remain valid with no escalation stages, which limits migration risk for the current samples. Cross-reference validation rejects missing follow-up IDs, self-follow-ups, invalid durations, and duplicate identifiers before a run starts. Alternative considered: encode each stage as a separate full interruption. That duplicates choices and identity while making resolution cancellation across stages error-prone.

### Return transition effects instead of mutating workday resources

Scheduler/session commands return an ordered transition batch describing entered stages, immediate effects, and follow-up requests. `Workstation` applies effects through `DayState` and `CodingSession`, then feeds follow-ups into scheduler capacity handling. A per-event stage index and guarded lifecycle ensure each stage effect is returned once.

Alternative considered: give the interruption model references to resource owners. That would blur domain ownership and complicate Chunk 06's presentation-independent effect engine.

### Define postpone and ignore as explicit lifecycle commands

Postpone keeps the current stage and adds the stage's configured postponement duration to its current escalation deadline. Ignore enters exactly the next stage immediately through the same transition path used by elapsed time. Neither command applies to an open/resolving event or to a final stage; invalid attempts are idempotent no-ops.

Alternative considered: make “ignore” merely close a modal. The current decisions cannot be dismissed, and explicit alert-level controls better preserve the distinction between deliberate neglect and selecting a resolution choice.

### Use a stable FIFO backlog at capacity

When active capacity is full, due scheduled events and follow-ups enter one pending queue ordered by due game time and stable creation sequence. Resolving an active event drains the earliest pending candidate into the newly available slot without new random selection. Independent active events are never evicted.

Alternative considered: skip or reroll full-queue spawns. That makes results depend on frame timing and invisibly discards pressure the scheduler already created.

### Process decision action time after resolution becomes final

While the decision pause reason exists, ordinary scheduler synchronization performs no transitions. Choice effects and action time are applied, the selected event is finalized, and the decision pause is released. If no other pause reason remains, synchronize the scheduler to the new elapsed time and drain crossed deadlines chronologically. The resolved event has already cancelled its future stages, so it cannot escalate at the same timestamp; other problems still experience the time cost of the decision.

Alternative considered: process the clock jump while the modal remains open. That can reorder or mutate alerts behind a blocking decision and creates a resolution/escalation race.

### Derive urgency ordering without changing lifecycle order

Keep activation and pending sequence in domain snapshots, and derive display order using severity rank, age, then activation sequence. Presentation adds a distinct urgent treatment but does not reorder the scheduler's internal collections.

Alternative considered: sort the lifecycle collection in place. That would make equal-state ordering unstable and couple rendering needs to resolution behavior.

## Risks / Trade-offs

- [One update may cross many deadlines and emit a large transition batch] → Drain iteratively with a validated finite content graph and a defensive transition bound that fails loudly for cyclic/malformed content.
- [Follow-ups plus scheduled candidates can create a long backlog] → Keep the active cap strict, retain deterministic pending order, and expose pending count for tests/debugging without adding player-facing queue management.
- [Postponement can push a deadline past end of day] → Retain the deadline but suppress all transitions at or after terminal workday state.
- [Applying returned effects in the scene is not an atomic transaction] → Validate content up front, return immutable ordered batches, and reuse synchronous non-throwing commands for valid effects.
- [Current uncommitted Chunk 03–04 files overlap the likely implementation area] → Restrict apply work to targeted edits and inspect the dirty worktree before each affected-file change.

## Migration Plan

1. Add the seeded random source and scheduler with isolated determinism, reset, timing, and capacity tests.
2. Extend interruption definitions, validation, snapshots, and lifecycle commands while preserving non-escalating definition compatibility.
3. Convert representative content to scheduler eligibility and give at least one sample a complete escalation path and follow-up.
4. Integrate scheduler synchronization and ordered effect application into `Workstation`, then add alert-level postpone/ignore controls and urgency ordering.
5. Add browser scenarios for repeatable spawn order, escalation, decision/action-time catch-up, and full-capacity behavior.
6. Run the unit suite, production build, and focused playtest.

Rollback removes scheduler orchestration and restores direct initial activation of the representative definitions; no persisted state or external API requires data migration.
