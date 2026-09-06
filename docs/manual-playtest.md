# Manual MVP playtest

Record browser/version: __________  Input method: __________  Viewport/device: __________

Start `npm run dev` in a clean checkout installed with `npm ci`. Use a new private browser context or clear only the `another-day-at-work:guidance:v1` site preference so first-run guidance appears.

1. Without outside explanation, record what you believe the objective, primary action, urgent alert treatment, and current resources are. Expected: reach 17:00, Hold to Code, respond to urgent alerts, and protect the visible resources/needs.
2. Dismiss guidance by button, then reload to confirm it stays dismissed. In a separate fresh context, confirm `Enter` or `Escape` dismisses exactly once.
3. Hold the workstation control with the mouse, then hold `Space`. Expected: progress and Focus rise only while held; releasing stops both paths.
4. Open a red urgent alert and choose a visible response. Expected: the clock is stable while deciding, the declared trade-off applies once, and coding requires a fresh press.
5. Complete a task and resolve its engineering decision. Expected: the task becomes Done and the next incomplete task is selected.
6. Use Coffee, Coke Zero, or Toilet when available. Expected: its visible recovery and trade-off apply once.
7. While coding is held, switch tab or blur the window, return, then resize/orient the viewport. Expected: time is stable while hidden and coding remains stopped until a fresh press; all controls remain aligned and reachable.
8. Press `P` or click Pause, wait, and resume. Toggle Sound. Expected: the clock freezes until resume; mute state changes without blocking play.
9. Continue to 17:00 (the developer profile may be used with `VITE_PACING_PROFILE=developer npm run dev`). Expected: a readable results view explains score and ending.
10. Restart by button and by `Enter`. Expected: 09:00 state has no inherited hold, open alert, pause, timer, sound, or completed task.
11. Repeat essential layout and touch steps at the minimum supported touch-sized viewport, 390×700 CSS pixels, including one orientation change.

Observed failures (step, expected, actual, console text):

________________________________________________________________________________

Remaining known playtest limitations: Chromium touch emulation is not Safari or physical-device certification; headless audio checks verify game state and fallback rather than audible output; screenshots are diagnostics rather than pixel-perfect visual baselines. No new mechanics or remote analytics are included in this hardening pass.
