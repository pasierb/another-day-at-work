## Context

`DayState` owns authoritative elapsed game time, pause state, bounded resources, and explicit action-time jumps. `CodingSession` independently owns task progress and Focus, while `Workstation` orchestrates both models and currently renders disabled quick-action placeholders. Interruption decisions and delayed consequences can jump game time, so needs cannot rely only on Phaser frame deltas.

See `proposal.md` for motivation and the player-needs and hold-to-code-loop delta specs for behavioral requirements.

## Goals / Non-Goals

**Goals:**

- Keep need progression and threshold behavior deterministic and testable without constructing a Phaser scene.
- Account consistently for continuous clock advancement and discrete action-time jumps.
- Introduce a reusable runtime-modifier seam in coding without making coding depend on needs.
- Make critical states noticeable and funny while allowing the player to recover.

**Non-Goals:**

- Random mistakes, accidental choice selection, or a general status-effect framework.
- Hunger, posture, water, lunch, breaks, or booster behavior.
- Full personal-event content, scheduling weights, or end-of-day need scoring.
- Final visual polish, animation, or audio.

## Decisions

### Add an absolute-time PlayerNeeds domain model

Create a presentation-independent model containing bounded values, stage definitions, current penalties, processed transition state, and observers. Its synchronization command accepts authoritative elapsed game milliseconds and processes only the positive difference from its last synchronized time. Reset restores the configured initial values and time origin.

Absolute time makes ordinary frames and `spendGameMinutes` jumps share one path and makes duplicate synchronization harmless. A delta-only update API was rejected because every action-time caller would need to calculate and forward an exact delta, increasing the chance of missed or double-counted time.

The default balance starts both values at zero and uses these stage bands:

| Need | 0–24 | 25–49 | 50–74 | 75–94 | 95–100 |
|---|---|---|---|---|---|
| Sleepiness | Slightly tired | Getting sleepy | Struggling to focus | Microsleep | Fell asleep |
| Toilet Need | Could probably wait | Noticeable | Becoming a priority | Urgent | Biological SEV-1 |

Rates, thresholds, action duration, relief, modifiers, and consequences remain configuration data so Chunk 13 can balance them without rewriting control flow. Defaults should make both needs traverse readable stages during an accelerated full-day test, while ordinary bathroom use prevents Toilet Need from inevitably reaching critical.

### Integrate effects over threshold segments

When synchronization spans a threshold, split the elapsed interval at each boundary and integrate the penalty associated with each segment. Return an immutable synchronization result containing additional Stamina cost and ordered stage-transition records. This avoids applying the final stage's drain retroactively across a large decision-time jump.

Transition records identify the need, previous and next stage, warning copy, and an optional one-shot critical effect descriptor. The scene applies resource, Focus, or time effects through existing domain commands and presents feedback. PlayerNeeds records the critical episode before returning it, preventing re-entrant scene synchronization from emitting it again.

An alternative was to encode needs as scheduled interruption definitions. That would make passive values, penalties, relief, and critical re-arming awkward and would conflate a continuous personal state with event content that Chunk 12 owns.

### Expose neutral-by-default coding modifiers

Extend the coding model with a validated runtime modifier snapshot containing `codingSpeed` and `focusGain` multipliers. Both default to `1`, accept finite values within configured bounds, and affect only future updates. Need contributions combine multiplicatively and clamp to a documented non-negative minimum before synchronization into coding.

Multiplication preserves the relative weight of simultaneous pressures and keeps `CodingSession` unaware of their sources. Directly changing immutable coding configuration or having PlayerNeeds mutate task progress was rejected because either would obscure reset behavior and couple unrelated models.

Focus decay remains unchanged: the needs specifically reduce productive concentration gain, while explicit stage transitions and bathroom use can reduce current Focus through the existing command.

### Make critical consequences deterministic and recoverable

The first critical Sleepiness episode applies a large Focus reduction and a short involuntary time loss with feedback such as falling asleep during an implausibly brief stand-up. The first critical Toilet episode applies a Focus reduction and extra Stamina cost with `BIOLOGICAL SEV-1` feedback. Neither ends the run, selects a choice for the player, or repeats until that need first falls below critical and later re-enters it.

Seeded random mistakes were rejected for this chunk because they require a broader accidental-action contract and belong with the gated personal and consequence events in Chunk 12.

### Orchestrate clock changes through one scene synchronization path

After every continuous clock advance or explicit `spendGameMinutes` call, Workstation synchronizes needs, applies returned costs/transitions, updates coding modifiers, then synchronizes interruption scheduling and delayed consequences to the same final clock. Re-entrant critical time jumps repeat the orchestration loop with a defensive iteration limit, matching the existing interruption-transition pattern.

For a bathroom visit, Workstation first cancels held input and applies the configured Focus interruption, then spends the action duration and fully synchronizes elapsed effects, and finally relieves Toilet Need. This preserves Sleepiness gained during the visit and makes the time cost real while ensuring the trip ends relieved.

### Add compact indicators and one enabled quick action

Add concise Sleepiness and Toilet Need stage indicators near the existing Stamina presentation without restructuring the six-region shell. Replace one disabled quick-action placeholder with an enabled `TOILET` control and retain the existing visual primitive style. Threshold warnings use a small transient feedback surface associated with needs; they do not consume the scheduler's active-event capacity or open a choice modal.

The Toilet action is available only while the workday is active and no decision modal owns the pause. Input handlers use the same release/cancellation safeguards as Hold to Code, and activation is guarded so one pointer action produces one visit.

## Risks / Trade-offs

- [Large time jumps could cross several stages and trigger nested time effects] → Process ordered transition segments, mark episodes before emitting effects, and enforce a defensive synchronization limit.
- [Multiplicative penalties may make coding feel excessively slow] → Clamp combined modifiers and keep all values in centralized configuration for Chunk 13 balancing.
- [Need warnings may compete visually with interruption feedback] → Use compact transient feedback and avoid consuming alert capacity or opening modals.
- [The current quick-action primitives are disabled-only] → Introduce the smallest reusable interactive action primitive while preserving established pointer and touch safeguards.
- [Uncommitted work from earlier chunks overlaps Workstation and DayState] → Limit changes to additive integration points and preserve existing behavior while applying the change.

## Migration Plan

1. Add the needs model and tests without scene integration.
2. Add neutral coding modifiers and prove existing coding behavior remains unchanged.
3. Integrate clock synchronization, effects, UI indicators, and the Toilet action.
4. Run unit tests, production build, and a focused browser playtest covering progression, pause, time jumps, relief, and one-shot critical behavior.

Rollback consists of removing the scene integration and new model; neutral modifier defaults preserve the pre-change coding behavior throughout staged development.
