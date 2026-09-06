## Context

See `proposal.md` for motivation. The game currently renders a complete 1280×720 fixed logical composition from `Workstation` and `Results`, scales it uniformly with Phaser FIT, and uses shared but minimal `theme` and `primitives` helpers. Domain snapshots already expose time, resources, Technical Debt, active interruptions, needs, coding state, boosters, and terminal results. Presentation is mostly constructed and updated inside scenes, there is no audio layer or loaded audio catalog, and shutdown cleanup already owns scene subscriptions, timers, held input, overlays, and run disposal.

The implementation must preserve all existing domain behavior, exact-once action handling, pause ownership, seeded simulation results, and scene restart guarantees. The reference image is a composition and mood guide rather than an asset specification. Browser audio requires a user gesture, local preference storage can fail, and new scene-owned sounds/listeners must be cleaned up with the same rigor as existing input and timer state.

## Goals / Non-Goals

**Goals:**

- Separate deterministic presentation state from domain state so visual stress and cue decisions can be tested without constructing a Phaser scene.
- Give the workstation and results scenes a shared, composable visual system while preserving their existing logical layout and input mapping.
- Give audio playback, unlock, mixing, mute persistence, and lifecycle cleanup explicit ownership.
- Keep assets lightweight, local, replaceable, and suitable for the prototype.

**Non-Goals:**

- Do not change scheduler weights, resource effects, task/event data, ending rules, pacing profiles, or seeded randomness.
- Do not add tutorials, automated smoke infrastructure, telemetry, deployment, final commissioned art/music, or a responsive reflow system.
- Do not make audio or visual decoration a prerequisite for any gameplay action.

## Decisions

### Derive a pure presentation snapshot from authoritative domain snapshots

Add a small presentation model that accepts only existing immutable snapshots and returns a stress stage plus semantic tokens such as alert pressure, clutter level, and emphasis level. Use documented thresholds over normalized time, active-alert count/severity, and Technical Debt. The mapper contains no random calls and writes no domain state, so equivalent input always produces equivalent output in unit tests and seeded replays.

Scenes subscribe/render from this derived snapshot alongside their existing domain renders. Visual effects never feed back into scheduler, scoring, resource, or timing decisions.

Alternative considered: increment clutter opportunistically when scene events fire. Rejected because redraws, restart, and missed callbacks could produce a different desk for identical game state and would make headless verification impossible.

### Build a shared semantic visual system, then compose scene-specific views

Expand the existing theme and primitive layer with semantic typography, surface, status, focus, interaction, and accessibility tokens. Add reusable visual components for cards, badges, buttons, meters, mute status, and limited emphasis rather than scattering raw colors and font sizes through scenes. Keep `Workstation` responsible for arranging its six established regions and `Results` responsible for its terminal composition; extract region-level renderers only where doing so clarifies ownership and cleanup.

Environmental decoration lives in a dedicated, non-interactive layer between the background and gameplay panels. A fixed catalog of decor slots is progressively revealed by stress stage, which prevents overlap by construction and keeps maximum clutter deterministic at the minimum viewport. Urgency uses at least one non-color cue such as label, border weight, shape, or restrained pulse. Motion must remain bounded and nonessential to understanding state.

Alternative considered: replace the fixed composition with breakpoint-specific layouts. Rejected because the established shell contract uses a fixed logical canvas and Phaser FIT already preserves pointer alignment across desktop and touch-sized windows.

### Route semantic presentation events through one scene-scoped audio director

Introduce an audio director that maps semantic cues—coding, ordinary message, incident, choice resolved, booster, and critical need—to preloaded local assets. The scene calls semantic methods or feeds state transitions; domain classes remain free of Phaser audio references. The director tracks previous snapshots where necessary to distinguish transitions from redraws and deduplicates exact-once cues.

Typing uses one controlled loop or rate-limited cue tied to authoritative coding activity. Other cues use category cooldowns, a small global voice limit, priority-based replacement for urgent incidents, and conservative per-cue/master gain. Shutdown and transition to results stop loops, active voices, pending callbacks, and input listeners. Results may reuse the same global preference but starts no workstation ambience or cue backlog.

