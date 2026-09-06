## 1. Content and Effect Contracts

- [x] 1.1 Add the `tooling` interruption category and validated external/player-fixable incident-control metadata while preserving compatibility for the existing Product Owner, teammate, and production definitions.
- [x] 1.2 Add a validated coding-disruption effect with a stable ID, bounded speed factor, positive game-time duration, and concise start/end feedback, including support inside existing delayed and probabilistic effect validation.
- [x] 1.3 Add bounded Technical Debt severity metadata for authored production escalation stages and reject invalid ranges, categories, and modifier values before activation.
- [x] 1.4 Add unit tests for valid and invalid classifications, disruption effects, nested effects, severity modifiers, and compatibility with the existing assembled catalog.

## 2. Authoritative Coding Disruptions

- [x] 2.1 Implement a presentation-independent run-scoped disruption ledger that creates absolute game-time deadlines, exposes immutable active state, and expires entries exactly once in deadline and stable creation order.
- [x] 2.2 Combine overlapping disruptions using the documented most-restrictive speed factor, preserve independent deadlines, and restore the remaining or neutral modifier after expiration.
- [x] 2.3 Route disruption effects through the effect engine and compose their effective speed with existing personal-needs coding modifiers without transferring ownership to the Phaser scene.
- [x] 2.4 Ensure a zero-speed disruption produces no work or coding Stamina cost, cancels held coding, and requires a fresh press after recovery while partial slowdowns preserve Focus and progress bounds.
- [x] 2.5 Add domain tests for full blocks, partial slowdowns, overlap, decision/action-time deadline crossing, pause behavior, exact-once expiration, reset, and delayed or probabilistic disruption branches.

## 3. Debt-Sensitive Escalation

- [x] 3.1 Evaluate an opted-in production stage's bounded effective severity from current Technical Debt only when the stage is entered, then retain that entered severity in active state.
- [x] 3.2 Preserve authored severity for unmodified stages and preserve event identity, escalation deadline, queue order, one-time effects, and resolution-before-catch-up semantics when debt changes.
- [x] 3.3 Add deterministic tests for zero/high-debt severity, bounded ranks, debt changes before and after entry, identical-history replay, ignored warning-to-outage progression, and pre-deadline cancellation.

## 4. Production and Tooling Catalog

- [x] 4.1 Author and assemble exactly six production definitions, expanding the existing representative incident without duplication and covering escalating errors, latency, failed deployment, and database pressure.
- [x] 4.2 Author and assemble exactly four tooling definitions covering GitHub or CI outage, AI assistant failure, and local environment trouble.
- [x] 4.3 Give player-fixable events appropriate rollback, risky fast fix, proper investigation, retry, or ignore choices, with at least one production chain escalating from warning through degradation to outage.
- [x] 4.4 Give external outages bounded wait, retry, workaround, or ignore choices that do not promise direct repair, and use temporary disruptions that always recover cleanly.
- [x] 4.5 Connect selected production definitions to bounded Technical Debt likelihood or severity while keeping unmodified definitions and non-production selection weights unaffected.
- [x] 4.6 Ensure every choice has distinct trade-offs and an accurate generated or validated preview of immediate costs, with delayed and probabilistic outcomes explicitly labeled uncertain.

## 5. Catalog Validation and Coverage

- [x] 5.1 Extend whole-catalog audit for exact six/four pack totals, required topics, unique identities, reachability, incident classification, distinct choices, disruption bounds, escalation graphs, and uncertainty labels.
- [x] 5.2 Add deliberately malformed fixtures proving invalid classification, missing choices, misleading previews, invalid effects or durations, unreachable definitions, and broken escalation references fail before scheduling.
- [x] 5.3 Add content tests proving all ten pack definitions are valid and reachable, external and player-fixable choices respect their classification, and later personal/consequence-pack topics remain excluded.
- [x] 5.4 Add seeded catalog scenarios proving high Technical Debt changes only declared production pressure, a production warning reaches outage once, and every tooling disruption expires once without leaving coding blocked or slowed.

## 6. Workstation Integration

- [x] 6.1 Replace the single representative production definition in the assembled scheduler pool with the production/tooling pack while preserving the existing PO/team definitions and run-context selection behavior.
- [x] 6.2 Synchronize disruption deadlines after authoritative game-time changes in the documented decision-first order, and feed the effective modifier and reason into coding availability and laptop feedback.
- [x] 6.3 Extend generic alert and decision presentation for the tooling category, incident classification, certain immediate previews, and explicitly uncertain delayed/probabilistic outcomes without service-specific UI conditionals.
- [x] 6.4 Ensure pause freezes disruption duration and restart or scene shutdown clears the ledger, observers, feedback, input state, active modifiers, and all run-scoped listeners.

## 7. Verification

- [x] 7.1 Run the complete unit test suite and production build/type checks, resolving regressions while preserving roadmap Chunks 01–10 behavior.
- [x] 7.2 Add and run a focused seeded browser playtest that reaches production and tooling content, resolves rollback, fast-fix, investigation, wait, retry, and ignore patterns, and confirms visible effects match choice previews.
- [x] 7.3 Browser-playtest a warning-to-outage production chain, elevated-debt pressure, a complete tool block, a partial slowdown, overlapping recovery, pause/action-time ordering, and fresh-input recovery with no console errors.
- [x] 7.4 Verify the largest production/tooling decision and active-alert mix remain readable and operable with mouse and touch at supported desktop and minimum viewport sizes.
