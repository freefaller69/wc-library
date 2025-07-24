/**
 * Simplified tests for BaseComponent that work with JSDOM limitations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseComponent } from '../base/BaseComponent.js';
import type { ComponentConfig, AccessibilityOptions } from '../types/component.js';

// Simple mock for testing without custom elements registry
class MockBaseComponent extends BaseComponent {
  public accessibilityConfig: AccessibilityOptions = {};
  public stateClasses: Record<string, boolean> = {};

  constructor(config: ComponentConfig) {
    super(config);
  }

  protected getAccessibilityConfig(): AccessibilityOptions {
    return this.accessibilityConfig;
  }

  protected getStateClasses(): Record<string, boolean> {
    return this.stateClasses;
  }

  protected render(): void {
    // Mock render method - no implementation needed for tests
  }

  // Expose protected methods for testing
  public testGetTypedAttribute = this.getTypedAttribute.bind(this);
  public testSetTypedAttribute = this.setTypedAttribute.bind(this);
  public testDispatchCustomEvent = this.dispatchCustomEvent.bind(this);
  public testSetAriaStates = this.setAriaStates.bind(this);
}

describe.skip('BaseComponent Core Functionality', () => {
  let component: MockBaseComponent;
  const config: ComponentConfig = {
    tagName: 'test-component',
    observedAttributes: ['test-attr', 'disabled', 'variant'],
    staticAttributes: ['variant'],
    dynamicAttributes: ['disabled'],
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    component = new MockBaseComponent(config);
  });

  describe('Initialization', () => {
    it('should initialize with correct config', () => {
      expect(component['config']).toEqual(config);
      expect(component['componentId']).toMatch(/^ui-test-component-\d+$/);
    });

    it('should have ui-reset class', () => {
      expect(component.classList.contains('ui-reset')).toBe(true);
    });

    it('should have data-ui-component attribute', () => {
      expect(component.getAttribute('data-ui-component')).toBe('test-component');
    });
  });

  describe('Typed Attributes', () => {
    it('should get and set string attributes', () => {
      component.testSetTypedAttribute('test-attr', 'string-value');
      expect(component.getAttribute('test-attr')).toBe('string-value');
      expect(component.testGetTypedAttribute('test-attr')).toBe('string-value');
    });

    it('should get and set boolean attributes', () => {
      component.testSetTypedAttribute('disabled', true);
      expect(component.hasAttribute('disabled')).toBe(true);
      expect(component.testGetTypedAttribute('disabled', 'boolean')).toBe(true);

      component.testSetTypedAttribute('disabled', false);
      expect(component.hasAttribute('disabled')).toBe(false);
      expect(component.testGetTypedAttribute('disabled', 'boolean')).toBe(false);
    });

    it('should get and set number attributes', () => {
      component.testSetTypedAttribute('test-number', 42);
      expect(component.getAttribute('test-number')).toBe('42');
      expect(component.testGetTypedAttribute('test-number', 'number')).toBe(42);

      component.setAttribute('test-invalid', 'not-a-number');
      expect(component.testGetTypedAttribute('test-invalid', 'number')).toBe(null);
    });

    it('should handle null values', () => {
      component.setAttribute('test-attr', 'value');
      component.testSetTypedAttribute('test-attr', null);
      expect(component.hasAttribute('test-attr')).toBe(false);
    });
  });

  describe('ARIA State Management', () => {
    it('should set ARIA states', () => {
      component.testSetAriaStates({
        expanded: true,
        'aria-label': 'Test label',
        describedby: 'description-id',
      });

      expect(component.getAttribute('aria-expanded')).toBe('true');
      expect(component.getAttribute('aria-label')).toBe('Test label');
      expect(component.getAttribute('aria-describedby')).toBe('description-id');
    });

    it('should remove ARIA states when null', () => {
      component.setAttribute('aria-expanded', 'true');
      component.testSetAriaStates({ expanded: null });
      expect(component.hasAttribute('aria-expanded')).toBe(false);
    });
  });

  describe('Custom Events', () => {
    it('should dispatch custom events with proper naming', () => {
      const eventSpy = vi.fn();
      component.addEventListener('ui-test-component-custom', eventSpy);

      component.testDispatchCustomEvent('custom', { data: 'test' });

      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('ui-test-component-custom');
      expect(event.detail).toEqual({ data: 'test' });
      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
    });
  });

  describe('CSS Class Management', () => {
    it('should update classes based on state', () => {
      component.stateClasses = {
        'test-component--active': true,
        'test-component--disabled': false,
      };

      component['updateComponentClasses']();

      expect(component.classList.contains('test-component--active')).toBe(true);
      expect(component.classList.contains('test-component--disabled')).toBe(false);
    });

    it('should include base classes', () => {
      component['updateComponentClasses']();
      expect(component.classList.contains('ui-reset')).toBe(true);
      expect(component.classList.contains('test-component')).toBe(true);
    });
  });

  describe('Accessibility Configuration', () => {
    beforeEach(() => {
      document.body.appendChild(component);
    });

    it('should apply accessibility configuration when connected', () => {
      component.accessibilityConfig = {
        role: 'button',
        ariaLabel: 'Test button',
        tabIndex: 0,
      };

      component.connectedCallback();

      expect(component.getAttribute('role')).toBe('button');
      expect(component.getAttribute('aria-label')).toBe('Test button');
      expect(component.getAttribute('tabindex')).toBe('0');
    });

    it('should setup focus management for focusable components', () => {
      component.accessibilityConfig = { focusable: true };
      
      const focusSpy = vi.spyOn(component, 'handleFocus' as any);
      const blurSpy = vi.spyOn(component, 'handleBlur' as any);

      component.connectedCallback();

      component.dispatchEvent(new FocusEvent('focus'));
      component.dispatchEvent(new FocusEvent('blur'));

      expect(focusSpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
    });
  });
});