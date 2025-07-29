/**
 * AttributeManagerMixin - Provides attribute handling and parsing
 *
 * Focused on attribute management only. Does not handle CSS classes or styling.
 * Use with ClassManagerMixin if utility class generation is needed.
 */

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */

import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

// Type guards for cross-mixin communication interfaces
interface ClassManagerInterface {
  updateStaticAttributeCache(name: string, value: string | null): void;
  updateComponentClasses(): void;
}

interface UpdateManagerInterface {
  requestUpdate(): void;
}

// Mixin interface that defines attribute management features
export interface AttributeManagerMixinInterface {
  getTypedAttribute(name: string): string | null;
  getTypedAttribute(name: string, type: 'boolean'): boolean;
  getTypedAttribute(name: string, type: 'number'): number | null;
  setTypedAttribute(name: string, value: string | number | boolean | null): void;
  processStaticAttributes(): void;
}

/**
 * Helper function to generate observedAttributes from component config
 * Static attributes are NOT included - they are set once and not observed for changes
 * @param config - Component configuration object
 * @returns Array of attribute names that should be observed for changes
 */
export function getObservedAttributes(config: ComponentConfig): string[] {
  // Only observe dynamic attributes and explicitly requested ones
  const dynamicAttrs = config.dynamicAttributes || [];
  const explicitAttrs = config.observedAttributes || [];

  // Static attributes are intentionally excluded - they don't need change observation
  const observedAttributes = [...new Set([...dynamicAttrs, ...explicitAttrs])];

  return observedAttributes;
}

/**
 * Attribute manager mixin that adds typed attribute handling
 */
export function AttributeManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<AttributeManagerMixinInterface> {
  abstract class AttributeManagerMixin extends Base implements AttributeManagerMixinInterface {
    protected config!: ComponentConfig;

    /**
     * Process static attributes once during component initialization
     * This should be called from connectedCallback or constructor
     */
    processStaticAttributes(): void {
      const staticAttrs = this.config.staticAttributes || [];
      
      staticAttrs.forEach(attrName => {
        const value = this.getAttribute(attrName);
        if (value !== null) {
          // Process static attribute value for ClassManagerMixin
          this.handleStaticAttributeChange(attrName, value);
        }
      });
    }

    /**
     * Type guard to check if the component has ClassManager capabilities
     * @private
     */
    private hasClassManager(): this is this & ClassManagerInterface {
      return (
        'updateStaticAttributeCache' in this &&
        typeof (this as any).updateStaticAttributeCache === 'function' &&
        'updateComponentClasses' in this &&
        typeof (this as any).updateComponentClasses === 'function'
      );
    }

    /**
     * Type guard to check if the component has UpdateManager capabilities
     * @private
     */
    private hasUpdateManager(): this is this & UpdateManagerInterface {
      return 'requestUpdate' in this && typeof (this as any).requestUpdate === 'function';
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      // Call parent's attributeChangedCallback if it exists (more reliable approach)
      // Walk up the prototype chain to find the parent implementation
      this.callParentAttributeChangedCallback(name, oldValue, newValue);

      if (oldValue === newValue) return;

      // Since static attributes are not in observedAttributes, we only receive
      // dynamic attributes and explicit attributes here
      // Static attributes are set once and don't trigger this callback
      
      if (this.config.staticAttributes?.includes(name)) {
        // This should rarely happen since static attributes aren't observed,
        // but handle it gracefully if someone manually calls this method
        this.handleStaticAttributeChange(name, newValue);
      } else {
        // Handle dynamic and explicit attributes (the normal case)
        this.handleDynamicAttributeChange(name, oldValue, newValue);
      }
    }

    /**
     * Safely calls parent attributeChangedCallback implementation
     * More robust than direct prototype chain navigation
     * @private
     */
    private callParentAttributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ): void {
      // Look for parent implementation by walking up the prototype chain
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let currentProto: any = Object.getPrototypeOf(this);

      while (currentProto && currentProto !== Object.prototype) {
        // Skip our own implementation and look for parent
        if (
          currentProto.constructor !== AttributeManagerMixin &&
          typeof currentProto.attributeChangedCallback === 'function' &&
          currentProto.attributeChangedCallback !== this.attributeChangedCallback
        ) {
          try {
            currentProto.attributeChangedCallback.call(this, name, oldValue, newValue);
            break; // Found and called parent implementation
          } catch (error) {
            // Continue searching if call fails
            console.warn('Failed to call parent attributeChangedCallback:', error);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentProto = Object.getPrototypeOf(currentProto);
      }
    }

    /**
     * Handles static attribute changes (variants, etc.)
     * Uses type guard for safer cross-mixin communication
     */
    private handleStaticAttributeChange(name: string, value: string | null): void {
      // Notify ClassManagerMixin if present - now type-safe!
      if (this.hasClassManager()) {
        this.updateStaticAttributeCache(name, value);
        this.updateComponentClasses();
      }
    }

    /**
     * Handles dynamic attribute changes (state, etc.)
     * Uses type guard for safer cross-mixin communication
     */
    private handleDynamicAttributeChange(
      _name: string,
      _oldValue: string | null,
      _newValue: string | null
    ): void {
      // Notify UpdateManagerMixin if present - now type-safe!
      if (this.hasUpdateManager()) {
        this.requestUpdate();
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
