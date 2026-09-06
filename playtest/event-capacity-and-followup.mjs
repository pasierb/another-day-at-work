export default [
    { name: 'configure a one-alert capacity before scheduling', action: 'eval', code: `scene('Workstation').scheduler.config.activeLimit=1;const s=scene('Workstation');s.workday.spendGameMinutes(80);s.synchronizeInterruptions();` },
    { name: 'full alerts area retains scheduled FIFO backlog', action: 'expect', expect: { expression: `(()=>{const s=scene('Workstation');return s.interruptions.snapshot.active.map(x=>x.id).join(',')==='po-scope-request'&&s.scheduler.snapshot.pending.map(x=>x.definitionId).join(',')==='teammate-help,production-errors';})()`, equals: true } },
    { name: 'follow-up requested while full remains a single pending candidate', action: 'eval', code: `const s=scene('Workstation');s.ignoreInterruption('po-scope-request');s.ignoreInterruption('po-scope-request');` },
    { name: 'follow-up does not displace active work or duplicate queued work', action: 'expect', expect: { expression: `(()=>{const s=scene('Workstation');return s.interruptions.snapshot.active[0].id==='po-scope-request'&&s.scheduler.snapshot.pending.map(x=>x.definitionId).join(',')==='teammate-help,production-errors';})()`, equals: true } },
    { name: 'resolve active event', action: 'eval', code: `const s=scene('Workstation');s.openDecision('po-scope-request');s.resolveChoice('accept-scope');` },
    { name: 'resolution drains earliest pending event without reroll', action: 'expect', expect: { expression: `(()=>{const s=scene('Workstation');return s.interruptions.snapshot.active.map(x=>x.id).join(',')==='teammate-help'&&s.scheduler.snapshot.pending.map(x=>x.definitionId).join(',')==='production-errors';})()`, equals: true } },
    { name: 'capacity presentation', action: 'screenshot' }
];
