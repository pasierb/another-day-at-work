## Context

`DayState` owns authoritative elapsed game time and bounded Stamina. `PlayerNeeds` owns bounded Sleepiness and Toilet Need but currently exposes only passive synchronization and relief. `Workstation` orchestrates both models and renders one reusable Toilet action plus disabled quick-action placeholders. The existing scheduler and effect engine already establish seeded-random and reset patterns.

See `proposal.md` for motivation and `specs/mvp-boosters/spec.md` for behavioral requirements.

## Goals / Non-Goals

**Goals:**

- Keep booster rules and run statistics deterministic and testable without Phaser.
- Make Coffee Crash risk consumable by later event content without creating that content now.
- Route Stamina and Toilet Need changes through their existing authoritative owners.
- Use game time consistently for cooldowns and preserve safe pointer/touch activation.

**Non-Goals:**

- Coffee Crash event definitions, scheduling eligibility, or delayed crash effects.
- End-of-day scoring or results presentation.
- Water, lunch, headphones, inventory quantities, item pickups, or restocking.
- Final booster artwork, animation, or audio.

## Decisions

### Add a presentation-independent booster session

Introduce a run-scoped booster session configured with Coffee and Coke Zero definitions. It owns immutable snapshots containing consumption counts, per-booster cooldown deadlines, current availability metadata, and Coffee Crash probability. Activation accepts authoritative elapsed game time, validates availability, records count/cooldown changes once, and returns a typed effect result for the scene to apply.

Keeping resource ownership outside this session avoids duplicating clamping or making it depend on `DayState` and `PlayerNeeds`. Encoding boosters directly as scene callbacks was rejected because consumption, risk, reset, and cooldown behavior must be independently testable and later reusable by scoring and event eligibility.

### Represent booster effects as explicit activation results

Coffee activation returns Stamina restoration and count-specific feedback. Coke Zero returns its smaller Stamina restoration plus a Toilet Need increase. `Workstation` applies these results through `DayState.mutateResource` and a new bounded `PlayerNeeds.mutateNeed` command, then updates availability from the resulting state.

The general consequence effect engine is not extended for need mutation in this chunk. Doing so would broaden a small quick action into a cross-system effect-language change before event content needs it. The new need command remains typed, bounded, observable, and usable by future effects if required.

### Derive Coffee Crash risk and separate it from event creation

Coffee Crash probability is a configured monotonic function of Coffee count: an initial probability plus a per-Coffee increment, clamped to a configured maximum. The booster session exposes both the current probability and a seeded evaluation operation using the project's random-source contract. Reset restores the seed and consumption state.

No evaluation happens automatically on Coffee activation and no consequence is scheduled. Chunk 12 can evaluate the exposed risk at an explicit event opportunity, preventing this change from silently pulling future content into scope. A preselected crash-at-consumption approach was rejected because it couples a booster click to event timing and makes later eligibility rules harder to express.

### Use authoritative game-time deadlines for independent cooldowns

Each booster records `cooldownUntilGameMs` after successful activation. Availability compares that deadline with `DayState.elapsedGameMs`; therefore decisions and other pauses freeze cooldowns naturally, while explicit action-time jumps advance them consistently. Coffee and Coke Zero have independent deadlines and data-driven durations.

Workstation refreshes booster availability after ordinary world synchronization, resource changes, decision transitions, and explicit time jumps. Full Stamina disables both actions so a player cannot consume an item for downside/count manipulation without receiving recovery.

### Extend the existing quick-action pattern

Reuse `ActionView` and its pointer guard for Coffee and Coke Zero alongside Toilet. The view detail shows recovery while enabled and a concise reason while disabled. Activations cancel held coding to make the interruption explicit, but they do not spend game time or reduce Focus unless later balancing changes the data contract through a separate spec change.

Scene shutdown destroys both action views and their global pointer listeners. Booster session state is recreated with the workday so restart cannot leak counts, deadlines, random position, or armed input.

## Risks / Trade-offs

- [A crash-risk API without a current caller can become speculative] → Keep it minimal, cover it with deterministic contract tests, and defer all event timing and eligibility to Chunk 12.
- [Cooldown availability can become stale after non-frame time jumps] → Refresh from authoritative elapsed game time in the common world-synchronization path and after resource mutations.
- [Coke Zero can cross need thresholds] → Apply its need mutation through `PlayerNeeds` and return ordered transition information so the existing warning, penalty, and critical-effect orchestration remains consistent.
- [Quick actions may overflow the narrow bottom region] → Retain the established fixed-width action layout and verify both supported desktop and touch viewports.
- [The repository contains overlapping uncommitted scene and domain work] → Make additive edits at existing extension points and review the working diff before changing shared files.

## Migration Plan

1. Add the booster session, configuration, seeded risk evaluation, reset behavior, and unit tests.
2. Add bounded external need mutation with transition tests, preserving existing synchronization and relief behavior.
3. Integrate activation results, cooldown refresh, feedback, and Coffee/Coke Zero controls into `Workstation`.
4. Run unit tests, production build, and focused browser playtests for click, touch, cooldowns, bounds, blocked states, layout, and restart cleanup.

Rollback removes the scene integration and booster session, then removes the additive need-mutation command. Existing Toilet, needs, interruption, coding, and resource behavior remains unchanged throughout staged implementation.
