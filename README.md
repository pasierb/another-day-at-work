# Another Day at Work

A Phaser 4 workplace-survival game where every in-run action is an inline sticky decision. Cases arrive, age, escalate, and return as delayed follow-ups while Stamina, PO Happiness, System Stability, Technical Debt, Sleepiness, and Toilet Need keep moving in continuous game time.

## Run and verify

Use Node.js 22 or newer:

```bash
npm ci
npx playwright install chromium
npm run dev
npm test
npm run balance
npx tsc --noEmit
npm run build
npm run smoke
```

## Controls

- Mouse or touch: choose one response directly on an active sticky. This is the only gameplay action.
- Pause and Sound remain conventional controls. Browser visibility pauses time automatically.
- Dismiss first-run guidance with its button. On results, click restart or press `Enter`.

The illustrated laptop is a passive scene prop. There are no task rows, laptop applications, AI review controls, Focus meter, coding keys, booster shortcuts, or bathroom shortcut. Coffee, Coke Zero, microbreaks, and bathroom relief appear as need-triggered sticky choices.

## Test mode

The smoke build uses the accelerated developer pacing profile and `?playtest=1`. It exposes a local read-only `window.__WORKDAY_PLAYTEST__.getSnapshot()` containing clock/pause state, active and resolved stickies, resolved/failed case IDs, legal action types, health risk, terminal state, and run identity. It contains no task or coding fields and is absent in normal play.

See [docs/manual-playtest.md](docs/manual-playtest.md) for the manual release scenario.
