/**
 * AttributeManagerMixin - Provides attribute handling and parsing
 *
 * Focused on attribute management only. Does not handle CSS classes or styling.
 * Use with ClassManagerMixin if utility class generation is needed.
 */

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */

import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

// Mixin interface that defines attribute management features
export interface AttributeManagerMixinInterface {
  getTypedAttribute(name: string): string | null;
  getTypedAttribute(name: string, type: 'boolean'): boolean;
  getTypedAttribute(name: string, type: 'number'): number | null;
  setTypedAttribute(name: string, value: string | number | boolean | null): void;
}

/**
 * Attribute manager mixin that adds typed attribute handling
 */
export function AttributeManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<AttributeManagerMixinInterface> {
  abstract class AttributeManagerMixin extends Base implements AttributeManagerMixinInterface {
    protected config!: ComponentConfig;

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      // Call parent's attributeChangedCallback if it exists (for components that extend CoreCustomElement)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parentProto = Object.getPrototypeOf(Object.getPrototypeOf(this));
      if (parentProto && typeof parentProto.attributeChangedCallback === 'function') {
        parentProto.attributeChangedCallback.call(this, name, oldValue, newValue);
      }

      if (oldValue === newValue) return;

      // Handle static vs dynamic attributes differently
      if (this.config.staticAttributes?.includes(name)) {
        this.handleStaticAttributeChange(name, newValue);
      } else {
        this.handleDynamicAttributeChange(name, oldValue, newValue);
      }
    }

    /**
     * Handles static attribute changes (variants, etc.)
     */
    private handleStaticAttributeChange(name: string, value: string | null): void {
      // Notify ClassManagerMixin if present
      if (
        'updateStaticAttributeCache' in this &&
        typeof (this as any).updateStaticAttributeCache === 'function'
      ) {
        (this as any).updateStaticAttributeCache(name, value);
        if (
          'updateComponentClasses' in this &&
          typeof (this as any).updateComponentClasses === 'function'
        ) {
          (this as any).updateComponentClasses();
        }
      }
    }

    /**
     * Handles dynamic attribute changes (state, etc.)
     */
    private handleDynamicAttributeChange(
      _name: string,
      _oldValue: string | null,
      _newValue: string | null
    ): void {
      // Notify UpdateManagerMixin if present
      if ('requestUpdate' in this && typeof (this as any).requestUpdate === 'function') {
        (this as any).requestUpdate();
      }
    }

    /**
     * Gets a typed attribute value
     */
    getTypedAttribute(name: string): string | null;
    getTypedAttribute(name: string, type: 'boolean'): boolean;
    getTypedAttribute(name: string, type: 'number'): number | null;

    getTypedAttribute(name: string, type?: 'string' | 'boolean' | 'number'): any {
      const value = this.getAttribute(name);

      if (value === null) {
        return type === 'boolean' ? false : null;
      }

      switch (type) {
        case 'boolean':
          return value !== 'false' && value !== '';
        case 'number': {
          const num = Number(value);
          return isNaN(num) ? null : num;
        }
        default:
          return value;
      }
    }

    /**
     * Sets a typed attribute value
     */
    setTypedAttribute(name: string, value: string | number | boolean | null): void {
      if (value === null || value === undefined) {
        this.removeAttribute(name);
      } else if (typeof value === 'boolean') {
        if (value) {
          this.setAttribute(name, '');
        } else {
          this.removeAttribute(name);
        }
      } else {
        this.setAttribute(name, String(value));
      }
    }
  }

  return AttributeManagerMixin;
}
