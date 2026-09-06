import {GameObjects,Input,Scene,Scenes} from 'phaser';
import type {EvaluatedResult} from '../domain/EndOfDayResults';
import {COLORS,TYPE} from '../ui/theme';
import {gameAudio}from'../audio/GameAudio';
import {installResultsDiagnostics}from'../presentation/PlaytestDiagnostics';
import {configureHighDpiScene}from'../presentation/HighDpiRendering';
import {GAME_SIZE}from'../ui/layout';

export class Results extends Scene{
 private result!:EvaluatedResult;private runId=0;private restarting=false;private restart?:GameObjects.Rectangle;private detachAudio?:()=>void;private unsubscribeAudio?:()=>void;private muteText?:GameObjects.Text;private removeDiagnostics?:()=>void;
 constructor(){super('Results');}
 init(data:{result:EvaluatedResult;runId?:number}):void{configureHighDpiScene(this);if(!data?.result)throw new TypeError('Results requires an evaluated result.');this.result=data.result;this.runId=data.runId??0;this.restarting=false;}
 create():void{const {width,height}=GAME_SIZE,e=this.result.evidence;this.detachAudio=gameAudio.attach(this.sound);this.cameras.main.setBackgroundColor(COLORS.backdrop);this.add.rectangle(width/2,height/2,width,height,COLORS.desk);this.add.rectangle(width/2,360,1160,650,COLORS.surface,.98).setStrokeStyle(2,COLORS.borderStrong);
  this.add.text(width/2,34,'RUN AUTOPSY · COLLAPSE CONFIRMED',{fontFamily:TYPE.family,fontSize:15,color:'#f58a9d',fontStyle:'bold'}).setOrigin(.5,0);
  this.add.text(width/2,62,this.result.ending.title.toUpperCase(),{fontFamily:TYPE.family,fontSize:TYPE.display,color:'#ffffff',fontStyle:'bold'}).setOrigin(.5,0);
  this.add.text(width/2,108,this.result.ending.narrative,{fontFamily:TYPE.family,fontSize:14,color:'#c4cdd1',align:'center',wordWrap:{width:860}}).setOrigin(.5,0);
  this.add.text(72,166,`LASTED  ${this.result.survivalLabel.toUpperCase()}`,{fontFamily:TYPE.family,fontSize:27,color:'#8ac5ff',fontStyle:'bold'});
  this.result.autopsy.forEach((line,index)=>{const column=index%2,row=Math.floor(index/2),x=72+column*602,y=226+row*82;this.add.text(x,y,line.label.toUpperCase(),{fontFamily:TYPE.family,fontSize:11,color:'#8fdbca',fontStyle:'bold'});this.add.text(x,y+25,line.value,{fontFamily:TYPE.family,fontSize:13,color:'#d9e2ec',wordWrap:{width:510}});});
  this.add.text(72,494,`TOTAL SURVIVAL ${Math.floor(e.elapsedGameMs/60_000)} GAME MINUTES  ·  ${e.activeInterruptionIds.length} PROBLEMS LEFT FOR SOMEONE ELSE`,{fontFamily:TYPE.family,fontSize:12,color:'#7f8da3'});
  this.restart=this.add.rectangle(width/2,630,330,54,COLORS.blue).setStrokeStyle(3,COLORS.selected).setInteractive({useHandCursor:true});this.add.text(width/2,630,'› TRY ANOTHER RUN · ENTER',{fontFamily:TYPE.family,fontSize:16,color:'#ffffff',fontStyle:'bold'}).setOrigin(.5);const mute=this.add.rectangle(1050,610,150,40,COLORS.surfaceMuted).setOrigin(0).setStrokeStyle(2,COLORS.borderStrong).setInteractive({useHandCursor:true});this.muteText=this.add.text(1125,630,'',{fontFamily:TYPE.family,fontSize:TYPE.small,color:COLORS.text,fontStyle:'bold'}).setOrigin(.5);mute.on(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>gameAudio.toggle());this.unsubscribeAudio=gameAudio.subscribe(()=>this.muteText?.setText(gameAudio.muted?'× SOUND MUTED':'♪ SOUND ON'));this.restart.once(Input.Events.GAMEOBJECT_POINTER_DOWN,()=>this.restartRun());this.input.keyboard?.once('keydown-ENTER',()=>this.restartRun());this.removeDiagnostics=installResultsDiagnostics(this.runId,this.result.evidence.completedTaskIds,this.result.evidence.resolutions.map(item=>item.eventId));this.events.once(Scenes.Events.SHUTDOWN,()=>{this.input.keyboard?.removeAllListeners();this.unsubscribeAudio?.();this.detachAudio?.();this.removeDiagnostics?.();this.removeDiagnostics=undefined;this.sound.stopAll();});}
 private restartRun():void{if(this.restarting)return;this.restarting=true;this.restart?.disableInteractive();this.input.resetPointers();this.input.keyboard?.resetKeys();this.removeDiagnostics?.();this.scene.start('Workstation');}
}
