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
