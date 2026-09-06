## Context

The current interruption model validates immediate resource and Focus effects and returns escalation transitions to `Workstation`. The scene applies those effects directly in two separate paths: choice resolution and escalation processing. `EventScheduler` already provides absolute game-time deadlines and a seeded random source, while `DayState` owns bounded resources and decision action-time jumps. Technical Debt is visible and mutable but does not yet affect future behavior.

The preceding scheduler design deliberately returns domain transitions rather than taking ownership of workday resources, anticipating a presentation-independent effect layer. The implementation must preserve resolution-before-catch-up ordering, pause semantics, deterministic queue order, and the current no-persistence boundary.

## Goals / Non-Goals

**Goals:**

- Establish one validated domain path for applying all effect kinds.
- Make delayed and probabilistic consequences deterministic under frame partitioning and seeded replay.
- Keep event scheduling randomness stable when consequence logic changes.
- Represent Technical Debt influence as explicit content configuration with bounded calculations.
- Keep scene integration small enough for later needs, boosters, tasks, and content packs to reuse.

**Non-Goals:**

- Persist consequences across browser reloads or separate runs.
- Add the final consequence-event catalog or balance final probabilities.
- Add generic scripting, arbitrary predicates, or a full rules engine.
- Make every event or effect sensitive to Technical Debt.
- Introduce task-queue progress rollback before Chunk 09 owns real task selection and progress.

## Decisions

### Introduce a domain effect engine with explicit ports

Add an effect engine that receives validated effect data plus a small execution context. Immediate resource and Focus effects call injected domain commands; delayed effects enqueue consequence definitions; probabilistic effects use an injected random source and recursively execute exactly one branch. The engine returns immutable feedback and scheduling records for the caller to present.

`Workstation` remains the composition root: it wires `DayState`, `CodingSession`, the consequence queue, and feedback presentation into the engine. Both choice resolution and escalation processing use this same path. The engine does not import Phaser, scene types, or concrete UI objects.

Alternative considered: continue expanding `Workstation` conditionals. That duplicates ordering and validation logic, makes isolated tests difficult, and would force later mechanics to know about presentation.

### Model compound effects as a validated discriminated union

Retain the existing immediate `resource` and `focus` variants and add explicit `delayed` and `probability` variants. A delayed effect contains a stable consequence identifier, positive game-time delay, nested effect list, and scheduled/concluded feedback text. A probability effect contains a base chance, optional debt modifier, success effects, optional failure effects, and outcome feedback. Validation recursively checks nested effects, finite values, probabilities within `[0, 1]`, positive delays, non-empty identities/text, and a defensive maximum nesting depth.

Alternative considered: define arbitrary callbacks in content. Callbacks cannot be validated or serialized, conceal dependencies, and make deterministic replay harder to reason about.

### Keep one consequence queue ordered by absolute deadlines

The consequence queue owns pending records containing identity, source identity, absolute elapsed-game-time deadline, stable creation sequence, and validated effects. Synchronization receives authoritative elapsed game time and drains all due records in `(deadline, sequence)` order, returning them for effect execution. Queue records remain intact through ordinary frames, pauses, and modal decisions because only advancing game time can cross a deadline.

When a decision spends time, its immediate effects are executed and the interruption is finalized first. After the decision pause is released, one catch-up loop drains scheduler transitions and consequence deadlines in chronological batches. Each pending record is removed before its effects execute, preventing re-entrant processing from firing it twice.

Alternative considered: Phaser timers or decrementing wall-clock durations. Those violate pause semantics, complicate action-time jumps, and couple the mechanic to a scene lifecycle.

### Use independent deterministic random streams

Create separate seeded random instances for event scheduling and consequence resolution. A run derives or explicitly supplies both seeds, and reset restores each stream. Consequence draws occur only when their probability effect is evaluated. This guarantees that adding a probability check cannot perturb interruption selection.

