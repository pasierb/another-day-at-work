export const GUIDANCE_STORAGE_KEY = 'another-day-at-work:guidance:v1';

export interface GuidanceStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export class GuidancePreference {
    private dismissedValue = false;

    constructor (private readonly storage?: GuidanceStorage) {
        this.dismissedValue = this.read();
    }

    get dismissed (): boolean { return this.dismissedValue; }

    dismiss (): void {
        if (this.dismissedValue) return;
        this.dismissedValue = true;
        try {
            this.storage?.setItem(GUIDANCE_STORAGE_KEY, JSON.stringify({ version: 1, dismissed: true }));
        } catch {
            // Keep the session-level value authoritative when storage is unavailable.
        }
    }

    private read (): boolean {
        try {
            const raw = this.storage?.getItem(GUIDANCE_STORAGE_KEY);
            if (!raw) return false;
            const value: unknown = JSON.parse(raw);
            return Boolean(value && typeof value === 'object'
                && 'version' in value && (value as { version: unknown }).version === 1
                && 'dismissed' in value && (value as { dismissed: unknown }).dismissed === true);
        } catch {
            return false;
        }
    }
}

export function browserGuidanceStorage (): GuidanceStorage | undefined {
    try { return typeof window === 'undefined' ? undefined : window.localStorage; } catch { return undefined; }
}
