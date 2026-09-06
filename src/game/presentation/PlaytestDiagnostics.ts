import type { Workstation } from '../scenes/Workstation';

export interface PlaytestMilestones {
    readonly runId: number; readonly scene: 'workstation' | 'results'; readonly booted: boolean;
    readonly clock: string; readonly elapsedGameMs: number; readonly paused: boolean;
    readonly pauseReasons: readonly string[]; readonly activeInterruptionIds: readonly string[];
    readonly resolvedInterruptionIds: readonly string[]; readonly completedTaskIds: readonly string[];
    readonly codingRequested: boolean; readonly guidanceVisible: boolean; readonly terminal: boolean;
    readonly dayIndex:number;readonly healthRisk:number;
    readonly tasks:readonly Readonly<{id:string;status:string;stakeholder:string|null;deadlineGameMs:number|null;remainingGameMs:number|null;crisis:boolean}>[];
    readonly aiPhase:'available'|'planning'|'generating'|'review';readonly aiProgress:number;readonly cycleId:string|null;readonly batchId:string|null;readonly reviewAvailable:boolean;
}
declare global { interface Window { __WORKDAY_PLAYTEST__?: Readonly<{ readonly getSnapshot: () => PlaytestMilestones }>; } }
let nextRunId = 1;
export function playtestDiagnosticsEnabled (): boolean { try { return new URLSearchParams(window.location.search).get('playtest') === '1'; } catch { return false; } }
export function installWorkstationDiagnostics (scene: Workstation, guidanceVisible: () => boolean): () => void {
    if (!playtestDiagnosticsEnabled()) return () => {};
    const runId = nextRunId++;
    const getSnapshot = (): PlaytestMilestones => { const day=scene.workday.snapshot,intr=scene.interruptions.snapshot,tasks=scene.taskQueue.snapshot,ai=scene.session.ai.snapshot;return Object.freeze({runId,scene:'workstation',booted:true,clock:`${String(day.clockHour).padStart(2,'0')}:${String(day.clockMinute).padStart(2,'0')}`,elapsedGameMs:day.elapsedGameMs,paused:day.isPaused,pauseReasons:Object.freeze([...day.pauseReasons]),activeInterruptionIds:Object.freeze(intr.active.map(x=>x.id)),resolvedInterruptionIds:Object.freeze([...intr.resolvedIds]),completedTaskIds:Object.freeze([...tasks.runCompletedTaskIds]),codingRequested:false,aiPhase:ai.phase,aiProgress:ai.progress,cycleId:ai.cycleId,batchId:ai.batch?.id??null,reviewAvailable:ai.phase==='review',guidanceVisible:guidanceVisible(),terminal:Boolean(scene.session.result),dayIndex:day.dayIndex,healthRisk:scene.session.healthRisk,tasks:Object.freeze(tasks.tasks.map(task=>Object.freeze({id:task.id,status:task.status,stakeholder:task.stakeholder??null,deadlineGameMs:task.deadlineGameMs,remainingGameMs:task.remainingGameMs,crisis:task.initialStatus==='dormant'})))}); };
    window.__WORKDAY_PLAYTEST__=Object.freeze({getSnapshot});
    return ()=>{if(window.__WORKDAY_PLAYTEST__?.getSnapshot===getSnapshot)delete window.__WORKDAY_PLAYTEST__;};
}
export function installResultsDiagnostics (runId: number, completedTaskIds: readonly string[], resolvedInterruptionIds: readonly string[]): () => void {
    if (!playtestDiagnosticsEnabled()) return () => {};
    const getSnapshot=():PlaytestMilestones=>Object.freeze({runId,scene:'results',booted:true,clock:'COLLAPSED',elapsedGameMs:0,paused:false,pauseReasons:Object.freeze([]),activeInterruptionIds:Object.freeze([]),resolvedInterruptionIds:Object.freeze([...resolvedInterruptionIds]),completedTaskIds:Object.freeze([...completedTaskIds]),codingRequested:false,aiPhase:'available',aiProgress:0,cycleId:null,batchId:null,reviewAvailable:false,guidanceVisible:false,terminal:true,dayIndex:0,healthRisk:0,tasks:Object.freeze([])});
    window.__WORKDAY_PLAYTEST__=Object.freeze({getSnapshot});return()=>{if(window.__WORKDAY_PLAYTEST__?.getSnapshot===getSnapshot)delete window.__WORKDAY_PLAYTEST__;};
}
