import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BoosterSession } from '../src/game/domain/BoosterSession.ts';

const context = (elapsedGameMs = 0, stamina = 50, isDecisionOpen = false, isDayComplete = false) =>
    ({ elapsedGameMs, stamina, isDecisionOpen, isDayComplete });

describe('BoosterSession', () => {
    it('returns exact configured effects, counts, escalating feedback, and immutable snapshots', () => {
        const session = new BoosterSession({ boosters: { coffee: { cooldownGameMs: 0 }, cokeZero: { cooldownGameMs: 0 } } });
        const coffee = session.activate('coffee', context()).result!;
        assert.deepEqual(coffee, { boosterId: 'coffee', staminaRestoration: 30, toiletNeedIncrease: 0, consumptionCount: 1, feedback: 'Nice.' });
        assert.equal(session.activate('coffee', context()).result?.feedback, 'Productivity.');
        assert.equal(session.activate('coffee', context()).result?.feedback, 'You can now hear Kubernetes.');
        assert.equal(session.activate('coffee', context()).result?.feedback, 'Heart Rate Observability enabled.');
        const coke = session.activate('cokeZero', context()).result!;
        assert.deepEqual(coke, { boosterId: 'cokeZero', staminaRestoration: 15, toiletNeedIncrease: 12, consumptionCount: 1, feedback: 'Zero sugar. Non-zero consequences.' });
        assert.deepEqual(session.snapshot.consumptionCounts, { coffee: 4, cokeZero: 1 });
        assert.ok(Object.isFrozen(session.snapshot));
        assert.ok(Object.isFrozen(session.snapshot.consumptionCounts));
        assert.ok(Object.isFrozen(session.config.boosters.coffee.feedback));
    });

    it('maintains independent game-time cooldowns and rejects unavailable or duplicate activation', () => {
        const session = new BoosterSession({ boosters: { coffee: { cooldownGameMs: 100 }, cokeZero: { cooldownGameMs: 40 } } });
        assert.equal(session.activate('coffee', context()).accepted, true);
        assert.equal(session.activate('coffee', context()).accepted, false);
        assert.equal(session.activate('cokeZero', context()).accepted, true);
        let snapshot = session.synchronize(context(50));
        assert.equal(snapshot.availability.coffee.available, false);
        assert.equal(snapshot.availability.cokeZero.available, true);
        snapshot = session.synchronize(context(100));
        assert.equal(snapshot.availability.coffee.available, true);
        assert.equal(session.activate('coffee', context(100, 100)).accepted, false);
        assert.equal(session.activate('coffee', context(100, 50, true)).accepted, false);
        assert.equal(session.activate('coffee', context(100, 50, false, true)).accepted, false);
        assert.deepEqual(session.snapshot.consumptionCounts, { coffee: 1, cokeZero: 1 });
    });

    it('exposes bounded monotonic risk and seeded opportunity outcomes, then resets deterministically', () => {
        const options = { boosters: { coffee: { cooldownGameMs: 0 } }, coffeeCrash: { initialProbability: 0.1, probabilityPerCoffee: 0.3, maximumProbability: 0.7 } } as const;
        const first = new BoosterSession(options, 42);
        const second = new BoosterSession(options, 42);
        const risks: number[] = [];
        for (let index = 0; index < 4; index += 1) {
            first.activate('coffee', context()); second.activate('coffee', context());
            risks.push(first.snapshot.coffeeCrashProbability);
        }
        assert.deepEqual(risks, [0.4, 0.7, 0.7, 0.7]);
        const outcomes = [first.evaluateCoffeeCrashOpportunity(), first.evaluateCoffeeCrashOpportunity()];
        assert.deepEqual(outcomes, [second.evaluateCoffeeCrashOpportunity(), second.evaluateCoffeeCrashOpportunity()]);
        first.reset();
        assert.equal(first.snapshot.coffeeCrashProbability, 0.1);
        assert.deepEqual(first.snapshot.consumptionCounts, { coffee: 0, cokeZero: 0 });
        for (let index = 0; index < 4; index += 1) first.activate('coffee', context());
        assert.equal(first.evaluateCoffeeCrashOpportunity(), outcomes[0]);
    });

    it('validates configuration, time, IDs, and notifies observers', () => {
        assert.throws(() => new BoosterSession({ boosters: { coffee: { staminaRestoration: 0 } } }), TypeError);
        assert.throws(() => new BoosterSession({ boosters: { cokeZero: { staminaRestoration: 31 } } }), RangeError);
        assert.throws(() => new BoosterSession({ coffeeCrash: { maximumProbability: 2 } }), RangeError);
        const session = new BoosterSession();
        assert.throws(() => session.synchronize(context(-1)), RangeError);
        assert.throws(() => session.activate('tea' as never, context()), TypeError);
        let notifications = 0;
        const unsubscribe = session.subscribe(() => { notifications += 1; });
        session.synchronize(context());
        session.activate('coffee', context());
        unsubscribe();
        session.reset();
        assert.equal(notifications, 2);
    });
});
