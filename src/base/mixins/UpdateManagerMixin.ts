/**
 * UpdateManagerMixin - Provides component update lifecycle management
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

import type { Constructor } from '../utilities/mixin-composer.js';

// Mixin interface that defines update management features
export interface UpdateManagerMixinInterface {
  requestUpdate(): void;
  render?(): void;
}

/**
 * Update manager mixin that adds update request system and render coordination
 */
export function UpdateManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<UpdateManagerMixinInterface> {
  return class UpdateManagerMixin extends Base implements UpdateManagerMixinInterface {
    private _updateRequested = false;
    private _updatePromise: Promise<void> | null = null;

    /**
     * Requests a component update with batching
     */
    requestUpdate(): void {
      if (this._updateRequested) return;

      this._updateRequested = true;

      if (!this._updatePromise) {
        this._updatePromise = this.scheduleUpdate();
      }
    }

    /**
     * Schedules an update on the next microtask
     */
    private async scheduleUpdate(): Promise<void> {
      await Promise.resolve(); // Wait for next microtask

      if (this.isConnected && this._updateRequested) {
        this.performUpdate();
      }

      this._updateRequested = false;
      this._updatePromise = null;
    }

    /**
     * Performs the actual update
     */
    private performUpdate(): void {
      // Update classes if the method exists
      if (
        'updateComponentClasses' in this &&
        typeof (this as any).updateComponentClasses === 'function'
      ) {
        (this as any).updateComponentClasses();
      }

      // Call render if it exists
      if (this.render) {
        this.render();
      }
    }

    /**
     * Render method - can be implemented by components
     */
    render?(): void;
  };
}
