/**
 * AccessibilityMixin - Provides dynamic ARIA states, relationships, and screen reader communication
 *
 * Focuses on dynamic accessibility features that complement semantic HTML.
 * Handles ARIA state management, complex relationships, and live regions.
 */

import { setAriaState, announceToScreenReader, generateId } from '../../utilities/accessibility.js';
import type { AccessibilityOptions } from '../../types/component.js';
import type { Constructor } from '../utilities/mixin-composer.js';

// Base type that AccessibilityMixin expects to work with
type AccessibilityBase = HTMLElement & {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
};

// Mixin interface that defines dynamic accessibility features
export interface AccessibilityMixinInterface {
  // Legacy methods (maintained for backward compatibility)
  setupAccessibility(): void;
  setAriaStates(states: Record<string, string | boolean | null>): void;
  getAccessibilityConfig(): AccessibilityOptions;
  handleFocus(event: FocusEvent): void;
  handleBlur(event: FocusEvent): void;
  handleKeydown(event: KeyboardEvent): void;

  // New dynamic ARIA state management
  setAriaExpanded(expanded: boolean): void;
  setAriaHidden(hidden: boolean): void;
  setAriaDisabled(disabled: boolean): void;
  setAriaBusy(busy: boolean): void;
  setAriaInvalid(invalid: boolean): void;

  // ARIA relationships with lazy validation
  setAriaDescribedBy(elementIds: string[]): void;
  setAriaLabelledBy(elementIds: string[]): void;
  setAriaControls(elementIds: string[]): void;

  // Screen reader communication
  announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void;

  // Live region management
  createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement;
  updateLiveRegion(message: string): void;
}

/**
 * Accessibility mixin that adds dynamic ARIA management and screen reader communication
 *
 * This mixin focuses on dynamic accessibility features that complement semantic HTML:
 * - Dynamic ARIA states that change during component lifecycle
 * - Complex ARIA relationships between elements with lazy validation
 * - Screen reader communication via live regions
 * - Integration hooks for other mixins
 */
