## ADDED Requirements

### Requirement: Results explain case-based outcomes
The results autopsy SHALL use resolved cases, failed commitments represented as failed cases, incidents handled, resources, debt, and unresolved stickies, and SHALL contain no task completion fields.

#### Scenario: A run collapses or reaches a day boundary
- **WHEN** results evidence is produced
- **THEN** resolved and failed case identifiers replace completed task identifiers
