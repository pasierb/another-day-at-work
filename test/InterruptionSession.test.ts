import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SAMPLE_INTERRUPTIONS } from '../src/game/content/sampleInterruptions.ts';
import { InterruptionSession, validateInterruptionDefinitions, type InterruptionDefinition } from '../src/game/domain/interruptions.ts';

describe('InterruptionSession', () => {
    it('defines four production responses with distinct declared trade-offs',()=>{const incident=SAMPLE_INTERRUPTIONS.find(item=>item.id==='production-errors')!;assert.deepEqual(incident.choices.map(choice=>choice.id),['hotfix','investigate','rollback','ignore-incident']);assert.ok(incident.choices.find(choice=>choice.id==='hotfix')!.effects.some(effect=>effect.type==='delayed'));assert.ok(incident.choices.find(choice=>choice.id==='rollback')!.effects.some(effect=>effect.type==='task-progress'));assert.equal(incident.choices.find(choice=>choice.id==='investigate')!.effects.some(effect=>effect.type==='resource'&&effect.resource==='technicalDebt'),false);validateInterruptionDefinitions(SAMPLE_INTERRUPTIONS);});
    it('rejects missing identity, metadata, duplicate choices, too few choices, and invalid effects', () => {
        const valid = SAMPLE_INTERRUPTIONS[0];
        const reject = (definition: unknown) => assert.throws(
            () => validateInterruptionDefinitions([definition as InterruptionDefinition]),
            TypeError
        );
        reject({ ...valid, id: '' });
        reject({ ...valid, copy: '' });
        reject({ ...valid, choices: [valid.choices[0]] });
        reject({ ...valid, choices: [valid.choices[0], valid.choices[0]] });
        assert.throws(() => validateInterruptionDefinitions([{ ...valid, choices: [
            { ...valid.choices[0], gameMinutes: -1 }, valid.choices[1]
        ] }]), RangeError);
    });

    it('starts empty and explicitly activates immutable representative events', () => {
        const session = new InterruptionSession(SAMPLE_INTERRUPTIONS, 120_000);
        assert.equal(session.snapshot.active.length, 0);
        SAMPLE_INTERRUPTIONS.forEach((item, index) => session.activate(item.id, 120_000, index));
        assert.deepEqual(session.snapshot.active.map(item => item.category), ['product-owner', 'production', 'teammate']);
        assert.equal(session.snapshot.openInterruption, null);
        assert.equal(Object.isFrozen(session.snapshot), true);
        assert.equal(Object.isFrozen(session.snapshot.active), true);
        for (const item of session.snapshot.active) assert.ok(item.choices.length >= 2);
    });

    it('derives age only from supplied game time', () => {
        const session = new InterruptionSession(SAMPLE_INTERRUPTIONS, 60_000, true);
        session.setCurrentGameMs(181_000);
        assert.equal(session.snapshot.active[0]?.ageGameMinutes, 2);
        assert.equal(session.snapshot.active[0]?.ageGameMinutes, 2);
    });

    it('opens only one active decision at a time', () => {
        const session = new InterruptionSession(SAMPLE_INTERRUPTIONS, 0, true);
        assert.equal(session.open('po-scope-request'), true);
        assert.equal(session.open('production-errors'), false);
        assert.equal(session.snapshot.openInterruption?.id, 'po-scope-request');
    });

    it('guards resolution and removes an event exactly once', () => {
        const session = new InterruptionSession(SAMPLE_INTERRUPTIONS, 0, true);
        session.open('production-errors');
        const pending = session.beginResolution('hotfix');
        assert.equal(pending?.choice.id, 'hotfix');
        assert.equal(session.beginResolution('hotfix'), null);
        assert.equal(session.finalizeResolution('production-errors'), true);
        assert.equal(session.finalizeResolution('production-errors'), false);
        assert.deepEqual(session.snapshot.resolvedIds, ['production-errors']);
        assert.equal(session.snapshot.active.some(item => item.id === 'production-errors'), false);
    });

    it('advances every crossed stage once and emits immutable effects and follow-ups', () => {
        const session = new InterruptionSession(SAMPLE_INTERRUPTIONS);
        session.activate('po-scope-request', 0, 3);
        const transitions = session.setCurrentGameMs(90 * 60_000);
        assert.deepEqual(transitions.map(item => item.stageIndex), [0, 1]);
        assert.deepEqual(transitions[1]?.followUpIds, ['teammate-help']);
        assert.equal(Object.isFrozen(transitions), true);
        assert.equal(session.setCurrentGameMs(100 * 60_000).length, 0);
        assert.equal(session.snapshot.active[0]?.nextEscalationGameMs, null);
    });

    it('postpones from the absolute deadline and ignores into the next stage with lifecycle guards', () => {
        const session = new InterruptionSession(SAMPLE_INTERRUPTIONS);
        session.activate('production-errors', 0);
        const before = session.snapshot.active[0]!.nextEscalationGameMs!;
        assert.equal(session.postpone('production-errors'), true);
        assert.equal(session.snapshot.active[0]!.nextEscalationGameMs, before + 10 * 60_000);
        const ignored = session.ignore('production-errors');
        assert.equal(ignored[0]?.stageIndex, 0);
        session.open('production-errors');
        assert.equal(session.postpone('production-errors'), false);
        assert.equal(session.ignore('production-errors').length, 0);
    });

    it('lets an accepted resolution win over a same-time escalation', () => {
        const session = new InterruptionSession(SAMPLE_INTERRUPTIONS);
        session.activate('production-errors', 0);
        session.open('production-errors'); session.beginResolution('hotfix');
        assert.equal(session.setCurrentGameMs(20 * 60_000).length, 0);
        assert.equal(session.finalizeResolution('production-errors'), true);
    });

    it('rejects missing, self, and invalid-timing escalation references', () => {
        const valid = SAMPLE_INTERRUPTIONS[0];
        assert.throws(() => validateInterruptionDefinitions([{ ...valid, escalationStages: [{ ...valid.escalationStages[0], followUpIds: ['missing'] }] }]), TypeError);
        assert.throws(() => validateInterruptionDefinitions([{ ...valid, escalationStages: [{ ...valid.escalationStages[0], followUpIds: [valid.id] }] }]), TypeError);
        assert.throws(() => validateInterruptionDefinitions([{ ...valid, escalationStages: [{ ...valid.escalationStages[0], delayGameMs: 0 }] }]), RangeError);
        const a = { ...valid, id: 'a', escalationStages: [{ ...valid.escalationStages[0], followUpIds: ['b'] }] };
        const b = { ...SAMPLE_INTERRUPTIONS[1], id: 'b', escalationStages: [{ ...SAMPLE_INTERRUPTIONS[1].escalationStages[0], followUpIds: ['a'] }] };
        assert.throws(() => validateInterruptionDefinitions([a, b]), TypeError);
    });
});
