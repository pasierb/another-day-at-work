export default [
 {name:'largest mixed alert set renders',action:'eval',code:`const s=scene('Workstation');s.scheduler.nextSpawnGameMs=null;s.playerNeeds.mutateNeed('sleepiness',100);for(const [id,n] of [['personal-sleep-warning',1],['production-errors',2],['tooling-github',3]])s.interruptions.activate(id,s.workday.snapshot.elapsedGameMs,n);`},
 {name:'three mixed alerts fit and expose touch targets',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation');return s.interruptions.snapshot.active.length===3&&s.alertsContent.getAll().filter(x=>x.input?.enabled).length>=9;})()`,equals:true}},
 {name:'mixed-alert-touch',action:'screenshot'},
 {name:'open first mixed alert for touch decision',action:'eval',code:`scene('Workstation').openDecision('personal-sleep-warning');`},
 {name:'touch opens a decision',action:'expect',expect:{expression:`scene('Workstation').interruptions.snapshot.openInterruption!==null`,equals:true}},
 {name:'tap first decision choice',action:'tap',x:150,y:85},
 {name:'touch choice resolves exactly once',action:'expect',expect:{expression:`scene('Workstation').interruptions.snapshot.resolvedOutcomes.length===1`,equals:true}},
 {name:'cooldown and equivalent dedup survive touch flow',action:'eval',code:`const s=scene('Workstation');s.interruptions.reset();s.interruptions.activate('personal-sleep-warning',10,1);const duplicate=s.interruptions.activate('personal-sleep-warning',10,2);s.interruptions.open('personal-sleep-warning');s.interruptions.beginResolution('take-microbreak');s.interruptions.setCurrentGameMs(10);s.interruptions.finalizeResolution('personal-sleep-warning');const deadline=s.interruptions.snapshot.cooldownUntilGameMs['need-sleepiness'];window.__cooldown={duplicate,before:s.interruptions.activate('personal-sleep-warning',deadline-1),after:s.interruptions.activate('personal-sleep-warning',deadline)};`},
 {name:'equivalent active warning is blocked until authoritative expiry',action:'expect',expect:{expression:`!window.__cooldown.duplicate&&!window.__cooldown.before&&window.__cooldown.after`,equals:true}}
];
