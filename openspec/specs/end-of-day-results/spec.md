# Collapse Results Specification

## Purpose

Conclude an endless multi-day run at the first visible or hidden collapse with a deterministic comic ending and evidence-backed autopsy.

## Requirements

### Requirement: Reaching 17:00 starts another day
The game SHALL continue the same run at 09:00 on the next day, partially restore Stamina and personal needs, preserve PO Happiness, System Stability, Technical Debt, stimulant history, urgent alerts, unfinished work, and delayed consequences, and replenish completed task slots.

#### Scenario: A healthy run reaches 17:00
- **WHEN** no terminal condition exists at the day boundary
- **THEN** the clock shows the next day at 09:00 and gameplay remains active

### Requirement: Collapse is terminal and atomic
The game SHALL end when Stamina, PO Happiness, or System Stability reaches zero or hidden health risk reaches its terminal threshold, and SHALL finish an already accepted action transaction before evaluating all simultaneous causes.

#### Scenario: Several systems collapse in one transaction
- **WHEN** one action or escalation leaves several terminal conditions true
- **THEN** one immutable result records every cause and selects a combination ending

#### Scenario: Updates continue after collapse
- **WHEN** callbacks, held input, or deadlines occur after capture
- **THEN** no run state or result evidence changes

### Requirement: Hidden health risk is foreshadowed
Coffee SHALL add 24 health risk, Coke Zero SHALL add 14, each overnight SHALL remove 10, narrative warnings SHALL occur at 50 and 75, and health collapse SHALL occur at 100 without displaying a numeric HUD meter.

### Requirement: Results are a failure autopsy
The results view SHALL show one of twelve prioritized authored loss endings, days and time survived, simultaneous causes, final resources, work shipped, incidents handled, debt, unresolved alerts, stimulant use, coworker karma, and the causal action or event. It SHALL NOT show a total score or victory ending.

### Requirement: Restart is isolated
Restart SHALL dispose the collapsed run and create a fresh day-one run with no retained state, callbacks, or held input.
