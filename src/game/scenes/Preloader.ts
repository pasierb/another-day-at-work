import { Scene } from 'phaser';
import { AUDIO_CATALOG } from '../audio/catalog';
import { PRESENTATION_ASSETS } from '../presentation/assets';
import { configureHighDpiScene } from '../presentation/HighDpiRendering';

export class Preloader extends Scene {
    private criticalFailures=new Set<string>();
    constructor () { super('Preloader'); }

    init () {
        configureHighDpiScene(this);
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
        const requestedFailure=import.meta.env.DEV||new URLSearchParams(location.search).has('playtest')?new URLSearchParams(location.search).get('assetFailure'):null;
        PRESENTATION_ASSETS.forEach(asset=>{if(requestedFailure===asset.key){if(asset.classification==='critical')this.criticalFailures.add(asset.key);return;}if(asset.path.endsWith('.svg'))this.load.svg(asset.key,asset.path);else this.load.image(asset.key,asset.path);});
        this.load.on('loaderror',(file:{key:string})=>{const asset=PRESENTATION_ASSETS.find(item=>item.key===file.key);if(asset?.classification==='critical')this.criticalFailures.add(file.key);else if(import.meta.env.DEV)console.info(`[presentation] optional asset unavailable: ${file.key}`);});
    }

    create () { const failures=Object.freeze([...this.criticalFailures]);if(new URLSearchParams(location.search).has('playtest'))(window as Window&{__PRESENTATION_LOAD__?:Readonly<{ready:boolean;criticalFailures:readonly string[]}>}).__PRESENTATION_LOAD__=Object.freeze({ready:failures.length===0,criticalFailures:failures});if(failures.length){this.add.text(640,420,`The illustrated workstation could not load.\nMissing: ${failures.join(', ')}`,{fontFamily:'Arial, sans-serif',fontSize:16,color:'#ef7878',align:'center'}).setOrigin(.5);return;}this.scene.start('Workstation'); }
}
