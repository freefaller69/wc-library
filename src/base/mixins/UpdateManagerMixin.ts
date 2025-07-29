/**
 * UpdateManagerMixin - Provides component update lifecycle management
 *
 * Handles update batching, scheduling, and coordination with other mixins.
 * Provides robust error handling and type-safe cross-mixin communication.
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { Constructor } from '../utilities/mixin-composer.js';

// Type guards for cross-mixin communication interfaces
interface ClassManagerInterface {
  updateComponentClasses(): void;
}

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
  abstract class UpdateManagerMixin extends Base implements UpdateManagerMixinInterface {
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
     * Type guard to check if the component has ClassManager capabilities
     * @private
     */
    private hasClassManager(): this is this & ClassManagerInterface {
      return (
        'updateComponentClasses' in this &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (this as any).updateComponentClasses === 'function'
      );
    }

    /**
     * Performs the actual update with error handling and recovery
     */
    private performUpdate(): void {
      // Update classes if ClassManagerMixin is present - with error handling
      if (this.hasClassManager()) {
        try {
          this.updateComponentClasses();
        } catch (error) {
          // Log error but continue with update process
          console.warn('UpdateManagerMixin: Error in updateComponentClasses:', error);
          // Component remains functional despite class update failure
        }
      }

      // Call render if it exists - with error handling
      if (this.render) {
        try {
          this.render();
        } catch (error) {
          // Log error but don't halt the component
          console.error('UpdateManagerMixin: Error in render method:', error);
          // Component update cycle completes even if render fails
        }
      }
    }

    /**
     * Render method - can be implemented by components
     */
    render?(): void;
  }

  return UpdateManagerMixin;
}
