/**
 * SlotManagerMixin - Provides slot management and content projection
 *
 * Handles slot discovery, content detection, and slot change events for Shadow DOM components.
 * Provides robust error handling and type-safe cross-mixin communication.
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type { Constructor } from '../utilities/mixin-composer.js';

// Base type that SlotManagerMixin expects to work with
type SlotManagerBase = HTMLElement & {
  shadowRoot: ShadowRoot | null;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
};

// Mixin interface that defines slot management features
export interface SlotManagerMixinInterface {
  getSlot(name?: string): HTMLSlotElement | null;
  getSlottedContent(slotName?: string): Element[];
  hasSlottedContent(slotName?: string): boolean;
  onSlotChange?(slotName: string, event: Event): void;
}

/**
 * Slot manager mixin that adds slot detection, content management, and event handling
 */
export function SlotManagerMixin<TBase extends Constructor<SlotManagerBase>>(
  Base: TBase
): TBase & Constructor<SlotManagerMixinInterface> {
  abstract class SlotManagerMixin extends Base implements SlotManagerMixinInterface {
    private _slotChangeListeners = new Map<HTMLSlotElement, EventListener>();

    /**
     * Gets a slot element by name
     * @param name - Slot name (undefined for default slot)
     * @returns HTMLSlotElement or null if not found
     */
    getSlot(name?: string): HTMLSlotElement | null {
      if (!this.shadowRoot) {
        console.warn('SlotManagerMixin: Slots require Shadow DOM. Consider using ShadowDOMMixin.');
        return null;
      }

      try {
        const selector = name ? `slot[name="${name}"]` : 'slot:not([name])';
        return this.shadowRoot.querySelector<HTMLSlotElement>(selector);
      } catch (error) {
        console.warn(`SlotManagerMixin: Error finding slot "${name || 'default'}":`, error);
        return null;
      }
    }

    /**
     * Gets all elements assigned to a slot
     * @param slotName - Slot name (undefined for default slot)
     * @returns Array of assigned elements
     */
    getSlottedContent(slotName?: string): Element[] {
      const slot = this.getSlot(slotName);
      if (!slot) {
        return [];
      }

      try {
        return slot.assignedElements();
      } catch (error) {
        console.warn(
          `SlotManagerMixin: Error getting slotted content for "${slotName || 'default'}":`,
          error
        );
        return [];
      }
    }

    /**
     * Checks if a slot has assigned content
     * @param slotName - Slot name (undefined for default slot)
     * @returns True if slot has content, false otherwise
     */
    hasSlottedContent(slotName?: string): boolean {
      return this.getSlottedContent(slotName).length > 0;
    }

    /**
     * Discovers all slots in the shadow DOM and sets up event listeners
     * Called during connectedCallback and after render() calls
     * @private
     */
    private discoverAndBindSlots(): void {
      if (!this.shadowRoot) {
        return;
      }

      try {
        // Clean up existing listeners first
        this.cleanupSlotListeners();

        // Find all slots in shadow DOM
        const slots = this.shadowRoot.querySelectorAll('slot');

        slots.forEach((slot) => {
          const listener = this.createSlotChangeListener(slot);
          slot.addEventListener('slotchange', listener);
          this._slotChangeListeners.set(slot, listener);
        });
      } catch (error) {
        console.warn('SlotManagerMixin: Error during slot discovery:', error);
      }
    }

    /**
     * Creates a slot change event listener for a specific slot
     * @private
     */
    private createSlotChangeListener(slot: HTMLSlotElement): EventListener {
      return (event: Event) => {
        try {
          const slotName = slot.getAttribute('name') || 'default';

          // Call the optional onSlotChange callback if implemented
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          const self = this as any;
          if (self.onSlotChange && typeof self.onSlotChange === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            self.onSlotChange(slotName, event);
          }
        } catch (error) {
          console.error('SlotManagerMixin: Error in slot change handler:', error);
        }
      };
    }

    /**
     * Cleans up all slot change event listeners
     * @private
     */
    private cleanupSlotListeners(): void {
      try {
        this._slotChangeListeners.forEach((listener, slot) => {
          slot.removeEventListener('slotchange', listener);
        });
        this._slotChangeListeners.clear();
      } catch (error) {
        console.warn('SlotManagerMixin: Error cleaning up slot listeners:', error);
      }
    }

    /**
     * Lifecycle hook - discover slots and set up listeners when connected
     */
    connectedCallback(): void {
      // Call parent's connectedCallback if it exists
      super.connectedCallback?.();

      // Discover slots after connection
      this.discoverAndBindSlots();
    }

    /**
     * Lifecycle hook - clean up slot listeners when disconnected
     */
    disconnectedCallback(): void {
      // Clean up slot listeners
      this.cleanupSlotListeners();

      // Call parent's disconnectedCallback if it exists
      super.disconnectedCallback?.();
    }

    /**
     * Optional render method - refresh slot bindings after render
     * This ensures slots are properly bound even if render() adds new slots
     */
    render?(): void;
  }

  // Enhance any existing render method to refresh slot bindings
  const OriginalSlotManagerMixin = SlotManagerMixin;

  return class extends OriginalSlotManagerMixin {
    render(): void {
      try {
        // Call the original render if it exists
        if (super.render) {
          super.render();
        }
      } catch (error) {
        console.error('SlotManagerMixin: Error in render method:', error);
      } finally {
        // Always refresh slot bindings after render (even if render failed)
        // This handles dynamic slot creation during render
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call
        (this as any).discoverAndBindSlots();
      }
    }
  } as TBase & Constructor<SlotManagerMixinInterface>;
}
