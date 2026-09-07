import type {Effect} from '../domain/effects';
import {validateInterruptionCatalog,type InterruptionChoiceDefinition,type InterruptionDefinition} from '../domain/interruptions';

const m=(minutes:number)=>minutes*60_000;
const choice=(id:string,label:string,description:string,gameMinutes:number,effects:readonly Effect[],extra:Partial<InterruptionChoiceDefinition>={}):InterruptionChoiceDefinition=>Object.freeze({id,label,description,gameMinutes,effects:Object.freeze([...effects]),...extra});
const escalation=(copy:string,effects:readonly Effect[]=[])=>Object.freeze([{delayGameMs:m(35),postponeGameMs:m(12),severity:'high' as const,copy,effects,followUpIds:Object.freeze([])}]);
const casePair=(caseId:string,id:string,title:string,copy:string,category:InterruptionDefinition['category'],effects:readonly Effect[],delay=25):readonly InterruptionDefinition[]=>{
 const followId=`${id}-follow-up`,karma=category==='teammate'?{resultKarma:'constructive' as const}:{};
 return Object.freeze([
  Object.freeze({id,caseId,category,severity:'medium' as const,title,copy,baseWeight:1,eligibility:{type:'case-status' as const,caseId,status:'open' as const},incidentControl:category==='production'||category==='tooling'?'player-fixable' as const:undefined,escalationStages:escalation(`${copy} The thread is now escalating.`,[{type:'resource',resource:category==='production'||category==='tooling'?'systemStability':'poHappiness',amount:-6}]),choices:Object.freeze([
   choice(`${id}-commit`,'TAKE OWNERSHIP',`Spend 12 min and follow through in ${delay} min.`,12,effects,{...karma,followUps:[{eventId:followId,delayGameMs:m(delay)}]}),
   choice(`${id}-triage`,'SET A BOUNDARY',`Spend 5 min; the case returns with more pressure.`,5,[{type:'resource',resource:'stamina',amount:-4}],{...karma,followUps:[{eventId:followId,delayGameMs:m(delay+15)}]})
  ])}),
  Object.freeze({id:followId,caseId,category,severity:'high' as const,title:`${title} · FOLLOW-UP`,copy:'The commitment is due. Close it cleanly or let it fail.',baseWeight:0,incidentControl:category==='production'||category==='tooling'?'player-fixable' as const:undefined,choices:Object.freeze([
   choice(`${id}-finish`,'FINISH THE CASE','Spend the time and close the loop.',18,[...effects,{type:'resource',resource:'stamina',amount:-5}],{...karma,caseOutcome:'resolved'}),
   choice(`${id}-fail`,'DROP THE COMMITMENT','Save time now; absorb the fallout.',1,[{type:'resource',resource:'poHappiness',amount:-18},{type:'resource',resource:'technicalDebt',amount:6},...((category==='production'||category==='tooling')?[{type:'resource' as const,resource:'systemStability' as const,amount:-22}]:[])],{...karma,caseOutcome:'failed'})
  ])})
 ]);
};

export const ENGINEERING_CASE_IDS=Object.freeze(['login-error','search-improvement','auth-refactor','payment-retries','build-tooling'] as const);
export const ENGINEERING_CASES:readonly InterruptionDefinition[]=Object.freeze([
 ...casePair('login-error','case-login','CUSTOMERS CANNOT LOG IN','Authentication failures are climbing.','production',[{type:'resource',resource:'systemStability',amount:10},{type:'resource',resource:'poHappiness',amount:5}],20),
 ...casePair('search-improvement','case-search','“ONE SMALL SEARCH CHANGE?”','Maya · Product Owner: Can we add customer tier before the demo?','product-owner',[{type:'resource',resource:'poHappiness',amount:9},{type:'resource',resource:'technicalDebt',amount:3}],30),
 ...casePair('auth-refactor','case-auth','AUTH SERVICE CLEANUP','Brittle authentication internals need a decision.','tooling',[{type:'resource',resource:'technicalDebt',amount:-10},{type:'resource',resource:'systemStability',amount:5}],35),
 ...casePair('payment-retries','case-payments','“CAN YOU HELP WITH RETRIES?”','Leo · QA: I found duplicate charges in the retry edge case.','teammate',[{type:'resource',resource:'systemStability',amount:9}],25),
 ...casePair('build-tooling','case-build','BUILD TOOLING UPGRADE','The pipeline upgrade is becoming unavoidable.','tooling',[{type:'resource',resource:'technicalDebt',amount:-5},{type:'resource',resource:'poHappiness',amount:4}],40)
]);

