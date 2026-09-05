# Another Day at Work — Implementation Chunks

This roadmap turns the MVP in [game-design-doc.md](game-design-doc.md) and the target composition in [gameplay-visualisation.png](gameplay-visualisation.png) into small, ordered OpenSpec changes. Each chunk is intended to be designed, implemented, and verified in one focused agent run.

## How to use this roadmap

- Create one OpenSpec change per chunk, using the change name shown below.
- Implement chunks in order unless a chunk explicitly says it can run in parallel.
- Treat each chunk's acceptance checks as the minimum done condition for its OpenSpec spec and tasks.
- Keep balance values and event content data-driven so later chunks do not require rewriting the game loop.
- Use simple Phaser shapes and text until the visual-polish chunk. The reference image is a layout and mood target, not a requirement to reproduce every illustrated detail in early changes.
- A chunk must leave `npm run build` passing and must not depend on work assigned to a later chunk.

## MVP boundary

The roadmap covers the GDD's first playable prototype: one 09:00–17:00 workday, four resources, Hold to Code, interruptions with choices and escalation, sleep and toilet needs, coffee and Coke Zero, 25–30 events, and several end-of-day outcomes.

The following are deferred beyond this roadmap: multiple difficulty modes, hunger, water, inventory beyond the two MVP boosters, persistent progression, procedural task generation, localization, and production deployment.

## Dependency map

```text
01 foundation and shell
  -> 02 day state and HUD
      -> 03 hold-to-code loop
          -> 04 interruption vertical slice
              -> 05 scheduling and escalation
                  -> 06 consequence engine and tech debt
                      -> 07 personal needs
                      -> 08 boosters
                      -> 09 task queue
                          -> 10 PO and team events
                          -> 11 production and tooling events
                          -> 12 personal and consequence events
                              -> 13 day pacing and balance
                                  -> 14 end-of-day results
                                      -> 15 presentation and audio
                                          -> 16 MVP hardening
```

## Chunk 01 — Runtime foundation and workstation shell

**OpenSpec change:** `build-workstation-shell`

**Outcome:** Replace the Phaser starter screen with a maintainable game scene and a static, readable workstation layout inspired by the reference image.

**In scope:**

- Define a logical game resolution and scaling behavior for desktop and touch-sized browser windows.
- Establish folders for scenes, domain state, UI components, content data, and shared constants.
- Replace template branding and click-through behavior with the game title and main workstation scene.
- Build static regions for top resources, left task queue, center laptop, right alerts, bottom actions, and day clock.
- Use placeholders or existing assets; no final illustration work.

**Acceptance checks:**

- The app boots directly into a recognizable workstation screen without Phaser template content.
- All six regions remain visible and non-overlapping at the project's supported aspect ratio.
- Resizing preserves the playable composition without stretching input coordinates.
- A production build completes successfully.

**Not in scope:** Live meters, coding progress, event behavior, or polished artwork.

## Chunk 02 — Day state, clock, and resource HUD

**OpenSpec change:** `add-day-state-and-resource-hud`

**Depends on:** Chunk 01

**Outcome:** Introduce the authoritative run state and make time, Stamina, PO Happiness, System Stability, and Tech Debt visible.

**In scope:**

- Model a fresh workday with clamped resource values and a 09:00 start.
- Advance an accelerated game clock toward 17:00, with a single configurable time scale.
- Render labeled meters and day progress in the top HUD; render Tech Debt separately as in the reference.
- Provide typed state mutation methods and change notifications for UI updates.
- Add pause/resume support for later modal decisions and deterministic reset for testing.

**Acceptance checks:**

- Time advances from 09:00 and stops while paused.
- Resource mutations immediately update the correct meter and cannot exceed their bounds.
- Restarting a run restores all documented initial values.
- State logic can be tested without constructing the full Phaser scene.

**Not in scope:** Failure states, resource drain, or end-of-day scoring.

## Chunk 03 — Hold-to-Code core loop

**OpenSpec change:** `implement-hold-to-code-loop`

**Depends on:** Chunk 02

**Outcome:** Deliver the game's primary tactile loop: holding the laptop control advances work while consuming energy and building Focus.

**In scope:**

- Add a current task with name, effort, progress, and completion state.
- Support pointer hold/release, pointer cancellation, and an optional keyboard equivalent.
- Increase task progress and Focus continuously while held; drain Stamina at configurable rates.
- Apply Focus as a bounded coding-speed multiplier.
- Stop progress when released, paused, stamina is exhausted, or the task completes.
- Show coding progress, Focus multiplier, and clear pressed/disabled feedback.

**Acceptance checks:**

