# MVP Boosters Specification

## Purpose

Provide two guarded, data-driven recovery actions whose distinct costs create meaningful short-term Stamina decisions and reusable state for later consequences and scoring.

## Requirements

### Requirement: Coffee restores Stamina and records consumption
Activating an available Coffee booster SHALL increase Stamina by its configured amount, clamp Stamina to its existing bounds, increment Coffee consumption exactly once, and present feedback corresponding to the resulting Coffee count.

#### Scenario: First Coffee is consumed
- **WHEN** the player activates Coffee while it is available and Stamina is below its maximum
- **THEN** Stamina increases by the configured Coffee amount, the Coffee count becomes one, and the first Coffee feedback is presented

#### Scenario: Repeated Coffee escalates feedback
- **WHEN** the player consumes successive available Coffees
- **THEN** each activation increments the count once and presents the configured feedback for that count or the configured repeat fallback

#### Scenario: Coffee recovery reaches the resource bound
- **WHEN** Coffee would increase Stamina above its maximum
- **THEN** Stamina stops at its maximum while the activation and consumption count are recorded once

### Requirement: Coffee consumption raises deterministic crash risk
The booster state SHALL expose a bounded Coffee Crash probability derived from the Coffee consumption count and SHALL evaluate that probability reproducibly when supplied the same seed and activation history. This change SHALL NOT independently schedule or present a Coffee Crash event.

#### Scenario: Repeated Coffee increases crash probability
- **WHEN** the Coffee consumption count increases from one valid activation to the next
- **THEN** the exposed Coffee Crash probability increases monotonically without exceeding its configured maximum

#### Scenario: Seeded crash evaluation is reproducible
- **WHEN** two fresh runs evaluate Coffee Crash opportunities with the same seed and identical Coffee consumption history
- **THEN** they produce the same sequence of outcomes

#### Scenario: Booster reset clears Coffee risk
- **WHEN** booster state is reset for a fresh workday
- **THEN** Coffee consumption returns to zero, Coffee Crash probability returns to its configured initial value, and seeded evaluation restarts deterministically

### Requirement: Coke Zero restores less Stamina and increases Toilet Need
Activating an available Coke Zero booster SHALL increase Stamina by its configured amount, increase Toilet Need by its configured amount, clamp both values to their existing bounds, and increment Coke Zero consumption exactly once. The default Coke Zero Stamina restoration SHALL be lower than the default Coffee restoration.

#### Scenario: Coke Zero is consumed
- **WHEN** the player activates Coke Zero while it is available and Stamina is below its maximum
- **THEN** Stamina and Toilet Need increase by their configured amounts and the Coke Zero count increments once

#### Scenario: Coke Zero effects reach resource bounds
- **WHEN** a Coke Zero activation would exceed the maximum Stamina or Toilet Need value
- **THEN** each affected value stops at its existing maximum and neither value escapes its bounds

### Requirement: Booster activation is guarded and game-time based
Each booster SHALL enforce its independently configured game-time cooldown and SHALL be unavailable while its cooldown is active, while Stamina is full, while a decision is open, or after the workday is complete. Cooldowns SHALL advance only with authoritative workday time and SHALL remain unchanged while the workday is paused.

#### Scenario: Duplicate activation is prevented
- **WHEN** multiple input signals attempt to activate one booster before its first activation completes
- **THEN** its effects and consumption increment occur exactly once

#### Scenario: Booster enters and leaves cooldown
- **WHEN** a booster is consumed
- **THEN** that booster remains unavailable until its configured amount of advancing game time has elapsed

#### Scenario: Pause freezes booster cooldown
- **WHEN** the workday is paused while a booster cooldown is active
- **THEN** wall-clock updates do not reduce the remaining cooldown

#### Scenario: Booster is unavailable at full Stamina
- **WHEN** Stamina is at its maximum
- **THEN** Coffee and Coke Zero are unavailable and activation has no gameplay effect

#### Scenario: Player actions are blocked
- **WHEN** a decision is open or the workday is complete
- **THEN** activating either booster has no gameplay effect

### Requirement: Workstation communicates booster state
The workstation SHALL present Coffee and Coke Zero as distinct quick actions and SHALL show whether each action is available or why it cannot currently be used. The controls SHALL remain readable and non-overlapping at supported desktop and touch-sized viewports.

#### Scenario: Available booster is presented
- **WHEN** a booster can be consumed
- **THEN** its quick action is visibly enabled and identifies its configured Stamina recovery

#### Scenario: Unavailable booster is explained
- **WHEN** a booster cannot be consumed
- **THEN** its quick action is visibly disabled and identifies the relevant full-Stamina, cooldown, decision, or completed-day reason

#### Scenario: Touch activation completes once
- **WHEN** a touch pointer activates an available booster and subsequently ends or is cancelled
- **THEN** the action applies once and cannot remain armed or trigger an additional consumption
