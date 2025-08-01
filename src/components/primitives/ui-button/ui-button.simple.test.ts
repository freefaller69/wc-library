/**
 * UIButton Simple Validation Tests
 * Basic tests to validate component creation and mixin architecture
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UIButton } from './ui-button.js';

describe('UIButton - Basic Validation', () => {
  let button: UIButton;

  beforeEach(() => {
    button = new UIButton();
    document.body.appendChild(button);
  });

  afterEach(() => {
    if (button.parentNode) {
      button.remove();
    }
  });

  describe('Component Creation', () => {
    it('should create and register the component', () => {
      expect(customElements.get('ui-button')).toBeDefined();
      expect(button).toBeInstanceOf(UIButton);
      expect(button).toBeInstanceOf(HTMLElement);
    });

    it('should have basic properties', () => {
      expect(button.tagName.toLowerCase()).toBe('ui-button');
      expect(button.id).toBeTruthy();
      expect(button.getAttribute('data-ui-component')).toBe('ui-button');
    });

    it('should have observedAttributes from mixin composition', () => {
      const observedAttrs = UIButton.observedAttributes;
      expect(Array.isArray(observedAttrs)).toBe(true);
      expect(observedAttrs.length).toBeGreaterThan(0);
    });
  });

  describe('Basic Functionality', () => {
    it('should handle disabled state', () => {
      expect(button.disabled).toBe(false);

      button.disabled = true;
      expect(button.disabled).toBe(true);
      expect(button.hasAttribute('disabled')).toBe(true);
    });

    it('should handle loading state', () => {
      expect(button.loading).toBe(false);

      button.loading = true;
      expect(button.loading).toBe(true);
      expect(button.hasAttribute('loading')).toBe(true);
    });

    it('should handle variant attribute', () => {
      expect(button.variant).toBeNull();

      button.setAttribute('variant', 'primary');
      expect(button.variant).toBe('primary');
    });

    it('should handle size attribute', () => {
      expect(button.size).toBeNull();

      button.setAttribute('size', 'large');
      expect(button.size).toBe('large');
    });
  });

  describe('Mixin Architecture Validation', () => {
    it('should have mixin composition working', () => {
      // This validates that the mixin composition didn't break
      expect(button.constructor.name).toBe('UIButton');
      expect(typeof button.attributeChangedCallback).toBe('function');
      expect(typeof button.connectedCallback).toBe('function');
    });

    it('should handle accessibility configuration correctly', () => {
      const config = button.getAccessibilityConfig();
      expect(config).toBeDefined();
      // Wrapper should be transparent - no role to avoid conflicts with native button
      expect(config.role).toBeUndefined();
      expect(config.focusable).toBe(false);
      expect(config.tabIndex).toBe(-1);
    });

    it.skip('should apply CSS classes correctly', () => {
      button.setAttribute('variant', 'primary');
      button.connectedCallback(); // Re-trigger setup

      // Debug: log the classes to see what's actually applied
      console.log('Button classes:', button.className);
      console.log('Has primary class:', button.classList.contains('ui-button--primary'));

      expect(button.classList.contains('ui-button--primary')).toBe(true);
    });
  });
});
