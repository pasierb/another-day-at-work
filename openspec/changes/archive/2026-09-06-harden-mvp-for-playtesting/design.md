## Context

See `proposal.md` for motivation and the delta specs for required behavior. The repository already has a complete Phaser 4 MVP, pure TypeScript domain tests, fixed-seed balance simulation, a production Vite build, and substantial ad hoc browser-playtest artifacts. The `Workstation` scene owns most runtime wiring and cleanup; `Results` owns restart; shared audio state spans scenes. Playwright is already a development dependency, but there is no committed, repeatable end-to-end smoke harness, first-run orientation, or current full-game runbook.

The hardening pass must preserve established mechanics, content counts, balance profiles, seeded ordering, fixed 1280×720 logical composition, and ending rules. Required checks need deterministic control without turning test hooks or telemetry into player-visible production features.

## Goals / Non-Goals

**Goals:**

- Give first-time players enough context to act while keeping onboarding small, accessible, and independent of gameplay rules.
- Centralize browser lifecycle cancellation so every supported input path has the same disarm semantics.
- Make one deterministic browser smoke journey reproducible locally and suitable for future CI use.
- Turn existing commands and manual knowledge into an accurate clean-checkout runbook and focused playtest script.

**Non-Goals:**

- Do not redesign the scene architecture, introduce a general tutorial framework, or add remote analytics.
- Do not tune balance, change content, add mechanics, or treat deployment and cross-browser certification as part of this chunk.
- Do not expose unrestricted mutation hooks in normal builds merely to simplify automation.

## Decisions

### Treat first-run guidance as a scene-owned blocking overlay with a defensive local preference

Add a small overlay above the workstation that pauses/disarms gameplay while visible and can be dismissed by pointer, touch, or an explicit keyboard control. Store only a versioned “guidance seen” boolean through the same defensive-storage style used by mute preference; storage failure falls back to session behavior. Keep the copy and semantic layout in a compact dedicated module or view so it can be tested independently of the full scene.

Alternative considered: a multi-step interactive tutorial. Rejected because it expands the final hardening chunk into new progression mechanics and creates more pause/input states than the roadmap requests.

### Route focus, visibility, resize, terminal, and shutdown through one idempotent interaction-cancellation path

The workstation should funnel browser and scene lifecycle signals into one cancellation operation that releases pointer and keyboard sources, stops coding/audio feedback, and records that a fresh press is required. Visibility-driven pause ownership should use an independently named pause reason so it cannot accidentally release decision or explicit pauses. Register browser listeners once per owning scene or game lifecycle and remove them through a single disposer on shutdown.

Alternative considered: add one-off resets inside each event callback. Rejected because duplicated cleanup is easy to miss and makes exact-once restart behavior difficult to verify.

### Build a milestone-driven Playwright smoke harness against the production preview

Commit a small browser test configuration and one primary accelerated scenario. Start a production build/preview through documented commands, capture page errors, console errors, failed required requests, screenshots, and milestone diagnostics, then drive the same visible controls a player uses. Use an explicitly enabled, development/test-only deterministic profile and narrowly scoped read-only state markers or bounded setup seam where observation through the rendered UI would otherwise be flaky. Test-only seams must be absent or inert unless the explicit smoke setting is present and must not bypass the actions under test.

The scenario asserts a non-empty rendered surface, clock movement, exact-once interruption resolution, task completion, transition to results, and a clean restart. Split lower-level input/lifecycle cases into focused browser tests if keeping every matrix case in the full-day journey would make failures opaque.

Alternative considered: keep relying on manual screenshots and unit tests. Rejected because neither proves that assets, scene transitions, scaled input, and the complete browser runtime work together.

### Keep verification layers proportional and complementary

Pure domain behavior stays in the existing Node test suite. Small presentation preference and lifecycle coordinators receive unit tests where feasible. Browser checks cover rendered milestones and mouse/touch/keyboard behavior at desktop and minimum touch viewports, including focus/visibility, resize, pause, mute, results, and restart. The smoke run uses deterministic inputs and time bounds rather than pixel-perfect image comparisons; screenshots are diagnostic artifacts, not the primary assertion.

Alternative considered: snapshot every screen pixel. Rejected because rendering variation would create brittle failures unrelated to the acceptance checks.

### Document one supported local path and one concise manual playtest path

Refresh the README to describe the completed MVP and authoritative install, dev, test, balance, build, preview, and smoke commands with runtime prerequisites. Add a manual playtest document with setup, a short scenario, expected observations, and a place to capture browser/viewport and failures. Treat a clean install as installation into a clean dependency state using the committed lockfile; do not require destructive removal of a contributor's working dependencies.

This is a safe minor assumption: “clean install” means the lockfile-driven clean-install command in a fresh checkout or disposable environment, not deleting the current workspace's dependencies.

Alternative considered: put all details in package-script names. Rejected because external testers need expected behavior and troubleshooting context, not only commands.

### Keep diagnostics opt-in, local, and mechanically inert

Reuse the existing developer pacing profile and local simulation data where possible. Any browser milestone exposure is activated only by an explicit test setting, publishes snapshots rather than writable domain objects, and performs no network transmission. Normal mode renders no debug overlay and follows identical game rules.

Alternative considered: add an analytics SDK for playtest telemetry. Rejected because external transmission is outside scope and unnecessary for readiness verification.

## Risks / Trade-offs

- [A blocking instruction overlay can add a new pause or stale-input leak] → Give it an independent pause owner, disarm before opening and closing, and cover pointer, touch, keyboard, resize, and visibility transitions.
- [Accelerated automation can pass while normal pacing is broken] → Retain unit/balance checks and include a short manual normal-profile timing and readability pass.
- [Test hooks can become a hidden production API] → Gate narrow read-only diagnostics behind an explicit smoke setting, exclude mutation access, and assert normal startup has no diagnostics.
- [Synthetic visibility or touch events differ from real browsers] → Pair focused automation with the documented manual lifecycle matrix on representative desktop and touch-sized viewports.
- [Asset checks can mistake optional audio fallback for failure] → Classify required visual/runtime assets separately from intentionally optional audio cues and still fail on uncaught preload/runtime errors.
- [Full-day smoke tests can be slow or flaky] → Use the existing deterministic developer profile, milestone-specific timeouts, fixed inputs, and preserved diagnostics rather than arbitrary sleeps.

## Migration Plan

1. Add and unit-test first-run preference/orientation state plus centralized lifecycle cancellation without changing domain rules.
2. Integrate the overlay and browser lifecycle signals with workstation creation, pause ownership, results transition, restart, and disposal.
3. Add deterministic, opt-in smoke observability and Playwright configuration/tests, then expose stable package commands.
4. Refresh README instructions and add the manual playtest script.
5. Run unit tests, fixed-seed balance checks, production build, automated smoke coverage, and the manual desktop/touch lifecycle matrix.

Rollback removes the guidance, smoke-only observability and harness, and new documentation/scripts, then restores the prior workstation lifecycle wiring. No persisted run data or external service migration is involved; an orphaned versioned guidance preference is harmless.

## Open Questions

- Exact instruction copy, the versioned preference key, diagnostic artifact directory, and individual smoke timeout values may be tuned during implementation as long as the required concepts, local-only boundary, deterministic milestones, and acceptance behavior remain unchanged.
