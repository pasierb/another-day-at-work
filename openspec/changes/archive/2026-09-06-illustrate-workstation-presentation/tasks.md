## 1. Lock Composition and Art Direction

- [x] 1.1 Complete or reconcile the `replace-hold-to-code-with-ai-review-loop` workstation UI so the laptop screen geometry and control safe area are stable.
- [x] 1.2 Document a compact art bible covering palette, lighting, line treatment, shape language, UI and accent typography, portrait style, and calm-to-chaotic visual progression.
- [x] 1.3 Mark the 1280×720 artboard with bounds and exclusion zones for the six primary interface regions, modal overlays, variable copy, and pointer targets.
- [x] 1.4 Define visual asset budgets, export dimensions, compression formats, naming conventions, atlas policy, and critical-versus-optional classification.

## 2. Establish the Presentation Asset Pipeline

- [x] 2.1 Add a typed presentation asset catalog for base scene layers, UI skin assets, portraits, service icons, character treatments, and stress-stage prop bundles.
- [x] 2.2 Extend preloading to load presentation-critical assets before entering the workstation and report failures without starting a partially broken hero scene.
- [x] 2.3 Add neutral runtime fallbacks for optional portraits, service icons, props, and unavailable stress variants.
- [x] 2.4 Add automated checks for duplicate keys, missing catalog files, oversized exports, and classification of every workstation asset.

## 3. Build and Validate a Calm-State Vertical Slice

- [x] 3.1 Produce the office/window background, desk structure, developer base treatment, laptop shell, and foreground framing as separable assets aligned to the logical artboard.
- [x] 3.2 Replace the schematic backdrop with explicit background, environment, character, live-UI, foreground, controls, and overlay depth layers.
- [x] 3.3 Keep all decorative display objects non-interactive and verify that the existing live controls retain accurate hit areas.
- [x] 3.4 Capture calm-state screenshots at the standard and minimum supported viewports and verify composition, aspect ratio, sharpness, text contrast, and pointer alignment.
- [x] 3.5 Measure the production asset footprint and scene startup/rendering behavior and bring them within the documented budgets before expanding the catalog.

## 4. Apply the Authored UI Language

- [x] 4.1 Implement reusable panel, card, tab, meter, badge, and button treatments that can fit the existing variable-content regions.
- [x] 4.2 Apply the UI skin to the resource HUD, clock, tasks, laptop workspace, alert rail, and quick actions without changing gameplay behavior.
- [x] 4.3 Apply the same typography and interaction-state language to interruption decisions, engineering decisions, first-run guidance, pause/mute controls, and results.
- [x] 4.4 Verify enabled, hover/pressed, selected, urgent, and disabled states through non-color cues and confirm worst-case labels and copy fit their bounds.

## 5. Add Interruption Identities

- [x] 5.1 Define semantic presentation mappings for stakeholder, teammate, workplace-tool, production-system, and unknown interruption sources.
- [x] 5.2 Produce and atlas the bounded initial set of portraits, service icons, severity markers, and fallback identities.
- [x] 5.3 Render source identity and severity independently on alert cards and decision views, including a distinctive high/critical production-incident treatment.
- [x] 5.4 Test mixed-source alert lists and unknown-source fallbacks with short, long, low, and critical content.

## 6. Implement Environmental Stress Variants

- [x] 6.1 Produce deterministic busy and chaotic prop clusters, character-strain treatments, and restrained lighting/emphasis layers consistent with the calm scene.
- [x] 6.2 Map each existing presentation stress stage to a declared visual bundle without introducing random placement or domain-state changes.
- [x] 6.3 Add restrained transitions between visual bundles that do not flash the full scene, reset gameplay, move controls, or intercept input.
- [x] 6.4 Verify identical presentation inputs reproduce identical compositions and maximum clutter stays outside all exclusion zones at the minimum viewport.

## 7. Harden and Complete the Migration

- [ ] 7.1 Add deterministic visual-regression scenarios for calm, mixed-message, urgent-incident, maximum-stress, decision-overlay, and results states.
- [x] 7.2 Add a browser test that proves an optional asset failure uses a fallback while critical asset failure is surfaced and does not enter a misleading partial scene.
- [ ] 7.3 Run build, unit, smoke, and headed playtest checks across supported viewport shapes and correct asset, rendering, input, or readability regressions.
- [x] 7.4 Remove superseded schematic decoration and the temporary presentation switch only after the illustrated path passes all acceptance checks.
- [x] 7.5 Update the manual playtest guide with visual hierarchy, source recognition, stress progression, minimum-viewport, and loading-fallback checks.
