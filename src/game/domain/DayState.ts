export const RESOURCE_KEYS = ['stamina', 'poHappiness', 'systemStability', 'technicalDebt'] as const;

export type ResourceKey = typeof RESOURCE_KEYS[number];
export type PauseReason = string;
export type ResourceValues = Readonly<Record<ResourceKey, number>>;

export interface DayStateConfig {
    /** Minute of day at which a run starts. Defaults to 09:00. */
    readonly startMinute: number;
    /** Minute of day at which advancement stops. Defaults to 17:00. */
    readonly endMinute: number;
    /** Game minutes advanced per real second. Defaults to one. */
    readonly gameMinutesPerRealSecond: number;
    /** Resource values restored whenever the run is reset. */
    readonly initialResources: ResourceValues;
    /** Pause owners restored on reset. Empty by default, so a new run is running. */
    readonly initialPauseReasons: readonly PauseReason[];
    /** Allow authoritative time to continue across consecutive workdays. */
    readonly continuous: boolean;
}

export interface DayStateSnapshot {
    /** Total authoritative time across the complete run. */
    readonly elapsedGameMs: number;
    readonly totalElapsedGameMs: number;
    readonly dayElapsedGameMs: number;
    readonly dayIndex: number;
    readonly clockHour: number;
    readonly clockMinute: number;
    readonly dayProgress: number;
    readonly isPaused: boolean;
    readonly isDayComplete: boolean;
    readonly pauseReasons: readonly PauseReason[];
    readonly resources: ResourceValues;
}

export const DEFAULT_DAY_STATE_CONFIG: DayStateConfig = Object.freeze({
    startMinute: 9 * 60,
    endMinute: 17 * 60,
    gameMinutesPerRealSecond: 1,
    initialResources: Object.freeze({
        stamina: 75,
        poHappiness: 75,
        systemStability: 75,
        technicalDebt: 0
    }),
    initialPauseReasons: Object.freeze([]),
    continuous: false
});

type DayStateConfigOverrides = Partial<Omit<DayStateConfig, 'initialResources'>> & {
    readonly initialResources?: Partial<Record<ResourceKey, number>>;
};
type Observer = (snapshot: DayStateSnapshot) => void;

const clampResource = (value: number) => Math.min(100, Math.max(0, value));

export class DayState {
    readonly config: DayStateConfig;
    private elapsedGameMs = 0;
    private resources: Record<ResourceKey, number>;
    private pauseReasons: Set<PauseReason>;
    private readonly observers = new Set<Observer>();

    constructor (overrides: DayStateConfigOverrides = {}) {
        const resources = { ...DEFAULT_DAY_STATE_CONFIG.initialResources, ...overrides.initialResources };
        this.config = Object.freeze({
            ...DEFAULT_DAY_STATE_CONFIG,
            ...overrides,
            initialResources: Object.freeze({ ...resources }),
            initialPauseReasons: Object.freeze([...(overrides.initialPauseReasons ?? [])])
        });
        this.validateConfig();
        this.resources = { ...this.config.initialResources };
        this.pauseReasons = new Set(this.config.initialPauseReasons);
    }

    get snapshot (): DayStateSnapshot {
        const totalDurationMs = (this.config.endMinute - this.config.startMinute) * 60_000;
        const dayIndex = Math.floor(this.elapsedGameMs / totalDurationMs) + 1;
        const dayElapsedGameMs = this.elapsedGameMs % totalDurationMs;
        const displayElapsedGameMs = !this.config.continuous && this.elapsedGameMs === totalDurationMs ? totalDurationMs : dayElapsedGameMs;
        const currentMinute = this.config.startMinute + Math.floor(displayElapsedGameMs / 60_000);
        return Object.freeze({
            elapsedGameMs: this.elapsedGameMs,
            totalElapsedGameMs: this.elapsedGameMs,
            dayElapsedGameMs: displayElapsedGameMs,
            dayIndex: !this.config.continuous && this.elapsedGameMs === totalDurationMs ? 1 : dayIndex,
            clockHour: Math.floor(currentMinute / 60),
            clockMinute: currentMinute % 60,
            dayProgress: displayElapsedGameMs / totalDurationMs,
            isPaused: this.pauseReasons.size > 0,
            isDayComplete: !this.config.continuous && this.elapsedGameMs === totalDurationMs,
            pauseReasons: Object.freeze([...this.pauseReasons]),
            resources: Object.freeze({ ...this.resources })
        });
    }

