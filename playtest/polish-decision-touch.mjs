export default [
 {name:'open representative four-choice incident',action:'eval',code:`const s=scene('Workstation');s.interruptions.activate('production-errors',s.workday.snapshot.elapsedGameMs);s.openDecision('production-errors');`},
 {name:'decision hierarchy fits minimum touch viewport',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation'),canvas=document.querySelector('canvas').getBoundingClientRect(),objects=s.decisionOverlay.getAll(),texts=objects.filter(x=>x.type==='Text');return canvas.width<=innerWidth&&canvas.height<=innerHeight&&s.interruptions.snapshot.openInterruption.choices.length===4&&texts.every(t=>{const b=t.getBounds();return b.left>=0&&b.right<=1280&&b.top>=0&&b.bottom<=720;});})()`,equals:true}},
 {name:'tap first response',action:'tap',x:195,y:95},
 {name:'touch resolves exactly once and restores controls',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation');return !s.decisionOverlay&&!s.interruptions.snapshot.openInterruption&&s.interruptions.snapshot.resolvedIds.filter(id=>id==='production-errors').length===1&&s.codingActionBackground.input.enabled;})()`,equals:true}},
 {name:'touch-decision-polish',action:'screenshot'}
];
