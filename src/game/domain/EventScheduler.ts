import { evaluateDebtModifier,evaluateSelectionWeight,validateModifier,type SelectionWeightModifier } from './effects';
import { matchesEligibility,type EligibilityPredicate,type InterruptionRunContext } from './interruptions';
import { DEFAULT_DAY_STATE_CONFIG } from './DayState';
import { activePacingBand,type PacingProfile } from './WorkdayPacing';
import type { InterruptionCategory } from './interruptions';
export interface RandomSource { next(): number; reset(): void }

export class SeededRandom implements RandomSource {
    private state: number;
    constructor (private readonly seed: number) {
        if (!Number.isInteger(seed)) throw new TypeError('Random seed must be an integer.');
        this.state = seed >>> 0;
    }
    next (): number {
        this.state = (this.state + 0x6d2b79f5) >>> 0;
        let value = this.state;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    }
    reset (): void { this.state = this.seed >>> 0; }
}

export interface EventSchedulerConfig { readonly minimumSpawnIntervalMs: number; readonly maximumSpawnIntervalMs: number; readonly activeLimit: number; readonly endGameMs: number;readonly pacingProfile?:PacingProfile;readonly initialSpawnGameMs?:number }
export interface SchedulerDefinition { readonly id:string;readonly caseId?:string;readonly category?:InterruptionCategory; readonly baseWeight?:number; readonly debtWeightModifier?:import('./effects').TechnicalDebtModifier;readonly selectionWeightModifier?:SelectionWeightModifier;readonly eligibility?:EligibilityPredicate;readonly deduplicationKey?:string;readonly cooldownGameMs?:number }
export interface ScheduledCandidate { readonly definitionId: string; readonly dueGameMs: number; readonly sequence: number }
export interface SchedulerSnapshot { readonly nextSpawnGameMs: number | null; readonly pending: readonly ScheduledCandidate[]; readonly activeIds: readonly string[]; readonly pendingCount: number;readonly pressure:number;readonly quietDurationGameMs:number;readonly floodDeferrals:number;readonly emptyQuietEvaluations:number }

