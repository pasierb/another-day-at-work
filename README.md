# Another Day at Work

A Phaser 4 workstation-survival game. Ship engineering tasks from 09:00 to 17:00 while handling production incidents, tooling failures, scope requests, teammate interruptions, personal needs, delayed consequences, and technical debt. Your decisions, completed work, resources, and incident handling determine the end-of-day score and ending.

## Requirements and commands

Use a current Node.js LTS release (Node 22 or newer) and npm. From a fresh checkout, the committed lockfile is authoritative:

```bash
npm ci
npx playwright install chromium
npm run dev
```

The supported local workflow is:

```bash
npm test                 # complete Node unit/integration suite
npm run balance          # fixed-seed balance matrix
npx tsc --noEmit         # strict TypeScript check
npm run build            # production bundle in dist/
npm run preview          # serve the production bundle
npm run smoke            # build, preview, and run Chromium smoke tests
npm run smoke:headed     # same browser suite with a visible browser
```

`npm run smoke` builds the production-equivalent accelerated profile, starts the preview server itself, and writes failure screenshots, traces, and the HTML report under `playtest-results/`. It fails on uncaught page or console errors, failed required requests, an unusable canvas, stale held input, and missing milestones. Audio files are optional presentation assets: both MP3 and OGG variants are supplied, and an unavailable or locked audio backend must not block play.

## Controls

- Mouse or touch: choose **Prompt Mode** for faster, smaller batches or **Plan Mode** for slower, safer batches. Review the file, test, and concern evidence, then approve or request changes.
- Keyboard: press `1` or `Space` for Prompt Mode, `2` for Plan Mode, `R` to request changes during review, `P` to pause/resume, and `Enter` to restart from results.
- First run: a blocking orientation card explains the objective, coding, alerts, and resources. Dismiss it with its button, `Enter`, or `Escape`. Its versioned preference is stored locally; storage failure only makes it session-local.

Generation advances only through unpaused game time. Visibility pause, first-run guidance, explicit pause, and decision pauses have independent ownership; a review batch remains stable while an interruption is handled.

## Test mode

The smoke build uses `VITE_PACING_PROFILE=developer` and opens `?playtest=1`. That explicit query setting exposes a local, read-only `window.__WORKDAY_PLAYTEST__.getSnapshot()` milestone view for boot, clock, pause ownership, interruptions, task completion, terminal results, and run identity. It cannot mutate gameplay, renders no diagnostic overlay, sends no analytics, and is absent in a normal run. The developer pacing profile accelerates time without changing content, balance rules, scoring, or seeded ordering.

See [docs/manual-playtest.md](docs/manual-playtest.md) for the release-oriented manual scenario.
