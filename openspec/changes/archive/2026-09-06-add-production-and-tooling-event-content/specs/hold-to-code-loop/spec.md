## ADDED Requirements

### Requirement: Temporary tool disruptions modify coding against game time
The game SHALL combine active run-scoped tooling disruptions into a bounded coding-speed modifier, SHALL advance their deadlines only through authoritative game time, and SHALL restore the remaining or neutral modifier when each disruption ends.

#### Scenario: A complete tool outage is active
- **WHEN** a zero-speed disruption is active while the player holds an otherwise available coding control
- **THEN** no task progress is produced and no coding-related Stamina is consumed for work that did not occur

#### Scenario: A partial slowdown is active
- **WHEN** a bounded non-zero disruption is active while coding
- **THEN** work is produced at the declared reduced rate while Focus and task progress remain within their existing bounds

#### Scenario: Multiple disruptions overlap
- **WHEN** more than one tooling disruption is active
- **THEN** their declared combination rule produces one bounded effective modifier and each disruption retains its own deadline

#### Scenario: A disruption ends
- **WHEN** authoritative game time reaches a disruption deadline
- **THEN** it is removed exactly once and subsequent coding uses the remaining combined modifier or the neutral modifier

#### Scenario: Coding is held across recovery
- **WHEN** a blocking disruption ends while a coding input remains physically held
- **THEN** coding does not restart until the player performs a fresh coding press

#### Scenario: A run is paused or reset
- **WHEN** authoritative game time is paused or the run is reset
- **THEN** active disruptions do not expire during the pause and reset clears every disruption and its recovery state
