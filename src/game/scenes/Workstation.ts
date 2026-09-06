import { Core, GameObjects, Input, Scene, Scenes } from 'phaser';
import { CodingSession, type CodingSessionSnapshot } from '../domain/CodingSession';
import { EngineeringTaskQueue, type EngineeringTaskQueueSnapshot, type TaskDecisionChoiceDefinition } from '../domain/EngineeringTaskQueue';
import { DayState, type DayStateSnapshot, type ResourceKey } from '../domain/DayState';
import { PlayerNeeds, type NeedId, type NeedTransition, type PlayerNeedsSnapshot } from '../domain/PlayerNeeds';
import { BoosterSession, type BoosterId, type BoosterSnapshot } from '../domain/BoosterSession';
import { EventScheduler, SeededRandom, type ScheduledCandidate } from '../domain/EventScheduler';
import { ConsequenceQueue } from '../domain/ConsequenceQueue';
import { EffectEngine } from '../domain/EffectEngine';
import { CodingDisruptionLedger } from '../domain/CodingDisruptionLedger';
import type { ConsequenceFeedback,Effect } from '../domain/effects';
import { createRunContext, InterruptionSession, type ActiveInterruptionSnapshot,
    type InterruptionSessionSnapshot, type TransitionBatch } from '../domain/interruptions';
import { REGIONS } from '../ui/layout';
import { heading, meter, panel, roundedSurface, toolbarActionButton, type ActionView, type MeterView } from '../ui/primitives';
import { COLORS, DEPTH, TYPE } from '../ui/theme';
import { WorkdaySession } from '../domain/WorkdaySession';
import { DEVELOPER_PACING_PROFILE,NORMAL_PACING_PROFILE,WORKDAY_DURATION_MS } from '../domain/WorkdayPacing';
import { derivePresentationState } from '../presentation/PresentationState';
import { gameAudio, SceneAudioDirector } from '../audio/GameAudio';
import { browserGuidanceStorage, GuidancePreference } from '../presentation/GuidancePreference';
import { createGuidanceOverlay, type GuidanceOverlayView } from '../presentation/GuidanceOverlay';
import { InteractionLifecycle, type InteractionCancelReason } from '../presentation/InteractionLifecycle';
import { installWorkstationDiagnostics } from '../presentation/PlaytestDiagnostics';
import { presentationTexture, STRESS_BUNDLES } from '../presentation/assets';
import { notificationIdentity } from '../presentation/identities';
import { configureHighDpiScene } from '../presentation/HighDpiRendering';

