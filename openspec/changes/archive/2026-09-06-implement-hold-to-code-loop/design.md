## Context

The `Workstation` scene currently owns an observable `DayState`, advances it from Phaser's update loop, and renders a static laptop with placeholder task progress and a disabled Hold to Code control. `DayState` already provides deterministic elapsed game time, composable pauses, bounded resource mutation, and scene-independent tests. The new capability must integrate with that contract without putting gameplay rules into Phaser objects; see `proposal.md` and `specs/hold-to-code-loop/spec.md`.

## Goals / Non-Goals

**Goals:**

- Keep current-task, Focus, progress, and completion rules deterministic and testable without constructing a Phaser scene.
- Use the workday's elapsed game time as the common simulation clock so a configured time scale affects all gameplay consistently.
- Treat pointer and keyboard holds as independent input sources while guaranteeing cleanup at every cancellation boundary.
- Make the laptop a projection of authoritative state rather than a second source of task or Focus values.

**Non-Goals:**

- Generalize the single current task into a queue, task selection, or task rewards.
- Define interruption-driven Focus loss; this change only establishes hold growth and release decay.
- Add failure states or restoration behavior for exhausted Stamina.
- Introduce final balance values or artwork.

## Decisions

### Use a scene-independent coding-session model

Add a domain model that owns the current task, normalized Focus, whether a coding request is active, completion transition state, and configurable rates. It exposes immutable snapshots and effective-change notifications in the same style as `DayState`.

The model receives elapsed game time and currently available Stamina during an update, calculates only the usable portion of an interval when Stamina or task effort would run out, and returns the Stamina cost for the scene to apply through `DayState.mutateResource`. This keeps coding arithmetic testable while preserving `DayState` as the authority for resource bounds.

Alternative considered: place progress and Focus directly in `Workstation.update`. That is simpler initially but makes frame-rate, completion, and boundary behavior depend on a Phaser scene and contradicts the roadmap's testability requirement.

### Derive coding elapsed time from DayState advancement

For each scene update, record `DayState.snapshot.elapsedGameMs`, advance the workday, and pass the positive difference to the coding session. A paused or completed day therefore supplies zero simulation time. Progress, Focus, and Stamina rates are expressed per game-time unit rather than per rendered frame or real second.

Alternative considered: pass Phaser's real-time delta to both models independently. That could allow coding to continue during a workday pause and would make time-scale changes alter the amount of work possible in a day.

### Apply Focus as a bounded continuous multiplier

Store Focus in a bounded normalized range and derive a multiplier by interpolating between configurable minimum and maximum multipliers. Focus rises only during effective coding and decays toward its minimum while the workday is running, coding is otherwise available, and no coding input is active. Pauses freeze Focus.

Release decay, rather than an immediate reset, makes accidental short releases forgiving while still ensuring that sufficiently separated taps underperform uninterrupted holding. Later interruption choices can add an explicit Focus reduction operation without changing the growth model.

Alternative considered: reset Focus immediately on every release. It makes the acceptance condition obvious but is harsher than the GDD, which associates major Focus loss with interruptions rather than ordinary release.

### Keep input-source tracking in the scene

The `Workstation` scene maintains a set of active source identifiers, with pointer identities distinct from the keyboard source. Coding is requested while the set is non-empty. Releases remove only their source. Pointer cancellation, pointer termination outside the control, browser/game blur, coding becoming unavailable, and scene shutdown clear relevant sources and release the coding request.

The player must issue a fresh press after coding becomes unavailable. Clearing held sources at that transition prevents a still-held key or pointer from silently restarting work after a pause or Stamina recovery.

Alternative considered: use a single boolean tied to the last event. It cannot correctly represent overlapping pointer and keyboard holds and is prone to stuck-input bugs when a release is missed.

### Render from coding snapshots and use explicit visual states

The laptop subscribes to coding snapshots and updates its task label, progress meter, numeric progress, Focus multiplier, and action styling. The control has explicit idle, pressed, and disabled presentations. Availability is derived from the coding state plus the current workday snapshot rather than inferred from colors or input listeners.

The current static task row and alerts remain placeholders. Only the laptop's current-task representation becomes live in this change.

## Risks / Trade-offs

- [Two observable models can notify separately during one frame] → Update both models in a fixed order and render each from its own complete snapshot; avoid logic triggered by transient UI state.
- [Large frame deltas could over-consume Stamina or overshoot completion] → Clamp simulation to the usable fraction of the interval before applying progress and cost.
- [Browser and Phaser cancellation events differ across devices] → Centralize release/clear operations, cover global pointer-up and blur paths, and verify mouse, touch cancellation, and keyboard behavior in browser playtests.
- [Early balance values may make Focus benefits hard to perceive] → Put all rates and multiplier bounds in one immutable configuration and assert relative behavior rather than incidental defaults in tests.
- [Release decay adds simulation while not coding] → Run decay only during available, advancing workday time so pause and end-of-day behavior remain deterministic.

## Migration Plan

Introduce the coding domain and tests first, then replace only the static laptop interaction and presentation. The existing workstation shell and DayState interface remain compatible. Rollback consists of removing the coding-session integration and restoring the existing disabled placeholder control; no persisted data or external API requires migration.
