import { AUTO, Game, Scale } from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Workstation } from './scenes/Workstation';
import { Results } from './scenes/Results';
import { HIGH_DPI_GAME_SIZE } from './presentation/HighDpiRendering';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO, width: HIGH_DPI_GAME_SIZE.width, height: HIGH_DPI_GAME_SIZE.height, parent: 'game-container', backgroundColor: '#111722',
    scale: { mode: Scale.FIT, autoCenter: Scale.CENTER_BOTH, width: HIGH_DPI_GAME_SIZE.width, height: HIGH_DPI_GAME_SIZE.height },
    scene: [Boot, Preloader, Workstation, Results]
};

const StartGame = (parent: string) => {
    const game = new Game({ ...config, parent });
    if (import.meta.env.DEV || new URLSearchParams(window.location.search).get('playtest') === '1') {
        (window as Window & { __PHASER_GAME__?: Game }).__PHASER_GAME__ = game;
    }
    return game;
};
export default StartGame;
