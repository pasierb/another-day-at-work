## ADDED Requirements

### Requirement: Interruption content describes incident control and coding disruption
The game SHALL allow interruption definitions and effects to declare whether an incident is external or player-fixable, and to declare a validated time-bounded coding block or slowdown whose certain behavior can be previewed without constructing the workstation scene.

#### Scenario: Incident metadata is inspected
- **WHEN** production or tooling content is loaded
- **THEN** its control classification and any coding disruption amount and duration are available as typed presentation-independent data

#### Scenario: Invalid incident metadata is supplied
- **WHEN** content contains an unsupported control classification, non-finite disruption value, value outside its bounds, non-positive duration, or misleading certain-outcome preview
- **THEN** the definition is rejected before it can become active

#### Scenario: An uncertain outcome is inspected
- **WHEN** a choice includes a probabilistic or delayed effect
- **THEN** presentation data distinguishes the uncertain outcome from its certain immediate costs
