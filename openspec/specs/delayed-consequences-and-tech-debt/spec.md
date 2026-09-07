# Delayed Consequences and Technical Debt

## Purpose
Define presentation-independent sticky effects and delayed consequences.

## Requirements

### Requirement: Sticky effects use explicit supported contracts
The game SHALL execute resource, need-relief, booster-consumption, delayed, and probabilistic effects in declared order.

#### Scenario: A sticky choice resolves
- **WHEN** a choice contains supported effects
- **THEN** each effect executes once without task, Focus, or coding state

### Requirement: Delayed effects follow authoritative time
Delayed effects SHALL execute once at their due game-time boundary and survive day transitions.

#### Scenario: Time crosses a delayed boundary
- **WHEN** authoritative time reaches a queued consequence
- **THEN** it concludes exactly once regardless of update size

