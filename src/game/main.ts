import { AUTO, Game, Scale } from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Workstation } from './scenes/Workstation';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO, width: 1280, height: 720, parent: 'game-container', backgroundColor: '#111722',
    scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH, width: 1280, height: 720 },
    scene: [Boot, Preloader, Workstation]
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });
    if (import.meta.env.DEV) {
        (window as Window & { __PHASER_GAME__?: Game }).__PHASER_GAME__ = game;
    }
    return game;
};
export default StartGame;
