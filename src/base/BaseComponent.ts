/**
 * BaseComponent - Foundation class for all UI components
 *
 * @deprecated Since version 1.0.0. Use CoreCustomElement with mixins instead.
 *
 * BaseComponent has been replaced by the new modular mixin-based architecture:
 * - Use `CoreCustomElement` as the base class
 * - Apply specific mixins for required functionality (AccessibilityMixin, AttributeManagerMixin, etc.)
 * - Use pre-composed classes from `src/base/composites/` for common patterns
 *
 * Migration examples:
 * ```typescript
 * // OLD
 * import { BaseComponent } from './base/BaseComponent.js';
 * class MyComponent extends BaseComponent { ... }
 *
 * // NEW - Using composites
 * import { InteractiveComposite } from './base/composites/InteractiveComposite.js';
 * class MyComponent extends InteractiveComposite { ... }
 *
 * // NEW - Custom mixin composition
 * import { CoreCustomElement } from './base/CoreCustomElement.js';
 * import { AccessibilityMixin, AttributeManagerMixin } from './base/mixins/index.js';
 * class MyComponent extends compose(CoreCustomElement, AccessibilityMixin, AttributeManagerMixin) { ... }
 * ```
 *
 * This class will be removed in a future major version.
 */

import { generateId, setAriaState } from '../utilities/accessibility.js';
import { ClassUtils } from '../utilities/style-helpers.js';
import type {
  ComponentConfig,
  LifecycleCallbacks,
  AccessibilityOptions,
} from '../types/component.js';

export abstract class BaseComponent extends HTMLElement implements LifecycleCallbacks {
  protected componentId: string;
  protected config: ComponentConfig;
  private staticAttributeCache: Map<string, string> = new Map();
  private _isConnected = false;

  constructor(config: ComponentConfig) {
    super();

    // Runtime deprecation warning
    console.warn(
      `[DEPRECATED] BaseComponent is deprecated and will be removed in a future version. ` +
        `Component "${this.constructor.name}" should migrate to the new mixin-based architecture. ` +
        `Use CoreCustomElement with mixins or pre-composed classes from 'src/base/composites/'. ` +
        `See migration guide: https://github.com/freefaller69/wc-library/blob/main/docs/development/component-migration-guide.md`
    );

    this.componentId = generateId(config.tagName);
    this.config = config;
    this.setupBaseAttributes();
  }

  /**
   * Component lifecycle - called when element is connected to DOM
   */
  connectedCallback(): void {
    if (this._isConnected) return;

    this._isConnected = true;
    this.setupAccessibility();
    this.onConnect?.();
  }

  /**
   * Component lifecycle - called when element is disconnected from DOM
   */
  disconnectedCallback(): void {
    this._isConnected = false;
    this.onDisconnect?.();
  }

  /**
   * Component lifecycle - called when observed attributes change
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    // Handle static vs dynamic attributes differently
    if (this.config.staticAttributes?.includes(name)) {
      this.handleStaticAttributeChange(name, newValue);
    } else {
      this.handleDynamicAttributeChange(name, oldValue, newValue);
    }

    this.onAttributeChange?.(name, oldValue, newValue);
  }

  /**
   * Component lifecycle - called when element is adopted to new document
   */
  adoptedCallback(): void {
    this.onAdopt?.();
  }

  /**
   * Static getter for observed attributes
   */
  static get observedAttributes(): string[] {
    return [];
  }

  /**
   * Sets up base component attributes and classes
   */
  private setupBaseAttributes(): void {
    this.classList.add('ui-reset');
    this.setAttribute('data-ui-component', this.config.tagName);

    if (!this.id) {
      this.id = this.componentId;
    }
  }

  /**
   * Sets up accessibility features
   */
  private setupAccessibility(): void {
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
   * Handles static attribute changes (variants, etc.)
   */
  private handleStaticAttributeChange(name: string, value: string | null): void {
    if (value) {
      this.staticAttributeCache.set(name, value);
    } else {
      this.staticAttributeCache.delete(name);
    }
    this.updateComponentClasses();
  }

  /**
   * Handles dynamic attribute changes (state, etc.)
   */
  private handleDynamicAttributeChange(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Override in subclasses for specific dynamic attribute handling
    this.requestUpdate();
  }

  /**
   * Updates component CSS classes based on attributes
   */
  private updateComponentClasses(): void {
    const baseClass = this.config.tagName;
    const modifierClasses: Record<string, boolean> = {};

    // Add modifier classes based on static attributes
    this.staticAttributeCache.forEach((value, name) => {
      modifierClasses[`${baseClass}--${name}-${value}`] = true;
    });

    // Add state classes based on dynamic attributes
    const stateClasses = this.getStateClasses();
    Object.assign(modifierClasses, stateClasses);

    this.className = ClassUtils.conditional(`ui-reset ${baseClass}`, modifierClasses);
  }

  /**
   * Requests a component update (can be overridden for efficient updates)
   */
  protected requestUpdate(): void {
    if (this._isConnected) {
      this.updateComponentClasses();
      this.render?.();
    }
  }

  /**
   * Dispatches a custom event from the component
   */
  protected dispatchCustomEvent(
    eventName: string,
    detail?: unknown,
    options?: CustomEventInit
  ): boolean {
    const event = new CustomEvent(`ui-${this.config.tagName}-${eventName}`, {
      detail,
      bubbles: true,
      cancelable: true,
      ...options,
    });

    return this.dispatchEvent(event);
  }

  /**
   * Sets ARIA states on the component
   */
  protected setAriaStates(states: Record<string, string | boolean | null>): void {
    setAriaState(this, states);
  }

  /**
   * Gets a typed attribute value
   */
  protected getTypedAttribute(name: string): string | null;
  protected getTypedAttribute(name: string, type: 'boolean'): boolean;
  protected getTypedAttribute(name: string, type: 'number'): number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getTypedAttribute(name: string, type?: 'string' | 'boolean' | 'number'): any {
    const value = this.getAttribute(name);

    if (value === null) {
      return type === 'boolean' ? false : null;
    }

    switch (type) {
      case 'boolean':
        return value !== 'false' && value !== '';
      case 'number': {
        const num = Number(value);
        return isNaN(num) ? null : num;
      }
      default:
        return value;
    }
  }

  /**
   * Sets a typed attribute value
   */
  protected setTypedAttribute(name: string, value: string | number | boolean | null): void {
    if (value === null || value === undefined) {
      this.removeAttribute(name);
    } else if (typeof value === 'boolean') {
      if (value) {
        this.setAttribute(name, '');
      } else {
        this.removeAttribute(name);
      }
    } else {
      this.setAttribute(name, String(value));
    }
  }

  // Event handlers that can be overridden
  protected handleFocus = (_event: FocusEvent): void => {
    this.classList.add('ui-focus-visible');
  };

  protected handleBlur = (_event: FocusEvent): void => {
    this.classList.remove('ui-focus-visible');
  };

  protected handleKeydown = (_event: KeyboardEvent): void => {
    // Override in subclasses for specific keyboard handling
  };

  // Abstract/overridable methods
  protected abstract getAccessibilityConfig(): AccessibilityOptions;
  protected abstract getStateClasses(): Record<string, boolean>;
  protected abstract render?(): void;

  // Lifecycle methods (can be overridden)
  onConnect?(): void;
  onDisconnect?(): void;
  onAttributeChange?(name: string, oldValue: string | null, newValue: string | null): void;
  onAdopt?(): void;
}
