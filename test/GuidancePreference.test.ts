import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GUIDANCE_STORAGE_KEY, GuidancePreference, type GuidanceStorage } from '../src/game/presentation/GuidancePreference.ts';

const storage = (initial: string | null = null): GuidanceStorage & { value: string | null } => ({
    value: initial,
    getItem () { return this.value; },
    setItem (_key, value) { this.value = value; }
});

describe('GuidancePreference', () => {
    it('starts unseen and remembers one versioned dismissal', () => {
        const store = storage(); const preference = new GuidancePreference(store);
        assert.equal(preference.dismissed, false); preference.dismiss(); preference.dismiss();
        assert.equal(preference.dismissed, true);
        assert.deepEqual(JSON.parse(store.value!), { version: 1, dismissed: true });
        assert.equal(new GuidancePreference(store).dismissed, true);
        assert.equal(GUIDANCE_STORAGE_KEY, 'another-day-at-work:guidance:v1');
    });
    it('rejects malformed, stale, and false records', () => {
        for (const raw of ['bad', '{}', '{"version":2,"dismissed":true}', '{"version":1,"dismissed":false}'])
            assert.equal(new GuidancePreference(storage(raw)).dismissed, false);
    });
    it('keeps an in-memory dismissal when storage throws', () => {
        const broken: GuidanceStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
        const preference = new GuidancePreference(broken); preference.dismiss(); assert.equal(preference.dismissed, true);
    });
});
