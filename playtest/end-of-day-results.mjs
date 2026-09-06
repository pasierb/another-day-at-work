export default [
 {name:'workstation starts near 09:00',action:'expect',expect:{expression:`game.scene.isActive('Workstation') && game.scene.getScene('Workstation').workday.snapshot.elapsedGameMs < 180000`,equals:true}},
 {name:'passive terminal boundary',action:'expect',expect:{expression:`(() => { const s=game.scene.getScene('Workstation'); s.workday.spendGameMinutes(480); return true; })()`,equals:true}},
 {name:'results replaces gameplay once',action:'wait',ms:150},
 {name:'results is the only active run view',action:'expect',expect:{expression:`game.scene.isActive('Results') && !game.scene.isActive('Workstation')`,equals:true}},
 {name:'complete result explanation rendered',action:'expect',expect:{expression:`game.scene.getScene('Results').children.list.filter(x=>x.type==='Text').map(x=>x.text).join('|').includes('TERMINAL CATASTROPHES') && game.scene.getScene('Results').children.list.filter(x=>x.type==='Text').map(x=>x.text).join('|').includes('START A FRESH DAY')`,equals:true}},
 {name:'results stable with no gameplay scene',action:'wait',ms:500},
 {name:'restart',action:'click',x:640,y:630},
 {name:'fresh 09:00 session',action:'wait',ms:150},
 {name:'fresh run isolated and idle',action:'expect',expect:{expression:`game.scene.isActive('Workstation') && !game.scene.isActive('Results') && game.scene.getScene('Workstation').workday.snapshot.elapsedGameMs < 120000 && !game.scene.getScene('Workstation').coding.snapshot.isCodingRequested`,equals:true}},
 {name:'action reaches terminal after declared effects',action:'expect',expect:{expression:`(() => { const s=game.scene.getScene('Workstation'); s.workday.spendGameMinutes(479); s.interruptions.activate('production-errors',s.workday.snapshot.elapsedGameMs); s.interruptions.open('production-errors'); s.workday.pause('interruption-decision'); s.resolveChoice('rollback'); return true; })()`,equals:true}},
 {name:'action-boundary results',action:'wait',ms:150},
 {name:'terminal action evidence matches applied effects',action:'expect',expect:{expression:`(() => { const r=game.scene.getScene('Results').result; return r.evidence.resolvedIncidentIds.includes('production-errors')&&r.scoreLines.find(x=>x.id==='stability').evidence===Math.round(r.evidence.resources.systemStability)+'/100'; })()`,equals:true}},
 {name:'held keyboard behind results',action:'press',key:'Space'},
 {name:'keyboard restart',action:'press',key:'Enter'},
 {name:'keyboard fresh run',action:'wait',ms:150},
 {name:'keyboard does not leak held coding',action:'expect',expect:{expression:`game.scene.isActive('Workstation')&&!game.scene.getScene('Workstation').coding.snapshot.isCodingRequested`,equals:true}},
 {name:'fresh-run',action:'screenshot'}
];
