/**
 * UIButton - Truly Semantic Button Component
 *
 * Embraces web standards by wrapping a native <button> element.
 * Leverages built-in browser accessibility and behavior instead of reimplementing it.
 *
 * Value over raw HTML:
 * - Design system styling via CSS custom properties
 * - Enhanced event dispatching with context
 * - Consistent theming and variant system
 * - Light DOM content projection
 * - Minimal JavaScript footprint
 */

import { CoreCustomElement } from '../../../base/CoreCustomElement.js';
import {
  AttributeManagerMixin,
  AccessibilityMixin,
  StaticStylesheetMixin,
  getObservedAttributes,
} from '../../../base/mixins/index.js';
import { compose, type Constructor } from '../../../base/utilities/mixin-composer.js';
import { createStyleSheet } from '../../../utilities/style-helpers.js';
import type { ComponentConfig, AccessibilityOptions } from '../../../types/component.js';
import type { AttributeManagerMixinInterface } from '../../../base/mixins/AttributeManagerMixin.js';
import type { AccessibilityMixinInterface } from '../../../base/mixins/AccessibilityMixin.js';
import type { StaticStylesheetMixinInterface } from '../../../base/mixins/StaticStylesheetMixin.js';
// Import CSS as inline string for modern delivery
import uiButtonCSS from './ui-button.css?inline';

export interface UIButtonClickEventDetail {
  originalEvent: Event;
  variant: string | null;
  size: string | null;
  type: string;
  triggeredBy?: 'mouse' | 'keyboard';
}

// Type alias for the composed base class with proper mixin interfaces
type UIButtonBase = Constructor<
  CoreCustomElement &
    AccessibilityMixinInterface &
    AttributeManagerMixinInterface &
    StaticStylesheetMixinInterface
> & {
  new (
    config: ComponentConfig
  ): CoreCustomElement &
    AccessibilityMixinInterface &
    AttributeManagerMixinInterface &
    StaticStylesheetMixinInterface;
};

/**
 * UIButton implementation using mixin-composer for clean mixin composition
 *
 * Composition order (applied left-to-right):
 * 1. CoreCustomElement - Base functionality and lifecycle
 * 2. AccessibilityMixin - ARIA attributes and keyboard handling
 * 3. AttributeManagerMixin - Typed attribute getters/setters
 * 4. StaticStylesheetMixin - Automatic static stylesheet management
 */
