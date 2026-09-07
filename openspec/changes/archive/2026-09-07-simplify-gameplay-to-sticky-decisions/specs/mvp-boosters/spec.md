## ADDED Requirements

### Requirement: Boosters are consumed by sticky choices
The game SHALL consume Coffee and Coke Zero only through `consume-booster` choice effects and SHALL retain their Stamina restoration, Toilet Need increase, counters, hidden health risk, and feedback.

#### Scenario: A booster choice is selected
- **WHEN** its need sticky is eligible and the choice is activated
- **THEN** the booster consequences apply once and future availability is controlled by that sticky's recurrence cooldown
