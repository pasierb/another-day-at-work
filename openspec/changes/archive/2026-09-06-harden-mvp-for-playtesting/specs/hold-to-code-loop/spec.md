## MODIFIED Requirements

### Requirement: Interrupted input cannot leave coding active
The game SHALL clear all held-input state when pointer interaction is cancelled or leaves the game, keyboard state is cancelled, the browser loses focus, the page becomes hidden, the viewport changes, gameplay enters results or restart, or the scene shuts down.

#### Scenario: Pointer hold is cancelled
- **WHEN** an active pointer hold is cancelled or terminates outside the coding control
- **THEN** that pointer no longer keeps coding active

#### Scenario: Browser focus is lost
- **WHEN** the browser loses focus while a coding input is held
- **THEN** all held coding inputs are cleared and coding stops

#### Scenario: Page becomes hidden
- **WHEN** the document becomes hidden while a coding input is held
- **THEN** all held coding inputs are cleared and coding remains stopped after visibility returns until a fresh coding press

#### Scenario: Viewport changes during a hold
- **WHEN** the rendered game viewport changes size or orientation while a coding input is held
- **THEN** all held coding inputs are cleared and the remapped control requires a fresh press

#### Scenario: Gameplay terminates or restarts
- **WHEN** the workday enters results, a fresh run is requested, or the workstation scene shuts down while coding input is held
- **THEN** the prior run cannot produce later coding work and no held source is inherited by the next scene or run

#### Scenario: Coding becomes unavailable while held
- **WHEN** a held coding input remains physically down as coding becomes unavailable and later available again
- **THEN** coding does not restart until the player performs a new coding press
