## 1. Eligibility and Outcome Contracts

- [x] 1.1 Add typed declarative task, resolved-event, and resolved-choice eligibility predicates plus immutable run-context snapshots, preserving definitions with no eligibility metadata.
- [x] 1.2 Extend interruption validation to reject malformed predicates, empty predicate groups, invalid outcome identities, and invalid task/event/choice references at the assembled-catalog boundary.
- [x] 1.3 Record immutable event-and-choice outcome history during final one-time interruption resolution while preserving resolved-ID compatibility and deterministic reset.
- [x] 1.4 Add scene-independent tests for predicate matching, all/any behavior used by the pack, invalid cross-references, exact-once outcome recording, immutability, and reset.

## 2. Context-Aware Seeded Selection

- [x] 2.1 Add a pure eligibility evaluator that filters definitions from an immutable authoritative run-context snapshot before a scheduler draw.
- [x] 2.2 Generalize validated bounded selection-weight modifiers to support declared PO Happiness pressure alongside Technical Debt without changing unmodified definitions.
- [x] 2.3 Extend scheduler synchronization inputs to apply eligibility and resource weighting only when creating a candidate, preserving random-stream ownership, frame-partition replay, and queued candidate identities.
- [x] 2.4 Add scheduler tests for identical context-history replay, ineligible definitions, temporarily empty pools, low-PO bounded weighting, unaffected teammate weights, retained non-PO probability, and no queued-event reweighting.

## 3. Product Owner and Team Catalog

- [x] 3.1 Author and assemble exactly six Product Owner definitions, including status requests, tiny changes, and estimate pressure, with multiple accurate trade-off choices and content-defined escalation.
- [x] 3.2 Author and assemble exactly five Slack/team definitions, including junior help, QA findings, and review requests, with multiple accurate trade-off choices and content-defined escalation.
- [x] 3.3 Expand or replace the existing representative PO and teammate samples without duplication, retain the production sample outside pack totals, and add contextual eligibility tied to real task and prior-choice identities.
- [x] 3.4 Add an ignored teammate escalation whose copy and one-time effects or follow-up make the public-channel consequence traceable to its source.
- [x] 3.5 Configure conservative bounded PO Happiness modifiers and broadly eligible non-PO content so low stakeholder happiness increases pressure without producing an unstoppable loop.

## 4. Catalog Validation and Coverage

- [x] 4.1 Add a whole-catalog audit for unique identities, category totals, required topic coverage, task/event/choice cross-references, escalation graphs, and reachability across documented contexts.
- [x] 4.2 Add deliberately malformed fixtures proving missing choices, invalid effects, broken escalation references, and malformed eligibility fail before scheduling.
- [x] 4.3 Add content tests proving all eleven pack definitions validate, are reachable, expose distinct choices and escalation copy, and exclude later production/tooling, personal, and consequence-pack content.
- [x] 4.4 Add a seeded domain scenario proving an ignored teammate event reaches its public-channel outcome once and low PO Happiness increases bounded PO pressure without starving team events.

## 5. Workstation Integration

- [x] 5.1 Replace the sample-only scheduler pool with the assembled catalog and supply fresh immutable task, resource, and interruption-outcome context at each selection opportunity.
- [x] 5.2 Ensure every new choice and escalation effect uses the existing effect engine, decision pause, resolution-before-catch-up, active-capacity, and feedback paths without category-specific scene conditionals.
- [x] 5.3 Update alert and decision presentation only as needed to keep all new copy, choices, severity, age, and interaction states readable at supported desktop and touch-sized viewports.
- [x] 5.4 Verify restart and scene shutdown clear new outcome/context state and remove all run-scoped subscriptions and input handlers without leaking scheduled or active events.

## 6. Verification

- [x] 6.1 Run the complete unit test suite and production build/type checks, resolving regressions while preserving the behavior of roadmap Chunks 01–09.
- [x] 6.2 Add and run a focused seeded browser playtest that reaches Product Owner and team content, resolves representative choices once, exercises contextual eligibility, and confirms HUD/task/Focus effects match their previews.
- [x] 6.3 Browser-playtest the ignored teammate public-channel escalation, pre-deadline cancellation, low-PO bounded pressure, pause/action-time ordering, and active-queue behavior with no console errors.
- [x] 6.4 Verify the expanded alert list and largest decision remain readable and operable with mouse and touch at the supported desktop and minimum viewport sizes.
