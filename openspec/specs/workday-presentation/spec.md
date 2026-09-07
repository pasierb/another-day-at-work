# Workday Presentation

## Purpose
Present a readable illustrated sticky workspace across desktop and touch layouts.

## Requirements

### Requirement: Laptop artwork is passive
The illustrated laptop SHALL remain visible as a scene prop without application, task, AI-review, or gameplay controls.

#### Scenario: The workstation opens
- **WHEN** the scene is rendered
- **THEN** stickies occupy the freed workspace without covering the status rail

### Requirement: Sticky choices remain inline and readable
Active stickies SHALL show concise copy, age/escalation state, and directly actionable choices with paging for overflow.

#### Scenario: The minimum touch viewport is used
- **WHEN** multiple stickies are active
- **THEN** their text and choice controls remain legible and operable

### Requirement: Meta controls remain conventional
Pause, mute, guidance dismissal, and restart SHALL remain ordinary controls outside the gameplay action model.

#### Scenario: Pause is toggled
- **WHEN** the pause control is activated
- **THEN** authoritative play stops and resumes without changing sticky choices

