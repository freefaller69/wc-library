/**
 * UIButton Semantic Tests
 * Tests for the clean, attribute-based semantic button component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIButton, type UIButtonClickEventDetail } from './ui-button.js';

describe('UIButton - Semantic Implementation', () => {
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

  describe('Component Registration', () => {
    it('should create and register the component', () => {
      expect(customElements.get('ui-button')).toBeDefined();
      expect(button).toBeInstanceOf(UIButton);
      expect(button).toBeInstanceOf(HTMLElement);
    });

    it('should have semantic properties', () => {
      expect(button.tagName.toLowerCase()).toBe('ui-button');
      expect(button.id).toBeTruthy();
      expect(button.getAttribute('data-ui-component')).toBe('ui-button');
      // Wrapper should be transparent - no role attribute
      expect(button.getAttribute('role')).toBeNull();
    });

    it('should have observed attributes from configuration', () => {
      const observedAttrs = UIButton.observedAttributes;
      expect(Array.isArray(observedAttrs)).toBe(true);
      expect(observedAttrs).toContain('disabled');
      expect(observedAttrs).toContain('loading');
      expect(observedAttrs).toContain('aria-pressed');
    });
  });

  describe('Semantic Attribute Management', () => {
    it('should handle disabled state semantically', () => {
      expect(button.disabled).toBe(false);
      expect(button.getAttribute('tabindex')).toBe('-1');

      button.disabled = true;
      expect(button.disabled).toBe(true);
      expect(button.hasAttribute('disabled')).toBe(true);
      expect(button.getAttribute('tabindex')).toBe('-1');
      // aria-disabled should be on the native button, not the wrapper
      expect(button.nativeButtonElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should handle loading state semantically', () => {
      expect(button.loading).toBe(false);

      button.loading = true;
      expect(button.loading).toBe(true);
      expect(button.hasAttribute('loading')).toBe(true);
    });

    it('should handle variant attribute (static)', () => {
      expect(button.variant).toBeNull();

      button.setAttribute('variant', 'primary');
      expect(button.variant).toBe('primary');

      // Variant styling handled by CSS attribute selectors
      expect(button.getAttribute('variant')).toBe('primary');
    });

    it('should handle size attribute (static)', () => {
      expect(button.size).toBeNull();

      button.setAttribute('size', 'large');
      expect(button.size).toBe('large');

      // Size styling handled by CSS attribute selectors
      expect(button.getAttribute('size')).toBe('large');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper accessibility setup (transparent wrapper)', () => {
      // Wrapper should be transparent - no role or focusable attributes
      expect(button.getAttribute('role')).toBeNull();
      expect(button.getAttribute('tabindex')).toBe('-1');
    });

    it('should provide accessibility configuration (transparent wrapper)', () => {
      const config = button.getAccessibilityConfig();
      // Wrapper should be transparent to avoid conflicts with native button
      expect(config.role).toBeUndefined();
      expect(config.focusable).toBe(false);
      expect(config.tabIndex).toBe(-1);
    });

    it('should update accessibility on disabled state', () => {
      button.disabled = true;

      const config = button.getAccessibilityConfig();
      // Wrapper remains transparent
      expect(config.focusable).toBe(false);
      expect(config.tabIndex).toBe(-1);

      // Native button should be disabled
      expect(button.nativeButtonElement.disabled).toBe(true);
    });

    it('should handle aria-pressed correctly', () => {
      button.setAttribute('aria-pressed', 'true');
      button.attributeChangedCallback('aria-pressed', null, 'true');
      expect(button.getAttribute('aria-pressed')).toBe('true');

      button.setAttribute('aria-pressed', 'false');
      button.attributeChangedCallback('aria-pressed', 'true', 'false');
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('Event Handling', () => {
    it('should dispatch custom events on click', () => {
      const spy = vi.fn();
      button.addEventListener('ui-button-click', spy);

      button.click();

      expect(spy).toHaveBeenCalledTimes(1);
      const event = spy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail).toBeDefined();
      expect(event.detail.originalEvent).toBeDefined();
      expect(event.detail.variant).toBeNull();
      expect(event.detail.size).toBeNull();
    });

    it('should include variant and size in event detail', () => {
      const spy = vi.fn();
      button.setAttribute('variant', 'primary');
      button.setAttribute('size', 'large');
      button.addEventListener('ui-button-click', spy);

      button.click();

      const event = spy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail.variant).toBe('primary');
      expect(event.detail.size).toBe('large');
    });

    it('should not dispatch events when disabled', () => {
      const spy = vi.fn();
      button.addEventListener('ui-button-click', spy);

      button.disabled = true;
      button.click();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not dispatch events when loading', () => {
      const spy = vi.fn();
      button.addEventListener('ui-button-click', spy);

      button.loading = true;
      button.click();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Enter key', () => {
      const spy = vi.fn();
      button.addEventListener('ui-button-click', spy);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(enterEvent);

      expect(spy).toHaveBeenCalledTimes(1);
      const event = spy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail.triggeredBy).toBe('keyboard');
    });

    it('should handle Space key', () => {
      const spy = vi.fn();
      button.addEventListener('ui-button-click', spy);

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      button.dispatchEvent(spaceEvent);

      expect(spy).toHaveBeenCalledTimes(1);
      const event = spy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail.triggeredBy).toBe('keyboard');
    });

    it('should not handle keyboard when disabled', () => {
      const spy = vi.fn();
      button.addEventListener('ui-button-click', spy);
      button.disabled = true;

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(enterEvent);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Semantic Architecture Benefits', () => {
    it('should have minimal component footprint', () => {
      // Component focuses on behavior, not styling
      expect(button.className).toBe(''); // No utility classes
      expect(button.style.cssText).toBe(''); // No inline styles
    });

    it('should rely on CSS attribute selectors for styling', () => {
      // Variant styling should work through CSS without JavaScript
      button.setAttribute('variant', 'primary');

      // CSS should handle the styling via ui-button[variant="primary"]
      // No classes needed - pure semantic attributes
      expect(button.getAttribute('variant')).toBe('primary');
      expect(button.classList.contains('ui-button--primary')).toBe(false);
    });

    it('should demonstrate clean separation of concerns', () => {
      // JavaScript handles behavior and attributes
      button.disabled = true;
      expect(button.hasAttribute('disabled')).toBe(true);

      // CSS handles presentation via attribute selectors
      button.setAttribute('variant', 'danger');
      button.setAttribute('size', 'small');

      // No JavaScript styling logic needed
      expect(button.classList.length).toBe(0);
    });
  });
});
