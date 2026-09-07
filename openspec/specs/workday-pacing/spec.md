# Workday Pacing

## Purpose
Keep continuous sticky pressure deterministic and balanceable across endless days.

## Requirements

### Requirement: Pacing is presentation independent
Seeded simulations SHALL run until collapse and report event pressure, quiet periods, resources, needs, case outcomes, recovery, days survived, and collapse cause.

#### Scenario: A seed is replayed
- **WHEN** the same profile, seed, and sticky policy are used
- **THEN** the same terminal evidence and pacing metrics are produced

### Requirement: The balance matrix covers meaningful outcomes
The deterministic matrix SHALL demonstrate manageable quiet periods, escalating pressure, multiple resolved cases, and every collapse category.

#### Scenario: The balance command runs
- **WHEN** all configured profiles and policies are simulated
- **THEN** evidence contains case outcomes and no task, Focus, or coding metrics

