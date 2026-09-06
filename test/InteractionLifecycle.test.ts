import assert from 'node:assert/strict';import { describe,it } from 'node:test';
import { InteractionLifecycle,type InteractionCancelReason } from '../src/game/presentation/InteractionLifecycle.ts';

describe('InteractionLifecycle',()=>{
 it('composes pause owners and ignores repeated signals',()=>{const calls:string[]=[];const x=new InteractionLifecycle({cancelInteraction:r=>calls.push(`cancel:${r}`),pause:o=>calls.push(`pause:${o}`),resume:o=>calls.push(`resume:${o}`)});x.setPaused('visibility',true);x.setPaused('visibility',true);x.setPaused('explicit',true);x.setPaused('visibility',false);assert.deepEqual(x.owners,['explicit']);assert.deepEqual(calls,['pause:visibility','pause:explicit','resume:visibility']);});
 it('cancels each boundary and disposes exactly once',()=>{const reasons:InteractionCancelReason[]=[];const x=new InteractionLifecycle({cancelInteraction:r=>reasons.push(r),pause:()=>{},resume:()=>{}});for(const reason of ['pointer-cancel','keyboard-cancel','blur','focus','hidden','visible','resize','orientation','results','restart','overlay'] as const)x.cancel(reason);x.dispose();x.dispose();x.cancel('blur');assert.deepEqual(reasons,[...'pointer-cancel keyboard-cancel blur focus hidden visible resize orientation results restart overlay shutdown'.split(' ')]);});
});
