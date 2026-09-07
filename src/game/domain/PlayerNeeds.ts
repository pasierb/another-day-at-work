export type NeedId = 'sleepiness' | 'toilet';
import { splitPacingInterval,type PacingProfile } from './WorkdayPacing';

export interface NeedDrain {
    readonly additionalStaminaPerGameMinute: number;
}

export interface NeedCriticalEffect {
    readonly id: string;
    readonly feedback: string;
    readonly staminaCost: number;
    readonly timeLossGameMinutes: number;
}

export interface NeedStageConfig {
    readonly id: string;
    readonly label: string;
    readonly threshold: number;
    readonly warning?: string;
    readonly drain: NeedDrain;
    readonly criticalEffect?: NeedCriticalEffect;
}

export interface NeedConfig {
    readonly id: NeedId;
    readonly label: string;
    readonly minimum: number;
    readonly maximum: number;
    readonly initialValue: number;
    readonly gainPerGameMinute: number;
    readonly relievedValue?: number;
    readonly stages: readonly NeedStageConfig[];
}

export interface PlayerNeedsConfig {
    readonly needs: Readonly<Record<NeedId, NeedConfig>>;
}

export interface NeedSnapshot {
    readonly id: NeedId;
    readonly label: string;
    readonly value: number;
    readonly minimum: number;
    readonly maximum: number;
    readonly severity: number;
    readonly stage: Readonly<NeedStageConfig>;
}

export interface PlayerNeedsSnapshot {
    readonly elapsedGameMs: number;
    readonly sleepiness: NeedSnapshot;
    readonly toilet: NeedSnapshot;
    readonly additionalStaminaPerGameMinute: number;
}

export interface NeedTransition {
    readonly need: NeedId;
    readonly previousStage: Readonly<NeedStageConfig>;
    readonly nextStage: Readonly<NeedStageConfig>;
    readonly atGameMs: number;
    readonly warning?: string;
    readonly criticalEffect?: Readonly<NeedCriticalEffect>;
}

export interface NeedsSynchronizationResult {
    readonly elapsedGameMs: number;
    readonly additionalStaminaCost: number;
    readonly transitions: readonly NeedTransition[];
    readonly snapshot: PlayerNeedsSnapshot;
}

export interface NeedMutationResult {
    readonly need: NeedId;
    readonly requestedAmount: number;
    readonly appliedAmount: number;
    readonly transitions: readonly NeedTransition[];
    readonly snapshot: PlayerNeedsSnapshot;
}

const drain = (additionalStaminaPerGameMinute = 0): NeedDrain => Object.freeze({ additionalStaminaPerGameMinute });

export const DEFAULT_PLAYER_NEEDS_CONFIG: PlayerNeedsConfig = Object.freeze({
    needs: Object.freeze({
        sleepiness: Object.freeze({
            id: 'sleepiness', label: 'Sleepiness', minimum: 0, maximum: 100, initialValue: 0,
            gainPerGameMinute: 100 / 480,
            stages: Object.freeze([
                Object.freeze({ id: 'slightly-tired', label: 'Slightly tired', threshold: 0, drain: drain() }),
                Object.freeze({ id: 'getting-sleepy', label: 'Getting sleepy', threshold: 25, warning: 'Sleepiness: getting sleepy.', drain: drain() }),
                Object.freeze({ id: 'struggling', label: 'Struggling to stay alert', threshold: 50, warning: 'Sleepiness is becoming a problem.', drain: drain(0.05) }),
                Object.freeze({ id: 'microsleep', label: 'Microsleep', threshold: 75, warning: 'Sleepiness: microsleeps detected.', drain: drain(0.12) }),
                Object.freeze({ id: 'fell-asleep', label: 'Fell asleep', threshold: 95, warning: 'Sleepiness critical: stand-up became a sit-down nap.', drain: drain(0.22), criticalEffect: Object.freeze({ id: 'sleepiness-critical', feedback: 'You fell asleep during an implausibly brief stand-up.', staminaCost: 0, timeLossGameMinutes: 8 }) })
            ])
        }),
        toilet: Object.freeze({
            id: 'toilet', label: 'Toilet Need', minimum: 0, maximum: 100, initialValue: 0,
            gainPerGameMinute: 100 / 360, relievedValue: 8,
            stages: Object.freeze([
                Object.freeze({ id: 'could-wait', label: 'Could probably wait', threshold: 0, drain: drain() }),
                Object.freeze({ id: 'noticeable', label: 'Noticeable', threshold: 25, warning: 'Toilet Need: noticeable. There is still time to be sensible.', drain: drain() }),
                Object.freeze({ id: 'priority', label: 'Becoming a priority', threshold: 50, warning: 'Toilet Need: becoming a priority.', drain: drain(0.05) }),
                Object.freeze({ id: 'urgent', label: 'Urgent', threshold: 75, warning: 'Toilet Need: urgent. Stamina is draining faster.', drain: drain(0.12) }),
                Object.freeze({ id: 'sev-1', label: 'Biological SEV-1', threshold: 95, warning: 'BIOLOGICAL SEV-1: immediate human maintenance required.', drain: drain(0.22), criticalEffect: Object.freeze({ id: 'toilet-critical', feedback: 'BIOLOGICAL SEV-1 declared. The incident remains recoverable.', staminaCost: 8, timeLossGameMinutes: 0 }) })
            ])
        })
    })
});

