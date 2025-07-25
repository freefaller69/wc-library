/**
 * SlotManagerMixin - Provides slot handling and management
 */

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/explicit-function-return-type */

import type { Constructor } from '../utilities/mixin-composer.js';

// Mixin interface that defines slot management features
export interface SlotManagerMixinInterface {
  handleSlotChange(event: Event): void;
  setupSlotManagement(): void;
  shadowRoot: ShadowRoot;
}

/**
 * Slot manager mixin that adds slot change handling and utilities
 */
export function SlotManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<SlotManagerMixinInterface> {
  return class SlotManagerMixin extends Base implements SlotManagerMixinInterface {
    declare shadowRoot: ShadowRoot;
    private _slotSetup = false;

    connectedCallback() {
      super.connectedCallback?.();
      this.setupSlotManagement();
    }

    /**
     * Sets up slot change event listeners
     */
    setupSlotManagement(): void {
      if (this._slotSetup || !this.shadowRoot) return;
      this._slotSetup = true;

      // Listen for slot changes on all slots in shadow DOM
      const slots = this.shadowRoot.querySelectorAll('slot');
      slots.forEach((slot) => {
        slot.addEventListener('slotchange', this.handleSlotChange);
      });
    }

    /**
     * Handles slot change events
     */
    handleSlotChange = (event: Event): void => {
      const slot = event.target as HTMLSlotElement;
      const assignedNodes = slot.assignedNodes();

      // Override in subclasses for specific slot handling
      this.onSlotChange?.(slot, assignedNodes);
    };

    /**
     * Lifecycle method for slot changes (can be overridden)
     */
    onSlotChange?(slot: HTMLSlotElement, assignedNodes: Node[]): void;

    disconnectedCallback() {
      super.disconnectedCallback?.();

      // Clean up slot listeners
      if (this.shadowRoot) {
        const slots = this.shadowRoot.querySelectorAll('slot');
        slots.forEach((slot) => {
          slot.removeEventListener('slotchange', this.handleSlotChange);
        });
      }
      this._slotSetup = false;
    }
  };
}
