import { GameObjects, Scene, Scenes } from 'phaser';
import { DayState, type DayStateSnapshot, type ResourceKey } from '../domain/DayState';
import { REGIONS } from '../ui/layout';
import { badge, disabledAction, heading, meter, panel, type MeterView } from '../ui/primitives';
import { COLORS, DEPTH, TYPE } from '../ui/theme';

const textStyle = { fontFamily: TYPE.family, fontSize: TYPE.body, color: COLORS.text } as const;
const mutedStyle = { fontFamily: TYPE.family, fontSize: TYPE.small, color: COLORS.textMuted } as const;

export class Workstation extends Scene {
    workday!: DayState;
    private resourceViews!: Record<ResourceKey, { value: GameObjects.Text; meter: MeterView }>;
    private clockText!: GameObjects.Text;
    private dayProgressMeter!: MeterView;
    private unsubscribeWorkday?: () => void;
    private advancesWorkday = false;

    constructor () { super('Workstation'); }

    create () {
        this.cleanupWorkday();
        this.workday = new DayState();
        this.cameras.main.setBackgroundColor(COLORS.backdrop);
        this.buildBackdrop();
        this.buildResourceHud();
        this.buildDayClock();
        this.buildTasks();
        this.buildLaptop();
        this.buildAlerts();
        this.buildQuickActions();
        this.renderWorkday(this.workday.snapshot);
        this.unsubscribeWorkday = this.workday.subscribe(snapshot => this.renderWorkday(snapshot));
        this.advancesWorkday = true;
        this.events.once(Scenes.Events.SHUTDOWN, this.cleanupWorkday, this);
        this.events.once(Scenes.Events.DESTROY, this.cleanupWorkday, this);
    }

    update (_time: number, delta: number) {
        if (this.advancesWorkday) this.workday.advance(delta);
    }

    private buildBackdrop () {
        this.add.rectangle(640, 360, 1280, 720, COLORS.backdrop).setDepth(DEPTH.background);
        for (let x = 0; x < 1280; x += 64) this.add.line(0, 0, x, 0, x, 720, 0x1b2737, 0.22).setOrigin(0).setDepth(DEPTH.decoration);
        this.add.text(24, 680, 'ANOTHER DAY AT WORK', { fontFamily: TYPE.family, fontSize: 13, color: '#526176', fontStyle: 'bold' }).setDepth(DEPTH.decoration);
    }

    private buildResourceHud () {
        const root = panel(this, REGIONS.resourceHud);
        heading(this, root, 'Workday status');
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
        root.add(this.add.text(16, 44, '4 OPEN  ·  1 URGENT', mutedStyle));
        const rows = [
            ['Fix login error', 'BUG-4821', 'URGENT', COLORS.danger],
            ['Improve search', 'TASK-3178', 'IN PROGRESS', COLORS.blue],
            ['Refactor service', 'TECH DEBT', 'MEDIUM', COLORS.amber],
            ['Write tests', 'CHORE', 'LOW', COLORS.mint]
        ] as const;
        rows.forEach((row, index) => this.taskRow(root, 16, 76 + index * 80, row[0], row[1], row[2], row[3]));
        root.add(this.add.text(16, 420, 'TECH DEBT', { ...textStyle, fontStyle: 'bold' }));
        const technicalDebtMeter = meter(this, root, 16, 448, 242, 0, COLORS.amber);
        const technicalDebtValue = this.add.text(16, 470, '', mutedStyle);
        root.add(technicalDebtValue);
        this.resourceViews.technicalDebt = { value: technicalDebtValue, meter: technicalDebtMeter };
    }

    private taskRow (root: GameObjects.Container, x: number, y: number, title: string, id: string, status: string, fill: number) {
        root.add(this.add.rectangle(x, y, 242, 66, COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(1, COLORS.border));
        root.add(this.add.text(x + 12, y + 10, title, { ...textStyle, fontStyle: 'bold' }));
        root.add(this.add.text(x + 12, y + 38, id, mutedStyle));
        badge(this, root, x + 148, y + 34, status, fill);
    }

    private buildLaptop () {
        const root = panel(this, REGIONS.laptop, 0x121b28);
        heading(this, root, 'Current task');
        root.add(this.add.text(16, 44, 'TASK-3178  ·  IMPROVE SEARCH PERFORMANCE', { ...mutedStyle, color: '#6db5ff' }));
        root.add(this.add.rectangle(28, 82, 580, 338, 0x0a111c).setOrigin(0).setStrokeStyle(3, 0x344861));
        root.add(this.add.rectangle(44, 100, 548, 266, 0x101c2b).setOrigin(0));
        root.add(this.add.text(64, 122, 'search_service.py', mutedStyle));
        const code = ['def search_users(query: str):', '    # TODO: improve performance', '    results = db.search(query)', '    return results'];
        root.add(this.add.text(64, 158, code.join('\n'), { fontFamily: 'monospace', fontSize: 16, color: '#8fdbca', lineSpacing: 10 }));
        disabledAction(this, root, 132, 292, 372, 'HOLD TO CODE', 'Available in a future change');
        root.add(this.add.text(44, 386, 'CODING PROGRESS', mutedStyle));
        meter(this, root, 168, 389, 424, .47, COLORS.blue);
        root.add(this.add.polygon(318, 458, [0, 0, 246, 0, 292, 38, -46, 38], 0x303c4c).setStrokeStyle(2, 0x4b5d72));
        root.add(this.add.text(318, 477, 'WORKSTATION', { ...mutedStyle, fontStyle: 'bold' }).setOrigin(0.5));
    }

    private buildAlerts () {
        const root = panel(this, REGIONS.alerts);
        heading(this, root, 'Messages & alerts');
        root.add(this.add.text(16, 44, '5 UNREAD  ·  STATUS ONLY', mutedStyle));
        const messages = [
            ['PRODUCTION OUTAGE', 'Error rate at 78%', COLORS.danger],
            ['JAMIE · JUNIOR DEV', 'Any idea what is wrong?', COLORS.blue],
            ['GITHUB STATUS', 'Investigating an incident', COLORS.amber],
            ['# GENERAL', 'Standup in 10 minutes', COLORS.mint],
            ['CLAUDE CODE', 'Connection unavailable', COLORS.danger]
        ] as const;
        messages.forEach((message, index) => {
            const y = 76 + index * 78;
            root.add(this.add.rectangle(16, y, 258, 64, COLORS.surfaceRaised).setOrigin(0).setStrokeStyle(1, message[2]));
            root.add(this.add.circle(30, y + 20, 5, message[2]));
            root.add(this.add.text(44, y + 10, message[0], { ...textStyle, fontStyle: 'bold' }));
            root.add(this.add.text(44, y + 35, message[1], mutedStyle));
        });
        root.add(this.add.text(16, 478, 'Messages are representative placeholders', mutedStyle));
    }

    private buildQuickActions () {
        const root = panel(this, REGIONS.quickActions, COLORS.surfaceRaised);
        const actions = ['COFFEE', 'HEADPHONES', 'LUNCH', 'ROLLBACK', 'RESTART'];
        actions.forEach((action, index) => disabledAction(this, root, 10 + index * 132, 7, 122, action, 'Unavailable'));
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
    }

    private cleanupWorkday (): void {
        this.advancesWorkday = false;
        this.unsubscribeWorkday?.();
        this.unsubscribeWorkday = undefined;
        this.events.off(Scenes.Events.SHUTDOWN, this.cleanupWorkday, this);
        this.events.off(Scenes.Events.DESTROY, this.cleanupWorkday, this);
    }
}
