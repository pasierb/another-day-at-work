# MVP Boosters

## Purpose
Model Coffee and Coke Zero as effects chosen from sleepiness stickies.

## Requirements

### Requirement: Booster consumption is data driven
The consume-booster effect SHALL apply configured Stamina restoration, Toilet Need increase, counters, cooldown state, hidden health risk, and feedback.

#### Scenario: Coke Zero is chosen
- **WHEN** its sleepiness-sticky choice resolves
- **THEN** Stamina rises, Toilet Need increases, and consumption evidence updates exactly once

### Requirement: Booster availability follows sticky recurrence
Booster choices SHALL be offered by the need-triggered sticky according to its recurrence cooldown rather than standalone controls.

#### Scenario: Sleepiness remains elevated after a stimulant
- **WHEN** the recurrence cooldown expires
- **THEN** the sleepiness sticky may recur and offer eligible booster choices again

