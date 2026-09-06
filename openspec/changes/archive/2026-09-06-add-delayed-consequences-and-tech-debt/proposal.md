## Why

Interruption choices currently apply only immediate scene-owned effects, so shortcuts cannot create the delayed, reproducible trouble that makes Technical Debt meaningful. This change introduces the domain behavior needed for present-day trade-offs to influence later events without pulling in the full event catalog.

## What Changes

- Add a presentation-independent effect executor for immediate resource and Focus effects.
- Add a game-time consequence queue for delayed effects that fire exactly once across ordinary updates, pauses, and decision-driven time jumps.
- Add seeded probabilistic consequences whose outcomes are repeatable and isolated from event-spawn randomness.
- Let Technical Debt increase selected future event weights, consequence risk, severity, or resolution costs through explicit bounded content modifiers.
- Expand the representative production incident with Hotfix, Investigate Properly, Rollback, and Ignore outcomes that demonstrate immediate versus future costs.
- Surface concise feedback when consequences are scheduled and concluded.

## Capabilities

### New Capabilities

- `delayed-consequences-and-tech-debt`: Defines presentation-independent effect execution, deterministic delayed/probabilistic consequences, Technical Debt risk modifiers, and consequence feedback.

### Modified Capabilities

- `interruption-decisions`: Extends content-defined choices beyond immediate effects and adds the representative production resolution patterns.
- `event-scheduling-and-escalation`: Allows selected event scheduling characteristics to be modified by current Technical Debt while preserving seeded determinism.

## Impact

- Affects interruption content and validation, choice and escalation effect handling, event scheduling, workday integration, and workstation feedback.
- Introduces new domain modules for effect execution, consequence scheduling, and an independently seeded consequence random stream.
- Adds unit coverage for effect ordering, probability, deadlines, debt modifiers, and exactly-once behavior, plus focused browser playtesting.
- Adds no persistence, external service, or new runtime dependency.
