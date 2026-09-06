## REMOVED Requirements

### Requirement: Holding an available coding control performs work
**Reason**: Continuous held input is replaced by discrete AI generation and change-review decisions that better represent contemporary software development.

**Migration**: Start prompt or plan mode, wait for its simulated AI cycle, then approve or revise the proposed change batch.

### Requirement: Interrupted input cannot leave coding active
**Reason**: Coding no longer depends on persistent pointer or keyboard hold state, so held-source cancellation is not part of the primary loop.

**Migration**: Use idempotent discrete actions and cancel active AI cycle state only when its task or run becomes invalid.

## MODIFIED Requirements

### Requirement: Focus rewards attentive review
The game SHALL expose bounded Focus as review effectiveness, SHALL use it with the selected coding mode to determine which risk and uncertainty signals are visible when a batch is first presented, and SHALL constrain all Focus changes to its configured bounds. Authoritative personal-need and interruption effects SHALL modify Focus without altering evidence or outcomes already frozen into an existing batch.

#### Scenario: Coding is held continuously
- **WHEN** the player continuously holds the former coding pointer control or Space-key input
- **THEN** holding produces no continuous task progress, Focus gain, or Stamina drain

#### Scenario: Coding is released
- **WHEN** the player releases a pointer or keyboard input after invoking a discrete AI work-cycle action
- **THEN** release does not cancel, accelerate, or otherwise mutate that cycle

#### Scenario: Continuous holding is compared with tapping
- **WHEN** equivalent sessions hold or tap inactive space without invoking an available discrete action
- **THEN** neither input pattern changes task progress or Focus

#### Scenario: High Focus reveals review signals
- **WHEN** a proposed change batch is created while the player has high Focus
- **THEN** its configured review evidence reveals at least as many applicable concern signals as the same mode and context at lower Focus

#### Scenario: Low Focus limits review signals
- **WHEN** a proposed batch is created while the player has low Focus
- **THEN** some configured concern or uncertainty signals may remain hidden while approval remains available

#### Scenario: Focus reaches either bound
- **WHEN** a resource or consequence effect would move Focus beyond its configured range
- **THEN** Focus remains at the corresponding bound and review effectiveness remains valid

#### Scenario: Personal needs reduce Focus
- **WHEN** an authoritative personal-need effect reduces Focus before a new batch is presented
- **THEN** the next batch uses the reduced bounded Focus when determining visible review evidence

#### Scenario: Personal needs slow coding
- **WHEN** a personal need applies its configured Focus or cycle modifier during AI-assisted work
- **THEN** subsequent evidence or phase progress uses that bounded modifier without changing an already frozen batch

#### Scenario: Personal need penalty is removed
- **WHEN** all personal-need modifiers return to neutral
- **THEN** subsequent AI phases and newly created batches use neutral behavior without requiring a new session

#### Scenario: Focus changes after presentation
- **WHEN** an authoritative effect changes Focus while a proposed batch is already awaiting review
- **THEN** the batch retains the evidence and underlying outcome frozen at presentation time

### Requirement: Coding honors workday and resource availability
The game SHALL allow a new AI work cycle only while the workday is running and incomplete, Stamina is greater than zero, and the engineering task queue has a selected incomplete task that is not waiting on a task decision. An already presented batch SHALL accept at most one valid review decision while its task and run remain valid.

#### Scenario: The workday is paused
- **WHEN** the workday is paused during an active planning or generation phase
- **THEN** its remaining duration, task progress, Focus, and coding-related resources remain unchanged

#### Scenario: Stamina is exhausted during coding
- **WHEN** Stamina reaches zero before a new AI cycle begins
- **THEN** starting prompt or plan mode remains unavailable until Stamina becomes positive

#### Scenario: The workday ends
- **WHEN** the workday reaches its completion time during generation or review
- **THEN** the active cycle is cancelled and produces no later progress, Focus change, or Stamina drain

#### Scenario: The current task completes
- **WHEN** an approved batch completes the selected task
- **THEN** that cycle ends and no work is applied to the automatically selected task