type NeedOverrides = Partial<Omit<NeedConfig, 'id' | 'stages'>> & { readonly stages?: readonly NeedStageConfig[] };
export type PlayerNeedsConfigOverrides = Partial<Omit<PlayerNeedsConfig, 'needs'>> & { readonly needs?: Partial<Record<NeedId, NeedOverrides>> };
type Observer = (snapshot: PlayerNeedsSnapshot) => void;
const NEED_ORDER: readonly NeedId[] = ['sleepiness', 'toilet'];
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

export class PlayerNeeds {
    readonly config: PlayerNeedsConfig;
    private elapsedGameMs: number;
    private values: Record<NeedId, number>;
    private criticalEpisodes = new Set<NeedId>();
    private readonly observers = new Set<Observer>();
    private readonly pacingProfile?:PacingProfile;

    constructor (overrides: PlayerNeedsConfigOverrides = {}, initialElapsedGameMs = 0,pacingProfile?:PacingProfile) {
        const needs = Object.fromEntries(NEED_ORDER.map(id => [id, Object.freeze({
            ...DEFAULT_PLAYER_NEEDS_CONFIG.needs[id], ...overrides.needs?.[id], id,
            stages: Object.freeze([...(overrides.needs?.[id]?.stages ?? DEFAULT_PLAYER_NEEDS_CONFIG.needs[id].stages)])
        })])) as unknown as Record<NeedId, NeedConfig>;
        this.config = Object.freeze({ ...DEFAULT_PLAYER_NEEDS_CONFIG, ...overrides, needs: Object.freeze(needs) });
        this.validateConfig(initialElapsedGameMs);
        this.elapsedGameMs = initialElapsedGameMs;
        this.values = { sleepiness: needs.sleepiness.initialValue, toilet: needs.toilet.initialValue };
        this.pacingProfile=pacingProfile;
    }

    get snapshot (): PlayerNeedsSnapshot {
        const sleepiness = this.needSnapshot('sleepiness');
        const toilet = this.needSnapshot('toilet');
        return Object.freeze({
            elapsedGameMs: this.elapsedGameMs, sleepiness, toilet,
            additionalStaminaPerGameMinute: sleepiness.stage.drain.additionalStaminaPerGameMinute + toilet.stage.drain.additionalStaminaPerGameMinute
        });
    }

