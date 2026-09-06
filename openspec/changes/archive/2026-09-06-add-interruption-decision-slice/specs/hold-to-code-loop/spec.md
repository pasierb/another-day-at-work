## ADDED Requirements

### Requirement: Interruptions can disrupt Focus explicitly
The game SHALL support an explicit configured Focus reduction, constrain the resulting Focus to its existing bounds, and immediately expose the resulting multiplier to observers.

#### Scenario: Resolving an interruption reduces Focus
- **WHEN** an interruption choice applies a Focus reduction smaller than the current Focus
- **THEN** Focus and its multiplier decrease by the declared bounded amount without changing task progress

#### Scenario: A Focus reduction exceeds current Focus
- **WHEN** an interruption applies a Focus reduction greater than the current Focus
- **THEN** Focus stops at its minimum and the multiplier remains at its valid base value

### Requirement: Opening an interruption decision requires fresh coding input
The game SHALL cancel all held coding sources when an interruption decision opens and SHALL require a new coding press after the decision closes.

#### Scenario: A held input spans a decision
- **WHEN** a pointer or coding key remains physically held while a decision opens and then resolves
- **THEN** coding does not restart until that input is released and pressed again

