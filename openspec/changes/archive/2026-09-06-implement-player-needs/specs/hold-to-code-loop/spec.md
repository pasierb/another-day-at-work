## MODIFIED Requirements

### Requirement: Focus rewards uninterrupted coding
The game SHALL expose bounded Focus as a coding-speed multiplier, SHALL increase it at a configured rate while coding, and SHALL decay it at a configured rate while coding is available but released. Authoritative external coding-speed and Focus-gain modifiers SHALL be applied to their respective rates without changing Focus bounds, and SHALL default to neutral behavior when no modifier is active.

#### Scenario: Coding is held continuously
- **WHEN** the player codes without releasing the control and no external modifier is active
- **THEN** Focus rises toward its configured maximum and increases the rate of subsequent task progress

#### Scenario: Coding is released
- **WHEN** the player releases all coding inputs before the task completes
- **THEN** Focus decays toward its base multiplier without changing task progress or draining coding-related Stamina

#### Scenario: Continuous holding is compared with tapping
- **WHEN** two equivalent sessions spend the same total time actively coding but one repeatedly releases long enough for Focus to decay
- **THEN** the uninterrupted session has made more task progress

#### Scenario: Focus reaches either bound
- **WHEN** continued growth or decay would move Focus beyond its configured range
- **THEN** Focus remains at the corresponding bound and its multiplier remains valid

#### Scenario: Personal needs slow coding
- **WHEN** an authoritative personal-need modifier below one is active during coding
- **THEN** task progress or Focus gain is reduced according to the relevant modifier while existing Focus and progress bounds remain intact

#### Scenario: Personal need penalty is removed
- **WHEN** all external modifiers return to their neutral value
- **THEN** subsequent coding uses the configured base rates without requiring a new coding session
