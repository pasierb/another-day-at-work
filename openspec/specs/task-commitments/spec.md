# Task Commitments Specification

## Purpose

Make engineering work carry visible promises whose deadlines, failures, and recovery tasks interact predictably with the live workday.

## Requirements

### Requirement: Active commitments have authoritative deadlines
The game SHALL allow an active task to carry a stakeholder and absolute game-time deadline, SHALL expose its remaining time, and SHALL keep the deadline advancing during all unpaused workday activity.

#### Scenario: A commitment is visible
- **WHEN** an active task has a deadline
- **THEN** its stakeholder, due clock, and remaining game time are available to task presentation and diagnostics

#### Scenario: Gameplay is explicitly paused
- **WHEN** the workday is paused before a commitment deadline
- **THEN** neither authoritative workday time nor the commitment deadline countdown advances

### Requirement: Deadline completion wins at the boundary
The game SHALL count completion at the exact deadline as successful and SHALL fail an incomplete task exactly once when authoritative time would advance beyond that deadline.

#### Scenario: Work completes at the deadline
- **WHEN** the final accepted work completes a committed task at its exact deadline
- **THEN** completion effects apply and failure effects do not apply

#### Scenario: Time crosses an incomplete deadline
- **WHEN** an action, AI cycle, or passive update advances across an incomplete committed task's deadline
- **THEN** the task fails at that boundary before later transitions are processed

### Requirement: Failed commitments activate authored crisis work
The game SHALL make a failed task unavailable for selection, apply its failure effects once, cancel work targeting it, and activate its declared dormant crisis task once without automatically charging a voluntary switch cost.

#### Scenario: Selected commitment fails
- **WHEN** the selected committed task misses its deadline
- **THEN** it becomes failed, its AI work is cancelled, its crisis becomes active, and a valid active task is selected without a Focus switch penalty

#### Scenario: A failed commitment is updated again
- **WHEN** later synchronization revisits the same missed deadline
- **THEN** no failure effect or crisis activation repeats

### Requirement: Commitment recovery persists across workdays
The game SHALL carry unresolved crisis work across day rollover and SHALL not reactivate its failed source until the crisis has completed and a later workday begins.

#### Scenario: Crisis remains incomplete overnight
- **WHEN** a day rolls over with active crisis work
- **THEN** its progress is preserved and its failed source remains unavailable

#### Scenario: Crisis was completed before rollover
- **WHEN** a later day begins after the crisis was completed
- **THEN** its source task returns to its authored daily state and the crisis returns dormant with zero progress