const textStyle = { fontFamily: TYPE.family, fontSize: TYPE.body, color: COLORS.text } as const;
const mutedStyle = { fontFamily: TYPE.family, fontSize: TYPE.small, color: COLORS.textMuted } as const;
const DECISION_PAUSE_REASON = 'interruption-decision';
const TASK_DECISION_PAUSE_REASON = 'task-decision';
const GUIDANCE_PAUSE_REASON = 'first-run-guidance';
const VISIBILITY_PAUSE_REASON = 'browser-visibility';
const EXPLICIT_PAUSE_REASON = 'player-pause';
const TASK_SWITCH_FOCUS_COST = 0.2;
const severityRanks = { low: 0, medium: 1, high: 2, critical: 3 } as const;

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
    session!:WorkdaySession;
    private pacingOverlay?:GameObjects.Container;
    private pacingOverlayText?:GameObjects.Text;
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
    private planActionBackground!: GameObjects.Rectangle;
    private planActionLabel!: GameObjects.Text;
    private planActionDetail!: GameObjects.Text;
    private codingTaskText!: GameObjects.Text;
    private codingProgressText!: GameObjects.Text;
    private codingProgressMeter!: MeterView;
    private focusText!: GameObjects.Text;
    private floatingAlerts?:GameObjects.Container;
    private alertsCountText!: GameObjects.Text;
    private alertPreviousButton!:GameObjects.Rectangle;
    private alertNextButton!:GameObjects.Rectangle;
    private alertPreviousLabel!:GameObjects.Text;
    private alertNextLabel!:GameObjects.Text;
    private alertPage=0;
    private alertSlots=new Map<string,number>();
    private alertSlotRandom?:SeededRandom;
    private decisionOverlay?: GameObjects.Container;
    private taskRows?: GameObjects.Container;
    private taskFilter:'all'|'current'|'urgent'='all';
    private taskTabs?:Record<'all'|'current'|'urgent',{background:GameObjects.Rectangle;label:GameObjects.Text}>;
    private consequenceFeedbackText?:GameObjects.Text;
    private consequenceFeedback:ConsequenceFeedback[]=[];
    private needViews!: Record<NeedId, { label: GameObjects.Text; meter: MeterView }>;
    private needFeedbackText?: GameObjects.Text;
    private needFeedbackTimer?: Phaser.Time.TimerEvent;
    private toiletAction?: ActionView;
    private boosterActions?: Record<BoosterId, ActionView>;
    private boosterFeedbackText?: GameObjects.Text;
    private bathroomInProgress = false;
    private resultsStarted=false;
    private decor?:GameObjects.Container;private stressText?:GameObjects.Text;private muteText?:GameObjects.Text;private stressWash?:GameObjects.Rectangle;
    private audio?:SceneAudioDirector;private detachAudio?:()=>void;private unsubscribeAudio?:()=>void;
    private knownAlerts=new Set<string>();private initializedAlerts=false;private criticalNeeds=new Set<NeedId>();
    private guidancePreference?:GuidancePreference;private guidanceOverlay?:GuidanceOverlayView;private guidanceDismissed=false;
    private lifecycle?:InteractionLifecycle;private removeDiagnostics?:()=>void;private pauseText?:GameObjects.Text;

    constructor () { super('Workstation'); }

    create () {
        configureHighDpiScene(this);
        this.cleanupWorkday();
        this.input.enabled=true;this.input.resetPointers();this.input.keyboard?.resetKeys();
        this.consequenceFeedback.length=0;
        this.resultsStarted=false;
        const profile=import.meta.env.VITE_PACING_PROFILE==='developer'?DEVELOPER_PACING_PROFILE:NORMAL_PACING_PROFILE;
        this.session=new WorkdaySession(profile,20260906,record=>this.showConsequenceFeedback(record),false);
        this.alertSlotRandom=new SeededRandom(this.session.seed+101);
        this.workday=this.session.workday;this.coding=this.session.coding;this.taskQueue=this.session.taskQueue;this.playerNeeds=this.session.playerNeeds;this.boosters=this.session.boosters;this.interruptions=this.session.interruptions;this.scheduler=this.session.scheduler;this.consequenceQueue=this.session.consequenceQueue;this.disruptions=this.session.disruptions;this.effectEngine=this.session.effectEngine;
        this.cameras.main.setBackgroundColor(COLORS.backdrop);
        this.buildBackdrop();
        this.audio=new SceneAudioDirector(this.sound);this.detachAudio=gameAudio.attach(this.sound);this.buildMuteControl();this.buildPauseControl();
        this.buildStatusSidebar();
        this.buildDayClock();
        this.buildTasks();
        this.buildLaptop();
        this.buildAlerts();
        this.buildQuickActions();
        this.buildPacingOverlay();
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
        this.bindLifecycle();
        this.guidancePreference=new GuidancePreference(browserGuidanceStorage());
        if(!this.guidancePreference.dismissed)this.openGuidance();
        this.removeDiagnostics=installWorkstationDiagnostics(this,()=>Boolean(this.guidanceOverlay));
        this.advancesWorkday = true;
        this.events.once(Scenes.Events.SHUTDOWN, this.cleanupWorkday, this);
        this.events.once(Scenes.Events.DESTROY, this.cleanupWorkday, this);
    }

    update (_time: number, delta: number) {
        if (!this.advancesWorkday) return;
        this.session.advanceRealMs(delta);
        this.renderCoding(this.coding.snapshot);
        if(this.taskQueue.snapshot.pendingDecision&&!this.decisionOverlay)this.openTaskDecision();
        this.enterResultsIfComplete();
    }

    private buildBackdrop () {
        this.add.image(640,360,presentationTexture(this,'presentation.background.office')).setDisplaySize(1280,720).setDepth(DEPTH.background);
        this.add.image(640,360,presentationTexture(this,'presentation.environment.desk')).setDisplaySize(1280,720).setDepth(DEPTH.environment);
        if(this.textures.exists('presentation.character.calm'))this.add.image(640,155,'presentation.character.calm').setDisplaySize(344,230).setDepth(DEPTH.character);
        if(this.textures.exists('presentation.ui.laptop-shell'))this.add.image(640,474,'presentation.ui.laptop-shell').setDisplaySize(520,378).setDepth(DEPTH.environment);
        if(this.textures.exists('presentation.foreground.frame'))this.add.image(640,360,'presentation.foreground.frame').setDisplaySize(1280,720).setDepth(DEPTH.foreground);
        this.stressWash=this.add.rectangle(0,0,1280,720,0x6b2438,0).setOrigin(0).setDepth(DEPTH.character+1);
        this.decor=this.add.container(0,0).setDepth(DEPTH.foreground);this.stressText=this.add.text(80,684,'',{fontFamily:TYPE.family,fontSize:11,color:'#3b2431',fontStyle:'bold'});this.decor.add(this.stressText);
    }

    private buildMuteControl():void{const visual=roundedSurface(this,1144,658,112,54,0x1b2836,COLORS.borderStrong,9,.98,2).setDepth(DEPTH.controls),bg=this.add.rectangle(1144,658,112,54,0xffffff,0).setOrigin(0).setDepth(DEPTH.controls).setInteractive({useHandCursor:true});this.add.text(1165,684,'♫',{fontFamily:TYPE.family,fontSize:19,color:'#73d7b7'}).setOrigin(.5).setDepth(DEPTH.controls);this.muteText=this.add.text(1182,675,'',{fontFamily:TYPE.family,fontSize:9,color:COLORS.text,fontStyle:'bold'}).setDepth(DEPTH.controls);this.add.text(1182,691,'Toggle audio',{fontFamily:TYPE.family,fontSize:7,color:'#9fb0bd'}).setDepth(DEPTH.controls);const paint=(border:number)=>visual.clear().fillStyle(0x1b2836,.98).fillRoundedRect(1144,658,112,54,9).lineStyle(2,border).strokeRoundedRect(1144,658,112,54,9);bg.on(Input.Events.GAMEOBJECT_POINTER_OVER,()=>paint(COLORS.focus)).on(Input.Events.GAMEOBJECT_POINTER_OUT,()=>paint(COLORS.borderStrong)).on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>gameAudio.toggle());this.unsubscribeAudio=gameAudio.subscribe(()=>{this.audio?.sync();this.muteText?.setText(gameAudio.muted?'SOUND OFF':'SOUND ON');});}

    private buildPauseControl():void{const visual=roundedSurface(this,1028,658,108,54,0x1b2836,COLORS.borderStrong,9,.98,2).setDepth(DEPTH.controls),bg=this.add.rectangle(1028,658,108,54,0xffffff,0).setOrigin(0).setDepth(DEPTH.controls).setInteractive({useHandCursor:true});this.add.text(1048,684,'⏸',{fontFamily:TYPE.family,fontSize:18,color:'#f2bd61'}).setOrigin(.5).setDepth(DEPTH.controls);this.pauseText=this.add.text(1065,675,'PAUSE',{fontFamily:TYPE.family,fontSize:9,color:COLORS.text,fontStyle:'bold'}).setDepth(DEPTH.controls);this.add.text(1065,691,'Take a breath',{fontFamily:TYPE.family,fontSize:7,color:'#9fb0bd'}).setDepth(DEPTH.controls);const paint=(border:number)=>visual.clear().fillStyle(0x1b2836,.98).fillRoundedRect(1028,658,108,54,9).lineStyle(2,border).strokeRoundedRect(1028,658,108,54,9);bg.on(Input.Events.GAMEOBJECT_POINTER_OVER,()=>paint(COLORS.focus)).on(Input.Events.GAMEOBJECT_POINTER_OUT,()=>paint(COLORS.borderStrong)).on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.toggleExplicitPause());}

    private renderPresentation():void{if(!this.decor)return;const state=derivePresentationState({dayProgress:this.workday.snapshot.dayProgress,technicalDebt:this.workday.snapshot.resources.technicalDebt,activeAlerts:this.interruptions.snapshot.active});const bundle=STRESS_BUNDLES[state.stage];this.stressText?.setText(`DESK STATUS · ${state.stage.toUpperCase()}`);this.tweens.add({targets:this.stressWash,alpha:bundle.alpha,duration:240,ease:'Sine.easeOut'});const slots=[{x:306,y:30,w:48,h:28,label:'NOTE'},{x:902,y:78,w:42,h:20,label:'PAPERS'},{x:780,y:705,w:92,h:8,label:'CABLE'}];this.decor.list.slice(1).forEach(child=>child.destroy());bundle.props.forEach((label,index)=>{const slot=slots[index];const note=this.add.rectangle(slot.x,slot.y,slot.w,slot.h,index%2?0xc99e52:0xd4c591,.92).setOrigin(0).setAngle(index%2?3:-2);this.decor!.add([note,this.add.text(slot.x+slot.w/2,slot.y+slot.h/2,label.toUpperCase(),{fontFamily:TYPE.family,fontSize:7,color:'#332a22',fontStyle:'bold'}).setOrigin(.5).setAngle(note.angle)]);});}

    private buildStatusSidebar () {
        const root = panel(this, REGIONS.statusSidebar,0x172331).setDepth(DEPTH.controls);
        heading(this,root,'Workday status');
        this.needViews = {} as Record<NeedId, { label: GameObjects.Text; meter: MeterView }>;
        const resources = [
            { key: 'stamina', y: 46, label: 'Stamina', fill: COLORS.amber, icon:'☕' },
            { key: 'poHappiness', y: 112, label: 'PO Happiness', fill: COLORS.mint, icon:'PO' },
            { key: 'systemStability', y: 178, label: 'System Stability', fill: COLORS.danger, icon:'SYS' }
        ] as const;
        const views = {} as Record<ResourceKey, { value: GameObjects.Text; meter: MeterView }>;
        resources.forEach(item => {
            root.add(this.add.rectangle(14,item.y,38,42,item.key==='poHappiness'?0xf0b990:0x263648).setOrigin(0).setStrokeStyle(1,0x607487));
            root.add(this.add.text(33,item.y+21,item.icon,{fontFamily:TYPE.family,fontSize:item.icon.length>2?8:17,color:'#ffffff',fontStyle:'bold'}).setOrigin(.5));
            root.add(this.add.text(62,item.y,item.label,{...textStyle,fontSize:11,fontStyle:'bold'}));
            const value = this.add.text(238,item.y+1,'',{...textStyle,fontSize:9,fontStyle:'bold'}).setOrigin(1,0);
            root.add(value);
            views[item.key] = { value, meter: meter(this, root, 62,item.y+25,176,0,item.fill) };
        });
        this.resourceViews = views;
        root.add(this.add.rectangle(12,238,228,1,0x52616b,.65).setOrigin(0));
        root.add(this.add.text(14,252,'PERSONAL NEEDS',{...mutedStyle,fontSize:9,color:'#d8e2ea',fontStyle:'bold'}));
        ([{id:'sleepiness',y:280,color:COLORS.blue},{id:'toilet',y:336,color:COLORS.amber}] as const).forEach(item=>{
            const label=this.add.text(14,item.y,'',{...mutedStyle,fontSize:8});root.add(label);
            this.needViews[item.id]={label,meter:meter(this,root,14,item.y+22,224,0,item.color)};
        });
        root.add(this.add.rectangle(12,398,228,1,0x52616b,.65).setOrigin(0));
        root.add(this.add.text(14,412,'LIVE FEEDBACK',{...mutedStyle,fontSize:9,color:'#d8e2ea',fontStyle:'bold'}));
        this.consequenceFeedbackText=this.add.text(14,438,'',{...mutedStyle,fontSize:7,color:'#8fdbca',wordWrap:{width:224},lineSpacing:1});
        this.needFeedbackText=this.add.text(14,480,'',{...mutedStyle,fontSize:7,color:'#f5b84b',wordWrap:{width:224},lineSpacing:1});
        this.boosterFeedbackText=this.add.text(14,522,'',{...mutedStyle,fontSize:7,color:'#8fdbca',wordWrap:{width:224},lineSpacing:1});
        root.add([this.consequenceFeedbackText,this.needFeedbackText,this.boosterFeedbackText]);
    }

    private buildDayClock () {
        const root = panel(this, REGIONS.dayClock,0x172331).setDepth(DEPTH.controls);
        root.add(this.add.text(16,10,'MONDAY · APR 21',{...mutedStyle,fontSize:8}));
        this.clockText = this.add.text(16, 23, '', { ...textStyle, fontSize: 24, fontStyle: 'bold' });
        root.add(this.clockText);
        root.add(this.add.text(126,21,'☀',{fontFamily:TYPE.family,fontSize:22,color:'#ffc43d'}));
        root.add(this.add.text(286,10,'JUST ONE\nMORE COMMIT…',{fontFamily:TYPE.family,fontSize:8,color:'#e9d79f',fontStyle:'italic',align:'center'}).setOrigin(1,0));
        root.add(this.add.text(16, 55, 'DAY PROGRESS', { ...mutedStyle, fontSize: 7 }));
        this.dayProgressMeter = meter(this, root, 86, 57, 156, 0, COLORS.mint);
        root.add(this.add.text(276,54,'17:00',{...mutedStyle,fontSize:8}).setOrigin(1,0));
    }

    private buildTasks () {
        const root = panel(this, REGIONS.taskQueue,0x172331).setDepth(DEPTH.controls);
        heading(this, root, '☷  Tasks');
        root.add(this.add.text(230,15,'×',{fontFamily:TYPE.family,fontSize:18,color:'#9badbd'}).setOrigin(1,0));
        this.taskTabs={} as typeof this.taskTabs;
        ([{id:'all',x:12,w:68,label:'ALL'},{id:'current',x:84,w:76,label:'CURRENT'},{id:'urgent',x:164,w:74,label:'URGENT'}] as const).forEach(item=>{
            const background=this.add.rectangle(item.x,44,item.w,28,COLORS.surfaceMuted).setOrigin(0).setInteractive({useHandCursor:true});
            const label=this.add.text(item.x+item.w/2,58,item.label,{fontFamily:TYPE.family,fontSize:9,color:'#aebdca',fontStyle:'bold'}).setOrigin(.5);
            background.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.setTaskFilter(item.id));
            this.taskTabs![item.id]={background,label};root.add([background,label]);
        });
        this.paintTaskTabs();
        this.taskRows = this.add.container(0, 0); root.add(this.taskRows);
        root.add(this.add.rectangle(0,446,250,1,0x52616b,.65).setOrigin(0));
        for(let index=0;index<3;index++)root.add(this.add.rectangle(18+index*3,470-index*5,32,9,0xe3a936).setOrigin(0).setStrokeStyle(1,0x8f6517));
        root.add(this.add.text(58,460,'Tech Debt',{fontFamily:TYPE.family,fontSize:13,color:COLORS.text,fontStyle:'bold'}));
        const technicalDebtMeter = meter(this, root, 58, 486, 132, 0, COLORS.amber);
        const technicalDebtValue = this.add.text(232,479, '', {...textStyle,fontSize:14,fontStyle:'bold'}).setOrigin(1,0);
        root.add([technicalDebtValue,this.add.text(58,510,"It's watching you...  👀",{...mutedStyle,fontSize:9,color:'#9fb0bd'})]);
        this.resourceViews.technicalDebt = { value: technicalDebtValue, meter: technicalDebtMeter };
    }

    private setTaskFilter(filter:'all'|'current'|'urgent'):void{if(this.taskFilter===filter)return;this.taskFilter=filter;this.paintTaskTabs();this.renderTaskQueue(this.taskQueue.snapshot);}

    private paintTaskTabs():void{if(!this.taskTabs)return;(Object.keys(this.taskTabs) as Array<keyof typeof this.taskTabs>).forEach(id=>{const tab=this.taskTabs![id],active=id===this.taskFilter;tab.background.setFillStyle(active?0x286aa1:0x202d3d).setStrokeStyle(1,active?0x70b7ef:0x34485d);tab.label.setColor(active?'#ffffff':'#aebdca');});}

    private renderTaskQueue(snapshot:EngineeringTaskQueueSnapshot):void{
        if(!this.taskRows)return;this.taskRows.removeAll(true);
        const tasks=snapshot.tasks.filter(task=>task.status!=='dormant'&&(this.taskFilter==='all'||(this.taskFilter==='current'&&task.isSelected)||(this.taskFilter==='urgent'&&(task.priority==='urgent'||(task.remainingGameMs!==null&&task.remainingGameMs<=30*60_000))&&!task.isComplete)));
        if(!tasks.length){this.taskRows.add(this.add.text(18,104,this.taskFilter==='urgent'?'No urgent tasks. Nice.':'No task selected.',{...mutedStyle,color:'#d8e2ea'}));return;}
        tasks.forEach((task,index)=>{
            const y=82+index*58,selected=task.isSelected,urgent=task.status==='active'&&(task.priority==='urgent'||(task.remainingGameMs!==null&&task.remainingGameMs<=30*60_000));
            const fill=selected?0x1c5d91:urgent?0xf7d5de:0xf2f5f8,border=selected?0x68bfff:urgent?0xf05c75:0xaeb9c3,text=selected?'#ffffff':'#172331',sub=selected?'#c9e7ff':'#667585';
            if(selected)this.taskRows!.add(roundedSurface(this,12,y,226,62,0x3b9ee8,0x2b8ed5,10,.22,4));
            const cardSurface=roundedSurface(this,16,y+3,218,50,fill,border,8,1,selected?2:1);
            const bg=this.add.rectangle(16,y+3,218,50,0xffffff,0).setOrigin(0);
            if(task.status==='active'&&!this.decisionOverlay){bg.setInteractive({useHandCursor:true});bg.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.selectTask(task.id));}
            const iconFill=task.isComplete?0x40ae73:task.status==='failed'?0x8f3949:selected?0x367eb4:urgent?0xee6680:0xe5ebf0;
            const icon=this.add.rectangle(25,y+14,18,18,iconFill).setOrigin(0).setStrokeStyle(1,selected?0xa9dcff:0x8798a7);
            const pillColor=task.isComplete?0x40ae73:task.priority==='low'?0x40ae73:task.priority==='medium'?0xd99820:task.priority==='high'?0xec624c:0xd92f4d;
            const pillLabel=task.isComplete?'DONE':task.status==='failed'?'FAILED':urgent?'URGENT':task.priority.toUpperCase();const pillWidth=Math.max(42,pillLabel.length*6+12);
            const pill=this.add.rectangle(224-pillWidth,y+35,pillWidth,18,pillColor).setOrigin(0);
            this.taskRows!.add([cardSurface,bg,icon,this.add.text(34,y+23,task.isComplete?'✓':'↗',{fontFamily:TYPE.family,fontSize:10,color:'#ffffff',fontStyle:'bold'}).setOrigin(.5),
                this.add.text(51,y+11,task.title,{fontFamily:TYPE.family,fontSize:10,color:text,fontStyle:'bold'}),
                this.add.text(51,y+27,[task.id,task.stakeholder,task.deadlineGameMs!==null?`due ${String(9+Math.floor((task.deadlineGameMs%WORKDAY_DURATION_MS)/3_600_000)).padStart(2,'0')}:${String(Math.floor((task.deadlineGameMs%3_600_000)/60_000)).padStart(2,'0')} · ${Math.ceil((task.remainingGameMs??0)/60_000)}m`:task.status==='active'?'untimed':undefined].filter(Boolean).join(' · '),{fontFamily:TYPE.family,fontSize:7,color:sub}),pill,
                this.add.text(224-pillWidth/2,y+44,pillLabel,{fontFamily:TYPE.family,fontSize:8,color:'#ffffff',fontStyle:'bold'}).setOrigin(.5),
                this.add.text(224,y+12,task.isComplete?'100%':`${task.progress.toFixed(0)}%`,{fontFamily:TYPE.family,fontSize:8,color:sub}).setOrigin(1,0)
            ]);
        });
    }

    private selectTask(taskId:string):void{if(this.decisionOverlay)return;const before=this.taskQueue.snapshot.selectedTaskId;if(!before||before===taskId||!this.taskQueue.select(taskId))return;this.coding.reduceFocus(TASK_SWITCH_FOCUS_COST);this.cancelHeldCodingForDecision();this.synchronizeCodingAvailability();}

    private buildLaptop () {
        const root = panel(this, REGIONS.laptop, 0x121b28);
        heading(this, root, 'Current task',16,10);
        this.codingTaskText = this.add.text(16, 30, '', { ...mutedStyle, fontSize:8,color: '#6db5ff' });
        root.add(this.codingTaskText);
        root.add(roundedSurface(this,16,46,388,142,0x0a111c,0x344861,8,1,3));
        root.add(roundedSurface(this,25,55,370,124,0x101c2b,0x1e3044,5));
        root.add(this.add.text(38, 62, 'search_service.py', {...mutedStyle,fontSize:8}));
        const code = ['def search_users(query: str):', '    # TODO: improve performance', '    results = db.search(query)', '    return results'];
        root.add(this.add.text(38, 79, code.join('\n'), { fontFamily: 'monospace', fontSize: 9, color: '#8fdbca', lineSpacing: 3 }));
        const action = this.add.container(24, 92);
        this.codingActionBackground = this.add.rectangle(0, 0, 178, 42, COLORS.blue).setOrigin(0).setStrokeStyle(2, 0x8ac5ff).setInteractive({ useHandCursor: true });
        this.codingActionLabel = this.add.text(89, 12, 'PROMPT MODE', { ...textStyle,fontSize:10, fontStyle: 'bold' }).setOrigin(0.5);
        this.codingActionDetail = this.add.text(89, 29, 'Fast · more uncertain', {...mutedStyle,fontSize:7}).setOrigin(0.5);
        this.planActionBackground = this.add.rectangle(186, 0, 178, 42, COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(2, COLORS.mint).setInteractive({ useHandCursor: true });
        this.planActionLabel = this.add.text(275, 12, 'PLAN MODE', { ...textStyle,fontSize:10, fontStyle: 'bold' }).setOrigin(0.5);
        this.planActionDetail = this.add.text(275, 29, 'Slower · safer', {...mutedStyle,fontSize:7}).setOrigin(0.5);
        action.add([this.codingActionBackground, this.codingActionLabel, this.codingActionDetail,this.planActionBackground,this.planActionLabel,this.planActionDetail]);
        root.add(action);
        root.add(this.add.text(24, 202, 'CODING PROGRESS', {...mutedStyle,fontSize:8}));
        this.codingProgressMeter = meter(this, root, 126, 204, 226, 0, COLORS.blue);
        this.codingProgressText = this.add.text(394, 198, '', {...textStyle,fontSize:9}).setOrigin(1, 0);
        root.add(this.codingProgressText);
        this.focusText = this.add.text(24, 224, '', { ...mutedStyle,fontSize:8, color: '#8fdbca' });
        root.add(this.focusText);
        root.add(this.add.polygon(210, 252, [0, 0, 158, 0, 184, 38, -26, 38], 0x303c4c).setStrokeStyle(2, 0x4b5d72));
        root.add(this.add.text(210, 271, 'WORKSTATION', { ...mutedStyle,fontSize:8, fontStyle: 'bold' }).setOrigin(0.5));
    }

    private buildAlerts () {
        const root=this.add.container(430,14).setDepth(DEPTH.controls);
        root.add(roundedSurface(this,0,0,420,38,0x172331,COLORS.borderStrong,9,.96,2));
        this.alertPreviousButton=this.add.rectangle(7,6,36,26,0x24384b).setOrigin(0);
        this.alertNextButton=this.add.rectangle(377,6,36,26,0x24384b).setOrigin(0);
        this.alertPreviousLabel=this.add.text(25,19,'‹',{...textStyle,fontSize:18,fontStyle:'bold'}).setOrigin(.5);
        this.alertNextLabel=this.add.text(395,19,'›',{...textStyle,fontSize:18,fontStyle:'bold'}).setOrigin(.5);
        this.alertsCountText=this.add.text(210,19,'',{...mutedStyle,fontSize:9,color:'#8ac5ff',fontStyle:'bold'}).setOrigin(.5);
        root.add([this.alertPreviousButton,this.alertNextButton,this.alertPreviousLabel,this.alertNextLabel,this.alertsCountText]);
        this.alertPreviousButton.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.changeAlertPage(-1));
        this.alertNextButton.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.changeAlertPage(1));
        this.floatingAlerts=this.add.container(0,0).setDepth(DEPTH.controls);
    }

    private occupiedAlertPages(limit=this.stickyLimit()):number[]{const pages=[...new Set([...this.alertSlots.values()].map(slot=>Math.floor(slot/limit)))].sort((a,b)=>a-b);return pages.length?pages:[0];}
    private randomFreeAlertSlot(occupied:ReadonlySet<number>,limit:number):number{const highest=occupied.size?Math.max(...occupied):-1,pages=Math.max(1,Math.floor(highest/limit)+1),free:number[]=[];for(let slot=0;slot<pages*limit;slot++)if(!occupied.has(slot))free.push(slot);if(!free.length)for(let slot=pages*limit;slot<(pages+1)*limit;slot++)free.push(slot);return free[Math.floor((this.alertSlotRandom?.next()??0)*free.length)]!;}
    private changeAlertPage(delta:number):void{const pages=this.occupiedAlertPages(),current=Math.max(0,pages.indexOf(this.alertPage)),next=Math.min(pages.length-1,Math.max(0,current+delta));if(next===current)return;this.alertPage=pages[next]!;this.renderInterruptions(this.interruptions.snapshot);}
    private stickyLimit():number{return this.scale.parentSize.width<700?this.session.profile.presentation.touchStickyLimit:this.session.profile.presentation.desktopStickyLimit;}
    private paintAlertPager(pages:number,pageIndex:number):void{const paint=(button:GameObjects.Rectangle,label:GameObjects.Text,enabled:boolean)=>{button.disableInteractive().setFillStyle(enabled?0x24384b:COLORS.surfaceMuted).setStrokeStyle(1,enabled?COLORS.blue:COLORS.disabled).setAlpha(enabled?1:.55);label.setAlpha(enabled?1:.4);if(enabled)button.setInteractive({useHandCursor:true});};paint(this.alertPreviousButton,this.alertPreviousLabel,pageIndex>0);paint(this.alertNextButton,this.alertNextLabel,pageIndex<pages-1);}

    private renderInterruptions (snapshot: InterruptionSessionSnapshot): void {
        if (!this.floatingAlerts) return;
        if(this.initializedAlerts){snapshot.active.filter(item=>!this.knownAlerts.has(item.id)).forEach(item=>this.audio?.cue(severityRanks[item.severity]>=2?'incident':'message',`alert:${item.id}:${item.activationSequence}`));}else this.initializedAlerts=true;
        this.knownAlerts=new Set(snapshot.active.map(item=>item.id));
        const stickyLimit=this.stickyLimit();
        this.floatingAlerts?.removeAll(true);
        const ordered = [...snapshot.active].sort((a, b) => severityRanks[b.severity] - severityRanks[a.severity]
            || a.activationGameMs - b.activationGameMs || a.activationSequence - b.activationSequence);
        const activeIds=new Set(ordered.map(item=>item.id));
        for(const id of this.alertSlots.keys())if(!activeIds.has(id))this.alertSlots.delete(id);
        const occupied=new Set(this.alertSlots.values());
        for(const event of ordered){if(this.alertSlots.has(event.id))continue;const slot=this.randomFreeAlertSlot(occupied,stickyLimit);this.alertSlots.set(event.id,slot);occupied.add(slot);}
        const occupiedPages=this.occupiedAlertPages(stickyLimit);
        if(!occupiedPages.includes(this.alertPage))this.alertPage=occupiedPages.find(page=>page>this.alertPage)??occupiedPages[occupiedPages.length-1]!;
        const pageIndex=occupiedPages.indexOf(this.alertPage);
        const visible=ordered.filter(event=>Math.floor(this.alertSlots.get(event.id)!/stickyLimit)===this.alertPage).sort((a,b)=>this.alertSlots.get(a.id)!-this.alertSlots.get(b.id)!);
        const backlog=Math.max(0,ordered.length-visible.length)+(this.scheduler?.snapshot.pendingCount??0);
        this.alertsCountText.setText(`${snapshot.active.length} ACTIVE · ${backlog} BACKLOG · PAGE ${pageIndex+1}/${occupiedPages.length}`);
        this.paintAlertPager(occupiedPages.length,pageIndex);
        visible.forEach(event => {
            this.addFloatingInterruption(event,this.alertSlots.get(event.id)!%stickyLimit);
        });
        this.renderDecision(snapshot.openInterruption);
        this.renderPresentation();
    }

    private openDecision (interruptionId: string): void {
        if (this.interruptions.snapshot.openInterruption || this.taskQueue.snapshot.pendingDecision) return;
        this.cancelHeldCodingForDecision();
        if (!this.interruptions.open(interruptionId)) return;
        this.synchronizeCodingAvailability();
    }

    private addFloatingInterruption(event:ActiveInterruptionSnapshot,index:number):void{
        if(!this.floatingAlerts)return;
        const slots=[{x:282,y:100,a:-1},{x:758,y:104,a:1},{x:292,y:238,a:1},{x:748,y:242,a:-1},{x:254,y:366,a:-2},{x:786,y:366,a:2},{x:270,y:490,a:1},{x:770,y:490,a:-1}] as const,slot=slots[index%slots.length];
        const identity=notificationIdentity(event.id,event.category),urgent=severityRanks[event.severity]>=severityRanks.high;
        const fill=urgent?0x9f2329:event.category==='product-owner'?0xf7dce5:0xf4f6f8,stroke=urgent?0xff665f:event.category==='product-owner'?0xff7198:0xaeb9c3;
        const ink=urgent?'#ffffff':'#172331',sub=urgent?'#ffd6d2':'#5c6c7b';
        const group=this.add.container(slot.x,slot.y).setAngle(slot.a).setData('interruptionId',event.id);
        const rows=Math.ceil(event.choices.length/2),height=82+rows*25;
        const surface=roundedSurface(this,0,0,228,height,fill,stroke,10,urgent ? .97 : .95,urgent?3:1);
        const icon=identity.texture&&this.textures.exists(identity.texture)?this.add.image(24,24,identity.texture).setDisplaySize(25,25):this.add.text(24,24,identity.fallback,{fontFamily:TYPE.family,fontSize:10,color:ink,fontStyle:'bold'}).setOrigin(.5);
        group.add([surface,icon,this.add.text(45,10,identity.sender,{fontFamily:TYPE.family,fontSize:10,color:ink,fontStyle:'bold'}),this.add.text(214,11,`${event.ageGameMinutes}m`,{fontFamily:TYPE.family,fontSize:8,color:sub}).setOrigin(1,0),this.add.text(14,40,event.title,{fontFamily:TYPE.family,fontSize:10,color:ink,fontStyle:'bold'}),this.add.text(14,56,event.copy,{fontFamily:TYPE.family,fontSize:7,color:sub,wordWrap:{width:200}})]);
        event.choices.forEach((choice,choiceIndex)=>{
            const column=choiceIndex%2,row=Math.floor(choiceIndex/2),bx=12+column*104,by=80+row*25,bw=98,disabled=event.status!=='active';
            group.add(roundedSurface(this,bx,by,bw,20,disabled?0x69737b:urgent?0xfff1ed:0xe7eef5,disabled?0x8d969d:urgent?0xffb1a7:0x6b91ad,6,disabled ? .45 : 1,1));
            const hit=this.add.rectangle(bx,by,bw,20,0xffffff,0).setOrigin(0);if(!disabled)hit.setInteractive({useHandCursor:true}).once(Input.Events.GAMEOBJECT_POINTER_UP,()=>this.chooseStickyAction(event.id,choice.id));
            group.add([hit,this.add.text(bx+bw/2,by+10,choice.label,{fontFamily:TYPE.family,fontSize:7,color:disabled?'#d0d5d8':urgent?'#8e2026':'#173247',fontStyle:'bold'}).setOrigin(.5)]);
        });
        this.floatingAlerts.add(group);
    }

    private chooseStickyAction(interruptionId:string,choiceId:string):void{
        if(this.interruptions.snapshot.openInterruption||this.taskQueue.snapshot.pendingDecision)return;
        this.openDecision(interruptionId);
        queueMicrotask(()=>this.resolveChoice(choiceId));
    }

    private renderDecision (event: ActiveInterruptionSnapshot | null): void {
        if (this.taskQueue?.snapshot.pendingDecision) return;
        this.decisionOverlay?.destroy(true);
        this.decisionOverlay = undefined;
        void event;
    }

    private openTaskDecision():void{const pending=this.taskQueue.snapshot.pendingDecision;if(!pending)return;this.cancelHeldCodingForDecision();const overlay=this.add.container(0,0).setDepth(100);const scrim=this.add.rectangle(0,0,1280,720,0x05080d,.7).setOrigin(0).setInteractive();const card=this.add.rectangle(280,92,720,536,COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(2,COLORS.blue);overlay.add([scrim,card,this.add.text(320,126,'ENGINEERING DECISION · CLOCK STILL RUNNING',{...mutedStyle,color:'#f5b84b',fontStyle:'bold'}),this.add.text(320,154,pending.definition.title,{...textStyle,fontSize:25,fontStyle:'bold'}),this.add.text(320,196,pending.definition.copy,{...textStyle,fontSize:16,wordWrap:{width:640}}),this.add.text(320,238,'Choose now · alerts keep aging behind this panel',mutedStyle)]);pending.definition.choices.forEach((choice,index)=>this.addTaskDecisionChoice(overlay,choice,320,274+index*148));this.decisionOverlay=overlay;this.renderTaskQueue(this.taskQueue.snapshot);this.synchronizeCodingAvailability();}

    private addTaskDecisionChoice(overlay:GameObjects.Container,choice:TaskDecisionChoiceDefinition,x:number,y:number):void{const background=this.add.rectangle(x,y,640,126,COLORS.surface,1).setOrigin(0).setStrokeStyle(1,COLORS.blue).setInteractive({useHandCursor:true});background.once(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.resolveTaskChoice(choice.id));overlay.add([background,this.add.text(x+18,y+15,choice.label,{...textStyle,fontSize:15,fontStyle:'bold'}),this.add.text(x+622,y+16,`${choice.gameMinutes} MIN`,{...mutedStyle,color:'#8ac5ff',fontStyle:'bold'}).setOrigin(1,0),this.add.text(x+18,y+45,choice.description,{...mutedStyle,wordWrap:{width:590}}),this.add.text(x+18,y+88,[`Clock +${choice.gameMinutes}m`,...choice.effects.map(effect=>this.describeEffect(effect))].join('  ·  '),{...mutedStyle,color:'#cbd5e1',wordWrap:{width:600}})]);}

    private resolveTaskChoice(choiceId:string):void{const choice=this.taskQueue.resolvePendingDecision(choiceId);if(!choice)return;this.session.advanceGameMs(choice.gameMinutes*60_000,true);this.effectEngine.execute(choice.effects,`task-decision:${choiceId}`);this.scheduler.markMeaningfulAction(this.workday.snapshot.elapsedGameMs);this.decisionOverlay?.destroy(true);this.decisionOverlay=undefined;this.cancelHeldCodingForDecision();this.synchronizeWorld();this.renderTaskQueue(this.taskQueue.snapshot);this.session.finalize(`task:${choiceId}`);this.enterResultsIfComplete();}

    private describeEffect(effect:Effect):string{if(effect.type==='resource')return `${effect.amount>=0?'+':''}${effect.amount} ${effect.resource.replace(/([A-Z])/g,' $1')}`;if(effect.type==='focus')return `-${Math.round(effect.reduction*100)}% Focus`;if(effect.type==='task-progress')return `-${effect.reduction}% task progress`;if(effect.type==='task-effort')return `+${effect.amount} effort on ${effect.taskId}`;if(effect.type==='task-deadline')return `${effect.mode==='extend'?'Extend':'Set'} ${effect.taskId} ${Math.round(effect.durationGameMs/60000)}m`;if(effect.type==='task-activate')return `Activate ${effect.taskId}`;if(effect.type==='coding-disruption')return `${Math.round(effect.speedFactor*100)}% coding for ${Math.round(effect.durationGameMs/60000)}m`;if(effect.type==='delayed')return `Future risk in ${Math.round(effect.delayGameMs/60000)}m`;return `${Math.round(effect.chance*100)}% uncertain outcome`;}

    private resolveChoice (choiceId: string): void {
        const pending = this.interruptions.beginResolution(choiceId);
        if (!pending) return;
        this.audio?.cue('choice',`choice:${pending.interruptionId}:${choiceId}`);
        this.session.advanceGameMs(pending.choice.gameMinutes*60_000,true);
        this.effectEngine.execute(pending.choice.effects,pending.interruptionId);
        this.interruptions.finalizeResolution(pending.interruptionId);
        this.scheduler.markMeaningfulAction(this.workday.snapshot.elapsedGameMs);
        this.reconcileStaleWarnings();
        this.scheduler.resolved(pending.interruptionId, candidate => this.activateCandidate(candidate));
        this.synchronizeCodingAvailability();
        if (!this.workday.snapshot.isPaused) this.synchronizeWorld();
        this.session.finalize(pending.interruptionId);
        this.enterResultsIfComplete();
    }

    private synchronizeInterruptions (): void {
        const day = this.workday.snapshot;
        if (day.isPaused) return;
        this.reconcileStaleWarnings();
        this.scheduler.synchronize(day.elapsedGameMs,candidate=>this.activateCandidate(candidate),this.interruptionContext());
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

    private interruptionContext () {
        const day=this.workday.snapshot,tasks=this.taskQueue.snapshot,history=this.interruptions.snapshot,needs=this.playerNeeds.snapshot,boosters=this.boosters.snapshot;
        const stageIndex=(id:NeedId)=>this.playerNeeds.config.needs[id].stages.findIndex(stage=>stage.id===needs[id].stage.id);
        return createRunContext({selectedTaskId:tasks.selectedTaskId,completedTaskIds:tasks.completedTaskIds,resolvedEventIds:history.resolvedIds,resolvedChoices:history.resolvedOutcomes,resources:day.resources,needStages:{sleepiness:stageIndex('sleepiness'),toilet:stageIndex('toilet')},boosterCounts:boosters.consumptionCounts,incidentCounts:history.incidentCounts,concludedConsequenceIds:history.concludedConsequenceIds,activeDeduplicationKeys:history.active.map(item=>item.deduplicationKey??item.id),cooldownUntilGameMs:history.cooldownUntilGameMs,currentGameMs:day.elapsedGameMs});
    }

    private reconcileStaleWarnings (): void {
        const context=this.interruptionContext();this.scheduler.cancelIneligible(context);const dismissed=this.interruptions.dismissStale(context);
        dismissed.forEach(id=>this.scheduler.resolved(id,candidate=>this.activateCandidate(candidate)));
        if(dismissed.length)this.cancelHeldCodingForDecision();
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
        const root = panel(this, REGIONS.quickActions,0x172331).setDepth(DEPTH.controls);
        this.boosterActions = {
            coffee: toolbarActionButton(this,root,36,124,'☕','Coffee','+30 Stamina',()=>this.activateBooster('coffee')),
            cokeZero: toolbarActionButton(this,root,168,124,'⚡','Coke Zero','+15 Stamina',()=>this.activateBooster('cokeZero'))
        };
        const addDisabled=(x:number,icon:string,label:string)=>{const group=this.add.container(x,4).setAlpha(.52);group.add([roundedSurface(this,0,0,124,54,0x1b2836,COLORS.disabled,9),roundedSurface(this,7,7,34,40,COLORS.surfaceMuted,COLORS.disabled,7),this.add.text(24,27,icon,{fontFamily:TYPE.family,fontSize:18,color:'#9aa5ad'}).setOrigin(.5),this.add.text(48,11,label,{fontFamily:TYPE.family,fontSize:9,color:COLORS.textMuted,fontStyle:'bold'}),this.add.text(48,29,'Unavailable',{fontFamily:TYPE.family,fontSize:8,color:'#7b8790'})]);root.add(group);};
        addDisabled(300,'🎧','Headphones');
        this.toiletAction=toolbarActionButton(this,root,432,124,'🚽','Toilet',`${this.playerNeeds.config.bathroomGameMinutes} min`,()=>this.visitBathroom());
        addDisabled(564,'🍱','Lunch');
    }

    private activateBooster (id: BoosterId): void {
        const activation = this.boosters.activate(id, this.boosterContext());
        if (!activation.accepted || !activation.result) return;
        this.audio?.cue('booster',`booster:${id}:${activation.result.consumptionCount}`);
        this.cancelHeldCodingForDecision();
        const result = activation.result;
        this.workday.mutateResource('stamina', result.staminaRestoration);
        if (result.toiletNeedIncrease > 0) {
            const mutation = this.playerNeeds.mutateNeed('toilet', result.toiletNeedIncrease);
            mutation.transitions.forEach(transition => this.applyNeedTransition(transition));
            this.applyNeedCodingModifiers();
        }
        this.boosterFeedbackText?.setText(`${result.feedback} ${this.boosters.config.boosters[id].label} #${result.consumptionCount} consumed.`);
        const risk=this.session.healthRisk,thresholds=this.session.profile.healthRisk;
        if(risk>=thresholds.criticalWarning)this.showNeedFeedback('Heart-rate alert: your hands are filing their own incident report.');
        else if(risk>=thresholds.warning)this.showNeedFeedback('Your pulse now has deploy-frequency observability.');
        this.scheduler.markMeaningfulAction(this.workday.snapshot.elapsedGameMs);
        this.reconcileStaleWarnings();
        this.synchronizeInterruptions();
        this.synchronizeCodingAvailability();
        this.updateBoosterAvailability();
        this.session.finalize(`${id} overuse`);
        this.enterResultsIfComplete();
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
            this.session.advanceGameMs(this.playerNeeds.config.bathroomGameMinutes*60_000);
            this.playerNeeds.relieve('toilet');
            this.scheduler.markMeaningfulAction(this.workday.snapshot.elapsedGameMs);
            this.reconcileStaleWarnings();
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
            const critical=need.severity>=1;if(critical&&!this.criticalNeeds.has(id))this.audio?.cue('criticalNeed',`need:${id}:${need.stage.id}`);if(critical)this.criticalNeeds.add(id);else this.criticalNeeds.delete(id);
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
        this.resourceViews.technicalDebt.value.setText(`${Math.round(debt)}%`);
        this.resourceViews.technicalDebt.meter.setValue(debt / 100);
        this.clockText.setText(`DAY ${snapshot.dayIndex}  ·  ${String(snapshot.clockHour).padStart(2, '0')}:${String(snapshot.clockMinute).padStart(2, '0')}`);
        this.renderTaskQueue(this.taskQueue.snapshot);
        this.dayProgressMeter.setValue(snapshot.dayProgress);
        this.renderPacingOverlay();
        this.updateToiletAvailability();
        this.updateBoosterAvailability();
        this.renderPresentation();
    }

    private buildPacingOverlay():void{
        if(import.meta.env.VITE_PACING_DEBUG!=='true')return;
        const root=this.add.container(24,644).setDepth(DEPTH.content+20).setScrollFactor(0);
        const bg=this.add.rectangle(0,0,258,64,0x080d14,.94).setOrigin(0).setStrokeStyle(1,COLORS.blue);
        this.pacingOverlayText=this.add.text(9,7,'',{...mutedStyle,fontSize:9,color:'#8ac5ff',lineSpacing:2});
        root.add([bg,this.pacingOverlayText]);this.pacingOverlay=root;this.renderPacingOverlay();
    }
    private renderPacingOverlay():void{if(!this.pacingOverlayText||!this.session)return;const s=this.session.debugSnapshot;this.pacingOverlayText.setText(`PACING · ${s.profile.toUpperCase()} · ${s.activeBand.toUpperCase()}\nSEED ${s.seed} · PRESSURE ${s.eventPressure} · QUIET ${Math.floor(s.quietDurationGameMs/60000)}m\nS ${Math.round(s.resources.stamina)} · PO ${Math.round(s.resources.poHappiness)} · STAB ${Math.round(s.resources.systemStability)} · N ${Math.round(s.needs.sleepiness)}/${Math.round(s.needs.toilet)}`);}

    private bindCodingInput (): void {
        this.codingActionBackground.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.activateAiPrimary('prompt'));
        this.planActionBackground.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.session.ai.snapshot.phase==='review'?this.requestAiRevision():this.activateAiPrimary('plan'));
        this.input.keyboard?.on(Input.Keyboard.Events.ANY_KEY_DOWN, this.handleCodingKeyDown, this);
    }

    private handleCodingKeyDown (event: KeyboardEvent): void {
        if((event.code==='Enter'||event.code==='Escape')&&this.guidanceOverlay){event.preventDefault();this.dismissGuidance();return;}
        if(event.code==='KeyP'&&!event.repeat){event.preventDefault();this.toggleExplicitPause();return;}
        if(event.repeat)return;
        if(event.code==='Digit1'||event.code==='Space'){event.preventDefault();this.activateAiPrimary('prompt');}
        if(event.code==='Digit2'){event.preventDefault();this.activateAiPrimary('plan');}
        if(event.code==='KeyR'){event.preventDefault();this.requestAiRevision();}
    }

    private activateAiPrimary(mode:'prompt'|'plan'):void{const ai=this.session.ai.snapshot,task=this.taskQueue.snapshot.selectedTask;if(ai.phase==='review'&&ai.batch){const result=this.session.ai.approve({taskId:ai.batch.taskId,cycleId:ai.batch.cycleId,batchId:ai.batch.id});if(result.accepted&&result.batch){const work=this.taskQueue.applyWork(result.batch.proposedWork);if(work.completionEffects.length)this.effectEngine.execute(work.completionEffects,work.completedTaskId!);if(result.batch.effects.length)this.effectEngine.execute(result.batch.effects as unknown as readonly Effect[],result.batch.id);if(work.decisionOpened)this.openTaskDecision();this.audio?.cue('choice',`approve:${result.batch.id}`);}}else if(task&&this.session.ai.start(mode,task.id))this.audio?.cue('choice',`start:${this.session.ai.snapshot.cycleId}`);this.renderCoding(this.coding.snapshot);}
    private requestAiRevision():void{const ai=this.session.ai.snapshot;if(!ai.batch)return;const result=this.session.ai.revise({taskId:ai.batch.taskId,cycleId:ai.batch.cycleId,batchId:ai.batch.id});if(result.accepted){this.workday.mutateResource('stamina',-result.staminaCost);this.audio?.cue('choice',`revise:${ai.batch.id}`);this.renderCoding(this.coding.snapshot);}}

    private cancelInteraction(reason:InteractionCancelReason):void{
        this.heldCodingSources.forEach(source=>this.blockedCodingSources.add(source));
        this.clearHeldCodingSources();this.audio?.stopTyping();
        if(reason==='focus'||reason==='visible'||reason==='restart'||reason==='shutdown')this.blockedCodingSources.clear();
    }

    private bindLifecycle():void{
        this.lifecycle=new InteractionLifecycle({cancelInteraction:reason=>this.cancelInteraction(reason),pause:owner=>this.workday.pause(owner==='visibility'?VISIBILITY_PAUSE_REASON:owner==='guidance'?GUIDANCE_PAUSE_REASON:EXPLICIT_PAUSE_REASON),resume:owner=>this.workday.resume(owner==='visibility'?VISIBILITY_PAUSE_REASON:owner==='guidance'?GUIDANCE_PAUSE_REASON:EXPLICIT_PAUSE_REASON)});
        this.game.events.on(Core.Events.BLUR,this.onBrowserBlur,this);this.game.events.on(Core.Events.FOCUS,this.onBrowserFocus,this);
        document.addEventListener('visibilitychange',this.onVisibilityChange);window.addEventListener('orientationchange',this.onOrientationChange);
        this.scale.on('resize',this.onViewportResize,this);
    }
    private onBrowserBlur=():void=>{this.lifecycle?.cancel('blur');};
    private onBrowserFocus=():void=>{this.input.resetPointers();this.input.keyboard?.resetKeys();this.lifecycle?.cancel('focus');};
    private onVisibilityChange=():void=>{const hidden=document.visibilityState==='hidden';this.lifecycle?.cancel(hidden?'hidden':'visible');this.lifecycle?.setPaused('visibility',hidden);if(!hidden){this.input.resetPointers();this.input.keyboard?.resetKeys();}};
    private onViewportResize=():void=>{this.lifecycle?.cancel('resize');};
    private onOrientationChange=():void=>{this.lifecycle?.cancel('orientation');};
    private toggleExplicitPause():void{if(this.guidanceOverlay||this.resultsStarted)return;const paused=this.workday.snapshot.pauseReasons.includes(EXPLICIT_PAUSE_REASON);this.lifecycle?.cancel('overlay');this.lifecycle?.setPaused('explicit',!paused);this.pauseText?.setText(paused?'Ⅱ PAUSE':'▶ RESUME');this.synchronizeCodingAvailability();}
    private openGuidance():void{this.lifecycle?.cancel('overlay');this.lifecycle?.setPaused('guidance',true);this.guidanceDismissed=false;this.guidanceOverlay=createGuidanceOverlay(this,()=>this.dismissGuidance());this.synchronizeCodingAvailability();}
    private dismissGuidance():void{if(!this.guidanceOverlay||this.guidanceDismissed)return;this.guidanceDismissed=true;this.lifecycle?.cancel('overlay');this.guidancePreference?.dismiss();this.guidanceOverlay.destroy();this.guidanceOverlay=undefined;this.lifecycle?.setPaused('guidance',false);this.input.resetPointers();this.input.keyboard?.resetKeys();this.blockedCodingSources.clear();this.synchronizeCodingAvailability();}

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
        this.renderCoding(this.coding.snapshot);
    }

    private renderCoding (snapshot: CodingSessionSnapshot): void {
        const task=this.taskQueue.snapshot.selectedTask;
        const ai=this.session.ai.snapshot;
        this.codingTaskText.setText(task?`${task.id}  ·  ${task.title.toUpperCase()}`:'ALL TASKS COMPLETE');
        this.codingProgressText.setText(task?`${task.progress.toFixed(1)}%`:'100%');
        this.codingProgressMeter.setValue(task?task.progress/100:1);
        this.focusText.setText(`FOCUS · REVIEW EFFECTIVENESS ${Math.round(snapshot.focus*100)}%`);
        this.audio?.stopTyping();this.codingActionBackground.disableInteractive();this.planActionBackground.disableInteractive();
        if(ai.phase==='available'){const enabled=ai.isAvailable;this.codingActionLabel.setText(enabled?'PROMPT MODE':'AI WORK UNAVAILABLE');this.codingActionDetail.setText(enabled?'Fast · more uncertain':ai.disabledReason??'Unavailable');this.planActionLabel.setText('PLAN MODE');this.planActionDetail.setText(enabled?'Slower · safer':ai.disabledReason??'Unavailable');if(enabled){this.codingActionBackground.setInteractive({useHandCursor:true});this.planActionBackground.setInteractive({useHandCursor:true});}}
        else if(ai.phase==='planning'||ai.phase==='generating'){const pct=Math.round(ai.progress*100);this.codingActionLabel.setText(`${ai.phase.toUpperCase()} · ${pct}%`);this.codingActionDetail.setText(`${ai.mode?.toUpperCase()} cycle · authoritative game time`);this.planActionLabel.setText('REVIEW PENDING');this.planActionDetail.setText('Wait for generation');}
        else if(ai.batch){this.codingActionLabel.setText('APPROVE CHANGES');this.codingActionDetail.setText(`${ai.batch.proposedWork.toFixed(1)} work · ${ai.batch.changedFiles.length} files · ${ai.batch.tests.length} tests`);this.planActionLabel.setText('REQUEST CHANGES');this.planActionDetail.setText(`R · tier ${ai.batch.revisionTier}/${2} · ${ai.batch.signals.join(' ')||`${ai.batch.hiddenSignalCount} uncertainty`}`);this.codingActionBackground.setInteractive({useHandCursor:true});this.planActionBackground.setInteractive({useHandCursor:true});}
        const enabled=ai.isAvailable||ai.phase==='review';this.codingActionBackground.setFillStyle(enabled?COLORS.blue:COLORS.surfaceMuted).setAlpha(enabled?1:.72);this.planActionBackground.setFillStyle(enabled?COLORS.surfaceRaised:COLORS.surfaceMuted).setAlpha(enabled?1:.72);
    }

    private cleanupWorkday (): void {
        this.advancesWorkday = false;
        this.removeDiagnostics?.();this.removeDiagnostics=undefined;
        this.guidanceOverlay?.destroy();this.guidanceOverlay=undefined;this.guidancePreference=undefined;
        this.lifecycle?.dispose();this.lifecycle=undefined;
        this.audio?.dispose();this.audio=undefined;this.detachAudio?.();this.detachAudio=undefined;this.unsubscribeAudio?.();this.unsubscribeAudio=undefined;this.knownAlerts.clear();this.initializedAlerts=false;this.criticalNeeds.clear();this.alertSlots.clear();this.alertSlotRandom=undefined;this.alertPage=0;
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
        this.pacingOverlay?.destroy(true);this.pacingOverlay=undefined;this.pacingOverlayText=undefined;
        this.bathroomInProgress = false;
        this.clearHeldCodingSources();
        this.blockedCodingSources.clear();
        this.workday?.resume(DECISION_PAUSE_REASON);
        this.workday?.resume(TASK_DECISION_PAUSE_REASON);
        this.decisionOverlay?.destroy(true);
        this.decisionOverlay = undefined;
        this.input?.keyboard?.off(Input.Keyboard.Events.ANY_KEY_DOWN, this.handleCodingKeyDown, this);
        this.game?.events.off(Core.Events.BLUR, this.onBrowserBlur, this);this.game?.events.off(Core.Events.FOCUS,this.onBrowserFocus,this);
        if(typeof document!=='undefined')document.removeEventListener('visibilitychange',this.onVisibilityChange);
        if(typeof window!=='undefined')window.removeEventListener('orientationchange',this.onOrientationChange);
        this.scale?.off('resize',this.onViewportResize,this);
        this.events.off(Scenes.Events.SHUTDOWN, this.cleanupWorkday, this);
        this.events.off(Scenes.Events.DESTROY, this.cleanupWorkday, this);
    }
    private enterResultsIfComplete():void{if(this.resultsStarted)return;const result=this.session.finalize();if(!result)return;this.resultsStarted=true;this.advancesWorkday=false;const runId=window.__WORKDAY_PLAYTEST__?.getSnapshot().runId;this.lifecycle?.cancel('results');this.input.enabled=false;this.scene.start('Results',{result,runId});}
}
