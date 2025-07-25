/**
 * AccessibilityMixin - Provides ARIA states, focus management, and keyboard handling
 */

import { setAriaState } from '../../utilities/accessibility.js';
import type { AccessibilityOptions } from '../../types/component.js';
import type { Constructor } from '../utilities/mixin-composer.js';

// Mixin interface that defines what accessibility features are added
export interface AccessibilityMixinInterface {
  setupAccessibility(): void;
  setAriaStates(states: Record<string, string | boolean | null>): void;
  getAccessibilityConfig(): AccessibilityOptions;
  handleFocus(event: FocusEvent): void;
  handleBlur(event: FocusEvent): void;
  handleKeydown(event: KeyboardEvent): void;
}

/**
 * Accessibility mixin that adds ARIA, focus, and keyboard handling
 */
export function AccessibilityMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<AccessibilityMixinInterface> {
  return class AccessibilityMixin extends Base implements AccessibilityMixinInterface {
    private _accessibilitySetup = false;

    connectedCallback() {
      super.connectedCallback?.();
      this.setupAccessibility();
    }

    /**
     * Sets up accessibility features
     */
    setupAccessibility(): void {
      if (this._accessibilitySetup) return;
      this._accessibilitySetup = true;

      const accessibilityConfig = this.getAccessibilityConfig();

      if (accessibilityConfig.role) {
        this.setAttribute('role', accessibilityConfig.role);
      }

      if (accessibilityConfig.ariaLabel) {
        this.setAttribute('aria-label', accessibilityConfig.ariaLabel);
      }

      if (accessibilityConfig.ariaDescribedBy) {
        this.setAttribute('aria-describedby', accessibilityConfig.ariaDescribedBy);
      }

      if (accessibilityConfig.tabIndex !== undefined) {
        this.setAttribute('tabindex', String(accessibilityConfig.tabIndex));
      }

      if (accessibilityConfig.focusable) {
        this.setupFocusManagement();
      }
    }

    /**
     * Sets up focus management for focusable components
     */
    private setupFocusManagement(): void {
      this.addEventListener('focus', this.handleFocus);
      this.addEventListener('blur', this.handleBlur);
      this.addEventListener('keydown', this.handleKeydown);
    }

    /**
     * Sets ARIA states on the component
     */
    setAriaStates(states: Record<string, string | boolean | null>): void {
      setAriaState(this, states);
    }

    /**
     * Handles focus events
     */
    handleFocus = (_event: FocusEvent): void => {
      this.classList.add('ui-focus-visible');
    };

    /**
     * Handles blur events
     */
    handleBlur = (_event: FocusEvent): void => {
      this.classList.remove('ui-focus-visible');
    };

    /**
     * Handles keydown events
     */
    handleKeydown = (_event: KeyboardEvent): void => {
      // Override in subclasses for specific keyboard handling
    };

    /**
     * Gets accessibility configuration - must be implemented by component
     */
    getAccessibilityConfig(): AccessibilityOptions {
      throw new Error('getAccessibilityConfig must be implemented by the component');
    }
  };
}