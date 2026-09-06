export default [
    { name: 'dismiss first-run guidance', action: 'press', key: 'Enter' },
    {
        name: 'need HUD and quick actions fit the supported game composition',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const action = s.toiletAction.root; const sleep = s.needViews.sleepiness.label; const toilet = s.needViews.toilet.label; return action.parentContainer.x + action.x >= 264 && action.parentContainer.x + action.x + 124 <= 1014 && action.parentContainer.y + action.y >= 654 && action.parentContainer.y + action.y + 54 <= 716 && sleep.parentContainer.x === 1024 && toilet.parentContainer.x === 1024 && sleep.x >= 0 && toilet.x >= 0 && sleep.y < toilet.y; })()`, equals: true }
    },
    { name: 'touch-sized-needs-layout', action: 'screenshot' },
    { name: 'remember time before touch activation', action: 'eval', code: `window.__beforeTouchToilet = scene('Workstation').workday.snapshot.elapsedGameMs;` },
    { name: 'tap Toilet action', action: 'tap', x: 231, y: 208 },
    {
        name: 'touch activates exactly one bathroom visit',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const elapsed = s.workday.snapshot.elapsedGameMs - window.__beforeTouchToilet; const relieved = s.playerNeeds.config.needs.toilet.relievedValue; return elapsed >= 10 * 60000 && elapsed < 11 * 60000 && s.playerNeeds.snapshot.toilet.value >= relieved && s.playerNeeds.snapshot.toilet.value < relieved + 1; })()`, equals: true }
    },
    { name: 'touch-sized-after-bathroom', action: 'screenshot' }
];
