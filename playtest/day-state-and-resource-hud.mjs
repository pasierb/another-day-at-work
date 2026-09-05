export default [
    {
        name: 'fresh workday HUD matches default snapshot',
        action: 'expect',
        expect: {
            expression: `(() => { const scene = game.scene.getScene('Workstation'); scene.workday.reset(); return scene.clockText.text === '09:00' && scene.resourceViews.stamina.value.text === '75 / 100' && scene.resourceViews.poHappiness.value.text === '75 / 100' && scene.resourceViews.systemStability.value.text === '75 / 100' && scene.resourceViews.technicalDebt.value.text.startsWith('0%'); })()`,
            equals: true
        }
    },
    { name: 'time advances', action: 'wait', ms: 1200 },
    {
        name: 'clock and progress advance together',
        action: 'expect',
        expect: {
            expression: `(() => { const scene = game.scene.getScene('Workstation'); return scene.clockText.text === '09:01' && scene.dayProgressMeter.fill.width > 0; })()`,
            equals: true
        }
    },
    {
        name: 'pause the workday',
        action: 'expect',
        expect: {
            expression: `(() => { const state = game.scene.getScene('Workstation').workday; state.pause('playtest'); window.__pausedElapsed = state.snapshot.elapsedGameMs; return state.snapshot.isPaused; })()`,
            equals: true
        }
    },
    { name: 'paused time does not advance', action: 'wait', ms: 1100 },
    {
        name: 'paused elapsed value is stable',
        action: 'expect',
        expect: {
            expression: `game.scene.getScene('Workstation').workday.snapshot.elapsedGameMs === window.__pausedElapsed`,
            equals: true
        }
    },
    {
        name: 'resource mutation updates only its live HUD view',
        action: 'expect',
        expect: {
            expression: `(() => { const scene = game.scene.getScene('Workstation'); const staminaWidth = scene.resourceViews.stamina.meter.fill.width; scene.workday.mutateResource('technicalDebt', 37); return scene.resourceViews.technicalDebt.value.text.startsWith('37%') && scene.resourceViews.technicalDebt.meter.fill.width > 0 && scene.resourceViews.stamina.value.text === '75 / 100' && scene.resourceViews.stamina.meter.fill.width === staminaWidth; })()`,
            equals: true
        }
    },
    {
        name: 'resume and reset restore the initial presentation',
        action: 'expect',
        expect: {
            expression: `(() => { const scene = game.scene.getScene('Workstation'); scene.workday.resume('playtest'); scene.workday.reset(); return scene.clockText.text === '09:00' && scene.resourceViews.technicalDebt.value.text.startsWith('0%') && !scene.workday.snapshot.isPaused; })()`,
            equals: true
        }
    },
    {
        name: 'restart workstation scene',
        action: 'expect',
        expect: {
            expression: `(() => { const scene = game.scene.getScene('Workstation'); window.__previousWorkday = scene.workday; game.scene.stop('Workstation'); game.scene.start('Workstation'); return true; })()`,
            equals: true
        }
    },
    { name: 'allow restarted scene to render', action: 'wait', ms: 250 },
    {
        name: 'scene re-entry owns one fresh advancing workday',
        action: 'expect',
        expect: {
            expression: `(() => { const scene = game.scene.getScene('Workstation'); return game.scene.isActive('Workstation') && scene.workday !== window.__previousWorkday && scene.workday.snapshot.elapsedGameMs > 0 && scene.workday.snapshot.elapsedGameMs < 60000; })()`,
            equals: true
        }
    },
    { name: 'integrated-workstation', action: 'screenshot' }
];
