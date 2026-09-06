## Context

The game uses a fixed 1280×720 Phaser canvas with six stable UI regions. The workstation is currently assembled from rectangles, text, and a few generated decorative notes. Gameplay values and interaction states are rendered directly in Phaser. The active `replace-hold-to-code-with-ai-review-loop` change alters the most prominent laptop controls, so the final laptop bezel and screen artwork must follow that change's interaction layout rather than preserve the outgoing hold control.

The target is the mood, hierarchy, density, and finish of `docs/gameplay-visualisation.png`, not a pixel-for-pixel copy. The illustrated scene must coexist with changing text, variable alert counts, decisions, accessibility cues, and uniform canvas scaling.

## Goals / Non-Goals

**Goals:**

- Make the workstation read first as a warm, playful illustrated place and second as a dashboard.
- Keep changing gameplay content and hit areas code-driven and independently testable.
- Establish reusable art, UI-skin, and notification-identity conventions rather than one monolithic scene image.
- Use existing deterministic presentation state to make the desk and developer tell the story of escalating pressure.
- Keep initial loading, memory use, and rendering cost appropriate for a browser game.

**Non-Goals:**

- Reproduce every object or message in the reference image.
- Change simulation rules, event content, pacing, save data, or scoring.
- Introduce skeletal animation, real-time lighting, shaders, or a responsive reflow layout.
- Commission or generate an unlimited final-art catalog before the reusable composition is proven.

## Decisions

### Use a hybrid layered scene instead of a flattened screenshot

The scene will be divided into background, environment, character, live UI, and foreground layers. Large illustrated surfaces provide atmosphere; Phaser text and controls provide live values and interaction.

This preserves readability and lets stress variants change selectively. A single baked image was rejected because it would duplicate unchanged pixels across variants, couple art to transient copy, and make UI alignment expensive to revise. Rebuilding all illustration from Phaser vector primitives was rejected because that is the presentation limitation this change is intended to remove.

### Treat the logical canvas as the artboard

All artwork will be authored against the existing 1280×720 coordinate system. Source assets may be higher resolution, but exported bounds, anchors, safe zones, and hit regions will be documented in logical pixels. Runtime scaling remains uniform at the canvas level.

This avoids introducing independent DOM layout or resolution-dependent repositioning. The central screen-safe area will be finalized from the AI review-loop workstation layout before hero laptop artwork is exported.

### Separate critical scene assets from optional identity and clutter assets

The preloader will classify the base environment, desk, developer base pose, and essential UI skin as presentation-critical. Optional portraits, small props, and higher-stress variants will have neutral fallbacks. Asset keys will be defined in a small catalog rather than repeated as string literals throughout the scene.

Blocking on every decorative file was rejected because a missing portrait should not prevent a playtest. Treating every asset as optional was also rejected because silently losing the hero scene would conceal a broken build.

### Compose the scene from bounded reusable asset groups

The initial catalog will use:

- one office/window background;
- desk and laptop structural layers;
- a developer base pose plus a small bounded set of stress overlays or poses;
- reusable UI surfaces suitable for stretching or composing at existing region sizes;
- a curated portrait and service-icon atlas;
- small prop clusters grouped by calm, busy, and chaotic stress stages.

Atlases will be used for small repeated identities and props, while large opaque scene layers remain separate compressed images. This balances draw calls, cache reuse, and maintainability without prematurely building a general-purpose asset framework.

### Preserve a dedicated readability plane

Essential UI occupies an explicit plane above environment art and below temporary modal overlays. Panels may become lighter, softer, or partially translucent, but each region retains a contrast surface behind variable text. Decorative foreground art uses defined exclusion zones around the six primary regions.

Typography will use a readable UI face for dynamic information and a display or handwritten accent face only for short titles and environmental notes. Severity and interaction states retain textual and structural cues, not just illustration or color.

### Map presentation state to authored visual bundles

The existing deterministic stress stage remains the sole selector for environment escalation. Each stage maps to a declared bundle of prop clusters, character treatment, and restrained ambient emphasis. Transitions replace or fade bounded layers; they do not alter domain state or move controls.

This keeps seeded replays and screenshots stable. Random prop placement was rejected because it complicates visual regression and can accidentally cover information.

### Build visual identities from semantic source metadata

Interruption presentation will map existing event categories and known sources to portraits, service icons, and card treatments through a presentation catalog. Unknown sources receive a generic but readable fallback. Severity remains orthogonal to identity: source answers “who/what,” while severity answers “how urgent.”

## Risks / Trade-offs

- [Large assets slow startup on mobile connections] → Budget export dimensions and compression, atlas small repeated art, preload only critical assets, and measure the production bundle and first scene readiness.
- [Artwork becomes coupled to a changing laptop UI] → Complete the active AI review-loop layout first and define the laptop screen safe area before final hero export.
- [Rich art reduces text contrast] → Keep opaque or controlled-transparency readability surfaces and test representative worst-case copy at the minimum viewport.
- [Foreground props block controls or pointer input] → Use documented exclusion zones and ensure decorative objects are non-interactive and below the UI plane.
- [Generated or mixed-source assets look inconsistent] → Establish an art bible and approve a small vertical slice before producing all identities and stress variants.
- [Too many individual sprites increase maintenance and draw cost] → Prefer a few stage-specific prop clusters and atlases over freely placed individual objects.
- [Visual tests become brittle] → Assert stable regions and use a small number of deterministic reference states rather than pixel-testing every dynamic text value.

## Migration Plan

1. Finalize the AI review-loop laptop content geometry and record screen and control safe areas.
2. Establish the art bible, asset catalog, export budgets, depth contract, and fallback policy.
3. Build one calm-state vertical slice with the illustrated environment and reskinned live UI.
4. Validate scaling, pointer alignment, copy fit, load behavior, and performance before expanding the catalog.
5. Add interruption identities and busy/chaotic environment bundles.
6. Extend the visual language to decision and results views and update regression coverage.
7. Remove superseded schematic decoration only after the illustrated path passes loading and viewport checks.

Rollback consists of retaining the current shape-based shell behind a presentation switch until the illustrated path is verified. Domain state and persistence require no migration.
