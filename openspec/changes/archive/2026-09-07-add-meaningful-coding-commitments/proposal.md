## Why

Engineering tasks are currently interchangeable progress bars whose static rewards sit beside the interruption system. Giving selected tasks visible promises, mutable scope, and recoverable failure makes interruptions threaten concrete responsibilities and creates the intended prioritization tension.

## What Changes

- Add data-driven task commitments with stakeholders, authoritative deadlines, failure consequences, and dormant authored crisis tasks.
- Make deadline crossing deterministic and turn missed login and search commitments into urgent recovery work.
- Allow interruption effects to assign or extend a deadline, add effort to an explicit task, and activate an authored task.
- Present commitment and failure state in the existing task queue and expose it to diagnostics.

## Capabilities

### New Capabilities
- `task-commitments`: Defines commitment deadlines, hard failure, crisis activation, and day-rollover behavior.

### Modified Capabilities
- `engineering-task-queue`: Adds task lifecycle states, mutable effort, dormant tasks, and commitment presentation.
- `interruption-decisions`: Allows choices to mutate explicitly identified task responsibilities.

## Impact

The change affects the engineering task model and catalog, common effect types and execution ports, workday time-boundary orchestration, task/interruption content, workstation task cards, diagnostics, deterministic simulations, and their unit/browser tests. It introduces no external dependency or save-data migration.
