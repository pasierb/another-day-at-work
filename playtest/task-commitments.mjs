export default [
 {name:'commitment is visible and dormant crises are hidden',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation'),snap=s.taskQueue.snapshot,login=snap.tasks.find(x=>x.id==='BUG-4821');return login.status==='active'&&login.stakeholder==='Product Owner'&&login.deadlineGameMs===90*60_000&&snap.tasks.filter(x=>x.initialStatus==='dormant'&&x.status==='dormant').length===2&&s.taskRows.getAll().filter(x=>x.text&&/INC-LOGIN|INC-SEARCH/.test(x.text)).length===0;})()`,equals:true}},
 {name:'dismiss first-run guidance',action:'press',key:'Enter'},
 {name:'approaching deadline is urgent',action:'eval',code:`const s=scene('Workstation');s.session.advanceGameMs(61*60_000);s.renderTaskQueue(s.taskQueue.snapshot);`},
 {name:'countdown and urgent presentation update',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation'),login=s.taskQueue.snapshot.tasks.find(x=>x.id==='BUG-4821'),texts=s.taskRows.getAll().map(x=>x.text||'').join('|');return login.remainingGameMs>0&&login.remainingGameMs<=30*60_000&&/· \\d+m/.test(texts)&&texts.includes('URGENT');})()`,equals:true}},
 {name:'cross deadline',action:'eval',code:`const s=scene('Workstation');s.session.advanceGameMs(30*60_000);s.renderTaskQueue(s.taskQueue.snapshot);`},
 {name:'failure and crisis activation are visible',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation'),snap=s.taskQueue.snapshot,texts=s.taskRows.getAll().map(x=>x.text||'').join('|');return snap.tasks.find(x=>x.id==='BUG-4821').status==='failed'&&snap.tasks.find(x=>x.id==='INC-LOGIN').status==='active'&&texts.includes('FAILED')&&texts.includes('Contain login incident');})()`,equals:true}},
 {name:'commitment crisis view',action:'screenshot'}
];
