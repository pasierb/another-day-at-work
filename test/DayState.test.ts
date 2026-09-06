import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DayState, RESOURCE_KEYS, type DayStateSnapshot } from '../src/game/domain/DayState.ts';

describe('DayState', () => {
    it('starts with the documented default snapshot', () => {
        const snapshot = new DayState().snapshot;
        assert.deepEqual(snapshot.resources, {
            stamina: 75, poHappiness: 75, systemStability: 75, technicalDebt: 0
        });
        assert.equal(snapshot.clockHour, 9);
        assert.equal(snapshot.clockMinute, 0);
        assert.equal(snapshot.dayProgress, 0);
        assert.equal(snapshot.isPaused, false);
    });

    it('honors configured initialization and keeps snapshot data immutable', () => {
        const state = new DayState({
            startMinute: 8 * 60 + 30,
            endMinute: 10 * 60,
            gameMinutesPerRealSecond: 2,
            initialResources: { stamina: 20, technicalDebt: 40 },
            initialPauseReasons: ['intro']
        });
        assert.deepEqual(state.snapshot.resources, {
            stamina: 20, poHappiness: 75, systemStability: 75, technicalDebt: 40
        });
        assert.deepEqual([state.snapshot.clockHour, state.snapshot.clockMinute], [8, 30]);
        assert.equal(state.snapshot.isPaused, true);
        assert.equal(Object.isFrozen(state.snapshot), true);
        assert.equal(Object.isFrozen(state.snapshot.resources), true);
    });

    it('retains precise elapsed time and derives clock and progress from it', () => {
        const state = new DayState();
        state.advance(16.666);
        state.advance(16.667);
        state.advance(26.667);
        assert.ok(Math.abs(state.snapshot.elapsedGameMs - 3_600) < 0.001);
        assert.equal(state.snapshot.clockMinute, 0);
        state.advance(1_000);
        assert.equal(state.snapshot.clockMinute, 1);
        assert.equal(state.snapshot.dayProgress, 63_600 / (8 * 60 * 60_000));
    });

    it('composes pauses and advances only after the final reason resumes', () => {
        const state = new DayState();
        state.pause('menu');
        state.pause('dialog');
        state.pause('menu');
        state.advance(1_000);
        state.resume('menu');
        state.advance(1_000);
        assert.equal(state.snapshot.elapsedGameMs, 0);
        state.resume('missing');
        state.resume('dialog');
        state.advance(1_000);
        assert.equal(state.snapshot.elapsedGameMs, 60_000);
    });

    it('clamps exactly at 17:00 and ignores subsequent advancement', () => {
        const state = new DayState();
        state.advance(60 * 60 * 1_000);
        const atEnd = state.snapshot;
        assert.deepEqual([atEnd.clockHour, atEnd.clockMinute], [17, 0]);
        assert.equal(atEnd.dayProgress, 1);
        assert.equal(atEnd.isDayComplete, true);
        state.advance(1_000);
        assert.equal(state.snapshot.elapsedGameMs, atEnd.elapsedGameMs);
    });

    it('spends action time while paused and keeps the pause active', () => {
        const state = new DayState();
        state.pause('decision');
        state.spendGameMinutes(25);
        assert.equal(state.snapshot.elapsedGameMs, 25 * 60_000);
        assert.equal(state.snapshot.clockMinute, 25);
        assert.deepEqual(state.snapshot.pauseReasons, ['decision']);
    });

    it('clamps action time at day end and ignores zero or completed-day costs', () => {
        const state = new DayState();
        let notifications = 0;
        state.subscribe(() => { notifications += 1; });
        state.spendGameMinutes(0);
        state.spendGameMinutes(500);
        state.spendGameMinutes(10);
        assert.deepEqual([state.snapshot.clockHour, state.snapshot.clockMinute], [17, 0]);
        assert.equal(state.snapshot.dayProgress, 1);
        assert.equal(notifications, 1);
    });

    it('rejects invalid action-time costs without changing time', () => {
        const state = new DayState();
        for (const cost of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
            assert.throws(() => state.spendGameMinutes(cost), RangeError);
            assert.equal(state.snapshot.elapsedGameMs, 0);
        }
    });

    it('resets configured time, resources, and pause state deterministically', () => {
        const state = new DayState({ initialResources: { stamina: 25 }, initialPauseReasons: ['initial'] });
        state.resume('initial');
        state.advance(5_000);
        state.mutateResource('stamina', 30);
        state.pause('menu');
        state.reset();
        assert.equal(state.snapshot.elapsedGameMs, 0);
        assert.equal(state.snapshot.resources.stamina, 25);
        assert.deepEqual(state.snapshot.pauseReasons, ['initial']);
    });

    it('mutates every resource through the shared path and clamps both bounds', () => {
        const state = new DayState();
        for (const key of RESOURCE_KEYS) {
            state.mutateResource(key, 1_000);
            assert.equal(state.snapshot.resources[key], 100);
            state.mutateResource(key, -1_000);
            assert.equal(state.snapshot.resources[key], 0);
            state.mutateResource(key, 42);
            assert.equal(state.snapshot.resources[key], 42);
        }
    });

    it('notifies after effective changes only, with fresh snapshots', () => {
        const state = new DayState();
        const snapshots: DayStateSnapshot[] = [];
        state.subscribe(snapshot => snapshots.push(snapshot));
        state.mutateResource('technicalDebt', -1);
        state.pause('menu');
        state.pause('menu');
        state.resume('missing');
        state.advance(1_000);
        state.resume('menu');
        state.advance(1_000);
        state.reset();
        state.reset();
        assert.equal(snapshots.length, 4);
        assert.equal(snapshots[0]?.isPaused, true);
        assert.equal(snapshots[1]?.isPaused, false);
        assert.equal(snapshots[2]?.clockMinute, 1);
        assert.equal(snapshots[3]?.clockMinute, 0);
        assert.notEqual(snapshots[0], snapshots[1]);
    });

    it('stops notifications after an idempotent unsubscribe', () => {
        const state = new DayState();
        let notifications = 0;
        const unsubscribe = state.subscribe(() => { notifications += 1; });
        state.mutateResource('stamina', 1);
        unsubscribe();
        unsubscribe();
        state.mutateResource('stamina', 1);
        assert.equal(notifications, 1);
    });
});
