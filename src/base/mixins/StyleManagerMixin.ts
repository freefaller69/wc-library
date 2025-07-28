/**
 * StyleManagerMixin - Provides CSS and stylesheet management for components
 * Works with both Shadow DOM and Light DOM scenarios
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import { createStyleSheet } from '../../utilities/style-helpers.js';

// Base type that StyleManagerMixin expects to work with
type StyleManagerBase = HTMLElement & {
  connectedCallback?(): void;
  constructor: {
    name: string;
    stylesheet?: CSSStyleSheet;
  };
};

// Mixin interface that defines style management features
export interface StyleManagerMixinInterface {
  addCSS(css: string): void;
  addStylesheet(stylesheet: CSSStyleSheet): void;
}

// Track created style elements to avoid duplicates
const createdStyleElements = new Set<string>();

/**
 * Style Manager mixin that handles CSS and stylesheet management
 */
export function StyleManagerMixin<TBase extends Constructor<StyleManagerBase>>(
  Base: TBase
): TBase & Constructor<StyleManagerMixinInterface> {
  abstract class StyleManagerMixin extends Base implements StyleManagerMixinInterface {
    private dynamicStylesheets: CSSStyleSheet[] = [];

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
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
      this.applyStylesheets();
    }

    /**
     * Sets up styles when component connects to DOM
     */
    private setupStyles(): void {
      // Auto-detect and adopt class stylesheet if it exists
      if (this.constructor.stylesheet instanceof CSSStyleSheet) {
        this.applyStylesheets();
      }
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

      // Add class stylesheet if it exists
      if (this.constructor.stylesheet instanceof CSSStyleSheet) {
        stylesheets.push(this.constructor.stylesheet);
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

      stylesheets.forEach((stylesheet, index) => {
        try {
          // Create unique ID for style element
          const isClassStylesheet = index === 0 && this.constructor.stylesheet;
          const styleId = isClassStylesheet
            ? `style-${this.constructor.name}-static`
            : `style-${this.constructor.name}-dynamic-${index}`;

          // Check if style element already exists (for class stylesheets)
          if (isClassStylesheet && createdStyleElements.has(styleId)) {
            return;
          }

          // Create style element
          const styleElement = document.createElement('style');
          styleElement.id = styleId;

          // Get CSS text from stylesheet
          const cssText = this.extractCSSText(stylesheet);
          styleElement.textContent = cssText;

          // Append to target
          target.appendChild(styleElement);

          // Track class stylesheet elements to avoid duplicates
          if (isClassStylesheet) {
            createdStyleElements.add(styleId);
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
     * Extracts CSS text from a CSSStyleSheet
     * Note: This is a simplified approach - in production, you might need
     * more sophisticated CSS text extraction
     */
    private extractCSSText(stylesheet: CSSStyleSheet): string {
      try {
        return Array.from(stylesheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
      } catch (error) {
        // If we can't access cssRules (CORS issues, etc.), return empty string
        console.warn('StyleManagerMixin: Cannot access stylesheet rules:', error);
        return '';
      }
    }
  }

  return StyleManagerMixin;
}
