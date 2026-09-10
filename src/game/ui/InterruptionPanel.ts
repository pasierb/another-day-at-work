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
    readonly angle?: number;
    readonly backgroundColor?: number;
    readonly borderColor?: number;
    readonly accentColor?: number;
    readonly urgent?: boolean;
    readonly dark?: boolean;
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
        const width = config.width ?? 310;
        const backgroundColor = config.backgroundColor ?? 0xf4f5fb;
        const borderColor = config.borderColor ?? 0xc5ccdc;
        const accentColor = config.accentColor ?? COLORS.blue;
        const ink = config.dark ? '#ffffff' : '#182138';
        const muted = config.dark ? '#ffdad5' : '#5f6b85';

        this.root = scene.add.container(config.x, config.y);
        // Tilt the paper only: Phaser 4 clips text in rotated containers.
        const surface = scene.add.container(0, 0).setAngle(config.angle ?? 0);
        this.root.add(surface);

        const icon = config.icon.texture && scene.textures.exists(config.icon.texture)
            ? scene.add.image(15, 17, config.icon.texture).setOrigin(0).setDisplaySize(38, 38)
            : scene.add.text(34, 36, config.icon.fallback, {
                fontFamily: TYPE.family, fontSize: config.icon.fallback.length <= 3 ? 22 : 30, color: ink
            }).setOrigin(0.5);
        this.root.add(icon);

        const metadata = scene.add.text(width - 14, 14, config.metadata ?? '', {
            fontFamily: TYPE.family, fontSize: 10, color: muted
        }).setOrigin(1, 0);
        const source = scene.add.text(65, 14, config.sourceLabel ?? '', {
            fontFamily: TYPE.family, fontSize: 13, color: ink, fontStyle: 'bold',
            wordWrap: { width: width - 90 - metadata.width }
        });
        const title = scene.add.text(65, Math.max(38, source.y + source.height + 8), config.title, {
            fontFamily: TYPE.family, fontSize: 13, color: ink, fontStyle: 'bold',
            wordWrap: { width: width - 80 }
        });
        const description = scene.add.text(65, title.y + title.height + 6, config.description, {
            fontFamily: TYPE.family, fontSize: 11, color: ink,
            wordWrap: { width: width - 80 }, lineSpacing: 2
        });
        this.root.add([metadata, source, title, description]);
        let y = description.y + description.height + 12;
        if (config.urgent) {
            this.root.add(roundedSurface(scene, width - 76, y, 62, 20, accentColor, accentColor, 5));
            this.root.add(scene.add.text(width - 45, y + 10, 'URGENT', {
                fontFamily: TYPE.family, fontSize: 10, fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5));
            y += 28;
        }

        const buttonWidth = (width - 36) / 2;
        for (let index = 0; index < config.controls.length; index += 2) {
            const row = config.controls.slice(index, index + 2).map((control, column) => {
                const x = 14 + column * (buttonWidth + 8);
                const label = scene.add.text(x + 8, y + 7, control.label, {
                    fontFamily: TYPE.family, fontSize: 10, fontStyle: 'bold', color: '#25334f',
                    wordWrap: { width: buttonWidth - 16 }
                });
                const detail = scene.add.text(x + 8, label.y + label.height + 5, control.description, {
                    fontFamily: TYPE.family, fontSize: 9, color: '#52617a',
                    wordWrap: { width: buttonWidth - 16 }, lineSpacing: 1
                });
                return { control, x, label, detail };
            });
            const height = Math.max(36, ...row.map(({ detail }) => detail.y + detail.height - y + 8));
            for (const { control, x, label, detail } of row) {
                const button = roundedSurface(scene, x, y, buttonWidth, height, 0xf9faff, 0xa6b0c8, 6);
                const hit = scene.add.rectangle(x, y, buttonWidth, height, 0xffffff, 0)
                    .setOrigin(0).setInteractive({ useHandCursor: true });
                const buttonY = y;
                const paint = (fill: number, stroke: number): void => {
                    button.clear().fillStyle(fill).fillRoundedRect(x, buttonY, buttonWidth, height, 6)
                        .lineStyle(1, stroke).strokeRoundedRect(x, buttonY, buttonWidth, height, 6);
                };
                hit.on(Input.Events.GAMEOBJECT_POINTER_OVER, () => paint(0xe3efff, 0x559ce3))
                    .on(Input.Events.GAMEOBJECT_POINTER_OUT, () => paint(0xf9faff, 0xa6b0c8))
                    .on(Input.Events.GAMEOBJECT_POINTER_DOWN, () => { paint(0xcddfff, 0x559ce3); control.activate(); });
                this.root.add([button, hit, label, detail]);
            }
            y += height + 8;
        }
        const height = y + 6;
        this.root.setSize(width, height);
        // Catch clicks on the paper so covered choices cannot receive them.
        const paperHit = scene.add.rectangle(0, 0, width, height, 0xffffff, 0)
            .setOrigin(0).setInteractive({ useHandCursor: true });
        paperHit.on(Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.root.emit('pointerdown'));
        this.root.addAt(paperHit, 1);
        surface.add(roundedSurface(scene, 4, 7, width, height, 0x101526, 0, 12, 0.3, 0));
        if (config.urgent || config.dark) {
            surface.add(roundedSurface(scene, -4, -4, width + 8, height + 8, accentColor, 0, 15, 0.16, 0));
        }
        surface.add(roundedSurface(scene, 0, 0, width, height, backgroundColor, borderColor, 11, 1, config.urgent || config.dark ? 2 : 1));
    }

    destroy(): void { this.root.destroy(true); }

}
