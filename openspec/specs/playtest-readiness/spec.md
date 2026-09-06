# Playtest Readiness Specification

## Purpose

Make the complete MVP self-explanatory, lifecycle-safe, and repeatably verifiable as a browser build before it is handed to external playtesters.

## Requirements

### Requirement: First-time players receive concise core-loop guidance
The game SHALL present a dismissible first-run instruction overlay that identifies the workday objective, Hold to Code interaction, urgent-alert response, current resources, and the way to begin play, without requiring outside explanation.

#### Scenario: A new player opens the game
- **WHEN** no completed first-run guidance state exists for the current browser profile
- **THEN** the workstation opens with concise instructions that identify the objective, primary coding action, urgent alerts, and current resources

#### Scenario: The player dismisses the guidance
- **WHEN** the player dismisses the instruction overlay with a supported pointer, touch, or keyboard action
- **THEN** the overlay closes exactly once, gameplay becomes available, and the dismissal is remembered locally for later loads when storage is available

#### Scenario: Preference storage is unavailable
- **WHEN** the browser cannot read or write the first-run guidance preference
- **THEN** the current session remains playable and the overlay can still be dismissed without an error

### Requirement: The MVP has an automated end-to-end smoke scenario
The project SHALL provide a repeatable browser smoke scenario that boots the game, resolves an interruption, completes a task, observes authoritative time progression, reaches end-of-day results in accelerated mode, and fails on uncaught runtime errors, failed required assets, or an unusable rendered game surface.

#### Scenario: The accelerated smoke flow succeeds
- **WHEN** the smoke scenario runs against a clean production-equivalent build with its documented deterministic setup
- **THEN** it reaches each required milestone and a readable results view without console errors, page errors, black screens, or required-asset failures

#### Scenario: A required milestone is broken
- **WHEN** boot, interruption resolution, task completion, time progression, or results presentation cannot be observed within its documented bound
- **THEN** the smoke scenario fails with the unmet milestone and preserves enough diagnostic evidence to identify the failing state

#### Scenario: A runtime or required-asset error occurs
- **WHEN** the browser reports an uncaught error or a required game asset fails while the smoke scenario runs
- **THEN** the scenario fails even if later milestones appear reachable

### Requirement: Supported browser interactions survive lifecycle changes
The game SHALL remain usable with mouse, touch, and keyboard controls across resize, browser focus and visibility changes, pause and resume, results transition, and restart, and SHALL not retain stale held input, duplicate listeners, timers, events, or audio work across those boundaries.

#### Scenario: A held input is interrupted by browser lifecycle change
- **WHEN** focus is lost, the page becomes hidden, or the viewport changes while a coding input is held
- **THEN** coding is disarmed and cannot resume until the player performs a fresh supported press after the game is active

#### Scenario: A paused or hidden game receives real-time updates
- **WHEN** the game is explicitly paused or the page is hidden
- **THEN** authoritative game time and game-time-driven systems remain stable until active play resumes

#### Scenario: Results are restarted
- **WHEN** the player restarts after reaching results
- **THEN** the new run begins from fresh documented state with no held input, pending event, timer, listener, audio loop, or terminal callback inherited from the prior run

#### Scenario: The viewport changes
- **WHEN** the browser is resized before, during, or after a decision
- **THEN** the full supported composition remains operable and pointer or touch input continues to address the visible control

### Requirement: Playtest setup and procedure are documented
The repository SHALL document clean installation, development start, production build, automated tests and smoke verification, supported controls, and a concise manual playtest script that covers the primary loop and lifecycle risks.

#### Scenario: A contributor starts from a clean checkout
- **WHEN** the contributor follows the documented commands with the supported runtime prerequisites
- **THEN** dependencies install, the production build completes, and the game starts without requiring undocumented setup

#### Scenario: A tester follows the manual script
- **WHEN** a tester follows the documented manual playtest procedure
- **THEN** the procedure exercises objective recognition, coding, an urgent alert, task progress, a recovery action, resize or focus loss, mute, results, and restart with explicit observations to record

### Requirement: Playtest diagnostics remain local and non-invasive
Any additional balance or smoke diagnostics introduced for this hardening pass SHALL be disabled in normal player presentation, remain local to the browser or test process, and SHALL NOT transmit analytics externally.

#### Scenario: A normal player run starts
- **WHEN** the game starts without an explicit debug or automated-test setting
- **THEN** no hardening diagnostic overlay is shown and no playtest telemetry is sent over the network

#### Scenario: A smoke run enables diagnostics
- **WHEN** the automated smoke scenario enables its documented diagnostic mode
- **THEN** it can observe required milestones without changing gameplay rules, seeded outcomes, or player-visible normal-mode behavior
