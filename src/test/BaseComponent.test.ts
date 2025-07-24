/**
 * Tests for BaseComponent
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseComponent } from '../base/BaseComponent.js';
import type { ComponentConfig, AccessibilityOptions } from '../types/component.js';

// Test implementation of BaseComponent
class TestComponent extends BaseComponent {
  static get observedAttributes(): string[] {
    return ['test-attr', 'disabled', 'variant'];
  }

  constructor() {
    super({
      tagName: 'test-component',
      observedAttributes: ['test-attr', 'disabled', 'variant'],
      staticAttributes: ['variant'],
      dynamicAttributes: ['disabled'],
    });
  }

  protected getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'button',
      focusable: true,
    };
  }

  protected getStateClasses(): Record<string, boolean> {
    return {
      'test-component--disabled': this.getTypedAttribute('disabled', 'boolean'),
    };
  }

  protected render(): void {
    this.textContent = 'Test Component';
  }
}

// Register the test component
customElements.define('test-component', TestComponent);

describe('BaseComponent', () => {
  let component: TestComponent;

  beforeEach(() => {
    document.body.innerHTML = '';
    component = document.createElement('test-component') as TestComponent;
  });

  describe('Initialization', () => {
    it('should create a component with basic attributes', () => {
      expect(component).toBeInstanceOf(BaseComponent);
      expect(component).toBeInstanceOf(TestComponent);
      expect(component.tagName.toLowerCase()).toBe('test-component');
    });

    it('should have ui-reset class', () => {
      expect(component.classList.contains('ui-reset')).toBe(true);
    });

    it('should have data-ui-component attribute', () => {
      expect(component.getAttribute('data-ui-component')).toBe('test-component');
    });

    it('should generate an ID if not provided', () => {
      expect(component.id).toBeTruthy();
      expect(component.id).toMatch(/^ui-test-component-\d+$/);
    });

    it('should not override existing ID', () => {
      const customComponent = document.createElement('test-component') as TestComponent;
      customComponent.id = 'custom-id';
      document.body.appendChild(customComponent);
      
      expect(customComponent.id).toBe('custom-id');
    });
  });

  describe('Lifecycle', () => {
    it('should call onConnect when connected to DOM', () => {
      const onConnectSpy = vi.spyOn(component, 'onConnect' as any);
      document.body.appendChild(component);
      
      expect(onConnectSpy).toHaveBeenCalled();
    });

    it('should call onDisconnect when removed from DOM', () => {
      document.body.appendChild(component);
      const onDisconnectSpy = vi.spyOn(component, 'onDisconnect' as any);
      
      component.remove();
      expect(onDisconnectSpy).toHaveBeenCalled();
    });

    it('should setup accessibility attributes when connected', () => {
      document.body.appendChild(component);
      
      expect(component.getAttribute('role')).toBe('button');
      expect(component.hasAttribute('tabindex')).toBe(false); // focusable but no explicit tabindex
    });
  });

  describe('Attribute Handling', () => {
    beforeEach(() => {
      document.body.appendChild(component);
    });

    it('should handle static attributes (variants)', () => {
      component.setAttribute('variant', 'primary');
      
      expect(component.classList.contains('test-component--variant-primary')).toBe(true);
    });

    it('should handle dynamic attributes (state)', () => {
      component.setAttribute('disabled', '');
      
      expect(component.classList.contains('test-component--disabled')).toBe(true);
    });

    it('should call onAttributeChange when attributes change', () => {
      const onAttributeChangeSpy = vi.spyOn(component, 'onAttributeChange' as any);
      
      component.setAttribute('test-attr', 'value');
      expect(onAttributeChangeSpy).toHaveBeenCalledWith('test-attr', null, 'value');
    });

    it('should not call onAttributeChange if value is the same', () => {
      component.setAttribute('test-attr', 'value');
      const onAttributeChangeSpy = vi.spyOn(component, 'onAttributeChange' as any);
      
      component.setAttribute('test-attr', 'value');
      expect(onAttributeChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Typed Attributes', () => {
    beforeEach(() => {
      document.body.appendChild(component);
    });

    it('should get string attributes', () => {
      component.setAttribute('test-attr', 'string-value');
      expect(component['getTypedAttribute']('test-attr')).toBe('string-value');
    });

    it('should get boolean attributes', () => {
      component.setAttribute('disabled', '');
      expect(component['getTypedAttribute']('disabled', 'boolean')).toBe(true);
      
      component.removeAttribute('disabled');
      expect(component['getTypedAttribute']('disabled', 'boolean')).toBe(false);
      
      component.setAttribute('disabled', 'false');
      expect(component['getTypedAttribute']('disabled', 'boolean')).toBe(false);
    });

    it('should get number attributes', () => {
      component.setAttribute('test-attr', '42');
      expect(component['getTypedAttribute']('test-attr', 'number')).toBe(42);
      
      component.setAttribute('test-attr', 'not-a-number');
      expect(component['getTypedAttribute']('test-attr', 'number')).toBe(null);
    });

    it('should set typed attributes', () => {
      component['setTypedAttribute']('test-string', 'value');
      expect(component.getAttribute('test-string')).toBe('value');
      
      component['setTypedAttribute']('test-boolean', true);
      expect(component.hasAttribute('test-boolean')).toBe(true);
      expect(component.getAttribute('test-boolean')).toBe('');
      
      component['setTypedAttribute']('test-boolean', false);
      expect(component.hasAttribute('test-boolean')).toBe(false);
      
      component['setTypedAttribute']('test-number', 42);
      expect(component.getAttribute('test-number')).toBe('42');
      
      component['setTypedAttribute']('test-null', null);
      expect(component.hasAttribute('test-null')).toBe(false);
    });
  });

  describe('Events', () => {
    beforeEach(() => {
      document.body.appendChild(component);
    });

    it('should dispatch custom events with proper naming', () => {
      const eventSpy = vi.fn();
      component.addEventListener('ui-test-component-custom', eventSpy);
      
      component['dispatchCustomEvent']('custom', { data: 'test' });
      
      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('ui-test-component-custom');
      expect(event.detail).toEqual({ data: 'test' });
      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
    });
  });

  describe('Focus Management', () => {
    beforeEach(() => {
      document.body.appendChild(component);
    });

    it('should add focus-visible class on focus', () => {
      component.focus();
      component.dispatchEvent(new FocusEvent('focus'));
      
      expect(component.classList.contains('ui-focus-visible')).toBe(true);
    });

    it('should remove focus-visible class on blur', () => {
      component.focus();
      component.dispatchEvent(new FocusEvent('focus'));
      component.dispatchEvent(new FocusEvent('blur'));
      
      expect(component.classList.contains('ui-focus-visible')).toBe(false);
    });
  });

  describe('CSS Classes', () => {
    beforeEach(() => {
      document.body.appendChild(component);
    });

    it('should have base component class', () => {
      expect(component.classList.contains('test-component')).toBe(true);
    });

    it('should update classes when attributes change', () => {
      component.setAttribute('variant', 'primary');
      expect(component.classList.contains('test-component--variant-primary')).toBe(true);
      
      component.setAttribute('variant', 'secondary');
      expect(component.classList.contains('test-component--variant-secondary')).toBe(true);
      expect(component.classList.contains('test-component--variant-primary')).toBe(false);
    });
  });
});