export default [
    { name: 'schedule representative interruptions', action: 'eval', code: `const s=scene('Workstation');s.workday.spendGameMinutes(80);s.synchronizeInterruptions();` },
    {
        name: 'three readable representative alerts activate from the schedule', action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const a = s.interruptions.snapshot.active; return a.length === 3 && a.map(x => x.category).join(',') === 'product-owner,teammate,production' && s.alertsContent.getAll().length >= 15; })()`, equals: true }
    },
    { name: 'build Focus and hold coding before decision', action: 'eval', code: `const s = scene('Workstation'); s.coding.requestCoding(true); s.coding.update(8 * 60000, 100); s.beginCodingSource('keyboard:Space'); window.__beforePO = { time: s.workday.snapshot.elapsedGameMs, focus: s.coding.snapshot.focus, debt: s.workday.snapshot.resources.technicalDebt, po: s.workday.snapshot.resources.poHappiness, progress: s.coding.snapshot.task.progress };` },
    { name: 'open Product Owner alert', action: 'eval', code: `scene('Workstation').openDecision('po-scope-request');` },
    {
        name: 'decision blocks time coding and other alerts', action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); window.__pausedPO = { time: s.workday.snapshot.elapsedGameMs, focus: s.coding.snapshot.focus, debt: s.workday.snapshot.resources.technicalDebt, po: s.workday.snapshot.resources.poHappiness, progress: s.coding.snapshot.task.progress }; return s.interruptions.snapshot.openInterruption?.id === 'po-scope-request' && s.workday.snapshot.pauseReasons.includes('interruption-decision') && !s.coding.snapshot.isCodingRequested && s.blockedCodingSources.has('keyboard:Space') && s.interruptions.open('production-errors') === false && !!s.decisionOverlay; })()`, equals: true }
    },
    { name: 'passive clock and coding freeze behind decision', action: 'wait', ms: 450 },
    { name: 'paused values remain stable', action: 'expect', expect: { expression: `scene('Workstation').workday.snapshot.elapsedGameMs === window.__pausedPO.time && scene('Workstation').coding.snapshot.task.progress === window.__pausedPO.progress`, equals: true } },
    { name: 'generic cancel cannot dismiss', action: 'press', key: 'Escape' },
    { name: 'decision remains open after cancel', action: 'expect', expect: { expression: `scene('Workstation').interruptions.snapshot.openInterruption?.id`, equals: 'po-scope-request' } },
    { name: 'choose Product Owner trade-off', action: 'click', x: 640, y: 335 },
    {
        name: 'Product Owner effects resolve once and require input release', action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const before = window.__pausedPO; const expectedTime = before.time + 25 * 60000; const expectedFocus = Math.max(0, before.focus - .2); s.beginCodingSource('keyboard:Space'); const guarded = !s.coding.snapshot.isCodingRequested; s.endCodingSource('keyboard:Space'); return s.workday.snapshot.elapsedGameMs >= expectedTime && s.workday.snapshot.elapsedGameMs < expectedTime + 60000 && s.workday.snapshot.resources.poHappiness === Math.min(100, before.po + 12) && s.workday.snapshot.resources.technicalDebt >= before.debt + 10 && s.coding.snapshot.focus <= expectedFocus && !s.interruptions.snapshot.active.some(x => x.id === 'po-scope-request') && s.interruptions.snapshot.resolvedIds.filter(x => x === 'po-scope-request').length === 1 && guarded; })()`, equals: true }
    },
    { name: 'prepare production decision with unrelated pause', action: 'eval', code: `const s = scene('Workstation'); s.workday.pause('maintenance'); s.workday.resume('maintenance'); s.coding.synchronizeAvailability(true, 100); s.coding.requestCoding(true); s.coding.update(4 * 60000, 100); window.__beforeProduction = { time: s.workday.snapshot.elapsedGameMs, focus: s.coding.snapshot.focus, stability: s.workday.snapshot.resources.systemStability, debt: s.workday.snapshot.resources.technicalDebt }; s.workday.pause('maintenance');` },
    { name: 'open production alert directly under composed pause', action: 'eval', code: `scene('Workstation').openDecision('production-errors');` },
    { name: 'resolve production hotfix', action: 'eval', code: `scene('Workstation').resolveChoice('hotfix');` },
    {
        name: 'production effects apply while unrelated pause survives', action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const before = window.__beforeProduction; return s.workday.snapshot.elapsedGameMs === before.time + 35 * 60000 && s.workday.snapshot.resources.systemStability === Math.min(100, before.stability + 18) && s.workday.snapshot.resources.technicalDebt === Math.min(100, before.debt + 14) && s.coding.snapshot.focus === Math.max(0, before.focus - .35) && s.workday.snapshot.isPaused && s.workday.snapshot.pauseReasons.join(',') === 'maintenance' && !s.interruptions.snapshot.active.some(x => x.id === 'production-errors'); })()`, equals: true }
    },
    { name: 'resume unrelated pause and prepare teammate event', action: 'eval', code: `const s = scene('Workstation'); s.workday.resume('maintenance'); s.coding.synchronizeAvailability(true, 100); s.coding.requestCoding(true); s.coding.update(4 * 60000, 100); window.__beforeTeammate = { time: s.workday.snapshot.elapsedGameMs, focus: s.coding.snapshot.focus, debt: s.workday.snapshot.resources.technicalDebt }; s.openDecision('teammate-help');` },
    { name: 'resolve teammate pairing choice', action: 'eval', code: `scene('Workstation').resolveChoice('pair-now');` },
    {
        name: 'teammate effects and all alert removals are visible', action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); const before = window.__beforeTeammate; const expectedTime = before.time + 30 * 60000; const expectedFocus = Math.max(0, before.focus - .25); return s.workday.snapshot.elapsedGameMs >= expectedTime && s.workday.snapshot.elapsedGameMs < expectedTime + 60000 && s.workday.snapshot.resources.technicalDebt === Math.max(0, before.debt - 8) && s.coding.snapshot.focus <= expectedFocus && s.coding.snapshot.focus > expectedFocus - .01 && s.interruptions.snapshot.active.length === 0 && s.alertsCountText.text.startsWith('0 ACTIVE') && s.clockText.text.length === 5; })()`, equals: true }
    },
    { name: 'restart during an open decision cleans its pause and handlers', action: 'eval', code: `const s = scene('Workstation'); game.scene.stop('Workstation'); game.scene.start('Workstation');` },
    { name: 'allow fresh scene render', action: 'wait', ms: 150 },
    { name: 'fresh lifecycle after shutdown', action: 'expect', expect: { expression: `(() => { const s = scene('Workstation'); return !s.workday.snapshot.isPaused && s.interruptions.snapshot.active.length === 0 && !s.decisionOverlay; })()`, equals: true } },
    { name: 'decision overlay desktop composition', action: 'eval', code: `const s=scene('Workstation');s.interruptions.activate('production-errors',s.workday.snapshot.elapsedGameMs);s.openDecision('production-errors');` },
    { name: 'desktop decision view', action: 'screenshot' }
];
