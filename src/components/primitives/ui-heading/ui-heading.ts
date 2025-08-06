/**
 * UIHeading - The Next Generation
 *
 * Modern mixin-based heading component using build-from-scratch approach.
 * Demonstrates minimal modern component pattern: static, semantic, themeable.
 *
 * Architecture: CoreCustomElement + StyleHandlerMixin + AccessibilityMixin
 *
 * Learning Objectives:
 * - Mixin composition patterns and interactions
 * - Static component optimization strategies
 * - Modern CSS delivery with adoptedStyleSheets
 * - Enhanced accessibility beyond semantic HTML
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { CoreCustomElement } from '../../../base/CoreCustomElement.js';
import { compose } from '../../../base/utilities/mixin-composer.js';
import { StyleHandlerMixin } from '../../../base/mixins/StyleHandlerMixin.js';
import { AccessibilityMixin } from '../../../base/mixins/AccessibilityMixin.js';
import type { AccessibilityOptions } from '../../../types/component.js';
import { createStyleSheet } from '../../../utilities/style-helpers.js';
import uiHeadingCSS from './ui-heading.css?inline';

// Modern component types
export type UIHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Mixin composition - The Next Generation architecture
const UIHeadingBase = compose(CoreCustomElement, StyleHandlerMixin, AccessibilityMixin);

export class UIHeading extends UIHeadingBase {
  // Static stylesheet for StyleHandlerMixin auto-detection
  static stylesheet = createStyleSheet(uiHeadingCSS);

  private _rendered = false;

  constructor() {
    super({
      tagName: 'ui-heading',
    });
  }

  // Static component - no observed attributes needed for dynamic behavior
  static get observedAttributes(): string[] {
    return []; // Level set once during initialization, no observation needed
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Static component - no dynamic attribute handling
    // Level validation happens once during connection
  }

  connectedCallback(): void {
    this.validateLevel(); // Fail fast with helpful errors
    super.connectedCallback(); // Mixin initialization
    this.render(); // Semantic HTML rendering
  }

  // AccessibilityMixin interface implementation
  getAccessibilityConfig(): AccessibilityOptions {
    const level = this.getLevel();

    return {
      role: 'heading',
      ariaLevel: level.toString(),
      focusable: false, // Headings are not interactive
      // Let semantic <h1>-<h6> handle screen reader announcements
    };
  }

  protected render(): void {
    // Prevent multiple renders
    if (this._rendered) return;

    const level = this.getLevel();
    const content = (this as HTMLElement).innerHTML;

    // Create proper semantic heading - browser handles core accessibility
    const heading = document.createElement(`h${level}`);
    heading.innerHTML = content;

    // Replace content with semantic element
    (this as HTMLElement).innerHTML = '';
    (this as HTMLElement).appendChild(heading);

    this._rendered = true;
  }

  private validateLevel(): void {
    const { isValid, level } = this.parseLevelAttribute();

    if (!isValid) {
      if (level === null || level === '') {
        throw new Error(
          `UIHeading: Level attribute is required. ` +
            `Must specify level="1" through level="6" for proper accessibility. ` +
            `Missing level would break screen reader navigation.`
        );
      } else {
        throw new Error(
          `UIHeading: Invalid level "${level}". ` +
            `Level must be a number between 1 and 6 for proper accessibility. ` +
            `Current level would break screen reader navigation.`
        );
      }
    }
  }

  private parseLevelAttribute(): { isValid: boolean; level: string | null; parsed: number | null } {
    const level = (this as HTMLElement).getAttribute('level');

    // Level attribute is required - no defaults for accessibility
    if (level === null || level === '') {
      return { isValid: false, level, parsed: null };
    }

    const parsed = parseInt(level, 10);
    const isValid = !isNaN(parsed) && parsed >= 1 && parsed <= 6;

    return { isValid, level, parsed: isValid ? parsed : null };
  }

  // Extension point for mixin system
  protected getLevel(): UIHeadingLevel {
    const { parsed } = this.parseLevelAttribute();
    if (parsed === null) {
      throw new Error('UIHeading: Level attribute is required but not set or invalid');
    }
    return parsed as UIHeadingLevel;
  }

  // Public API for programmatic access (rare use)
  get level(): UIHeadingLevel {
    return this.getLevel();
  }
}

// Register the component - The Next Generation claims the throne!
if (!customElements.get('ui-heading')) {
  customElements.define('ui-heading', UIHeading as unknown as CustomElementConstructor);
}
