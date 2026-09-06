export default [
 {name:'calm presentation and labeled audio control',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation');return s.stressText.text.includes('CALM')&&s.muteText.text.includes('SOUND')&&s.decor.depth<s.taskRows.parentContainer.depth;})()`,equals:true}},
 {name:'maximum stress is deterministic and decor remains noninteractive',action:'eval',code:`const s=scene('Workstation');s.workday.spendGameMinutes(360);s.workday.mutateResource('technicalDebt',100);for(const id of ['production-errors','production-database','production-memory','production-latency'])s.interruptions.activate(id,s.workday.snapshot.elapsedGameMs);s.renderPresentation();`},
 {name:'critical decor uses fixed safe noninteractive slots',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation');return s.stressText.text.includes('CRITICAL')&&s.decor.list.length===13&&s.decor.list.slice(1).every(x=>!x.input)&&s.decor.depth<10;})()`,equals:true}},
 {name:'coding pointer works through decor',action:'drag',from:{x:600,y:440},to:{x:610,y:440},steps:2,hold:300},
 {name:'coding released and progressed',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation');return s.taskQueue.snapshot.selectedTask.progress>0&&!s.coding.snapshot.isCodingRequested;})()`,equals:true}},
 {name:'mute immediately labels and stops audio',action:'click',x:1200,y:698},
 {name:'mute state toggles immediately and is stored',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation'),stored=JSON.parse(localStorage.getItem('another-day-at-work:audio:v1')).muted;return s.muteText.text.includes(stored?'MUTED':'SOUND ON')&&s.sound.getAllPlaying().length===0;})()`,equals:true}},
 {name:'transition to results',action:'eval',code:`scene('Workstation').workday.spendGameMinutes(480);`},
 {name:'results preserves mute and complete explanation',action:'wait',ms:150},
 {name:'results presentation and mute synchronized',action:'expect',expect:{expression:`(()=>{const s=scene('Results'),text=s.children.list.filter(x=>x.type==='Text').map(x=>x.text).join('|'),stored=JSON.parse(localStorage.getItem('another-day-at-work:audio:v1')).muted;return s.muteText.text.includes(stored?'MUTED':'SOUND ON')&&text.includes('TERMINAL CATASTROPHES')&&text.includes('START A FRESH DAY');})()`,equals:true}},
 {name:'restart cleanly',action:'click',x:640,y:630},
 {name:'fresh run keeps mute with no lingering voices',action:'wait',ms:160},
 {name:'fresh lifecycle is isolated',action:'expect',expect:{expression:`(()=>{const s=scene('Workstation'),stored=JSON.parse(localStorage.getItem('another-day-at-work:audio:v1')).muted;return s.muteText.text.includes(stored?'MUTED':'SOUND ON')&&s.sound.getAllPlaying().length===0&&!s.coding.snapshot.isCodingRequested;})()`,equals:true}},
 {name:'polished-workday',action:'screenshot'}
];
