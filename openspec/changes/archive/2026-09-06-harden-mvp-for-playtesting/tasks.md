## 1. First-Run Guidance

- [x] 1.1 Implement a versioned, defensively stored first-run guidance preference with in-memory fallback and unit coverage for unseen, dismissed, malformed, and unavailable-storage states.
- [x] 1.2 Build a concise workstation instruction overlay that identifies the objective, Hold to Code, urgent alerts, resources, and dismissal control using the established accessible presentation primitives.
- [x] 1.3 Integrate the overlay as an independently owned blocking pause that disarms held input on open and close, supports pointer, touch, and keyboard dismissal exactly once, and does not replay after a remembered dismissal.
- [x] 1.4 Add presentation/layout checks showing that guidance copy and dismissal remain readable, reachable, non-overlapping, and input-aligned at desktop and the minimum supported touch-sized viewport.

## 2. Browser and Scene Lifecycle Hardening

- [x] 2.1 Introduce one idempotent workstation interaction-cancellation path that clears pointer and keyboard coding sources, cancels coding/audio feedback, and requires a fresh press.
- [x] 2.2 Route pointer cancellation, keyboard cancellation, browser blur/focus, document visibility, viewport resize/orientation, results transition, restart, and scene shutdown through the lifecycle coordinator with independently owned visibility pause/resume behavior.
- [x] 2.3 Ensure lifecycle listeners, domain subscriptions, timers, event callbacks, tweens, and audio resources are registered once and disposed once so a results transition or restart cannot affect a fresh run.
- [x] 2.4 Add focused unit or integration coverage for hidden/paused time stability, held-input cancellation across every lifecycle boundary, multiple pause owners, repeated lifecycle signals, terminal cleanup, and fresh-run isolation.

## 3. Deterministic Browser Smoke Coverage

- [x] 3.1 Add an opt-in test setting with narrowly scoped read-only milestone diagnostics for boot, time, active/resolved interruption state, task completion, terminal results, and fresh-run identity; verify it is absent or inert in normal mode and performs no external transmission.
- [x] 3.2 Add committed Playwright configuration and package commands that build and serve the production-equivalent game, collect console/page/request failures, and retain milestone-specific screenshots or traces on failure.
- [x] 3.3 Implement a deterministic accelerated smoke journey that verifies a non-empty rendered workstation, dismisses guidance, observes time progression, resolves one interruption through visible controls, completes one task, reaches a readable 17:00 results view, and restarts into fresh state.
- [x] 3.4 Add focused browser scenarios for mouse, touch, and keyboard coding plus held-input cancellation on focus/visibility loss and resize, explicit pause/resume, decision interaction, mute behavior, and results/restart at desktop and minimum touch-sized viewports.
- [x] 3.5 Make the smoke suite fail with actionable milestone diagnostics on uncaught runtime errors, required-asset failures, black or unusable canvas output, stuck input, timer/listener leakage, or timeout before a required state.

## 4. Playtest Documentation

- [x] 4.1 Refresh the README to describe the complete MVP and document runtime prerequisites plus lockfile-driven clean install, development, unit test, balance simulation, production build, preview, and browser smoke commands.
- [x] 4.2 Document supported mouse, touch, and keyboard controls, first-run guidance behavior, accelerated test mode, optional-audio fallback, and where local failure artifacts are written.
- [x] 4.3 Add a concise manual playtest script covering objective recognition, Hold to Code, urgent-event resolution, task progress, a recovery action, focus/visibility or resize interruption, pause, mute, results, and restart, with browser/viewport and observed-failure fields.

## 5. Verification and Handoff

- [x] 5.1 Run the complete unit suite and fixed-seed balance matrix, confirming lifecycle, guidance, and diagnostics changes preserve existing mechanics, content, resources, pacing, scoring, endings, and deterministic replay.
- [x] 5.2 Run TypeScript and production build checks from the documented clean-install workflow and verify required assets load while optional audio failures remain non-blocking.
- [x] 5.3 Run the full automated browser smoke suite and preserve diagnostics for any failure; confirm a complete accelerated workday finishes without console errors or black screens.
- [x] 5.4 Browser-playtest the documented scenario with mouse/keyboard on desktop and touch emulation at the minimum supported viewport, including resize, tab visibility, pause, mute, results, and restart.
- [x] 5.5 Confirm a new player can identify the objective, primary action, urgent event, and current resources without outside explanation, and record any remaining known playtest limitations without adding new mechanics.
