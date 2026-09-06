import type { Effect } from './effects';
import { validateEffects } from './effects';

export type EngineeringTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskDecisionChoiceDefinition {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly gameMinutes: number;
    readonly effects: readonly Effect[];
}

export interface TaskDecisionDefinition {
    readonly id: string;
    readonly title: string;
    readonly copy: string;
    readonly threshold: number;
    readonly choices: readonly TaskDecisionChoiceDefinition[];
}

export interface EngineeringTaskDefinition {
    readonly id: string;
    readonly title: string;
    readonly effort: number;
    readonly priority: EngineeringTaskPriority;
    readonly rewardCopy: string;
    readonly riskCopy: string;
    readonly completionEffects: readonly Effect[];
    readonly technicalDebtEffects?: readonly Effect[];
    readonly midpointDecision?: TaskDecisionDefinition;
}

export interface EngineeringTaskSnapshot extends EngineeringTaskDefinition {
    readonly progress: number;
    readonly isSelected: boolean;
    readonly isComplete: boolean;
    readonly midpointTriggered: boolean;
}

export interface EngineeringTaskQueueSnapshot {
    readonly tasks: readonly EngineeringTaskSnapshot[];
    readonly selectedTaskId: string | null;
    readonly selectedTask: EngineeringTaskSnapshot | null;
    readonly completedTaskIds: readonly string[];
    readonly runCompletedTaskIds: readonly string[];
    readonly pendingDecision: Readonly<{ taskId: string; definition: TaskDecisionDefinition }> | null;
}

export interface TaskWorkTransition {
    readonly appliedWork: number;
    readonly decisionOpened: boolean;
    readonly completedTaskId: string | null;
    readonly completionEffects: readonly Effect[];
}

const priorities: readonly EngineeringTaskPriority[] = ['low', 'medium', 'high', 'urgent'];
const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const freezeEffects = (effects: readonly Effect[]) => Object.freeze([...effects]);

export function validateEngineeringTaskCatalog (catalog: readonly EngineeringTaskDefinition[]): void {
    if (!Array.isArray(catalog) || catalog.length === 0) throw new TypeError('Engineering task catalog must not be empty.');
    const ids = new Set<string>();
    for (const task of catalog) {
        if (!nonEmpty(task.id) || ids.has(task.id)) throw new TypeError('Engineering task ids must be non-empty and unique.');
        ids.add(task.id);
        if (!nonEmpty(task.title) || !nonEmpty(task.rewardCopy) || !nonEmpty(task.riskCopy)) throw new TypeError(`${task.id} has invalid copy.`);
        if (!Number.isFinite(task.effort) || task.effort <= 0) throw new RangeError(`${task.id} effort must be positive.`);
        if (!priorities.includes(task.priority)) throw new TypeError(`${task.id} has an invalid priority.`);
        validateEffects(task.completionEffects, `${task.id} completion effects`);
        validateEffects(task.technicalDebtEffects ?? [], `${task.id} Technical Debt effects`);
        const decision = task.midpointDecision;
        if (!decision) continue;
        if (!nonEmpty(decision.id) || !nonEmpty(decision.title) || !nonEmpty(decision.copy)
            || !Number.isFinite(decision.threshold) || decision.threshold <= 0 || decision.threshold >= 100
            || !Array.isArray(decision.choices) || decision.choices.length < 2) throw new TypeError(`${task.id} has an invalid midpoint decision.`);
        const choiceIds = new Set<string>();
        for (const choice of decision.choices) {
            if (!nonEmpty(choice.id) || choiceIds.has(choice.id) || !nonEmpty(choice.label) || !nonEmpty(choice.description)
                || !Number.isFinite(choice.gameMinutes) || choice.gameMinutes < 0) throw new TypeError(`${decision.id} has an invalid choice.`);
            choiceIds.add(choice.id);
            validateEffects(choice.effects, `${decision.id}/${choice.id} effects`);
        }
    }
}

type Observer = (snapshot: EngineeringTaskQueueSnapshot) => void;

export class EngineeringTaskQueue {
    readonly catalog: readonly EngineeringTaskDefinition[];
    private progress = new Map<string, number>();
    private selectedId: string | null = null;
    private completed: string[] = [];
    private runCompleted: string[] = [];
    private triggered = new Set<string>();
    private pendingTaskId: string | null = null;
    private readonly observers = new Set<Observer>();

    constructor (catalog: readonly EngineeringTaskDefinition[]) {
        validateEngineeringTaskCatalog(catalog);
        this.catalog = Object.freeze(catalog.map(task => Object.freeze({
            ...task,
            completionEffects: freezeEffects(task.completionEffects),
            technicalDebtEffects: freezeEffects(task.technicalDebtEffects ?? []),
            midpointDecision: task.midpointDecision && Object.freeze({ ...task.midpointDecision,
                choices: Object.freeze(task.midpointDecision.choices.map(choice => Object.freeze({ ...choice, effects: freezeEffects(choice.effects) }))) })
        })));
        this.reset();
    }

