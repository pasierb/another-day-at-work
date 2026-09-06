## 1. Presentation State and Visual Foundations

- [x] 1.1 Define semantic palette, typography, spacing, surface, severity, focus, and interaction-state tokens that can be shared by workstation and results views.
- [x] 1.2 Implement a pure deterministic presentation-state mapper from elapsed day progress, active-alert count/severity, and Technical Debt to documented stress stages and decor/emphasis tokens.
- [x] 1.3 Add unit tests for presentation thresholds, boundary values, repeated equivalent inputs, and proof that deriving presentation state does not mutate domain snapshots.
- [x] 1.4 Extend shared card, badge, meter, and action primitives with readable enabled, hover/pressed, selected, urgent, and disabled states that include non-color cues.

## 2. Workstation and Results Composition

- [x] 2.1 Restyle the resource/needs HUD, day clock, task queue, laptop coding area, alert stack, quick actions, and decision cards using the shared visual system while preserving all established region bounds and input behavior.
- [x] 2.2 Add a deterministic, non-interactive environmental layer with fixed safe decor slots whose visible clutter and restrained emphasis follow presentation stress stages.
- [x] 2.3 Ensure maximum clutter remains behind or outside status, alerts, decisions, and controls and cannot intercept pointer or touch input.
- [x] 2.4 Restyle the results view and restart action with the same hierarchy and components, preserving the complete ending explanation and score breakdown.
- [x] 2.5 Add focused view/layout checks for severity and interaction cues, maximum-stress z-order and hit areas, and workstation/results text fit at the minimum supported viewport.

## 3. Audio Assets, Policy, and Preferences

- [x] 3.1 Add a compact local catalog of prototype cues for coding, messages, incidents, choices, boosters, and critical needs, document any required provenance, and register tolerant preload behavior.
- [x] 3.2 Implement a semantic audio policy with cue priorities, per-category cooldowns, conservative gains, a global voice limit, and controlled typing-loop start/stop behavior.
- [x] 3.3 Implement a versioned master-mute preference adapter with validated reads, immediate in-memory updates, guarded local-storage access, and graceful malformed/unavailable-storage fallback.
- [x] 3.4 Add unit tests for cue selection, repeated-snapshot deduplication, cooldown/voice-limit/priority behavior, typing cancellation, mute suppression, and storage failure paths.

## 4. Browser Audio and Scene Integration

- [x] 4.1 Add a single lifecycle-owned browser audio-unlock adapter that resumes only from qualifying pointer, touch, or keyboard gestures, queues no missed cues, and handles rejected or delayed activation without blocking play.
- [x] 4.2 Integrate semantic cues with authoritative workstation transitions so coding, newly activated messages/incidents, resolved choices, booster use, and critical needs sound once without changing mechanics or pause/time behavior.
- [x] 4.3 Add clearly labeled mute controls to workstation and results, synchronize their displayed/effective state across scene transitions and reloads, and stop active audio immediately when muted.
- [x] 4.4 Extend workstation/results shutdown and restart cleanup to remove audio listeners, timers, loops, tweens, and active voices so completed-run callbacks cannot affect a fresh session.
- [x] 4.5 Add integration-level lifecycle checks for locked startup, first gesture, rejected unlock, mute/unmute, transition to results, restart, and repeated snapshot/render emissions.

## 5. Verification and Presentation Tuning

- [x] 5.1 Run the complete unit suite and fixed-seed accelerated simulations, confirming presentation/audio integration does not change task, event, resource, pacing, scoring, ending, or deterministic replay outcomes.
- [x] 5.2 Run the production build and TypeScript checks, verify local assets load without errors, and confirm missing/undecodable audio cannot block workstation startup.
- [x] 5.3 Browser-playtest mouse, touch, and keyboard coding plus messages, incidents, decisions, boosters, and critical needs, confirming restrained exact-once cues and immediate mute behavior after browser unlock.
- [x] 5.4 Browser-playtest representative calm, busy, and maximum-stress states at desktop and the minimum supported touch viewport, confirming hierarchy, non-color severity/interactivity cues, and unobstructed controls.
- [x] 5.5 Browser-playtest transition to results, persistent mute across reload/fresh run, peak alert overlap, and scene restart, confirming bounded volume and no lingering typing, audio, animation, listener, or timer activity.