    advance (elapsedRealMs: number): void {
        if (!Number.isFinite(elapsedRealMs) || elapsedRealMs <= 0 || this.pauseReasons.size > 0) return;
        const durationMs = (this.config.endMinute - this.config.startMinute) * 60_000;
        const candidate = this.elapsedGameMs + elapsedRealMs * this.config.gameMinutesPerRealSecond * 60;
        const next = this.config.continuous ? candidate : Math.min(durationMs, candidate);
        if (next === this.elapsedGameMs) return;
        this.elapsedGameMs = next;
        this.notify();
    }

    spendGameMinutes (gameMinutes: number): void {
        if (!Number.isFinite(gameMinutes) || gameMinutes < 0) {
            throw new RangeError('Action time must be finite and non-negative.');
        }
        if (gameMinutes === 0) return;
        const durationMs = (this.config.endMinute - this.config.startMinute) * 60_000;
        const candidate = this.elapsedGameMs + gameMinutes * 60_000;
        const next = this.config.continuous ? candidate : Math.min(durationMs, candidate);
        if (next === this.elapsedGameMs) return;
        this.elapsedGameMs = next;
        this.notify();
    }

    pause (reason: PauseReason): void {
        if (!reason || this.pauseReasons.has(reason)) return;
        this.pauseReasons.add(reason);
        this.notify();
    }

    resume (reason: PauseReason): void {
        if (!this.pauseReasons.delete(reason)) return;
        this.notify();
    }

    mutateResource (key: ResourceKey, amount: number): void {
        if (!Number.isFinite(amount)) throw new TypeError('Resource mutation must be finite.');
        const next = clampResource(this.resources[key] + amount);
        if (next === this.resources[key]) return;
        this.resources[key] = next;
        this.notify();
    }

    reset (): void {
        const wasChanged = this.elapsedGameMs !== 0
            || RESOURCE_KEYS.some(key => this.resources[key] !== this.config.initialResources[key])
            || this.pauseReasons.size !== this.config.initialPauseReasons.length
            || this.config.initialPauseReasons.some(reason => !this.pauseReasons.has(reason));
        if (!wasChanged) return;
        this.elapsedGameMs = 0;
        this.resources = { ...this.config.initialResources };
        this.pauseReasons = new Set(this.config.initialPauseReasons);
        this.notify();
    }

    subscribe (observer: Observer): () => void {
        this.observers.add(observer);
        let subscribed = true;
        return () => {
            if (!subscribed) return;
            subscribed = false;
            this.observers.delete(observer);
        };
    }

    private notify (): void {
        const snapshot = this.snapshot;
        this.observers.forEach(observer => observer(snapshot));
    }

    private validateConfig (): void {
        const { startMinute, endMinute, gameMinutesPerRealSecond, initialResources } = this.config;
        if (!Number.isFinite(startMinute) || !Number.isFinite(endMinute) || endMinute <= startMinute) {
            throw new RangeError('The workday end must be later than its start.');
        }
        if (!Number.isFinite(gameMinutesPerRealSecond) || gameMinutesPerRealSecond <= 0) {
            throw new RangeError('The workday time scale must be positive.');
        }
        RESOURCE_KEYS.forEach(key => {
            if (!Number.isFinite(initialResources[key]) || initialResources[key] < 0 || initialResources[key] > 100) {
                throw new RangeError(`Initial resource ${key} must be between 0 and 100.`);
            }
        });
    }
}