export const NEED_STICKIES:readonly InterruptionDefinition[]=Object.freeze([
 Object.freeze({id:'need-bathroom',category:'personal',severity:'high',title:'BIOLOGICAL PRIORITY',copy:'Toilet Need has crossed the sensible threshold.',baseWeight:0,deduplicationKey:'need-bathroom',cooldownGameMs:m(20),eligibility:{type:'need-stage' as const,need:'toilet' as const,minimumStage:2},choices:Object.freeze([
  choice('bathroom-now','GO NOW','Spend 10 minutes and reduce Toilet Need to 8.',10,[{type:'relieve-need',need:'toilet',value:8}]),
  choice('bathroom-defer','DEFER','Keep working; this sticky returns in 20 minutes.',0,[],{followUps:[{eventId:'need-bathroom',delayGameMs:m(20)}]})
 ])}),
 Object.freeze({id:'need-sleepiness',category:'personal',severity:'medium',title:'SLEEPINESS ALERT',copy:'Concentration is slipping. Choose how to recover.',baseWeight:0,deduplicationKey:'need-sleepiness',cooldownGameMs:m(25),eligibility:{type:'need-stage' as const,need:'sleepiness' as const,minimumStage:2},choices:Object.freeze([
  choice('microbreak','MICROBREAK','Spend 8 minutes; reduce sleepiness.',8,[{type:'relieve-need',need:'sleepiness',value:32}]),
  choice('coffee','COFFEE','Restore Stamina and record the health risk.',1,[{type:'consume-booster',booster:'coffee'}],{followUps:[{eventId:'need-sleepiness',delayGameMs:m(30)}]}),
  choice('coke-zero','COKE ZERO','Restore less Stamina and increase Toilet Need.',1,[{type:'consume-booster',booster:'cokeZero'}],{followUps:[{eventId:'need-sleepiness',delayGameMs:m(25)}]}),
  choice('push-through','PUSH THROUGH','Lose 8 Stamina; reconsider in 25 minutes.',0,[{type:'resource',resource:'stamina',amount:-8}],{followUps:[{eventId:'need-sleepiness',delayGameMs:m(25)}]})
 ])})
]);

export const AMBIENT_STICKIES:readonly InterruptionDefinition[]=Object.freeze([
 {id:'ambient-status',category:'product-owner',severity:'low',title:'“QUICK STATUS?”',copy:'Maya · Product Owner: What can I tell stakeholders about today?',baseWeight:1,deduplicationKey:'ambient-status',cooldownGameMs:m(35),choices:[choice('send-update','SEND UPDATE','Spend 6 minutes; improve confidence.',6,[{type:'resource',resource:'poHappiness',amount:5}],{followUps:[{eventId:'ambient-status',delayGameMs:m(35)}]}),choice('ignore-update','IGNORE','Save time; lose confidence.',0,[{type:'resource',resource:'poHappiness',amount:-7}],{followUps:[{eventId:'ambient-status',delayGameMs:m(35)}]})]},
 {id:'ambient-review',category:'teammate',severity:'medium',title:'REVIEW REQUEST · #1842',copy:'Nina requested your review on “Guard duplicate payment retries”.',baseWeight:1,deduplicationKey:'ambient-review',cooldownGameMs:m(30),choices:[choice('review-now','REVIEW NOW','Spend 12 minutes; protect stability.',12,[{type:'resource',resource:'systemStability',amount:5}],{resultKarma:'constructive',followUps:[{eventId:'ambient-review',delayGameMs:m(30)}]}),choice('wave-through','WAVE THROUGH','Save time; accept debt.',2,[{type:'resource',resource:'technicalDebt',amount:7}],{resultKarma:'self-serving',followUps:[{eventId:'ambient-review',delayGameMs:m(30)}]})]},
 {id:'ambient-alert',category:'production',incidentControl:'player-fixable',severity:'high',title:'ERROR RATE ALERT',copy:'A small production spike needs triage.',baseWeight:1,deduplicationKey:'ambient-alert',cooldownGameMs:m(30),choices:[choice('triage-alert','TRIAGE','Spend 14 minutes; restore stability.',14,[{type:'resource',resource:'systemStability',amount:8}],{followUps:[{eventId:'ambient-alert',delayGameMs:m(30)}]}),choice('mute-alert','MUTE ALERT','Save time; stability falls.',0,[{type:'resource',resource:'systemStability',amount:-12}],{followUps:[{eventId:'ambient-alert',delayGameMs:m(30)}]})]}
]);
export const INTERRUPTION_CATALOG:readonly InterruptionDefinition[]=Object.freeze([...ENGINEERING_CASES,...NEED_STICKIES,...AMBIENT_STICKIES]);
validateInterruptionCatalog(INTERRUPTION_CATALOG);
