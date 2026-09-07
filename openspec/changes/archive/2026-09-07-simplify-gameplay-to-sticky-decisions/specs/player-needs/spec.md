## ADDED Requirements

### Requirement: Stage-two needs create recurring decisions
The game SHALL create bathroom and sleepiness stickies when their need reaches stage 2 at value 50, and a defer choice SHALL allow recurrence after the authored cooldown while the need remains eligible.

#### Scenario: Bathroom is handled now
- **WHEN** the player selects the bathroom action
- **THEN** ten game minutes pass and Toilet Need becomes 8

#### Scenario: Sleepiness is handled
- **WHEN** the player selects microbreak, Coffee, Coke Zero, or push through
- **THEN** the selected data-driven effects apply and the sticky resolves

### Requirement: Need stages drain Stamina additively
Each active need SHALL add Stamina drain of 0, 0, 0.05, 0.12, or 0.22 per game minute for stages zero through four respectively.

#### Scenario: Both needs are elevated
- **WHEN** authoritative time advances
- **THEN** their stage drain rates are summed before applying Stamina loss
