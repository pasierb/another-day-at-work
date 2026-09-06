## MODIFIED Requirements

### Requirement: Effect execution is independent from presentation
The game SHALL execute supported resource, Focus, selected-task progress, delayed, and probabilistic effects through a validated domain contract without requiring a Phaser scene, and SHALL preserve their declared order.

#### Scenario: A mixed effect list is executed
- **WHEN** a valid ordered list contains resource, Focus, selected-task progress, and consequence effects
- **THEN** each effect produces its declared domain result in list order without presentation-specific behavior

#### Scenario: A selected-task progress reduction is executed
- **WHEN** an effect reduces task progress while an incomplete task is selected
- **THEN** only the selected task loses the declared bounded progress and its completion and midpoint-trigger history remain intact

#### Scenario: No incomplete task is selected
- **WHEN** a selected-task progress effect executes after all tasks are complete
- **THEN** task history and progress remain unchanged

#### Scenario: An invalid effect is supplied
- **WHEN** content contains an unsupported effect type, non-finite value, invalid probability, or invalid delay
- **THEN** the content is rejected before the effect can execute or enter the consequence queue

