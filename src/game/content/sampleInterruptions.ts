import type { InterruptionDefinition } from '../domain/interruptions';
import { INTERRUPTION_CATALOG,PO_AND_TEAM_INTERRUPTION_PACK,PRODUCTION_INTERRUPTION } from './poTeamInterruptions';
const po=PO_AND_TEAM_INTERRUPTION_PACK.find(item=>item.id==='po-scope-request')!;
const teammateBase=PO_AND_TEAM_INTERRUPTION_PACK.find(item=>item.id==='teammate-help')!;
const teammate:InterruptionDefinition={...teammateBase,escalationStages:teammateBase.escalationStages?.map(stage=>({...stage,followUpIds:undefined}))};
const production:InterruptionDefinition={...PRODUCTION_INTERRUPTION,escalationStages:[{...PRODUCTION_INTERRUPTION.escalationStages![0]!,delayGameMs:20*60_000,postponeGameMs:10*60_000}],choices:PRODUCTION_INTERRUPTION.choices.map(item=>item.id==='hotfix'?{...item,effects:[...item.effects,{type:'delayed',id:'hotfix-regression',delayGameMs:30*60_000,scheduledFeedback:'Regression monitoring scheduled.',concludedFeedback:'Regression check concluded.',effects:[]}]}:item)};
export const SAMPLE_INTERRUPTIONS:readonly InterruptionDefinition[]=Object.freeze([{...po,escalationStages:[...po.escalationStages!,{delayGameMs:35*60_000,postponeGameMs:15*60_000,severity:'critical',copy:'The blocked release has escalated.',effects:[{type:'resource',resource:'poHappiness',amount:-8}],followUpIds:['teammate-help']}]},production,teammate]);
export { INTERRUPTION_CATALOG,PO_AND_TEAM_INTERRUPTION_PACK,PRODUCTION_INTERRUPTION };
