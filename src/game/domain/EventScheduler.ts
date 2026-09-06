import { evaluateDebtModifier,evaluateSelectionWeight,validateModifier,type SelectionWeightModifier } from './effects';
import { matchesEligibility,type EligibilityPredicate,type InterruptionRunContext } from './interruptions';
import { DEFAULT_DAY_STATE_CONFIG } from './DayState';
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

export interface EventSchedulerConfig { readonly minimumSpawnIntervalMs: number; readonly maximumSpawnIntervalMs: number; readonly activeLimit: number; readonly endGameMs: number }
export interface SchedulerDefinition { readonly id:string; readonly baseWeight?:number; readonly debtWeightModifier?:import('./effects').TechnicalDebtModifier;readonly selectionWeightModifier?:SelectionWeightModifier;readonly eligibility?:EligibilityPredicate;readonly deduplicationKey?:string;readonly cooldownGameMs?:number }
export interface ScheduledCandidate { readonly definitionId: string; readonly dueGameMs: number; readonly sequence: number }
export interface SchedulerSnapshot { readonly nextSpawnGameMs: number | null; readonly pending: readonly ScheduledCandidate[]; readonly activeIds: readonly string[]; readonly pendingCount: number }

export class EventScheduler {
    private readonly definitions:readonly SchedulerDefinition[];
    private readonly random: RandomSource; private nextSpawnGameMs: number | null; private sequence = 0;
    private readonly pending: ScheduledCandidate[] = []; private readonly activeIds = new Set<string>(); private readonly createdIds = new Set<string>();
    constructor (definitions: readonly (string|SchedulerDefinition)[], readonly config: EventSchedulerConfig, seed = 1, random?: RandomSource) {
        this.definitions=Object.freeze(definitions.map(item=>typeof item==='string'?Object.freeze({id:item,baseWeight:1}):Object.freeze({...item,baseWeight:item.baseWeight??1})));
        const definitionIds=this.definitions.map(item=>item.id);
        if (!definitionIds.length || new Set(definitionIds).size !== definitionIds.length || definitionIds.some(id => !id.trim())) throw new TypeError('Scheduler definition IDs must be non-empty and unique.');
        if (!Number.isFinite(config.minimumSpawnIntervalMs) || config.minimumSpawnIntervalMs <= 0 || !Number.isFinite(config.maximumSpawnIntervalMs) || config.maximumSpawnIntervalMs < config.minimumSpawnIntervalMs || !Number.isInteger(config.activeLimit) || config.activeLimit <= 0 || !Number.isFinite(config.endGameMs) || config.endGameMs <= 0) throw new RangeError('Invalid scheduler configuration.');
        this.random = random ?? new SeededRandom(seed); this.nextSpawnGameMs = this.drawInterval(0);
    }
    get snapshot (): SchedulerSnapshot { return Object.freeze({ nextSpawnGameMs:this.nextSpawnGameMs,pending:Object.freeze(this.pending.map(i=>Object.freeze({...i}))),activeIds:Object.freeze([...this.activeIds]),pendingCount:this.pending.length }); }
    synchronize (gameMs: number, activate: (candidate: ScheduledCandidate) => boolean, contextOrDebt:InterruptionRunContext|number=0): readonly ScheduledCandidate[] {
        if (!Number.isFinite(gameMs) || gameMs < 0) throw new RangeError('Game time must be finite and non-negative.'); const activated: ScheduledCandidate[]=[];
        while (this.nextSpawnGameMs !== null && this.nextSpawnGameMs <= gameMs && this.nextSpawnGameMs < this.config.endGameMs) {
            const context=typeof contextOrDebt==='number'?legacyContext(contextOrDebt):contextOrDebt;const now=context.currentGameMs??gameMs;const activeKeys=new Set(context.activeDeduplicationKeys??[]);const available=this.definitions.filter(item=>{
                const key=item.deduplicationKey??item.id;const alreadyCreated=this.createdIds.has(item.id)&&item.cooldownGameMs===undefined;
                return !alreadyCreated&&!this.activeIds.has(item.id)&&!this.pending.some(p=>p.definitionId===item.id)&&!activeKeys.has(key)&&(context.cooldownUntilGameMs?.[key]??0)<=now&&matchesEligibility(item.eligibility,context);
            });
            const picked=this.pickWeighted(available,context);
            if (picked) { this.createdIds.add(picked.id); this.pending.push(Object.freeze({definitionId:picked.id,dueGameMs:this.nextSpawnGameMs,sequence:this.sequence++})); }
            this.nextSpawnGameMs=this.drawInterval(this.nextSpawnGameMs);
        }
        this.drain(activate,activated); return Object.freeze(activated);
    }
    enqueueFollowUp (definitionId:string,dueGameMs:number,activate:(candidate:ScheduledCandidate)=>boolean):readonly ScheduledCandidate[]{
        if(!this.definitions.some(item=>item.id===definitionId)) throw new TypeError(`Unknown follow-up ${definitionId}.`); if(dueGameMs>=this.config.endGameMs||this.activeIds.has(definitionId)||this.pending.some(i=>i.definitionId===definitionId)) return Object.freeze([]);
        this.createdIds.add(definitionId);this.pending.push(Object.freeze({definitionId,dueGameMs,sequence:this.sequence++})); const activated:ScheduledCandidate[]=[]; this.drain(activate,activated); return Object.freeze(activated);
    }
    resolved (definitionId:string,activate:(candidate:ScheduledCandidate)=>boolean):readonly ScheduledCandidate[]{this.activeIds.delete(definitionId);const activated:ScheduledCandidate[]=[];this.drain(activate,activated);return Object.freeze(activated);}
    cancelIneligible (context:InterruptionRunContext):readonly string[]{const removed:string[]=[];for(let index=this.pending.length-1;index>=0;index--){const candidate=this.pending[index]!,definition=this.definitions.find(item=>item.id===candidate.definitionId)!;if(!matchesEligibility(definition.eligibility,context)){this.pending.splice(index,1);this.createdIds.delete(definition.id);removed.push(definition.id);}}return Object.freeze(removed.reverse());}
    reset ():void{this.random.reset();this.pending.length=0;this.activeIds.clear();this.createdIds.clear();this.sequence=0;this.nextSpawnGameMs=this.drawInterval(0);}
    private drain(activate:(candidate:ScheduledCandidate)=>boolean,activated:ScheduledCandidate[]):void{this.pending.sort((a,b)=>a.dueGameMs-b.dueGameMs||a.sequence-b.sequence);while(this.activeIds.size<this.config.activeLimit&&this.pending.length){const candidate=this.pending[0]!;if(!activate(candidate))break;this.pending.shift();this.activeIds.add(candidate.definitionId);activated.push(candidate);}}
    private drawInterval(from:number):number|null{if(from>=this.config.endGameMs)return null;const span=this.config.maximumSpawnIntervalMs-this.config.minimumSpawnIntervalMs;const next=from+this.config.minimumSpawnIntervalMs+Math.floor(this.random.next()*(span+1));return next>=this.config.endGameMs?null:next;}
    private pickWeighted(available:readonly SchedulerDefinition[],context:InterruptionRunContext):SchedulerDefinition|undefined{
        const evaluated=available.map(item=>({item,weight:evaluateWeight(item,context)}));const total=evaluated.reduce((sum,x)=>sum+x.weight,0);if(total<=0)return undefined;
        let draw=this.random.next()*total;for(const entry of evaluated){if(draw<entry.weight)return entry.item;draw-=entry.weight;}return evaluated[evaluated.length-1]?.item;
    }
}

const legacyContext=(technicalDebt:number):InterruptionRunContext=>Object.freeze({selectedTaskId:null,completedTaskIds:Object.freeze([]),resolvedEventIds:Object.freeze([]),resolvedChoices:Object.freeze([]),resources:Object.freeze({...DEFAULT_DAY_STATE_CONFIG.initialResources,technicalDebt}),currentGameMs:0});
export function evaluateWeight(item:SchedulerDefinition,context:InterruptionRunContext):number{const base=item.baseWeight??1;if(!Number.isFinite(base)||base<0)throw new RangeError(`Invalid base weight for ${item.id}.`);if(item.debtWeightModifier)validateModifier(item.debtWeightModifier,item.id);const debtAdjusted=evaluateDebtModifier(base,context.resources.technicalDebt,item.debtWeightModifier);return evaluateSelectionWeight(debtAdjusted,context.resources,item.selectionWeightModifier);}
