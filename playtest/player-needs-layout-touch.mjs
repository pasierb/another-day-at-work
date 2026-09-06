export default [
    {
        name: 'need HUD and quick actions fit the supported game composition',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const a = s.toiletAction.background.getBounds(); const sleep = s.needViews.sleepiness.label.getBounds(); const toilet = s.needViews.toilet.label.getBounds(); return a.left >= 298 && a.right <= 966 && a.top >= 648 && a.bottom <= 704 && sleep.right < toilet.left && sleep.top >= 20 && toilet.right <= 950; })()`, equals: true }
    },
    { name: 'touch-sized-needs-layout', action: 'screenshot' },
    { name: 'remember time before touch activation', action: 'eval', code: `window.__beforeTouchToilet = scene('Workstation').workday.snapshot.elapsedGameMs;` },
    { name: 'tap Toilet action', action: 'tap', x: 193, y: 206 },
    {
        name: 'touch activates exactly one bathroom visit',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const elapsed = s.workday.snapshot.elapsedGameMs - window.__beforeTouchToilet; const relieved = s.playerNeeds.config.needs.toilet.relievedValue; return elapsed >= 10 * 60000 && elapsed < 11 * 60000 && s.playerNeeds.snapshot.toilet.value >= relieved && s.playerNeeds.snapshot.toilet.value < relieved + 1; })()`, equals: true }
    },
    { name: 'touch-sized-after-bathroom', action: 'screenshot' }
];
