## 1. Task Domain

- [x] 1.1 Extend task definitions, validation, snapshots, and queue state with lifecycle, stakeholder, mutable effort, deadlines, failure transitions, crisis links, and rollover recovery.
- [x] 1.2 Add unit tests for dormant selection, effort preservation, exact deadline behavior, one-shot crisis activation, and overnight persistence/reset.

## 2. Effects and Orchestration

- [x] 2.1 Add validated targeted deadline, effort, and activation effects and connect them to explicit task queue ports.
- [x] 2.2 Partition workday advancement at task deadlines, execute failure transitions once, cancel incompatible AI work, and preserve deterministic transition ordering.
- [x] 2.3 Add integration tests covering targeted interruption mutations, deadline/action races, update-size independence, and AI cancellation.

## 3. Prototype Content and Presentation

- [x] 3.1 Add the login and search commitments, dormant recovery tasks, failure/recovery effects, and search estimate/scope task mutations.
- [x] 3.2 Update task cards and playtest diagnostics to show stakeholder, deadline countdown, urgent state, failure, and activated crisis work while hiding dormant tasks.

## 4. Verification

- [x] 4.1 Run the complete unit suite, balance matrix, strict TypeScript check, and production build; resolve regressions without weakening commitment behavior.
- [x] 4.2 Add and run a browser playtest scenario for visible commitments and crisis activation, then run the production smoke suite.