    synchronize (authoritativeElapsedGameMs: number): NeedsSynchronizationResult {
        if (!Number.isFinite(authoritativeElapsedGameMs) || authoritativeElapsedGameMs < 0) throw new RangeError('Need synchronization time must be finite and non-negative.');
        if (authoritativeElapsedGameMs <= this.elapsedGameMs) return this.result(0, []);
        const startMs = this.elapsedGameMs;
        const endMs = authoritativeElapsedGameMs;
        const transitions: NeedTransition[] = [];
        let additionalStaminaCost = 0;
        const intervals=this.pacingProfile?splitPacingInterval(this.pacingProfile,startMs,endMs):[{band:undefined,startGameMs:startMs,endGameMs:endMs,durationGameMs:endMs-startMs}] as const;
        for (const id of NEED_ORDER) {
            const config = this.config.needs[id];
            let value=this.values[id];
            for(const interval of intervals){
                const rate=config.gainPerGameMinute*(interval.band?.needRateModifiers[id]??1),segmentStart=value;
                const endValue=clamp(segmentStart+interval.durationGameMs/60_000*rate,config.minimum,config.maximum);
                additionalStaminaCost+=this.integrateAdditionalStamina(config,segmentStart,endValue,rate);
                const startStageIndex=this.stageIndex(config,segmentStart),endStageIndex=this.stageIndex(config,endValue);
                for(let index=startStageIndex+1;index<=endStageIndex;index+=1){
                    const nextStage=config.stages[index],crossingMinutes=rate===0?0:(nextStage.threshold-segmentStart)/rate;
                    const criticalEffect=nextStage.criticalEffect&&!this.criticalEpisodes.has(id)?nextStage.criticalEffect:undefined;
                    if(criticalEffect)this.criticalEpisodes.add(id);
                    transitions.push(Object.freeze({need:id,previousStage:config.stages[index-1],nextStage,atGameMs:interval.startGameMs+crossingMinutes*60_000,warning:nextStage.warning,criticalEffect}));
                }
                value=endValue;
            }
            this.values[id] = value;
        }
        transitions.sort((a, b) => a.atGameMs - b.atGameMs || NEED_ORDER.indexOf(a.need) - NEED_ORDER.indexOf(b.need));
        this.elapsedGameMs = endMs;
        this.notify();
        return this.result(additionalStaminaCost, transitions);
    }

    relieve (id: NeedId, value = this.config.needs[id].relievedValue): PlayerNeedsSnapshot {
        if (value === undefined || !Number.isFinite(value)) throw new RangeError(`Need ${id} has no valid relief value.`);
        const config = this.config.needs[id];
        const next = clamp(value, config.minimum, config.maximum);
        if (next === this.values[id]) return this.snapshot;
        this.values[id] = next;
        if (!this.stage(config, next).criticalEffect) this.criticalEpisodes.delete(id);
        this.notify();
        return this.snapshot;
    }

    beginNextDay (authoritativeElapsedGameMs: number, values: Readonly<Record<NeedId, number>>): PlayerNeedsSnapshot {
        if (!Number.isFinite(authoritativeElapsedGameMs) || authoritativeElapsedGameMs < this.elapsedGameMs) throw new RangeError('New-day time must be monotonic.');
        this.elapsedGameMs = authoritativeElapsedGameMs;
        for (const id of NEED_ORDER) this.values[id] = clamp(values[id], this.config.needs[id].minimum, this.config.needs[id].maximum);
        this.criticalEpisodes.clear();
        this.notify();
        return this.snapshot;
    }

    mutateNeed (id: NeedId, amount: number): NeedMutationResult {
        if (!NEED_ORDER.includes(id)) throw new TypeError(`Unknown need ${id}.`);
        if (!Number.isFinite(amount)) throw new TypeError('Need mutation must be finite.');
        const config = this.config.needs[id];
        const previousValue = this.values[id];
        const nextValue = clamp(previousValue + amount, config.minimum, config.maximum);
        const previousIndex = this.stageIndex(config, previousValue);
        const nextIndex = this.stageIndex(config, nextValue);
        const transitions: NeedTransition[] = [];
        const direction = Math.sign(nextIndex - previousIndex);
        for (let index = previousIndex; index !== nextIndex; index += direction) {
            const from = config.stages[index];
            const to = config.stages[index + direction];
            const criticalEffect = direction > 0 && to.criticalEffect && !this.criticalEpisodes.has(id) ? to.criticalEffect : undefined;
            if (criticalEffect) this.criticalEpisodes.add(id);
            transitions.push(Object.freeze({ need: id, previousStage: from, nextStage: to, atGameMs: this.elapsedGameMs,
                warning: direction > 0 ? to.warning : undefined, criticalEffect }));
        }
        this.values[id] = nextValue;
        if (!this.stage(config, nextValue).criticalEffect) this.criticalEpisodes.delete(id);
        if (nextValue !== previousValue) this.notify();
        return Object.freeze({ need: id, requestedAmount: amount, appliedAmount: nextValue - previousValue,
            transitions: Object.freeze(transitions), snapshot: this.snapshot });
    }

