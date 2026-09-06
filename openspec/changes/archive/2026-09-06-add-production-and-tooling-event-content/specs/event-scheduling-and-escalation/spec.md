## ADDED Requirements

### Requirement: Authored production escalation can respond to Technical Debt
The game SHALL allow a production escalation stage to declare a bounded Technical Debt severity modifier, SHALL evaluate it only when that stage is entered, and SHALL preserve all scheduling and escalation ordering for identical seeds, state, and time updates.

#### Scenario: A debt-sensitive stage is entered
- **WHEN** a production event enters a stage with a declared Technical Debt severity modifier
- **THEN** the stage's effective severity is derived from current Technical Debt and remains within the declared severity bounds

#### Scenario: Technical Debt changes before stage entry
- **WHEN** Technical Debt changes after event activation but before a debt-sensitive stage is entered
- **THEN** the stage uses the value at entry without changing the event identity, escalation deadline, or prior stages

#### Scenario: A stage has no debt modifier
- **WHEN** an escalation stage is entered without declared debt-sensitive severity behavior
- **THEN** Technical Debt does not change its authored severity

#### Scenario: The run is replayed
- **WHEN** two fresh runs use identical content, seed, Technical Debt history, pause history, and game-time updates
- **THEN** they produce the same effective production severities and ordered transitions
