/**
 * SimpleButton - Example component using new mixin architecture
 * Demonstrates InteractiveAttributeComponent with full functionality
 */

/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */

import { InteractiveAttributeComponent } from '../../base/composites/InteractiveAttributeComponent.js';
import type { AccessibilityOptions } from '../../types/component.js';

export class SimpleButton extends InteractiveAttributeComponent {
  constructor() {
    super({
      tagName: 'simple-button',
      staticAttributes: ['variant', 'size'],
    });
  }

  static get observedAttributes(): string[] {
    return ['disabled'];
  }

  connectedCallback() {
    super.connectedCallback();
    this.render();
  }

  getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'button',
      focusable: true,
      tabIndex: this.getTypedAttribute('disabled', 'boolean') ? -1 : 0,
    };
  }

  getStateClasses(): Record<string, boolean> {
    return {
      'simple-button--disabled': this.getTypedAttribute('disabled', 'boolean'),
      'simple-button--active': this.matches(':active'),
    };
  }

  handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick();
    }
  };

  private handleClick = (): void => {
    if (!this.getTypedAttribute('disabled', 'boolean')) {
      this.dispatchCustomEvent('click', {
        variant: this.getAttribute('variant'),
        size: this.getAttribute('size'),
      });
    }
  };

  render(): void {
    this.addEventListener('click', this.handleClick);

    // Update ARIA states based on current state
    this.setAriaStates({
      'aria-disabled': this.getTypedAttribute('disabled', 'boolean'),
    });
  }
}

// Register the component
if (!customElements.get('simple-button')) {
  customElements.define('simple-button', SimpleButton);
}
