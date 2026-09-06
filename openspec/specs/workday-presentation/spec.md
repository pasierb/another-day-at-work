# Workday Presentation Specification

## Purpose

Provide a coherent, readable audiovisual presentation that makes workstation state, interactability, and escalating workday pressure immediately understandable without changing game mechanics.

## Requirements

### Requirement: Presentation uses a consistent and accessible visual language
The game SHALL use a consistent palette, typography hierarchy, cards, meters, badges, and interaction states across the workstation, decisions, and results, and SHALL communicate severity and interactability with shape, text, iconography, border, or motion cues in addition to color.

#### Scenario: Player distinguishes alert severity
- **WHEN** alerts of different severity are visible
- **THEN** the player can distinguish their urgency without relying only on hue

#### Scenario: Player scans interactive states
- **WHEN** enabled, hovered or pressed, selected, and disabled controls are shown
- **THEN** each state is visually distinct and disabled controls do not imply successful interaction

#### Scenario: Results are presented after the workday
- **WHEN** the results view opens
- **THEN** its ending, explanation, score hierarchy, and restart action use the same presentation language as the workstation

### Requirement: Workstation environment reflects escalating pressure
The workstation SHALL derive a deterministic visual-stress stage from game time, active-alert pressure, and Technical Debt, and SHALL use that stage to increase desk clutter and restrained environmental emphasis without changing domain state.

#### Scenario: Calm run begins
- **WHEN** a run is early, has few active alerts, and has low Technical Debt
- **THEN** the desk appears comparatively clean and calm

#### Scenario: Pressure increases
- **WHEN** time, active-alert pressure, or Technical Debt crosses a documented presentation threshold
- **THEN** the corresponding stress stage adds or emphasizes visual details without hiding controls, labels, meters, decisions, or alerts

#### Scenario: Equivalent state is rendered again
- **WHEN** the same presentation inputs are supplied after a redraw or seeded replay
- **THEN** the same stress stage and environmental composition are produced without random gameplay effects

### Requirement: Core actions provide restrained audio feedback
The game SHALL provide distinct, restrained sound cues for coding, messages, incidents, resolved choices, booster use, and critical needs, and SHALL bound concurrent playback and output level so increasing activity remains intelligible and comfortable.

#### Scenario: Core action occurs after audio is available
- **WHEN** a coding, message, incident, choice, booster, or critical-need event occurs after audio has been unlocked
- **THEN** the matching cue plays without changing the action's mechanics or delaying its result

#### Scenario: Alerts arrive close together
- **WHEN** multiple eligible sound triggers occur within the configured overlap window
- **THEN** priority, cooldown, voice-limit, and output-level rules prevent painfully loud or unbounded playback while preserving urgent feedback

#### Scenario: Coding starts and stops
- **WHEN** coding begins, ends, is cancelled, becomes unavailable, or the scene shuts down
- **THEN** its continuous or repeated typing feedback follows the coding state and does not remain playing afterward

### Requirement: Browser audio activation is respected
The game SHALL keep audio silent until a qualifying user interaction permits playback and SHALL recover gracefully when browser audio activation is unavailable or delayed.

#### Scenario: Game loads before user interaction
- **WHEN** the workstation appears before any qualifying user gesture
- **THEN** no sound is forced and gameplay remains fully usable

#### Scenario: First qualifying interaction occurs
- **WHEN** the player first uses a qualifying pointer, touch, or keyboard action and master mute is off
- **THEN** audio is unlocked for subsequent cues without replaying a backlog of missed sounds

#### Scenario: Audio cannot be unlocked
- **WHEN** the browser rejects or delays audio activation
- **THEN** the game continues without an error, blocked control, or repeated activation storm

### Requirement: Master mute is immediate and persistent
The game SHALL expose a clearly labeled master mute control on player-visible game screens, apply changes immediately to all active and future game audio, and persist the preference locally across reloads and fresh runs.

#### Scenario: Player mutes active audio
- **WHEN** the player activates master mute while a sound is playing
- **THEN** active game audio becomes inaudible immediately and subsequent cues remain silent

#### Scenario: Player unmutes
- **WHEN** the player disables master mute after audio is unlocked
- **THEN** subsequent eligible cues can play without replaying cues suppressed while muted

#### Scenario: Muted game is reloaded
- **WHEN** a stored muted preference exists and the game is loaded or restarted
- **THEN** the mute control and audio output begin in the muted state

#### Scenario: Local preference storage is unavailable
- **WHEN** reading or writing the mute preference fails
- **THEN** the current session's mute control remains usable and gameplay continues without an error

### Requirement: Presentation remains readable at supported viewports
The polished workstation, first-run instruction overlay, decision layer, and results presentation SHALL preserve the fixed logical composition and remain readable and operable at the project's minimum supported touch-sized viewport.

#### Scenario: Minimum supported viewport is used
- **WHEN** the workstation, first-run guidance, decision layer, or results view is displayed at the minimum supported viewport
- **THEN** the objective or result, essential status, severity, enabled controls, decision choices, and mute state remain readable, reachable, and non-overlapping

#### Scenario: First-run guidance is shown
- **WHEN** the instruction overlay appears over the workstation at any supported viewport
- **THEN** it identifies the objective, Hold to Code control, urgent alerts, and resources without hiding its dismissal control or implying that covered gameplay controls are active

#### Scenario: Visual stress reaches its maximum stage
- **WHEN** maximum presentation clutter is rendered at the minimum supported viewport
- **THEN** decorative elements remain behind or outside essential controls and status information

#### Scenario: Viewport changes with an overlay open
- **WHEN** the viewport is resized or changes orientation while first-run guidance or a decision is open
- **THEN** the overlay remains fully readable and its actionable controls remain aligned with pointer and touch input