- Holding continuously is measurably faster than repeated short holds because Focus grows.
- Releasing the input stops progress immediately and applies the specified Focus behavior.
- One task can reach 100% exactly once without resource values escaping their bounds.
- Mouse, touch/pointer cancellation, and keyboard input cannot leave coding stuck on.

**Not in scope:** Multiple tasks or interruptions.

## Chunk 04 — Interruption decision vertical slice

**OpenSpec change:** `add-interruption-decision-slice`

**Depends on:** Chunk 03

**Outcome:** Prove the full CODE → INTERRUPTION → DECISION → CONSEQUENCE → CODE loop with a small representative event set.

**In scope:**

- Define typed interruption, choice, and immediate-effect data.
- Show active interruptions in the alerts area with category, severity, age, and concise copy.
- Open a decision card/modal and pause coding while a decision is being made.
- Resolve choices into immediate time/resource changes and remove the event.
- Reduce/reset Focus when an interruption is handled.
- Include three handcrafted events: one PO request, one production issue, and one teammate request.

**Acceptance checks:**

- Each sample event appears, can be opened, presents at least two trade-off choices, and resolves once.
- Effects match the choice description and are reflected in the HUD.
- Coding cannot continue behind an open decision, and can resume afterward.
- Event definitions are content data rather than conditionals embedded in UI code.

**Not in scope:** Random spawning, escalation, delayed consequences, or the full content library.

## Chunk 05 — Event scheduler and escalation

**OpenSpec change:** `implement-event-scheduling-and-escalation`

**Depends on:** Chunk 04

**Outcome:** Make ignored problems age, escalate, and compete for the player's attention.

**In scope:**

- Add a seeded event scheduler with configurable spawn intervals and active-event limits.
- Track event age against game time, not wall-clock time.
- Model escalation stages with changed copy, severity, effects, and optional follow-up events.
- Support explicit postpone/ignore behavior without requiring a modal for every tick.
- Prioritize urgent alerts visually and prevent duplicate resolution.
- Pause scheduler and escalation when the run or decision layer is paused.

**Acceptance checks:**

- A known seed produces a repeatable event sequence.
- An ignored sample event advances through all configured stages at the expected times.
- Handling an event cancels its future escalation.
- The active-event limit behaves predictably when the queue is full.

**Not in scope:** Final spawn rates or 25–30 events.

## Chunk 06 — Consequence engine and Technical Debt

**OpenSpec change:** `add-delayed-consequences-and-tech-debt`

**Depends on:** Chunk 05

**Outcome:** Make shortcuts create future problems and make Technical Debt mechanically meaningful.

**In scope:**

- Extend choice effects to support delayed and probabilistic consequences using seeded randomness.
- Add a consequence queue driven by game time.
- Let Technical Debt modify selected future event weights, severity, or resolution costs.
- Implement representative Hotfix, Investigate Properly, Rollback, and Ignore outcomes.
- Surface scheduled/concluded consequences through brief, readable feedback.
- Keep effect execution independent from presentation.

**Acceptance checks:**

- A quick hotfix immediately helps Stability/PO Happiness and schedules or increases later risk.
- A proper fix costs more now but creates no shortcut debt.
- Seeded probability is reproducible in tests.
- Delayed effects fire once, at the correct game time, and survive ordinary scene updates.

**Not in scope:** Persistent debt between runs.

## Chunk 07 — Sleepiness and toilet needs

**OpenSpec change:** `implement-player-needs`

**Depends on:** Chunk 06

**Outcome:** Add the two MVP personal pressures and meaningful reasons to stop coding.

**In scope:**

- Model sleepiness and toilet need with named thresholds/stages.
- Increase needs over game time and from relevant actions.
- Apply documented high-stage penalties to stamina, Focus, or coding speed.
- Generate personal warnings/interruptions at important thresholds.
- Add a bathroom action that consumes game time and relieves toilet need.
- Define recoverable critical-state behavior consistent with the GDD's preference for funny consequences.

**Acceptance checks:**

- Both needs progress through readable stages during an accelerated test run.
- Penalties start and stop at their documented thresholds.
- A bathroom trip advances time, interrupts Focus, and lowers toilet need.
- Critical needs cannot repeatedly trigger the same consequence every frame.

**Not in scope:** Hunger, posture, or other optional needs.

## Chunk 08 — Coffee and Coke Zero boosters

**OpenSpec change:** `add-mvp-boosters`

**Depends on:** Chunks 06 and 07

**Outcome:** Add two quick recovery actions with distinct trade-offs.

**In scope:**

