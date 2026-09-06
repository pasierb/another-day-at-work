## Context

See `proposal.md` for motivation. Chunks 01–12 provide an authoritative 09:00–17:00 `DayState`, game-time-driven coding and needs, a seeded event scheduler, escalation and consequence queues, recovery actions, five engineering tasks, and a validated 30-event catalog. The workstation currently constructs these systems directly with provisional defaults: one game-minute per real second, uniform 20–35 game-minute spawn intervals, and an active-event limit of three.

All timed systems already synchronize from elapsed game milliseconds and freeze when decisions pause the day. Pacing must preserve that property, existing exact-once ordering, content eligibility, and isolated seeded randomness. Chunk 14 still owns stopping the whole run into a results flow at 17:00, so this change may measure and summarize the terminal state but must not create endings.

## Goals / Non-Goals

**Goals:**

- Put the full balance surface behind validated, immutable normal and developer/test profiles.
- Make time-band lookup and modifier evaluation pure enough for domain tests and headless simulations.
- Reuse production domain rules in simulations rather than maintaining a second approximate balance model.
- Make flood, quiet-period, and recovery guardrails explicit, deterministic, and measurable.
- Keep scene integration thin and clean up debug presentation and run-scoped observers on shutdown/reset.

**Non-Goals:**

- Do not create a general difficulty system or expose profile selection as a player option.
- Do not author or rewrite event content, tasks, needs, boosters, ending rules, or polished presentation/audio.
- Do not introduce external analytics, persistence, real-time timers, or a production telemetry pipeline.

## Decisions

### Own pacing in one immutable profile

Introduce a presentation-independent pacing profile containing the workday time scale, ordered time bands, spawn interval/category/escalation modifiers, need-rate modifiers, guardrail thresholds, and simulation step/default policy settings. Validate full 09:00–17:00 coverage, ordering, finite bounds, and known category/need keys when the profile is created. Production wiring selects the normal profile; tests and developer tools may explicitly select the accelerated profile.

Alternative considered: continue distributing constants across `DayState`, `Workstation`, `EventScheduler`, and `PlayerNeeds`. Rejected because those values cannot be audited as one balance contract and drift between gameplay and simulation.

### Resolve bands by authoritative deadlines and split crossed intervals

Use a pure band lookup keyed by elapsed game time. Spawn and escalation decisions resolve the band at the transition's due time; already selected event identities and stable queue ordering never change. Continuous need accumulation splits a large time delta at band boundaries so results do not depend on frame size or action-time jump size. Paused wall time never enters the calculation.

Alternative considered: use only the band active at the end of each scene update. Rejected because a large frame or action-time cost could apply afternoon pressure retroactively to morning time and make simulations step-size-dependent.

### Extend the existing scheduler rather than wrap it with scene logic

Give the framework-independent scheduler a pacing-policy input that evaluates current band configuration before its existing eligibility and seeded weighting pipeline. Category weights compose with existing PO Happiness and Technical Debt modifiers using declared bounds. Escalation pressure adjusts remaining authored delays, never content stage order or effects. Scheduler snapshots expose the minimum counters needed for diagnostics.

Alternative considered: change intervals or inject events from `Workstation` at clock thresholds. Rejected because it would couple pacing to Phaser, create a second selection path, and risk undocumented random draws.

### Express guardrails as deterministic pressure policies

Define event pressure as active plus pending events. At the configured flood threshold, ordinary spawn opportunities defer until pressure drops; existing candidates are never discarded and the active cap remains authoritative. Track meaningful-action quiet time from the most recent newly available event, task decision, need warning, recovery action, or coding objective. When its threshold expires, advance the next eligible spawn opportunity through the ordinary seeded pipeline; if nothing is eligible, record the empty evaluation and continue without forcing contradictory content.

Recovery protection is measured as an invariant of default-profile tuning and simulations: representative policies that encounter one critical resource retain a meaningful action window. It does not grant resources, cancel consequences, or rescue repeated harmful decisions.

Alternative considered: dynamically modify resources or delete queued events whenever pressure is high. Rejected because hidden correction would erase player consequences and violate established exact-once queue behavior.

### Run headless simulations through shared orchestration

Extract the scene's run coordination into a presentation-independent session/orchestrator that owns `DayState`, scheduler, interruptions, needs, tasks, boosters, consequences, and disruptions. Both the Phaser scene and seeded simulator call the same advance/action methods. A deterministic player-policy interface chooses among currently legal actions; invalid or non-progressing policies fail clearly instead of hanging. Simulation reports include per-band spawns/resolutions, pressure peaks, maximum quiet periods, resource/need extrema, critical and recovery windows, task progress/completions, and terminal snapshots.

Alternative considered: simulate only scheduler probabilities. Rejected because acceptance depends on interacting resources, needs, tasks, choices, pauses, action-time jumps, and recovery availability.

### Keep diagnostics local and lifecycle-bound

Expose the selected profile, seed, active band, pressure, quiet duration, and compact extrema from an immutable debug snapshot. `Workstation` creates a small overlay only behind an explicit development flag and destroys it with other scene-owned objects and subscriptions. Automated simulation output remains local test/CLI data and sends nothing externally.

Alternative considered: always show balance instrumentation. Rejected because it would pull forward presentation scope and clutter the minimum supported viewport.

## Risks / Trade-offs

- [Extracting shared orchestration can regress an already integrated scene] → Move behavior incrementally behind compatibility-preserving commands and run the full existing domain and browser suite before tuning values.
- [Band modifiers can accidentally consume extra random draws] → Keep band lookup pure, compose weights before the existing single draw, and assert identical replay for equal profile/seed/history inputs.
- [Flood deferral can create a late backlog] → Retain stable pending order, report peak pending age, and tune thresholds with full-day simulations rather than dropping candidates.
- [Quiet detection can mistake a continuously available coding task for fresh variety] → Define and test the exact transition events that reset quiet duration; continuous availability alone does not reset it every tick.
- [A deterministic policy may overstate human recoverability] → Use multiple documented policies and seeds, then confirm the target with a manual normal-speed browser run.
- [A 10–20 minute target conflicts with the current provisional eight-minute clock] → Treat the current value as intentionally provisional, tune the normal profile within the roadmap range, and isolate the faster value to the developer/test profile.
- [Chunk 14 results behavior is absent] → Stop simulations and further scheduling exactly at 17:00, report terminal state, and leave scene transition/scoring untouched.

## Migration Plan

1. Add and validate pacing profile, time-band, guardrail, and reporting contracts with normal values based on existing defaults and an explicitly accelerated test profile.
2. Add band-aware scheduler/escalation and need-rate behavior while preserving neutral-profile compatibility and seeded ordering tests.
3. Extract shared run orchestration, move the workstation to it, and verify existing input, pause, action-time, reset, and cleanup behavior.
4. Add deterministic full-day simulations, tune the profile against a documented seed/policy matrix, and add optional local diagnostics.
5. Run unit tests, production build/type checks, accelerated browser coverage, and a timed manual normal-profile playtest.

Rollback restores neutral band modifiers and the previous workstation wiring/configuration. No saved data, network service, dependency, or external migration is involved.

## Open Questions

- Exact band boundaries, profile rates, guardrail thresholds, seed matrix, and balance targets within the specified constraints are data-only tuning choices to finalize from simulation and manual playtest evidence during implementation.
