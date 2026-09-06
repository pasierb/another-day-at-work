# Workday pacing balance matrix

The fixed replay seeds are `20260906`, `4821`, `3178`, and `911`. Each seed runs the `balanced`, `productive`, and `risky` deterministic policies against both the normal and developer profiles. Run `npx tsx scripts/run-balance-matrix.ts` to emit the complete immutable reports.

The normal profile advances 0.5 game minutes per real second, making an uninterrupted eight-hour workday exactly 16 real minutes. The developer profile advances 8 game minutes per real second and retains the same catalog, eligibility, ordering, actions, and rules. Decisions and inactive-tab pauses are authoritative-time freezes and are excluded from this clock calculation.

## Verification evidence

On 2026-09-06 the complete 24-run matrix (12 runs per profile) produced only exact `28,800,000` ms terminal times. Across each profile, morning produced 24 total spawns versus 141 during main chaos; peak pressure was 5 against a ceiling of 6; maximum quiet duration was 32 game minutes against a 38-minute guardrail. Eight representative runs exercised recovery windows, while deliberately risky policies retained the possibility of collapse. Two consecutive complete matrix serializations had the identical SHA-256 digest `e436d0623f941c80f166ba4a14a9f185d6660c95af237a15343c4b9a103e2896`.

Accelerated browser coverage visited all five bands, crossed a boundary by action-time jump, held authoritative time stable through a decision pause, exercised flood deferral and an empty quiet deadline, recovered a critical Toilet Need, and stopped cleanly at 17:00. The diagnostics overlay was non-interactive and in-bounds at 1280×720 and a 360×640 touch viewport, was removed on shutdown, and was absent with default environment settings. No browser console or page errors were observed.

A normal-profile browser run using legal coding, task-decision, bathroom, and booster actions completed at exactly 17:00 in 885,179 ms (14 minutes 45 seconds). It maintained a meaningful available action throughout, exercised proactive critical-resource recovery, and produced no console or page errors. A deliberately critical accelerated scenario separately confirmed that the Toilet SEV-1 state remained recoverable.
