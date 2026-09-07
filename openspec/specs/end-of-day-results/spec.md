# End-of-Day Results

## Purpose
Explain an endless run using case-based evidence.

## Requirements

### Requirement: Runs continue across days
The game SHALL begin the next day in the same run, partially restore needs and Stamina, and preserve resources, debt, case state, stickies, boosters, and delayed consequences.

#### Scenario: A day boundary is crossed
- **WHEN** the workday reaches its overnight boundary without collapse
- **THEN** play continues at the next morning with persistent case orchestration intact

### Requirement: Collapse results use case evidence
The results autopsy SHALL report resolved cases, failed commitments, incidents handled, resources, debt, needs, boosters, and unresolved stickies without task fields.

#### Scenario: A run collapses
- **WHEN** a collapse condition is reached
- **THEN** results identify the cause and show resolved and failed case identifiers

### Requirement: Restart creates a fresh run
The results scene SHALL provide restart and mute lifecycle controls.

#### Scenario: Restart is selected
- **WHEN** the player activates restart
- **THEN** a fresh sticky-only workday starts without leaking prior run state

