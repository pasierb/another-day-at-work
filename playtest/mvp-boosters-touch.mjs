export default [
    {
        name: 'Coffee, Coke Zero, and Toilet fit without overlap on touch viewport', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); const c=s.boosterActions.coffee.background.getBounds(); const z=s.boosterActions.cokeZero.background.getBounds(); const t=s.toiletAction.background.getBounds(); return c.right<z.left&&z.right<t.left&&c.top>=648&&t.bottom<=704; })()`, equals: true }
    },
    { name: 'tap Coffee once', action: 'tap', x: 113, y: 206 },
    {
        name: 'touch gesture consumes exactly one Coffee and disarms', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); return s.boosters.snapshot.consumptionCounts.coffee===1&&s.workday.snapshot.resources.stamina===100; })()`, equals: true }
    },
    { name: 'touch-sized-boosters', action: 'screenshot' }
];
