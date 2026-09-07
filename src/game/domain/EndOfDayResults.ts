import type {ResourceValues} from './DayState';
import type {IncidentControl,InterruptionCategory,ResultKarma} from './interruptions';
export const COLLAPSE_CAUSES=['stamina','firing','outage','health'] as const;
export type CollapseCause=typeof COLLAPSE_CAUSES[number];
export interface TerminalResolutionEvidence{readonly eventId:string;readonly choiceId:string;readonly category:InterruptionCategory;readonly incidentControl?:IncidentControl;readonly resultKarma?:ResultKarma}
export interface TerminalEvidence{readonly elapsedGameMs:number;readonly dayIndex:number;readonly dayElapsedGameMs:number;readonly resources:ResourceValues;readonly needs:Readonly<{sleepiness:number;toilet:number}>;readonly healthRisk:number;readonly collapseCauses:readonly CollapseCause[];readonly causalSource:string;readonly activeInterruptionIds:readonly string[];readonly resolvedCaseIds:readonly string[];readonly failedCaseIds:readonly string[];readonly resolutions:readonly TerminalResolutionEvidence[];readonly resolvedIncidentIds:readonly string[];readonly criticalNeedEpisodes:Readonly<Record<'sleepiness'|'toilet',number>>;readonly boosterCounts:Readonly<Record<'coffee'|'cokeZero',number>>}
export interface AutopsyLine{readonly label:string;readonly value:string}
export interface Ending{readonly id:string;readonly title:string;readonly narrative:string;readonly priority:number;readonly order:number}
export interface EvaluatedResult{readonly lifecycle:'results';readonly evidence:TerminalEvidence;readonly ending:Ending;readonly autopsy:readonly AutopsyLine[];readonly survivalLabel:string}
export interface EndingDefinition extends Ending{readonly matches:(evidence:TerminalEvidence)=>boolean}
const has=(e:TerminalEvidence,c:CollapseCause)=>e.collapseCauses.includes(c);
export const DEFAULT_ENDINGS:readonly EndingDefinition[]=Object.freeze([
 {id:'everything-is-fine',title:'Everything Is Fine',narrative:'You burned out, got fired, and took production with you.',priority:120,order:0,matches:(e:TerminalEvidence)=>e.collapseCauses.length>=3},
 {id:'fired-during-sev-one',title:'Fired During the SEV-1',narrative:'Access was revoked halfway through the rollback.',priority:115,order:1,matches:(e:TerminalEvidence)=>has(e,'firing')&&has(e,'outage')},
 {id:'cardiac-standup',title:'Cardiac Stand-up',narrative:'The coffee worked. Then it kept working.',priority:100,order:2,matches:(e:TerminalEvidence)=>has(e,'health')},
 {id:'debt-collector',title:'The Debt Collector',narrative:'Production invoiced every shortcut at once.',priority:90,order:3,matches:(e:TerminalEvidence)=>has(e,'outage')&&e.resources.technicalDebt>=50},
 {id:'case-overload',title:'Commitment Cascade',narrative:'Resolved work could not outrun the commitments left behind.',priority:80,order:4,matches:(e:TerminalEvidence)=>has(e,'firing')&&e.resolvedCaseIds.length>=3},
 {id:'total-outage',title:'Total Outage',narrative:'The dashboard achieved a consistent shade of red.',priority:70,order:5,matches:(e:TerminalEvidence)=>has(e,'outage')},
 {id:'removed-from-channel',title:'Removed From the Channel',narrative:'PO Happiness reached zero. Your permissions followed.',priority:60,order:6,matches:(e:TerminalEvidence)=>has(e,'firing')},
 {id:'burnout-as-a-service',title:'Burnout as a Service',narrative:'The systems survived. The engineer did not.',priority:0,order:7,matches:(e:TerminalEvidence)=>has(e,'stamina')}
]);
export function validateEndingDefinitions(defs:readonly EndingDefinition[]):readonly EndingDefinition[]{const ids=new Set<string>(),slots=new Set<string>();if(!defs.length)throw new TypeError('Ending definitions must not be empty.');for(const d of defs){const slot=`${d.priority}:${d.order}`;if(!d.id.trim()||ids.has(d.id)||!d.title.trim()||!d.narrative.trim()||!Number.isInteger(d.priority)||!Number.isInteger(d.order)||slots.has(slot)||typeof d.matches!=='function')throw new TypeError('Malformed or duplicate ending definition.');ids.add(d.id);slots.add(slot);}return defs;}
export function createTerminalEvidence(input:TerminalEvidence):TerminalEvidence{return Object.freeze({...input,resources:Object.freeze({...input.resources}),needs:Object.freeze({...input.needs}),collapseCauses:Object.freeze([...input.collapseCauses]),activeInterruptionIds:Object.freeze([...input.activeInterruptionIds]),resolvedCaseIds:Object.freeze([...input.resolvedCaseIds]),failedCaseIds:Object.freeze([...input.failedCaseIds]),resolutions:Object.freeze(input.resolutions.map(r=>Object.freeze({...r}))),resolvedIncidentIds:Object.freeze([...input.resolvedIncidentIds]),criticalNeedEpisodes:Object.freeze({...input.criticalNeedEpisodes}),boosterCounts:Object.freeze({...input.boosterCounts})});}
export function evaluateTerminalEvidence(input:TerminalEvidence,endings=DEFAULT_ENDINGS):EvaluatedResult{
 validateEndingDefinitions(endings);const evidence=createTerminalEvidence(input);if(!evidence.collapseCauses.length)throw new Error('Terminal evidence requires a collapse cause.');const ending=[...endings].sort((a,b)=>b.priority-a.priority||a.order-b.order).find(d=>d.matches(evidence));if(!ending)throw new Error('No ending matched terminal evidence.');const minutes=Math.floor(evidence.dayElapsedGameMs/60_000),clock=`${String(9+Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`,karma=evidence.resolutions.reduce((n,r)=>n+(r.resultKarma==='constructive'?1:r.resultKarma==='self-serving'?-1:0),0);
 const autopsy:readonly AutopsyLine[]=Object.freeze([
  {label:'Collapse',value:evidence.collapseCauses.join(' + ')},
  {label:'Final state',value:`Stamina ${Math.round(evidence.resources.stamina)} · PO ${Math.round(evidence.resources.poHappiness)} · Stability ${Math.round(evidence.resources.systemStability)}`},
  {label:'Cases handled',value:`${evidence.resolvedCaseIds.length} resolved · ${evidence.failedCaseIds.length} commitments failed · ${evidence.resolvedIncidentIds.length} incidents`},
  {label:'Damage carried',value:`${Math.round(evidence.resources.technicalDebt)} debt · ${evidence.activeInterruptionIds.length} unresolved stickies`},
  {label:'Human cost',value:`Coffee ${evidence.boosterCounts.coffee} · Coke Zero ${evidence.boosterCounts.cokeZero} · Karma ${karma>=0?'+':''}${karma}`},
  {label:'Last straw',value:evidence.causalSource}
 ].map(line=>Object.freeze(line)));
 return Object.freeze({lifecycle:'results',evidence,ending:Object.freeze({id:ending.id,title:ending.title,narrative:ending.narrative,priority:ending.priority,order:ending.order}),autopsy,survivalLabel:`Day ${evidence.dayIndex} · ${clock}`});
}
