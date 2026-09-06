export default [
    {
        name: 'fresh coding presentation is available',
        action: 'expect',
        expect: {
            expression: `(() => { const s = scene('Workstation'); return s.coding.snapshot.task.progress === 0 && s.coding.snapshot.focusMultiplier === 1 && s.coding.snapshot.isAvailable && s.codingActionLabel.text === 'HOLD TO CODE' && s.codingProgressText.text === '0.0%'; })()`,
            equals: true
        }
    },
    { name: 'remember pointer start', action: 'eval', code: `window.__codingStart = scene('Workstation').coding.snapshot.task.progress;` },
    { name: 'hold coding control with pointer', action: 'drag', from: { x: 600, y: 440 }, to: { x: 620, y: 440 }, steps: 2, hold: 700 },
    {
        name: 'pointer hold progresses and releases cleanly',
        action: 'expect',
        expect: { expression: `scene('Workstation').coding.snapshot.task.progress > window.__codingStart && !scene('Workstation').coding.snapshot.isCodingRequested`, equals: true }
    },
    { name: 'remember released progress', action: 'eval', code: `window.__releasedProgress = scene('Workstation').coding.snapshot.task.progress;` },
    { name: 'released coding remains stopped', action: 'wait', ms: 350 },
    { name: 'check released progress precisely', action: 'expect', expect: { expression: `scene('Workstation').coding.snapshot.task.progress === window.__releasedProgress`, equals: true } },
    { name: 'hold Space to code', action: 'key', key: 'Space', duration: 650 },
    { name: 'keyboard also progresses and releases', action: 'expect', expect: { expression: `scene('Workstation').coding.snapshot.task.progress > window.__releasedProgress && !scene('Workstation').coding.snapshot.isCodingRequested`, equals: true } },
    {
        name: 'mixed sources release independently',
        action: 'expect',
        expect: {
            expression: `(() => { const s = scene('Workstation'); s.beginCodingSource('pointer:91'); s.beginCodingSource('keyboard:Space'); s.endCodingSource('pointer:91'); const continued = s.coding.snapshot.isCoding; s.endCodingSource('keyboard:Space'); return continued && !s.coding.snapshot.isCodingRequested; })()`,
            equals: true
        }
    },
    {
        name: 'pointer cancellation clears only pointer holds',
        action: 'expect',
        expect: {
            expression: `(() => { const s = scene('Workstation'); s.beginCodingSource('pointer:92'); s.input.emit('gameout'); return s.heldCodingSources.size === 0 && !s.coding.snapshot.isCodingRequested; })()`,
            equals: true
        }
    },
    {
        name: 'browser blur clears all held sources',
        action: 'expect',
        expect: {
            expression: `(() => { const s = scene('Workstation'); s.beginCodingSource('pointer:93'); s.beginCodingSource('keyboard:Space'); game.events.emit('blur'); return s.heldCodingSources.size === 0 && !s.coding.snapshot.isCodingRequested; })()`,
            equals: true
        }
    },
    {
        name: 'restart while held cleans up old session',
        action: 'eval',
        code: `const s = scene('Workstation'); s.beginCodingSource('keyboard:Space'); window.__oldCoding = s.coding; game.scene.stop('Workstation'); game.scene.start('Workstation');`
    },
    { name: 'allow restarted workstation to render', action: 'wait', ms: 150 },
    {
        name: 'restarted workstation owns a fresh released session',
        action: 'expect',
        expect: { expression: `scene('Workstation').coding !== window.__oldCoding && !window.__oldCoding.snapshot.isCodingRequested && scene('Workstation').coding.snapshot.task.progress === 0`, equals: true }
    },
    {
        name: 'pause disables coding and clears a physical hold',
        action: 'eval',
        code: `const s = scene('Workstation'); s.beginCodingSource('keyboard:Space'); s.workday.pause('playtest');`
    },
    { name: 'allow paused state to render', action: 'wait', ms: 100 },
    {
        name: 'paused workday has disabled feedback',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); return !s.coding.snapshot.isAvailable && !s.coding.snapshot.isCodingRequested && s.codingActionLabel.text === 'CODING UNAVAILABLE' && s.codingActionDetail.text === 'Workday paused'; })()`, equals: true }
    },
    { name: 'resume without new press', action: 'eval', code: `scene('Workstation').workday.resume('playtest');` },
    { name: 'allow resumed state to render', action: 'wait', ms: 100 },
    { name: 'held key does not silently restart', action: 'expect', expect: { expression: `scene('Workstation').coding.snapshot.isAvailable && !scene('Workstation').coding.snapshot.isCodingRequested`, equals: true } },
    {
        name: 'exhaust Stamina at the coding boundary',
        action: 'eval',
        code: `const s = scene('Workstation'); s.workday.mutateResource('stamina', -(s.workday.snapshot.resources.stamina - 0.01)); s.beginCodingSource('keyboard:Space');`
    },
    { name: 'consume remaining Stamina', action: 'wait', ms: 250 },
    { name: 'exhaustion disables and releases coding', action: 'expect', expect: { expression: `(() => { const s = scene('Workstation'); return s.workday.snapshot.resources.stamina === 0 && !s.coding.snapshot.isAvailable && !s.coding.snapshot.isCodingRequested && s.codingActionDetail.text === 'Stamina exhausted'; })()`, equals: true } },
    {
        name: 'prepare exact completion boundary',
        action: 'eval',
        code: `const s = scene('Workstation'); s.workday.mutateResource('stamina', 100); s.coding.progress = 99.99;`
    },
    { name: 'allow restored availability', action: 'wait', ms: 100 },
    { name: 'finish task once with pointer', action: 'drag', from: { x: 600, y: 440 }, to: { x: 620, y: 440 }, steps: 2, hold: 300 },
    { name: 'completion clamps and disables', action: 'expect', expect: { expression: `(() => { const s = scene('Workstation'); return s.coding.snapshot.task.progress === 100 && s.coding.snapshot.completionCount === 1 && !s.coding.snapshot.isCodingRequested && s.codingActionDetail.text === 'Task complete'; })()`, equals: true } },
    { name: 'completed task cannot progress again', action: 'key', key: 'Space', duration: 250 },
    { name: 'completion remains exact once', action: 'expect', expect: { expression: `scene('Workstation').coding.snapshot.task.progress === 100 && scene('Workstation').coding.snapshot.completionCount === 1`, equals: true } },
    { name: 'hold-to-code-complete', action: 'screenshot' }
];
