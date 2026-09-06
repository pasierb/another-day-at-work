## ADDED Requirements

### Requirement: Gameplay actions can spend workday time
The game SHALL provide an explicit action-time mutation that advances the workday by a non-negative amount of game time independently of passive elapsed-real-time updates and SHALL clamp the result at 17:00.

#### Scenario: An action spends time during a decision pause
- **WHEN** a choice spends a positive number of game minutes while its decision pause is active
- **THEN** the workday clock advances by that game-time cost and the decision pause remains active

#### Scenario: An action cost crosses the end of the day
- **WHEN** an action's game-time cost would move the clock beyond 17:00
- **THEN** the clock becomes exactly 17:00 and day progress becomes complete

#### Scenario: An invalid action-time cost is supplied
- **WHEN** an action-time mutation receives a negative or non-finite amount
- **THEN** the mutation is rejected without changing workday time

