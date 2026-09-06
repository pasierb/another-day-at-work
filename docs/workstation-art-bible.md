# Workstation presentation art bible

The 1280×720 logical canvas is the artwork coordinate system. The scene should feel like a warm editorial illustration: cream light, terracotta and mustard accents, dusty teal shadows, and dark-plum outlines. Lighting comes from the window and desk lamp; it stays soft and never blooms behind live text.

Use rounded, slightly irregular silhouettes, a consistent ink edge, restrained paper grain, and large readable shapes. Dynamic UI uses `Arial, sans-serif` with bold uppercase headings; handwritten/display styling is reserved for short decorative notes and never carries gameplay state. Portraits use head-and-shoulders crops with a strong silhouette, one identifying prop at most, and the same warm key light.

Calm is open and orderly. Busy adds one bounded prop cluster and mild character strain. Strained adds a second cluster and warmer emphasis. Critical adds the final cluster, an explicit `!!!` incident treatment, and the strongest character overlay without flashing or moving UI.

## Artboard and exclusions

| Region | Bounds (x, y, w, h) | Contract |
| --- | --- | --- |
| Resource HUD | 24, 20, 926, 92 | Variable values and meters |
| Day clock | 966, 20, 290, 92 | Variable clock |
| Task queue | 24, 128, 274, 504 | Variable rows and pointer targets |
| Laptop | 314, 128, 636, 504 | AI controls; inner safe area 342, 210, 580, 338 |
| Alerts | 966, 128, 290, 504 | Variable cards and pointer targets |
| Quick actions | 298, 648, 668, 56 | Pointer targets |
| Modal | 280, 92, 720, 536 | Always above every art layer |

Decoration may touch region edges but may not enter these bounds. Live copy retains at least 16 px internal padding. Every decorative image has input disabled. The laptop's finalized Prompt/Plan controls occupy logical x378–892, y420–468; progress/review content remains inside the laptop region.

## Asset contract

Large opaque backgrounds export as WebP at 1280×720, quality 78–84, at most 350 KiB. Alpha layers export as lossless WebP or PNG, no larger than 1280×720 and 500 KiB. Identity/prop atlases are at most 1024Ñ024 and 350 KiB. The whole workstation catalog targets 1.8 MiB compressed, a 2.5 MiB hard ceiling, and no more than eight simultaneously visible raster layers.

Keys and filenames use `presentation.<group>.<name>` and kebab-case respectively. Base background, environment, and laptop shell are critical. Portraits, icons, foreground props, character/stress variants are optional and must resolve to neutral code-rendered fallbacks. Small repeated identities belong in an atlas; full-canvas layers are never atlased.
