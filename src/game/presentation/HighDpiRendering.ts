import { GameObjects, Scene, Scenes } from 'phaser';
import { GAME_SIZE } from '../ui/layout';

const MAX_RENDER_SCALE = 3;

function viewportFitScale (): number {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.innerWidth / GAME_SIZE.width, window.innerHeight / GAME_SIZE.height);
}

/** Physical pixels rendered for each logical game pixel. */
export const HIGH_DPI_RENDER_SCALE = typeof window === 'undefined'
    ? 1
    : Math.max(1, Math.min(MAX_RENDER_SCALE, window.devicePixelRatio * viewportFitScale()));

export const HIGH_DPI_GAME_SIZE = Object.freeze({
    width: Math.round(GAME_SIZE.width * HIGH_DPI_RENDER_SCALE),
    height: Math.round(GAME_SIZE.height * HIGH_DPI_RENDER_SCALE)
});

const configuredScenes = new WeakSet<Scene>();

/** Keeps scene coordinates logical while rendering the canvas and text at display density. */
export function configureHighDpiScene (scene: Scene): void {
    if (configuredScenes.has(scene)) return;
    configuredScenes.add(scene);

    scene.cameras.main.setOrigin(0, 0).setZoom(HIGH_DPI_RENDER_SCALE);
    scene.events.on(Scenes.Events.ADDED_TO_SCENE, (gameObject: GameObjects.GameObject) => {
        if (gameObject instanceof GameObjects.Text) gameObject.setResolution(HIGH_DPI_RENDER_SCALE);
    });
}
