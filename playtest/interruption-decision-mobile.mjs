export default [
    { name: 'schedule representative interruptions', action: 'eval', code: `const s=scene('Workstation');s.workday.spendGameMinutes(80);s.synchronizeInterruptions();` },
    { name: 'open touch-sized decision', action: 'eval', code: `scene('Workstation').openDecision('production-errors');` },
    {
        name: 'scaled canvas and decision content fit the viewport', action: 'expect',
        expect: { expression: `(() => { const canvas = document.querySelector('canvas'); const bounds = canvas.getBoundingClientRect(); const s = scene('Workstation'); return bounds.width <= innerWidth && bounds.height <= innerHeight && bounds.width > 0 && bounds.height > 0 && s.decisionOverlay.getAll().length >= 10 && s.interruptions.snapshot.openInterruption?.choices.length === 2; })()`, equals: true }
    },
    { name: 'touch-sized decision view', action: 'screenshot' },
    { name: 'resolve from touch-sized view', action: 'eval', code: `scene('Workstation').resolveChoice('hotfix');` },
    { name: 'decision resolved and alert list remains composed', action: 'expect', expect: { expression: `scene('Workstation').interruptions.snapshot.active.length === 2 && !scene('Workstation').decisionOverlay && scene('Workstation').alertsContent.getAll().length >= 10`, equals: true } },
    { name: 'touch-sized alert view', action: 'screenshot' }
];
