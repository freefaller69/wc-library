# Mixin Usage Examples

This document provides comprehensive examples of how to use the mixin-based architecture for different types of web components.

## Quick Start Examples

### Simple Display Component

For components that just display content with minimal functionality:

```typescript
// src/components/badge/BadgeComponent.ts
import { SimpleComponent } from '../../base/composites/SimpleComponent.js';

export class BadgeComponent extends SimpleComponent {
  static get observedAttributes(): string[] {
    return ['variant', 'size'];
  }

  constructor() {
    super({
      tagName: 'ui-badge',
      observedAttributes: ['variant', 'size'],
      staticAttributes: ['variant', 'size']
    });
  }
}

// Register the component
customElements.define('ui-badge', BadgeComponent);
```

**Usage:**
```html
<ui-badge variant="success" size="small">New</ui-badge>
<ui-badge variant="warning">Important</ui-badge>
```

### Interactive Button Component

For components that need accessibility, events, and user interaction:

```typescript
// src/components/button/ButtonComponent.ts
import { InteractiveComponent } from '../../base/composites/InteractiveComponent.js';
import type { AccessibilityOptions } from '../../types/component.js';

export class ButtonComponent extends InteractiveComponent {
  static get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled', 'loading'];
  }

  constructor() {
    super({
      tagName: 'ui-button',
      observedAttributes: ['variant', 'size', 'disabled', 'loading'],
      staticAttributes: ['variant', 'size'],
      dynamicAttributes: ['disabled', 'loading']
    });
  }

  protected getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'button',
      focusable: !this.getTypedAttribute('disabled', 'boolean'),
      ariaLabel: this.textContent || 'Button',
      ariaDisabled: this.getTypedAttribute('disabled', 'boolean')
    };
  }

  protected getStateClasses(): Record<string, boolean> {
    return {
      'ui-button--disabled': this.getTypedAttribute('disabled', 'boolean'),
      'ui-button--loading': this.getTypedAttribute('loading', 'boolean')
    };
  }

  protected getAttributeConfig() {
    return {
      staticAttributes: ['variant', 'size'],
      dynamicAttributes: ['disabled', 'loading']
    };
  }

  protected getTagName(): string {
    return 'ui-button';
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      if (!this.getTypedAttribute('disabled', 'boolean')) {
        event.preventDefault();
        this.handleClick();
      }
    }
  }

  private handleClick(): void {
    if (!this.getTypedAttribute('disabled', 'boolean') && 
        !this.getTypedAttribute('loading', 'boolean')) {
      this.dispatchCustomEvent('click', {
        variant: this.getAttribute('variant'),
        timestamp: Date.now()
      });
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
  }
}

customElements.define('ui-button', ButtonComponent);
```

**Usage:**
```html
<ui-button variant="primary" size="large">Primary Action</ui-button>
<ui-button variant="secondary" disabled>Disabled Button</ui-button>
<ui-button variant="danger" loading>Loading...</ui-button>
```

## Custom Mixin Compositions

### Form Input Component

Custom composition for form elements that need attributes, accessibility, and validation:

