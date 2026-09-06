export default [
    {
        name: 'need indicators and Toilet action are visible and enabled',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); return s.needViews.sleepiness.label.text.includes('Slightly tired') && s.needViews.toilet.label.text.includes('Could probably wait') && !!s.toiletAction.background.input; })()`, equals: true }
    },
    {
        name: 'pause freezes passive needs',
        action: 'eval',
        code: `const s = scene('Workstation'); s.workday.pause('playtest'); window.__needsPausedAt = s.playerNeeds.snapshot.elapsedGameMs;`
    },
    { name: 'real time passes while paused', action: 'wait', ms: 600 },
    {
        name: 'paused needs remain synchronized to unchanged game time',
        action: 'expect',
        expect: { expression: `scene('Workstation').playerNeeds.snapshot.elapsedGameMs === window.__needsPausedAt`, equals: true }
    },
    {
        name: 'large action-time jump crosses stages and applies penalties',
        action: 'eval',
        code: `const s = scene('Workstation'); s.coding.focus = 1; s.workday.spendGameMinutes(450); s.synchronizeWorld(); window.__afterCritical = { elapsed: s.workday.snapshot.elapsedGameMs, stamina: s.workday.snapshot.resources.stamina, focus: s.coding.snapshot.focus };`
    },
    {
        name: 'critical need state is visible and coding is penalized',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); return s.playerNeeds.snapshot.toilet.stage.id === 'sev-1' && s.playerNeeds.snapshot.sleepiness.stage.id === 'microsleep' && s.playerNeeds.snapshot.codingSpeedModifier < 1 && s.needViews.toilet.label.text.includes('Biological SEV-1') && s.coding.snapshot.modifiers.codingSpeed === s.playerNeeds.snapshot.codingSpeedModifier; })()`, equals: true }
    },
    {
        name: 'duplicate synchronization does not repeat critical consequences',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); s.synchronizeWorld(); return s.workday.snapshot.elapsedGameMs === window.__afterCritical.elapsed && s.workday.snapshot.resources.stamina === window.__afterCritical.stamina && s.coding.snapshot.focus === window.__afterCritical.focus; })()`, equals: true }
    },
    { name: 'critical-needs-visible', action: 'screenshot' },
    { name: 'activate Toilet with pointer', action: 'click', x: 633, y: 675 },
    {
        name: 'bathroom costs time, crosses Sleepiness critical, and relieves Toilet Need',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); return s.workday.snapshot.elapsedGameMs === window.__afterCritical.elapsed + 18 * 60000 && s.playerNeeds.snapshot.sleepiness.stage.id === 'fell-asleep' && s.playerNeeds.snapshot.toilet.value === s.playerNeeds.config.needs.toilet.relievedValue && s.playerNeeds.snapshot.toilet.stage.id === 'could-wait' && s.needViews.toilet.label.text.includes('Could probably wait'); })()`, equals: true }
    },
    {
        name: 'Toilet action is disabled by a blocking decision state',
        action: 'expect',
        expect: { expression: `(() => { const s = scene('Workstation'); s.workday.resume('playtest'); s.synchronizeWorld(); s.interruptions.open(s.interruptions.snapshot.active[0].id); s.updateToiletAvailability(); const before = s.workday.snapshot.elapsedGameMs; s.visitBathroom(); return !s.isToiletAvailable() && s.toiletAction.root.alpha < 1 && s.workday.snapshot.elapsedGameMs === before; })()`, equals: true }
    },
    { name: 'bathroom-relief', action: 'screenshot' }
];