Alternative considered: play sounds directly in each render method. Rejected because subscription redraws could replay cues, overlap would be unbounded, and cleanup/mute behavior would be duplicated across views.

### Unlock audio once from qualifying input without replaying history

The audio director begins locked and silent. A small game-level unlock adapter listens for the first qualifying pointer, touch, or keyboard interaction, requests Phaser/Web Audio resume, and records only whether subsequent playback is available. It does not queue pre-unlock cues. A rejected or delayed resume is handled as a nonfatal state and is retried only on a later qualifying gesture, never every update frame.

The unlock listener is owned centrally across scene transitions so restart and results do not multiply handlers. Scene audio directors attach to the shared unlocked state and dispose their own playback resources.

Alternative considered: place a mandatory “enable sound” gate before the workstation. Rejected because the roadmap requires the app to remain directly playable and browser activation must not block silent play.

### Store only the master-mute preference behind a defensive adapter

Use a tiny preference adapter with one versioned local-storage key and a boolean muted value. Reads validate the stored shape; reads and writes are wrapped so privacy-mode or quota failures fall back to in-memory state. The mute control is present on workstation and results screens, reflects the effective preference, and changes global gain immediately. Muting stops or silences active voices; unmuting never replays suppressed cues.

This is the only persistence added by the change. It does not share storage with run state, results, or future settings.

Alternative considered: persist a broader settings object now. Rejected because volume sliders and other settings are outside the chunk and premature schema breadth would complicate migration.

### Use local replaceable prototype assets with explicit preload failure tolerance

Provide a compact set of original/generated or clearly redistributable prototype cues and simple code-drawn workstation decoration. Register audio keys in one catalog and preload them through the existing loading scene. Missing or undecodable audio disables the affected cue and emits at most a development diagnostic; it never blocks transition into the workstation. Asset attribution or provenance is recorded where required.

Alternative considered: depend on remote media or a large audio library. Rejected because the MVP has no real service integrations, must build offline, and needs predictable loading and licensing.

## Risks / Trade-offs

- [Dense 1280×720 regions may become less readable after styling] → Preserve established region bounds, cap decorative density, add text-fit checks, and browser-test both desktop and the minimum supported touch viewport at maximum stress.
- [Snapshot subscriptions can emit repeatedly and duplicate sounds] → Compare stable semantic transition keys, keep playback out of ordinary redraw paths, and unit-test repeated identical snapshots.
- [Notification bursts can create harsh audio] → Enforce per-category cooldowns, voice limits, priority, and conservative gain; manually test representative peak-chaos sequences.
- [Autoplay handling differs across browsers] → Keep silent play fully functional, resume only from direct gestures, handle rejected promises, and avoid queued playback.
- [Mute persistence can fail or contain malformed data] → Validate one versioned value and fall back to session memory without surfacing an error to gameplay.
- [New animation/audio resources can leak across results or restart] → Register all timers, tweens, sounds, and listeners with explicit scene/global owners and verify shutdown disposal plus fresh-run behavior.
- [Prototype assets may inflate the build] → Use a small compressed catalog, document provenance, and check production bundle and load behavior before handoff.

## Migration Plan

1. Add and test the pure presentation-stage model, semantic design tokens, preference adapter, and audio policy/catalog contracts.
2. Extend shared primitives and refactor workstation/results presentation region by region without changing authoritative domain inputs or layout bounds.
3. Add deterministic environmental layers driven by presentation snapshots and verify maximum-stress composition.
4. Add local audio assets, preload registration, the shared unlock/mute boundary, and scene-scoped semantic playback with cleanup.
5. Verify unit tests, production build/type checks, seeded simulations, and browser behavior at desktop and minimum supported viewport with muted, locked, and peak-chaos audio states.

Rollback removes the presentation/audio modules and assets and restores the prior theme/primitives and scene rendering. The versioned mute preference can be left inert or removed; no run data or external migration is involved.

## Open Questions

- Exact colors, type sizes, prototype cue timbres, compression settings, and stress thresholds may be tuned during implementation as long as the semantic hierarchy, deterministic inputs, bounded mixing, and acceptance scenarios remain unchanged.
