/**
 * StyleManagerMixin - Provides CSS and stylesheet management
 */

import type { Constructor } from '../utilities/mixin-composer.js';

// Mixin interface that defines style management features
export interface StyleManagerMixinInterface {
  addCSS(css: string): void;
  addStylesheet(stylesheet: CSSStyleSheet): void;
  shadowRoot: ShadowRoot;
}

/**
 * Style manager mixin that adds CSS and stylesheet management capabilities
 */
export function StyleManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<StyleManagerMixinInterface> {
  return class StyleManagerMixin extends Base implements StyleManagerMixinInterface {
    declare shadowRoot: ShadowRoot;

    /**
     * Adds CSS text to the shadow DOM
     */
    addCSS(css: string): void {
      if (!this.shadowRoot) {
        console.warn('StyleManagerMixin: Cannot add CSS without shadow DOM');
        return;
      }

      const style = document.createElement('style');
      style.textContent = css;
      this.shadowRoot.appendChild(style);
    }

    /**
     * Adds a constructed stylesheet to the shadow DOM
     */
    addStylesheet(stylesheet: CSSStyleSheet): void {
      if (!this.shadowRoot) {
        console.warn('StyleManagerMixin: Cannot add stylesheet without shadow DOM');
        return;
      }

      if ('adoptedStyleSheets' in this.shadowRoot) {
        // Use constructed stylesheets if supported
        this.shadowRoot.adoptedStyleSheets = [
          ...this.shadowRoot.adoptedStyleSheets,
          stylesheet,
        ];
      } else {
        // Fallback to style element
        const style = document.createElement('style');
        style.textContent = Array.from(stylesheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n');
        this.shadowRoot.appendChild(style);
      }
    }
  };
}