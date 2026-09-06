import { Core, GameObjects, Input, Scene, Scenes } from 'phaser';
import { CodingSession, type CodingSessionSnapshot } from '../domain/CodingSession';
import { EngineeringTaskQueue, type EngineeringTaskQueueSnapshot, type TaskDecisionChoiceDefinition } from '../domain/EngineeringTaskQueue';
import { ENGINEERING_TASKS } from '../content/engineeringTasks';
import { DayState, type DayStateSnapshot, type ResourceKey } from '../domain/DayState';
import { PlayerNeeds, type NeedId, type NeedTransition, type PlayerNeedsSnapshot } from '../domain/PlayerNeeds';
import { BoosterSession, type BoosterId, type BoosterSnapshot } from '../domain/BoosterSession';
import { INTERRUPTION_CATALOG } from '../content/poTeamInterruptions';
import { EventScheduler, type ScheduledCandidate } from '../domain/EventScheduler';
import { ConsequenceQueue } from '../domain/ConsequenceQueue';
import { EffectEngine } from '../domain/EffectEngine';
import { CodingDisruptionLedger } from '../domain/CodingDisruptionLedger';
import type { ConsequenceFeedback,Effect } from '../domain/effects';
import { InterruptionSession, type ActiveInterruptionSnapshot, type InterruptionChoiceDefinition,
    type InterruptionSessionSnapshot, type TransitionBatch } from '../domain/interruptions';
import { REGIONS } from '../ui/layout';
import { actionButton, disabledAction, heading, meter, panel, type ActionView, type MeterView } from '../ui/primitives';
import { COLORS, DEPTH, TYPE } from '../ui/theme';

const textStyle = { fontFamily: TYPE.family, fontSize: TYPE.body, color: COLORS.text } as const;
const mutedStyle = { fontFamily: TYPE.family, fontSize: TYPE.small, color: COLORS.textMuted } as const;
const DECISION_PAUSE_REASON = 'interruption-decision';
const TASK_DECISION_PAUSE_REASON = 'task-decision';
const TASK_SWITCH_FOCUS_COST = 0.2;
const severityColors = { low: COLORS.mint, medium: COLORS.amber, high: COLORS.danger, critical: COLORS.danger } as const;
const severityRanks = { low: 0, medium: 1, high: 2, critical: 3 } as const;
const WORKDAY_DURATION_MS = 8 * 60 * 60_000;

export class Workstation extends Scene {
    workday!: DayState;
    coding!: CodingSession;
    taskQueue!: EngineeringTaskQueue;
    interruptions!: InterruptionSession;
    scheduler!: EventScheduler;
    consequenceQueue!: ConsequenceQueue;
    effectEngine!: EffectEngine;
    disruptions!: CodingDisruptionLedger;
    playerNeeds!: PlayerNeeds;
    boosters!: BoosterSession;
    private resourceViews!: Record<ResourceKey, { value: GameObjects.Text; meter: MeterView }>;
    private clockText!: GameObjects.Text;
    private dayProgressMeter!: MeterView;
    private unsubscribeWorkday?: () => void;
    private unsubscribeCoding?: () => void;
    private unsubscribeTaskQueue?: () => void;
    private unsubscribeInterruptions?: () => void;
    private unsubscribeNeeds?: () => void;
    private advancesWorkday = false;
    private heldCodingSources = new Set<string>();
    private blockedCodingSources = new Set<string>();
    private codingActionBackground!: GameObjects.Rectangle;
    private codingActionLabel!: GameObjects.Text;
    private codingActionDetail!: GameObjects.Text;
    private codingTaskText!: GameObjects.Text;
    private codingProgressText!: GameObjects.Text;
    private codingProgressMeter!: MeterView;
    private focusText!: GameObjects.Text;
    private alertsContent!: GameObjects.Container;
    private alertsCountText!: GameObjects.Text;
    private decisionOverlay?: GameObjects.Container;
    private taskRows?: GameObjects.Container;
    private consequenceFeedbackText?:GameObjects.Text;
    private consequenceFeedback:ConsequenceFeedback[]=[];
    private needViews!: Record<NeedId, { label: GameObjects.Text; meter: MeterView }>;
    private needFeedbackText?: GameObjects.Text;
    private needFeedbackTimer?: Phaser.Time.TimerEvent;
    private toiletAction?: ActionView;
    private boosterActions?: Record<BoosterId, ActionView>;
    private boosterFeedbackText?: GameObjects.Text;
    private bathroomInProgress = false;

    constructor () { super('Workstation'); }

