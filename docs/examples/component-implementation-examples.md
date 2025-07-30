# Component Implementation Examples

This document provides practical examples of implementing components using SimpleComponent and FullComponent, demonstrating real-world usage patterns and best practices.

## SimpleComponent Examples

### Example 1: Simple Badge Component

A basic badge component for displaying counts or status indicators.

```typescript
// src/components/primitives/ui-badge/ui-badge.ts
import { SimpleComponent } from '../../../base/composites/SimpleComponent.js';

export class BadgeComponent extends SimpleComponent {
  static get observedAttributes(): string[] {
    return ['variant', 'count', 'max'];
  }

  constructor() {
    super({ tagName: 'ui-badge' });
    this.setupDefaultStyles();
  }

  private setupDefaultStyles(): void {
    this.className = 'ui-badge ui-badge--default';
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'variant':
        this.updateVariant(newValue);
        break;
      case 'count':
      case 'max':
        this.updateCount();
        break;
    }
  }

  private updateVariant(variant: string | null): void {
    // Remove existing variant classes
    this.className = this.className.replace(/ui-badge--\w+/g, '');
    // Add new variant class
    this.className += ` ui-badge--${variant || 'default'}`;
  }

  private updateCount(): void {
    const count = parseInt(this.getAttribute('count') || '0', 10);
    const max = parseInt(this.getAttribute('max') || '99', 10);

    if (count > max) {
      this.textContent = `${max}+`;
    } else {
      this.textContent = count.toString();
    }
  }
}

// Register the component
if (!customElements.get('ui-badge')) {
  customElements.define('ui-badge', BadgeComponent);
}
```

**Usage:**

```html
<ui-badge variant="primary" count="5"></ui-badge>
<ui-badge variant="warning" count="150" max="99"></ui-badge>
```

### Example 2: Simple Icon Component

A lightweight icon component for displaying SVG icons.

```typescript
// src/components/primitives/ui-icon/ui-icon.ts
import { SimpleComponent } from '../../../base/composites/SimpleComponent.js';

export class IconComponent extends SimpleComponent {
  static get observedAttributes(): string[] {
    return ['name', 'size', 'color'];
  }

  constructor() {
    super({ tagName: 'ui-icon' });
    this.setAttribute('aria-hidden', 'true'); // Icons are decorative by default
    this.innerHTML = this.createIconHTML();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'name':
        this.updateIcon();
        break;
      case 'size':
        this.updateSize(newValue);
        break;
      case 'color':
        this.updateColor(newValue);
        break;
    }
  }

  private createIconHTML(): string {
    const iconName = this.getAttribute('name') || 'default';
    return `<svg class="ui-icon__svg" viewBox="0 0 24 24">
      <use href="#icon-${iconName}"></use>
    </svg>`;
  }

  private updateIcon(): void {
    this.innerHTML = this.createIconHTML();
  }

  private updateSize(size: string | null): void {
    const iconSize = size || 'medium';
    this.className = `ui-icon ui-icon--${iconSize}`;
  }

  private updateColor(color: string | null): void {
    if (color) {
      this.style.color = color;
    } else {
      this.style.removeProperty('color');
    }
  }
}

if (!customElements.get('ui-icon')) {
  customElements.define('ui-icon', IconComponent);
}
```

**Usage:**

```html
<ui-icon name="arrow-right" size="small"></ui-icon>
<ui-icon name="user" size="large" color="#007bff"></ui-icon>
```

## FullComponent Examples

### Example 1: Toggle Switch Component

A fully accessible toggle switch with keyboard support and ARIA attributes.

