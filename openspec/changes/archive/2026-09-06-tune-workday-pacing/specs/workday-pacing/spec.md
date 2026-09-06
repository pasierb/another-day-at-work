## Purpose

Shape a complete workday into a deterministic, measurable dramatic arc that remains playable and recoverable while fitting the MVP's intended real-time session length.

## ADDED Requirements

### Requirement: Workday pacing follows configured time bands
The game SHALL define ordered, non-overlapping time bands covering the complete 09:00–17:00 workday, including morning, normal workload, lunch period, main chaos, and endgame, and SHALL derive the active band solely from authoritative game time.

#### Scenario: A full workday crosses every pacing band
- **WHEN** authoritative game time advances from 09:00 through 17:00
- **THEN** each configured band becomes active in chronological order with no uncovered or multiply assigned game-time interval

#### Scenario: Time jumps across a boundary
- **WHEN** an action advances authoritative game time across one or more pacing-band boundaries
- **THEN** subsequent pacing decisions use the band containing the resulting game time without replaying already completed band transitions

#### Scenario: The workday is paused
- **WHEN** real time passes while authoritative game time is paused
- **THEN** the active pacing band and all game-time-based pacing deadlines remain unchanged

### Requirement: Normal and developer profiles preserve one game model
The game SHALL provide a default normal profile calibrated toward a 10–20 minute real-time workday and a faster developer/test profile that changes time scale and explicitly profile-owned pacing values without changing game rules, content eligibility, or seeded determinism.

#### Scenario: A normal manual run reaches the end of day
- **WHEN** a player completes a representative uninterrupted 09:00–17:00 run using the normal profile
- **THEN** elapsed real play time falls within the 10–20 minute target range, excluding time spent in paused decisions or an inactive browser tab

#### Scenario: A developer run is accelerated
- **WHEN** a full day is run with the developer/test profile
- **THEN** it reaches 17:00 faster than the normal profile while preserving the same authoritative game-time ordering rules

#### Scenario: A profile and seed are replayed
- **WHEN** two simulations use the same profile, seed, content, player policy, and game-time inputs
- **THEN** they produce the same ordered pacing transitions and reported outcomes

### Requirement: Pacing guardrails bound pressure without guaranteeing success
The pacing configuration SHALL bound event floods, excessive periods without a meaningful player action, and balance states in which resource collapse is unavoidable, while retaining the possibility of poor outcomes from player decisions.

#### Scenario: Event pressure reaches its configured ceiling
- **WHEN** active and pending interruption pressure reaches the guardrail threshold
- **THEN** the game applies the configured deterministic relief behavior without displacing an active event or losing an already scheduled event

#### Scenario: The run has an excessive quiet period
- **WHEN** no interruption, task decision, need warning, recovery action, or coding objective has become newly meaningful for the configured maximum quiet duration
- **THEN** the next eligible pacing opportunity is advanced according to configured deterministic rules

#### Scenario: One resource becomes critical in normal mode
- **WHEN** a representative run reaches one critical recoverable resource state
- **THEN** at least one meaningful recovery action remains available before collapse unless the player's prior choices explicitly removed that opportunity

#### Scenario: The player repeatedly chooses harmful trade-offs
- **WHEN** player decisions continue to spend resources or defer urgent problems despite available alternatives
- **THEN** pacing guardrails do not prevent resource collapse or erase the consequences of those decisions

### Requirement: Seeded simulations report complete workday statistics
The game SHALL support presentation-independent seeded simulations that reach exactly 17:00 and report sufficient statistics to compare pacing bands, event pressure, resources, needs, tasks, recovery opportunities, and deterministic replay.

#### Scenario: A seeded simulation completes
- **WHEN** a valid profile, seed, and deterministic player policy are simulated
- **THEN** the simulation reaches 17:00 and reports per-band spawn and resolution counts, quiet and peak-pressure periods, resource and need extrema, critical/recovery states, task progress or completions, and final run state

#### Scenario: Morning and main chaos are compared
- **WHEN** default-profile statistics are aggregated across the documented fixed seed set
- **THEN** the morning has lower interruption pressure than 14:00–16:00 according to the documented spawn and active-pressure measures

#### Scenario: Invalid simulation input is supplied
- **WHEN** a simulation receives an unknown profile, invalid seed, invalid time step, or player policy that cannot produce a valid action
- **THEN** it fails with a descriptive validation error rather than returning partial balance statistics

### Requirement: Balance diagnostics are compact and debug-only
The game SHALL expose the active pacing band and compact run statistics through a debug overlay or run summary that is excluded or disabled by default in normal player presentation.

#### Scenario: Debug pacing visibility is enabled
- **WHEN** a developer runs the game with pacing diagnostics enabled
- **THEN** the current band, profile, seed, event pressure, quiet duration, and key resource or need statistics are readable without obscuring primary controls

#### Scenario: Normal presentation is used
- **WHEN** the game starts without an explicit debug setting
- **THEN** pacing diagnostics are not visible and do not accept player input

