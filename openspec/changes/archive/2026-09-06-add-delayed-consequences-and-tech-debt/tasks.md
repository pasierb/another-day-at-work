## 1. Effect and modifier domain

- [x] 1.1 Define the discriminated effect, feedback, and bounded Technical Debt modifier types, including resource, Focus, current-task progress, delayed, and probabilistic variants.
- [x] 1.2 Extend interruption content validation to recursively reject invalid compound effects, modifiers, identities, feedback, and excessive nesting while preserving existing immediate definitions.
- [x] 1.3 Implement and unit-test bounded modifier evaluation at zero, intermediate, and maximum Technical Debt.
- [x] 1.4 Add a bounded current-task progress reduction command to `CodingSession` with observer and completed-task safeguards.

## 2. Deterministic consequence processing

- [x] 2.1 Implement a consequence queue with absolute game-time deadlines, stable creation order, immutable snapshots, exactly-once draining, and deterministic reset behavior.
- [x] 2.2 Implement a presentation-independent effect engine with injected resource, Focus, task-progress, queue, clock, debt, and feedback ports.
- [x] 2.3 Give the effect engine an independently seeded random source and implement deterministic success/failure branch execution without consuming scheduler randomness.
- [x] 2.4 Add unit tests for mixed effect ordering, nested validation, pauses, frame-partition independence, crossed deadlines, re-entrant exactly-once behavior, probability bounds, and random-stream isolation.

## 3. Debt-aware event scheduling

- [x] 3.1 Add validated base weights and optional debt weight modifiers to scheduler-eligible event content.
- [x] 3.2 Replace uniform event selection with stable seeded weighted selection evaluated from current Technical Debt, including deterministic handling for a zero total weight.
- [x] 3.3 Extend scheduler tests for debt-adjusted selection, unchanged unmodified weights, replay determinism, and queued candidates remaining unchanged after debt mutations.

## 4. Representative production outcomes

- [x] 4.1 Route choice and escalation effects through the shared effect engine and remove duplicated effect-application conditionals from `Workstation`.
- [x] 4.2 Define Hotfix, Investigate Properly, Rollback, and Ignore choices with accurate immediate, delayed, probabilistic, task-progress, debt, and uncertainty previews.
- [x] 4.3 Configure Hotfix to provide immediate Stability and PO Happiness, add Technical Debt, and schedule a debt-sensitive seeded regression; configure proper investigation with the larger immediate cost and no shortcut debt.
- [x] 4.4 Add content/domain tests proving all four outcomes resolve once and apply their distinct declared trade-offs.

## 5. Workstation integration and feedback

- [x] 5.1 Compose the consequence queue and consequence random stream for each fresh run and synchronize due consequences from authoritative game time.
- [x] 5.2 Preserve decision-finalization-before-catch-up ordering while draining crossed scheduler and consequence deadlines predictably after action-time jumps.
- [x] 5.3 Render bounded, non-modal scheduled/concluded consequence feedback without consuming alert capacity or covering controls at the minimum supported viewport.
- [x] 5.4 Clean up consequence state and feedback listeners with the scene lifecycle so restarting does not leak pending work or input.

## 6. Verification

- [x] 6.1 Run the full unit test suite and production build, resolving all failures and type errors.
- [x] 6.2 Add and run a focused browser playtest covering Hotfix immediate effects, delayed regression feedback, proper-fix absence of debt, Rollback progress loss, and Ignore resolution.
- [x] 6.3 Browser-test pause behavior and a decision action-time jump across a consequence deadline, confirming effects fire once and coding requires a fresh press afterward.
- [x] 6.4 Repeat a seeded browser scenario to confirm consequence outcomes and event order reproduce without console errors.
