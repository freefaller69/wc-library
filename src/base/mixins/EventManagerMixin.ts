/**
 * EventManagerMixin - Provides custom event dispatching and management
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

// Mixin interface that defines event management features
export interface EventManagerMixinInterface {
  dispatchCustomEvent(
    eventName: string,
    detail?: unknown,
    options?: CustomEventInit
  ): boolean;
}

/**
 * Event manager mixin that adds custom event dispatching capabilities
 */
export function EventManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<EventManagerMixinInterface> {
  return class EventManagerMixin extends Base implements EventManagerMixinInterface {
    protected config!: ComponentConfig;

    /**
     * Dispatches a custom event from the component
     */
    dispatchCustomEvent(
      eventName: string,
      detail?: unknown,
      options?: CustomEventInit
    ): boolean {
      const event = new CustomEvent(`ui-${this.config.tagName}-${eventName}`, {
        detail,
        bubbles: true,
        cancelable: true,
        composed: true, // Allow events to cross shadow DOM boundaries
        ...options,
      });

      return this.dispatchEvent(event);
    }
  };
}