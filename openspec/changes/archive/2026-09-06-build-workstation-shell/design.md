## Context

The repository is an otherwise unmodified Phaser 4 Vite TypeScript template. It currently uses a 1024×768 canvas, loads generic background/logo assets, and advances through Boot, Preloader, MainMenu, Game, and GameOver sample scenes. The target composition in `docs/gameplay-visualisation.png` is a dense landscape interface, while later roadmap changes will progressively add real state and interaction to its regions.

This change crosses the Phaser configuration, scene flow, reusable UI presentation, HTML metadata, and page-level sizing, so explicit layout and ownership decisions are useful before implementation. See `proposal.md` for motivation and `specs/workstation-shell/spec.md` for observable behavior.

## Goals / Non-Goals

**Goals:**

- Establish one stable logical coordinate system for all later gameplay UI.
- Make the six primary regions readable and visually related to the reference composition.
- Give repeated panels, labels, and placeholders a small reusable presentation layer.
- Leave a direct path for later changes to replace placeholders with live components without redesigning the whole screen.

**Non-Goals:**

- Introduce a global game-state model, event bus, content registry, or other architecture that this static shell does not yet exercise.
- Make placeholder controls perform gameplay actions.
- Reproduce the reference illustration exactly or add final art, animation, audio, or visual deterioration.
- Create responsive reflow variants for portrait orientation; the landscape composition scales as a unit.

## Decisions

### Use a 1280×720 logical canvas with uniform fit scaling

The game configuration will use a 16:9 logical canvas, Phaser's fit scaling, and centered alignment. The reference and intended workstation are landscape compositions, and a fixed coordinate system makes later interaction zones and visual verification predictable. CSS will make the host fill the viewport and provide a neutral letterbox background.

Alternative considered: dynamically resize and reposition every element to the browser dimensions. That adds layout branches and input risk before the core game exists. A portrait-specific layout can be proposed later if playtesting shows it is required.

### Replace sample gameplay scenes with a dedicated workstation scene

Boot remains responsible for the minimum assets needed by Preloader. Preloader remains responsible for loading presentation assets, then transitions directly to a dedicated Workstation scene. Template MainMenu, Game, and GameOver behavior will be removed from the configured scene flow; unused files can be deleted if they have no references.

Alternative considered: repurpose the existing `Game` scene. A purpose-named scene makes its lifetime and future ownership clearer and avoids retaining misleading template concepts.

### Build the shell from Phaser display objects

The workstation regions will be composed from Phaser containers, rectangles, text, and the limited existing imagery where it fits. This keeps scaling, rendering, and future pointer input in the same coordinate space. The layout will use a shared theme and named geometry constants rather than scattering colors and coordinates through the scene.

Alternative considered: implement the side panels and HUD as HTML overlays. Mixing DOM and canvas layout would require two scaling and input models, making reliable alignment harder without a current accessibility requirement that justifies the split.

### Organize UI by visible region, not speculative game domains

Small reusable primitives such as panel frames, section titles, badges, and placeholder buttons will live under a UI-focused module. Region builders or components will correspond to the resource HUD, task panel, laptop, alerts panel, clock, and quick actions. The Workstation scene composes them and owns their teardown through the Phaser scene lifecycle.

Domain state, event content, and gameplay services will be introduced by the changes that first need them. This avoids empty abstractions while ensuring live components can later replace static region content behind the same layout boundaries.

Alternative considered: create the full eventual folder architecture now. Empty domain layers would encode guesses that the state and interruption designs may invalidate.

### Use intentionally inert placeholders

Representative labels, meter tracks, task rows, alert cards, and action buttons will communicate the final information hierarchy. Anything that looks actionable but lacks behavior will use a disabled visual treatment and will not register input listeners. This lets the screen resemble the target without producing false feedback.

Alternative considered: add temporary click animations. Even harmless responses imply implemented mechanics and would add throwaway event-handler cleanup.

## Risks / Trade-offs

- **[Dense reference layout becomes illegible on small portrait screens]** → Scale the complete composition without cropping, keep essential labels high contrast, and defer a portrait reflow until device requirements are validated.
- **[Static placeholder details are mistaken for implemented gameplay]** → Apply consistent disabled styling and avoid changing values or success feedback on input.
- **[One large scene accumulates presentation code]** → Keep scene responsibility to composition and place reusable primitives and region construction in focused UI modules.
- **[Early visual constants constrain later mechanics]** → Name geometry by semantic region and centralize values so future changes can adjust layout without rewriting behavior.
- **[Existing assets clash with the intended tone]** → Prefer coherent shapes and typography; use existing assets only when they support the composition and remove unused template references.

## Migration Plan

1. Add the workstation UI modules and scene alongside the template scenes.
2. Configure the fixed logical canvas and new scene flow, then update browser metadata and host sizing.
3. Verify the workstation at representative landscape, narrow, and portrait viewport sizes.
4. Remove only template scenes/assets proven to be unreferenced after the new flow works.

Rollback consists of restoring the prior scene list, 1024×768 configuration, and template page metadata/styles; this change does not migrate user data or external interfaces.
