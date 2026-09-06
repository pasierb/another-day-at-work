## Context

The current `CodingSession` integrates work, Stamina cost, and Focus growth continuously while presentation-owned pointer or Space-key sources remain held. `WorkdaySession` advances that model against authoritative game time and passes bounded work into `EngineeringTaskQueue`; `Workstation` owns input cancellation and renders the control. Tooling disruptions provide a run-scoped speed factor, while effects and seeded schedulers already support exact-once immediate and delayed consequences.

The new capability specifications replace input duration with a multi-phase AI work cycle while preserving the queue as the sole owner of task progress, the workday as the sole clock, and the existing effect infrastructure as the route for resource and consequence outcomes.

## Goals / Non-Goals

**Goals:**

- Establish one deterministic domain state machine for prompt-mode and plan-mode cycles.
- Keep all generated proposals and quality outcomes local, seeded, inspectable, and testable.
- Apply approved work through existing queue boundaries without duplicating progress ownership.
- Make review evidence stable and approval/revision actions idempotent.
- Keep coding-mode definitions data-driven so future modes do not require rewriting orchestration.

**Non-Goals:**

- Calling an LLM or generating actual source-code diffs.
- Implementing autonomous agentic-harness gameplay.
- Persisting unfinished AI cycles across reloads or runs.
- Redesigning the engineering task catalog, interruption catalog, or end-of-day scoring beyond balance adjustments required by the new loop.

## Decisions

### Replace `CodingSession` with a phase-oriented AI work-cycle model

Introduce a run-scoped domain model with these externally observable phases:

```text
available ──start(mode)──▶ planning/generating ──time──▶ review
   ▲                            │                           │
   │                            └──── cancel ───────────────┤
   │                                                        │
   ├────────────── approve(batch id) ◀──────────────────────┤
   │                                                        │
   └── generating revision ◀── revise(batch id) ────────────┘
```

Prompt mode starts in `generating`; plan mode starts in `planning` and transitions internally to `generating`. The snapshot exposes mode, phase, remaining/total game time, immutable current batch, revision tier, availability, and disabled reason. Commands include the expected task and batch identity so stale or repeated UI events are harmless.

This state machine replaces continuous request/update semantics because explicit phases match the player-visible mental model and make transition invariants testable. Retrofitting approval flags into the existing hold-oriented state would preserve confusing Focus and input assumptions.

### Treat modes as validated profiles, not branches throughout the code

Define prompt and plan profiles in content data. A profile declares planning duration, generation duration, proposed work range, review action costs, revision improvement, evidence thresholds, and bounded adverse-outcome weights. The domain model consumes the selected profile without special-casing its identifier except for presentation copy.

Plan mode has a strictly longer configured pre-review duration than prompt mode, a no-smaller expected batch, no-worse adverse-outcome bounds, and no-lower evidence profile. Validation enforces these cross-profile promises so “plan mode is slower but better” remains a gameplay contract after balance edits.

An alternative was hard-coded mode logic. Data profiles cost slightly more validation work but provide the intended extension point for a future agentic mode without pretending that autonomous behavior exists today.

### Freeze a seeded batch at the generation boundary

When generation completes, the model uses a run-derived deterministic random stream plus task id, cycle sequence, profile, revision tier, current Focus, and relevant resource context to create one immutable batch. It contains presentation evidence separately from its underlying resolution payload:

- proposed work bounded by the current queue boundary;
- file/test summary and visible concern or uncertainty signals;
- a stable quality tier and zero or more declared effects to apply if approved;
- task id, cycle id, batch id, mode, and revision tier.

Focus and mode decide which authored signals become visible, while the underlying approval outcome is frozen in the same transition. Later Focus changes cannot reroll or reveal the batch. This prevents UI timing from changing outcomes and supports exact replay in simulation tests.

The rejected alternative is rolling risk on approval. Although simpler, it makes the displayed review evidence potentially dishonest and encourages save/timing manipulation.

### Route approval through the queue and existing effect infrastructure

Approval atomically consumes the matching batch, calls the queue's bounded work operation once, and routes the batch's outcome through the established effect/consequence mechanisms. Queue boundary behavior remains authoritative: work beyond a midpoint decision or completion boundary is discarded and never spills into another task. Completion effects continue to come from the task queue.

