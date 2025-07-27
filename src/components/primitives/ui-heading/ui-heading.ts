/**
 * UIHeading - Minimal Static Component
 *
 * Smart pass-through component that renders semantic heading elements.
 * Set level once - component handles the rest.
 *
 * Value over raw HTML:
 * - Design system typography via CSS custom properties
 * - Semantic heading element rendering (h1-h6)
 * - Strict accessibility validation
 * - Clean DOM without utility classes
 * - Easy theming by overriding CSS variables
 * - TypeScript support and consistent API
 * - Future extensibility hooks for mixins
 */

import { CoreCustomElement } from '../../../base/CoreCustomElement.js';
import './ui-heading.css';

export type UIHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export class UIHeading extends CoreCustomElement {
  static get observedAttributes(): string[] {
    return ['level'];
  }

  constructor() {
    super({
      tagName: 'ui-heading',
    });
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    // CSS custom properties handle styling automatically via attribute selectors
    // No manual class management needed
  }

  connectedCallback(): void {
    this.validateLevel(); // Fail fast before any rendering
    super.connectedCallback();
    this.render();
  }

  protected render(): void {
    const level = this.getLevel();
    const content = this.innerHTML;

    // Create proper semantic heading - browser handles accessibility
    const heading = document.createElement(`h${level}`);
    heading.innerHTML = content;

    // Replace content with semantic element
    this.innerHTML = '';
    this.appendChild(heading);
  }

  private validateLevel(): void {
    const { isValid, level } = this.parseLevelAttribute();

    if (!isValid) {
      throw new Error(
        `UIHeading: Invalid level "${level}". ` +
          `Level must be a number between 1 and 6 for proper accessibility. ` +
          `Current level would break screen reader navigation.`
      );
    }
  }

  private parseLevelAttribute(): { isValid: boolean; level: string | null; parsed: number } {
    const level = this.getAttribute('level');

    // Allow null (no attribute) or empty string (defaults to h2)
    if (level === null || level === '') {
      return { isValid: true, level, parsed: 2 };
    }

    const parsed = parseInt(level, 10);
    const isValid = !isNaN(parsed) && parsed >= 1 && parsed <= 6;

    return { isValid, level, parsed: isValid ? parsed : 2 };
  }

  // Extension point for mixins
  protected getLevel(): UIHeadingLevel {
    const { parsed } = this.parseLevelAttribute();
    return parsed as UIHeadingLevel;
  }

  // No getAccessibilityConfig needed - native <h1>-<h6> elements provide built-in accessibility
  // No manual class management needed - CSS custom properties + attribute selectors handle styling

  // Public API for programmatic access (rare use)
  get level(): UIHeadingLevel {
    return this.getLevel();
  }
}

// Register the component
if (!customElements.get('ui-heading')) {
  customElements.define('ui-heading', UIHeading);
}
