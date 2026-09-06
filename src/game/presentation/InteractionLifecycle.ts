export type LifecyclePauseOwner = 'guidance' | 'visibility' | 'explicit';
export type InteractionCancelReason = 'pointer-cancel' | 'keyboard-cancel' | 'blur' | 'focus'
    | 'hidden' | 'visible' | 'resize' | 'orientation' | 'results' | 'restart' | 'shutdown' | 'overlay';

export interface InteractionLifecycleAdapter {
    cancelInteraction(reason: InteractionCancelReason): void;
    pause(owner: LifecyclePauseOwner): void;
    resume(owner: LifecyclePauseOwner): void;
}

export class InteractionLifecycle {
    private readonly pauseOwners = new Set<LifecyclePauseOwner>();
    private disposed = false;

    constructor (private readonly adapter: InteractionLifecycleAdapter) {}

    cancel (reason: InteractionCancelReason): void {
        if (this.disposed) return;
        this.adapter.cancelInteraction(reason);
    }

    setPaused (owner: LifecyclePauseOwner, paused: boolean): void {
        if (this.disposed) return;
        if (paused) {
            if (this.pauseOwners.has(owner)) return;
            this.pauseOwners.add(owner);
            this.adapter.pause(owner);
        } else {
            if (!this.pauseOwners.delete(owner)) return;
            this.adapter.resume(owner);
        }
    }

    get owners (): readonly LifecyclePauseOwner[] { return Object.freeze([...this.pauseOwners]); }

    dispose (): void {
        if (this.disposed) return;
        this.adapter.cancelInteraction('shutdown');
        for (const owner of this.pauseOwners) this.adapter.resume(owner);
        this.pauseOwners.clear();
        this.disposed = true;
    }
}