#### Scenario: A task decision is pending
- **WHEN** approved work reaches an unresolved task decision threshold
- **THEN** progress stops at the threshold and no new AI cycle is available until that decision resolves

### Requirement: The laptop presents current coding state
The workstation laptop SHALL display the selected task identity and progress, bounded Focus, available coding modes, active planning or generation progress, and any proposed batch awaiting review from authoritative session and queue state.

#### Scenario: The workstation first appears
- **WHEN** the workstation creates a fresh session and task queue
- **THEN** the laptop displays the selected task at zero progress, current Focus, and available prompt and plan mode actions

#### Scenario: Coding state changes
- **WHEN** mode selection, generation progress, proposed evidence, task progress, Focus, or availability changes
- **THEN** the corresponding laptop text, meter, and actions update to match authoritative state

#### Scenario: Coding is disabled
- **WHEN** starting or continuing AI work is unavailable because the workday is paused or complete, Stamina is exhausted, or a task decision is pending
- **THEN** the laptop clearly displays the applicable reason and rejects unavailable actions

#### Scenario: All work is complete
- **WHEN** no incomplete task remains
- **THEN** the laptop presents an all-tasks-complete state and keeps both coding modes unavailable

### Requirement: Opening an interruption decision suspends AI work safely
The game SHALL pause planning and generation through the common workday pause ownership while an interruption decision is open, SHALL preserve an already presented batch if its task and run remain valid, and SHALL never execute a review action implicitly when the decision closes.

#### Scenario: A held input spans a decision
- **WHEN** a former coding input remains physically held while an interruption decision opens and resolves
- **THEN** the held input neither advances AI work nor implicitly approves or revises a batch

#### Scenario: A decision opens during generation
- **WHEN** an interruption decision opens during planning or generation
- **THEN** AI cycle time stops until the decision resolves and resumes without duplicated elapsed time

#### Scenario: A decision opens during review
- **WHEN** an interruption decision opens while a proposed batch awaits review
- **THEN** the batch remains stable and no approval or revision occurs until the player explicitly chooses it after the interruption resolves

### Requirement: Temporary tool disruptions modify AI work against game time
The game SHALL combine active run-scoped tooling disruptions into a bounded planning and generation speed modifier, SHALL advance their deadlines only through authoritative game time, and SHALL restore the remaining or neutral modifier when each disruption ends.

#### Scenario: A complete tool outage is active
- **WHEN** a zero-speed disruption is active during an otherwise available AI cycle
- **THEN** planning or generation produces no cycle progress and consumes no coding-related resource for work that did not occur

#### Scenario: A partial slowdown is active
- **WHEN** a bounded non-zero disruption is active during planning or generation
- **THEN** cycle progress uses the declared reduced rate while remaining within its configured time boundary

#### Scenario: Multiple disruptions overlap
- **WHEN** more than one tooling disruption is active
- **THEN** their declared combination rule produces one bounded effective modifier and each disruption retains its own deadline

#### Scenario: A disruption ends
- **WHEN** authoritative game time reaches a disruption deadline
- **THEN** it is removed exactly once and subsequent cycle progress uses the remaining combined modifier or neutral speed

#### Scenario: A disruption ends during a cycle
- **WHEN** a blocking disruption ends while an AI cycle remains active
- **THEN** the same cycle resumes automatically without duplicating progress or requiring a new mode selection

#### Scenario: Coding is held across recovery
- **WHEN** a blocking disruption ends while a former coding input remains physically held
- **THEN** recovery resumes only the already active AI cycle and the held input performs no discrete action

#### Scenario: A run is paused or reset
- **WHEN** authoritative game time is paused or the run is reset
- **THEN** active disruptions do not expire during the pause and reset clears every disruption and its recovery state

## RENAMED Requirements

- FROM: `### Requirement: Focus rewards uninterrupted coding`
- TO: `### Requirement: Focus rewards attentive review`
- FROM: `### Requirement: Opening an interruption decision requires fresh coding input`
- TO: `### Requirement: Opening an interruption decision suspends AI work safely`
- FROM: `### Requirement: Temporary tool disruptions modify coding against game time`
- TO: `### Requirement: Temporary tool disruptions modify AI work against game time`
