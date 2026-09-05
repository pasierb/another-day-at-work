## Context

The Workstation scene currently owns static text and meter values for three primary resources, Technical Debt, time, and day progress. Its six-region layout is already specified by `workstation-shell` and must remain intact. Later changes will introduce several independent writers of run state and modal pauses, so this change establishes ownership and lifecycle rules before those systems exist. See `proposal.md` for motivation and `specs/day-state-and-resource-hud/spec.md` for the behavioral contract.

The GDD does not prescribe starting resource values and defers final session pacing. This design therefore makes both the initial snapshot and time scale configuration, while documenting stable defaults for this change.

## Goals / Non-Goals

**Goals:**

- Keep workday rules independent from Phaser so they can be tested with ordinary elapsed-time inputs.
- Expose immutable snapshots and narrow commands instead of allowing UI or later systems to mutate state fields directly.
- Make pause composition safe for future decision overlays and scene-level pauses.
- Give the Workstation scene explicit ownership and cleanup responsibilities.

**Non-Goals:**

- Define a general event bus, application-wide store, serialization format, or persistence boundary.
- Decide final balance, pacing curves, passive drains, resource-zero outcomes, or end-of-day navigation.
- Extract every static workstation region into a component during this change.

## Decisions

### Use a framework-independent `DayState` domain object

`DayState` will live under a domain-focused module and accept a validated configuration containing start/end times, initial resources, and the real-to-game time scale. It owns elapsed game time, resource values, active pause reasons, subscriptions, and reset behavior. Public reads return a readonly snapshot; commands update internal state and emit a new snapshot only after an effective change.

The default configuration is:

- Start: 09:00
- End: 17:00
- Stamina: 75
- PO Happiness: 75
- System Stability: 75
- Technical Debt: 0
- Time scale: 1 game minute per real second
- Initial pause state: running

Starting primary resources below their maximum leaves room for both positive and negative effects in later vertical slices. A zero Technical Debt baseline makes later debt attributable to player decisions. The eight-real-minute default implied by the time scale is provisional and intentionally configurable; Chunk 13 owns final 10–20 minute pacing.

Alternative considered: store mutable fields directly on the scene or in Phaser's registry. That couples rules to a running game instance, weakens tests, and makes reset ownership unclear.

### Represent time as elapsed game milliseconds

The state will store precise elapsed game time relative to the configured start, clamped to the workday duration. Presentation helpers derive clock hours/minutes and normalized day progress from the snapshot. Fractional time is retained internally so frame-sized deltas accumulate without rounding drift; the UI formats completed clock minutes.

Alternative considered: increment a displayed minute counter with Phaser timers. Timer callbacks introduce scheduling variance, complicate accelerated tests, and can leak across scene shutdown.

### Compose pauses with stable reason identifiers

Pause and resume commands will add and remove typed/string reason identifiers from a set. The state is paused whenever the set is non-empty. Adding an already-active reason and removing an absent reason are no-ops. Reset clears all reasons and restores the configured initial running state.

This prevents a future decision modal from resuming the game while a scene pause or another modal still applies.

Alternative considered: a single boolean. It is adequate for this chunk in isolation but creates incorrect resume behavior as soon as two pause owners overlap.

### Use resource keys and one clamped mutation path

The four resources use a closed key union and a common mutation command. All mutations pass through one clamp rule of 0–100 and emit only when the resulting value differs. Convenience methods can be added only when a later mechanic demonstrates a need; callers must not receive mutable state references.

Alternative considered: separate mutable models or setters for each resource. That duplicates bounds and notification behavior and increases the chance that later effects treat one meter differently by accident.

### Bind state to focused HUD views through scene-owned subscriptions

The Workstation scene creates one `DayState`, advances it from the scene update lifecycle, and subscribes its HUD and clock views to snapshots. The current static construction will be split only enough to keep stable references to text and meter fill objects. Technical Debt remains in the task panel while the three primary meters remain in the top HUD.

The scene unregisters subscriptions and disables advancement during shutdown/destruction. Re-entering the scene constructs a fresh run; cross-scene run ownership can move to a higher-level session object when an actual results scene is introduced.

Alternative considered: have every UI element independently poll or fetch state. A single snapshot render path keeps time and progress visually consistent and reduces implicit dependencies.

### Treat 17:00 as a terminal clock boundary, not a results transition

Reaching 17:00 stops further clock advancement and exposes full day progress. It does not pause arbitrary mutations, emit an ending, or change scenes. Chunk 14 owns results behavior, while earlier mechanics may still need explicit rules for what happens at the boundary.

Alternative considered: add a temporary results or restart behavior now. That would pull later roadmap scope forward and likely be discarded.

## Risks / Trade-offs

- **[Default values are mistaken for final balance]** → Keep them in named configuration and call out Chunk 13 as the owner of final tuning.
- **[Observers mutate a shared snapshot]** → Return readonly fresh snapshots and never expose internal resource or pause collections.
- **[Per-frame notification churn]** → Emit at most once for each effective update command and render all time-derived UI from that snapshot.
- **[Scene shutdown leaves callbacks or updates active]** → Store the unsubscribe handle and use Phaser shutdown/destruction hooks for idempotent cleanup.
- **[Pause reason names collide]** → Centralize known reason constants as they are introduced; this change exercises composition without inventing future modal types.
- **[Clock formatting disagrees with day progress near minute boundaries]** → Derive both from the same precise elapsed value and document display rounding.

## Migration Plan

1. Add the domain types, default configuration, and state behavior with framework-independent tests.
2. Adapt meter primitives so existing fill objects can be updated without changing region geometry.
3. Replace static resource, clock, and progress values with state-backed workstation views.
4. Connect scene update and shutdown lifecycles, then verify pause, reset, resize, and scene restart behavior.
5. Run automated checks, production build, and browser playtesting at representative viewport sizes.

Rollback restores the static workstation values and removes the isolated state modules; there is no persisted data or external API to migrate.
