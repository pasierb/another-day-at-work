## REMOVED Requirements

### Requirement: Active commitments have authoritative deadlines
**Reason**: Task deadlines are replaced by sticky escalation and follow-ups.
**Migration**: Encode timing in the case graph.

### Requirement: Deadline completion wins at the boundary
**Reason**: Task progress no longer exists.
**Migration**: Resolve the relevant terminal sticky choice at its boundary.

### Requirement: Failed commitments activate authored crisis work
**Reason**: Failure and crisis are case branches.
**Migration**: Schedule an escalation follow-up ending in a failed case outcome.

### Requirement: Commitment recovery persists across workdays
**Reason**: Cases, rather than tasks, persist across rollover.
**Migration**: Keep pending follow-ups and active stickies across days.