    create () {
        this.cleanupWorkday();
        this.consequenceFeedback.length=0;
        this.workday = new DayState();
        this.coding = new CodingSession();
        this.taskQueue = new EngineeringTaskQueue(ENGINEERING_TASKS);
        this.playerNeeds = new PlayerNeeds({}, this.workday.snapshot.elapsedGameMs);
        this.boosters = new BoosterSession({}, 20260908);
        this.interruptions = new InterruptionSession(INTERRUPTION_CATALOG, this.workday.snapshot.elapsedGameMs, false, () => this.workday.snapshot.resources.technicalDebt);
        this.scheduler = new EventScheduler(INTERRUPTION_CATALOG, {
            minimumSpawnIntervalMs: 20 * 60_000, maximumSpawnIntervalMs: 35 * 60_000,
            activeLimit: 3, endGameMs: WORKDAY_DURATION_MS
        }, 20260906);
        this.consequenceQueue=new ConsequenceQueue();
        this.disruptions=new CodingDisruptionLedger();
        this.effectEngine=new EffectEngine({mutateResource:(resource,amount)=>this.workday.mutateResource(resource,amount),reduceFocus:amount=>this.coding.reduceFocus(amount),reduceTaskProgress:amount=>this.taskQueue.reduceSelectedProgress(amount),disruptions:this.disruptions,queue:this.consequenceQueue,gameTime:()=>this.workday.snapshot.elapsedGameMs,technicalDebt:()=>this.workday.snapshot.resources.technicalDebt,feedback:record=>this.showConsequenceFeedback(record)},20260907);
        this.cameras.main.setBackgroundColor(COLORS.backdrop);
        this.buildBackdrop();
        this.buildResourceHud();
        this.buildDayClock();
        this.buildTasks();
        this.buildLaptop();
        this.buildAlerts();
        this.buildQuickActions();
        this.renderWorkday(this.workday.snapshot);
        this.synchronizeCodingAvailability();
        this.renderCoding(this.coding.snapshot);
        this.renderTaskQueue(this.taskQueue.snapshot);
        this.renderInterruptions(this.interruptions.snapshot);
        this.renderNeeds(this.playerNeeds.snapshot);
        this.updateBoosterAvailability();
        this.unsubscribeWorkday = this.workday.subscribe(snapshot => this.renderWorkday(snapshot));
        this.unsubscribeCoding = this.coding.subscribe(snapshot => this.renderCoding(snapshot));
        this.unsubscribeTaskQueue = this.taskQueue.subscribe(snapshot => { this.renderTaskQueue(snapshot); this.renderCoding(this.coding.snapshot); });
        this.unsubscribeInterruptions = this.interruptions.subscribe(snapshot => this.renderInterruptions(snapshot));
        this.unsubscribeNeeds = this.playerNeeds.subscribe(snapshot => this.renderNeeds(snapshot));
        this.bindCodingInput();
        this.advancesWorkday = true;
        this.events.once(Scenes.Events.SHUTDOWN, this.cleanupWorkday, this);
        this.events.once(Scenes.Events.DESTROY, this.cleanupWorkday, this);
    }

    update (_time: number, delta: number) {
        if (!this.advancesWorkday) return;
        const beforeElapsed = this.workday.snapshot.elapsedGameMs;
        this.workday.advance(delta);
        this.synchronizeWorld();
        const elapsedGameMs = this.workday.snapshot.elapsedGameMs - beforeElapsed;
        const result = this.coding.update(elapsedGameMs, this.workday.snapshot.resources.stamina, this.taskQueue.nextWorkBoundary());
        if (result.staminaCost > 0) this.workday.mutateResource('stamina', -result.staminaCost);
        if (result.workProduced > 0) {
            const transition = this.taskQueue.applyWork(result.workProduced);
            if (transition.completionEffects.length) this.effectEngine.execute(transition.completionEffects, transition.completedTaskId!);
            if (transition.decisionOpened) this.openTaskDecision();
            if (transition.decisionOpened || transition.completedTaskId) this.cancelHeldCodingForDecision();
        }
        this.synchronizeCodingAvailability();
        if (!this.coding.snapshot.isAvailable) this.clearHeldCodingSources();
    }

    private buildBackdrop () {
        this.add.rectangle(640, 360, 1280, 720, COLORS.backdrop).setDepth(DEPTH.background);
        for (let x = 0; x < 1280; x += 64) this.add.line(0, 0, x, 0, x, 720, 0x1b2737, 0.22).setOrigin(0).setDepth(DEPTH.decoration);
        this.add.text(24, 680, 'ANOTHER DAY AT WORK', { fontFamily: TYPE.family, fontSize: 13, color: '#526176', fontStyle: 'bold' }).setDepth(DEPTH.decoration);
    }

    private buildResourceHud () {
        const root = panel(this, REGIONS.resourceHud);
        heading(this, root, 'Workday status');
        this.needViews = {} as Record<NeedId, { label: GameObjects.Text; meter: MeterView }>;
        ([{ id: 'sleepiness', x: 170, color: COLORS.blue }, { id: 'toilet', x: 470, color: COLORS.amber }] as const).forEach(item => {
            const label = this.add.text(item.x, 17, '', { ...mutedStyle, fontSize: 10 });
            root.add(label);
            this.needViews[item.id] = { label, meter: meter(this, root, item.x, 32, 270, 0, item.color) };
        });
        const resources = [
            { key: 'stamina', x: 18, label: 'STAMINA', fill: COLORS.amber },
            { key: 'poHappiness', x: 318, label: 'PO HAPPINESS', fill: COLORS.mint },
            { key: 'systemStability', x: 618, label: 'SYSTEM STABILITY', fill: COLORS.danger }
        ] as const;
        const views = {} as Record<ResourceKey, { value: GameObjects.Text; meter: MeterView }>;
        resources.forEach(item => {
            root.add(this.add.text(item.x, 44, item.label, mutedStyle));
            const value = this.add.text(item.x + 218, 43, '', textStyle).setOrigin(1, 0);
            root.add(value);
            views[item.key] = { value, meter: meter(this, root, item.x, 66, 218, 0, item.fill) };
        });
        this.resourceViews = views;
    }

    private buildDayClock () {
        const root = panel(this, REGIONS.dayClock, COLORS.surfaceRaised);
        heading(this, root, 'Day clock');
        root.add(this.add.text(16, 41, 'MONDAY · DAY 1', mutedStyle));
        this.clockText = this.add.text(274, 34, '', { ...textStyle, fontSize: 28, fontStyle: 'bold' }).setOrigin(1, 0);
        root.add(this.clockText);
        root.add(this.add.text(16, 70, 'DAY PROGRESS', mutedStyle));
        this.dayProgressMeter = meter(this, root, 118, 73, 156, 0, COLORS.mint);
    }

