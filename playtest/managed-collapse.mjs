export default [
  {name:'dismiss first-run guidance',action:'press',key:'Enter'},
  {name:'workstation starts in a live run',action:'expect',expect:{expression:`scene('Workstation').session.lifecycle`,equals:'active'}},
  {name:'open a sticky without pausing time',action:'eval',code:`const s=scene('Workstation');s.interruptions.activate('production-errors',s.workday.snapshot.elapsedGameMs,1);s.openDecision('production-errors');window.__liveStart=s.workday.snapshot.elapsedGameMs;`},
  {name:'clock remains live while a decision is open',action:'wait',ms:1200,expect:{expression:`scene('Workstation').workday.snapshot.elapsedGameMs-window.__liveStart`,atLeast:100000}},
  {name:'create a visible sticky flood',action:'eval',code:`const s=scene('Workstation'),ids=['po-demo-request','po-priority-check','team-qa-finding','team-review-request','team-test-flake','production-latency','production-deploy','production-database','production-memory','production-certificate','tooling-github','tooling-ci'];ids.forEach((id,i)=>s.interruptions.activate(id,s.workday.snapshot.elapsedGameMs,i+2));`},
  {name:'flood exposes an actionable backlog',action:'expect',expect:{expression:`scene('Workstation').interruptions.snapshot.active.length>=8&&scene('Workstation').alertsCountText.text.includes('BACKLOG')`,equals:true}},
  {name:'managed-chaos-workstation',action:'screenshot'},
  {name:'force a deterministic collapse',action:'eval',code:`const s=scene('Workstation');s.workday.mutateResource('systemStability',-100);s.session.finalize('runtime outage test');s.enterResultsIfComplete();`},
  {name:'collapse opens the autopsy results',action:'waitFor',expression:`game.scene.isActive('Results')`,timeout:3000},
  {name:'autopsy has no victory score',action:'expect',expect:{expression:`scene('Results').result.autopsy.length===6&&!('total' in scene('Results').result)`,equals:true}},
  {name:'collapse-autopsy',action:'screenshot'}
];
