/**
 * StyleHandlerMixin - Auto-detection and application of static component stylesheets
 *
 * This mixin provides automatic detection and application of static stylesheets defined
 * on component classes. It uses the bulletproof AdoptedStyleSheetsManager for modern
 * CSS delivery with fallback support.
 *
 * Usage:
 * ```typescript
 * export class MyComponent extends compose(
 *   CoreCustomElement,
 *   StyleHandlerMixin
 * ) {
 *   static stylesheet = createStyleSheet(myComponentCSS);
 *   // Stylesheet automatically applied when component connects!
 * }
 * ```
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import { AdoptedStyleSheetsManager } from '../../utilities/style-helpers.js';

// Base type that StyleHandlerMixin expects to work with
type StyleHandlerBase = {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
};

/**
 * Interface for components that support static stylesheets
 */
export interface StyleHandlerMixinInterface {
  /**
   * Gets the static stylesheet manager for this component instance
   */
  getStaticStylesheetManager(): AdoptedStyleSheetsManager;

  /**
   * Applies static stylesheets to the component's styling target
   * Called automatically during connectedCallback
   */
  applyStaticStylesheets(): void;

  /**
   * Removes static stylesheets from the component's styling target
   * Called automatically during disconnectedCallback
   */
  removeStaticStylesheets(): void;
}

/**
 * Interface for component classes that define static stylesheets
 */
export interface StyleHandlerClass {
  /**
   * Static stylesheet defined on the component class
   */
  stylesheet?: CSSStyleSheet;

  /**
   * Multiple static stylesheets defined on the component class
   */
  stylesheets?: CSSStyleSheet[];
}

/**
 * StyleHandlerMixin - Provides automatic static stylesheet management
 *
 * Features:
 * - Auto-detects static `stylesheet` or `stylesheets` properties on component classes
 * - Uses AdoptedStyleSheetsManager for modern CSS delivery with fallback
 * - Applies stylesheets automatically when component connects
 * - Removes stylesheets when component disconnects
 * - Supports both Shadow DOM and Light DOM scenarios
 * - Memory efficient with proper cleanup
 *
 * @param Base - The base class to extend
 * @returns Extended class with static stylesheet functionality
 */
export function StyleHandlerMixin<TBase extends Constructor<StyleHandlerBase>>(
  Base: TBase
): TBase & Constructor<StyleHandlerMixinInterface> {
  abstract class StyleHandlerMixin extends Base implements StyleHandlerMixinInterface {
    private staticStylesheetManager: AdoptedStyleSheetsManager | null = null;
    private hasAppliedStaticStyles = false;

    /**
     * Gets or creates the static stylesheet manager for this component
     * @returns AdoptedStyleSheetsManager instance
     */
    getStaticStylesheetManager(): AdoptedStyleSheetsManager {
      if (!this.staticStylesheetManager) {
        this.staticStylesheetManager = new AdoptedStyleSheetsManager();
      }
      return this.staticStylesheetManager;
    }

    /**
     * Detects and collects static stylesheets from the component class
     * @returns Array of detected static stylesheets
     * @private
     */
    private detectStaticStylesheets(): CSSStyleSheet[] {
      const constructor = this.constructor as StyleHandlerClass;
      const stylesheets: CSSStyleSheet[] = [];

      // Check for single static stylesheet
      if (constructor.stylesheet) {
        stylesheets.push(constructor.stylesheet);
      }

      // Check for multiple static stylesheets
      if (constructor.stylesheets && Array.isArray(constructor.stylesheets)) {
        stylesheets.push(...constructor.stylesheets);
      }

      return stylesheets;
    }

    /**
     * Determines the target for stylesheet application
     * @returns ShadowRoot, Document, or null if no suitable target
     * @private
     */
    private getStyleTarget(): ShadowRoot | Document | null {
      // Priority 1: Shadow DOM if available (check if shadowRoot property exists)
      if ('shadowRoot' in this) {
        const shadowRoot = (this as unknown as { shadowRoot?: ShadowRoot }).shadowRoot;
        if (shadowRoot) {
          return shadowRoot;
        }
      }

      // Priority 2: Document for light DOM scenarios
      return document;
    }

    /**
     * Applies static stylesheets to the component's styling target
     * This method is called automatically during connectedCallback
     */
    applyStaticStylesheets(): void {
      // Avoid duplicate application
      if (this.hasAppliedStaticStyles) {
        return;
      }

      try {
        const staticStylesheets = this.detectStaticStylesheets();

        // No static stylesheets to apply
        if (staticStylesheets.length === 0) {
          return;
        }

        const manager = this.getStaticStylesheetManager();
        const target = this.getStyleTarget();

        if (!target) {
          console.warn(
            `StyleHandlerMixin: No suitable style target found for component ${this.constructor.name}`
          );
          return;
        }

        // Add all detected stylesheets to manager
        manager.batchAddStylesheets(staticStylesheets);

        // Apply to target
        manager.applyTo(target);

        this.hasAppliedStaticStyles = true;
      } catch (error) {
        console.warn(
          `StyleHandlerMixin: Failed to apply static stylesheets for ${this.constructor.name}:`,
          error
        );
        // Graceful degradation - styling failure shouldn't break the component
      }
    }

    /**
     * Removes static stylesheets from the component's styling target
     * This method is called automatically during disconnectedCallback
     */
    removeStaticStylesheets(): void {
      if (!this.hasAppliedStaticStyles || !this.staticStylesheetManager) {
        return;
      }

      try {
        const target = this.getStyleTarget();
        if (target) {
          this.staticStylesheetManager.removeFrom(target);
        }

        this.hasAppliedStaticStyles = false;
      } catch (error) {
        console.warn(
          `StyleHandlerMixin: Failed to remove static stylesheets for ${this.constructor.name}`,
          error
        );
        // Continue cleanup even if removal fails
      }
    }

    /**
     * Enhanced connectedCallback that applies static stylesheets
     */
    connectedCallback(): void {
      // Call parent implementation first
      super.connectedCallback?.();

      // Apply static stylesheets after component is connected
      this.applyStaticStylesheets();
    }

    /**
     * Enhanced disconnectedCallback that removes static stylesheets
     */
    disconnectedCallback(): void {
      // Remove static stylesheets before component is disconnected
      this.removeStaticStylesheets();

      // Call parent implementation last
      super.disconnectedCallback?.();
    }
  }

  return StyleHandlerMixin as TBase & Constructor<StyleHandlerMixinInterface>;
}
