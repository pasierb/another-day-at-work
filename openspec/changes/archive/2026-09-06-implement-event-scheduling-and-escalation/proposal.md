## Why

The current interruption vertical slice starts with three static alerts, so problems neither arrive over the workday nor become more costly when neglected. The next playable layer needs deterministic scheduling and escalation to create the intended tension between sustained coding Focus and competing problems.

## What Changes

- Add a seeded, game-time-driven scheduler with configurable spawn timing and an active-event limit.
- Extend interruption content with ordered escalation stages that can change copy, severity, immediate effects, and request follow-up events.
- Add explicit postpone and ignore commands for unresolved alerts without forcing a decision modal.
- Prioritize urgent alerts visually while preserving exclusive, one-time decision resolution.
- Freeze spawning and escalation during pauses and deterministically process elapsed action time after a decision closes.
- Replace the vertical slice's three initially active alerts with scheduled activation while retaining the representative content as scheduler-ready definitions.

## Capabilities

### New Capabilities

- `event-scheduling-and-escalation`: Seeded event selection, game-time deadlines, queue-capacity behavior, escalation stages, follow-ups, and pause semantics.

### Modified Capabilities

- `interruption-decisions`: Active interruptions are added by the scheduler and support postpone/ignore lifecycle commands alongside the existing exclusive decision and one-time resolution flow.

## Impact

- Affects the framework-independent interruption domain model and event content definitions.
- Adds a scheduler/random-source domain module and associated unit tests.
- Changes `Workstation` orchestration and alert controls/ordering without introducing new dependencies.
- Extends focused browser playtesting for deterministic spawning, escalation, pause behavior, and full-queue behavior.
