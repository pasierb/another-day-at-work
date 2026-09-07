# Interruption Decisions

## Purpose
Make every in-run player action an inline sticky decision.

## Requirements

### Requirement: Sticky definitions are data driven
Each interruption SHALL define stable copy, timing, eligibility, and one or more inspectable choices with time and supported effects.

#### Scenario: Content is loaded
- **WHEN** the catalog is validated
- **THEN** invalid references, effects, delays, outcomes, and cyclic case graphs are rejected

### Requirement: Choices resolve inline
A visible sticky SHALL expose its choices directly and accept a choice with one click or tap.

#### Scenario: A choice is selected
- **WHEN** the player activates an inline choice
- **THEN** its time and effects apply once and the sticky resolves without a modal workflow

### Requirement: Gameplay actions are sticky-only
Legal in-run actions SHALL contain only sticky resolutions; pause, mute, guidance dismissal, and restart remain lifecycle controls.

#### Scenario: Legal actions are inspected
- **WHEN** a run is active
- **THEN** no task selection, coding, AI review, Focus, booster shortcut, toilet shortcut, or laptop command is available

