/**
 * Style utilities for web components
 */

let adoptedStyleSheets: CSSStyleSheet[] = [];

/**
 * Creates a CSSStyleSheet from CSS text
 */
export function createStyleSheet(cssText: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  return sheet;
}

/**
 * Loads CSS file and returns as CSSStyleSheet
 */
export async function loadStyleSheet(url: string): Promise<CSSStyleSheet> {
  const response = await fetch(url);
  const cssText = await response.text();
  return createStyleSheet(cssText);
}

/**
 * Adopts stylesheets globally for all components
 */
export function adoptGlobalStyleSheets(sheets: CSSStyleSheet[]): void {
  adoptedStyleSheets = [...adoptedStyleSheets, ...sheets];
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sheets];
}

/**
 * Gets the current global adopted stylesheets
 */
export function getGlobalStyleSheets(): CSSStyleSheet[] {
  return adoptedStyleSheets;
}

/**
 * Utility class for managing component styles
 */
export class StyleManager {
  private sheets: CSSStyleSheet[] = [];

  /**
   * Adds a stylesheet to the component
   */
  public addSheet(sheet: CSSStyleSheet): void {
    this.sheets.push(sheet);
  }

  /**
   * Adds CSS text as a stylesheet
   */
  public addCSS(cssText: string): void {
    const sheet = createStyleSheet(cssText);
    this.addSheet(sheet);
  }

  /**
   * Gets all stylesheets including global ones
   */
  public getAllSheets(): CSSStyleSheet[] {
    return [...getGlobalStyleSheets(), ...this.sheets];
  }

  /**
   * Applies stylesheets to a shadow root
   */
  public applyTo(shadowRoot: ShadowRoot): void {
    shadowRoot.adoptedStyleSheets = this.getAllSheets();
  }
}

/**
 * CSS class name utilities
 */
export const ClassUtils = {
  /**
   * Combines class names, filtering out falsy values
   */
  combine(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
  },

  /**
   * Conditionally applies class names based on state
   */
  conditional(baseClasses: string, conditionalClasses: Record<string, boolean>): string {
    const additional = Object.entries(conditionalClasses)
      .filter(([, condition]) => condition)
      .map(([className]) => className);

    return this.combine(baseClasses, ...additional);
  },

  /**
   * Creates BEM-style class names
   */
  bem(block: string, element?: string, modifier?: string): string {
    let className = block;

    if (element) {
      className += `__${element}`;
    }

    if (modifier) {
      className += `--${modifier}`;
    }

    return className;
  },
};

/**
 * Modern AdoptedStyleSheets Manager
 *
 * Provides a clean API for managing stylesheets with automatic adoptedStyleSheets support
 * and graceful fallback to <style> elements for older browsers.
 */
export class AdoptedStyleSheetsManager {
  private stylesheets: CSSStyleSheet[] = [];
  private stylesheetSet = new Set<CSSStyleSheet>();
  private fallbackStyleElements = new Map<CSSStyleSheet, HTMLStyleElement>();

  /**
   * Adds a stylesheet to be managed
   * @param stylesheet - The CSSStyleSheet to add
   */
  addStylesheet(stylesheet: CSSStyleSheet): void {
    if (!this.stylesheetSet.has(stylesheet)) {
      this.stylesheets.push(stylesheet);
      this.stylesheetSet.add(stylesheet);
    }
  }

  /**
   * Adds multiple stylesheets in a batch operation
   * @param stylesheets - Array of CSSStyleSheet objects to add
   */
  batchAddStylesheets(stylesheets: CSSStyleSheet[]): void {
    stylesheets.forEach((sheet) => {
      if (!this.stylesheetSet.has(sheet)) {
        this.stylesheets.push(sheet);
        this.stylesheetSet.add(sheet);
      }
    });
  }

  /**
   * Creates and adds a stylesheet from CSS text
   * @param cssText - CSS string to convert to stylesheet
   * @returns The created CSSStyleSheet
   */
  addCSS(cssText: string): CSSStyleSheet {
    const stylesheet = createStyleSheet(cssText);
    this.addStylesheet(stylesheet);
    return stylesheet;
  }

  /**
   * Removes a stylesheet from management
   * @param stylesheet - The CSSStyleSheet to remove
   */
  removeStylesheet(stylesheet: CSSStyleSheet): void {
    if (this.stylesheetSet.has(stylesheet)) {
      const index = this.stylesheets.indexOf(stylesheet);
      this.stylesheets.splice(index, 1);
      this.stylesheetSet.delete(stylesheet);

      // Clean up fallback style element if it exists
      const fallbackElement = this.fallbackStyleElements.get(stylesheet);
      if (fallbackElement && fallbackElement.parentNode) {
        fallbackElement.parentNode.removeChild(fallbackElement);
        this.fallbackStyleElements.delete(stylesheet);
      }
    }
  }

  /**
   * Gets all managed stylesheets
   * @returns Array of managed CSSStyleSheet objects
   */
  getStylesheets(): CSSStyleSheet[] {
    return [...this.stylesheets];
  }