    reset (initialElapsedGameMs = 0): void {
        if (!Number.isFinite(initialElapsedGameMs) || initialElapsedGameMs < 0) throw new RangeError('Need reset time must be finite and non-negative.');
        this.elapsedGameMs = initialElapsedGameMs;
        this.values = { sleepiness: this.config.needs.sleepiness.initialValue, toilet: this.config.needs.toilet.initialValue };
        this.criticalEpisodes.clear();
        this.notify();
    }

    subscribe (observer: Observer): () => void {
        this.observers.add(observer);
        let active = true;
        return () => { if (active) { active = false; this.observers.delete(observer); } };
    }

    private needSnapshot (id: NeedId): NeedSnapshot {
        const config = this.config.needs[id];
        const value = this.values[id];
        return Object.freeze({ id, label: config.label, value, minimum: config.minimum, maximum: config.maximum,
            severity: (value - config.minimum) / (config.maximum - config.minimum), stage: this.stage(config, value) });
    }

    private integrateAdditionalStamina (config: NeedConfig, startValue: number, endValue: number,rate=config.gainPerGameMinute): number {
        if (rate === 0 || endValue <= startValue) return 0;
        let cost = 0;
        let cursor = startValue;
        while (cursor < endValue) {
            const index = this.stageIndex(config, cursor);
            const nextThreshold = config.stages[index + 1]?.threshold ?? endValue;
            const segmentEnd = Math.min(endValue, nextThreshold);
            cost += (segmentEnd - cursor) / rate * config.stages[index].drain.additionalStaminaPerGameMinute;
            cursor = segmentEnd;
        }
        return cost;
    }

    private stage (config: NeedConfig, value: number): Readonly<NeedStageConfig> { return config.stages[this.stageIndex(config, value)]; }
    private stageIndex (config: NeedConfig, value: number): number {
        let result = 0;
        for (let index = 1; index < config.stages.length && value >= config.stages[index].threshold; index += 1) result = index;
        return result;
    }
    private result (additionalStaminaCost: number, transitions: readonly NeedTransition[]): NeedsSynchronizationResult {
        return Object.freeze({ elapsedGameMs: this.elapsedGameMs, additionalStaminaCost, transitions: Object.freeze([...transitions]), snapshot: this.snapshot });
    }
    private notify (): void { const snapshot = this.snapshot; this.observers.forEach(observer => observer(snapshot)); }
    private validateConfig (initialElapsedGameMs: number): void {
        if (!Number.isFinite(initialElapsedGameMs) || initialElapsedGameMs < 0) throw new RangeError('Initial need time must be finite and non-negative.');
        for (const id of NEED_ORDER) {
            const need = this.config.needs[id];
            if (need.id !== id || !need.label.trim() || !Number.isFinite(need.minimum) || !Number.isFinite(need.maximum) || need.maximum <= need.minimum || !Number.isFinite(need.initialValue) || need.initialValue < need.minimum || need.initialValue > need.maximum || !Number.isFinite(need.gainPerGameMinute) || need.gainPerGameMinute < 0 || need.stages.length === 0) throw new TypeError(`Invalid ${id} need configuration.`);
            need.stages.forEach((stage, index) => {
                if (!stage.id.trim() || !stage.label.trim() || !Number.isFinite(stage.threshold) || stage.threshold < need.minimum || stage.threshold > need.maximum || (index === 0 && stage.threshold !== need.minimum) || (index > 0 && stage.threshold <= need.stages[index - 1].threshold) || !Number.isFinite(stage.drain.additionalStaminaPerGameMinute) || stage.drain.additionalStaminaPerGameMinute < 0) throw new TypeError(`Invalid stage configuration for ${id}.`);
                const effect = stage.criticalEffect;
                if (effect && (!effect.id.trim() || !effect.feedback.trim() || ![effect.staminaCost, effect.timeLossGameMinutes].every(value => Number.isFinite(value) && value >= 0))) throw new TypeError(`Invalid critical effect for ${id}.`);
            });
        }
    }
}
