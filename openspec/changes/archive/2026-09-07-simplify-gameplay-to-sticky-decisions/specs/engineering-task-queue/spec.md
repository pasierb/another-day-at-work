## REMOVED Requirements

### Requirement: Engineering tasks are validated content data
**Reason**: Engineering narratives are now sticky cases.
**Migration**: Author them as validated case graphs.

### Requirement: The task queue owns selection and independent progress
**Reason**: Runs no longer simulate task progress.
**Migration**: Use active stickies and case status.

### Requirement: Switching tasks has an explicit attention cost
**Reason**: Task selection and Focus are removed.
**Migration**: Express trade-offs as choice time or Stamina costs.

### Requirement: Task completion and rewards occur exactly once
**Reason**: Completion is represented by terminal case choices.
**Migration**: Use case outcomes and effects.

### Requirement: A task midpoint decision triggers once
**Reason**: All decisions are authored sticky graph nodes.
**Migration**: Schedule a delayed case follow-up.

### Requirement: The workstation presents authoritative queue state
**Reason**: The workstation no longer has a task region.
**Migration**: Present case events as stickies.

### Requirement: The task queue owns explicit lifecycle and mutable effort
**Reason**: Task lifecycle and effort are removed.
**Migration**: Use case eligibility, follow-ups, and terminal outcomes.

### Requirement: Commitment state is presented on task cards
**Reason**: Task cards are removed.
**Migration**: Communicate escalation in sticky copy and severity.
