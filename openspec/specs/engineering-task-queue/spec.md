# Engineering Task Queue Specification

## Purpose

Provide a deterministic, data-driven sequence of engineering tasks whose selection, progress, trade-offs, and completion rewards sustain the primary coding loop throughout the workday.

## Requirements

### Requirement: Engineering tasks are validated content data
The game SHALL define engineering tasks as presentation-independent content containing a stable identifier, title, positive effort, priority, reward effects, risk information, optional Technical Debt effects, and an optional progress-triggered decision.

#### Scenario: The MVP task catalog is loaded
- **WHEN** a fresh workday initializes its task content
- **THEN** at least five varied valid engineering tasks are available without task-specific conditionals in the workstation presentation

#### Scenario: Invalid task content is supplied
- **WHEN** a task has a duplicate or empty identifier, non-positive effort, invalid priority, invalid effects, or an invalid progress trigger
- **THEN** the catalog is rejected before play begins

### Requirement: The task queue owns selection and independent progress
The game SHALL maintain one selected incomplete task when work remains, SHALL retain bounded progress independently for every task, and SHALL expose immutable queue state without requiring the workstation scene.

#### Scenario: A fresh queue begins
- **WHEN** a run starts with the MVP task catalog
- **THEN** one task is selected, every task has zero progress and incomplete status, and no completed work is recorded

#### Scenario: The player selects another incomplete task
- **WHEN** the player selects a different incomplete task
- **THEN** it becomes the sole selected task and the previous task retains its exact progress

#### Scenario: A completed task is selected
- **WHEN** the player attempts to select a completed task
- **THEN** selection and queue state remain unchanged

#### Scenario: Work is applied to the selected task
- **WHEN** coding produces work for the selected task
- **THEN** only that task advances and its progress remains within zero to 100 percent

### Requirement: Switching tasks has an explicit attention cost
The game SHALL apply one configured bounded Focus reduction when the player voluntarily switches away from a distinct unfinished selected task, SHALL stop active coding, and SHALL require a fresh coding press.

#### Scenario: The player switches tasks while coding
- **WHEN** the player selects another incomplete task while a coding input is held
- **THEN** coding stops, the configured Focus reduction is applied once, and the held input cannot start the new task

#### Scenario: The selected task is selected again
- **WHEN** the player activates the already selected task
- **THEN** no switch cost is applied and task state remains unchanged

#### Scenario: Selection changes automatically after completion
- **WHEN** completing a task causes the next incomplete task to be selected
- **THEN** no voluntary-switch Focus cost is applied

### Requirement: Task completion and rewards occur exactly once
The game SHALL complete a task exactly once at 100 percent, apply its declared reward and Technical Debt effects once, record it in completed-work history, and automatically select the next incomplete task in stable queue order.

#### Scenario: A selected task reaches completion
- **WHEN** coding supplies enough work to finish the selected task
- **THEN** its progress becomes exactly 100 percent, its effects are applied once, it is recorded once, and the next incomplete task becomes selected

#### Scenario: Further updates follow a completed task
- **WHEN** further scene or coding updates occur after a task completed
- **THEN** that task's effects and completion record are not emitted again

#### Scenario: Every task is complete
- **WHEN** the final incomplete task completes
- **THEN** no task remains selected, the completed-work history contains every task once, and coding becomes unavailable

### Requirement: A task midpoint decision triggers once
The game SHALL support a task-specific decision at a configured progress threshold, SHALL stop coding exactly at that threshold, and SHALL keep passive workday advancement and interruptions live until one declared choice resolves through the common effect behavior.

#### Scenario: Coding crosses the midpoint threshold
- **WHEN** one coding update would advance the configured task from below its decision threshold to above it
- **THEN** progress stops exactly at the threshold and the task decision opens once

#### Scenario: The midpoint choice resolves
- **WHEN** the player selects an available midpoint choice
- **THEN** its declared game-time and effect consequences apply once, the decision closes, and coding remains stopped until a fresh press

#### Scenario: Progress revisits the threshold
- **WHEN** a later consequence reduces the task below its previously triggered threshold and coding reaches it again
- **THEN** the same midpoint decision does not trigger again

### Requirement: The workstation presents authoritative queue state
The left task region SHALL present every MVP task with its title, identifier, priority, progress, and selected or completed state, and SHALL allow the player to select incomplete tasks while no decision is open.

#### Scenario: Queue state changes
- **WHEN** selection, progress, or completion changes
- **THEN** the task region and laptop update to the same authoritative selected-task snapshot

#### Scenario: The player activates an available task row
- **WHEN** an incomplete non-selected task row is activated while decisions are closed
- **THEN** the queue performs the documented task switch

#### Scenario: Task selection is blocked by a decision
- **WHEN** the player activates a task row while any modal decision is open
- **THEN** selection and task progress remain unchanged
