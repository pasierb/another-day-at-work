## Why

The MVP mechanics and presentation are complete, but the repository is not yet packaged as a reliable, self-explanatory playtest build: first-time players receive no focused onboarding, browser lifecycle behavior is not covered as a complete flow, and the README still describes an early static shell. This final roadmap chunk hardens the existing experience so external playtesters can run it and exercise the core hypothesis without developer guidance.

## What Changes

- Add a concise first-run instruction overlay that teaches the objective, Hold to Code, urgent alerts, and the visible resources without adding a broader tutorial system.
- Make browser lifecycle handling explicit for held input, tab visibility, pause, resize, scene shutdown, results, and restart so no stale input, timer, event, or audio work leaks across states.
- Add an automated browser smoke scenario covering boot, one resolved interruption, task completion, time progression, and a complete accelerated workday through results, including console-error, black-screen, and asset-load checks.
- Verify supported mouse, touch, and keyboard paths plus resize, focus/visibility, pause, restart, and mute behavior at desktop and minimum touch-sized viewports.
- Update run/build documentation and add a concise manual playtest script for a clean checkout.
- Keep balance diagnostics local/debug-only and avoid external analytics.
- Preserve the roadmap boundary: no new mechanics, event content, deployment, post-MVP features, or changes to established balance and ending rules.

## Capabilities

### New Capabilities

- `playtest-readiness`: Covers first-run orientation, lifecycle-safe interaction, repeatable browser smoke verification, clean-install documentation, and a manual playtest procedure for the MVP.

### Modified Capabilities

- `hold-to-code-loop`: Extends cancellation guarantees to browser focus loss, tab visibility changes, resizing, and terminal/restart transitions.
- `workday-presentation`: Requires the first-run guidance and all essential game information to remain readable and operable at supported viewports without obscuring the established presentation.

## Impact

The change affects the Workstation scene and its input/lifecycle cleanup, a small local first-run guidance state, browser-level Playwright smoke coverage and test fixtures/hooks, package scripts, and project/playtest documentation. It may add development-only test configuration or dependencies, but it adds no production service, external telemetry, persistent run progression, gameplay content, or deployment target.
