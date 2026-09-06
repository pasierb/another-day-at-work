# Workstation Shell Specification

## Purpose

Provide a recognizable, responsive workstation screen whose stable visual regions can host the game's later tasks, resources, interruptions, and actions.

## Requirements

### Requirement: Game opens into the workstation experience
The game SHALL finish its loading flow by presenting the Another Day at Work workstation rather than Phaser template branding, sample copy, or a placeholder click-through screen.

#### Scenario: Initial game load completes
- **WHEN** the required startup assets finish loading
- **THEN** the workstation screen is presented without requiring an extra pointer action

#### Scenario: Browser page identifies the game
- **WHEN** the game page is opened
- **THEN** the browser metadata and visible game title identify it as Another Day at Work

### Requirement: Workstation exposes the primary interface regions
The workstation SHALL present distinct regions for the resource HUD, task queue, laptop workspace, messages and alerts, day clock and progress, and quick actions.

#### Scenario: Workstation shell is displayed
- **WHEN** the workstation screen is ready
- **THEN** all six primary regions are simultaneously visible, labeled or otherwise unambiguously identifiable, and do not overlap

#### Scenario: Empty gameplay regions are shown before mechanics exist
- **WHEN** a primary region has no implemented gameplay data or interaction
- **THEN** it displays representative static placeholder content that communicates the region's intended purpose without implying that the mechanic is functional

### Requirement: Layout preserves its composition across viewport changes
The game SHALL use a fixed logical landscape composition and uniformly fit it within the available browser viewport while preserving its aspect ratio and input alignment.

#### Scenario: Landscape viewport is resized
- **WHEN** the browser viewport changes size or aspect ratio
- **THEN** the complete workstation composition remains visible, centered, and free of stretched or overlapping regions

#### Scenario: Viewport is narrower than the logical composition
- **WHEN** the available viewport is narrower or more portrait-oriented than the logical game aspect ratio
- **THEN** the whole logical canvas is scaled down and letterboxed as necessary rather than cropped or independently rearranged

#### Scenario: Pointer input follows the rendered canvas
- **WHEN** the canvas has been scaled and the user points at a visible UI region
- **THEN** the game resolves the input against the corresponding logical region

### Requirement: Shell presentation communicates hierarchy and state honestly
The workstation SHALL use a layered illustrated scene to visually prioritize the laptop workspace while keeping the surrounding status, task, interruption, clock, need, Technical Debt, and quick-action information readable, SHALL distinguish enabled controls from disabled or decorative elements, and SHALL retain that hierarchy as visual stress increases.

#### Scenario: Player scans the initial workstation
- **WHEN** the illustrated workstation is presented at any workday stress stage
- **THEN** the laptop workspace remains the dominant central element and the HUD, task queue, alerts, clock, needs, Technical Debt, and actions remain legible around it

#### Scenario: Player encounters a future-action placeholder
- **WHEN** an action or data-driven mechanic has not been implemented
- **THEN** its representation is visibly non-interactive and does not respond as though an action succeeded

#### Scenario: Player scans action states
- **WHEN** an enabled, selected, pressed, urgent, or disabled element is visible
- **THEN** its state is apparent through consistent non-color presentation cues and its interaction behavior matches the displayed state

#### Scenario: Decorative stress details are displayed
- **WHEN** clutter or environmental emphasis is added as workday pressure rises
- **THEN** those details remain visually subordinate and cannot intercept input intended for gameplay controls

#### Scenario: Illustrated shell is scaled
- **WHEN** the fixed logical composition is fitted to a supported viewport
- **THEN** environment layers, live interface regions, and their interactive bounds remain aligned without stretching or independent reflow
