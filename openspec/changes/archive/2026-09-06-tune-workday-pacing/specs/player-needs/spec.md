## ADDED Requirements

### Requirement: Need accumulation responds to the active pacing band
Sleepiness and Toilet Need SHALL accumulate using validated band-specific rate modifiers derived from authoritative game time, and each portion of an update or action-time jump SHALL use the rate of the pacing band that portion crosses.

#### Scenario: Time advances within one band
- **WHEN** authoritative game time advances entirely within a pacing band
- **THEN** each need accumulates from its configured base rate and that band's declared modifier

#### Scenario: One update crosses several bands
- **WHEN** an elapsed-time update or action-time cost crosses one or more pacing-band boundaries
- **THEN** need accumulation is integrated across each crossed interval in chronological order and threshold transitions still occur exactly once

#### Scenario: A band does not modify one need
- **WHEN** a pacing band omits a modifier for Sleepiness or Toilet Need
- **THEN** the omitted need uses its neutral configured rate for that interval

#### Scenario: Need progression is paused
- **WHEN** authoritative game time remains unchanged during a pause
- **THEN** no band-specific need accumulation or threshold transition occurs

