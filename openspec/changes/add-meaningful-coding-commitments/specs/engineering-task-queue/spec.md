## ADDED Requirements

### Requirement: The task queue owns explicit lifecycle and mutable effort
The game SHALL represent each task as dormant, active, completed, or failed, SHALL restrict selection and work to active tasks, and SHALL allow validated effort increases that preserve already completed work units.

#### Scenario: Dormant work is loaded
- **WHEN** the catalog contains an authored dormant crisis task
- **THEN** it is retained in authoritative state but omitted from the normal actionable queue until activated

#### Scenario: Scope adds effort
- **WHEN** a targeted effect adds effort to an active task with progress
- **THEN** its completed work units remain unchanged and its displayed percentage is recalculated against the larger effort

#### Scenario: Ineligible work is selected
- **WHEN** selection targets a dormant, completed, failed, or unknown task
- **THEN** selection and queue state remain unchanged

### Requirement: Commitment state is presented on task cards
The workstation SHALL distinguish active commitments, untimed work, completed work, and failed work while preserving the authoritative selected-task snapshot.

#### Scenario: A deadline approaches
- **WHEN** an active commitment has thirty or fewer game minutes remaining
- **THEN** its task card shows urgent deadline styling without changing its priority or simulation state

#### Scenario: A commitment fails
- **WHEN** a task enters failed state
- **THEN** its failed status is visible, it cannot be selected, and its activated crisis appears as urgent actionable work

