## Why

The project still presents the default Phaser template, so none of the game's later mechanics have a stable or recognizable screen to build on. A responsive workstation shell is needed now to establish the visual hierarchy, scene entry point, and layout boundaries described by the GDD and gameplay reference.

## What Changes

- Replace the Phaser template flow and branding with a game-specific entry flow that opens the primary workstation screen.
- Establish a fixed logical game canvas with browser scaling and centering suitable for pointer and touch-sized viewports.
- Create a static workstation composition with distinct regions for the resource HUD, task queue, laptop workspace, alerts, day clock, and action bar.
- Add reusable presentation components and layout constants needed by those regions without introducing gameplay state or speculative content architecture.
- Use Phaser primitives, text, and existing placeholder assets so the shell is readable without requiring final artwork.
- Update page metadata and surrounding browser styles to present the game instead of the starter template.

## Capabilities

### New Capabilities

- `workstation-shell`: Defines the game's initial screen, responsive canvas behavior, and the required static workstation regions that later gameplay capabilities will populate.

### Modified Capabilities

None.

## Impact

- Replaces the behavior and presentation of the existing Boot, Preloader, MainMenu, Game, and GameOver template scene flow as needed for the new entry experience.
- Affects Phaser configuration and scene/UI organization under `src/game`, plus game-page metadata and layout styling in `index.html` and `public/style.css`.
- May retire unused template imagery while retaining placeholders that support the workstation composition.
- Adds no backend, external API, persistence, or new runtime dependency.
