## Why

The parallel task-selection and AI-review loops compete with the interruption decisions that are the game's strongest expression of workplace pressure. A single sticky-only interaction model makes every in-run choice immediate, legible, and consistent while preserving continuous time and survival pressure.

## What Changes

- **BREAKING** Remove engineering tasks, task selection/progress/deadlines, AI implementation and review, Focus, coding controls, and coding disruptions from gameplay and diagnostics.
- Introduce authored multi-step cases whose sticky follow-ups are scheduled on authoritative game time and terminate as resolved or failed.
- Convert existing engineering narratives and escalation mechanics into data-driven interruption cases.
- Trigger and resolve bathroom/sleepiness needs through recurring inline stickies, including data-driven relief and booster effects.
- Recompose the workstation around inline sticky decisions while retaining the passive laptop artwork, status HUD, clock, pause, mute, guidance, and restart.
- Report case outcomes and unresolved stickies in results and diagnostics.

## Capabilities

### New Capabilities

- `sticky-case-orchestration`: Validated case graphs, delayed follow-ups, terminal outcomes, and case evidence.

### Modified Capabilities

- `interruption-decisions`: Make inline sticky choices the only in-run actions and add case/follow-up/effect data.
- `player-needs`: Trigger recurring need stickies at stage 2 and use additive Stamina drain.
- `mvp-boosters`: Consume boosters through sticky effects and retain existing consequences.
- `workday-presentation`: Remove task, laptop-app, AI-review, and quick-action controls and expand sticky layout.
- `end-of-day-results`: Replace task evidence with resolved and failed case evidence.
- `workday-pacing`: Pace continuous play using cases and sticky backlog only.
- `playtest-readiness`: Expose sticky-only legal actions and case-based diagnostics.
- `engineering-task-queue`: Retire the task queue capability.
- `task-commitments`: Retire task commitments in favor of case outcomes.
- `ai-change-review-loop`: Retire the AI implementation/review loop.
- `hold-to-code-loop`: Retire direct coding input and Focus.

## Impact

This changes the domain session, interruption/effect models, content catalogs, results and diagnostics, Phaser workstation/results scenes, tests, balance tooling, browser scenarios, README/manual guidance, and OpenSpec capability set. Existing artwork, audio assets, collapse conditions, and endless multi-day structure remain.
