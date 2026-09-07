# Workstation Shell

## Purpose
Provide the responsive frame for the illustrated sticky-only workday.

## Requirements

### Requirement: Stable visual regions remain readable
The workstation SHALL reserve regions for the passive laptop, distributed stickies, clock, needs/resources status rail, and meta controls.

#### Scenario: Desktop layout renders
- **WHEN** the workstation starts
- **THEN** the laptop is unobstructed and the status rail does not overlap stickies

### Requirement: The shell supports touch sizing
The scene SHALL preserve readable, operable controls at the documented minimum touch viewport.

#### Scenario: The viewport reaches minimum size
- **WHEN** layout scaling is applied
- **THEN** inline sticky and meta controls remain inside the usable canvas

