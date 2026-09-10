import assert from 'node:assert/strict';
import { it } from 'node:test';
import { WorkdaySession } from '../src/game/domain/WorkdaySession.ts';
import { NORMAL_PACING_PROFILE } from '../src/game/domain/WorkdayPacing.ts';

it('normal play overflows six cards within 18 seconds, even with a decision open', () => {
    for (const seed of [1, 7, 42, 20260907]) {
        const session = new WorkdaySession(NORMAL_PACING_PROFILE, seed);
        assert.ok(session.interruptions.snapshot.openInterruption);
        for (let tick = 0; tick < 180; tick++) session.advanceRealMs(100);
        assert.ok(session.interruptions.snapshot.active.length > 6, `seed ${seed} should overflow`);
        assert.equal(session.lifecycle, 'active');
        assert.ok(session.interruptions.snapshot.active.some(card => card.stageIndex >= 0));
        const elapsed = session.workday.snapshot.elapsedGameMs;
        session.workday.pause('player-pause');
        session.advanceRealMs(10_000);
        assert.equal(session.workday.snapshot.elapsedGameMs, elapsed);
    }
});

it('a thorough review admits more work than a shortcut, which sacrifices stability', () => {
    const review = (choiceId: string) => {
        const session = new WorkdaySession(NORMAL_PACING_PROFILE, 42, () => {}, false);
        session.interruptions.activate('ambient-review-migration');
        session.openInterruption('ambient-review-migration');
        session.perform({ type: 'resolve-interruption', interruptionId: 'ambient-review-migration', choiceId });
        return session;
    };
    const thorough = review('review-migration'), shortcut = review('rubber-stamp-migration');
    assert.ok(thorough.interruptions.snapshot.active.length > shortcut.interruptions.snapshot.active.length);
    assert.ok(thorough.workday.snapshot.resources.systemStability > shortcut.workday.snapshot.resources.systemStability);
    assert.ok(thorough.workday.snapshot.resources.technicalDebt < shortcut.workday.snapshot.resources.technicalDebt);
});