    private buildTasks () {
        const root = panel(this, REGIONS.taskQueue);
        heading(this, root, 'Task queue');
        this.taskRows = this.add.container(0, 0); root.add(this.taskRows);
        root.add(this.add.text(16, 420, 'TECH DEBT', { ...textStyle, fontStyle: 'bold' }));
        const technicalDebtMeter = meter(this, root, 16, 448, 242, 0, COLORS.amber);
        const technicalDebtValue = this.add.text(16, 470, '', mutedStyle);
        root.add(technicalDebtValue);
        this.resourceViews.technicalDebt = { value: technicalDebtValue, meter: technicalDebtMeter };
    }

    private renderTaskQueue(snapshot:EngineeringTaskQueueSnapshot):void{if(!this.taskRows)return;this.taskRows.removeAll(true);const open=snapshot.tasks.filter(t=>!t.isComplete).length;this.taskRows.add(this.add.text(16,40,`${open} OPEN  ·  ${snapshot.tasks.filter(t=>t.priority==='urgent'&&!t.isComplete).length} URGENT`,mutedStyle));snapshot.tasks.forEach((task,index)=>{const y=62+index*68;const color=task.isComplete?COLORS.mint:task.isSelected?COLORS.blue:task.priority==='urgent'?COLORS.danger:COLORS.border;const bg=this.add.rectangle(16,y,242,58,task.isSelected?0x183251:COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(task.isSelected?2:1,color);if(!task.isComplete&&!this.decisionOverlay){bg.setInteractive({useHandCursor:true});bg.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.selectTask(task.id));}this.taskRows!.add([bg,this.add.text(26,y+7,task.title,{...textStyle,fontSize:12,fontStyle:'bold'}),this.add.text(26,y+29,`${task.id} · ${task.priority.toUpperCase()}`,{...mutedStyle,fontSize:9}),this.add.text(248,y+29,task.isComplete?'DONE':`${task.progress.toFixed(0)}%`,{...mutedStyle,color:`#${color.toString(16).padStart(6,'0')}`}).setOrigin(1,0)]);});}

    private selectTask(taskId:string):void{if(this.decisionOverlay)return;const before=this.taskQueue.snapshot.selectedTaskId;if(!before||before===taskId||!this.taskQueue.select(taskId))return;this.coding.reduceFocus(TASK_SWITCH_FOCUS_COST);this.cancelHeldCodingForDecision();this.synchronizeCodingAvailability();}

    private buildLaptop () {
        const root = panel(this, REGIONS.laptop, 0x121b28);
        heading(this, root, 'Current task');
        this.codingTaskText = this.add.text(16, 44, '', { ...mutedStyle, color: '#6db5ff' });
        root.add(this.codingTaskText);
        root.add(this.add.rectangle(28, 82, 580, 338, 0x0a111c).setOrigin(0).setStrokeStyle(3, 0x344861));
        root.add(this.add.rectangle(44, 100, 548, 266, 0x101c2b).setOrigin(0));
        root.add(this.add.text(64, 122, 'search_service.py', mutedStyle));
        const code = ['def search_users(query: str):', '    # TODO: improve performance', '    results = db.search(query)', '    return results'];
        root.add(this.add.text(64, 158, code.join('\n'), { fontFamily: 'monospace', fontSize: 16, color: '#8fdbca', lineSpacing: 10 }));
        const action = this.add.container(132, 292);
        this.codingActionBackground = this.add.rectangle(0, 0, 372, 48, COLORS.blue).setOrigin(0).setStrokeStyle(2, 0x8ac5ff).setInteractive({ useHandCursor: true });
        this.codingActionLabel = this.add.text(186, 15, 'HOLD TO CODE', { ...textStyle, fontStyle: 'bold' }).setOrigin(0.5);
        this.codingActionDetail = this.add.text(186, 35, '', mutedStyle).setOrigin(0.5);
        action.add([this.codingActionBackground, this.codingActionLabel, this.codingActionDetail]);
        root.add(action);
        root.add(this.add.text(44, 386, 'CODING PROGRESS', mutedStyle));
        this.codingProgressMeter = meter(this, root, 168, 389, 350, 0, COLORS.blue);
        this.codingProgressText = this.add.text(592, 381, '', textStyle).setOrigin(1, 0);
        root.add(this.codingProgressText);
        this.focusText = this.add.text(44, 408, '', { ...mutedStyle, color: '#8fdbca' });
        root.add(this.focusText);
        root.add(this.add.polygon(318, 458, [0, 0, 246, 0, 292, 38, -46, 38], 0x303c4c).setStrokeStyle(2, 0x4b5d72));
        root.add(this.add.text(318, 477, 'WORKSTATION', { ...mutedStyle, fontStyle: 'bold' }).setOrigin(0.5));
    }

    private buildAlerts () {
        const root = panel(this, REGIONS.alerts);
        heading(this, root, 'Messages & alerts');
        this.alertsCountText = this.add.text(16, 44, '', mutedStyle);
        this.alertsContent = this.add.container(REGIONS.alerts.x, REGIONS.alerts.y).setDepth(DEPTH.content);
        root.add(this.alertsCountText);
        this.consequenceFeedbackText=this.add.text(16,62,'',{...mutedStyle,color:'#8fdbca',wordWrap:{width:258}});root.add(this.consequenceFeedbackText);
        this.needFeedbackText=this.add.text(16,92,'',{...mutedStyle,fontSize:10,color:'#f5b84b',wordWrap:{width:258}});root.add(this.needFeedbackText);
        this.boosterFeedbackText=this.add.text(16,106,'',{...mutedStyle,fontSize:10,color:'#8fdbca',wordWrap:{width:258}});root.add(this.boosterFeedbackText);
    }

