export default [
 {name:'minimum touch viewport begins active',action:'expect',expect:{expression:`game.scene.isActive('Workstation')`,equals:true}},
 {name:'reach results while input is held',action:'expect',expect:{expression:`(() => { const s=scene('Workstation'); s.beginCodingSource('pointer:99'); window.__completedSession=s.session; s.workday.spendGameMinutes(480); return true; })()`,equals:true}},
 {name:'show results',action:'wait',ms:150},
 {name:'result layout remains inside logical viewport',action:'expect',expect:{expression:`(() => { const s=scene('Results'); const texts=s.children.list.filter(x=>x.type==='Text'); const restart=s.restart.getBounds(); return texts.every(t=>t.getBounds().left>=0&&t.getBounds().right<=1280&&t.getBounds().top>=0&&t.getBounds().bottom<=720)&&restart.left>=0&&restart.right<=1280&&restart.bottom<=720; })()`,equals:true}},
 {name:'tap restart',action:'tap',x:195,y:192},
 {name:'fresh run appears',action:'wait',ms:150},
 {name:'held input did not leak',action:'expect',expect:{expression:`(() => { const s=scene('Workstation'); window.__freshSession=s.session; return s.session!==window.__completedSession&&s.input.enabled&&!s.coding.snapshot.isCodingRequested&&s.heldCodingSources.size===0; })()`,equals:true}},
 {name:'duplicate touch activation',action:'tap',x:195,y:192},
 {name:'duplicate activation creates no second session',action:'expect',expect:{expression:`scene('Workstation').session===window.__freshSession&&!game.scene.isActive('Results')`,equals:true}},
 {name:'touch-results-and-restart',action:'screenshot'}
];