```typescript
// src/components/input/InputComponent.ts
import { CoreCustomElement } from '../../base/CoreCustomElement.js';
import { AccessibilityMixin } from '../../base/mixins/AccessibilityMixin.js';
import { AttributeManagerMixin } from '../../base/mixins/AttributeManagerMixin.js';
import { EventManagerMixin } from '../../base/mixins/EventManagerMixin.js';
import { UpdateManagerMixin } from '../../base/mixins/UpdateManagerMixin.js';
import { compose } from '../../base/utilities/mixin-composer.js';
import type { AccessibilityOptions } from '../../types/component.js';

// Custom composition for form inputs
const FormInputBase = compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin, 
  EventManagerMixin,
  UpdateManagerMixin
);

export class InputComponent extends FormInputBase {
  static get observedAttributes(): string[] {
    return ['type', 'placeholder', 'disabled', 'required', 'value', 'invalid'];
  }

  private inputElement: HTMLInputElement;

  constructor() {
    super({
      tagName: 'ui-input',
      observedAttributes: ['type', 'placeholder', 'disabled', 'required', 'value', 'invalid'],
      staticAttributes: ['type'],
      dynamicAttributes: ['disabled', 'required', 'value', 'invalid']
    });

    this.inputElement = document.createElement('input');
    this.appendChild(this.inputElement);
  }

  protected getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'textbox',
      focusable: !this.getTypedAttribute('disabled', 'boolean'),
      ariaRequired: this.getTypedAttribute('required', 'boolean'),
      ariaInvalid: this.getTypedAttribute('invalid', 'boolean'),
      ariaLabel: this.getAttribute('aria-label') || this.getAttribute('placeholder') || 'Input field'
    };
  }

  protected getStateClasses(): Record<string, boolean> {
    return {
      'ui-input--disabled': this.getTypedAttribute('disabled', 'boolean'),
      'ui-input--required': this.getTypedAttribute('required', 'boolean'),
      'ui-input--invalid': this.getTypedAttribute('invalid', 'boolean'),
      'ui-input--has-value': !!this.inputElement.value
    };
  }

  protected getAttributeConfig() {
    return {
      staticAttributes: ['type'],
      dynamicAttributes: ['disabled', 'required', 'value', 'invalid']
    };
  }

  protected getTagName(): string {
    return 'ui-input';
  }

  protected handleDynamicAttributeChange(name: string, oldValue: string | null, newValue: string | null): void {
    super.handleDynamicAttributeChange(name, oldValue, newValue);

    // Sync attributes with internal input element
    switch (name) {
      case 'type':
        this.inputElement.type = newValue || 'text';
        break;
      case 'placeholder':
        if (newValue) {
          this.inputElement.placeholder = newValue;
        } else {
          this.inputElement.removeAttribute('placeholder');
        }
        break;
      case 'disabled':
        this.inputElement.disabled = this.getTypedAttribute('disabled', 'boolean');
        break;
      case 'required':
        this.inputElement.required = this.getTypedAttribute('required', 'boolean');
        break;
      case 'value':
        if (this.inputElement.value !== (newValue || '')) {
          this.inputElement.value = newValue || '';
        }
        break;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    
    // Set up input event handling
    this.inputElement.addEventListener('input', this.handleInput);
    this.inputElement.addEventListener('change', this.handleChange);
    this.inputElement.addEventListener('focus', this.handleInputFocus);
    this.inputElement.addEventListener('blur', this.handleInputBlur);

    // Sync initial attributes
    this.syncAttributes();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    
    this.inputElement.removeEventListener('input', this.handleInput);
    this.inputElement.removeEventListener('change', this.handleChange);
    this.inputElement.removeEventListener('focus', this.handleInputFocus);
    this.inputElement.removeEventListener('blur', this.handleInputBlur);
  }

  private syncAttributes(): void {
    const attributes = ['type', 'placeholder', 'disabled', 'required', 'value'];
    attributes.forEach(attr => {
      const value = this.getAttribute(attr);
      if (value !== null) {
        this.handleDynamicAttributeChange(attr, null, value);
      }
    });
  }

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this.setAttribute('value', target.value);
    
    this.dispatchCustomEvent('input', {
      value: target.value,
      nativeEvent: event
    });
  };

  private handleChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    
    this.dispatchCustomEvent('change', {
      value: target.value,
      nativeEvent: event
    });
  };

  private handleInputFocus = (): void => {
    this.classList.add('ui-input--focused');
  };

  private handleInputBlur = (): void => {
    this.classList.remove('ui-input--focused');
  };

  // Public API
  get value(): string {
    return this.inputElement.value;
  }

  set value(value: string) {
    this.inputElement.value = value;
    this.setAttribute('value', value);
  }

  focus(): void {
    this.inputElement.focus();
  }

  blur(): void {
    this.inputElement.blur();
  }

  select(): void {
    this.inputElement.select();
  }
}

customElements.define('ui-input', InputComponent);
```

**Usage:**
```html
<ui-input type="text" placeholder="Enter your name" required></ui-input>
<ui-input type="email" placeholder="Email address" invalid></ui-input>
<ui-input type="password" placeholder="Password" disabled></ui-input>
```

## Shadow DOM Components

### Card Component with Shadow DOM

Using shadow DOM for encapsulated styling and content projection:

