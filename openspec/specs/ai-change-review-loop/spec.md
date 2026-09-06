# AI Change Review Loop Specification

## Purpose

Provide a decision-driven AI-assisted implementation loop in which players trade delivery speed, review effort, and code quality while progressing engineering tasks.

## Requirements

### Requirement: A task offers prompt and plan coding modes
The game SHALL let the player begin each AI work cycle in prompt mode or plan mode while an incomplete task is selected and coding is available, and SHALL keep the selected mode stable until that cycle is resolved or cancelled.

#### Scenario: Player begins prompt mode
- **WHEN** the player starts an available work cycle in prompt mode
- **THEN** the game begins generating a proposed change batch using the configured prompt-mode duration, work size, and quality profile

#### Scenario: Player begins plan mode
- **WHEN** the player starts an available work cycle in plan mode
- **THEN** the game begins a longer planning and generation cycle whose resulting batch uses the configured larger work size and higher-confidence quality profile

#### Scenario: Player attempts to change mode during a cycle
- **WHEN** planning, generation, or review is already active
- **THEN** the active cycle retains its original mode until it is resolved or cancelled

### Requirement: AI work advances through authoritative game time
The game SHALL advance planning and generation only through unpaused authoritative game time, SHALL stop at the configured cycle boundary, and SHALL present exactly one reviewable batch when generation completes.

#### Scenario: Generation advances normally
- **WHEN** an AI cycle is active and the workday advances
- **THEN** its remaining duration decreases by the corresponding game time without directly changing task progress

#### Scenario: Gameplay is paused
- **WHEN** the workday is paused during planning or generation
- **THEN** the cycle duration, task progress, and coding-related resources remain unchanged

#### Scenario: Generation completes
- **WHEN** authoritative game time reaches the active cycle's completion boundary
- **THEN** generation stops, one immutable proposed change batch is presented, and further task progress waits for a review decision

### Requirement: A proposed batch communicates review evidence
Each proposed change batch SHALL identify its task and mode, proposed amount of work, changed-file and test evidence, known concern or uncertainty signals, and the available approval and revision actions. Signal completeness SHALL be influenced by the cycle's mode and bounded player Focus without changing the batch's underlying outcome after presentation.

#### Scenario: A prompt-mode batch is presented
- **WHEN** prompt-mode generation completes
- **THEN** the player sees the batch's available evidence and any uncertainty that the mode and current Focus reveal

#### Scenario: A plan-mode batch is presented
- **WHEN** plan-mode generation completes for the same eligible task context
- **THEN** its configured quality profile provides at least as much risk visibility and no greater adverse-outcome likelihood than prompt mode

#### Scenario: Focus changes during review
- **WHEN** a batch is already presented and a later effect changes Focus
- **THEN** the batch's displayed evidence and predetermined outcome remain stable for that review decision

### Requirement: Approval applies a batch exactly once
The game SHALL let the player approve a proposed batch, SHALL apply its bounded work to the selected task exactly once, and SHALL resolve its predetermined quality outcome into immediate or delayed effects exactly once.

#### Scenario: Player approves a safe batch
- **WHEN** the player approves a presented batch whose outcome has no adverse effect
- **THEN** its bounded work advances the selected task once and the cycle returns to an available state unless a task boundary changes availability

#### Scenario: Player quickly approves a risky batch
- **WHEN** the player approves a batch with a predetermined adverse outcome
- **THEN** its work advances once and its declared technical-debt, stability, or delayed-consequence effect is scheduled or applied once

#### Scenario: Approval reaches a task boundary
- **WHEN** an approved batch contains enough work to reach task completion or an unresolved task decision threshold
- **THEN** progress stops exactly at that boundary and any unused proposed work is discarded rather than applied to another task

#### Scenario: Approval is repeated
- **WHEN** further pointer, keyboard, scene, or update events occur after a batch has been approved
- **THEN** that batch produces no additional work, resource mutation, or consequence

### Requirement: Revision trades time for improved confidence
The game SHALL let the player return a proposed batch for revision, SHALL apply the declared review cost once, and SHALL produce a replacement batch for the same task and mode with improved risk visibility or reduced adverse-outcome likelihood.

#### Scenario: Player requests changes
- **WHEN** the player returns a proposed batch for revision
- **THEN** no task work from that batch is applied, the configured time or review-resource cost is charged once, and replacement generation begins

#### Scenario: Revised batch is presented
- **WHEN** replacement generation completes
- **THEN** the original batch is no longer actionable and the replacement exposes its configured improved quality profile

#### Scenario: Revision reaches its configured quality ceiling
- **WHEN** the player requests another revision after the cycle has reached its maximum improvement tier
- **THEN** the resulting batch remains within the declared quality bounds and does not exceed the configured ceiling

### Requirement: Cycles cancel safely when their task or run becomes invalid
The game SHALL cancel active planning, generation, and review state when the selected task changes incompatibly, the workday ends, the run restarts, or the workstation shuts down, and SHALL never carry a proposal into another task or run.

#### Scenario: Selected task changes during a cycle
- **WHEN** the selected task changes before the active batch is approved
- **THEN** the cycle and any proposal for the prior task are cancelled without applying work

#### Scenario: Run terminates during review
- **WHEN** the workday enters results, restarts, or shuts down while a batch is awaiting review
- **THEN** the batch becomes unactionable and no cycle state is inherited by the next run

### Requirement: Coding modes are data-driven and extensible
The game SHALL define mode timing, batch size, review costs, evidence visibility, and quality bounds as validated data, and SHALL reject invalid or duplicate mode definitions without requiring an autonomous agentic mode in this release.

#### Scenario: Valid modes are loaded
- **WHEN** the configured prompt and plan mode definitions are validated
- **THEN** both modes are available with finite non-negative timing and cost values, positive work values, bounded quality values, and distinct identifiers

#### Scenario: Invalid mode content is supplied
- **WHEN** validation receives a duplicate identifier, invalid state transition, non-finite value, negative duration or cost, non-positive work amount, or quality value outside its bounds
- **THEN** validation fails before gameplay uses the content

