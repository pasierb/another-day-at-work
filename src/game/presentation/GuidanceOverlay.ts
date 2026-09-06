import { GameObjects, Scene } from 'phaser';
import { actionButton, heading, panel, type ActionView } from '../ui/primitives';
import { COLORS, DEPTH, TYPE } from '../ui/theme';
import { GUIDANCE_COPY, GUIDANCE_LAYOUT } from './GuidanceContent';

export interface GuidanceOverlayView { readonly root: GameObjects.Container; readonly dismiss: ActionView; destroy(): void; }

export function createGuidanceOverlay (scene: Scene, onDismiss: () => void): GuidanceOverlayView {
    const root = scene.add.container(0, 0).setDepth(DEPTH.controls + 100).setScrollFactor(0);
    const { width, height } = scene.cameras.main;
    const scrim = scene.add.rectangle(0, 0, width, height, 0x05080d, .82).setOrigin(0).setInteractive();
    root.add(scrim);
    const card = panel(scene, GUIDANCE_LAYOUT, COLORS.surfaceRaised).setDepth(0);
    root.add(card);
    heading(scene, card, GUIDANCE_COPY.title, 32, 28).setFontSize(27).setColor('#ffffff');
    card.add(scene.add.text(32, 78, GUIDANCE_COPY.objective, { fontFamily: TYPE.family, fontSize: 18, color: '#8fdbca', fontStyle: 'bold', wordWrap: { width: 676 }, lineSpacing: 5 }));
    const rows = [GUIDANCE_COPY.coding, GUIDANCE_COPY.alerts, GUIDANCE_COPY.resources];
    rows.forEach((copy, index) => card.add(scene.add.text(52, 162 + index * 74, `${index + 1}  ${copy}`, { fontFamily: TYPE.family, fontSize: 15, color: COLORS.text, wordWrap: { width: 632 }, lineSpacing: 4 })));
    card.add(scene.add.text(370, 402, 'Enter or Escape also dismisses · controls underneath are paused', { fontFamily: TYPE.family, fontSize: 11, color: COLORS.textMuted }).setOrigin(.5));
    const dismiss = actionButton(scene, card, GUIDANCE_LAYOUT.buttonX, GUIDANCE_LAYOUT.buttonY, GUIDANCE_LAYOUT.buttonWidth, GUIDANCE_COPY.dismiss, 'Begin at 09:00', onDismiss);
    const resize = () => { const camera = scene.cameras.main; scrim.setSize(camera.width, camera.height); };
    scene.scale.on('resize', resize);
    return { root, dismiss, destroy: () => { scene.scale.off('resize', resize); dismiss.destroy(); root.destroy(true); } };
}
