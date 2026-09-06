## MODIFIED Requirements

### Requirement: Shell presentation communicates hierarchy and state honestly
The workstation SHALL visually prioritize the laptop workspace while keeping the surrounding status, task, interruption, clock, need, Technical Debt, and quick-action information readable, SHALL distinguish enabled controls from disabled or decorative elements, and SHALL retain that hierarchy as visual stress increases.

#### Scenario: Player scans the initial workstation
- **WHEN** the workstation is presented at any workday stress stage
- **THEN** the laptop workspace remains the dominant central element and the HUD, task queue, alerts, clock, needs, Technical Debt, and actions remain legible around it

#### Scenario: Player encounters a future-action placeholder
- **WHEN** an action or data-driven mechanic has not been implemented
- **THEN** its representation is visibly non-interactive and does not respond as though an action succeeded

#### Scenario: Player scans action states
- **WHEN** an enabled, selected, pressed, urgent, or disabled element is visible
- **THEN** its state is apparent through consistent non-color presentation cues and its interaction behavior matches the displayed state

#### Scenario: Decorative stress details are displayed
- **WHEN** clutter or environmental emphasis is added as workday pressure rises
- **THEN** those details remain visually subordinate and cannot intercept input intended for gameplay controls