Revision atomically consumes the matching batch without applying work, charges its declared game-time/resource cost, increments a bounded revision tier, and begins replacement generation for the same task and mode. The replacement receives a constrained improvement to visibility or adverse-outcome likelihood. Revision therefore offers a real trade rather than a universally free quality upgrade.

`WorkdaySession` becomes the transaction boundary for these commands because it already coordinates clock advancement, task mutations, effects, pauses, and lifecycle finalization. The cycle domain remains presentation-independent and reports transitions rather than mutating other systems directly.

### Reinterpret Focus without silently changing unrelated effects

Retain Focus as a bounded normalized resource and keep existing explicit Focus reductions from interruptions, needs, task switching, and recovery actions. Remove continuous Focus gain/decay and the coding-speed multiplier. At batch creation, Focus is an input to deterministic evidence visibility; higher Focus cannot reveal fewer applicable signals than lower Focus in the same context.

Stamina gates starting a cycle and review actions charge configured Stamina where declared. Passive AI generation does not consume Stamina when blocked, matching the principle that unavailable work should not drain player resources. Exact balance values belong in pacing profiles and will be tuned with deterministic simulations.

This preserves existing content compatibility while changing the meaning presented to players from typing momentum to review attention.

### Adapt disruptions to phase progress and preserve pause ownership

The existing disruption ledger remains authoritative for a combined speed factor. Its factor scales planning/generation elapsed time rather than task work output. A zero factor freezes the cycle; recovery resumes the same cycle automatically because there is no physical input whose intent could be stale.

Interruption and task-decision pauses remain owned by `DayState`. Interruption decisions suspend generation and temporarily cover review controls without destroying a valid batch. Task changes, end of day, reset, results, and shutdown explicitly cancel incompatible cycle state.

### Replace hold-specific presentation and diagnostics with discrete actions

The workstation replaces the single hold control with prompt and plan start actions, phase progress, and a review card with Approve and Request Changes. Pointer/touch activation is discrete. Keyboard support uses non-repeating action keys and never relies on key-up, blur, resize, or orientation events to terminate work.

Playtest diagnostics expose mode, phase, cycle/batch ids, generation progress, evidence, and review availability. Existing lifecycle handling remains for pause and overlays, but held-source sets, blocked-source behavior, typing audio, and hold cancellation tests are removed. Guidance introduces the speed-versus-quality trade and the review evidence.

## Risks / Trade-offs

- [Approval becomes repetitive and equivalent to clicking for progress] → Ensure every batch presents a meaningful concern or uncertainty context and make revision economically relevant; validate pacing through browser playtests.
- [Plan mode dominates because quality has no meaningful opportunity cost] → Enforce longer pre-review time, tune batch size below a simple time-equivalent advantage, and compare seeded outcomes across both strategies.
- [Prompt mode feels like a trap if risks are entirely hidden] → Always expose baseline evidence, bound adverse outcomes, and author signals that can be inferred rather than relying on invisible random punishment.
- [Changing Focus invalidates existing balance and content assumptions] → Preserve bounded Focus mutation APIs, replace speed-focused assertions systematically, and run full-day simulations before selecting final thresholds.
- [Discrete approval applies twice through overlapping pointer/keyboard events] → Require matching cycle, task, and batch ids; consume the batch before routing work or effects; test repeated and stale actions.
- [A large batch crosses multiple task boundaries] → Let the task queue apply only its next authoritative boundary and explicitly discard unused batch work.
- [Generation stalls or advances during the wrong pause] → Advance only from the authoritative elapsed-game-time delta and retain the existing pause-owner tests.

## Migration Plan

1. Add the mode profiles, batch content, validation, and deterministic cycle model alongside the existing coding session.
2. Integrate cycle advancement and review commands into `WorkdaySession`, reusing the task queue and effect engine while tests still exercise domain behavior without presentation.
3. Replace workstation controls, copy, diagnostics, and audio with the phase/review presentation.
4. Remove held-input orchestration and the obsolete continuous `CodingSession` after all consumers migrate.
5. Retune pacing with seeded simulation, then replace hold-oriented browser scenarios with prompt, plan, approval, revision, pause, stale-action, and lifecycle scenarios.

Rollback restores `CodingSession` and the hold presentation as one unit. The change introduces no persisted data or external API migration.

