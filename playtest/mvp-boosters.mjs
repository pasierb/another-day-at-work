export default [
    {
        name: 'all three quick actions are distinct, readable, and non-overlapping', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); const c=s.boosterActions.coffee.background.getBounds(); const z=s.boosterActions.cokeZero.background.getBounds(); const t=s.toiletAction.background.getBounds(); return c.right<z.left&&z.right<t.left&&c.left>=298&&t.right<=966&&s.boosterActions.coffee.root.alpha===1; })()`, equals: true }
    },
    { name: 'activate Coffee once by pointer', action: 'click', x: 369, y: 676 },
    {
        name: 'Coffee applies exact bounded recovery, count, feedback, and cooldown once', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); return s.workday.snapshot.resources.stamina===100&&s.boosters.snapshot.consumptionCounts.coffee===1&&s.boosterFeedbackText.text.includes('Nice.')&&s.boosters.snapshot.availability.coffee.reason==='full-stamina'; })()`, equals: true }
    },
    {
        name: 'prepare second Coffee after authoritative cooldown', action: 'eval',
        code: `const s=scene('Workstation'); s.workday.mutateResource('stamina',-50); s.workday.spendGameMinutes(30); s.synchronizeWorld();`
    },
    { name: 'activate second Coffee', action: 'click', x: 369, y: 676 },
    {
        name: 'Coffee feedback escalates', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); return s.workday.snapshot.resources.stamina===80&&s.boosters.snapshot.consumptionCounts.coffee===2&&s.boosterFeedbackText.text.includes('Productivity.'); })()`, equals: true }
    },
    {
        name: 'remember Coke Zero starting values', action: 'eval',
        code: `const s=scene('Workstation'); s.workday.pause('booster-playtest'); s.workday.mutateResource('stamina',-40); window.__cokeStart={stamina:s.workday.snapshot.resources.stamina,toilet:s.playerNeeds.snapshot.toilet.value};`
    },
    { name: 'activate Coke Zero once by pointer', action: 'click', x: 501, y: 676 },
    {
        name: 'Coke Zero applies exact Stamina and Toilet Need effects once', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); return s.workday.snapshot.resources.stamina===window.__cokeStart.stamina+15&&s.playerNeeds.snapshot.toilet.value===window.__cokeStart.toilet+12&&s.boosters.snapshot.consumptionCounts.cokeZero===1; })()`, equals: true }
    },
    {
        name: 'paused workday freezes Coffee cooldown', action: 'eval',
        code: `const s=scene('Workstation'); s.workday.pause('booster-playtest'); s.updateBoosterAvailability(); window.__coffeeRemaining=s.boosters.snapshot.availability.coffee.remainingCooldownGameMs;`
    },
    { name: 'wall time passes while paused', action: 'wait', ms: 500 },
    {
        name: 'Coffee cooldown remains unchanged while paused', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); s.updateBoosterAvailability(); return s.boosters.snapshot.availability.coffee.remainingCooldownGameMs===window.__coffeeRemaining; })()`, equals: true }
    },
    {
        name: 'full bounds clamp Coke Zero effects after cooldown', action: 'eval',
        code: `const s=scene('Workstation'); s.workday.resume('booster-playtest'); s.workday.spendGameMinutes(20); s.synchronizeWorld(); s.workday.mutateResource('stamina',99-s.workday.snapshot.resources.stamina); s.playerNeeds.mutateNeed('toilet',1000); s.updateBoosterAvailability();`
    },
    { name: 'lower Stamina just enough to enable bounded activation', action: 'eval', code: `scene('Workstation').workday.mutateResource('stamina',-1);` },
    { name: 'activate bounded Coke Zero', action: 'click', x: 501, y: 676 },
    {
        name: 'Coke Zero cannot exceed resource bounds', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); return s.workday.snapshot.resources.stamina===100&&s.playerNeeds.snapshot.toilet.value===100&&s.boosters.snapshot.consumptionCounts.cokeZero===2; })()`, equals: true }
    },
    {
        name: 'decision state blocks both boosters with a visible reason', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); s.workday.mutateResource('stamina',-30); s.interruptions.activate('po-scope-request',s.workday.snapshot.elapsedGameMs,999); s.interruptions.open('po-scope-request'); s.updateBoosterAvailability(); const before={...s.boosters.snapshot.consumptionCounts}; s.activateBooster('coffee'); return s.boosters.snapshot.availability.coffee.reason==='decision-open'&&s.boosterActions.coffee.root.alpha<1&&JSON.stringify(before)===JSON.stringify(s.boosters.snapshot.consumptionCounts); })()`, equals: true }
    },
    { name: 'restart creates a fresh booster run', action: 'eval', code: `scene('Workstation').scene.restart();` },
    { name: 'wait for clean restart', action: 'wait', ms: 300 },
    {
        name: 'restart clears counts, cooldowns, feedback, and armed controls', action: 'expect',
        expect: { expression: `(() => { const s=scene('Workstation'); return s.boosters.snapshot.consumptionCounts.coffee===0&&s.boosters.snapshot.consumptionCounts.cokeZero===0&&s.boosters.snapshot.cooldownUntilGameMs.coffee===0&&s.boosterFeedbackText.text===''&&!!s.boosterActions.coffee.background.input; })()`, equals: true }
    },
    { name: 'mvp-boosters', action: 'screenshot' }
];
