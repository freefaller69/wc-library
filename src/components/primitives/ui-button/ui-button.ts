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
 * - Slot-based content projection
 * - Minimal JavaScript footprint
 */

import { CoreCustomElement } from '../../../base/CoreCustomElement.js';
import {
  AttributeManagerMixin,
  AccessibilityMixin,
  getObservedAttributes,
} from '../../../base/mixins/index.js';
import { compose, type Constructor } from '../../../base/utilities/mixin-composer.js';
import type { ComponentConfig, AccessibilityOptions } from '../../../types/component.js';
import type { AttributeManagerMixinInterface } from '../../../base/mixins/AttributeManagerMixin.js';
import type { AccessibilityMixinInterface } from '../../../base/mixins/AccessibilityMixin.js';
import './ui-button.css';

export interface UIButtonClickEventDetail {
  originalEvent: Event;
  variant: string | null;
  size: string | null;
  type: string;
  triggeredBy?: 'mouse' | 'keyboard';
}

// Type alias for the composed base class with proper mixin interfaces
type UIButtonBase = Constructor<
  CoreCustomElement & AccessibilityMixinInterface & AttributeManagerMixinInterface
> & {
  new (
    config: ComponentConfig
  ): CoreCustomElement & AccessibilityMixinInterface & AttributeManagerMixinInterface;
};

/**
 * UIButton implementation using mixin-composer for clean mixin composition
 *
 * Composition order (applied left-to-right):
 * 1. CoreCustomElement - Base functionality and lifecycle
 * 2. AccessibilityMixin - ARIA attributes and keyboard handling
 * 3. AttributeManagerMixin - Typed attribute getters/setters
 */
export class UIButton extends (compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin
) as UIButtonBase) {
  private nativeButton!: HTMLButtonElement;
  private lastTriggerSource: 'mouse' | 'keyboard' = 'mouse';

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

    // Move all content to the native button
    const slot = document.createElement('slot');
    this.nativeButton.appendChild(slot);

    // Clear any existing content and add the native button
    this.innerHTML = '';
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
        break;
      case 'type':
        this.nativeButton.type = this.type as 'button' | 'submit' | 'reset';
        break;
      case 'loading':
        // Loading state affects disabled behavior
        this.nativeButton.disabled = this.loading || this.disabled;
        this.updateAccessibilityState();
        break;
      case 'aria-pressed':
        // For tests that call attributeChangedCallback directly, ensure attribute is set
        if (newValue !== null && this.getAttribute('aria-pressed') !== newValue) {
          HTMLElement.prototype.setAttribute.call(this, 'aria-pressed', newValue);
        }
        break;
    }
  }

  public updateAccessibilityState(): void {
    // Apply accessibility attributes to native button where they belong
    if (this.disabled || this.loading) {
      this.nativeButton.setAttribute('aria-disabled', 'true');
    } else {
      this.nativeButton.removeAttribute('aria-disabled');
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
    this.nativeButton.disabled = this.disabled || this.loading;
    this.nativeButton.type = this.type as 'button' | 'submit' | 'reset';

    // Set up initial accessibility state
    this.updateAccessibilityState();
  }

  // Public API - delegate to native button where appropriate
  public click(): void {
    this.nativeButton.click();
  }

  public focus(): void {
    // Only focus if not disabled or loading
    if (!this.disabled && !this.loading) {
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
