## Context

The `Workstation` scene owns a framework-independent `DayState` and `CodingSession`, advances both from one game-time delta, and renders the six-region shell. The alerts region still contains static placeholders. `DayState` already composes pause reasons and clamps resources; `CodingSession` tracks held requests and bounded Focus but has no explicit interruption operation. See `proposal.md` for motivation and the three delta specs for behavioral requirements.

## Goals / Non-Goals

**Goals:**

- Keep event definitions, active-event state, validation, and one-time resolution testable without Phaser.
- Apply choice effects through the existing authoritative domain objects rather than copying state into the interruption model.
- Make modal pause ownership and held-input cancellation explicit and safe to compose with future systems.
- Establish content and effect shapes that Chunks 05 and 06 can extend without replacing the vertical slice.

**Non-Goals:**

- Build a general-purpose event bus, scheduler, escalation graph, probability engine, or delayed consequence queue.
- Allow ignoring, postponing, dismissing, or stacking decisions.
- Finalize interruption balance, animation, accessibility controls, or content-library authoring tools.

## Decisions

### Use an interruption session as a framework-independent lifecycle model

Introduce a domain object that validates definitions, materializes the three initial active events with their activation game time, exposes immutable snapshots, opens at most one event, and transitions it to resolved exactly once. It returns or exposes the selected choice effects for an orchestration layer to apply; it does not own workday resources or Focus.

This creates a single authority for `active → deciding → resolved` state and permits duplicate-resolution tests without a scene. Alternative considered: keep active IDs and click handlers directly in `Workstation`. That would couple lifecycle correctness to Phaser objects and make later scheduling and escalation harder to integrate.

### Express immediate effects as declarative deltas

Each choice contains a non-negative game-minute cost, zero or more typed resource deltas, and a bounded Focus reduction. Categories affect labeling and styling only; they do not select behavior. The three representative events will use these common primitives to create distinct trade-offs.

Alternative considered: represent effects as arbitrary callbacks in content. Callbacks are flexible but hide behavior from validation and tests, encourage UI/domain coupling, and cannot be extended predictably by the later consequence engine.

### Orchestrate resolution as one guarded scene command

The scene handles a choice activation through one guarded resolution path: mark resolution as in progress, obtain the still-valid choice, spend action time, apply resource mutations, reduce Focus, finalize event removal, release the decision pause, and re-render from snapshots. Choice controls are disabled on the first accepted activation.

The interruption model's idempotent transition is the primary duplicate guard; disabling UI is only immediate feedback. Alternative considered: remove the alert first and let independent UI callbacks apply effects. That can leave partially applied or repeated consequences when multiple pointer events arrive.

### Separate intentional action time from passive clock advancement

Extend `DayState` with a game-time spending command that accepts game minutes, works regardless of pause reasons, clamps at the existing end boundary, and notifies observers after an effective change. Keep `advance(realMs)` unchanged so ordinary scene updates still freeze whenever paused.

Alternative considered: temporarily resume the decision pause and call `advance`. That mixes real-time scaling with a game-time cost, can accidentally release unrelated pauses, and exposes a transient running state.

### Add an explicit bounded Focus reduction command

Extend `CodingSession` with a command that subtracts a normalized Focus amount, clamps at zero, and notifies only after an effective change. Content specifies the amount; the scene does not calculate multipliers. This prepares for differentiated interruption costs without adding delayed consequences.

Alternative considered: reset Focus for every event. A hard reset meets the current slice but removes useful content variation and conflicts with the GDD's “reset or reduce” language.

### Treat opening a decision as an input cancellation boundary

On alert activation, the scene clears every held coding source before applying the stable `interruption-decision` pause reason. Closing the overlay never reconstructs prior input state, so a physically held pointer or Space key cannot resume coding. The existing fresh-press behavior after unavailability remains the governing rule.

Alternative considered: rely only on the pause to stop updates. That stops current progress but retains ambiguous held state across the modal and risks automatic restart.

### Initialize all three events and derive age from game time

All representative events become active at the fresh run's current elapsed game time. Age is derived as `current game time - activation game time`, so it freezes naturally during passive pauses and does not require timers. Random activation and active-event limits remain with Chunk 05.

Alternative considered: reveal samples sequentially with temporary timers. That would introduce an ad hoc scheduler immediately before the roadmap's scheduler change.

### Render a blocking overlay inside the existing logical canvas

Replace placeholder alerts with three compact interactive rows and place a dimming scrim plus centered decision card above the existing regions. The card presents event context, choice descriptions, and effects within 1280×720; it blocks underlying pointer interaction and has no close control. Presentation subscribes to authoritative snapshots or is refreshed after lifecycle transitions.

Alternative considered: transition to a separate Phaser scene. An overlay preserves the workstation context and avoids transferring run-state ownership between scenes for a short modal interaction.

## Risks / Trade-offs

- [Applying effects across three domain objects is not an atomic transaction] → Validate all definitions up front, guard resolution before mutations, and keep current effect commands synchronous and non-throwing for valid data.
- [Spending action time can reach 17:00 while the decision is open] → Apply the complete choice, resolve the event, then leave the workday terminal after releasing the modal pause.
- [A full Focus reduction is invisible when Focus is already empty] → Test the domain command independently and use playtest setup that first builds Focus.
- [Three simultaneous alerts may crowd the existing right panel] → Use compact rows and reserve scrolling/active limits for Chunk 05.
- [Declarative immediate effects may be insufficient for later consequences] → Keep the effect union extensible, but implement only time, resource, and Focus variants in this change.

## Migration Plan

1. Add action-time and Focus-reduction commands with framework-independent tests.
2. Add interruption content types, validation, lifecycle state, sample data, and one-time-resolution tests.
3. Replace alert placeholders and add the blocking decision overlay and resolution orchestration.
4. Extend browser playtesting to exercise all three events, effect visibility, pause behavior, fresh-input behavior, and resize composition.
5. Run unit tests, the production build, and the focused browser playtest.

Rollback restores the placeholder alert renderer and removes the isolated interruption modules and narrow domain commands; there is no persisted or externally exchanged state to migrate.
