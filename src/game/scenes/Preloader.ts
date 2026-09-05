import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor () { super('Preloader'); }

    init () {
        this.cameras.main.setBackgroundColor(0x111722);
        this.add.text(640, 328, 'ANOTHER DAY AT WORK', {
            fontFamily: 'Arial, sans-serif', fontSize: 28, color: '#f2f5f7', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.rectangle(640, 374, 322, 10, 0x273343).setStrokeStyle(1, 0x46566b);
        const bar = this.add.rectangle(481, 374, 4, 6, 0x62d9b6).setOrigin(0, 0.5);
        this.load.on('progress', (progress: number) => { bar.width = 318 * progress; });
    }

    create () { this.scene.start('Workstation'); }
}
