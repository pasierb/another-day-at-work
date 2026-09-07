## Context

Task progress is owned by `EngineeringTaskQueue`, interruption outcomes flow through the common `EffectEngine`, and `WorkdaySession` advances multiple deterministic systems against authoritative game time. Deadlines must therefore be domain state and simulation boundaries rather than scene timers. The current catalog stores percentage progress against immutable effort and has no state beyond complete/incomplete.

## Goals / Non-Goals

**Goals:**

- Prove that two contrasting commitments make interruption choices affect concrete work.
- Preserve deterministic, update-size-independent simulation and presentation-independent task state.
- Reuse the existing progress bar, selection, AI review, and content pipelines.

**Non-Goals:**

- Task stages, procedural or user-created work, recursive crisis deadlines, new result scoring, or conversion of the full task catalog.
- Polished crisis animation or new artwork/audio.

## Decisions

### Store authored definitions separately from mutable runtime state

Definitions gain optional stakeholder, initial deadline offset, failure effects, crisis-task ID, and initial dormant state. Runtime state owns status, current effort, progress, deadline, and failure history. Keeping current effort separate lets scope increases preserve completed work units. A dynamic task factory was rejected because the prototype only needs a bounded, validated set of crisis tasks.

### Add targeted task effects to the common effect union

`task-deadline` sets or extends a deadline relative to effect execution time, `task-effort` adds effort, and `task-activate` activates a dormant definition. All include a task ID and are validated against the assembled task catalog. This avoids task-specific conditionals in the scene or orchestration layer. Deadline assignment occurs after a choice's declared action time, matching the current resolution order.

### Treat deadlines as exact workday boundaries

The queue exposes its next active deadline. `WorkdaySession` partitions advancement at the earliest day or task boundary, synchronizes systems at that instant, and only fails incomplete work before processing time beyond it. This lets work completed at exactly the deadline win while preventing coarse update steps from changing outcomes. Failure returns effects and crisis activation as a transition for the session to execute once; it also cancels an AI cycle targeting the failed task.

### Use two base commitments and two dormant recovery tasks

`BUG-4821` starts with the PO stakeholder and a 90-minute first-day deadline. Failure costs PO 10 and Stability 8, then activates `INC-LOGIN`, an effort-12 urgent containment task rewarding Stability 8 and PO 4 while adding Debt 3. `TASK-3178` starts untimed; the existing estimate choices assign either a 120-minute careful deadline or 75-minute quick deadline after their action time. Failure costs PO 12 and adds Debt 5, then activates effort-12 `INC-SEARCH`, rewarding PO 6 while adding Debt 4. Crisis tasks have no deadline.

The existing search scope choice adds six effort units; negotiation extends an existing deadline by 30 minutes. Other tasks retain their current behavior.

### Keep rollover recovery bounded

An incomplete crisis and its failed source persist across nights. Once the crisis completes, the next day resets the source to its authored daily state and returns the crisis to dormant. Completed ordinary tasks continue using existing daily reset behavior.

### Keep presentation compact

Task cards show stakeholder and either a due clock/countdown or current untimed status. Thirty minutes or less uses urgent styling. Dormant tasks are hidden, failed source cards remain visible but disabled, and active crisis tasks appear as urgent rows. The playtest snapshot exposes status, deadline, and crisis identity without adding mutation hooks.

## Risks / Trade-offs

- [Continuous time makes misses feel arbitrary] → Display the due clock and countdown, preserve exact-boundary semantics, and add scripted success/miss playtests.
- [Additional task rows overflow the compact queue] → Hide dormant tasks and keep the prototype to at most one activated crisis per failed source.
- [Generic effects can reference invalid content] → Validate task targets, numeric bounds, dormant activation targets, and acyclic source-to-crisis links at catalog assembly.
- [Existing balance simulations change materially] → Add deterministic deadline-aware policies and rerun the fixed-seed matrix before accepting balance changes.

## Migration Plan

No persisted task state exists. Deploy the expanded catalog and runtime model together; rollback consists of reverting the change. Existing non-commitment task definitions remain valid through optional fields.
