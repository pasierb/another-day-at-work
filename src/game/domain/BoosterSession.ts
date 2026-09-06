import { SeededRandom, type RandomSource } from './EventScheduler';

export const BOOSTER_IDS = ['coffee', 'cokeZero'] as const;
export type BoosterId = typeof BOOSTER_IDS[number];
export type BoosterUnavailableReason = 'cooldown' | 'full-stamina' | 'decision-open' | 'day-complete';

export interface BoosterDefinition {
    readonly id: BoosterId;
    readonly label: string;
    readonly staminaRestoration: number;
    readonly toiletNeedIncrease: number;
    readonly cooldownGameMs: number;
    readonly feedback: readonly string[];
    readonly repeatFeedback: string;
}

export interface CoffeeCrashConfig {
    readonly initialProbability: number;
    readonly probabilityPerCoffee: number;
    readonly maximumProbability: number;
}

export interface BoosterSessionConfig {
    readonly boosters: Readonly<Record<BoosterId, BoosterDefinition>>;
    readonly coffeeCrash: CoffeeCrashConfig;
}

export interface BoosterAvailabilityContext {
    readonly elapsedGameMs: number;
    readonly stamina: number;
    readonly maximumStamina?: number;
    readonly isDecisionOpen: boolean;
    readonly isDayComplete: boolean;
}

export interface BoosterAvailability {
    readonly available: boolean;
    readonly reason?: BoosterUnavailableReason;
    readonly remainingCooldownGameMs: number;
}

export interface BoosterActivationResult {
    readonly boosterId: BoosterId;
    readonly staminaRestoration: number;
    readonly toiletNeedIncrease: number;
    readonly consumptionCount: number;
    readonly feedback: string;
}

export interface BoosterActivation {
    readonly accepted: boolean;
    readonly availability: BoosterAvailability;
    readonly result?: BoosterActivationResult;
}

export interface BoosterSnapshot {
    readonly elapsedGameMs: number;
    readonly consumptionCounts: Readonly<Record<BoosterId, number>>;
    readonly cooldownUntilGameMs: Readonly<Record<BoosterId, number>>;
    readonly availability: Readonly<Record<BoosterId, BoosterAvailability>>;
    readonly coffeeCrashProbability: number;
}

const feedback = Object.freeze(['Nice.', 'Productivity.', 'You can now hear Kubernetes.']);
export const DEFAULT_BOOSTER_SESSION_CONFIG: BoosterSessionConfig = Object.freeze({
    boosters: Object.freeze({
        coffee: Object.freeze({ id: 'coffee', label: 'Coffee', staminaRestoration: 30, toiletNeedIncrease: 0,
            cooldownGameMs: 30 * 60_000, feedback, repeatFeedback: 'Heart Rate Observability enabled.' }),
        cokeZero: Object.freeze({ id: 'cokeZero', label: 'Coke Zero', staminaRestoration: 15, toiletNeedIncrease: 12,
            cooldownGameMs: 20 * 60_000, feedback: Object.freeze(['Zero sugar. Non-zero consequences.']), repeatFeedback: 'Another Coke Zero consumed.' })
    }),
    coffeeCrash: Object.freeze({ initialProbability: 0, probabilityPerCoffee: 0.15, maximumProbability: 0.75 })
});

type DefinitionOverrides = Partial<Omit<BoosterDefinition, 'id'>>;
export type BoosterSessionConfigOverrides = {
    readonly boosters?: Partial<Record<BoosterId, DefinitionOverrides>>;
    readonly coffeeCrash?: Partial<CoffeeCrashConfig>;
};
type Observer = (snapshot: BoosterSnapshot) => void;

const freezeAvailability = (available: boolean, remainingCooldownGameMs: number, reason?: BoosterUnavailableReason): BoosterAvailability =>
    Object.freeze({ available, remainingCooldownGameMs, ...(reason ? { reason } : {}) });

export class BoosterSession {
    readonly config: BoosterSessionConfig;
    private readonly random: RandomSource;
    private elapsedGameMs = 0;
    private counts: Record<BoosterId, number> = { coffee: 0, cokeZero: 0 };
    private cooldowns: Record<BoosterId, number> = { coffee: 0, cokeZero: 0 };
    private availability: Record<BoosterId, BoosterAvailability> = {
        coffee: freezeAvailability(false, 0, 'full-stamina'), cokeZero: freezeAvailability(false, 0, 'full-stamina')
    };
    private activating = new Set<BoosterId>();
    private readonly observers = new Set<Observer>();

    constructor (overrides: BoosterSessionConfigOverrides = {}, seed = 1, random?: RandomSource) {
        const boosters = Object.fromEntries(BOOSTER_IDS.map(id => {
            const definition = DEFAULT_BOOSTER_SESSION_CONFIG.boosters[id];
            const merged = { ...definition, ...overrides.boosters?.[id], id };
            return [id, Object.freeze({ ...merged, feedback: Object.freeze([...(merged.feedback ?? definition.feedback)]) })];
        })) as unknown as Record<BoosterId, BoosterDefinition>;
        this.config = Object.freeze({ boosters: Object.freeze(boosters), coffeeCrash: Object.freeze({
            ...DEFAULT_BOOSTER_SESSION_CONFIG.coffeeCrash, ...overrides.coffeeCrash
        }) });
        this.validateConfig(seed);
        this.random = random ?? new SeededRandom(seed);
    }