- Add usable Coffee and Coke Zero actions to the bottom action bar.
- Coffee restores more Stamina and increases future Coffee Crash risk with repeated use.
- Coke Zero restores less Stamina with a smaller downside and increased toilet need.
- Track consumption counts for feedback and end-of-day scoring.
- Add cooldown, availability, or other safeguards against accidental multi-triggering.
- Include humorous escalating coffee feedback from the GDD's tone.

**Acceptance checks:**

- Each booster applies its exact visible effects once per activation.
- Repeated coffee use demonstrably raises seeded crash probability.
- Coke Zero affects toilet need and never pushes a meter beyond its bounds.
- Actions are disabled or explained when they cannot be used.

**Not in scope:** Water, lunch, headphones, rubber duck, feature flags, or restart items.

## Chunk 09 — Task queue, completion, and task trade-offs

**OpenSpec change:** `implement-engineering-task-queue`

**Depends on:** Chunks 03 and 06

**Outcome:** Turn coding into a sequence of engineering tasks with rewards, risks, and meaningful selection.

**In scope:**

- Define data-driven tasks with title, effort, reward, risk, and optional debt.
- Populate the left panel with a small queue and a selected current task.
- Apply completion rewards once, record completed work, and select the next task.
- Add one mid-progress mini-decision to validate task-specific events.
- Support task priority/severity labels without implementing a full Jira simulation.

**Acceptance checks:**

- The player can choose a task, code it to completion, receive rewards, and continue to another.
- Switching tasks has an explicit Focus or time cost.
- Completion and midpoint triggers cannot fire twice.
- At least five varied MVP tasks are present.

**Not in scope:** User-created tasks or procedural generation.

## Chunk 10 — PO and team event pack

**OpenSpec change:** `add-po-and-team-event-content`

**Depends on:** Chunks 05, 06, and 09

**Outcome:** Populate the interruption system with recognizable stakeholder and coworker dilemmas.

**In scope:**

- Add approximately six PO events and five Slack/team events.
- Include status requests, tiny changes, estimates, junior help, QA findings, and review requests.
- Give each event multiple choices, escalation copy, and distinct resource/time/Focus trade-offs.
- Add conditional eligibility so events do not contradict resolved tasks or prior choices.
- Add lightweight content-schema validation for missing choices, invalid effects, and escalation errors.

**Acceptance checks:**

- The pack contributes roughly eleven valid, reachable events.
- At least one ignored teammate event escalates into a public-channel consequence.
- Low PO Happiness can increase PO pressure without creating an unstoppable event loop.
- Content validation catches a deliberately malformed fixture.

**Not in scope:** Production, tooling, and personal event packs.

## Chunk 11 — Production and tooling event pack

**OpenSpec change:** `add-production-and-tooling-event-content`

**Depends on:** Chunks 05 and 06

**Outcome:** Add incidents and productivity disruptions that pressure System Stability and task progress.

**In scope:**

- Add approximately six production events and four tooling events.
- Cover escalating error rates, latency, failed deployment, database pressure, GitHub/CI outage, AI assistant failure, and local environment trouble.
- Include rollback, risky fast fix, proper investigation, wait, retry, and ignore patterns where appropriate.
- Connect high Technical Debt to selected production event likelihood or severity.
- Distinguish external outages from problems the player can directly fix.

**Acceptance checks:**

- The pack contributes roughly ten valid, reachable events.
- At least one production chain can escalate from warning to outage.
- Tool outages block or slow coding only for their defined duration and recover cleanly.
- Each presented choice accurately previews its immediate cost; uncertain outcomes are labeled as such.

**Not in scope:** Real network/service integrations.

## Chunk 12 — Personal and consequence event pack

**OpenSpec change:** `add-personal-and-consequence-event-content`

**Depends on:** Chunks 06–08

**Outcome:** Complete the MVP's 25–30 event target and connect earlier choices to later comedic payoffs.

**In scope:**

- Add approximately four personal events and five consequence events.
- Cover sleep warnings, bathroom urgency, coffee crashes, shortcut regressions, repeated incidents, and accidental mistakes.
- Gate personal events by need thresholds and consequences by prior decisions.
- Deduplicate equivalent warnings and apply sensible cooldowns.
- Audit the combined catalog for category totals, unreachable definitions, and repetitive choice patterns.

**Acceptance checks:**

- The total catalog contains 25–30 validated events across the GDD's suggested split.
- Consequence events can be traced to a prior action or current state.
- Need warnings stop appearing after the underlying need is relieved.
- A seeded accelerated run can encounter content from every category without errors.

**Not in scope:** Expanding beyond the MVP event count.

## Chunk 13 — Workday pacing and balance pass

**OpenSpec change:** `tune-workday-pacing`

**Depends on:** Chunks 09–12