```typescript
// src/components/primitives/ui-toggle/ui-toggle.ts
import { FullComponent } from '../../../base/composites/FullComponent.js';
import type { AccessibilityOptions } from '../../../types/component.js';

export class ToggleComponent extends FullComponent {
  static get observedAttributes(): string[] {
    return ['checked', 'disabled', 'label', 'description'];
  }

  constructor() {
    super({ tagName: 'ui-toggle' });
    this.setupEventListeners();
    this.setupShadowDOM();
  }

  private setupEventListeners(): void {
    this.addEventListener('click', this.handleClick.bind(this));
    this.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  private setupShadowDOM(): void {
    if (this.hasShadowDOM()) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
          }
          
          :host([disabled]) {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .toggle-track {
            width: 44px;
            height: 24px;
            border-radius: 12px;
            background: var(--ui-color-neutral-300);
            position: relative;
            transition: background-color 0.2s ease;
          }
          
          :host([checked]) .toggle-track {
            background: var(--ui-color-primary-500);
          }
          
          .toggle-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            position: absolute;
            top: 2px;
            left: 2px;
            transition: transform 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          :host([checked]) .toggle-thumb {
            transform: translateX(20px);
          }
          
          .toggle-label {
            font-size: 0.875rem;
            font-weight: 500;
          }
          
          .toggle-description {
            font-size: 0.75rem;
            color: var(--ui-color-neutral-600);
            margin-top: 0.25rem;
          }
        </style>
        
        <div class="toggle-track">
          <div class="toggle-thumb"></div>
        </div>
        
        <div class="toggle-content">
          <div class="toggle-label">
            <slot name="label"></slot>
          </div>
          <div class="toggle-description">
            <slot name="description"></slot>
          </div>
        </div>
      `;
    }
  }

  getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'switch',
      focusable: true,
      ariaLabel: this.getTypedAttribute('label') || 'Toggle switch',
      ariaDescription: this.getTypedAttribute('description') || undefined,
    };
  }

  getStateClasses(): Record<string, boolean> {
    return {
      'ui-toggle--checked': this.getTypedAttribute('checked', 'boolean'),
      'ui-toggle--disabled': this.getTypedAttribute('disabled', 'boolean'),
    };
  }

  private handleClick(event: Event): void {
    if (this.getTypedAttribute('disabled', 'boolean')) {
      event.preventDefault();
      return;
    }

    this.toggle();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (this.getTypedAttribute('disabled', 'boolean')) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }

  private toggle(): void {
    const wasChecked = this.getTypedAttribute('checked', 'boolean');
    const newChecked = !wasChecked;

    this.setTypedAttribute('checked', newChecked);

    // Update ARIA state
    this.setAriaStates({
      'aria-checked': newChecked.toString(),
    });

    // Dispatch custom event
    this.dispatchCustomEvent('toggle', {
      checked: newChecked,
      value: newChecked,
    });

    // Announce to screen readers
    this.announceToScreenReader(`Toggle ${newChecked ? 'enabled' : 'disabled'}`, 'polite');
  }

  // Public API methods
  public check(): void {
    if (!this.getTypedAttribute('disabled', 'boolean')) {
      this.setTypedAttribute('checked', true);
    }
  }

  public uncheck(): void {
    if (!this.getTypedAttribute('disabled', 'boolean')) {
      this.setTypedAttribute('checked', false);
    }
  }

  public get checked(): boolean {
    return this.getTypedAttribute('checked', 'boolean');
  }

  public set checked(value: boolean) {
    this.setTypedAttribute('checked', value);
  }
}

if (!customElements.get('ui-toggle')) {
  customElements.define('ui-toggle', ToggleComponent);
}
```

**Usage:**

```html
<ui-toggle
  checked
  label="Enable notifications"
  description="Receive email notifications for updates"
>
</ui-toggle>

<ui-toggle disabled label="Premium feature" description="Available with premium subscription">
</ui-toggle>
```

### Example 2: Modal Dialog Component

A comprehensive modal component with focus management and accessibility features.

```typescript
// src/components/primitives/ui-modal/ui-modal.ts
import { FullComponent } from '../../../base/composites/FullComponent.js';
import type { AccessibilityOptions } from '../../../types/component.js';

export class ModalComponent extends FullComponent {
  static get observedAttributes(): string[] {
    return ['open', 'size', 'closable', 'backdrop-dismiss'];
  }

  private previousActiveElement: Element | null = null;
  private focusableElements: NodeListOf<HTMLElement> | null = null;

  constructor() {
    super({ tagName: 'ui-modal' });
    this.setupShadowDOM();
    this.setupEventListeners();
  }

  private setupShadowDOM(): void {
    if (this.hasShadowDOM()) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1000;
          }

          :host([open]) {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
          }