Alternative considered: share `EventScheduler`'s random source. Although reproducible in one version, unrelated consequence draws would change later event order and make content changes unexpectedly alter scheduler tests and balance.

### Define Technical Debt modifiers as bounded linear content data

Use a reusable modifier shape containing a per-debt-point coefficient and optional minimum/maximum effective bounds. The effective value is `clamp(base + technicalDebt * coefficient, minimum, maximum)`. At zero debt the base value is unchanged. Apply modifiers only where content declares them: initially consequence probability and scheduler selection weight, with severity and resolution-cost support available to representative content only if required by acceptance tests.

The scheduler receives current Technical Debt or a weight resolver at the moment it draws among eligible definitions. It performs a stable weighted selection in content order. Once selected, candidates keep their identity, due time, and sequence even if debt later changes.

Alternative considered: hard-code global debt tiers. Tiers are easy to display but create discontinuities and make it difficult for later event packs to opt individual events in or out.

### Treat consequence feedback as domain output, not a new interruption

Scheduling and conclusion produce immutable feedback records with a stable consequence/source identity, lifecycle kind, tone, and concise text. `Workstation` renders the latest records in a small existing-region treatment or transient text and owns their visual lifetime. Feedback does not consume active-event capacity and cannot be opened as a decision.

Alternative considered: represent every consequence as an interruption. Chunk 12 owns consequence events; forcing all feedback through the alert lifecycle now would conflate notification with player choice and distort capacity behavior.

### Demonstrate four incident outcomes without inventing Chunk 09 mechanics

Update the representative production incident to include Hotfix, Investigate Properly, Rollback, and Ignore. Hotfix supplies immediate benefits, debt, and seeded delayed risk. Investigation uses a larger time/Stamina cost without shortcut debt. Ignore creates an explicit cost/risk while still resolving the modal choice; it remains distinct from the alert-level Ignore command that advances escalation. Rollback uses a typed task-progress effect to reduce the existing single `CodingSession` task's progress by a bounded amount. This establishes only the effect port and single-task behavior; task selection and multi-task rollback remain deferred to Chunk 09.

Alternative considered: pull the engineering task queue into this change to support exact feature-progress reset. That violates the roadmap order and would create an undeclared dependency on Chunk 09.

## Risks / Trade-offs

- [Recursive compound effects can create cycles or excessive execution] → Content is data-only, nested arrays have a validation depth limit, and execution has a defensive transition bound.
- [Action-time jumps can make scheduler and consequence deadlines interleave ambiguously] → Define stable ordering: finalize the selected decision, then drain due work by absolute deadline and stable subsystem order, repeating until no due work remains.
- [Debt modifiers can make probabilities or weights invalid] → Clamp effective values and reject invalid bases, coefficients, and bounds during content validation.
- [A zero total event weight leaves no valid selection] → Reject negative/non-finite weights and define a deterministic no-selection result when all currently eligible weights are zero.
- [Short feedback may be missed or obscure controls] → Keep feedback non-modal, bounded in count/lifetime, and test it at the minimum supported viewport.
- [The repository contains existing uncommitted changes in integration files] → Limit implementation edits to targeted sections, inspect diffs before modifying shared files, and preserve unrelated work.

## Migration Plan

1. Add effect/consequence data types, recursive validation, bounded modifier calculation, and isolated unit tests while preserving existing immediate content.
2. Add the independently seeded consequence queue and effect engine with deadline, reset, probability, and exactly-once tests.
3. Extend scheduler selection to accept validated base/debt-adjusted weights without changing already-created candidates.
4. Route current choice and escalation effects through the engine, then add consequence catch-up and feedback presentation to `Workstation`.
5. Expand the representative production content and its decision previews with the four resolution patterns.
6. Run unit tests, production build, and focused browser playtests for hotfix, proper fix, pause, action-time jump, and deterministic replay behavior.

Rollback restores immediate-only content and direct effect application, removes consequence synchronization and weighted selection, and leaves the existing resource state and scheduler APIs usable. No persisted data requires migration.