  /**
   * Applies all managed stylesheets to a target (ShadowRoot or Document)
   * Uses adoptedStyleSheets API when available, falls back to <style> elements
   * @param target - ShadowRoot or Document to apply styles to
   */
  applyTo(target: ShadowRoot | Document): void {
    try {
      if (this.supportsAdoptedStyleSheets(target)) {
        // Use modern adoptedStyleSheets API
        target.adoptedStyleSheets = [...target.adoptedStyleSheets, ...this.stylesheets];
      } else {
        // Fallback to style elements
        this.applyFallbackStyles(target);
      }
    } catch (error) {
      console.warn('AdoptedStyleSheetsManager: Failed to apply stylesheets:', error);
      // Try fallback approach with error boundary
      try {
        this.applyFallbackStyles(target);
      } catch (fallbackError) {
        console.error('AdoptedStyleSheetsManager: Fallback styling also failed:', fallbackError);
        // At this point we've exhausted all styling options
      }
    }
  }

  /**
   * Removes all managed stylesheets from a target
   * @param target - ShadowRoot or Document to remove styles from
   */
  removeFrom(target: ShadowRoot | Document): void {
    try {
      if (this.supportsAdoptedStyleSheets(target)) {
        // Remove from adoptedStyleSheets
        target.adoptedStyleSheets = target.adoptedStyleSheets.filter(
          (sheet) => !this.stylesheetSet.has(sheet)
        );
      } else {
        // Remove fallback style elements
        this.removeFallbackStyles(target);
      }
    } catch (error) {
      console.warn('AdoptedStyleSheetsManager: Failed to remove stylesheets:', error);
    }
  }

  /**
   * Clears all managed stylesheets and cleans up fallback elements
   */
  clear(): void {
    // Clean up all fallback style elements
    this.fallbackStyleElements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });

    this.stylesheets.length = 0;
    this.stylesheetSet.clear();
    this.fallbackStyleElements.clear();
  }

  /**
   * Checks if a target supports the adoptedStyleSheets API
   * @private
   */
  private supportsAdoptedStyleSheets(
    target: ShadowRoot | Document
  ): target is
    | (ShadowRoot & { adoptedStyleSheets: CSSStyleSheet[] })
    | (Document & { adoptedStyleSheets: CSSStyleSheet[] }) {
    return 'adoptedStyleSheets' in target && Array.isArray(target.adoptedStyleSheets);
  }

  /**
   * Applies styles using fallback <style> elements
   * @private
   */
  private applyFallbackStyles(target: ShadowRoot | Document): void {
    const targetElement = target === document ? document.head : (target as ShadowRoot);

    this.stylesheets.forEach((stylesheet, index) => {
      // Skip if fallback element already exists for this stylesheet
      if (this.fallbackStyleElements.has(stylesheet)) {
        return;
      }

      try {
        const styleElement = document.createElement('style');
        styleElement.setAttribute('data-adopted-stylesheets-manager', 'true');
        styleElement.setAttribute('data-stylesheet-index', String(index));

        // Extract CSS text from stylesheet
        const cssText = this.extractCSSText(stylesheet);
        styleElement.textContent = cssText;

        targetElement.appendChild(styleElement);
        this.fallbackStyleElements.set(stylesheet, styleElement);
      } catch (error) {
        console.warn('AdoptedStyleSheetsManager: Failed to create fallback style element:', error);
      }
    });
  }

  /**
   * Removes fallback style elements from a target
   * @private
   */
  private removeFallbackStyles(target: ShadowRoot | Document): void {
    this.fallbackStyleElements.forEach((element, stylesheet) => {
      if (
        element.parentNode &&
        (element.parentNode === target || element.parentNode === document.head)
      ) {
        element.parentNode.removeChild(element);
        this.fallbackStyleElements.delete(stylesheet);
      }
    });
  }

  /**
   * Extracts CSS text from a CSSStyleSheet with enhanced error handling
   * @private
   */
  private extractCSSText(stylesheet: CSSStyleSheet): string {
    try {
      return Array.from(stylesheet.cssRules)
        .map((rule) => rule.cssText)
        .join('\n');
    } catch (error) {
      // Enhanced error categorization for better debugging
      if (error instanceof DOMException) {
        if (error.name === 'SecurityError') {
          console.warn('AdoptedStyleSheetsManager: CORS security error accessing stylesheet rules');
        } else if (error.name === 'InvalidAccessError') {
          console.warn('AdoptedStyleSheetsManager: Invalid access to stylesheet rules');
        } else {
          console.warn(
            'AdoptedStyleSheetsManager: DOM exception accessing stylesheet rules:',
            error.message
          );
        }
      } else {
        console.warn(
          'AdoptedStyleSheetsManager: Unexpected error accessing stylesheet rules:',
          error
        );
      }
      return '';
    }
  }
}

/**
 * CSS custom property utilities
 */
export const CSSProps = {
  /**
   * Sets CSS custom properties on an element
   */
  set(element: HTMLElement, properties: Record<string, string | number>): void {
    Object.entries(properties).forEach(([key, value]) => {
      const propName = key.startsWith('--') ? key : `--${key}`;
      element.style.setProperty(propName, String(value));
    });
  },

  /**
   * Gets a CSS custom property value
   */
  get(element: HTMLElement, property: string): string {
    const propName = property.startsWith('--') ? property : `--${property}`;
    return getComputedStyle(element).getPropertyValue(propName).trim();
  },

  /**
   * Removes CSS custom properties from an element
   */
  remove(element: HTMLElement, properties: string[]): void {
    properties.forEach((property) => {
      const propName = property.startsWith('--') ? property : `--${property}`;
      element.style.removeProperty(propName);
    });
  },
};
