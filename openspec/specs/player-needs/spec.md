# Player Needs

## Purpose
Model Sleepiness and Toilet Need as continuous pressure resolved through stickies.

## Requirements

### Requirement: Needs rise with authoritative time
Both needs SHALL advance continuously and trigger their stickies at the existing stage-2 threshold of 50.

#### Scenario: A need reaches stage 2
- **WHEN** its value crosses 50
- **THEN** the matching need sticky activates exactly once for that occurrence

### Requirement: Need drain is additive
Each need SHALL add Stamina drain of 0, 0, 0.05, 0.12, or 0.22 per game minute across its five stages.

#### Scenario: Both needs are elevated
- **WHEN** time advances
- **THEN** their stage drain amounts are summed deterministically

### Requirement: Bathroom relief is a sticky choice
The bathroom sticky SHALL offer a 10-minute act-now choice that relieves Toilet Need to 8 and a defer choice that leaves the need active for cooldown-based recurrence.

#### Scenario: Act now is selected
- **WHEN** the player chooses the bathroom action
- **THEN** 10 game minutes pass and Toilet Need becomes 8