    private renderInterruptions (snapshot: InterruptionSessionSnapshot): void {
        if (!this.alertsContent) return;
        this.alertsCountText.setText(`${snapshot.active.length} ACTIVE  ·  ${this.scheduler?.snapshot.pendingCount ?? 0} PENDING`);
        this.alertsContent.removeAll(true);
        const ordered = [...snapshot.active].sort((a, b) => severityRanks[b.severity] - severityRanks[a.severity]
            || a.activationGameMs - b.activationGameMs || a.activationSequence - b.activationSequence);
        ordered.forEach((event, index) => {
            const y = 120 + index * 116;
            const color = severityColors[event.severity];
            const urgent = severityRanks[event.severity] >= severityRanks.high;
            const background = this.add.rectangle(16, y, 258, 104, urgent ? 0x3a2028 : COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(urgent ? 3 : 1, color).setInteractive({ useHandCursor: true });
            background.on(Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.openDecision(event.id));
            const postponeHit = this.add.rectangle(24, y + 74, 104, 26, COLORS.surfaceMuted).setOrigin(0).setStrokeStyle(1, COLORS.blue).setInteractive({ useHandCursor: true });
            const ignoreHit = this.add.rectangle(142, y + 74, 110, 26, COLORS.surfaceMuted).setOrigin(0).setStrokeStyle(1, COLORS.amber).setInteractive({ useHandCursor: true });
            const postpone = this.add.text(76, y + 81, 'POSTPONE', { ...mutedStyle, color: '#8ac5ff', fontStyle: 'bold' }).setOrigin(0.5, 0);
            const ignore = this.add.text(197, y + 81, 'IGNORE', { ...mutedStyle, color: '#f5b84b', fontStyle: 'bold' }).setOrigin(0.5, 0);
            postponeHit.on(Input.Events.GAMEOBJECT_POINTER_DOWN, () => { this.input.stopPropagation(); this.postponeInterruption(event.id); });
            ignoreHit.on(Input.Events.GAMEOBJECT_POINTER_DOWN, () => { this.input.stopPropagation(); this.ignoreInterruption(event.id); });
            this.alertsContent.add([
                background,
                this.add.text(28, y + 10, event.category.replace('-', ' ').toUpperCase(), { ...mutedStyle, color: `#${color.toString(16).padStart(6, '0')}`, fontStyle: 'bold' }),
                this.add.text(262, y + 10, `${event.severity.toUpperCase()} · ${event.ageGameMinutes}m`, mutedStyle).setOrigin(1, 0),
                this.add.text(28, y + 34, event.title, { ...textStyle, fontStyle: 'bold' }),
                this.add.text(28, y + 57, event.copy, { ...mutedStyle, wordWrap: { width: 226 }, lineSpacing: 2 }), postponeHit, ignoreHit, postpone, ignore
            ]);
        });
        if (snapshot.active.length === 0) this.alertsContent.add(this.add.text(16, 120, 'No active interruptions.', mutedStyle));
        this.renderDecision(snapshot.openInterruption);
    }

    private openDecision (interruptionId: string): void {
        if (this.interruptions.snapshot.openInterruption || this.taskQueue.snapshot.pendingDecision) return;
        this.cancelHeldCodingForDecision();
        if (!this.interruptions.open(interruptionId)) return;
        this.workday.pause(DECISION_PAUSE_REASON);
        this.synchronizeCodingAvailability();
    }

    private renderDecision (event: ActiveInterruptionSnapshot | null): void {
        if (this.taskQueue?.snapshot.pendingDecision) return;
        this.decisionOverlay?.destroy(true);
        this.decisionOverlay = undefined;
        if (!event) return;
        const overlay = this.add.container(0, 0).setDepth(100);
        const scrim = this.add.rectangle(0, 0, 1280, 720, 0x05080d, 0.78).setOrigin(0).setInteractive();
        const card = this.add.rectangle(280, 92, 720, 536, COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(2, severityColors[event.severity]);
        overlay.add([scrim, card]);
        overlay.add(this.add.text(320, 126, `${event.category.replace('-', ' ').toUpperCase()} · ${event.severity.toUpperCase()}`, { ...mutedStyle, color: '#f5b84b', fontStyle: 'bold' }));
        overlay.add(this.add.text(320, 154, event.title, { ...textStyle, fontSize: 25, fontStyle: 'bold' }));
        overlay.add(this.add.text(320, 196, event.copy, { ...textStyle, fontSize: 16, wordWrap: { width: 640 } }));
        overlay.add(this.add.text(320, 238, 'Choose a response · this decision cannot be dismissed', mutedStyle));
        const rowHeight=event.choices.length>2?78:148;
        event.choices.forEach((choice,index)=>this.addDecisionChoice(overlay,choice,320,274+index*rowHeight,event.status==='resolving',rowHeight-12));
        this.decisionOverlay = overlay;
    }

    private openTaskDecision():void{const pending=this.taskQueue.snapshot.pendingDecision;if(!pending)return;this.cancelHeldCodingForDecision();this.workday.pause(TASK_DECISION_PAUSE_REASON);const overlay=this.add.container(0,0).setDepth(100);const scrim=this.add.rectangle(0,0,1280,720,0x05080d,.78).setOrigin(0).setInteractive();const card=this.add.rectangle(280,92,720,536,COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(2,COLORS.blue);overlay.add([scrim,card,this.add.text(320,126,'ENGINEERING DECISION',{...mutedStyle,color:'#8ac5ff',fontStyle:'bold'}),this.add.text(320,154,pending.definition.title,{...textStyle,fontSize:25,fontStyle:'bold'}),this.add.text(320,196,pending.definition.copy,{...textStyle,fontSize:16,wordWrap:{width:640}}),this.add.text(320,238,'Choose a response · coding requires a fresh press',mutedStyle)]);pending.definition.choices.forEach((choice,index)=>this.addTaskDecisionChoice(overlay,choice,320,274+index*148));this.decisionOverlay=overlay;this.renderTaskQueue(this.taskQueue.snapshot);this.synchronizeCodingAvailability();}

    private addTaskDecisionChoice(overlay:GameObjects.Container,choice:TaskDecisionChoiceDefinition,x:number,y:number):void{const background=this.add.rectangle(x,y,640,126,COLORS.surface,1).setOrigin(0).setStrokeStyle(1,COLORS.blue).setInteractive({useHandCursor:true});background.once(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.resolveTaskChoice(choice.id));overlay.add([background,this.add.text(x+18,y+15,choice.label,{...textStyle,fontSize:15,fontStyle:'bold'}),this.add.text(x+622,y+16,`${choice.gameMinutes} MIN`,{...mutedStyle,color:'#8ac5ff',fontStyle:'bold'}).setOrigin(1,0),this.add.text(x+18,y+45,choice.description,{...mutedStyle,wordWrap:{width:590}}),this.add.text(x+18,y+88,[`Clock +${choice.gameMinutes}m`,...choice.effects.map(effect=>this.describeEffect(effect))].join('  ·  '),{...mutedStyle,color:'#cbd5e1',wordWrap:{width:600}})]);}

    private resolveTaskChoice(choiceId:string):void{const choice=this.taskQueue.resolvePendingDecision(choiceId);if(!choice)return;this.workday.spendGameMinutes(choice.gameMinutes);this.effectEngine.execute(choice.effects,`task-decision:${choiceId}`);this.workday.resume(TASK_DECISION_PAUSE_REASON);this.decisionOverlay?.destroy(true);this.decisionOverlay=undefined;this.cancelHeldCodingForDecision();this.synchronizeWorld();this.renderTaskQueue(this.taskQueue.snapshot);}

    private addDecisionChoice (overlay: GameObjects.Container, choice: InterruptionChoiceDefinition, x: number, y: number, disabled: boolean,height=126): void {
        const compact=height<100;const background = this.add.rectangle(x, y, 640, height, disabled ? COLORS.surfaceMuted : COLORS.surface, 1).setOrigin(0).setStrokeStyle(1, disabled ? COLORS.disabled : COLORS.blue);
        if (!disabled) {
            background.setInteractive({ useHandCursor: true });
            background.once(Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.resolveChoice(choice.id));
        }
        overlay.add([
            background,
            this.add.text(x + 18, y + 15, choice.label, { ...textStyle, fontSize: 15, fontStyle: 'bold' }),
            this.add.text(x + 622, y + 16, `${choice.gameMinutes} MIN`, { ...mutedStyle, color: '#8ac5ff', fontStyle: 'bold' }).setOrigin(1, 0),
            this.add.text(x + 18, y + (compact?37:45), choice.description, { ...mutedStyle, wordWrap: { width: 590 } }),
            this.add.text(x + 18, y + (compact?53:88), this.describeEffects(choice), { ...mutedStyle, color: '#cbd5e1', wordWrap: { width: 600 } })
        ]);
    }

    private describeEffects (choice: InterruptionChoiceDefinition): string {
        const effects = choice.effects.map(effect => this.describeEffect(effect));
        return [`Clock +${choice.gameMinutes}m`, ...effects].join('  ·  ');
    }

    private describeEffect(effect:Effect):string{if(effect.type==='resource')return `${effect.amount>=0?'+':''}${effect.amount} ${effect.resource.replace(/([A-Z])/g,' $1')}`;if(effect.type==='focus')return `-${Math.round(effect.reduction*100)}% Focus`;if(effect.type==='task-progress')return `-${effect.reduction}% task progress`;if(effect.type==='coding-disruption')return `${Math.round(effect.speedFactor*100)}% coding for ${Math.round(effect.durationGameMs/60000)}m`;if(effect.type==='delayed')return `Future risk in ${Math.round(effect.delayGameMs/60000)}m`;return `${Math.round(effect.chance*100)}% uncertain outcome`;}

    private resolveChoice (choiceId: string): void {
        const pending = this.interruptions.beginResolution(choiceId);
        if (!pending) return;
        this.workday.spendGameMinutes(pending.choice.gameMinutes);
        this.synchronizeWorld();
        this.effectEngine.execute(pending.choice.effects,pending.interruptionId);
        this.interruptions.finalizeResolution(pending.interruptionId);
        this.scheduler.resolved(pending.interruptionId, candidate => this.activateCandidate(candidate));
        this.workday.resume(DECISION_PAUSE_REASON);
        this.synchronizeCodingAvailability();
        if (!this.workday.snapshot.isPaused) this.synchronizeWorld();
    }

    private postponeInterruption (id: string): void {
        if (this.decisionOverlay || this.workday.snapshot.isPaused) return;
        this.interruptions.postpone(id);
    }

    private ignoreInterruption (id: string): void {
        if (this.decisionOverlay || this.workday.snapshot.isPaused) return;
        this.applyTransitionBatch(this.interruptions.ignore(id));
    }

    private synchronizeInterruptions (): void {
        const day = this.workday.snapshot;
        if (day.isPaused) return;
        const tasks=this.taskQueue.snapshot;const history=this.interruptions.snapshot;
        this.scheduler.synchronize(day.elapsedGameMs,candidate=>this.activateCandidate(candidate),{selectedTaskId:tasks.selectedTaskId,completedTaskIds:tasks.completedTaskIds,resolvedEventIds:history.resolvedIds,resolvedChoices:history.resolvedOutcomes,resources:day.resources});
        let batch = this.interruptions.setCurrentGameMs(day.elapsedGameMs);
        let guard = 0;
        while (batch.length > 0) {
            if (++guard > 1000) throw new Error('Workstation interruption transition limit exceeded.');
            this.applyTransitionBatch(batch);
            batch = this.interruptions.setCurrentGameMs(day.elapsedGameMs);
        }
        this.effectEngine.synchronize(day.elapsedGameMs);
        const wasBlocked=this.disruptions.snapshot.effectiveSpeedFactor===0;
        const expired=this.disruptions.synchronize(day.elapsedGameMs);
        expired.forEach(item=>this.showConsequenceFeedback(Object.freeze({consequenceId:item.id,sourceId:item.sourceId,kind:'concluded',tone:'positive',text:item.endFeedback})));
        if(wasBlocked&&this.disruptions.snapshot.effectiveSpeedFactor>0)this.cancelHeldCodingForDecision();
        this.applyNeedCodingModifiers();
    }

    private synchronizeWorld (): void {
        let guard = 0;
        while (true) {
            if (++guard > 32) throw new Error('Workstation need synchronization limit exceeded.');
            const before = this.workday.snapshot.elapsedGameMs;
            const result = this.playerNeeds.synchronize(before);
            if (result.additionalStaminaCost > 0) this.workday.mutateResource('stamina', -result.additionalStaminaCost);
            result.transitions.forEach(transition => this.applyNeedTransition(transition));
            this.applyNeedCodingModifiers();
            if (this.workday.snapshot.elapsedGameMs === before) break;
        }
        this.synchronizeInterruptions();
        this.synchronizeCodingAvailability();
        this.updateToiletAvailability();
        this.updateBoosterAvailability();
    }

    private applyNeedTransition (transition: NeedTransition): void {
        if (transition.warning) this.showNeedFeedback(transition.warning);
        const effect = transition.criticalEffect;
        if (!effect) return;
        this.coding.reduceFocus(effect.focusReduction);
        if (effect.staminaCost > 0) this.workday.mutateResource('stamina', -effect.staminaCost);
        this.showNeedFeedback(effect.feedback);
        if (effect.timeLossGameMinutes > 0) this.workday.spendGameMinutes(effect.timeLossGameMinutes);
    }

    private applyNeedCodingModifiers (): void {
        const needs = this.playerNeeds.snapshot;
        this.coding.setRuntimeModifiers({ codingSpeed: Math.min(needs.codingSpeedModifier,this.disruptions.snapshot.effectiveSpeedFactor), focusGain: needs.focusGainModifier });
    }

    private showNeedFeedback (message: string): void {
        this.needFeedbackText?.setText(message);
        this.needFeedbackTimer?.remove(false);
        this.needFeedbackTimer = this.time.delayedCall(6_000, () => this.needFeedbackText?.setText(''));
    }

    private activateCandidate (candidate: ScheduledCandidate): boolean {
        return this.interruptions.activate(candidate.definitionId, candidate.dueGameMs, candidate.sequence);
    }

    private applyTransitionBatch (batch: TransitionBatch): void {
        for (const transition of batch) {
            this.effectEngine.execute(transition.effects,transition.interruptionId);
            for (const followUpId of transition.followUpIds) {
                this.scheduler.enqueueFollowUp(followUpId, transition.deadlineGameMs, candidate => this.activateCandidate(candidate));
            }
        }
    }

    private showConsequenceFeedback(record:ConsequenceFeedback):void{this.consequenceFeedback.push(record);if(this.consequenceFeedback.length>2)this.consequenceFeedback.shift();this.consequenceFeedbackText?.setText(this.consequenceFeedback.map(item=>item.text).join('\n'));}

    private buildQuickActions () {
        const root = panel(this, REGIONS.quickActions, COLORS.surfaceRaised);
        this.boosterActions = {
            coffee: actionButton(this, root, 10, 7, 122, 'COFFEE', '+30 Stamina', () => this.activateBooster('coffee')),
            cokeZero: actionButton(this, root, 142, 7, 122, 'COKE ZERO', '+15 Stamina', () => this.activateBooster('cokeZero'))
        };
        this.toiletAction = actionButton(this, root, 274, 7, 122, 'TOILET', `${this.playerNeeds.config.bathroomGameMinutes} min`, () => this.visitBathroom());
        ['HEADPHONES', 'LUNCH'].forEach((action, index) => disabledAction(this, root, 406 + index * 132, 7, 122, action, 'Unavailable'));
    }

    private activateBooster (id: BoosterId): void {
        const activation = this.boosters.activate(id, this.boosterContext());
        if (!activation.accepted || !activation.result) return;
        this.cancelHeldCodingForDecision();
        const result = activation.result;
        this.workday.mutateResource('stamina', result.staminaRestoration);
        if (result.toiletNeedIncrease > 0) {
            const mutation = this.playerNeeds.mutateNeed('toilet', result.toiletNeedIncrease);
            mutation.transitions.forEach(transition => this.applyNeedTransition(transition));
            this.applyNeedCodingModifiers();
        }
        this.boosterFeedbackText?.setText(`${result.feedback} ${this.boosters.config.boosters[id].label} #${result.consumptionCount} consumed.`);
        this.synchronizeCodingAvailability();
        this.updateBoosterAvailability();
    }

    private boosterContext () {
        const day = this.workday.snapshot;
        return { elapsedGameMs: day.elapsedGameMs, stamina: day.resources.stamina, maximumStamina: 100,
            isDecisionOpen: Boolean(this.interruptions.snapshot.openInterruption || this.taskQueue.snapshot.pendingDecision), isDayComplete: day.isDayComplete };
    }

    private updateBoosterAvailability (): void {
        if (!this.boosters || !this.interruptions) return;
        const snapshot = this.boosters.synchronize(this.boosterContext());
        (['coffee', 'cokeZero'] as const).forEach(id => {
            const definition = this.boosters.config.boosters[id];
            const state = snapshot.availability[id];
            this.boosterActions?.[id].setEnabled(state.available, state.available
                ? `+${definition.staminaRestoration} Stamina` : this.describeBoosterUnavailable(snapshot, id));
        });
    }

    private describeBoosterUnavailable (snapshot: BoosterSnapshot, id: BoosterId): string {
        const state = snapshot.availability[id];
        if (state.reason === 'cooldown') return `Cooldown ${Math.ceil(state.remainingCooldownGameMs / 60_000)}m`;
        if (state.reason === 'full-stamina') return 'Stamina full';
        if (state.reason === 'decision-open') return 'Decision open';
        return 'Day complete';
    }

    private visitBathroom (): void {
        if (this.bathroomInProgress || !this.isToiletAvailable()) return;
        this.bathroomInProgress = true;
        try {
            this.cancelHeldCodingForDecision();
            this.coding.reduceFocus(this.playerNeeds.config.bathroomFocusReduction);
            this.workday.spendGameMinutes(this.playerNeeds.config.bathroomGameMinutes);
            this.synchronizeWorld();
            this.playerNeeds.relieve('toilet');
            this.applyNeedCodingModifiers();
            this.showNeedFeedback('Bathroom break complete. Biological incident downgraded.');
            this.synchronizeCodingAvailability();
        } finally {
            this.bathroomInProgress = false;
            this.updateToiletAvailability();
        }
    }

    private isToiletAvailable (): boolean { return !this.workday.snapshot.isDayComplete && !this.interruptions.snapshot.openInterruption && !this.taskQueue.snapshot.pendingDecision; }
    private updateToiletAvailability (): void {
        const enabled = this.isToiletAvailable() && !this.bathroomInProgress;
        this.toiletAction?.setEnabled(enabled, enabled ? `${this.playerNeeds.config.bathroomGameMinutes} min` : 'Unavailable');
    }

    private renderNeeds (snapshot: PlayerNeedsSnapshot): void {
        if (!this.needViews) return;
        (['sleepiness', 'toilet'] as const).forEach(id => {
            const need = snapshot[id];
            this.needViews[id].label.setText(`${need.label.toUpperCase()} · ${need.stage.label} · ${Math.round(need.value)}%`);
            this.needViews[id].meter.setValue(need.severity);
        });
    }

    private renderWorkday (snapshot: DayStateSnapshot): void {
        (['stamina', 'poHappiness', 'systemStability'] as const).forEach(key => {
            const value = snapshot.resources[key];
            this.resourceViews[key].value.setText(`${Math.round(value)} / 100`);
            this.resourceViews[key].meter.setValue(value / 100);
        });
        const debt = snapshot.resources.technicalDebt;
        this.resourceViews.technicalDebt.value.setText(`${Math.round(debt)}%  ·  quietly accumulating`);
        this.resourceViews.technicalDebt.meter.setValue(debt / 100);
        this.clockText.setText(`${String(snapshot.clockHour).padStart(2, '0')}:${String(snapshot.clockMinute).padStart(2, '0')}`);
        this.dayProgressMeter.setValue(snapshot.dayProgress);
        this.updateToiletAvailability();
        this.updateBoosterAvailability();
    }

    private bindCodingInput (): void {
        this.codingActionBackground.on(Input.Events.GAMEOBJECT_POINTER_DOWN, (pointer: Input.Pointer) => {
            this.beginCodingSource(`pointer:${pointer.id}`);
        });
        this.input.on(Input.Events.POINTER_UP, this.releasePointerSource, this);
        this.input.on(Input.Events.POINTER_UP_OUTSIDE, this.releasePointerSource, this);
        this.input.on(Input.Events.GAME_OUT, this.clearPointerSources, this);
        this.input.keyboard?.on(Input.Keyboard.Events.ANY_KEY_DOWN, this.handleCodingKeyDown, this);
        this.input.keyboard?.on(Input.Keyboard.Events.ANY_KEY_UP, this.handleCodingKeyUp, this);
        this.game.events.on(Core.Events.BLUR, this.clearHeldCodingSources, this);
    }

    private handleCodingKeyDown (event: KeyboardEvent): void {
        if (event.code === 'Space') {
            event.preventDefault();
            this.beginCodingSource('keyboard:Space');
        }
    }

    private handleCodingKeyUp (event: KeyboardEvent): void {
        if (event.code === 'Space') this.endCodingSource('keyboard:Space');
    }

    private beginCodingSource (source: string): void {
        if (this.interruptions?.snapshot.openInterruption || this.taskQueue?.snapshot.pendingDecision) return;
        this.synchronizeCodingAvailability();
        if (!this.coding.snapshot.isAvailable || this.heldCodingSources.has(source) || this.blockedCodingSources.has(source)) return;
        this.heldCodingSources.add(source);
        this.coding.requestCoding(true);
    }

    private endCodingSource (source: string): void {
        this.blockedCodingSources.delete(source);
        if (!this.heldCodingSources.delete(source)) return;
        this.coding.requestCoding(this.heldCodingSources.size > 0);
    }

    private releasePointerSource (pointer: Input.Pointer): void {
        this.endCodingSource(`pointer:${pointer.id}`);
    }

    private clearPointerSources (): void {
        for (const source of this.blockedCodingSources) {
            if (source.startsWith('pointer:')) this.blockedCodingSources.delete(source);
        }
        for (const source of this.heldCodingSources) {
            if (source.startsWith('pointer:')) this.heldCodingSources.delete(source);
        }
        this.coding.requestCoding(this.heldCodingSources.size > 0);
    }

    private clearHeldCodingSources (): void {
        if (this.heldCodingSources.size === 0 && !this.coding?.snapshot.isCodingRequested) return;
        this.heldCodingSources.clear();
        this.coding?.cancelCoding();
    }

    private cancelHeldCodingForDecision (): void {
        this.heldCodingSources.forEach(source => this.blockedCodingSources.add(source));
        this.clearHeldCodingSources();
    }

    private synchronizeCodingAvailability (): void {
        const day = this.workday.snapshot;
        this.coding.synchronizeAvailability(!day.isPaused && !day.isDayComplete, day.resources.stamina, Boolean(this.taskQueue.snapshot.selectedTask) && !this.taskQueue.snapshot.pendingDecision);
    }

    private renderCoding (snapshot: CodingSessionSnapshot): void {
        const task=this.taskQueue.snapshot.selectedTask;
        this.codingTaskText.setText(task?`${task.id}  ·  ${task.title.toUpperCase()}`:'ALL TASKS COMPLETE');
        this.codingProgressText.setText(task?`${task.progress.toFixed(1)}%`:'100%');
        this.codingProgressMeter.setValue(task?task.progress/100:1);
        this.focusText.setText(`FOCUS  ×${snapshot.focusMultiplier.toFixed(2)}`);
        this.codingActionBackground.disableInteractive();
        if (!snapshot.isAvailable) {
            this.codingActionBackground.setFillStyle(COLORS.surfaceMuted).setStrokeStyle(2, COLORS.disabled).setAlpha(0.72);
            this.codingActionLabel.setColor(COLORS.textMuted).setText('CODING UNAVAILABLE');
            const day = this.workday.snapshot;
            const reason = !task ? 'All tasks complete' : this.taskQueue.snapshot.pendingDecision ? 'Task decision open'
                : this.disruptions.snapshot.effectiveSpeedFactor===0 ? (this.disruptions.snapshot.reason??'Tooling disruption')
                : day.isDayComplete ? 'Workday complete' : day.isPaused ? 'Workday paused' : 'Stamina exhausted';
            this.codingActionDetail.setText(reason);
            return;
        }
        this.codingActionBackground.setInteractive({ useHandCursor: true });
        this.codingActionLabel.setColor(COLORS.text).setText(snapshot.isCoding ? 'CODING…' : 'HOLD TO CODE');
        const disruption=this.disruptions.snapshot;
        this.codingActionDetail.setText(snapshot.isCoding ? (disruption.effectiveSpeedFactor<1?`Tooling slowdown · ${Math.round(disruption.effectiveSpeedFactor*100)}% speed`:'Keep holding to build Focus') : 'Pointer or Space');
        this.codingActionBackground.setFillStyle(snapshot.isCoding ? COLORS.mint : COLORS.blue)
            .setStrokeStyle(2, snapshot.isCoding ? 0xa4f2dc : 0x8ac5ff)
            .setAlpha(1);
    }

    private cleanupWorkday (): void {
        this.advancesWorkday = false;
        this.unsubscribeWorkday?.();
        this.unsubscribeWorkday = undefined;
        this.unsubscribeCoding?.();
        this.unsubscribeCoding = undefined;
        this.unsubscribeTaskQueue?.();
        this.unsubscribeTaskQueue = undefined;
        this.unsubscribeInterruptions?.();
        this.unsubscribeInterruptions = undefined;
        this.unsubscribeNeeds?.();
        this.unsubscribeNeeds = undefined;
        this.scheduler?.reset();
        this.interruptions?.reset();
        this.effectEngine?.reset();
        this.consequenceFeedback.length=0;
        this.consequenceFeedbackText=undefined;
        this.needFeedbackTimer?.remove(false);
        this.needFeedbackTimer = undefined;
        this.needFeedbackText = undefined;
        this.toiletAction?.destroy();
        this.toiletAction = undefined;
        this.boosterActions?.coffee.destroy();
        this.boosterActions?.cokeZero.destroy();
        this.boosterActions = undefined;
        this.boosters?.reset();
        this.boosterFeedbackText = undefined;
        this.bathroomInProgress = false;
        this.clearHeldCodingSources();
        this.blockedCodingSources.clear();
        this.workday?.resume(DECISION_PAUSE_REASON);
        this.workday?.resume(TASK_DECISION_PAUSE_REASON);
        this.decisionOverlay?.destroy(true);
        this.decisionOverlay = undefined;
        this.input?.off(Input.Events.POINTER_UP, this.releasePointerSource, this);
        this.input?.off(Input.Events.POINTER_UP_OUTSIDE, this.releasePointerSource, this);
        this.input?.off(Input.Events.GAME_OUT, this.clearPointerSources, this);
        this.input?.keyboard?.off(Input.Keyboard.Events.ANY_KEY_DOWN, this.handleCodingKeyDown, this);
        this.input?.keyboard?.off(Input.Keyboard.Events.ANY_KEY_UP, this.handleCodingKeyUp, this);
        this.game?.events.off(Core.Events.BLUR, this.clearHeldCodingSources, this);
        this.events.off(Scenes.Events.SHUTDOWN, this.cleanupWorkday, this);
        this.events.off(Scenes.Events.DESTROY, this.cleanupWorkday, this);
    }
}