export class UIButton extends (compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin,
  StaticStylesheetMixin
) as UIButtonBase) {
  // Static stylesheet - automatically applied by StaticStylesheetMixin
  static stylesheet = createStyleSheet(uiButtonCSS);

  private nativeButton!: HTMLButtonElement;
  private lastTriggerSource: 'mouse' | 'keyboard' = 'mouse';
  private announcementDebouncer = new Map<string, number>();
  private readonly ANNOUNCEMENT_DEBOUNCE_MS = 150;

  static get observedAttributes(): string[] {
    return getObservedAttributes({
      dynamicAttributes: ['disabled', 'loading', 'aria-pressed'],
      staticAttributes: ['variant', 'size'],
      observedAttributes: ['type'],
    } as ComponentConfig);
  }

  constructor() {
    // TypeScript has difficulty inferring constructor args through mixin composition
    // eslint-disable-next-line constructor-super
    super({
      tagName: 'ui-button',
      // Dynamic attributes - observed for changes, trigger state updates
      dynamicAttributes: ['disabled', 'loading', 'aria-pressed'],
      // Static attributes - set once, used for styling/variants
      staticAttributes: ['variant', 'size'],
      // Explicit attributes - special handling needed
      observedAttributes: ['type'],
    } as ComponentConfig);
  }

  connectedCallback(): void {
    super.connectedCallback(); // AccessibilityMixin calls setupAccessibility() here
    this.processStaticAttributes(); // Initialize mixin for static attributes
    this.createNativeButton();
    this.setupEventDelegation();
    this.syncAttributes();
  }

  private createNativeButton(): void {
    // Create semantic native button
    this.nativeButton = document.createElement('button');
    this.nativeButton.setAttribute('part', 'button');

    // Simple: move all content directly to native button
    while (this.firstChild) {
      this.nativeButton.appendChild(this.firstChild);
    }

    // Add the native button to the wrapper
    this.appendChild(this.nativeButton);
  }

  private setupEventDelegation(): void {
    // Let the native button handle all the accessibility automatically
    // We just listen for the native click event and enhance it
    this.nativeButton.addEventListener('click', this.handleNativeClick.bind(this));

    // Listen for keyboard events on wrapper to detect trigger source
    // AccessibilityMixin provides transparent wrapper, so no conflict with native button
    this.addEventListener('keydown', this.handleKeydown);
  }

  // Handle keyboard events to detect trigger source for enhanced event dispatching
  handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      // Prevent default to avoid double-firing
      event.preventDefault();
      this.lastTriggerSource = 'keyboard';

      // Trigger click on native button (which will call handleNativeClick)
      this.nativeButton.click();
    }
  };

  private handleNativeClick(event: Event): void {
    // Native button already handled disabled state, keyboard events, etc.
    // We just dispatch our enhanced custom event
    const customEvent = new CustomEvent<UIButtonClickEventDetail>('ui-button-click', {
      detail: {
        originalEvent: event,
        variant: this.getAttribute('variant'),
        size: this.getAttribute('size'),
        type: this.getAttribute('type') || 'button',
        triggeredBy: this.lastTriggerSource,
      },
      bubbles: true,
      cancelable: true,
    });
    this.dispatchEvent(customEvent);

    // Reset to mouse for next interaction
    this.lastTriggerSource = 'mouse';
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    // Call the mixin's implementation first - it will handle parent calls
    // @ts-expect-error - mixin methods may not be typed correctly
    super.attributeChangedCallback(name, oldValue, newValue);

    if (!this.nativeButton) return;

    // Custom logic to sync with native button
    switch (name) {
      case 'disabled':
        this.nativeButton.disabled = this.disabled;
        this.updateAccessibilityState();

        // Announce disabled state changes to screen readers
        if (this.disabled && !oldValue) {
          // Becoming disabled
          this.announceWithDebouncing('Button disabled', 'polite');
        } else if (!this.disabled && oldValue) {
          // Becoming enabled
          this.announceWithDebouncing('Button enabled', 'polite');
        }
        break;
      case 'type':
        this.nativeButton.type = this.type as 'button' | 'submit' | 'reset';
        break;
      case 'loading':
        // Loading state affects disabled behavior
        this.nativeButton.disabled = this.loading || this.disabled;
        this.updateAccessibilityState();

        // Announce loading state changes to screen readers
        if (this.loading && !oldValue) {
          // Starting to load
          this.announceWithDebouncing('Button is loading', 'polite');
        } else if (!this.loading && oldValue) {
          // Finished loading
          this.announceWithDebouncing('Button ready', 'polite');
        }
        break;
      case 'aria-pressed':
        // For tests that call attributeChangedCallback directly, ensure attribute is set
        if (newValue !== null && this.getAttribute('aria-pressed') !== newValue) {
          HTMLElement.prototype.setAttribute.call(this, 'aria-pressed', newValue);
        }
        break;
    }
  }

  /**
   * Determines if the button is in a non-interactive state
   * @returns true if disabled or loading, false otherwise
   * @private
   */
  private get isNonInteractive(): boolean {
    return this.disabled || this.loading;
  }

  /**
   * Updates accessibility attributes on the native button element
   *
   * This method ensures proper ARIA state management by:
   * - Setting aria-disabled when button is disabled or loading
   * - Setting aria-busy during loading states
   * - Delegating user-provided ARIA attributes from wrapper to native button
   * - Maintaining wrapper transparency for screen readers
   *
   * Called automatically when disabled/loading states change via attributeChangedCallback
   */
  public updateAccessibilityState(): void {
    // Use AccessibilityMixin methods for consistent ARIA management
    const isDisabledOrLoading = this.isNonInteractive;

    // Apply accessibility attributes to native button where they belong
    if (isDisabledOrLoading) {
      this.nativeButton.setAttribute('aria-disabled', 'true');
    } else {
      this.nativeButton.removeAttribute('aria-disabled');
    }

    // Use mixin method for busy state during loading
    if (this.loading) {
      // Set aria-busy on native button for loading state
      this.nativeButton.setAttribute('aria-busy', 'true');
    } else {
      this.nativeButton.removeAttribute('aria-busy');
    }

    // Delegate user-provided ARIA attributes from wrapper to native button
    const ariaLabel = this.getAttribute('aria-label');
    if (ariaLabel) {
      this.nativeButton.setAttribute('aria-label', ariaLabel);
    } else {
      this.nativeButton.removeAttribute('aria-label');
    }

    const ariaDescribedBy = this.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      this.nativeButton.setAttribute('aria-describedby', ariaDescribedBy);
    } else {
      this.nativeButton.removeAttribute('aria-describedby');
    }

    // Wrapper stays transparent - no accessibility attributes on wrapper
  }

  private syncAttributes(): void {
    // Sync initial attributes using type-safe property accessors
    this.nativeButton.disabled = this.isNonInteractive;
    this.nativeButton.type = this.type as 'button' | 'submit' | 'reset';

    // Set up initial accessibility state
    this.updateAccessibilityState();
  }

  // Public API - delegate to native button where appropriate
  public click(): void {
    this.nativeButton.click();
  }

  public focus(): void {
    // Only focus if interactive
    if (!this.isNonInteractive) {
      this.nativeButton.focus();
    }
  }

  public blur(): void {
    this.nativeButton.blur();
  }

  // Clean, type-safe property accessors using AttributeManagerMixin
  public get disabled(): boolean {
    return this.getTypedAttribute('disabled', 'boolean');
  }

  public set disabled(value: boolean) {
    this.setTypedAttribute('disabled', value);
  }

  public get loading(): boolean {
    return this.getTypedAttribute('loading', 'boolean');
  }

  public set loading(value: boolean) {
    this.setTypedAttribute('loading', value);
  }

  // Static attributes - not observed for changes, but settable for flexibility
  public get variant(): string | null {
    return this.getTypedAttribute('variant');
  }

  public set variant(value: string | null) {
    this.setTypedAttribute('variant', value);
  }

  public get size(): string | null {
    return this.getTypedAttribute('size');
  }

  public set size(value: string | null) {
    this.setTypedAttribute('size', value);
  }

  public get type(): string {
    return this.getTypedAttribute('type') || 'button';
  }

  public set type(value: string) {
    this.setTypedAttribute('type', value);
  }

  // Access to the native button for advanced use cases
  public get nativeButtonElement(): HTMLButtonElement {
    return this.nativeButton;
  }

  /**
   * Announces a message to screen readers with debouncing to prevent spam
   * @param message - The message to announce
   * @param priority - The announcement priority (defaults to 'polite')
   * @private
   */
  private announceWithDebouncing(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    try {
      const key = `${message}-${priority}`;
      const now = Date.now();
      const lastAnnouncement = this.announcementDebouncer.get(key);

      // Skip if same announcement was made recently
      if (lastAnnouncement && now - lastAnnouncement < this.ANNOUNCEMENT_DEBOUNCE_MS) {
        return;
      }

      // Update debounce tracker
      this.announcementDebouncer.set(key, now);

      // Make the announcement using AccessibilityMixin
      this.announceToScreenReader(message, priority);
    } catch (error) {
      console.warn('UIButton: Failed to announce accessibility message:', error);
      // Graceful degradation - accessibility announcement failure shouldn't break the component
    }
  }

  /**
   * Gets accessibility configuration for the button wrapper
   *
   * ACCESSIBILITY DECISION: Wrapper should be transparent to avoid conflicts
   * - NO role="button" (native button provides this)
   * - NO tabindex (native button handles focus)
   * - ARIA attributes delegated to native button where they belong
   *
   * This prevents screen reader confusion and keyboard navigation issues.
   * Required by AccessibilityMixin interface
   */
  public getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: undefined, // Let native button provide semantics
      focusable: false, // Native button handles focus
      tabIndex: -1, // Wrapper should not be focusable
      ariaLabel: undefined, // Will be delegated to native button
      ariaDescribedBy: undefined, // Will be delegated to native button
    };
  }
}

// Register the component
if (!customElements.get('ui-button')) {
  customElements.define('ui-button', UIButton);
}
