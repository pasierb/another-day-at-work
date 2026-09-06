## Why

The primary “Hold to Code” interaction models continuous manual typing, while the rest of the game is about making engineering decisions under pressure. Reframing implementation as supervising AI-generated work makes the core loop contemporary and gives the player meaningful choices about speed, review effort, and code quality.

## What Changes

- **BREAKING** Replace continuous pointer/keyboard holding as the way to produce task progress with discrete AI change-generation and review cycles.
- Add a default prompt mode that produces frequent proposed change batches for the player to approve or return for revision.
- Add a plan mode that spends more game time resolving the approach before implementation, then produces fewer, larger, higher-confidence change batches.
- Make approval speed, revision, Focus, and interruptions affect quality signals, technical debt, and delayed consequences instead of rewarding uninterrupted physical input.
- Present enough risk, test, and uncertainty information on each change batch for approval to be a judgment rather than a progress-button click.
- Preserve task selection, bounded progress, Stamina, workday timing, task decision thresholds, tooling disruptions, and exact-once consequences within the new loop.
- Remove the Hold to Code control and its Space-key hold behavior from player guidance and workstation presentation.
- Keep autonomous agentic-harness gameplay out of scope while defining coding modes so another mode can be added later.

## Capabilities

### New Capabilities

- `ai-change-review-loop`: Covers coding-mode selection, AI generation phases, proposed change batches, approval and revision decisions, quality signals, and their progress and consequence outcomes.

### Modified Capabilities

- `hold-to-code-loop`: Removes continuous held-input work and Focus momentum, retaining shared coding availability, bounded work integration, disruption, and workstation-state behavior under the AI review loop.

## Impact

- Reworks the coding domain model and its orchestration with the engineering task queue, resources, effects, and authoritative game time.
- Replaces held pointer/keyboard source tracking, coding-control presentation, guidance, audio feedback, playtest diagnostics, and corresponding unit/browser tests.
- Adds run-scoped mode, generation, review-batch, and revision state plus deterministic quality/consequence resolution.
- Requires balance changes for task progress, Stamina/Focus costs, mode timing, technical-debt outcomes, and temporary tooling modifiers.
- Does not add external AI services, model calls, new runtime dependencies, persistence, or autonomous agent execution.