          .modal-container {
            position: relative;
            background: white;
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            max-width: 90vw;
            max-height: 90vh;
            overflow: hidden;
            animation: modalEnter 0.2s ease-out;
          }

          :host([size="small"]) .modal-container { width: 400px; }
          :host([size="medium"]) .modal-container { width: 600px; }
          :host([size="large"]) .modal-container { width: 800px; }

          @keyframes modalEnter {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--ui-color-neutral-200);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .modal-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
          }

          .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            color: var(--ui-color-neutral-500);
          }

          .modal-close:hover {
            background: var(--ui-color-neutral-100);
          }

          .modal-body {
            padding: 1.5rem;
            overflow-y: auto;
            max-height: 60vh;
          }

          .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid var(--ui-color-neutral-200);
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
          }
        </style>

        <div class="modal-backdrop"></div>
        <div class="modal-container" role="dialog" aria-modal="true">
          <header class="modal-header">
            <h2 class="modal-title">
              <slot name="title">Modal Title</slot>
            </h2>
            <button class="modal-close" aria-label="Close modal">×</button>
          </header>
          
          <div class="modal-body">
            <slot></slot>
          </div>
          
          <footer class="modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      `;
    }
  }

  private setupEventListeners(): void {
    // Close button click
    const closeBtn = this.shadowRoot?.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.close());

    // Backdrop click (if enabled)
    const backdrop = this.shadowRoot?.querySelector('.modal-backdrop');
    backdrop?.addEventListener('click', () => {
      if (this.getTypedAttribute('backdrop-dismiss', 'boolean')) {
        this.close();
      }
    });

    // Escape key
    this.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'dialog',
      ariaModal: true,
      focusable: true,
      ariaLabel: 'Modal dialog',
    };
  }

  getStateClasses(): Record<string, boolean> {
    return {
      'ui-modal--open': this.getTypedAttribute('open', 'boolean'),
      'ui-modal--closable': this.getTypedAttribute('closable', 'boolean'),
    };
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.getTypedAttribute('open', 'boolean')) return;

    switch (event.key) {
      case 'Escape':
        if (this.getTypedAttribute('closable', 'boolean')) {
          event.preventDefault();
          this.close();
        }
        break;

      case 'Tab':
        this.handleTabNavigation(event);
        break;
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    if (!this.focusableElements) {
      this.updateFocusableElements();
    }

    if (!this.focusableElements || this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    const activeElement = this.shadowRoot?.activeElement || document.activeElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private updateFocusableElements(): void {
    const container = this.shadowRoot?.querySelector('.modal-container');
    if (container) {
      this.focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
    }
  }

  public open(): void {
    if (this.getTypedAttribute('open', 'boolean')) return;

    // Store current focus
    this.previousActiveElement = document.activeElement;

    // Show modal
    this.setTypedAttribute('open', true);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    setTimeout(() => {
      this.updateFocusableElements();
      if (this.focusableElements && this.focusableElements.length > 0) {
        this.focusableElements[0].focus();
      }
    }, 100);

    // Dispatch event
    this.dispatchCustomEvent('open');

    // Announce to screen readers
    this.announceToScreenReader('Modal opened', 'assertive');
  }

  public close(): void {
    if (!this.getTypedAttribute('open', 'boolean')) return;

    // Hide modal
    this.setTypedAttribute('open', false);

    // Restore body scroll
    document.body.style.removeProperty('overflow');

    // Restore focus
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus();
    }

    // Clear focus elements cache
    this.focusableElements = null;

    // Dispatch event
    this.dispatchCustomEvent('close');

    // Announce to screen readers
    this.announceToScreenReader('Modal closed', 'polite');
  }

  public toggle(): void {
    if (this.getTypedAttribute('open', 'boolean')) {
      this.close();
    } else {
      this.open();
    }
  }

  // Getters/setters for convenience
  public get isOpen(): boolean {
    return this.getTypedAttribute('open', 'boolean');
  }

  public set isOpen(value: boolean) {
    if (value) {
      this.open();
    } else {
      this.close();
    }
  }
}

