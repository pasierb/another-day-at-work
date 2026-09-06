# Player Needs Specification

## Purpose

Model the engineer's increasing sleepiness and toilet pressure so personal wellbeing creates visible, recoverable trade-offs during the workday.

## Requirements

### Requirement: Personal needs follow authoritative game time
The game SHALL maintain bounded Sleepiness and Toilet Need values, derive named stages from configurable ordered thresholds, advance both needs from elapsed game time, and stop passive advancement whenever the workday clock is not advancing.

#### Scenario: Accelerated workday advances needs
- **WHEN** the authoritative workday clock advances across one or more need thresholds
- **THEN** both needs increase by their configured rates, remain within their bounds, and expose the correct named stages for the resulting values

#### Scenario: Paused time does not advance needs
- **WHEN** real time passes while the workday is paused and its game time remains unchanged
- **THEN** neither need value nor stage changes

#### Scenario: An action advances game time
- **WHEN** a decision or player action jumps the authoritative game clock forward
- **THEN** needs account for the full game-time jump exactly once, including every threshold crossed

### Requirement: Need stages apply bounded gameplay penalties
High Sleepiness and Toilet Need stages SHALL expose configured coding-speed and Focus-gain modifiers, and high Toilet Need SHALL expose configured additional Stamina drain. Combined modifiers and costs MUST remain finite, non-negative, and within their documented bounds.

#### Scenario: A need enters a penalized stage
- **WHEN** either need crosses into a stage with configured penalties
- **THEN** the current coding-speed, Focus-gain, and additional Stamina-drain outputs immediately reflect that stage

#### Scenario: Bathroom relief removes a toilet penalty
- **WHEN** Toilet Need is relieved below a penalized threshold
- **THEN** the Toilet Need contribution to each active penalty stops immediately

#### Scenario: Multiple penalties are active
- **WHEN** Sleepiness and Toilet Need both occupy penalized stages
- **THEN** their modifiers combine deterministically and cannot make coding speed or Focus gain negative

### Requirement: Need transitions produce readable warnings
The game SHALL surface a readable warning when either need enters an important configured stage and SHALL not repeat that warning while the need remains in the same stage.

#### Scenario: A warning threshold is crossed
- **WHEN** a need enters a configured warning stage
- **THEN** the workstation identifies the need, its new stage, and the resulting pressure to the player once

#### Scenario: Several thresholds are crossed in one jump
- **WHEN** one game-time jump crosses multiple warning stages
- **THEN** every crossed stage transition is processed in chronological order without duplicating a transition

### Requirement: Critical needs have recoverable one-shot consequences
Entering a critical Sleepiness or Toilet Need stage SHALL produce its configured humorous consequence once per critical episode, and the run SHALL remain playable afterward.

#### Scenario: A need first becomes critical
- **WHEN** a need enters its critical stage from a lower stage
- **THEN** its critical consequence is applied exactly once and the resulting feedback is presented to the player

#### Scenario: A critical need remains unchanged
- **WHEN** subsequent updates occur while the need remains in the critical stage
- **THEN** the critical consequence does not trigger again

#### Scenario: A relieved need later becomes critical again
- **WHEN** a critical need is relieved below its critical threshold and subsequently re-enters the critical stage
- **THEN** a new critical episode may trigger the consequence once

### Requirement: Toilet action costs time and relieves need
The workstation SHALL provide a Toilet quick action while player actions are available. Activating it SHALL stop held coding, reduce Focus by the configured interruption amount, advance the authoritative game clock by the configured duration, and lower Toilet Need to the configured relieved value exactly once.

#### Scenario: Player takes a bathroom break
- **WHEN** the player activates the available Toilet action
- **THEN** coding stops, Focus is reduced, time advances, Toilet Need is relieved, and all affected displays update immediately

#### Scenario: Bathroom time crosses another need threshold
- **WHEN** the Toilet action's time cost crosses a Sleepiness threshold
- **THEN** the Sleepiness transition and its effects are processed before the action completes

#### Scenario: Toilet action is unavailable
- **WHEN** a blocking decision is open or the workday is complete
- **THEN** activating the Toilet control has no gameplay effect

### Requirement: Needs are visible and resettable
The workstation SHALL display each need's current named stage and relative severity, and restarting the run SHALL restore both needs, their penalties, transition history, and critical-episode state to configured initial values.

#### Scenario: Need state changes
- **WHEN** either need value or stage changes
- **THEN** the corresponding workstation indicator updates from the authoritative need state

#### Scenario: Run is restarted
- **WHEN** the run resets after needs, penalties, or critical episodes have occurred
- **THEN** both needs and all derived or one-shot state match a fresh run

### Requirement: Need warnings track current need stages
The game SHALL expose current sleepiness and toilet stages to interruption eligibility and SHALL immediately suppress matching unresolved or future need warnings when relief moves the need below the warning's declared threshold.

#### Scenario: A warning threshold is crossed
- **WHEN** a need enters a stage with an eligible personal warning
- **THEN** subsequent scheduling evaluates that warning against the new stage

#### Scenario: The underlying need is relieved
- **WHEN** a bathroom action or other valid relief moves a need below an active warning's threshold
- **THEN** the stale warning is removed or made non-actionable and equivalent warnings remain ineligible while the need stays below the threshold

#### Scenario: Relief occurs while a decision is open
- **WHEN** an allowed resolving action changes the underlying need before the warning resolution finalizes
- **THEN** the warning cannot apply its stale need-state outcome more than once

### Requirement: Need accumulation responds to the active pacing band
Sleepiness and Toilet Need SHALL accumulate using validated band-specific rate modifiers derived from authoritative game time, and each portion of an update or action-time jump SHALL use the rate of the pacing band that portion crosses.

#### Scenario: Time advances within one band
- **WHEN** authoritative game time advances entirely within a pacing band
- **THEN** each need accumulates from its configured base rate and that band's declared modifier

#### Scenario: One update crosses several bands
- **WHEN** an elapsed-time update or action-time cost crosses one or more pacing-band boundaries
- **THEN** need accumulation is integrated across each crossed interval in chronological order and threshold transitions still occur exactly once

#### Scenario: A band does not modify one need
- **WHEN** a pacing band omits a modifier for Sleepiness or Toilet Need
- **THEN** the omitted need uses its neutral configured rate for that interval

#### Scenario: Need progression is paused
- **WHEN** authoritative game time remains unchanged during a pause
- **THEN** no band-specific need accumulation or threshold transition occurs
