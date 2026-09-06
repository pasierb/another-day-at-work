## ADDED Requirements

### Requirement: Interruption choices support future consequences
The game SHALL allow interruption choice content to declare validated immediate, delayed, and probabilistic effects that can be inspected without constructing the workstation scene, and the decision SHALL become resolved before any deadlines crossed by its action time are processed.

#### Scenario: A choice declares future effects
- **WHEN** interruption content is loaded with a delayed or probabilistic effect
- **THEN** its timing, probability branches, nested effects, feedback, and Technical Debt modifiers are available as typed content data

#### Scenario: Choice action time crosses a consequence deadline
- **WHEN** resolving a choice advances game time beyond an already queued consequence deadline
- **THEN** the selected interruption resolves exactly once before the crossed consequence is processed

### Requirement: The representative production decision covers four response patterns
The representative production interruption SHALL provide distinct Hotfix, Investigate Properly, Rollback, and Ignore choices whose displayed previews distinguish certain immediate costs from uncertain future outcomes.

#### Scenario: Production choices are inspected
- **WHEN** the representative production decision is opened
- **THEN** all four response patterns are available with accurate time, resource, Focus, debt, and uncertainty previews

#### Scenario: Rollback is selected
- **WHEN** the player chooses Rollback
- **THEN** the configured safer immediate stability recovery and bounded current-task progress loss are applied without creating hotfix debt

#### Scenario: Ignore is selected
- **WHEN** the player chooses Ignore in the decision
- **THEN** the configured immediate cost or future incident risk is applied once and the decision resolves normally