if (!customElements.get('ui-modal')) {
  customElements.define('ui-modal', ModalComponent);
}
```

**Usage:**

```html
<ui-modal id="exampleModal" size="medium" closable backdrop-dismiss>
  <span slot="title">Confirm Action</span>

  <p>Are you sure you want to delete this item? This action cannot be undone.</p>

  <div slot="footer">
    <button type="button" onclick="closeModal()">Cancel</button>
    <button type="button" onclick="confirmDelete()" class="ui-button--danger">Delete</button>
  </div>
</ui-modal>

<script>
  function openModal() {
    document.getElementById('exampleModal').open();
  }

  function closeModal() {
    document.getElementById('exampleModal').close();
  }
</script>
```

## Component Testing Examples

### Testing SimpleComponent

```typescript
// src/components/primitives/ui-badge/ui-badge.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BadgeComponent } from './ui-badge.js';

describe('BadgeComponent', () => {
  let badge: BadgeComponent;

  beforeEach(() => {
    badge = new BadgeComponent();
    document.body.appendChild(badge);
  });

  afterEach(() => {
    document.body.removeChild(badge);
  });

  it('should display count correctly', () => {
    badge.setAttribute('count', '5');
    expect(badge.textContent).toBe('5');
  });

  it('should show max+ when count exceeds max', () => {
    badge.setAttribute('count', '150');
    badge.setAttribute('max', '99');
    expect(badge.textContent).toBe('99+');
  });

  it('should apply variant classes', () => {
    badge.setAttribute('variant', 'warning');
    expect(badge.className).toContain('ui-badge--warning');
  });
});
```

### Testing FullComponent

```typescript
// src/components/primitives/ui-toggle/ui-toggle.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToggleComponent } from './ui-toggle.js';

describe('ToggleComponent', () => {
  let toggle: ToggleComponent;

  beforeEach(() => {
    toggle = new ToggleComponent();
    document.body.appendChild(toggle);
  });

  afterEach(() => {
    document.body.removeChild(toggle);
  });

  it('should toggle checked state on click', () => {
    expect(toggle.checked).toBe(false);

    toggle.click();
    expect(toggle.checked).toBe(true);

    toggle.click();
    expect(toggle.checked).toBe(false);
  });

  it('should dispatch toggle event', () => {
    const eventSpy = vi.fn();
    toggle.addEventListener('ui-toggle-toggle', eventSpy);

    toggle.click();

    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { checked: true, value: true },
      })
    );
  });

  it('should not toggle when disabled', () => {
    toggle.setAttribute('disabled', 'true');

    toggle.click();
    expect(toggle.checked).toBe(false);
  });

  it('should support keyboard navigation', () => {
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    toggle.dispatchEvent(spaceEvent);

    expect(toggle.checked).toBe(true);
  });

  it('should have proper accessibility attributes', () => {
    expect(toggle.getAttribute('role')).toBe('switch');
    expect(toggle.getAttribute('tabindex')).toBe('0');
  });
});
```

## Integration Examples

### Form Integration

```typescript
// Example: Custom form with multiple component types
class CustomForm extends FullComponent {
  getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'form',
      ariaLabel: 'User preferences form',
    };
  }

  getStateClasses(): Record<string, boolean> {
    return {
      'form--submitting': this.hasAttribute('submitting'),
    };
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();

    const formData = this.collectFormData();
    this.dispatchCustomEvent('submit', formData);
  }

  private collectFormData(): Record<string, any> {
    const toggles = this.querySelectorAll('ui-toggle');
    const data: Record<string, any> = {};

    toggles.forEach((toggle: ToggleComponent) => {
      const name = toggle.getAttribute('name');
      if (name) {
        data[name] = toggle.checked;
      }
    });

    return data;
  }
}
```

**Usage:**

```html
<custom-form>
  <fieldset>
    <legend>Notification Preferences</legend>

    <ui-toggle
      name="email_notifications"
      checked
      label="Email notifications"
      description="Receive updates via email"
    >
    </ui-toggle>

    <ui-toggle
      name="push_notifications"
      label="Push notifications"
      description="Receive browser push notifications"
    >
    </ui-toggle>
  </fieldset>

  <div class="form-actions">
    <button type="submit">Save Preferences</button>
  </div>
</custom-form>
```

This comprehensive set of examples demonstrates the practical implementation patterns for both SimpleComponent and FullComponent, showing how to leverage the architecture effectively for different use cases.
