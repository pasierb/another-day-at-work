import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PlayerNeeds, type NeedStageConfig } from '../src/game/domain/PlayerNeeds.ts';

const stages = (critical = false): readonly NeedStageConfig[] => [
    { id: 'fine', label: 'Fine', threshold: 0, penalty: { codingSpeed: 1, focusGain: 1, additionalStaminaPerGameMinute: 0 } },
    { id: 'warn', label: 'Warning', threshold: 25, warning: 'warning', penalty: { codingSpeed: 0.8, focusGain: 0.75, additionalStaminaPerGameMinute: 1 } },
    { id: 'bad', label: 'Bad', threshold: 50, warning: 'bad', penalty: { codingSpeed: 0.5, focusGain: 0.5, additionalStaminaPerGameMinute: 2 } },
    { id: 'critical', label: 'Critical', threshold: 75, warning: 'critical', penalty: { codingSpeed: 0.2, focusGain: 0.25, additionalStaminaPerGameMinute: 3 }, criticalEffect: critical ? { id: 'critical', feedback: 'critical', focusReduction: 0.5, staminaCost: 4, timeLossGameMinutes: 5 } : undefined }
];

const needs = () => new PlayerNeeds({ needs: {
    sleepiness: { gainPerGameMinute: 1, stages: stages(true) },
    toilet: { gainPerGameMinute: 2, relievedValue: 10, stages: stages(true) }
} });

describe('PlayerNeeds', () => {
    it('validates data-driven configuration', () => {
        assert.throws(() => new PlayerNeeds({ minimumCombinedModifier: -1 }), RangeError);
        assert.throws(() => new PlayerNeeds({ needs: { sleepiness: { gainPerGameMinute: -1 } } }), TypeError);
        assert.throws(() => new PlayerNeeds({ needs: { toilet: { stages: [...stages()].reverse() } } }), TypeError);
    });

    it('progresses from absolute game time, clamps values, and ignores duplicate or older timestamps', () => {
        const model = needs();
        model.synchronize(10 * 60_000);
        assert.equal(model.snapshot.sleepiness.value, 10);
        assert.equal(model.snapshot.toilet.value, 20);
        const duplicate = model.synchronize(10 * 60_000);
        model.synchronize(5 * 60_000);
        assert.equal(duplicate.transitions.length, 0);
        assert.equal(model.snapshot.sleepiness.value, 10);
        model.synchronize(1_000 * 60_000);
        assert.equal(model.snapshot.sleepiness.value, 100);
        assert.equal(model.snapshot.toilet.value, 100);
    });

    it('reports every crossed stage in chronological order and integrates stage drain by segment', () => {
        const result = needs().synchronize(40 * 60_000);
        assert.deepEqual(result.transitions.map(item => `${item.need}:${item.nextStage.id}@${item.atGameMs / 60_000}`), [
            'toilet:warn@12.5', 'sleepiness:warn@25', 'toilet:bad@25', 'toilet:critical@37.5'
        ]);
        assert.equal(result.additionalStaminaCost, 45);
    });

    it('exposes deterministic combined penalties at the resulting stages', () => {
        const model = needs();
        model.synchronize(30 * 60_000);
        assert.equal(model.snapshot.sleepiness.stage.id, 'warn');
        assert.equal(model.snapshot.toilet.stage.id, 'bad');
        assert.equal(model.snapshot.codingSpeedModifier, 0.4);
        assert.equal(model.snapshot.focusGainModifier, 0.375);
        assert.equal(model.snapshot.additionalStaminaPerGameMinute, 3);
    });

    it('suppresses a critical effect within an episode and re-arms it after relief', () => {
        const model = needs();
        let result = model.synchronize(40 * 60_000);
        assert.equal(result.transitions.filter(item => item.criticalEffect).length, 1);
        result = model.synchronize(50 * 60_000);
        assert.equal(result.transitions.filter(item => item.criticalEffect).length, 0);
        model.relieve('toilet');
        assert.equal(model.snapshot.toilet.value, 10);
        result = model.synchronize(90 * 60_000);
        assert.equal(result.transitions.find(item => item.need === 'toilet' && item.nextStage.id === 'critical')?.criticalEffect?.id, 'critical');
    });

    it('notifies changes and reset restores values, time, penalties, transitions, and critical state', () => {
        const model = needs();
        let notifications = 0;
        model.subscribe(() => { notifications += 1; });
        model.synchronize(40 * 60_000);
        model.relieve('toilet');
        model.reset();
        assert.equal(notifications, 3);
        assert.equal(model.snapshot.elapsedGameMs, 0);
        assert.equal(model.snapshot.sleepiness.value, 0);
        assert.equal(model.snapshot.toilet.value, 0);
        assert.equal(model.snapshot.codingSpeedModifier, 1);
        assert.equal(model.synchronize(40 * 60_000).transitions.filter(item => item.criticalEffect).length, 1);
    });

    it('applies bounded external need mutations with ordered transitions and consistent snapshots', () => {
        const model = needs();
        const raised = model.mutateNeed('toilet', 80);
        assert.equal(raised.appliedAmount, 80);
        assert.deepEqual(raised.transitions.map(item => `${item.previousStage.id}->${item.nextStage.id}`), [
            'fine->warn', 'warn->bad', 'bad->critical'
        ]);
        assert.equal(raised.transitions.at(-1)?.criticalEffect?.id, 'critical');
        assert.equal(raised.snapshot.toilet.value, 80);
        const clamped = model.mutateNeed('toilet', 50);
        assert.equal(clamped.appliedAmount, 20);
        assert.equal(clamped.snapshot.toilet.value, 100);
        assert.equal(clamped.transitions.length, 0);
        const lowered = model.mutateNeed('toilet', -90);
        assert.equal(lowered.snapshot.toilet.value, 10);
        assert.deepEqual(lowered.transitions.map(item => `${item.previousStage.id}->${item.nextStage.id}`), [
            'critical->bad', 'bad->warn', 'warn->fine'
        ]);
        assert.ok(lowered.transitions.every(item => !item.warning && !item.criticalEffect));
        const noOp = model.mutateNeed('toilet', 0);
        assert.equal(noOp.appliedAmount, 0);
        assert.equal(noOp.transitions.length, 0);
        assert.equal(noOp.snapshot, noOp.snapshot);
    });

    it('keeps passive synchronization, relief, and critical episode guards after external mutations', () => {
        const model = needs();
        assert.equal(model.mutateNeed('toilet', 80).transitions.filter(item => item.criticalEffect).length, 1);
        assert.equal(model.mutateNeed('toilet', 10).transitions.filter(item => item.criticalEffect).length, 0);
        model.relieve('toilet');
        const synchronized = model.synchronize(40 * 60_000);
        assert.equal(synchronized.snapshot.sleepiness.value, 40);
        assert.equal(synchronized.snapshot.toilet.value, 90);
        assert.equal(synchronized.transitions.filter(item => item.need === 'toilet' && item.criticalEffect).length, 1);
        assert.throws(() => model.mutateNeed('toilet', Number.NaN), TypeError);
        assert.throws(() => model.mutateNeed('hunger' as never, 1), TypeError);
    });
});
