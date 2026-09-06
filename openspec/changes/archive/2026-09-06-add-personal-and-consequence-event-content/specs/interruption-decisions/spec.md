## ADDED Requirements

### Requirement: Interruption content supports personal and consequence context
The game SHALL recognize personal and consequence interruption categories and SHALL allow definitions to declare validated need-stage, booster-count, incident-history, and concluded-consequence eligibility facts without requiring a Phaser scene.

#### Scenario: Personal and consequence content is loaded
- **WHEN** valid personal and consequence definitions are inspected
- **THEN** their categories and eligibility facts are available as typed presentation-independent data

#### Scenario: Authoritative run context is created
- **WHEN** interruption eligibility is evaluated
- **THEN** the immutable context includes the current need stages, booster counts, resolved event choices, incident history, and concluded consequence identities required by the catalog

#### Scenario: Invalid contextual metadata is supplied
- **WHEN** a definition contains an unsupported category, unknown need or booster, invalid threshold or count, unknown referenced event or choice, or malformed consequence cause
- **THEN** the definition is rejected before activation

