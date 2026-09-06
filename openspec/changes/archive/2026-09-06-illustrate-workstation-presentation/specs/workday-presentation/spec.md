## MODIFIED Requirements

### Requirement: Presentation uses a consistent and accessible visual language
The game SHALL use a consistent authored palette, typography hierarchy, cards, meters, badges, portraits, icons, and interaction states across the workstation, decisions, and results, and SHALL communicate source, severity, and interactability with shape, text, iconography, border, or restrained motion cues in addition to color.

#### Scenario: Player distinguishes alert severity
- **WHEN** alerts of different severity are visible
- **THEN** the player can distinguish their urgency without relying only on hue

#### Scenario: Player recognizes an alert source
- **WHEN** an interruption card is visible
- **THEN** its portrait or icon, source label, and card treatment identify its person or system independently of the full copy

#### Scenario: Player scans interactive states
- **WHEN** enabled, hovered or pressed, selected, and disabled controls are shown
- **THEN** each state is visually distinct and disabled controls do not imply successful interaction

#### Scenario: Results are presented after the workday
- **WHEN** the results view opens
- **THEN** its ending, explanation, score hierarchy, and restart action use the same authored presentation language as the workstation

### Requirement: Workstation environment reflects escalating pressure
The workstation SHALL derive a deterministic visual-stress stage from game time, active-alert pressure, and Technical Debt, and SHALL use that stage to select authored environment, character, lighting, and clutter variants without changing domain state.

#### Scenario: Calm run begins
- **WHEN** a run is early, has few active alerts, and has low Technical Debt
- **THEN** the illustrated desk appears comparatively clean and calm and the developer appears composed

#### Scenario: Pressure increases
- **WHEN** time, active-alert pressure, or Technical Debt crosses a documented presentation threshold
- **THEN** the corresponding stress stage adds or emphasizes authored clutter, environmental details, and character strain without hiding controls, labels, meters, decisions, or alerts

#### Scenario: Equivalent state is rendered again
- **WHEN** the same presentation inputs are supplied after a redraw or seeded replay
- **THEN** the same stress stage and environmental composition are produced without random gameplay effects

#### Scenario: Stress stage changes during play
- **WHEN** presentation inputs move the workstation to a different stress stage
- **THEN** the new visual state appears without resetting gameplay, moving interactive regions, or producing a disruptive full-scene flash
