## ADDED Requirements

### Requirement: Need warnings track current need stages
The game SHALL expose current sleepiness and toilet stages to interruption eligibility and SHALL immediately suppress matching unresolved or future need warnings when relief moves the need below the warning's declared threshold.

#### Scenario: A warning threshold is crossed
- **WHEN** a need enters a stage with an eligible personal warning
- **THEN** subsequent scheduling evaluates that warning against the new stage

#### Scenario: The underlying need is relieved
- **WHEN** a bathroom action or other valid relief moves a need below an active warning's threshold
- **THEN** the stale warning is removed or made non-actionable and equivalent warnings remain ineligible while the need stays below the threshold

#### Scenario: Relief occurs while a decision is open
- **WHEN** an allowed resolving action changes the underlying need before the warning resolution finalizes
- **THEN** the warning cannot apply its stale need-state outcome more than once

