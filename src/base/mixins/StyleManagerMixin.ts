/**
 * StyleManagerMixin - Provides CSS and stylesheet management for components
 * Works with both Shadow DOM and Light DOM scenarios
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import { createStyleSheet } from '../../utilities/style-helpers.js';

// Constructor type for component classes with static stylesheets
type ComponentConstructor = new (...args: unknown[]) => HTMLElement;

// Base type that StyleManagerMixin expects to work with
type StyleManagerBase = HTMLElement & {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  constructor: {
    name: string;
    stylesheet?: CSSStyleSheet;
  };
};

// Mixin interface that defines style management features
export interface StyleManagerMixinInterface {
  addCSS(css: string): void;
  addStylesheet(stylesheet: CSSStyleSheet): void;
  batchAddStylesheets(stylesheets: CSSStyleSheet[]): void;
}

// Track created style elements to avoid duplicates
// WeakMap allows garbage collection when components are removed
const createdStyleElements = new WeakMap<ComponentConstructor, Set<string>>();

/**
 * Style Manager mixin that handles CSS and stylesheet management
 */
export function StyleManagerMixin<TBase extends Constructor<StyleManagerBase>>(
  Base: TBase
): TBase & Constructor<StyleManagerMixinInterface> {
  abstract class StyleManagerMixin extends Base implements StyleManagerMixinInterface {
    private dynamicStylesheets: CSSStyleSheet[] = [];
    private staticStylesheet: CSSStyleSheet | null = null;
    private pendingStylesheetUpdate = false;

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      // Initialize component-specific style tracking
      const constructorFunc = this.constructor as ComponentConstructor;
      if (!createdStyleElements.has(constructorFunc)) {
        createdStyleElements.set(constructorFunc, new Set<string>());
      }

      // Cache static stylesheet reference for performance
      this.staticStylesheet =
        this.constructor.stylesheet instanceof CSSStyleSheet ? this.constructor.stylesheet : null;
    }

    /**
     * Component lifecycle - called when element is connected to DOM
     * Sets up stylesheets when mixin is used
     */
    connectedCallback(): void {
      super.connectedCallback?.();
      this.setupStyles();
    }

    /**
     * Component lifecycle - called when element is removed from DOM
     * Cleans up component-specific style tracking
     */
    disconnectedCallback(): void {
      super.disconnectedCallback?.();
      this.cleanupStyles();
    }

    /**
     * Adds CSS as a dynamic stylesheet
     */
    addCSS(css: string): void {
      try {
        const dynamicSheet = createStyleSheet(css);
        this.addStylesheet(dynamicSheet);
      } catch (error) {
        console.warn(
          `StyleManagerMixin: Failed to create stylesheet for ${this.constructor.name}:`,
          error
        );
      }
    }

    /**
     * Adds a stylesheet to the component
     */
    addStylesheet(stylesheet: CSSStyleSheet): void {
      this.dynamicStylesheets.push(stylesheet);
      this.scheduleStylesheetUpdate();
    }

    /**
     * Adds multiple stylesheets in a single batch operation for better performance
     */
    batchAddStylesheets(stylesheets: CSSStyleSheet[]): void {
      this.dynamicStylesheets.push(...stylesheets);
      this.scheduleStylesheetUpdate();
    }

    /**
     * Sets up styles when component connects to DOM
     */
    private setupStyles(): void {
      // Auto-detect and adopt class stylesheet if it exists
      if (this.staticStylesheet) {
        this.scheduleStylesheetUpdate();
      }
    }

    /**
     * Cleans up component-specific style tracking
     */
    private cleanupStyles(): void {
      // Note: We don't remove the static style elements as they may be shared
      // across multiple component instances. The WeakMap will handle cleanup
      // when all instances of a component class are garbage collected.
    }

    /**
     * Schedules a stylesheet update, with debouncing to prevent excessive DOM updates
     */
    private scheduleStylesheetUpdate(): void {
      if (this.pendingStylesheetUpdate) {
        return;
      }

      this.pendingStylesheetUpdate = true;
      // Use microtask to batch multiple rapid updates
      // eslint-disable-next-line no-undef
      queueMicrotask(() => {
        this.pendingStylesheetUpdate = false;
        this.applyStylesheets();
      });
    }

    /**
     * Applies all stylesheets (class + dynamic) to appropriate target
     */
    private applyStylesheets(): void {
      const allStylesheets = this.getAllStylesheets();

      if (this.shadowRoot && 'adoptedStyleSheets' in this.shadowRoot) {
        // Use adoptedStyleSheets in Shadow DOM
        this.shadowRoot.adoptedStyleSheets = allStylesheets;
      } else {
        // Fallback to style elements
        this.applyStyleElementFallback(allStylesheets);
      }
    }

    /**
     * Gets all stylesheets (class static + dynamic)
     */
    private getAllStylesheets(): CSSStyleSheet[] {
      const stylesheets: CSSStyleSheet[] = [];

      // Add class stylesheet if it exists (using cached reference)
      if (this.staticStylesheet) {
        stylesheets.push(this.staticStylesheet);
      }

      // Add dynamic stylesheets
      stylesheets.push(...this.dynamicStylesheets);

      return stylesheets;
    }

    /**
     * Fallback method using style elements for browsers without adoptedStyleSheets
     */
    private applyStyleElementFallback(stylesheets: CSSStyleSheet[]): void {
      const target = this.shadowRoot || document.head;
      const constructorFunc = this.constructor as ComponentConstructor;
      const componentStyleElements = createdStyleElements.get(constructorFunc)!;

      stylesheets.forEach((stylesheet, index) => {
        try {
          // More robust detection of static vs dynamic stylesheets
          const isStaticStylesheet = stylesheet === this.staticStylesheet;
          const styleId = isStaticStylesheet
            ? `style-${this.constructor.name}-static`
            : `style-${this.constructor.name}-dynamic-${Date.now()}-${index}`;

          // Check if static style element already exists
          if (isStaticStylesheet && componentStyleElements.has(styleId)) {
            return;
          }

          // Create style element
          const styleElement = document.createElement('style');
          styleElement.id = styleId;
          styleElement.setAttribute('data-style-manager', this.constructor.name);

          // Get CSS text from stylesheet with enhanced error handling
          const cssText = this.extractCSSText(stylesheet);
          if (!cssText && stylesheet !== this.staticStylesheet) {
            // Check if the stylesheet has any rules at all (for better test compatibility)
            const hasRules = stylesheet.cssRules && stylesheet.cssRules.length > 0;
            if (!hasRules) {
              console.warn(
                `StyleManagerMixin: Empty CSS content for ${this.constructor.name}, skipping style element creation`
              );
              return;
            }
          }

          styleElement.textContent = cssText;

          // Append to target
          target.appendChild(styleElement);

          // Track style element for cleanup (static stylesheets only)
          if (isStaticStylesheet) {
            componentStyleElements.add(styleId);
          }
        } catch (error) {
          console.warn(
            `StyleManagerMixin: Failed to apply stylesheet fallback for ${this.constructor.name}:`,
            error
          );
        }
      });
    }

    /**
     * Extracts CSS text from a CSSStyleSheet with enhanced error handling
     * @param stylesheet - The CSSStyleSheet to extract CSS from
     * @returns CSS text string or empty string if extraction fails
     */
    private extractCSSText(stylesheet: CSSStyleSheet): string {
      try {
        // Use spread operator for better performance and modern syntax
        return [...stylesheet.cssRules].map((rule) => rule.cssText).join('\n');
      } catch (error) {
        // Enhanced error categorization
        if (error instanceof DOMException) {
          if (error.name === 'SecurityError') {
            console.warn('StyleManagerMixin: CORS security error accessing stylesheet rules');
          } else if (error.name === 'InvalidAccessError') {
            console.warn('StyleManagerMixin: Invalid access to stylesheet rules');
          } else {
            console.warn(
              'StyleManagerMixin: DOM exception accessing stylesheet rules:',
              error.message
            );
          }
        } else {
          console.warn('StyleManagerMixin: Unexpected error accessing stylesheet rules:', error);
        }
        return '';
      }
    }
  }

  return StyleManagerMixin;
}
