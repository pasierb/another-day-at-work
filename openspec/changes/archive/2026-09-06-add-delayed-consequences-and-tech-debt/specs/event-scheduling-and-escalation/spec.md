## ADDED Requirements

### Requirement: Selected event weights respond deterministically to Technical Debt
The game SHALL support content-defined base event weights with optional bounded Technical Debt modifiers, SHALL evaluate them when selecting a new scheduled event, and SHALL preserve deterministic selection for identical seeds and state.

#### Scenario: Technical Debt changes a selected event weight
- **WHEN** an eligible event declares a debt weight modifier and event selection occurs at elevated Technical Debt
- **THEN** its effective selection weight changes by the declared bounded amount before the seeded draw

#### Scenario: An event has no debt weight modifier
- **WHEN** eligible content does not declare a Technical Debt weight modifier
- **THEN** its configured base weight is unchanged by Technical Debt

#### Scenario: Weighted schedules are replayed
- **WHEN** two fresh runs use identical event content, scheduler seed, Technical Debt values at each draw, and game-time updates
- **THEN** they produce the same ordered sequence of scheduled interruptions and spawn times

#### Scenario: Technical Debt changes after an event is queued
- **WHEN** Technical Debt changes after an interruption has already been scheduled, activated, or placed in the capacity backlog
- **THEN** that interruption retains its existing identity, due time, and ordering

