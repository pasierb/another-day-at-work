# Playtest Readiness

## Purpose
Provide deterministic and browser-level evidence for the sticky-only game.

## Requirements

### Requirement: Automated verification covers the sticky loop
The project SHALL test timing boundaries, update-size independence, case outcomes, need recurrence, booster effects, legal actions, and results evidence.

#### Scenario: The automated suite runs
- **WHEN** unit tests execute
- **THEN** sticky orchestration passes without task, Focus, or coding dependencies

### Requirement: Browser smoke tests cover supported layouts
Chromium smoke tests SHALL exercise desktop and minimum touch layouts, inline choices, meta controls, results, and restart.

#### Scenario: The game is smoke tested
- **WHEN** the production build opens in Chromium
- **THEN** the passive laptop and readable actionable stickies appear without removed gameplay controls or runtime errors

### Requirement: Diagnostics expose current concepts only
Development diagnostics SHALL expose case outcomes and sticky/lifecycle actions without task fields or removed commands.

#### Scenario: Diagnostics are inspected
- **WHEN** playtest instrumentation is enabled
- **THEN** resolved and failed case IDs replace task completion evidence

