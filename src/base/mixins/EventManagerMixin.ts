/**
 * EventManagerMixin - Provides custom event dispatching and listener management
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

// Compiled regex for optimal performance (avoid recompilation on each call)
const EVENT_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// Cache for validated event names to avoid repeated validation
const validatedEventNames = new Set<string>();

/**
 * Validates and normalizes an event name for optimal performance
 * Uses caching to avoid repeated validation of the same event names
 */
function validateAndNormalizeEventName(eventName: string): string {
  if (!eventName || typeof eventName !== 'string') {
    throw new Error(
      `Invalid event name: "${eventName}". Event names must contain only alphanumeric characters, hyphens, and underscores.`
    );
  }

  const trimmed = eventName.trim();

  // Check cache first for performance
  if (validatedEventNames.has(trimmed)) {
    return trimmed;
  }

  // Validate with regex
  if (!EVENT_NAME_REGEX.test(trimmed)) {
    throw new Error(
      `Invalid event name: "${eventName}". Event names must contain only alphanumeric characters, hyphens, and underscores.`
    );
  }

  // Cache the validated event name for future use
  validatedEventNames.add(trimmed);
  return trimmed;
}

// Mixin interface that defines event management features
export interface EventManagerMixinInterface {
  dispatchCustomEvent<T = unknown>(
    eventName: string,
    detail?: T,
    options?: CustomEventInit
  ): boolean;
  addComponentListener(
    eventName: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void;
  removeComponentListener(eventName: string, handler: EventListener): void;
  removeAllComponentListeners(): void;
}

/**
 * Event manager mixin that adds custom event dispatching and listener management capabilities
 */
export function EventManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<EventManagerMixinInterface> {
  abstract class EventManagerMixin extends Base implements EventManagerMixinInterface {
    protected config!: ComponentConfig;
    private _componentListeners = new Map<string, Set<EventListener>>();
    private _eventNameCache = new Map<string, string>(); // Cache for full event names
    private _eventPrefix: string | null = null; // Cache for event prefix

    /**
     * Gets the cached event prefix for this component
     * @private
     */
    private getEventPrefix(): string {
      if (this._eventPrefix === null) {
        if (!this.config?.tagName) {
          throw new Error('Component config with tagName is required for event operations');
        }
        this._eventPrefix = `ui-${this.config.tagName}-`;
      }
      return this._eventPrefix;
    }

    /**
     * Gets the full event name with caching for optimal performance
     * @private
     */
    private getFullEventName(eventName: string): string {
      // Check cache first
      if (this._eventNameCache.has(eventName)) {
        return this._eventNameCache.get(eventName)!;
      }

      // Validate and normalize the event name
      const normalizedName = validateAndNormalizeEventName(eventName);
      const fullEventName = this.getEventPrefix() + normalizedName;

      // Cache the result for future use
      this._eventNameCache.set(eventName, fullEventName);
      return fullEventName;
    }

    /**
     * Validates that a handler is a proper function
     * @private
     */
    private validateHandler(handler: EventListener): void {
      if (!handler || typeof handler !== 'function') {
        throw new Error('Event handler must be a function');
      }
    }

    /**
     * Cleans up empty listener sets to prevent memory leaks
     * @private
     */
    private cleanupListenerTracking(fullEventName: string): void {
      const listeners = this._componentListeners.get(fullEventName);
      if (listeners && listeners.size === 0) {
        this._componentListeners.delete(fullEventName);
      }
    }

    /**
     * Dispatches a custom event from the component
     *
     * @param eventName - The event name (will be prefixed with ui-{tagName}-)
     * @param detail - Optional event detail data
     * @param options - Optional CustomEventInit options
     * @returns boolean - false if event was cancelled, true otherwise
     *
     * @example
     * ```typescript
     * // Dispatch a click event with typed detail
     * this.dispatchCustomEvent<{timestamp: number}>('click', { timestamp: Date.now() });
     *
     * // Dispatch a custom event that doesn't bubble
     * this.dispatchCustomEvent('internal-state-change', { newState: 'active' }, { bubbles: false });
     * ```
     */
    dispatchCustomEvent<T = unknown>(
      eventName: string,
      detail?: T,
      options?: CustomEventInit
    ): boolean {
      const fullEventName = this.getFullEventName(eventName);

      try {
        // Check if component uses Shadow DOM to conditionally set composed
        const hasShadowRoot = !!this.shadowRoot;

        const event = new CustomEvent(fullEventName, {
          detail,
          bubbles: true,
          cancelable: true,
          composed: hasShadowRoot, // Only cross shadow boundaries if shadow DOM is used
          ...options,
        });

        return this.dispatchEvent(event);
      } catch (error) {
        throw new Error(
          `Failed to dispatch event "${fullEventName}": ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    /**
     * Adds an event listener for a component event
     *
     * @param eventName - The event name (will be prefixed with ui-{tagName}-)
     * @param handler - The event handler function
     * @param options - Optional AddEventListenerOptions
     *
     * @example
     * ```typescript
     * this.addComponentListener('click', this.handleClick.bind(this));
     * this.addComponentListener('focus', this.handleFocus.bind(this), { once: true });
     * ```
     */
    addComponentListener(
      eventName: string,
      handler: EventListener,
      options?: AddEventListenerOptions
    ): void {
      this.validateHandler(handler);
      const fullEventName = this.getFullEventName(eventName);

      // Track listeners for cleanup
      if (!this._componentListeners.has(fullEventName)) {
        this._componentListeners.set(fullEventName, new Set());
      }
      this._componentListeners.get(fullEventName)!.add(handler);

      this.addEventListener(fullEventName, handler, options);
    }

    /**
     * Removes a specific event listener for a component event
     *
     * @param eventName - The event name (will be prefixed with ui-{tagName}-)
     * @param handler - The event handler function to remove
     *
     * @example
     * ```typescript
     * this.removeComponentListener('click', this.handleClick);
     * ```
     */
    removeComponentListener(eventName: string, handler: EventListener): void {
      this.validateHandler(handler);

      // Check config exists - throw error for consistency with other methods
      if (!this.config?.tagName) {
        throw new Error('Component config with tagName is required for event operations');
      }

      const fullEventName = this.getFullEventName(eventName);

      // Remove from tracking
      const listeners = this._componentListeners.get(fullEventName);
      if (listeners) {
        listeners.delete(handler);
        this.cleanupListenerTracking(fullEventName);
      }

      this.removeEventListener(fullEventName, handler);
    }

    /**
     * Removes all component event listeners
     * Useful for cleanup when component is being destroyed
     *
     * @example
     * ```typescript
     * disconnectedCallback() {
     *   super.disconnectedCallback?.();
     *   this.removeAllComponentListeners();
     * }
     * ```
     */
    removeAllComponentListeners(): void {
      for (const [eventName, handlers] of this._componentListeners.entries()) {
        for (const handler of handlers) {
          this.removeEventListener(eventName, handler);
        }
      }

      // Clear all tracking data to prevent memory leaks
      this._componentListeners.clear();
      this._eventNameCache.clear();
      this._eventPrefix = null;
    }
  }

  return EventManagerMixin;
}
