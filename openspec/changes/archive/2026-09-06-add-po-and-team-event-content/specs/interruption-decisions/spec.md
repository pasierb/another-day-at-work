## MODIFIED Requirements

### Requirement: Interruption content defines testable immediate decisions
The game SHALL represent each interruption as content data containing a stable identifier, category, severity, concise copy, activation time, optional declarative eligibility metadata, and at least two choices whose labels, descriptions, game-time costs, resource effects, Focus effects, and stable outcome identities can be inspected without constructing the workstation scene.

#### Scenario: Content is loaded
- **WHEN** the interruption definitions are read
- **THEN** each definition exposes all alert, eligibility, and choice data without requiring category-specific behavior embedded in presentation code

#### Scenario: Invalid content is supplied
- **WHEN** an interruption lacks a stable identity, alert metadata, two resolvable choices, or contains malformed eligibility or outcome metadata
- **THEN** the invalid definition is rejected before it can become active

#### Scenario: A choice resolves
- **WHEN** the player resolves an interruption choice
- **THEN** the stable event and choice outcome identities become available to later eligibility evaluation without coupling content to presentation state