export function AccessibilityMixin<TBase extends Constructor<AccessibilityBase>>(
  Base: TBase
): TBase & Constructor<AccessibilityMixinInterface> {
  abstract class AccessibilityMixin extends Base implements AccessibilityMixinInterface {
    private _accessibilitySetup = false;
    private _liveRegions = new Map<'polite' | 'assertive', HTMLElement>();
    private _pendingRelationships = new Map<string, string[]>();

    connectedCallback(): void {
      // Call parent's connectedCallback if it exists
      super.connectedCallback?.();
      this.setupAccessibility();
      this.validatePendingRelationships();
    }

    disconnectedCallback(): void {
      // Clean up live regions
      this.cleanupLiveRegions();

      // Call parent's disconnectedCallback if it exists
      super.disconnectedCallback?.();
    }

    /**
     * Sets up accessibility features (legacy method for backward compatibility)
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
     * Sets up focus management for focusable components (legacy method)
     */
    private setupFocusManagement(): void {
      this.addEventListener('focus', this.handleFocus);
      this.addEventListener('blur', this.handleBlur);
      this.addEventListener('keydown', this.handleKeydown);
    }

    /**
     * Sets ARIA states on the component (legacy method)
     */
    setAriaStates(states: Record<string, string | boolean | null>): void {
      setAriaState(this, states);
    }

    /**
     * Handles focus events (legacy method)
     */
    handleFocus = (_event: FocusEvent): void => {
      // Focus styling is handled via :focus-visible CSS pseudo-selector
      // Components can override this method for custom focus behavior
    };

    /**
     * Handles blur events (legacy method)
     */
    handleBlur = (_event: FocusEvent): void => {
      // Blur handling can be customized by components if needed
      // No utility classes needed - CSS handles focus states natively
    };

    /**
     * Handles keydown events (legacy method)
     */
    handleKeydown = (_event: KeyboardEvent): void => {
      // Override in subclasses for specific keyboard handling
    };

    /**
     * Gets accessibility configuration - must be implemented by component
     */
    abstract getAccessibilityConfig(): AccessibilityOptions;

    // ========================================
    // Dynamic ARIA State Management
    // ========================================

    /**
     * Sets the aria-expanded attribute for collapsible content
     * @param expanded - Whether the content is expanded
     */
    setAriaExpanded(expanded: boolean): void {
      this.setAriaAttribute('aria-expanded', String(expanded));
    }

    /**
     * Sets the aria-hidden attribute for content visibility
     * @param hidden - Whether the content is hidden from screen readers
     */
    setAriaHidden(hidden: boolean): void {
      this.setAriaAttribute('aria-hidden', String(hidden));
    }

    /**
     * Sets the aria-disabled attribute for disabled state
     * @param disabled - Whether the component is disabled
     */
    setAriaDisabled(disabled: boolean): void {
      this.setAriaAttribute('aria-disabled', String(disabled));
    }

    /**
     * Sets the aria-busy attribute for loading states
     * @param busy - Whether the component is in a busy/loading state
     */
    setAriaBusy(busy: boolean): void {
      this.setAriaAttribute('aria-busy', String(busy));
    }

    /**
     * Sets the aria-invalid attribute for validation states
     * @param invalid - Whether the component has validation errors
     */
    setAriaInvalid(invalid: boolean): void {
      this.setAriaAttribute('aria-invalid', String(invalid));
    }

    // ========================================
    // ARIA Relationships with Lazy Validation
    // ========================================

    /**
     * Sets aria-describedby relationship with lazy validation
     * Stores IDs and validates when elements exist
     * @param elementIds - Array of element IDs that describe this component
     */
    setAriaDescribedBy(elementIds: string[]): void {
      this.setAriaRelationship('aria-describedby', elementIds);
    }

    /**
     * Sets aria-labelledby relationship with lazy validation
     * @param elementIds - Array of element IDs that label this component
     */
    setAriaLabelledBy(elementIds: string[]): void {
      this.setAriaRelationship('aria-labelledby', elementIds);
    }

    /**
     * Sets aria-controls relationship with lazy validation
     * @param elementIds - Array of element IDs that this component controls
     */
    setAriaControls(elementIds: string[]): void {
      this.setAriaRelationship('aria-controls', elementIds);
    }

    // ========================================
    // Screen Reader Communication
    // ========================================

    /**
     * Announces a message to screen readers via live regions
     * @param message - Message to announce
     * @param priority - Announcement priority ('polite' or 'assertive')
     */
    announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
      try {
        if (!message.trim()) {
          console.warn('AccessibilityMixin: Empty message provided to announceToScreenReader');
          return;
        }

        // Use global announcement utility for reliability
        announceToScreenReader(message, priority);
      } catch (error) {
        console.error('AccessibilityMixin: Error announcing to screen reader:', error);
      }
    }

    /**
     * Creates a live region for this component instance
     * @param priority - Live region priority ('polite' or 'assertive')
     * @returns The created live region element
     */
    createLiveRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
      try {
        // Check if live region already exists for this priority
        const existing = this._liveRegions.get(priority);
        if (existing && existing.parentNode) {
          return existing;
        }

        // Create new live region in Light DOM for better screen reader support
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.id = generateId(`${priority}-live-region`);

        // Position off-screen but accessible to screen readers
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';

        // Add to document body (Light DOM for reliability)
        document.body.appendChild(liveRegion);
        this._liveRegions.set(priority, liveRegion);

        return liveRegion;
      } catch (error) {
        console.error('AccessibilityMixin: Error creating live region:', error);
        // Return a minimal fallback element that won't break functionality
        const fallback = {
          setAttribute: () => {},
          style: {},
          id: 'fallback-live-region',
          textContent: '',
          parentNode: null,
          tagName: 'DIV',
        } as unknown as HTMLElement;
        return fallback;
      }
    }

    /**
     * Updates the live region with a new message
     * @param message - Message to display in the live region
     */
    updateLiveRegion(message: string): void {
      try {
        if (!message.trim()) {
          console.warn('AccessibilityMixin: Empty message provided to updateLiveRegion');
          return;
        }

        // Default to polite priority if no live region exists
        let liveRegion = this._liveRegions.get('polite');
        if (!liveRegion) {
          liveRegion = this.createLiveRegion('polite');
        }

        // Update the live region content
        liveRegion.textContent = message;
      } catch (error) {
        console.error('AccessibilityMixin: Error updating live region:', error);
      }
    }

    // ========================================
    // Private Helper Methods
    // ========================================

    /**
     * Sets an ARIA attribute with proper null handling
     * @private
     */
    private setAriaAttribute(attribute: string, value: string | null): void {
      try {
        if (value === null) {
          this.removeAttribute(attribute);
        } else {
          this.setAttribute(attribute, value);
        }
      } catch (error) {
        console.warn(`AccessibilityMixin: Error setting ${attribute}:`, error);
      }
    }

    /**
     * Sets ARIA relationship attributes with lazy validation
     * @private
     */
    private setAriaRelationship(attribute: string, elementIds: string[]): void {
      try {
        if (!Array.isArray(elementIds) || elementIds.length === 0) {
          // Remove the attribute if no IDs provided
          this.setAriaAttribute(attribute, null);
          this._pendingRelationships.delete(attribute);
          return;
        }

        // Store for lazy validation
        this._pendingRelationships.set(attribute, elementIds);

        // Attempt immediate validation
        this.validateRelationship(attribute, elementIds);
      } catch (error) {
        console.warn(`AccessibilityMixin: Error setting ${attribute}:`, error);
      }
    }

    /**
     * Validates a single ARIA relationship
     * @private
     */
    private validateRelationship(attribute: string, elementIds: string[]): void {
      try {
        const validIds: string[] = [];
        const missingIds: string[] = [];

        elementIds.forEach((id) => {
          if (document.getElementById(id)) {
            validIds.push(id);
          } else {
            missingIds.push(id);
          }
        });

        // Set attribute with valid IDs
        if (validIds.length > 0) {
          this.setAriaAttribute(attribute, validIds.join(' '));
        } else {
          this.setAriaAttribute(attribute, null);
        }

        // Warn about missing elements (helpful for development)
        if (missingIds.length > 0) {
          console.warn(
            `AccessibilityMixin: Elements not found for ${attribute}: ${missingIds.join(', ')}`
          );
        }
      } catch (error) {
        console.warn(`AccessibilityMixin: Error validating ${attribute}:`, error);
      }
    }

    /**
     * Validates all pending ARIA relationships
     * Called on connectedCallback to handle dynamic content
     * @private
     */
    private validatePendingRelationships(): void {
      try {
        this._pendingRelationships.forEach((elementIds, attribute) => {
          this.validateRelationship(attribute, elementIds);
        });
      } catch (error) {
        console.warn('AccessibilityMixin: Error validating pending relationships:', error);
      }
    }

    /**
     * Cleans up all live regions created by this component
     * @private
     */
    private cleanupLiveRegions(): void {
      try {
        this._liveRegions.forEach((liveRegion) => {
          if (liveRegion && liveRegion.parentNode) {
            liveRegion.parentNode.removeChild(liveRegion);
          }
        });
        this._liveRegions.clear();
      } catch (error) {
        console.warn('AccessibilityMixin: Error cleaning up live regions:', error);
      }
    }
  }

  return AccessibilityMixin;
}
