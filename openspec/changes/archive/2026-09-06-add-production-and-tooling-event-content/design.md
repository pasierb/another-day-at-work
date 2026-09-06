## Context

The current implementation already owns interruption lifecycles in `InterruptionSession`, seeded selection and capacity in `EventScheduler`, immediate/delayed/probabilistic effects in `EffectEngine` and `ConsequenceQueue`, task progress in `EngineeringTaskQueue`, and coding-rate modifiers in `CodingSession`. The assembled catalog currently contains six Product Owner events, five teammate events, and one representative production incident; interruption categories have no tooling value, and effects cannot yet express a temporary coding disruption. `Workstation` remains the composition root. See `proposal.md` and the delta specs for required behavior.

## Goals / Non-Goals

**Goals:**

- Keep all production and tooling scenarios declarative, validated, and testable without Phaser.
- Reuse authoritative game time, seeded random streams, escalation ordering, consequence execution, and task/coding ownership.
- Represent service control, uncertain outcomes, and temporary coding disruption explicitly enough for accurate previews.
- Make debt-sensitive production pressure bounded, selective, and replayable.
- Ensure every temporary disruption, timer-like deadline, observer, and input state resets or disposes with the run and scene.

**Non-Goals:**

- Simulate or contact real production systems, GitHub, CI providers, or AI services.
- Add personal or consequence-pack content from Chunk 12, day-band pacing from Chunk 13, or later presentation/endgame work.
- Generalize the effect model into arbitrary callbacks or a scripting language.
- Retune global spawn intervals, active-event capacity, resource balance, or session duration.

## Decisions

### Assemble exactly six production and four tooling definitions

Expand the existing representative production definition and add five more production definitions plus four tooling definitions, yielding the roadmap's approximate six/four split and roughly ten total events. Preserve one authoritative identity for the existing production incident rather than scheduling a duplicate sample alongside its expanded form.

This makes catalog audits precise while staying within the chunk's approximate counts. The alternative—allowing a range without a canonical shipped total—would weaken coverage checks and make later 25–30 event accounting unpredictable.

### Add explicit incident-control and preview metadata

Extend interruption definitions with a validated control classification (`external` or `player-fixable`) for this pack. Keep choice descriptions user-facing, but derive standardized immediate-effect summaries from typed effects; attach explicit preview metadata only where classification or uncertainty cannot be inferred safely. Catalog audit verifies external incidents never promise direct repair and every delayed/probabilistic branch is labeled uncertain.

This keeps UI rendering generic and content reviewable. The alternative—recognizing service names or choice IDs in `Workstation`—would embed content-specific behavior in presentation.

### Model coding disruption as a first-class effect and run-scoped deadline ledger

Add a validated effect containing a stable disruption ID, a coding-speed factor from zero through one, a positive game-time duration, and concise start/end feedback. A presentation-independent disruption ledger converts duration to an absolute authoritative game-time deadline, combines overlapping factors using the most restrictive active factor, emits expirations once in stable creation order, and exposes an immutable snapshot.

`EffectEngine` routes the new effect to the ledger. `Workstation` synchronizes the ledger after game-time changes and passes the effective factor into the existing `CodingSession` runtime modifier alongside personal-needs modifiers. A full block cancels held coding; recovery from a full block requires a fresh press. No wall-clock timeout is created.

The most-restrictive rule is a safe minor assumption: it is deterministic, bounded, easy to explain, and prevents stacked outages from multiplying into opaque fractions. The alternative—multiplying all factors—would make overlapping minor slowdowns unexpectedly severe.

### Keep non-working coding updates resource-neutral

When the effective coding-speed factor is zero, a held update produces neither work nor coding-related Stamina cost. Partial slowdowns reduce work, while the existing Focus rules remain in force unless content separately declares a Focus effect. This treats Stamina as the cost of productive coding, avoids charging the player while a tool makes work impossible, and matches the disruption preview.

The alternative—draining normal Stamina during a complete external outage—would create an unpreviewed penalty and blur tool failure with personal-needs pressure.

### Extend categories and catalog validation without service-specific domain logic

Add `tooling` to the validated interruption categories and author the pack in a dedicated data module assembled with the prior catalog. Extend whole-catalog validation for exact pack totals, required topics, unique IDs, reachability, classification, distinct choices, disruption bounds, escalation graphs, and uncertainty labeling. Use documented context fixtures and deliberately malformed fixtures as Chunk 10 established.

The alternative—one validator per named service—would couple the domain to flavor content and make later catalog edits costly.

### Evaluate debt-sensitive severity only on stage entry

Continue using existing debt-weight modifiers at seeded selection. Where an authored production stage opts into debt-sensitive severity, store a bounded rank adjustment and resolve its effective severity from current Technical Debt when the stage is entered. Snapshot that result in active state so later debt changes do not rewrite an entered stage; definitions without modifiers retain their authored severity.

This preserves queued identity and escalation deadlines while making current debt mechanically meaningful. The alternative—continuously recomputing severity on render—would cause alerts to change without a lifecycle transition and complicate replay.

### Represent recovery through authoritative synchronization

Synchronize disruption expirations in the same post-time-advance ordering used for consequences and scheduler transitions: finish any accepted decision first, then process crossed deadlines in a documented stable order. Pauses freeze game time and therefore disruption duration. Reset clears the ledger and effect state; scene shutdown removes observers and interactive handlers through the established cleanup path.

This avoids independent timers and preserves action-time ordering. The alternative—Phaser delayed calls or browser timers—would continue during decision pauses and risk firing into destroyed scenes.

## Risks / Trade-offs

- [Ten additional verbose events may make alerts or decisions hard to scan] → Keep alert copy concise, use generic generated previews, and browser-test the largest decision at desktop and minimum touch viewports.
- [New effect recursion could permit nested duplicate disruption IDs] → Validate identities and define replacement/rejection behavior explicitly; test delayed and probabilistic disruption branches through the existing depth limit.
- [External outages may leave the player with no useful action] → Give them bounded wait, retry, workaround, or ignore choices and durations; do not add permanent blocks.
- [Debt can overconcentrate production events] → Cap both selection weights and severity ranks, preserve positive non-production weights, and test low/high-debt seeded samples.
- [Combining need and tooling modifiers can become opaque] → Compose named modifier sources in one domain-level calculation and expose the effective coding state and reason to presentation.
- [Catalog growth can create cross-module import cycles] → Keep content modules data-only and validate the fully assembled catalog at a single boundary.

## Migration Plan

1. Extend interruption categories, classification, escalation modifier, effect contracts, and validators while retaining compatibility for existing PO/team definitions.
2. Add the run-scoped coding-disruption ledger and integrate its effect port and immutable snapshot with the effect engine and coding session.
3. Author and assemble six production and four tooling definitions, expanding the representative incident without duplicate scheduling.
4. Add catalog audits and domain tests for topic coverage, reachability, choice previews, debt behavior, escalation chains, overlapping disruptions, pause, expiration, and reset.
5. Integrate run context, disruption synchronization, feedback, and disabled/slow coding presentation in `Workstation`, preserving existing decision and cleanup ordering.
6. Run the complete unit suite, production build/type checks, and focused seeded browser playtests at supported desktop and touch sizes.

Rollback restores the prior assembled catalog and removes the additive classification, tooling category, debt-severity, and disruption-effect contracts. No persisted data, dependency, or external migration is involved.

## Open Questions

- Exact event copy, numeric effects, escalation delays, disruption factors/durations, and bounded debt coefficients may be tuned during implementation as data-only values, provided all specified topic coverage, accurate-preview, deterministic-recovery, and acceptance requirements remain satisfied.
