import { GameObjects, Input, Scene } from 'phaser';
import { roundedSurface } from './primitives';
import { COLORS, TYPE } from './theme';

export interface InterruptionPanelIcon {
    readonly texture?: string;
    readonly fallback: string;
    readonly backgroundColor: number;
}

export interface InterruptionPanelControl {
    readonly label: string;
    readonly description: string;
    readonly activate: () => void;
}

export interface InterruptionPanelConfig {
    readonly x: number;
    readonly y: number;
    readonly width?: number;
    readonly height?: number;
    readonly angle?: number;
    readonly backgroundColor?: number;
    readonly borderColor?: number;
    readonly accentColor?: number;
    readonly icon: InterruptionPanelIcon;
    readonly title: string;
    readonly description: string;
    readonly sourceLabel?: string;
    readonly metadata?: string;
    readonly controls: readonly InterruptionPanelControl[];
}

export class InterruptionPanel {
    readonly root: GameObjects.Container;

    constructor(scene: Scene, config: InterruptionPanelConfig) {
        const width = config.width ?? 230;
        const height = config.height ?? 218;
        const backgroundColor = config.backgroundColor ?? 0xffffff;
        const borderColor = config.borderColor ?? 0xd0d7de;
        const accentColor = config.accentColor ?? COLORS.blue;

        this.root = scene.add.container(config.x, config.y).setAngle(config.angle ?? 0);
        this.root.add(roundedSurface(scene, 5, 7, width, height, 0x000000, 0, 13, 0.24, 0));
        this.root.add(roundedSurface(scene, 0, 0, width, height, backgroundColor, borderColor, 13, 0.98, 1));
        this.root.add(roundedSurface(scene, 0, 0, 7, height, accentColor, accentColor, 7, 1, 0));

        const icon = config.icon.texture && scene.textures.exists(config.icon.texture)
            ? scene.add.image(18, 11, config.icon.texture).setOrigin(0).setDisplaySize(21, 21)
            : scene.add.text(18, 13, config.icon.fallback, {
                fontFamily: TYPE.family, fontSize: 8, color: '#ffffff',
                backgroundColor: `#${config.icon.backgroundColor.toString(16).padStart(6, '0')}`,
                padding: { x: 4, y: 3 }
            });
        this.root.add(icon);

        if (config.sourceLabel) this.root.add(scene.add.text(47, 9, config.sourceLabel.toUpperCase(), {
            fontFamily: TYPE.family, fontSize: 8, color: '#172331', fontStyle: 'bold'
        }));
        if (config.metadata) this.root.add(scene.add.text(47, 20, config.metadata, {
            fontFamily: TYPE.family, fontSize: 7, color: '#687580'
        }));
        this.root.add(scene.add.text(16, 36, config.title, {
            fontFamily: TYPE.family, fontSize: 12, color: '#172331', fontStyle: 'bold', wordWrap: { width: width - 32 }
        }));
        this.root.add(scene.add.text(16, 59, config.description, {
            fontFamily: TYPE.family, fontSize: 9, color: '#53616c', wordWrap: { width: width - 32 }, lineSpacing: 1
        }));

        const controlHeight = Math.min(38, 96 / Math.max(1, config.controls.length));
        config.controls.forEach((control, index) => this.addControl(scene, control, index, width, controlHeight));
    }

    destroy(): void { this.root.destroy(true); }

    private addControl(scene: Scene, control: InterruptionPanelControl, index: number, width: number, height: number): void {
        const y = 112 + index * (height + 3);
        const button = roundedSurface(scene, 12, y, width - 24, height, 0xf4f7f9, 0x9eabb5, 7, 1, 1);
        const hitArea = scene.add.rectangle(12, y, width - 24, height, 0xffffff, 0).setOrigin(0).setInteractive({ useHandCursor: true });
        const label = scene.add.text(19, y + 5, `${control.label}\n${control.description}`, {
            fontFamily: TYPE.family, fontSize: height < 38 ? 7 : 8, color: '#263946', wordWrap: { width: width - 38 }, lineSpacing: 1
        });
        const paint = (fill: number, stroke: number): void => {
            button.clear().fillStyle(fill, 1).fillRoundedRect(12, y, width - 24, height, 7)
                .lineStyle(1, stroke, 1).strokeRoundedRect(12, y, width - 24, height, 7);
        };
        hitArea.on(Input.Events.GAMEOBJECT_POINTER_OVER, () => paint(0xe9f2f8, COLORS.blue))
            .on(Input.Events.GAMEOBJECT_POINTER_OUT, () => paint(0xf4f7f9, 0x9eabb5))
            .on(Input.Events.GAMEOBJECT_POINTER_DOWN, () => { paint(0xdceaf3, COLORS.blue); control.activate(); });
        this.root.add([button, hitArea, label]);
    }
}
