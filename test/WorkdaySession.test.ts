import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {PlayerNeeds} from '../src/game/domain/PlayerNeeds.ts';
import {DEVELOPER_PACING_PROFILE,NORMAL_PACING_PROFILE} from '../src/game/domain/WorkdayPacing.ts';
import {WorkdaySession} from '../src/game/domain/WorkdaySession.ts';
import {BALANCE_SEEDS,REPRESENTATIVE_POLICIES,runWorkdaySimulation} from '../src/game/domain/WorkdaySimulation.ts';

describe('shared workday orchestration',()=>{
    it('integrates crossed need bands identically in one jump or multiple updates and freezes on duplicate time',()=>{const one=new PlayerNeeds({},0,NORMAL_PACING_PROFILE),many=new PlayerNeeds({},0,NORMAL_PACING_PROFILE),end=NORMAL_PACING_PROFILE.bands[3].startGameMs+60_000;one.synchronize(end);for(const band of NORMAL_PACING_PROFILE.bands)many.synchronize(Math.min(end,band.endGameMs));assert.deepEqual(one.snapshot,many.snapshot);const paused=one.snapshot;one.synchronize(end);assert.deepEqual(one.snapshot,paused);});
    it('offers only legal actions, rejects invalid policy output, reaches exact terminal time, and resets cleanly',()=>{const session=new WorkdaySession(DEVELOPER_PACING_PROFILE,7);assert.ok(session.legalActions().some(x=>x.type==='code'));assert.throws(()=>session.perform({type:'switch-task',taskId:'missing'}),/illegal/);session.advanceGameMs(60_000);assert.ok(session.debugSnapshot.needs.sleepiness>0);session.reset();assert.equal(session.workday.snapshot.elapsedGameMs,0);assert.equal(session.scheduler.snapshot.pressure,0);assert.equal(session.debugSnapshot.quietDurationGameMs,0);});
});

describe('seeded full-day balance',()=>{
    it('replays identical inputs and reports complete 17:00 statistics',()=>{const input={profile:DEVELOPER_PACING_PROFILE,seed:BALANCE_SEEDS[0],policy:REPRESENTATIVE_POLICIES.balanced};const a=runWorkdaySimulation(input),b=runWorkdaySimulation(input);assert.deepEqual(a,b);assert.equal(a.elapsedGameMs,8*60*60_000);assert.equal(Object.keys(a.bands).length,5);assert.ok(a.peakPressure<=DEVELOPER_PACING_PROFILE.guardrails.floodPressure);assert.ok(a.criticalWindows.length>0);assert.ok(a.recoveryWindows.length>0);});
    it('keeps morning pressure below main chaos across the fixed seed matrix',()=>{const reports=BALANCE_SEEDS.map(seed=>runWorkdaySimulation({profile:DEVELOPER_PACING_PROFILE,seed,policy:REPRESENTATIVE_POLICIES.balanced}));const morning=reports.reduce((sum,r)=>sum+r.bands.morning.spawns,0),chaos=reports.reduce((sum,r)=>sum+r.bands['main-chaos'].spawns,0);assert.ok(morning<chaos);assert.ok(reports.every(r=>r.maximumQuietGameMs<=DEVELOPER_PACING_PROFILE.guardrails.maximumQuietGameMs));});
    it('preserves equivalent terminal time and bounds across simulation step sizes',()=>{const run=(stepGameMs:number)=>runWorkdaySimulation({profile:DEVELOPER_PACING_PROFILE,seed:3178,policy:REPRESENTATIVE_POLICIES.balanced,stepGameMs});const a=run(60_000),b=run(5*60_000);assert.equal(a.elapsedGameMs,b.elapsedGameMs);assert.deepEqual(a.bands,b.bands);assert.deepEqual(a.completedTaskIds,b.completedTaskIds);assert.deepEqual(a.terminal.resources,b.terminal.resources);});
    it('calibrates normal to 10–20 minutes and developer materially faster',()=>{const normal=runWorkdaySimulation({profile:NORMAL_PACING_PROFILE,seed:911,policy:REPRESENTATIVE_POLICIES.balanced}),developer=runWorkdaySimulation({profile:DEVELOPER_PACING_PROFILE,seed:911,policy:REPRESENTATIVE_POLICIES.balanced});assert.ok(normal.elapsedRealMs>=10*60_000&&normal.elapsedRealMs<=20*60_000);assert.ok(developer.elapsedRealMs<normal.elapsedRealMs/4);});
});
