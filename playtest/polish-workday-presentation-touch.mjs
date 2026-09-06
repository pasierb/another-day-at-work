export default [
 {name:'essential regions and mute fit fixed minimum touch canvas',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation'),m=s.muteText.getBounds(),c=s.codingActionBackground.getBounds();return m.right<=1280&&m.bottom<=720&&c.left>=314&&c.right<=950&&s.codingActionBackground.input.enabled;})()`,equals:true}},
 {name:'touch coding remains operable',action:'drag',from:{x:200,y:140},to:{x:205,y:140},steps:2,hold:350},
 {name:'touch coding creates progress',action:'expect',expect:{expression:`scene('Workstation').taskQueue.snapshot.selectedTask.progress>0`,equals:true}},
 {name:'maximum clutter touch screenshot',action:'eval',code:`const s=scene('Workstation');s.workday.mutateResource('technicalDebt',100);s.interruptions.activate('production-errors',s.workday.snapshot.elapsedGameMs);s.interruptions.activate('production-database',s.workday.snapshot.elapsedGameMs);s.renderPresentation();`},
 {name:'decor cannot intercept touch',action:'expect',expect:{expression:`scene('Workstation').decor.list.slice(1).every(x=>!x.input)&&scene('Workstation').decisionOverlay===undefined`,equals:true}},
 {name:'touch-maximum-stress',action:'screenshot'}
];
