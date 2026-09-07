import {ConsequenceQueue,type QueuedConsequence} from './ConsequenceQueue';
import {SeededRandom,type RandomSource} from './EventScheduler';
import {evaluateDebtModifier,type ConsequenceFeedback,type Effect} from './effects';
import type {ResourceKey} from './DayState';

export interface EffectEnginePorts {
 readonly mutateResource:(resource:ResourceKey,amount:number)=>void;
 readonly relieveNeed?:(need:'sleepiness'|'toilet',value?:number)=>void;
 readonly consumeBooster?:(booster:'coffee'|'cokeZero')=>void;
 readonly queue:ConsequenceQueue;
 readonly gameTime:()=>number; readonly technicalDebt:()=>number;
 readonly feedback:(record:ConsequenceFeedback)=>void; readonly consequenceConcluded?:(id:string)=>void;
}
export class EffectEngine {
 private readonly random:RandomSource; private executing=0;
 constructor(private readonly ports:EffectEnginePorts,seed=1,random?:RandomSource){this.random=random??new SeededRandom(seed);}
 execute(effects:readonly Effect[],sourceId:string):void{if(++this.executing>1000){this.executing--;throw new Error('Effect transition limit exceeded.');}try{for(const effect of effects)this.executeOne(effect,sourceId);}finally{this.executing--;}}
 synchronize(ms=this.ports.gameTime()):readonly QueuedConsequence[]{const due=this.ports.queue.drainDue(ms);for(const item of due){this.execute(item.effects,item.sourceId);this.ports.consequenceConcluded?.(item.id);this.ports.feedback(Object.freeze({consequenceId:item.id,sourceId:item.sourceId,kind:'concluded',tone:'neutral',text:item.concludedFeedback}));}return due;}
 reset():void{this.random.reset();this.ports.queue.reset();}
 private executeOne(effect:Effect,source:string):void{
  if(effect.type==='resource')this.ports.mutateResource(effect.resource,effect.amount);
  else if(effect.type==='relieve-need'){if(!this.ports.relieveNeed)throw new Error('Need relief port is not configured.');this.ports.relieveNeed(effect.need,effect.value);}
  else if(effect.type==='consume-booster'){if(!this.ports.consumeBooster)throw new Error('Booster port is not configured.');this.ports.consumeBooster(effect.booster);}
  else if(effect.type==='delayed'){this.ports.queue.enqueue({id:effect.id,sourceId:source,deadlineGameMs:this.ports.gameTime()+effect.delayGameMs,effects:effect.effects,concludedFeedback:effect.concludedFeedback});this.ports.feedback(Object.freeze({consequenceId:effect.id,sourceId:source,kind:'scheduled',tone:'neutral',text:effect.scheduledFeedback}));}
  else {const chance=evaluateDebtModifier(effect.chance,this.ports.technicalDebt(),effect.debtModifier),success=this.random.next()<Math.min(1,Math.max(0,chance));this.execute(success?effect.successEffects:effect.failureEffects??[],source);this.ports.consequenceConcluded?.(effect.id);this.ports.feedback(Object.freeze({consequenceId:effect.id,sourceId:source,kind:'concluded',tone:success?'negative':'positive',text:success?effect.successFeedback:effect.failureFeedback}));}
 }
}
