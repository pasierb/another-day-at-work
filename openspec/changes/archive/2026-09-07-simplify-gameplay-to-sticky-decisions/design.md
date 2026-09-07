## Context

The run currently composes task queue, commitments, AI work cycles, coding disruption, interruptions, needs, boosters, pacing, results, and Phaser presentation. Continuous authoritative game time and interruption aging already provide the foundation for a sticky-only loop.

## Goals / Non-Goals

**Goals:** Make interruption choices the sole gameplay command, model former tasks as deterministic case graphs, preserve all survival systems, and keep domain behavior independent of Phaser.

**Non-Goals:** New artwork, persistence migration, a victory state, scoring, or changes to collapse thresholds and endless day rollover.

## Decisions

1. `WorkdaySession` owns case state and a due-time queue. Choice resolution first marks the source resolved and terminal case state, then schedules follow-ups at `currentGameTime + delayGameMs`; advancing time activates each due event once, including at an exact boundary. This keeps scheduling deterministic and update-size independent.
2. Case content remains interruption data. Definitions carry an optional `caseId`; choices carry zero or more delayed event references and an optional terminal outcome. Validation resolves all references globally, requires non-negative finite delays, rejects terminal choices with follow-ups, ensures every case has a terminal route, and rejects directed cycles.
3. Effects retain a small declarative core. `relieve-need` and `consume-booster` replace UI-specific commands. Removed Focus loss becomes Stamina loss; lost progress and slowdown are compiled into choice time costs in authored content.
4. Need warnings are ordinary recurring stickies, gated at stage 2 with their existing cooldowns. Deferred choices schedule recurrence; acting uses the same effect engine as all other decisions.
5. The workstation renders passive illustration beneath a sticky workspace and status rail. Only lifecycle/accessibility controls remain outside sticky choices.
6. Results and debug evidence use resolved/failed case IDs and unresolved interruption state. No compatibility task fields remain.

## Risks / Trade-offs

- [Large content migration can create unreachable branches] → Validate case graphs and test every case for reachability and a terminal route.
- [Scheduling across day rollover can duplicate events] → Store absolute game timestamps and activation identity separately from the visible day clock.
- [Removing controls can leave stale interaction targets] → Assert the legal-action surface and browser-test desktop and touch layouts.
- [Old tests encode removed behavior] → Replace task/AI/coding tests with case, need, results, and sticky-only interaction tests.

## Migration Plan

Archive the completed commitment change, land the new domain/content model, migrate presentation/results/diagnostics, remove obsolete modules and tests, update docs/specs, then verify unit, type, build, balance, and browser gates. Rollback is a repository revert; there is no persisted save migration.
