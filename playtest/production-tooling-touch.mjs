export default [
 {name:'open largest production decision',action:'eval',code:`const s=scene('Workstation');s.scheduler.nextSpawnGameMs=null;s.interruptions.activate('production-errors',0,1);s.openDecision('production-errors');`},
 {name:'touch target is visible',action:'expect',expect:{expression:`scene('Workstation').decisionOverlay.getAll().filter(x=>x.input?.enabled).length>=4`,equals:true}},
 {name:'tap rollback',action:'tap',x:150,y:85},
 {name:'touch resolves the intended choice',action:'expect',expect:{expression:`scene('Workstation').interruptions.snapshot.resolvedOutcomes.at(-1)?.choiceId`,equals:'rollback'}},
 {name:'open tooling decision amid active alerts',action:'eval',code:`const s=scene('Workstation');s.interruptions.activate('tooling-github',s.workday.snapshot.elapsedGameMs,2);s.interruptions.activate('tooling-ai',s.workday.snapshot.elapsedGameMs,3);s.openDecision('tooling-github');`},
 {name:'tap wait',action:'tap',x:150,y:85},
 {name:'touch tooling choice activates visible block',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation');return s.interruptions.snapshot.resolvedOutcomes.at(-1)?.choiceId==='github-wait'&&s.codingActionDetail.text.includes('GitHub outage');})()`,equals:true}},
 {name:'minimum touch viewport',action:'screenshot'}
];
