## Why

The workday now reaches 17:00 with complete pacing and run statistics, but it simply stops without explaining what the player accomplished or providing a replay loop. Chunk 14 turns that terminal state into a deterministic, humorous payoff before later presentation and hardening work.

## What Changes

- Detect the first transition to 17:00, stop all gameplay processing, and capture one immutable terminal snapshot of the run.
- Calculate a transparent score breakdown from completed features, final resources, Technical Debt, coworker interactions, resolved incidents, needs, and booster consumption.
- Select one of seven deterministic endings, including the GDD examples Staff Engineer, 10x Engineer, Incident Commander, Promoted to Management, The Transcendent, Biological Incident, and Unicorn Day, using documented priorities and tie-breaking.
- Treat zero Stamina, PO Happiness, or System Stability as recoverable pressure during the day and as catastrophic result evidence at 17:00 rather than introducing an early hard game-over.
- Present an end-of-day results screen with the ending title, short narrative, score breakdown, and a restart action that creates a genuinely fresh run.
- Add domain tests for scoring, ending selection, terminal immutability, and reset isolation, plus browser verification of the results and replay flow.
- Do not add online scores, achievements, persistent history, presentation/audio polish, new mechanics or content, difficulty modes, deployment work, or post-MVP progression.

## Capabilities

### New Capabilities

- `end-of-day-results`: Defines terminal run capture, score calculation, deterministic humorous endings, results presentation, catastrophe treatment, and fresh-run replay behavior.

### Modified Capabilities

None.

## Impact

- Adds presentation-independent result/scoring contracts around the existing `WorkdaySession`, task, interruption, need, booster, and pacing snapshots.
- Changes `Workstation` orchestration at the existing 17:00 boundary and adds a results presentation boundary or scene plus restart wiring.
- Extends run-scoped metrics where the current implementation does not yet retain enough typed evidence for coworker interactions and incident outcomes.
- Adds focused unit and browser tests without adding a runtime dependency, network API, or persisted data format.
