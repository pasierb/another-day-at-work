import assert from 'node:assert/strict';import {describe,it}from'node:test';
import {GUIDANCE_COPY,GUIDANCE_LAYOUT}from'../src/game/presentation/GuidanceContent.ts';
describe('guidance presentation',()=>{
 it('names every required concept concisely',()=>{const copy=Object.values(GUIDANCE_COPY).join(' ');for(const term of ['17:00','Prompt','Plan','approve','Urgent alerts','Resources','START WORKING'])assert.match(copy,new RegExp(term,'i'));});
 it('keeps copy and a touch-sized dismissal inside the fixed composition',()=>{const x=GUIDANCE_LAYOUT.x+GUIDANCE_LAYOUT.buttonX,y=GUIDANCE_LAYOUT.y+GUIDANCE_LAYOUT.buttonY;assert.ok(GUIDANCE_LAYOUT.width<=740&&GUIDANCE_LAYOUT.height<=512);assert.ok(GUIDANCE_LAYOUT.buttonWidth>=44);assert.ok(x>=0&&x+GUIDANCE_LAYOUT.buttonWidth<=1280);assert.ok(y>=0&&y+42<=720);assert.ok(GUIDANCE_LAYOUT.buttonY>380);});
});
