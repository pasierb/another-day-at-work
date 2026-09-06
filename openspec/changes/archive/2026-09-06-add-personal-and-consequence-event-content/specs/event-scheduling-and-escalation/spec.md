## ADDED Requirements

### Requirement: Scheduling respects deduplication and game-time cooldowns
The seeded scheduler SHALL exclude definitions whose stable deduplication key conflicts with an active event or whose bounded cooldown has not expired, using authoritative game time and current immutable run context.

#### Scenario: Two eligible warnings are equivalent
- **WHEN** one eligible definition has the same deduplication key as an active event
- **THEN** the scheduler excludes it without consuming an additional event activation or exceeding the active limit

#### Scenario: A handled warning remains on cooldown
- **WHEN** the scheduler evaluates the definition before its authoritative game-time cooldown deadline
- **THEN** it is excluded from weighted selection

#### Scenario: The run is paused
- **WHEN** scene updates occur while authoritative game time is paused
- **THEN** no event cooldown loses duration or becomes eligible

#### Scenario: Deterministic scheduling is replayed
- **WHEN** two runs use identical seeds, content, state history, active events, cooldown history, and game-time updates
- **THEN** they produce the same candidate filtering, event order, and spawn times

