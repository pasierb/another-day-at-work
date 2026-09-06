## Why

The workstation has the reference image's basic information architecture, but its flat shapes and text do not yet deliver the warm, characterful, increasingly chaotic workplace fantasy defined by the game direction. With the gameplay structure established and the central interaction being redesigned around an AI review loop, the project now needs a layered art and UI presentation system that can approach the reference's quality without sacrificing live state, legibility, or interaction accuracy.

## What Changes

- Replace the plain backdrop and schematic workstation treatment with a layered illustrated office, desk, developer, laptop, and foreground composition.
- Reskin the runtime UI with an authored visual language for panels, tabs, meters, badges, buttons, avatars, service icons, and notification cards while retaining code-rendered live text and values.
- Give people, workplace tools, and production incidents visually distinct identities so interruptions can be recognized before their full copy is read.
- Expand deterministic visual-stress presentation into authored calm, busy, and chaotic environmental variants tied to existing presentation state.
- Establish an asset-loading and fallback contract so missing optional decoration cannot prevent the workstation from loading or obscure gameplay.
- Preserve the fixed 16:9 logical composition, input alignment, accessibility cues, and readability at supported viewport sizes.
- Sequence the hero laptop artwork after the AI change-review interaction has finalized the central workspace composition.

## Capabilities

### New Capabilities

- `illustrated-workstation`: Defines the layered illustrated environment, asset composition, visual identities, graceful fallback behavior, and state-driven environmental variants.

### Modified Capabilities

- `workstation-shell`: Changes the shell from a primarily schematic panel layout to a layered illustrated scene while preserving its regions, hierarchy, responsive fitting, and honest interaction states.
- `workday-presentation`: Extends the presentation language and deterministic stress progression to authored art variants, recognizable notification identities, and richer non-color state cues.

## Impact

- Affects the Phaser preload flow, workstation scene composition, shared UI primitives and theme tokens, presentation-state mapping, and asset organization under `public/assets`.
- Introduces a collection of optimized raster assets and potentially web fonts; no gameplay-domain behavior or saved state changes.
- Requires the central laptop composition to remain compatible with `replace-hold-to-code-with-ai-review-loop`.
- Increases visual-regression and asset-loading test coverage, including minimum viewport and missing-asset checks.
