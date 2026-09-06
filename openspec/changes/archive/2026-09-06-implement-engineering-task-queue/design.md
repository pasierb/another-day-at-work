## Context

`CodingSession` currently owns one immutable task and its progress together with Focus and Hold-to-Code arithmetic. `Workstation` renders a separate hard-coded four-row task panel, wires task-progress effects directly to that coding session, and uses scene-owned input-source tracking. The existing decision, workday, consequence, and effect models are deterministic and presentation-independent. See `proposal.md` and the delta specs for the behavior being introduced.

The change crosses content, domain state, effect routing, input cleanup, and two workstation regions. Existing uncommitted changes in shared integration files must be preserved.

## Goals / Non-Goals

**Goals:**

- Establish one authoritative owner for selection, per-task progress, completion, rewards, and task-trigger history.
- Preserve frame-partition-independent coding arithmetic and exact Stamina charging at progress boundaries.
- Reuse existing workday time, effect execution, and modal presentation contracts.
- Keep task definitions and queue behavior testable without Phaser.
- Ensure every selection, decision, and completion boundary requires fresh coding input.

**Non-Goals:**

- Add procedural or user-created tasks, persistence, final balance, or end-of-day scoring.
- Generalize the interruption scheduler around task decisions.
- Add the later PO, team, production, tooling, personal, or consequence content packs.
- Make task risk a global random mechanic beyond the one declared midpoint decision.

## Decisions

### Make the engineering task queue the sole owner of task lifecycle state

Add a domain model initialized from validated task definitions. It owns stable queue order, selected identity, progress per task, triggered-decision identities, completion history, and pending task decision state. Its snapshots are immutable and observable. Commands select an incomplete task, accept bounded work, resolve a pending decision, reduce selected-task progress, and reset deterministically.

The Phaser scene only projects snapshots and forwards player commands. Completion effects and task-decision effects are returned as domain transitions for the composition root to execute once through the existing effect engine.

Alternative considered: store the queue in `Workstation`. That would duplicate domain state in UI objects and make completion and exactly-once behavior difficult to test without Phaser.

### Refactor coding into momentum and work production, not task ownership

Retain `CodingSession` as the owner of Focus, held-request state, runtime need modifiers, and rate integration. Move task identity and progress to the queue. A coding update receives the selected task's available work boundary and returns work units plus the proportional Stamina cost; the queue then applies exactly that work.

The next boundary is the smaller of remaining completion effort and remaining effort to an untriggered task-decision threshold. Capping the coding integration at that boundary prevents a large frame from crossing a modal trigger or overcharging Stamina. After applying the transition, the scene clears held sources before opening a decision or exposing an automatically selected task.

Alternative considered: copy the selected task into `CodingSession` and synchronize progress back afterward. Two mutable progress owners could diverge during rollback effects, task switches, or a threshold-crossing frame.

### Model task content with effects and declarative midpoint choices

Create a catalog module containing at least five task definitions. Each definition includes identity, title, effort, priority, concise reward/risk copy, completion effects, and optional Technical Debt effects. One task includes a threshold plus at least two decision choices, each using the existing validated effect union and a game-time cost.

Catalog validation rejects duplicate identities, invalid effort or thresholds, malformed effects, missing decision choices, and duplicate choice identities. Risk remains descriptive unless expressed through a declared decision or effect, preventing undeclared random behavior.

Alternative considered: encode rewards and the midpoint event as task-specific scene callbacks. Callbacks conceal dependencies, cannot be content-validated, and would make later conditional event eligibility harder to build.

### Give task decisions their own lifecycle while sharing decision presentation

The queue marks its threshold decision pending before emitting the transition. `Workstation` clears coding input, acquires a dedicated `task-decision` pause reason, and renders the pending definition through shared decision-card construction. Resolution first advances declared action time and executes effects, then atomically marks the task decision resolved and releases only its pause reason. Scheduler catch-up and consequences retain their existing ordering after the decision is finalized.

Task decisions do not occupy interruption capacity, age, escalate, or enter seeded scheduling. The queue's triggered identity prevents retriggering if later effects reduce progress below the threshold.

Alternative considered: inject the midpoint event into `InterruptionSession`. That would give task-owned mandatory decisions alert aging and scheduling semantics they do not need and would blur later event-capacity rules.

### Use a fixed Focus reduction for voluntary task switches

Selecting a distinct incomplete task applies one configured Focus reduction, clears every held coding source, and blocks those physical sources until released. Automatic selection after completion is not charged, but also requires a fresh press. Selecting the existing task or a completed task is a no-op.

A Focus cost is preferable here to a game-time jump because it communicates context switching directly and does not introduce scheduler/consequence catch-up merely from navigating the queue.

Alternative considered: charge game time. It is valid under the roadmap but couples selection to timed subsystem synchronization and makes exploratory task inspection unexpectedly advance the day.

### Route task effects through explicit composition ports

Completion and midpoint transitions expose ordered validated effects. `Workstation` passes them to `EffectEngine`, which routes task-progress reductions to the queue's selected task. Completed tasks remain immutable, and an absent selected task makes the progress effect a deterministic no-op. Completion effects execute after completion is recorded and before the next ordinary update, so observers cannot award the same task twice.

Alternative considered: let the queue mutate workday resources directly. That would couple queue tests to resource state and bypass the single effect execution path established by the previous change.

### Render the task list from snapshots with stable interaction cleanup

Replace hard-coded rows with snapshot-driven rows that show title, id, priority, progress, selected state, and completed state. Rebuild or update row views without accumulating pointer listeners. Rows are non-interactive while a task or interruption decision is open. The laptop derives its selected-task projection from the same queue snapshot and presents an explicit all-complete state when selection is absent.

Alternative considered: let the task panel and laptop keep separate selected-task values. That risks visible disagreement during completion, switch, and reset transitions.

## Risks / Trade-offs

- [Refactoring task progress out of `CodingSession` can regress proven Hold-to-Code boundaries] → Preserve rate-integration tests, add queue/coding integration tests, and compare continuous versus partitioned updates.
- [A frame can hit a decision or completion boundary with unused elapsed game time] → Consume only work and Stamina through the first boundary; the workday still advances normally, while coding stops at the boundary by design.
- [Completion effects can synchronously alter state or enqueue consequences] → Record completion before emitting effects and apply transitions through the existing bounded effect engine.
- [Task switching during mixed pointer and keyboard input can restart coding] → Reuse the held/blocked-source cleanup contract and require every source to be released before another press is accepted.
- [Shared modal rendering can accidentally share lifecycle state] → Keep task and interruption state machines distinct and share presentation helpers only.
- [Five task rows may pressure the minimum supported viewport] → Use compact rows within the existing task region and cover desktop and touch-sized layouts in browser playtests.
- [Dirty integration files can hide or overwrite earlier work] → Inspect diffs before each shared-file edit and keep changes localized during apply.

## Migration Plan

1. Add and test task content types, validation, and the queue domain model without integrating the scene.
2. Refactor coding updates to emit bounded work and Stamina cost against a queue-provided boundary, preserving existing Focus and input semantics.
3. Wire completion effects and selected-task progress effects through the existing effect engine.
4. Replace static task rows and laptop task projection with queue snapshots and task selection commands.
5. Add the midpoint task decision lifecycle and shared decision-card presentation.
6. Run unit tests, production build, and focused desktop/touch browser playtests covering selection, completion, rewards, midpoint resolution, and all-tasks-complete state.

Rollback restores the single configured coding task and static task panel while leaving existing workday, interruption, consequence, needs, and booster behavior intact. No persisted data or external API requires migration.