    get snapshot (): BoosterSnapshot {
        return Object.freeze({ elapsedGameMs: this.elapsedGameMs,
            consumptionCounts: Object.freeze({ ...this.counts }), cooldownUntilGameMs: Object.freeze({ ...this.cooldowns }),
            availability: Object.freeze({ ...this.availability }), coffeeCrashProbability: this.coffeeCrashProbability() });
    }

    synchronize (context: BoosterAvailabilityContext): BoosterSnapshot {
        this.validateContext(context);
        const next = {} as Record<BoosterId, BoosterAvailability>;
        BOOSTER_IDS.forEach(id => { next[id] = this.evaluateAvailability(id, context); });
        const changed = context.elapsedGameMs !== this.elapsedGameMs || BOOSTER_IDS.some(id =>
            next[id].available !== this.availability[id].available || next[id].reason !== this.availability[id].reason
            || next[id].remainingCooldownGameMs !== this.availability[id].remainingCooldownGameMs);
        this.elapsedGameMs = context.elapsedGameMs;
        this.availability = next;
        if (changed) this.notify();
        return this.snapshot;
    }

    activate (id: BoosterId, context: BoosterAvailabilityContext): BoosterActivation {
        if (!BOOSTER_IDS.includes(id)) throw new TypeError(`Unknown booster ${id}.`);
        this.synchronize(context);
        const availability = this.availability[id];
        if (!availability.available || this.activating.has(id)) return Object.freeze({ accepted: false, availability });
        this.activating.add(id);
        try {
            const definition = this.config.boosters[id];
            const count = this.counts[id] + 1;
            this.counts[id] = count;
            this.cooldowns[id] = context.elapsedGameMs + definition.cooldownGameMs;
            this.availability[id] = freezeAvailability(false, definition.cooldownGameMs, 'cooldown');
            const result = Object.freeze({ boosterId: id, staminaRestoration: definition.staminaRestoration,
                toiletNeedIncrease: definition.toiletNeedIncrease, consumptionCount: count,
                feedback: definition.feedback[count - 1] ?? definition.repeatFeedback });
            this.notify();
            return Object.freeze({ accepted: true, availability: this.availability[id], result });
        } finally { this.activating.delete(id); }
    }

    evaluateCoffeeCrashOpportunity (): boolean { return this.random.next() < this.coffeeCrashProbability(); }

    reset (): void {
        this.elapsedGameMs = 0;
        this.counts = { coffee: 0, cokeZero: 0 };
        this.cooldowns = { coffee: 0, cokeZero: 0 };
        this.availability = { coffee: freezeAvailability(false, 0, 'full-stamina'), cokeZero: freezeAvailability(false, 0, 'full-stamina') };
        this.activating.clear();
        this.random.reset();
        this.notify();
    }

    subscribe (observer: Observer): () => void {
        this.observers.add(observer);
        let active = true;
        return () => { if (active) { active = false; this.observers.delete(observer); } };
    }

    private coffeeCrashProbability (): number {
        const risk = this.config.coffeeCrash.initialProbability + this.counts.coffee * this.config.coffeeCrash.probabilityPerCoffee;
        return Math.min(this.config.coffeeCrash.maximumProbability, risk);
    }
    private evaluateAvailability (id: BoosterId, context: BoosterAvailabilityContext): BoosterAvailability {
        const remaining = Math.max(0, this.cooldowns[id] - context.elapsedGameMs);
        if (context.isDayComplete) return freezeAvailability(false, remaining, 'day-complete');
        if (context.isDecisionOpen) return freezeAvailability(false, remaining, 'decision-open');
        if (context.stamina >= (context.maximumStamina ?? 100)) return freezeAvailability(false, remaining, 'full-stamina');
        if (remaining > 0) return freezeAvailability(false, remaining, 'cooldown');
        return freezeAvailability(true, 0);
    }
    private notify (): void { const snapshot = this.snapshot; this.observers.forEach(observer => observer(snapshot)); }
    private validateContext (context: BoosterAvailabilityContext): void {
        const maximum = context.maximumStamina ?? 100;
        if (![context.elapsedGameMs, context.stamina, maximum].every(Number.isFinite) || context.elapsedGameMs < 0 || maximum <= 0) throw new RangeError('Invalid booster availability context.');
    }
    private validateConfig (seed: number): void {
        if (!Number.isInteger(seed)) throw new TypeError('Random seed must be an integer.');
        BOOSTER_IDS.forEach(id => {
            const item = this.config.boosters[id];
            if (item.id !== id || !item.label.trim() || !item.repeatFeedback.trim() || item.feedback.length === 0
                || item.feedback.some(value => !value.trim()) || ![item.staminaRestoration, item.toiletNeedIncrease, item.cooldownGameMs].every(Number.isFinite)
                || item.staminaRestoration <= 0 || item.toiletNeedIncrease < 0 || item.cooldownGameMs < 0) throw new TypeError(`Invalid ${id} booster configuration.`);
        });
        if (this.config.boosters.cokeZero.staminaRestoration >= this.config.boosters.coffee.staminaRestoration) throw new RangeError('Coke Zero must restore less Stamina than Coffee.');
        const risk = this.config.coffeeCrash;
        if (![risk.initialProbability, risk.probabilityPerCoffee, risk.maximumProbability].every(Number.isFinite)
            || risk.initialProbability < 0 || risk.probabilityPerCoffee < 0 || risk.maximumProbability > 1
            || risk.maximumProbability < risk.initialProbability) throw new RangeError('Invalid Coffee Crash probability configuration.');
    }
}
