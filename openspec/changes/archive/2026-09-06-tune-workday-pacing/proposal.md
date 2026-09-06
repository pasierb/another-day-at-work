## Why

The assembled MVP systems and 30-event catalog currently run on one provisional clock rate and uniform spawn interval, so a full day has no deliberate dramatic arc and can produce either event floods or uninteresting gaps. This change owns the roadmap's balance pass before end-of-day results are added, making complete seeded workdays measurable, recoverable, and appropriately paced for a 10–20 minute session.

## What Changes

- Define data-driven morning, normal-workload, lunch, main-chaos, and endgame time bands that vary spawn timing, category weights, escalation pressure, and need drain over authoritative game time.
- Calibrate a normal play profile toward a 10–20 minute full workday and provide a faster deterministic developer/test profile without creating multiple player-facing difficulty modes.
- Add bounded pacing guardrails for active/pending event pressure, excessive empty periods, and unavoidable resource collapse while preserving meaningful failure risk.
- Add a presentation-independent seeded simulation runner that reaches 17:00 and reports event, resource, need, task, and recovery statistics.
- Add a compact debug-only pacing overlay or equivalent run summary for manual balance verification.
- Keep exact numeric balance values in configuration so implementation can tune them against simulations and browser playtests without rewriting the game loop.
- Do not add ending rules or results UI, new mechanics or events, named difficulty modes, presentation/audio polish, deployment work, or post-MVP content.

## Capabilities

### New Capabilities

- `workday-pacing`: Defines time-band progression, play/test profiles, pacing guardrails, seeded full-day simulation, balance reporting, and debug-only pacing visibility.

### Modified Capabilities

- `event-scheduling-and-escalation`: Makes spawn intervals, category weights, escalation pressure, and capacity behavior respond deterministically to the active pacing band while bounding floods and excessive empty periods.
- `player-needs`: Makes configured need accumulation respond deterministically to the active pacing band while preserving authoritative-time, pause, threshold, and exact-once behavior.

## Impact

- Affects the framework-independent day/scheduler/needs orchestration and their configuration boundaries, plus `Workstation` wiring for the selected pacing profile and debug visibility.
- Adds deterministic simulation and balance-reporting code plus unit and browser playtest coverage; no external service, persisted-save, or production dependency is introduced.
- Retunes provisional clock, spawn, escalation, need, task/resource, and recovery values while retaining the established 09:00–17:00 authoritative day and seeded content behavior.
