## 1. Establish the day-state domain

- [x] 1.1 Add workday configuration, resource-key, readonly snapshot, and pause-reason types with documented defaults for 09:00–17:00 and the four initial resource values.
- [x] 1.2 Implement deterministic elapsed-time advancement, 17:00 clamping, derived clock/day progress, and reason-composed pause/resume behavior without Phaser dependencies.
- [x] 1.3 Implement the shared clamped resource mutation path, effective-change notifications, unsubscription, and deterministic reset behavior.

## 2. Verify state behavior independently

- [x] 2.1 Add lightweight TypeScript test tooling and a project test command suitable for framework-independent domain tests.
- [x] 2.2 Cover default and configured initialization, precise time advancement, pause composition, 17:00 clamping, and deterministic reset.
- [x] 2.3 Cover every resource key, both bounds, no-op mutations, observer snapshots, notification timing, and unsubscription.

## 3. Connect live workstation presentation

- [x] 3.1 Adapt the existing meter primitive or add focused HUD views that retain updateable text and fill references without changing the six-region layout.
- [x] 3.2 Replace static primary-resource and Technical Debt values with one snapshot-driven render path, preserving Technical Debt's separate placement.
- [x] 3.3 Replace the static clock and day-progress values with formatting derived from the same precise workday snapshot.
- [x] 3.4 Create and advance the workday from the Workstation scene lifecycle, and add idempotent shutdown cleanup for subscriptions and updates.

## 4. Validate the integrated change

- [x] 4.1 Run the domain test suite and production build, fixing all TypeScript, bundling, and behavior failures.
- [x] 4.2 Browser-playtest time advancement, pause/resume, resource rendering, and reset at the supported logical resolution.
- [x] 4.3 Browser-playtest scene shutdown/re-entry and representative landscape, narrow, and portrait resize cases for stale subscriptions, duplicate advancement, overlap, and console errors.
