## Why

The complete MVP is mechanically playable, but its placeholder workstation styling and silent interactions do not yet communicate the warm office-comedy tone, rising pressure, or action feedback described by the GDD. This change provides the presentation and audio pass required before hardening the game for external playtesting.

## What Changes

- Establish a consistent workstation palette, typography hierarchy, panel/card/meter/badge language, and clear hover, pressed, disabled, selected, and urgent states.
- Refine the laptop, task queue, alert stack, clock, resource HUD, decision cards, results view, and quick-action composition toward the reference image while retaining the fixed logical layout.
- Add data-driven visual stress progression tied to game time, active alert pressure, and Technical Debt, using desk clutter and restrained emphasis without obscuring controls or status.
- Add restrained sound cues for coding, messages, incidents, choices, boosters, and critical needs, with bounded overlap and intensity as the day becomes busier.
- Gate audio behind the browser's user-activation requirement and add an immediately effective master mute whose preference persists locally.
- Preserve the chunk boundary: no new mechanics or event content, no pixel-for-pixel reproduction or commissioned final art/music, and no MVP-hardening tutorial, smoke suite, or deployment work.

## Capabilities

### New Capabilities

- `workday-presentation`: Covers the coherent visual system, stress-driven environmental progression, action audio, browser audio unlock, persistent master mute, bounded sound mixing, and minimum-viewport readability for the workstation and results flow.

### Modified Capabilities

- `workstation-shell`: Strengthens the established workstation composition from placeholder regions to the finished MVP presentation while preserving its fixed logical scaling and input alignment.

## Impact

This change primarily affects Phaser presentation code in the workstation, results, and preload scenes; shared UI theme/primitives and layout; new presentation-state and audio orchestration modules; and local static audio or generated placeholder assets. It adds a local preference storage boundary for master mute, but introduces no network APIs, persistence of run progress, or domain-mechanics changes. Existing domain snapshots remain the authoritative inputs for visual stress and sound triggers.
