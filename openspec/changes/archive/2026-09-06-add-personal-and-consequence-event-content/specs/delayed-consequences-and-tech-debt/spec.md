## ADDED Requirements

### Requirement: Content consequences retain causal provenance
The game SHALL retain a stable presentation-independent record linking every schedulable consequence event to the prior resolved choice, concluded consequence, incident history, or current-state condition that enabled it.

#### Scenario: A prior choice enables a consequence event
- **WHEN** a delayed or immediate shortcut outcome makes a consequence definition eligible
- **THEN** its provenance identifies the source event and resolved choice

#### Scenario: A queued consequence concludes
- **WHEN** a concluded queue outcome enables a follow-on consequence event
- **THEN** its provenance identifies the concluded consequence and outcome

#### Scenario: A consequence is presented
- **WHEN** an eligible consequence event becomes active
- **THEN** debug and validation data can trace it to its cause without exposing hidden uncertain outcomes to the player