    get snapshot (): EngineeringTaskQueueSnapshot {
        const tasks = Object.freeze(this.catalog.map(definition => Object.freeze({ ...definition,
            progress: this.progress.get(definition.id) ?? 0, isSelected: definition.id === this.selectedId,
            isComplete: this.completed.includes(definition.id), midpointTriggered: this.triggered.has(definition.id) })));
        const selectedTask = tasks.find(task => task.id === this.selectedId) ?? null;
        const pendingTask = tasks.find(task => task.id === this.pendingTaskId);
        return Object.freeze({ tasks, selectedTaskId: this.selectedId, selectedTask,
            completedTaskIds: Object.freeze([...this.completed]),
            runCompletedTaskIds: Object.freeze([...this.runCompleted,...this.completed]),
            pendingDecision: pendingTask?.midpointDecision
                ? Object.freeze({ taskId: pendingTask.id, definition: pendingTask.midpointDecision }) : null });
    }

    select (taskId: string): boolean {
        const task = this.catalog.find(item => item.id === taskId);
        if (!task || taskId === this.selectedId || this.completed.includes(taskId) || this.pendingTaskId) return false;
        this.selectedId = taskId;
        this.notify();
        return true;
    }

    nextWorkBoundary (): number {
        const task = this.snapshot.selectedTask;
        if (!task || this.pendingTaskId) return 0;
        const completion = task.effort * (100 - task.progress) / 100;
        const decision = task.midpointDecision;
        if (!decision || task.midpointTriggered) return completion;
        return Math.min(completion, task.effort * (decision.threshold - task.progress) / 100);
    }

    applyWork (work: number): TaskWorkTransition {
        if (!Number.isFinite(work) || work < 0) throw new RangeError('Task work must be finite and non-negative.');
        const task = this.snapshot.selectedTask;
        if (!task || this.pendingTaskId || work === 0) return Object.freeze({ appliedWork: 0, decisionOpened: false, completedTaskId: null, completionEffects: Object.freeze([]) });
        const appliedWork = Math.min(work, this.nextWorkBoundary());
        const progress = Math.min(100, task.progress + appliedWork / task.effort * 100);
        this.progress.set(task.id, progress);
        let decisionOpened = false;
        let completedTaskId: string | null = null;
        let completionEffects: readonly Effect[] = Object.freeze([]);
        if (task.midpointDecision && !task.midpointTriggered && progress >= task.midpointDecision.threshold) {
            this.progress.set(task.id, task.midpointDecision.threshold);
            this.triggered.add(task.id);
            this.pendingTaskId = task.id;
            decisionOpened = true;
        } else if (progress >= 100) {
            this.progress.set(task.id, 100);
            this.completed.push(task.id);
            completedTaskId = task.id;
            completionEffects = Object.freeze([...task.completionEffects, ...(task.technicalDebtEffects ?? [])]);
            this.selectedId = this.catalog.find(item => !this.completed.includes(item.id))?.id ?? null;
        }
        this.notify();
        return Object.freeze({ appliedWork, decisionOpened, completedTaskId, completionEffects });
    }

    resolvePendingDecision (choiceId: string): TaskDecisionChoiceDefinition | null {
        const pending = this.snapshot.pendingDecision;
        const choice = pending?.definition.choices.find(item => item.id === choiceId);
        if (!pending || !choice) return null;
        this.pendingTaskId = null;
        this.notify();
        return choice;
    }

    reduceSelectedProgress (amount: number): boolean {
        if (!Number.isFinite(amount) || amount < 0) throw new RangeError('Task progress reduction must be finite and non-negative.');
        const task = this.snapshot.selectedTask;
        if (!task || task.isComplete || amount === 0) return false;
        const next = Math.max(0, task.progress - amount);
        if (next === task.progress) return false;
        this.progress.set(task.id, next);
        this.notify();
        return true;
    }

    reset (): void {
        this.progress = new Map(this.catalog.map(task => [task.id, 0]));
        this.selectedId = this.catalog[0]?.id ?? null;
        this.completed = [];
        this.runCompleted = [];
        this.triggered = new Set();
        this.pendingTaskId = null;
        this.notify();
    }

    beginNextDay (dayIndex: number): void {
        if (!Number.isInteger(dayIndex) || dayIndex < 2) throw new RangeError('Next day index must be at least two.');
        this.runCompleted.push(...this.completed.map(id=>`day-${dayIndex-1}:${id}`));
        for (const id of this.completed) this.progress.set(id, 0);
        this.completed = [];
        this.triggered = new Set([...this.triggered].filter(id=>(this.progress.get(id)??0)>0));
        this.pendingTaskId = null;
        if (!this.selectedId || (this.progress.get(this.selectedId)??0)>=100) this.selectedId=this.catalog[0]?.id??null;
        this.notify();
    }

    subscribe (observer: Observer): () => void { this.observers.add(observer); return () => this.observers.delete(observer); }
    private notify (): void { const snapshot = this.snapshot; this.observers.forEach(observer => observer(snapshot)); }
}
