export default [
    { name: 'prepare scheduled alerts at portrait viewport', action: 'eval', code: `const s=scene('Workstation');s.workday.spendGameMinutes(80);s.synchronizeInterruptions();const teammate=s.interruptions.snapshot.active.find(x=>x.id==='teammate-help');window.__touchDeadline=teammate.nextEscalationGameMs;window.__touchStability=s.workday.snapshot.resources.systemStability;` },
    { name: 'tap teammate postpone control', action: 'tap', x: 318, y: 170 },
    { name: 'touch postpone acts without opening overlay', action: 'expect', expect: { expression: `(()=>{const s=scene('Workstation');return s.interruptions.snapshot.active.find(x=>x.id==='teammate-help').nextEscalationGameMs===window.__touchDeadline+1500000&&!s.decisionOverlay;})()`, equals: true } },
    { name: 'tap urgent ignore control', action: 'tap', x: 354, y: 87 },
    { name: 'touch ignore escalates once without opening overlay', action: 'expect', expect: { expression: `(()=>{const s=scene('Workstation');const event=s.interruptions.snapshot.active.find(x=>x.id==='production-errors');return event.stageIndex===0&&s.workday.snapshot.resources.systemStability===window.__touchStability-12&&!s.decisionOverlay;})()`, equals: true } },
    { name: 'portrait alert controls remain readable', action: 'screenshot' }
];
