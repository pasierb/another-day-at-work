import { GameObjects, Scene } from 'phaser';
import type { Region } from './layout';
import { COLORS, DEPTH, SPACE, TYPE } from './theme';

export function panel(scene: Scene, region: Region, fill: number = COLORS.surface): GameObjects.Container {
    const root = scene.add.container(region.x, region.y).setDepth(DEPTH.panels);
    return root.add([
        scene.add.rectangle(4, 5, region.width, region.height, 0x000000, 0.28).setOrigin(0),
        scene.add.rectangle(0, 0, region.width, region.height, fill, 0.97).setOrigin(0).setStrokeStyle(1, COLORS.border)
    ]);
}

export function heading(scene: Scene, parent: GameObjects.Container, label: string, x = SPACE.md, y = SPACE.md): GameObjects.Text {
    const text = scene.add.text(x, y, label.toUpperCase(), {
        fontFamily: TYPE.family, fontSize: TYPE.heading, color: COLORS.text, fontStyle: 'bold', letterSpacing: 1
    });
    parent.add(text);
    return text;
}

export function badge(scene: Scene, parent: GameObjects.Container, x: number, y: number, label: string, fill: number): GameObjects.Container {
    const width = Math.max(48, label.length * 7 + 18);
    const root = scene.add.container(x, y);
    root.add(scene.add.rectangle(0, 0, width, 24, fill, 0.9).setOrigin(0));
    root.add(scene.add.text(width / 2, 12, label, { fontFamily: TYPE.family, fontSize: TYPE.small, color: COLORS.text, fontStyle: 'bold' }).setOrigin(0.5));
    parent.add(root);
    return root;
}

export interface MeterView {
    readonly root: GameObjects.Container;
    readonly fill: GameObjects.Rectangle;
    setValue(value: number): void;
}

export function meter(scene: Scene, parent: GameObjects.Container, x: number, y: number, width: number, value: number, fillColor: number): MeterView {
    const root = scene.add.container(x, y);
    root.add(scene.add.rectangle(0, 0, width, 10, COLORS.surfaceMuted).setOrigin(0).setStrokeStyle(1, COLORS.border));
    const fill = scene.add.rectangle(2, 2, 0, 6, fillColor).setOrigin(0);
    root.add(fill);
    parent.add(root);
    const setValue = (nextValue: number) => { fill.width = (width - 4) * Math.min(1, Math.max(0, nextValue)); };
    setValue(value);
    return { root, fill, setValue };
}

export function disabledAction(scene: Scene, parent: GameObjects.Container, x: number, y: number, width: number, label: string, detail?: string): GameObjects.Container {
    const height = detail ? 42 : 32;
    const root = scene.add.container(x, y).setAlpha(0.62);
    root.add(scene.add.rectangle(0, 0, width, height, COLORS.surfaceMuted).setOrigin(0).setStrokeStyle(1, COLORS.disabled));
    root.add(scene.add.text(width / 2, detail ? 12 : 16, label, { fontFamily: TYPE.family, fontSize: TYPE.body, color: COLORS.textMuted, fontStyle: 'bold' }).setOrigin(0.5));
    if (detail) root.add(scene.add.text(width / 2, 29, detail, { fontFamily: TYPE.family, fontSize: TYPE.small, color: COLORS.textMuted }).setOrigin(0.5));
    // Deliberately no setInteractive() or input listener: this control is only a placeholder.
    parent.add(root);
    return root;
}
