# sticky-case-orchestration Specification

## Purpose
Model authored workplace cases as validated, deterministic graphs of sticky decisions and delayed follow-ups with explicit outcomes.

## Requirements

### Requirement: Cases schedule deterministic follow-up stickies
The game SHALL schedule declared choice follow-ups against authoritative game time, activate each referenced event exactly once when its due boundary is reached, and preserve pending follow-ups across day rollover.

#### Scenario: Time reaches a follow-up boundary
- **WHEN** authoritative game time advances exactly to or beyond a pending follow-up due time
- **THEN** the referenced sticky activates once regardless of update size

### Requirement: Cases have validated terminal outcomes
The game SHALL reject unknown references, invalid delays, terminal choices with follow-ups, cyclic case graphs, case events with inconsistent identities, and cases without a reachable resolved or failed terminal choice.

#### Scenario: Invalid case content is loaded
- **WHEN** a case graph violates any validation rule
- **THEN** content initialization fails before play begins

### Requirement: Case outcomes are idempotent evidence
The game SHALL record each case as resolved or failed at most once and expose resolved and failed case identifiers to results and diagnostics.

#### Scenario: A terminal choice is activated repeatedly
- **WHEN** repeated input targets an already concluded case choice
- **THEN** the original outcome remains unchanged and is not recorded again