export class EventScheduler {
    private readonly definitions:readonly SchedulerDefinition[];
    private readonly random: RandomSource; private nextSpawnGameMs: number | null; private sequence = 0;
    private readonly pending: ScheduledCandidate[] = []; private readonly activeIds = new Set<string>(); private readonly createdIds = new Set<string>();
    private lastMeaningfulGameMs=0;private currentGameMs=0;private floodDeferrals=0;private emptyQuietEvaluations=0;
    constructor (definitions: readonly (string|SchedulerDefinition)[], readonly config: EventSchedulerConfig, seed = 1, random?: RandomSource) {
        this.definitions=Object.freeze(definitions.map(item=>typeof item==='string'?Object.freeze({id:item,baseWeight:1}):Object.freeze({...item,baseWeight:item.baseWeight??1})));
        const definitionIds=this.definitions.map(item=>item.id);
        if (!definitionIds.length || new Set(definitionIds).size !== definitionIds.length || definitionIds.some(id => !id.trim())) throw new TypeError('Scheduler definition IDs must be non-empty and unique.');
        if (!Number.isFinite(config.minimumSpawnIntervalMs) || config.minimumSpawnIntervalMs <= 0 || !Number.isFinite(config.maximumSpawnIntervalMs) || config.maximumSpawnIntervalMs < config.minimumSpawnIntervalMs || !Number.isInteger(config.activeLimit) || config.activeLimit <= 0 || !Number.isFinite(config.endGameMs) || config.endGameMs <= 0 || (config.initialSpawnGameMs!==undefined&&(!Number.isFinite(config.initialSpawnGameMs)||config.initialSpawnGameMs<0))) throw new RangeError('Invalid scheduler configuration.');
        this.random = random ?? new SeededRandom(seed); this.nextSpawnGameMs = this.initialSpawn();
    }
    get snapshot (): SchedulerSnapshot { return Object.freeze({ nextSpawnGameMs:this.nextSpawnGameMs,pending:Object.freeze(this.pending.map(i=>Object.freeze({...i}))),activeIds:Object.freeze([...this.activeIds]),pendingCount:this.pending.length,pressure:this.activeIds.size+this.pending.length,quietDurationGameMs:Math.max(0,this.currentGameMs-this.lastMeaningfulGameMs),floodDeferrals:this.floodDeferrals,emptyQuietEvaluations:this.emptyQuietEvaluations }); }
    synchronize (gameMs: number, activate: (candidate: ScheduledCandidate) => boolean, contextOrDebt:InterruptionRunContext|number=0): readonly ScheduledCandidate[] {
        if (!Number.isFinite(gameMs) || gameMs < 0) throw new RangeError('Game time must be finite and non-negative.'); this.currentGameMs=gameMs;const activated: ScheduledCandidate[]=[];const quietLimit=this.config.pacingProfile?.guardrails.maximumQuietGameMs;
        if(quietLimit&&this.nextSpawnGameMs!==null){const quietDeadline=this.lastMeaningfulGameMs+quietLimit;if(quietDeadline<=gameMs&&quietDeadline<this.nextSpawnGameMs)this.nextSpawnGameMs=quietDeadline;}
        while (this.nextSpawnGameMs !== null && this.nextSpawnGameMs <= gameMs && this.nextSpawnGameMs < this.config.endGameMs) {
            const due=this.nextSpawnGameMs;const guard=this.config.pacingProfile?.guardrails;
            const context=typeof contextOrDebt==='number'?legacyContext(contextOrDebt):contextOrDebt;const now=context.currentGameMs??gameMs;const activeKeys=new Set(context.activeDeduplicationKeys??[]);const available=this.definitions.filter(item=>{
                const key=item.deduplicationKey??item.id;const alreadyCreated=this.createdIds.has(item.id)&&item.cooldownGameMs===undefined;
                return !alreadyCreated&&!this.activeIds.has(item.id)&&!this.pending.some(p=>p.definitionId===item.id)&&!activeKeys.has(key)&&(context.cooldownUntilGameMs?.[key]??0)<=now&&matchesEligibility(item.eligibility,context);
            });
            const picked=this.pickWeighted(available,context,due);
            if (picked) { this.createdIds.add(picked.id); this.pending.push(Object.freeze({definitionId:picked.id,dueGameMs:due,sequence:this.sequence++}));this.lastMeaningfulGameMs=due; }
            else if(guard&&due-this.lastMeaningfulGameMs>=guard.maximumQuietGameMs)this.emptyQuietEvaluations++;
            this.nextSpawnGameMs=this.drawInterval(due);
        }
        this.drain(activate,activated); return Object.freeze(activated);
    }
    enqueueFollowUp (definitionId:string,dueGameMs:number,activate:(candidate:ScheduledCandidate)=>boolean):readonly ScheduledCandidate[]{
        if(!this.definitions.some(item=>item.id===definitionId)) throw new TypeError(`Unknown follow-up ${definitionId}.`); if(dueGameMs>=this.config.endGameMs||this.activeIds.has(definitionId)||this.pending.some(i=>i.definitionId===definitionId)) return Object.freeze([]);
        this.createdIds.add(definitionId);this.pending.push(Object.freeze({definitionId,dueGameMs,sequence:this.sequence++})); const activated:ScheduledCandidate[]=[]; this.drain(activate,activated); return Object.freeze(activated);
    }
    resolved (definitionId:string,activate:(candidate:ScheduledCandidate)=>boolean):readonly ScheduledCandidate[]{this.activeIds.delete(definitionId);const definition=this.definitions.find(item=>item.id===definitionId);if(definition&&!definition.caseId)this.createdIds.delete(definitionId);const activated:ScheduledCandidate[]=[];this.drain(activate,activated);return Object.freeze(activated);}
    cancelIneligible (context:InterruptionRunContext):readonly string[]{const removed:string[]=[];for(let index=this.pending.length-1;index>=0;index--){const candidate=this.pending[index]!,definition=this.definitions.find(item=>item.id===candidate.definitionId)!;if(!matchesEligibility(definition.eligibility,context)){this.pending.splice(index,1);this.createdIds.delete(definition.id);removed.push(definition.id);}}return Object.freeze(removed.reverse());}
    markMeaningfulAction(gameMs:number):void{if(!Number.isFinite(gameMs)||gameMs<0)throw new RangeError('Meaningful action time must be finite and non-negative.');this.lastMeaningfulGameMs=Math.max(this.lastMeaningfulGameMs,gameMs);this.currentGameMs=Math.max(this.currentGameMs,gameMs);}
    beginNextDay(dayStartGameMs:number):void{if(!Number.isFinite(dayStartGameMs)||dayStartGameMs<=0)throw new RangeError('Day start must be positive.');this.createdIds.clear();for(const id of this.activeIds)this.createdIds.add(id);for(const item of this.pending)this.createdIds.add(item.definitionId);this.nextSpawnGameMs=this.drawInterval(dayStartGameMs);this.lastMeaningfulGameMs=dayStartGameMs;this.currentGameMs=dayStartGameMs;}
    reset ():void{this.random.reset();this.pending.length=0;this.activeIds.clear();this.createdIds.clear();this.sequence=0;this.lastMeaningfulGameMs=0;this.currentGameMs=0;this.floodDeferrals=0;this.emptyQuietEvaluations=0;this.nextSpawnGameMs=this.initialSpawn();}
    private drain(activate:(candidate:ScheduledCandidate)=>boolean,activated:ScheduledCandidate[]):void{this.pending.sort((a,b)=>a.dueGameMs-b.dueGameMs||a.sequence-b.sequence);while(this.activeIds.size<this.config.activeLimit&&this.pending.length){const candidate=this.pending[0]!;if(!activate(candidate))break;this.pending.shift();this.activeIds.add(candidate.definitionId);activated.push(candidate);}}
    private initialSpawn():number|null{return this.config.initialSpawnGameMs===undefined?this.drawInterval(0):this.config.initialSpawnGameMs<this.config.endGameMs?this.config.initialSpawnGameMs:null;}
    private drawInterval(from:number):number|null{if(from>=this.config.endGameMs)return null;const profile=this.config.pacingProfile,band=profile?activePacingBand(profile,from):undefined;const dayIndex=Math.floor(from/(8*60*60_000))+1;const scale=profile?Math.max(profile.dayScaling.minimumSpawnMultiplier,Math.pow(profile.dayScaling.intervalMultiplier,dayIndex-1)):1;const minimum=Math.max(1,Math.round((band?.minimumSpawnIntervalMs??this.config.minimumSpawnIntervalMs)*scale)),maximum=Math.max(minimum,Math.round((band?.maximumSpawnIntervalMs??this.config.maximumSpawnIntervalMs)*scale));const span=maximum-minimum;const next=from+minimum+Math.floor(this.random.next()*(span+1));return next>=this.config.endGameMs?null:next;}
    private pickWeighted(available:readonly SchedulerDefinition[],context:InterruptionRunContext,dueGameMs:number):SchedulerDefinition|undefined{
        const band=this.config.pacingProfile?activePacingBand(this.config.pacingProfile,dueGameMs):undefined,guard=this.config.pacingProfile?.guardrails;
        const evaluated=available.map(item=>{let weight=evaluateWeight(item,context);if(band&&item.category){weight*=band.categoryWeightModifiers[item.category]??1;if(guard&&weight>0)weight=Math.min(guard.maximumCategoryWeight,Math.max(guard.minimumCategoryWeight,weight));}return {item,weight};});const total=evaluated.reduce((sum,x)=>sum+x.weight,0);if(total<=0)return undefined;
        let draw=this.random.next()*total;for(const entry of evaluated){if(draw<entry.weight)return entry.item;draw-=entry.weight;}return evaluated[evaluated.length-1]?.item;
    }
}

const legacyContext=(technicalDebt:number):InterruptionRunContext=>Object.freeze({resolvedEventIds:Object.freeze([]),resolvedChoices:Object.freeze([]),resources:Object.freeze({...DEFAULT_DAY_STATE_CONFIG.initialResources,technicalDebt}),currentGameMs:0});
export function evaluateWeight(item:SchedulerDefinition,context:InterruptionRunContext):number{const base=item.baseWeight??1;if(!Number.isFinite(base)||base<0)throw new RangeError(`Invalid base weight for ${item.id}.`);if(item.debtWeightModifier)validateModifier(item.debtWeightModifier,item.id);const debtAdjusted=evaluateDebtModifier(base,context.resources.technicalDebt,item.debtWeightModifier);return evaluateSelectionWeight(debtAdjusted,context.resources,item.selectionWeightModifier);}
