export default [
 {name:'prepare',action:'eval',code:`const s=scene('Workstation');s.workday.spendGameMinutes(80);s.synchronizeInterruptions();window.__d=s.interruptions.snapshot.active.find(x=>x.id==='teammate-help').nextEscalationGameMs;`},
 {name:'click postpone',action:'click',x:1042,y:558},
 {name:'postponed',action:'expect',expect:{expression:`scene('Workstation').interruptions.snapshot.active.find(x=>x.id==='teammate-help').nextEscalationGameMs-window.__d`,equals:1500000}}
];
