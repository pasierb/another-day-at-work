## 1. Configure the game frame and entry flow

- [x] 1.1 Update the Phaser configuration to a 1280×720 logical canvas using uniform fit scaling and centered alignment.
- [x] 1.2 Update the page title, viewport host styles, and letterbox background so the canvas fills the available browser space without distortion or scrolling.
- [x] 1.3 Add the dedicated Workstation scene and change the loading flow to enter it directly without template click-through screens.

## 2. Establish reusable workstation presentation

- [x] 2.1 Add centralized theme and semantic layout constants for palette, typography, spacing, depths, and the six workstation regions.
- [x] 2.2 Implement reusable Phaser UI primitives for panel frames, section headings, badges, meter placeholders, and disabled action placeholders.
- [x] 2.3 Ensure placeholder controls have a consistent disabled treatment and register no gameplay input behavior.

## 3. Compose the workstation shell

- [x] 3.1 Build the top HUD and day-clock areas with static representative labels, meter tracks, and day-progress content.
- [x] 3.2 Build the left task queue and right messages-and-alerts panels with static representative rows and clear section hierarchy.
- [x] 3.3 Build the dominant central laptop workspace with a representative current-task area and disabled Hold to Code placeholder.
- [x] 3.4 Build the bottom quick-action bar with visibly disabled representative actions.
- [x] 3.5 Add restrained decorative workstation elements or existing placeholder imagery only where they preserve legibility and do not imply gameplay behavior.

## 4. Remove template remnants and verify behavior

- [x] 4.1 Remove unreferenced template scenes, imports, sample copy, branding, and assets after confirming the Workstation flow no longer uses them.
- [x] 4.2 Run the TypeScript production build and fix all compile, asset-loading, and bundling errors.
- [x] 4.3 Browser-test initial load and the complete six-region composition at representative 16:9, narrower landscape, and portrait viewport sizes.
- [x] 4.4 Verify the canvas remains centered and uniformly scaled, pointer coordinates stay aligned after resize, and placeholder controls remain inert without console errors.
