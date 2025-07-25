/**
 * AttributeManagerMixin - Provides attribute handling and CSS class generation
 */

import { ClassUtils } from '../../utilities/style-helpers.js';
import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

// Mixin interface that defines attribute management features
export interface AttributeManagerMixinInterface {
  getTypedAttribute(name: string): string | null;
  getTypedAttribute(name: string, type: 'boolean'): boolean;
  getTypedAttribute(name: string, type: 'number'): number | null;
  setTypedAttribute(name: string, value: string | number | boolean | null): void;
  updateComponentClasses(): void;
  getStateClasses(): Record<string, boolean>;
  requestUpdate(): void;
}

/**
 * Attribute manager mixin that adds typed attribute handling and CSS class management
 */
export function AttributeManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<AttributeManagerMixinInterface> {
  return class AttributeManagerMixin extends Base implements AttributeManagerMixinInterface {
    private staticAttributeCache: Map<string, string> = new Map();
    protected config!: ComponentConfig;

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      super.attributeChangedCallback?.(name, oldValue, newValue);

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
      if (value) {
        this.staticAttributeCache.set(name, value);
      } else {
        this.staticAttributeCache.delete(name);
      }
      this.updateComponentClasses();
    }

    /**
     * Handles dynamic attribute changes (state, etc.)
     */
    private handleDynamicAttributeChange(
      _name: string,
      _oldValue: string | null,
      _newValue: string | null
    ): void {
      // Override in subclasses for specific dynamic attribute handling
      this.requestUpdate();
    }

    /**
     * Updates component CSS classes based on attributes
     */
    updateComponentClasses(): void {
      const baseClass = this.config.tagName;
      const modifierClasses: Record<string, boolean> = {};

      // Add modifier classes based on static attributes
      this.staticAttributeCache.forEach((value, name) => {
        modifierClasses[`${baseClass}--${name}-${value}`] = true;
      });

      // Add state classes based on dynamic attributes
      const stateClasses = this.getStateClasses();
      Object.assign(modifierClasses, stateClasses);

      this.className = ClassUtils.conditional(`ui-reset ${baseClass}`, modifierClasses);
    }

    /**
     * Requests a component update (can be overridden for efficient updates)
     */
    requestUpdate(): void {
      // Check if connected using duck typing since we might not have access to isConnected
      const isConnected = 'isConnected' in this ? (this as any).isConnected : this.isConnected;
      
      if (isConnected) {
        this.updateComponentClasses();
        // Call render if it exists
        if ('render' in this && typeof (this as any).render === 'function') {
          (this as any).render();
        }
      }
    }

    /**
     * Gets a typed attribute value
     */
    getTypedAttribute(name: string): string | null;
    getTypedAttribute(name: string, type: 'boolean'): boolean;
    getTypedAttribute(name: string, type: 'number'): number | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    /**
     * Gets state classes - must be implemented by component
     */
    getStateClasses(): Record<string, boolean> {
      throw new Error('getStateClasses must be implemented by the component');
    }
  };
}