**Outcome:** Shape a full run from calm morning to chaotic afternoon while keeping decisions recoverable and readable.

**In scope:**

- Define time bands for morning, normal workload, lunch period, main chaos, and endgame.
- Vary spawn rate, category weights, escalation pressure, and need drain by time band.
- Calibrate the base time scale toward a 10–20 minute session, with a faster developer/test mode.
- Add guardrails for event floods, long empty periods, and unavoidable resource collapse.
- Add a compact debug overlay or run summary useful for balance verification.

**Acceptance checks:**

- Automated seeded simulations reach 17:00 and report event/resource statistics.
- Morning is consistently quieter than 14:00–16:00 under default settings.
- The normal mode usually permits recovery from one critical resource without guaranteeing success.
- A manual run lasts within the target range and always offers a meaningful action.

**Not in scope:** Multiple named difficulty modes.

## Chunk 14 — End-of-day scoring and endings

**OpenSpec change:** `add-end-of-day-results`

**Depends on:** Chunk 13

**Outcome:** Finish a workday with a clear summary, humorous classification, and replay loop.

**In scope:**

- Stop gameplay cleanly at 17:00 and snapshot final run statistics.
- Score features completed, resources, Technical Debt, incidents, needs, and booster use.
- Implement 5–10 deterministic ending rules, including several GDD examples.
- Show a results screen with ending title, short narrative, score breakdown, and restart action.
- Handle zero-resource catastrophes as results or recoverable crises according to explicit rules.

**Acceptance checks:**

- The clock cannot continue changing state after results begin.
- Known state fixtures select the expected ending with documented tie-breaking.
- Restart creates a genuinely fresh run with no timers, events, or input leaked from the prior run.
- The results screen explains why the ending was awarded.

**Not in scope:** Online scores, achievements, or persistent history.

## Chunk 15 — Visual progression, feedback, and audio

**OpenSpec change:** `polish-workday-presentation`

**Depends on:** Chunk 14

**Outcome:** Bring the complete prototype closer to the reference image's warm, readable, increasingly chaotic workstation fantasy.

**In scope:**

- Establish a consistent palette, typography hierarchy, cards, meters, badges, and interaction states.
- Improve laptop, task, alert, clock, and bottom-action composition based on the reference.
- Add escalating desk clutter/visual stress tied to time, active alerts, and Tech Debt.
- Add core sound cues for coding, messages, incidents, choices, boosters, and critical needs.
- Provide master mute and persist the preference locally.
- Respect browser audio-unlock rules and avoid overlapping sounds becoming painfully loud.

**Acceptance checks:**

- Severity and interactable state are understandable without relying only on color.
- Visual clutter increases without covering controls or essential status information.
- All core actions have restrained feedback, audio starts only after user interaction, and mute works immediately.
- The game remains readable at its minimum supported viewport.

**Not in scope:** Reproducing the reference illustration pixel-for-pixel or commissioning final art/music.

## Chunk 16 — MVP hardening and playtest readiness

**OpenSpec change:** `harden-mvp-for-playtesting`

**Depends on:** Chunk 15

**Outcome:** Produce a stable, explainable build ready for external playtesting of the core design hypothesis.

**In scope:**

- Add a short first-run instruction overlay focused on Hold to Code and responding to alerts.
- Verify mouse, touch, keyboard, resize, tab visibility, pause, restart, and audio behavior.
- Add smoke coverage for boot, a resolved event, task completion, time progression, and reaching results.
- Fix runtime errors, stuck input, timer leaks, unreadable states, and asset-load failures found during the pass.
- Document how to run/build the game and a concise manual playtest script.
- Capture balance telemetry only in local/debug state; no external analytics.

**Acceptance checks:**

- A clean install can build and start using documented commands.
- The smoke scenario completes a full accelerated workday without console errors or black screens.
- Losing focus or resizing during a hold cannot leave coding active.
- A new player can identify the objective, primary action, urgent event, and current resources without outside explanation.

**Not in scope:** New mechanics, additional event content, deployment, or post-MVP features.

## OpenSpec change template guidance

When proposing each change, carry the following into its artifacts:

- **Proposal:** Use the chunk's outcome as the goal and preserve its explicit non-goals.
- **Spec:** Turn every acceptance check into one or more testable scenarios; state pause/time behavior for any timed feature.
- **Design:** Identify data ownership, Phaser scene/component boundaries, cleanup of timers/listeners, and how seeded behavior remains testable.
- **Tasks:** Keep tasks implementation-sized, end with build/type checks, and include browser playtesting for player-visible changes.

Do not silently pull scope forward from later chunks. If implementation reveals a required prerequisite, update this roadmap or the active change artifacts before widening the change.
