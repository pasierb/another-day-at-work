## MODIFIED Requirements

### Requirement: Presentation remains readable at supported viewports
The polished workstation, first-run instruction overlay, decision layer, and results presentation SHALL preserve the fixed logical composition and remain readable and operable at the project's minimum supported touch-sized viewport.

#### Scenario: Minimum supported viewport is used
- **WHEN** the workstation, first-run guidance, decision layer, or results view is displayed at the minimum supported viewport
- **THEN** the objective or result, essential status, severity, enabled controls, decision choices, and mute state remain readable, reachable, and non-overlapping

#### Scenario: First-run guidance is shown
- **WHEN** the instruction overlay appears over the workstation at any supported viewport
- **THEN** it identifies the objective, Hold to Code control, urgent alerts, and resources without hiding its dismissal control or implying that covered gameplay controls are active

#### Scenario: Visual stress reaches its maximum stage
- **WHEN** maximum presentation clutter is rendered at the minimum supported viewport
- **THEN** decorative elements remain behind or outside essential controls and status information

#### Scenario: Viewport changes with an overlay open
- **WHEN** the viewport is resized or changes orientation while first-run guidance or a decision is open
- **THEN** the overlay remains fully readable and its actionable controls remain aligned with pointer and touch input
