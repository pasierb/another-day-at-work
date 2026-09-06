# Workstation presentation art bible

The 1280×720 logical canvas is the artwork coordinate system. The scene should feel like a warm editorial illustration: cream light, terracotta and mustard accents, dusty teal shadows, and dark-plum outlines. Lighting comes from the window and desk lamp; it stays soft and never blooms behind live text.

Use rounded, slightly irregular silhouettes, a consistent ink edge, restrained paper grain, and large readable shapes. Dynamic UI uses `Arial, sans-serif` with bold uppercase headings; handwritten/display styling is reserved for short decorative notes and never carries gameplay state. Portraits use head-and-shoulders crops with a strong silhouette, one identifying prop at most, and the same warm key light.

Calm is open and orderly. Busy adds one bounded prop cluster and mild character strain. Strained adds a second cluster and warmer emphasis. Critical adds the final cluster, an explicit `!!!` incident treatment, and the strongest character overlay without flashing or moving UI.

## Artboard and exclusions

| Region | Bounds (x, y, w, h) | Contract |
| --- | --- | --- |
| Alert pager | 430, 14, 420, 38 | Active/backlog count and page controls |
| Day clock | 984, 4, 292, 72 | Variable clock |
| Task queue | 4, 84, 250, 562 | Variable rows and pointer targets |
| Laptop | 430, 340, 420, 306 | AI controls and current-task state |
| Status sidebar | 1024, 84, 252, 562 | Resource and need meters; transient feedback |
| Quick actions | 264, 654, 750, 62 | Pointer targets |
| Modal | 280, 92, 720, 536 | Always above every art layer |

Decoration may touch region edges but may not enter these bounds. Floating notification cards use their bounded slots around the laptop and are the only full alert-card representation. Live copy retains at least 12 px internal padding. Every decorative image has input disabled. Progress/review content remains inside the laptop region.

## Asset contract

Large opaque backgrounds export as WebP at 1280×720, quality 78–84, at most 350 KiB. Alpha layers export as lossless WebP or PNG, no larger than 1280×720 and 500 KiB. Identity/prop atlases are at most 1024Ñ024 and 350 KiB. The whole workstation catalog targets 1.8 MiB compressed, a 2.5 MiB hard ceiling, and no more than eight simultaneously visible raster layers.

Keys and filenames use `presentation.<group>.<name>` and kebab-case respectively. Base background, environment, and laptop shell are critical. Portraits, icons, foreground props, character/stress variants are optional and must resolve to neutral code-rendered fallbacks. Small repeated identities belong in an atlas; full-canvas layers are never atlased.
