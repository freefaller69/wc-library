/**
 * UIButton Component Tests
 * Tests for mixin composition, accessibility, events, and state management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIButton, type UIButtonClickEventDetail } from './ui-button.js';

describe('UIButton - Interactive Component', () => {
  let button: UIButton;

  beforeEach(() => {
    button = new UIButton();
    document.body.appendChild(button);
  });

  afterEach(() => {
    if (button.parentNode) {
      button.remove();
    }
    vi.clearAllMocks();
  });

  describe('Component Registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('ui-button')).toBeDefined();
    });

    it('should create an instance', () => {
      expect(button).toBeInstanceOf(UIButton);
      expect(button).toBeInstanceOf(HTMLElement);
    });

    it('should have correct tag name', () => {
      expect(button.tagName.toLowerCase()).toBe('ui-button');
    });
  });

  describe('Mixin Composition', () => {
    it('should have observedAttributes from configuration', () => {
      const observedAttrs = UIButton.observedAttributes;
      expect(observedAttrs).toContain('disabled');
      expect(observedAttrs).toContain('loading');
      expect(observedAttrs).toContain('aria-pressed');
      // Static attributes should not be observed
      expect(observedAttrs).not.toContain('variant');
      expect(observedAttrs).not.toContain('size');
    });

    it('should initialize with component ID', () => {
      expect(button.id).toBeTruthy();
      expect(button.getAttribute('data-ui-component')).toBe('ui-button');
    });
  });

  describe('Accessibility Configuration', () => {
    it('should have proper accessibility config by default (transparent wrapper)', () => {
      const config = button.getAccessibilityConfig();
      // Wrapper should be transparent to avoid conflicts with native button
      expect(config.role).toBeUndefined();
      expect(config.focusable).toBe(false);
      expect(config.tabIndex).toBe(-1);
    });

    it('should have transparent wrapper with no ARIA attributes', () => {
      // Wrapper should not have accessibility attributes - native button handles this
      expect(button.getAttribute('role')).toBeNull();
      expect(button.getAttribute('tabindex')).toBe('-1');
    });

    it('should delegate ARIA attributes to native button when disabled', () => {
      button.disabled = true;

      // Wrapper config should remain transparent
      const config = button.getAccessibilityConfig();
      expect(config.focusable).toBe(false);
      expect(config.tabIndex).toBe(-1);

      // Native button should have proper disabled state
      expect(button.nativeButtonElement.disabled).toBe(true);
      expect(button.nativeButtonElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should delegate custom aria-label to native button', () => {
      button.setAttribute('aria-label', 'Custom Button Label');

      // Trigger the accessibility update to delegate the attribute
      button.updateAccessibilityState();

      // Wrapper should keep the aria-label attribute (for API consistency)
      expect(button.getAttribute('aria-label')).toBe('Custom Button Label');

      // Native button should receive the delegated aria-label
      expect(button.nativeButtonElement.getAttribute('aria-label')).toBe('Custom Button Label');
    });
  });

  describe('Attribute Management', () => {
    it('should handle disabled attribute', () => {
      expect(button.disabled).toBe(false);

      button.disabled = true;
      expect(button.disabled).toBe(true);
      expect(button.hasAttribute('disabled')).toBe(true);

      button.disabled = false;
      expect(button.disabled).toBe(false);
      expect(button.hasAttribute('disabled')).toBe(false);
    });

    it('should handle loading attribute', () => {
      expect(button.loading).toBe(false);

      button.loading = true;
      expect(button.loading).toBe(true);
      expect(button.hasAttribute('loading')).toBe(true);

      button.loading = false;
      expect(button.loading).toBe(false);
      expect(button.hasAttribute('loading')).toBe(false);
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

  describe.skip('State Class Management', () => {
    it('should apply disabled state class', () => {
      button.disabled = true;
      expect(button.classList.contains('ui-button--disabled')).toBe(true);

      button.disabled = false;
      expect(button.classList.contains('ui-button--disabled')).toBe(false);
    });

    it('should apply loading state class', () => {
      button.loading = true;
      expect(button.classList.contains('ui-button--loading')).toBe(true);

      button.loading = false;
      expect(button.classList.contains('ui-button--loading')).toBe(false);
    });

    it('should apply pressed state class', () => {
      button.setAttribute('aria-pressed', 'true');
      // Trigger attribute change callback
      button.attributeChangedCallback('aria-pressed', null, 'true');
      expect(button.classList.contains('ui-button--pressed')).toBe(true);

      button.setAttribute('aria-pressed', 'false');
      button.attributeChangedCallback('aria-pressed', 'true', 'false');
      expect(button.classList.contains('ui-button--pressed')).toBe(false);
    });

    it('should apply variant classes', () => {
      button.setAttribute('variant', 'primary');
      button.connectedCallback(); // Re-render
      expect(button.classList.contains('ui-button--primary')).toBe(true);

      button.setAttribute('variant', 'secondary');
      button.connectedCallback(); // Re-render
      expect(button.classList.contains('ui-button--secondary')).toBe(true);
      expect(button.classList.contains('ui-button--primary')).toBe(false);
    });

    it('should apply size classes', () => {
      button.setAttribute('size', 'large');
      button.connectedCallback(); // Re-render
      expect(button.classList.contains('ui-button--large')).toBe(true);

      button.setAttribute('size', 'small');
      button.connectedCallback(); // Re-render
      expect(button.classList.contains('ui-button--small')).toBe(true);
      expect(button.classList.contains('ui-button--large')).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should dispatch custom event on click', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);

      button.click();

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail).toMatchObject({
        variant: null,
        size: null,
      });
      expect(event.detail.originalEvent).toBeDefined();
    });

    it('should include variant and size in event detail', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);
      button.setAttribute('variant', 'primary');
      button.setAttribute('size', 'large');

      button.click();

      const event = eventSpy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail.variant).toBe('primary');
      expect(event.detail.size).toBe('large');
    });

    it('should not dispatch event when disabled', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);
      button.disabled = true;

      button.click();

      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should not dispatch event when loading', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);
      button.loading = true;

      button.click();

      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should handle keyboard events (Enter)', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(enterEvent);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail.triggeredBy).toBe('keyboard');
    });

    it('should handle keyboard events (Space)', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      button.dispatchEvent(spaceEvent);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail.triggeredBy).toBe('keyboard');
    });

    it('should not handle keyboard events when disabled', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);
      button.disabled = true;

      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      button.dispatchEvent(enterEvent);

      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('should not handle keyboard events when loading', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);
      button.loading = true;

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      button.dispatchEvent(spaceEvent);

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('Public API', () => {
    it('should have click method that respects disabled state', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);

      button.click();
      expect(eventSpy).toHaveBeenCalledTimes(1);

      button.disabled = true;
      button.click();
      expect(eventSpy).toHaveBeenCalledTimes(1); // Should not increment
    });

    it('should have focus method that respects disabled state', () => {
      const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');

      button.focus();
      expect(focusSpy).toHaveBeenCalledTimes(1);

      button.disabled = true;
      button.focus();
      expect(focusSpy).toHaveBeenCalledTimes(1); // Should not increment

      focusSpy.mockRestore();
    });

    it('should have getter/setter for disabled property', () => {
      expect(button.disabled).toBe(false);

      button.disabled = true;
      expect(button.disabled).toBe(true);
      expect(button.hasAttribute('disabled')).toBe(true);

      button.disabled = false;
      expect(button.disabled).toBe(false);
      expect(button.hasAttribute('disabled')).toBe(false);
    });

    it('should have getter/setter for loading property', () => {
      expect(button.loading).toBe(false);

      button.loading = true;
      expect(button.loading).toBe(true);
      expect(button.hasAttribute('loading')).toBe(true);

      button.loading = false;
      expect(button.loading).toBe(false);
      expect(button.hasAttribute('loading')).toBe(false);
    });

    it('should have getter for variant property', () => {
      expect(button.variant).toBeNull();

      button.setAttribute('variant', 'danger');
      expect(button.variant).toBe('danger');
    });

    it('should have getter for size property', () => {
      expect(button.size).toBeNull();

      button.setAttribute('size', 'small');
      expect(button.size).toBe('small');
    });
  });

  describe('Content and Slots', () => {
    it('should support text content', () => {
      button.textContent = 'Click me';
      expect(button.textContent).toBe('Click me');
    });

    it('should support HTML content', () => {
      button.innerHTML = '<span>Button <strong>Text</strong></span>';
      expect(button.innerHTML).toBe('<span>Button <strong>Text</strong></span>');
    });

    it('should support slotted content via innerHTML (simulated)', () => {
      // Note: JSDOM has limited slot support, so we test the pattern
      button.innerHTML = '<icon slot="start">📧</icon>Send Email';
      expect(button.innerHTML).toContain('slot="start"');
      expect(button.innerHTML).toContain('Send Email');
    });
  });

  describe('Attribute Change Handling', () => {
    it.skip('should handle disabled attribute changes', () => {
      button.setAttribute('disabled', '');
      button.attributeChangedCallback('disabled', null, '');

      expect(button.classList.contains('ui-button--disabled')).toBe(true);
      expect(button.getAttribute('tabindex')).toBe('-1');
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it.skip('should handle loading attribute changes', () => {
      button.setAttribute('loading', '');
      button.attributeChangedCallback('loading', null, '');

      expect(button.classList.contains('ui-button--loading')).toBe(true);
    });

    it.skip('should handle aria-pressed attribute changes', () => {
      button.attributeChangedCallback('aria-pressed', null, 'true');

      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(button.classList.contains('ui-button--pressed')).toBe(true);
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup properly on connection with transparent wrapper', () => {
      const newButton = new UIButton();
      document.body.appendChild(newButton);

      // Wrapper should be transparent
      expect(newButton.getAttribute('role')).toBeNull();
      expect(newButton.getAttribute('tabindex')).toBe('-1');

      // Native button should be properly set up
      expect(newButton.nativeButtonElement).toBeDefined();
      expect(newButton.nativeButtonElement.tagName).toBe('BUTTON');

      newButton.remove();
    });

    it.skip('should handle variant and size on connection', () => {
      const newButton = new UIButton();
      newButton.setAttribute('variant', 'primary');
      newButton.setAttribute('size', 'large');
      document.body.appendChild(newButton);

      expect(newButton.classList.contains('ui-button--primary')).toBe(true);
      expect(newButton.classList.contains('ui-button--large')).toBe(true);

      newButton.remove();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing event details gracefully', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);

      // Simulate direct click without proper setup
      button.click();

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(
        (eventSpy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>).detail
      ).toBeDefined();
    });

    it.skip('should handle rapid state changes', () => {
      // Rapid enable/disable should work correctly
      button.disabled = true;
      button.disabled = false;
      button.disabled = true;

      expect(button.disabled).toBe(true);
      expect(button.classList.contains('ui-button--disabled')).toBe(true);
    });
  });
});
