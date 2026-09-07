## ADDED Requirements

### Requirement: Sticky decisions are the sole in-run action surface
The game SHALL expose gameplay commands only as inline choices on active stickies; pause, mute, guidance dismissal, and restart remain lifecycle controls.

#### Scenario: Legal actions are inspected during a run
- **WHEN** the run is active
- **THEN** no task selection, coding, AI review, Focus, booster shortcut, toilet shortcut, or laptop application command is available

### Requirement: Sticky choices support case and need effects
Interruption content SHALL support optional case identity, delayed follow-ups, terminal case outcomes, case-status eligibility, need relief, and booster consumption as validated data.

#### Scenario: A data-driven sticky resolves
- **WHEN** its inline choice is selected
- **THEN** all declared time, resource, need, booster, scheduling, and case consequences apply atomically once
