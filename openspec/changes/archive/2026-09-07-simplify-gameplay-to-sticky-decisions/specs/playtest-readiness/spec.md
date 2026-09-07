## ADDED Requirements

### Requirement: Diagnostics expose sticky-only legal actions
Development diagnostics SHALL expose case outcomes and sticky/lifecycle actions without task fields or removed gameplay commands.

#### Scenario: Automated smoke tests inspect a run
- **WHEN** desktop or touch diagnostics are queried
- **THEN** they can verify passive laptop presentation, inline sticky decisions, meta controls, results, and restart
