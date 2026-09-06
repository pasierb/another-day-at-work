# Delayed Consequences and Technical Debt Specification

## Purpose

Make shortcuts create deterministic future costs by executing effects outside presentation code, scheduling consequences against game time, and allowing Technical Debt to modify explicitly selected risks.

## Requirements

### Requirement: Effect execution is independent from presentation
The game SHALL execute supported resource, Focus, selected-task progress, delayed, and probabilistic effects through a validated domain contract without requiring a Phaser scene, and SHALL preserve their declared order.

#### Scenario: A mixed effect list is executed
- **WHEN** a valid ordered list contains resource, Focus, selected-task progress, and consequence effects
- **THEN** each effect produces its declared domain result in list order without presentation-specific behavior

#### Scenario: A selected-task progress reduction is executed
- **WHEN** an effect reduces task progress while an incomplete task is selected
- **THEN** only the selected task loses the declared bounded progress and its completion and midpoint-trigger history remain intact

#### Scenario: No incomplete task is selected
- **WHEN** a selected-task progress effect executes after all tasks are complete
- **THEN** task history and progress remain unchanged

#### Scenario: An invalid effect is supplied
- **WHEN** content contains an unsupported effect type, non-finite value, invalid probability, or invalid delay
- **THEN** the content is rejected before the effect can execute or enter the consequence queue

### Requirement: Delayed consequences follow authoritative game time
The game SHALL queue delayed consequences using absolute elapsed-game-time deadlines and SHALL emit every due consequence exactly once in deadline and stable creation order.

#### Scenario: A consequence deadline is reached
- **WHEN** active game time reaches a queued consequence's deadline
- **THEN** its effects are emitted once and it is removed from the pending queue

#### Scenario: One update crosses several deadlines
- **WHEN** a game-time update or decision action advances beyond multiple queued deadlines
- **THEN** all crossed consequences are emitted once in deadline and stable creation order

#### Scenario: The run is paused
- **WHEN** scene updates continue without authoritative game time advancing
- **THEN** no queued consequence becomes due or executes

#### Scenario: Ordinary updates occur before a deadline
- **WHEN** any number of scene updates, decisions, or pauses occur before a queued deadline
- **THEN** the consequence remains queued with its original identity and deadline

### Requirement: Probabilistic consequences are reproducible and isolated
The game SHALL resolve probabilistic consequences from a supplied seed, SHALL produce repeatable results for identical inputs, and SHALL not consume the random sequence used to schedule interruptions.

#### Scenario: Identical consequence runs use the same seed
- **WHEN** two fresh consequence runs use the same seed, content, Technical Debt, and execution order
- **THEN** they produce the same ordered probability outcomes

#### Scenario: Consequence probability is evaluated
- **WHEN** resolving a probabilistic effect
- **THEN** exactly one declared success or failure branch is selected and no branch executes more than once

#### Scenario: Consequence draws are added to a run
- **WHEN** a run performs additional consequence probability draws without changing scheduler inputs
- **THEN** its seeded interruption spawn order and spawn times remain unchanged

### Requirement: Technical Debt modifies only declared future risks
The game SHALL allow content to declare bounded Technical Debt modifiers for selected consequence probabilities, event weights, severities, or resolution costs, and SHALL leave undeclared behavior unchanged.

#### Scenario: A declared debt modifier is evaluated
- **WHEN** current Technical Debt is above zero and content declares a debt modifier
- **THEN** the corresponding effective value changes according to the declared formula and remains within its valid bounds

#### Scenario: Technical Debt is zero
- **WHEN** content with a debt modifier is evaluated at zero Technical Debt
- **THEN** its effective value equals its configured base value

#### Scenario: Content has no debt modifier
- **WHEN** an effect, event, severity, or resolution cost does not declare a Technical Debt modifier
- **THEN** changing Technical Debt does not alter that value

### Requirement: Shortcut choices demonstrate present benefit and future cost
The representative production incident SHALL make a quick hotfix immediately improve System Stability and PO Happiness while increasing Technical Debt and scheduling or increasing a reproducible later risk, while its proper investigation choice SHALL cost more immediately and create no shortcut debt.

#### Scenario: A quick hotfix is chosen
- **WHEN** the player resolves the representative production incident with the hotfix choice
- **THEN** System Stability and PO Happiness improve immediately, Technical Debt increases, and a future risk is queued or evaluated from the consequence seed

#### Scenario: A proper investigation is chosen
- **WHEN** the player resolves the incident by investigating properly
- **THEN** the declared larger immediate time or Stamina cost is applied and no hotfix consequence or shortcut debt is created

### Requirement: Consequences provide concise lifecycle feedback
The game SHALL expose presentation-neutral feedback records when a consequence is scheduled and when it concludes, including enough information to distinguish its source and outcome.

#### Scenario: A delayed consequence is scheduled
- **WHEN** executing a choice adds a delayed consequence to the queue
- **THEN** one concise scheduled feedback record is emitted without revealing an uncertain outcome as certain

#### Scenario: A consequence concludes
- **WHEN** a queued or probabilistic consequence resolves
- **THEN** one concise concluded feedback record identifies the consequence and the outcome that occurred

### Requirement: Content consequences retain causal provenance
The game SHALL retain a stable presentation-independent record linking every schedulable consequence event to the prior resolved choice, concluded consequence, incident history, or current-state condition that enabled it.

#### Scenario: A prior choice enables a consequence event
- **WHEN** a delayed or immediate shortcut outcome makes a consequence definition eligible
- **THEN** its provenance identifies the source event and resolved choice

#### Scenario: A queued consequence concludes
- **WHEN** a concluded queue outcome enables a follow-on consequence event
- **THEN** its provenance identifies the concluded consequence and outcome

#### Scenario: A consequence is presented
- **WHEN** an eligible consequence event becomes active
- **THEN** debug and validation data can trace it to its cause without exposing hidden uncertain outcomes to the player
