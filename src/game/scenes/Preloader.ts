import { Scene } from 'phaser';
import { AUDIO_CATALOG } from '../audio/catalog';

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

    preload():void {
        Object.values(AUDIO_CATALOG).forEach(cue=>this.load.audio(cue.key,[...cue.sources]));
        this.load.on('loaderror',(file:{key:string})=>{if(import.meta.env.DEV)console.info(`[audio] optional cue unavailable: ${file.key}`);});
    }

    create () { this.scene.start('Workstation'); }
}
