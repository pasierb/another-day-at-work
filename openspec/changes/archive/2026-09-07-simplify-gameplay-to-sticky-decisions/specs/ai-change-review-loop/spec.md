## REMOVED Requirements

### Requirement: A task offers prompt and plan coding modes
**Reason**: AI work modes are removed.
**Migration**: Choose inline case responses.

### Requirement: AI work advances through authoritative game time
**Reason**: No passive implementation cycle remains.
**Migration**: Choice costs and delayed follow-ups use authoritative time.

### Requirement: A proposed batch communicates review evidence
**Reason**: AI review UI is removed.
**Migration**: Communicate consequences in sticky choice previews.

### Requirement: Approval applies a batch exactly once
**Reason**: Batch approval is removed.
**Migration**: Sticky choice effects resolve exactly once.

### Requirement: Revision trades time for improved confidence
**Reason**: AI revision is removed.
**Migration**: Author an alternate choice with a larger time cost.

### Requirement: Cycles cancel safely when their task or run becomes invalid
**Reason**: AI cycles no longer exist.
**Migration**: Pending follow-ups remain governed by case status.

### Requirement: Coding modes are data-driven and extensible
**Reason**: Coding modes are removed.
**Migration**: Extend interruption choice content.
