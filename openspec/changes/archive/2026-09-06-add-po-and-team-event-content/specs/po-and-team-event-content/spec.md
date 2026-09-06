## Purpose

Provide a varied, validated, and contextually coherent catalog of Product Owner and team interruptions that turns stakeholder and coworker pressure into repeatable workday decisions.

## ADDED Requirements

### Requirement: The catalog supplies the MVP Product Owner and team event pack
The game SHALL provide six Product Owner events and five Slack/team events, counting expanded representative events from earlier chunks, and every definition SHALL be reachable under at least one valid run context.

#### Scenario: The complete pack is loaded
- **WHEN** the MVP interruption catalog is validated
- **THEN** it contains six Product Owner definitions and five teammate definitions without counting production, tooling, personal, or consequence-pack events

#### Scenario: Event topics are audited
- **WHEN** the Product Owner and team definitions are inspected
- **THEN** the pack collectively covers status requests, tiny scope changes, estimates, junior help, QA findings, and review requests

#### Scenario: Reachability is audited
- **WHEN** each definition is evaluated across its documented eligible run contexts
- **THEN** every definition is eligible in at least one context and no definition is permanently unreachable

### Requirement: Pack decisions expose distinct trade-offs
Every Product Owner and team event SHALL define at least two choices with accurate previews and distinct combinations of game-time, resource, Focus, selected-task-progress, or Technical Debt effects.

#### Scenario: An event decision is opened
- **WHEN** the player inspects the choices for any active Product Owner or team event
- **THEN** each choice describes its certain immediate cost and benefit and does not present uncertain or delayed behavior as guaranteed

#### Scenario: Different choices resolve
- **WHEN** two fresh equivalent runs resolve the same event with different choices
- **THEN** the runs receive the distinct declared trade-offs for those choices exactly once

### Requirement: Pack events escalate with content-defined outcomes
Every Product Owner and team event SHALL provide escalation copy and effects appropriate to being postponed or ignored, and at least one teammate event SHALL escalate into a traceable public-channel follow-up.

#### Scenario: A teammate request is ignored
- **WHEN** the configured teammate request reaches its public-channel escalation stage
- **THEN** the alert identifies the public escalation and its declared consequence or follow-up occurs exactly once

#### Scenario: A handled request has not escalated
- **WHEN** a Product Owner or team event resolves before its next escalation deadline
- **THEN** its unentered escalation copy, effects, and follow-ups do not occur

### Requirement: The content catalog fails validation before play
The game SHALL reject a Product Owner or team catalog containing duplicate or missing identities, fewer than two choices, invalid effects, invalid escalation timing or references, malformed eligibility, or a declared event that is unreachable in all documented contexts.

#### Scenario: A malformed fixture is loaded
- **WHEN** validation receives a fixture with a missing choice, invalid effect, broken escalation reference, or invalid eligibility predicate
- **THEN** validation reports failure before any event can be scheduled or activated

#### Scenario: The production catalog is loaded
- **WHEN** validation receives the complete Product Owner and team pack
- **THEN** validation succeeds and preserves the definitions as presentation-independent content data

### Requirement: Low PO Happiness creates bounded stakeholder pressure
Eligible Product Owner events SHALL support a declared bounded weight increase as PO Happiness falls, and that modifier SHALL neither alter teammate weights nor make Product Owner events inevitable.

#### Scenario: PO Happiness falls
- **WHEN** otherwise identical event selections occur at a lower PO Happiness value
- **THEN** only eligible Product Owner definitions with a declared modifier receive their bounded configured weight increase

#### Scenario: Stakeholder pressure is at its maximum
- **WHEN** PO Happiness is at or below the modifier's configured lower bound
- **THEN** the effective Product Owner weight remains capped and at least one eligible non-Product-Owner event retains a non-zero chance of selection

#### Scenario: PO Happiness changes after scheduling
- **WHEN** PO Happiness changes after an event has been selected or queued
- **THEN** that event retains its identity, deadline, and queue order
