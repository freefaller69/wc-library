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
    // Runtime safety guards for recursion prevention
    private _attributeCallbackDepth = 0;
    private readonly MAX_CALLBACK_DEPTH = 5;
    private readonly MAX_PROTOTYPE_SEARCH_DEPTH = 10;

    // Access config from CoreCustomElement - no redeclaration needed
    protected get config(): ComponentConfig {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return (this as any).config;
    }

    /**
     * Process static attributes once during component initialization
     * This should be called from connectedCallback or constructor
     */
    processStaticAttributes(): void {
      const staticAttrs = this.config.staticAttributes || [];

      staticAttrs.forEach((attrName) => {
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
      // Prevent infinite recursion with depth tracking
      if (this._attributeCallbackDepth >= this.MAX_CALLBACK_DEPTH) {
        console.error(
          `AttributeManagerMixin: Maximum callback depth (${this.MAX_CALLBACK_DEPTH}) exceeded for attribute "${name}". ` +
            'This indicates a potential infinite recursion in the attribute callback chain. ' +
            'Stack overflow prevented.'
        );
        return;
      }

      this._attributeCallbackDepth++;

      try {
        // Call parent's attributeChangedCallback if it exists (with enhanced safety)
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
      } catch (error) {
        console.error(
          `AttributeManagerMixin: Error in attributeChangedCallback for "${name}":`,
          error
        );
        // Continue execution to prevent breaking the component entirely
      } finally {
        // Always decrement depth counter, even if an error occurred
        this._attributeCallbackDepth--;
      }
    }

    /**
     * Safely calls parent attributeChangedCallback implementation
     * Enhanced with comprehensive safety guards against infinite recursion
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
      let searchDepth = 0;
      const visitedPrototypes = new Set<any>();

      while (
        currentProto &&
        currentProto !== Object.prototype &&
        searchDepth < this.MAX_PROTOTYPE_SEARCH_DEPTH
      ) {
        // Prevent circular reference loops
        if (visitedPrototypes.has(currentProto)) {
          console.warn(
            `AttributeManagerMixin: Circular prototype reference detected while searching for parent attributeChangedCallback for attribute "${name}". ` +
              'Stopping search to prevent infinite loop.'
          );
          break;
        }
        visitedPrototypes.add(currentProto);

        // Skip our own implementation and look for parent
        if (
          currentProto.constructor !== AttributeManagerMixin &&
          typeof currentProto.attributeChangedCallback === 'function' &&
          currentProto.attributeChangedCallback !== this.attributeChangedCallback
        ) {
          try {
            // Additional safety check: only warn for exact method references that could cause infinite loops
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const methodString = currentProto.attributeChangedCallback.toString();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const hasCallParentRef = methodString.includes('callParentAttributeChangedCallback');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const isAttributeManagerMethod = methodString.includes('AttributeManagerMixin');

            // Only skip if it's clearly a recursive AttributeManagerMixin method
            if (hasCallParentRef && isAttributeManagerMethod) {
              console.warn(
                `AttributeManagerMixin: Skipping recursive AttributeManagerMixin method in prototype chain for attribute "${name}".`
              );
              // Continue searching rather than calling potentially recursive method
            } else {
              currentProto.attributeChangedCallback.call(this, name, oldValue, newValue);
              break; // Found and called parent implementation
            }
          } catch (error) {
            // Continue searching if call fails
            console.warn(
              `Failed to call parent attributeChangedCallback for attribute "${name}":`,
              error
            );
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentProto = Object.getPrototypeOf(currentProto);
        searchDepth++;
      }

      // Only warn if we hit search depth limit AND there were potential circular references
      if (searchDepth >= this.MAX_PROTOTYPE_SEARCH_DEPTH && visitedPrototypes.size < searchDepth) {
        console.warn(
          `AttributeManagerMixin: Maximum prototype search depth (${this.MAX_PROTOTYPE_SEARCH_DEPTH}) reached for attribute "${name}" with potential circular references. ` +
            'Some parent attributeChangedCallback implementations may have been skipped.'
        );
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
          // For boolean attributes, presence = true, absence = false
          // Empty string means the attribute is present (like <input disabled>)
          return value !== 'false';
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
