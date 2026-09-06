import { Sound } from 'phaser';
import { AUDIO_CATALOG } from './catalog';
import { AUDIO_CUES, AUDIO_MASTER_GAIN, AudioPolicy, type AudioCue } from './AudioPolicy';
import { MutePreference } from './MutePreference';
import { AudioUnlockAdapter } from './AudioUnlock';

type Listener=()=>void;
function browserStorage(){try{return typeof window==='undefined'?undefined:window.localStorage;}catch{return undefined;}}
class AudioRuntime {
    readonly preference=new MutePreference(browserStorage());
    private unlocked=false;private installed=false;private manager?:Sound.BaseSoundManager;private listeners=new Set<Listener>();private adapter?:AudioUnlockAdapter;
    attach(manager:Sound.BaseSoundManager):()=>void{this.manager=manager;manager.volume=AUDIO_MASTER_GAIN;manager.mute=this.preference.muted;this.install();return()=>{if(this.manager===manager)this.manager=undefined;};}
    get isUnlocked():boolean{return this.unlocked;}
    get muted():boolean{return this.preference.muted;}
    toggle():void{this.preference.setMuted(!this.preference.muted);if(this.manager){this.manager.mute=this.preference.muted;if(this.preference.muted)this.manager.stopAll();}this.emit();}
    subscribe(listener:Listener):()=>void{this.listeners.add(listener);listener();return()=>this.listeners.delete(listener);}
    private install():void{if(this.installed||typeof window==='undefined')return;this.installed=true;const attempt=()=>void this.unlock();window.addEventListener('pointerdown',attempt,{capture:true});window.addEventListener('touchend',attempt,{capture:true});window.addEventListener('keydown',attempt,{capture:true});}
    private async unlock():Promise<void>{if(this.unlocked||this.preference.muted||!this.manager)return;if(!this.adapter){const manager=this.manager as Sound.WebAudioSoundManager;this.adapter=new AudioUnlockAdapter(async()=>{const context=manager.context;if(context?.state==='suspended')await context.resume();return !context||context.state==='running';});}if(await this.adapter.qualifyingGesture()){this.unlocked=true;this.emit();}}
    private emit():void{this.listeners.forEach(listener=>listener());}
}
export const gameAudio=new AudioRuntime();

export class SceneAudioDirector {
    private readonly policy=new AudioPolicy();private readonly sounds=new Map<number,Sound.BaseSound>();private typingId?:number;private disposed=false;
    constructor(private readonly manager:Sound.BaseSoundManager){this.policy.setUnlocked(gameAudio.isUnlocked);this.policy.setMuted(gameAudio.muted);}
    sync():void{this.policy.setUnlocked(gameAudio.isUnlocked);this.policy.setMuted(gameAudio.muted);if(gameAudio.muted)this.stopAll();}
    cue(cue:AudioCue,key:string,now=performance.now()):boolean{if(this.disposed)return false;this.sync();const decision=this.policy.request(cue,now,key);if(!decision.play)return false;if(decision.replacedId!==undefined)this.stop(decision.replacedId);const voices=this.policy.activeVoices;const voice=voices[voices.length-1]!;const asset=AUDIO_CATALOG[cue].key;if(!this.manager.game.cache.audio.exists(asset)){this.policy.stop(voice.id);return false;}try{const sound=this.manager.add(asset,{volume:AUDIO_CUES[cue].gain,loop:Boolean(AUDIO_CUES[cue].loop)});this.sounds.set(voice.id,sound);if(cue==='typing')this.typingId=voice.id;sound.once('complete',()=>this.stop(voice.id));sound.play();return true;}catch{this.stop(voice.id);return false;}}
    setTyping(active:boolean,key:string):void{if(active){if(this.typingId===undefined)this.cue('typing',key);}else this.stopTyping();}
    stopTyping():void{if(this.typingId!==undefined)this.stop(this.typingId);this.policy.stopTyping();this.typingId=undefined;}
    stopAll():void{[...this.sounds.keys()].forEach(id=>this.stop(id));}
    dispose():void{this.disposed=true;this.stopAll();this.policy.dispose();}
    private stop(id:number):void{const sound=this.sounds.get(id);if(sound){sound.stop();sound.destroy();this.sounds.delete(id);}this.policy.stop(id);if(this.typingId===id)this.typingId=undefined;}
}