```typescript
// src/components/card/CardComponent.ts
import { CoreCustomElement } from '../../base/CoreCustomElement.js';
import { ShadowDOMMixin } from '../../base/mixins/ShadowDOMMixin.js';
import { StyleManagerMixin } from '../../base/mixins/StyleManagerMixin.js';
import { SlotManagerMixin } from '../../base/mixins/SlotManagerMixin.js';
import { AttributeManagerMixin } from '../../base/mixins/AttributeManagerMixin.js';
import { UpdateManagerMixin } from '../../base/mixins/UpdateManagerMixin.js';
import { compose } from '../../base/utilities/mixin-composer.js';

const CardBase = compose(
  CoreCustomElement,
  ShadowDOMMixin,
  StyleManagerMixin,
  SlotManagerMixin,
  AttributeManagerMixin,
  UpdateManagerMixin
);

export class CardComponent extends CardBase {
  static get observedAttributes(): string[] {
    return ['variant', 'elevation', 'interactive'];
  }

  constructor() {
    super({
      tagName: 'ui-card',
      observedAttributes: ['variant', 'elevation', 'interactive'],
      staticAttributes: ['variant', 'elevation'],
      dynamicAttributes: ['interactive'],
      shadowMode: 'open'
    });
  }

  protected getAttributeConfig() {
    return {
      staticAttributes: ['variant', 'elevation'],
      dynamicAttributes: ['interactive']
    };
  }

  protected getTagName(): string {
    return 'ui-card';
  }

  protected getStateClasses(): Record<string, boolean> {
    return {
      'ui-card--interactive': this.getTypedAttribute('interactive', 'boolean')
    };
  }

  protected getShadowTemplate(): string {
    return `
      <div class="card">
        <div class="card__header">
          <slot name="header"></slot>
        </div>
        <div class="card__content">
          <slot></slot>
        </div>
        <div class="card__footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }

  protected getShadowStyles(): string {
    return `
      :host {
        display: block;
        border-radius: var(--ui-border-radius-md);
        background: var(--ui-color-surface);
        box-shadow: var(--ui-shadow-sm);
        overflow: hidden;
        transition: box-shadow 0.2s ease;
      }

      :host(.ui-card--elevation-sm) {
        box-shadow: var(--ui-shadow-sm);
      }

      :host(.ui-card--elevation-md) {
        box-shadow: var(--ui-shadow-md);
      }

      :host(.ui-card--elevation-lg) {
        box-shadow: var(--ui-shadow-lg);
      }

      :host(.ui-card--interactive) {
        cursor: pointer;
      }

      :host(.ui-card--interactive:hover) {
        box-shadow: var(--ui-shadow-md);
      }

      :host(.ui-card--variant-outlined) {
        border: 1px solid var(--ui-color-border);
        box-shadow: none;
      }

      .card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .card__header {
        padding: var(--ui-spacing-md);
        border-bottom: 1px solid var(--ui-color-border);
      }

      .card__header:empty {
        display: none;
      }

      .card__content {
        flex: 1;
        padding: var(--ui-spacing-md);
      }

      .card__footer {
        padding: var(--ui-spacing-md);
        border-top: 1px solid var(--ui-color-border);
      }

      .card__footer:empty {
        display: none;
      }
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    
    if (this.getTypedAttribute('interactive', 'boolean')) {
      this.setupInteractivity();
    }
  }

  private setupInteractivity(): void {
    this.addEventListener('click', this.handleCardClick);
    this.addEventListener('keydown', this.handleCardKeydown);
    
    // Make interactive cards focusable
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
  }

  private handleCardClick = (): void => {
    this.dispatchCustomEvent('card-click', {
      variant: this.getAttribute('variant'),
      timestamp: Date.now()
    });
  };

  private handleCardKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleCardClick();
    }
  };
}

customElements.define('ui-card', CardComponent);
```

**Usage:**
```html
<ui-card variant="outlined" elevation="md">
  <h3 slot="header">Card Title</h3>
  <p>This is the card content. It can contain any HTML elements.</p>
  <div slot="footer">
    <ui-button variant="primary">Action</ui-button>
  </div>
</ui-card>

<ui-card interactive elevation="sm">
  <p>This card is clickable and will dispatch a custom event when clicked.</p>
</ui-card>
```

## Advanced Patterns

### Modal Dialog with Multiple Mixins

Complex component using multiple mixins for accessibility, focus management, and portal behavior:

```typescript
// src/components/modal/ModalComponent.ts
import { CoreCustomElement } from '../../base/CoreCustomElement.js';
import { AccessibilityMixin } from '../../base/mixins/AccessibilityMixin.js';
import { ShadowDOMMixin } from '../../base/mixins/ShadowDOMMixin.js';
import { StyleManagerMixin } from '../../base/mixins/StyleManagerMixin.js';
import { EventManagerMixin } from '../../base/mixins/EventManagerMixin.js';
import { UpdateManagerMixin } from '../../base/mixins/UpdateManagerMixin.js';
import { compose } from '../../base/utilities/mixin-composer.js';
import { FocusManager } from '../../utilities/accessibility.js';
import type { AccessibilityOptions } from '../../types/component.js';

const ModalBase = compose(
  CoreCustomElement,
  AccessibilityMixin,
  ShadowDOMMixin,
  StyleManagerMixin,
  EventManagerMixin,
  UpdateManagerMixin
);

export class ModalComponent extends ModalBase {
  static get observedAttributes(): string[] {
    return ['open', 'size', 'closable'];
  }

  private focusManager: FocusManager;
  private backdrop?: HTMLElement;

  constructor() {
    super({
      tagName: 'ui-modal',
      observedAttributes: ['open', 'size', 'closable'],
      dynamicAttributes: ['open', 'closable'],
      staticAttributes: ['size'],
      shadowMode: 'open'
    });

    this.focusManager = new FocusManager();
  }

  protected getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'dialog',
      ariaModal: this.getTypedAttribute('open', 'boolean'),
      ariaLabelledby: this.getAttribute('aria-labelledby') || undefined,
      ariaDescribedby: this.getAttribute('aria-describedby') || undefined,
      focusable: false // The modal container itself is not focusable
    };
  }

  protected getStateClasses(): Record<string, boolean> {
    return {
      'ui-modal--open': this.getTypedAttribute('open', 'boolean'),
      'ui-modal--closable': this.getTypedAttribute('closable', 'boolean')
    };
  }

  protected getAttributeConfig() {
    return {
      staticAttributes: ['size'],
      dynamicAttributes: ['open', 'closable']
    };
  }

  protected getTagName(): string {
    return 'ui-modal';
  }

  protected getShadowTemplate(): string {
    return `
      <div class="modal-backdrop">
        <div class="modal-container" role="document">
          <div class="modal-header">
            <slot name="header"></slot>
            <button class="modal-close" type="button" aria-label="Close modal">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-content">
            <slot></slot>
          </div>
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;
  }

  protected getShadowStyles(): string {
    return `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        display: none;
      }

      :host(.ui-modal--open) {
        display: flex;
      }

      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--ui-spacing-lg);
      }

      .modal-container {
        background: var(--ui-color-surface);
        border-radius: var(--ui-border-radius-lg);
        box-shadow: var(--ui-shadow-xl);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: modalEnter 0.3s ease-out;
      }

      :host(.ui-modal--size-sm) .modal-container {
        max-width: 400px;
      }

      :host(.ui-modal--size-lg) .modal-container {
        max-width: 800px;
      }

      :host(.ui-modal--size-xl) .modal-container {
        max-width: 1200px;
      }

      .modal-header {
        padding: var(--ui-spacing-lg);
        border-bottom: 1px solid var(--ui-color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: var(--ui-spacing-xs);
        border-radius: var(--ui-border-radius-sm);
        transition: background-color 0.2s ease;
      }

      .modal-close:hover {
        background: var(--ui-color-surface-hover);
      }

      :host(:not(.ui-modal--closable)) .modal-close {
        display: none;
      }

      .modal-content {
        flex: 1;
        padding: var(--ui-spacing-lg);
        overflow-y: auto;
      }

      .modal-footer {
        padding: var(--ui-spacing-lg);
        border-top: 1px solid var(--ui-color-border);
      }

      .modal-footer:empty {
        display: none;
      }

      @keyframes modalEnter {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
  }

  protected handleDynamicAttributeChange(name: string, oldValue: string | null, newValue: string | null): void {
    super.handleDynamicAttributeChange(name, oldValue, newValue);

    if (name === 'open') {
      if (this.getTypedAttribute('open', 'boolean')) {
        this.openModal();
      } else {
        this.closeModal();
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    
    // Set up event listeners
    const closeButton = this.shadowQuery('.modal-close');
    const backdrop = this.shadowQuery('.modal-backdrop');
    
    closeButton?.addEventListener('click', this.handleClose);
    backdrop?.addEventListener('click', this.handleBackdropClick);
    
    // Set up keyboard handling
    document.addEventListener('keydown', this.handleDocumentKeydown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    this.focusManager.restore();
  }

  private openModal(): void {
    // Capture focus and trap it within modal
    this.focusManager.capture();
    this.focusManager.trap(this.shadowQuery('.modal-container')!);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element in modal
    const firstFocusable = this.shadowQuery('button, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      (firstFocusable as HTMLElement).focus();
    }
    
    this.dispatchCustomEvent('modal-open');
  }

  private closeModal(): void {
    // Restore focus and remove trap
    this.focusManager.untrap();
    this.focusManager.restore();
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    this.dispatchCustomEvent('modal-close');
  }

  private handleClose = (): void => {
    if (this.getTypedAttribute('closable', 'boolean')) {
      this.close();
    }
  };

  private handleBackdropClick = (event: Event): void => {
    if (event.target === this.shadowQuery('.modal-backdrop')) {
      this.handleClose();
    }
  };

  private handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (this.getTypedAttribute('open', 'boolean') && event.key === 'Escape') {
      this.handleClose();
    }
  };

  // Public API
  open(): void {
    this.setAttribute('open', '');
  }

  close(): void {
    this.removeAttribute('open');
  }

  toggle(): void {
    if (this.getTypedAttribute('open', 'boolean')) {
      this.close();
    } else {
      this.open();
    }
  }
}

customElements.define('ui-modal', ModalComponent);
```

**Usage:**
```html
<ui-modal size="lg" closable>
  <h2 slot="header">Confirmation</h2>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
  <div slot="footer">
    <ui-button variant="secondary">Cancel</ui-button>
    <ui-button variant="danger">Delete</ui-button>
  </div>
</ui-modal>

<ui-button onclick="document.querySelector('ui-modal').open()">Open Modal</ui-button>
```

## Testing Examples

### Testing Individual Mixins

```typescript
// src/test/examples/mixin-testing.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { CoreCustomElement } from '../../base/CoreCustomElement.js';
import { AccessibilityMixin } from '../../base/mixins/AccessibilityMixin.js';

// Create test component with single mixin
class TestAccessibilityComponent extends AccessibilityMixin(CoreCustomElement) {
  constructor() {
    super({ tagName: 'test-accessibility' });
  }

  protected getAccessibilityConfig() {
    return { role: 'button', focusable: true };
  }
}

customElements.define('test-accessibility-example', TestAccessibilityComponent);

describe('AccessibilityMixin Example', () => {
  let component: TestAccessibilityComponent;

  beforeEach(() => {
    document.body.innerHTML = '';
    component = document.createElement('test-accessibility-example') as TestAccessibilityComponent;
  });

  it('should provide accessibility features', () => {
    document.body.appendChild(component);
    
    expect(component.getAttribute('role')).toBe('button');
    expect(typeof component.setAriaStates).toBe('function');
    
    component.setAriaStates({ expanded: true });
    expect(component.getAttribute('aria-expanded')).toBe('true');
  });
});
```

### Testing Component Combinations

```typescript
// Testing complete component
describe('ButtonComponent Example', () => {
  let button: ButtonComponent;

  beforeEach(() => {
    document.body.innerHTML = '';
    button = document.createElement('ui-button') as ButtonComponent;
  });

  it('should integrate all features correctly', () => {
    button.textContent = 'Test Button';
    button.setAttribute('variant', 'primary');
    document.body.appendChild(button);

    // Test accessibility
    expect(button.getAttribute('role')).toBe('button');
    
    // Test attribute management
    expect(button.classList.contains('ui-button--variant-primary')).toBe(true);
    
    // Test event management
    const eventSpy = vi.fn();
    button.addEventListener('ui-button-click', eventSpy);
    button.click();
    expect(eventSpy).toHaveBeenCalled();
  });
});
```

## Performance Comparisons

### Bundle Size Comparison

```typescript
// Example bundle size measurements
const bundleSizes = {
  // Old monolithic approach
  BaseComponent: '~8KB',
  ShadowComponent: '~10KB',
  
  // New mixin approach
  SimpleComponent: '~2KB',      // 75% reduction
  InteractiveComponent: '~5KB', // 37% reduction
  ShadowComponent: '~7KB',      // 30% reduction
  FullComponent: '~8KB',        // Same as old BaseComponent
};
```

### Component Creation Performance

```typescript
// Example performance measurements (microseconds per component)
const creationTimes = {
  BadgeComponent: 12,      // Simple, minimal overhead
  ButtonComponent: 18,     // Interactive, more features
  InputComponent: 25,      // Form element, complex sync
  CardComponent: 35,       // Shadow DOM, styling
  ModalComponent: 45,      // Complex, focus management
};
```

This comprehensive set of examples demonstrates how to use the mixin architecture effectively for different types of components, from simple display elements to complex interactive components with shadow DOM and advanced accessibility features.