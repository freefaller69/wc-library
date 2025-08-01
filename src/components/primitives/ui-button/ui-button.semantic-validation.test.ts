/**
 * UIButton Semantic Validation Tests
 * Tests for the NEW clean, semantic button implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIButton, type UIButtonClickEventDetail } from './ui-button.js';

describe('UIButton - Semantic Validation', () => {
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

  describe('Native Button Integration', () => {
    it('should create and wrap a native button element', () => {
      expect(customElements.get('ui-button')).toBeDefined();
      expect(button).toBeInstanceOf(UIButton);

      // Should have native button inside
      const nativeButton = button.querySelector('button');
      expect(nativeButton).toBeInstanceOf(HTMLButtonElement);
      expect(nativeButton?.getAttribute('part')).toBe('button');
    });

    it('should delegate focus to native button', () => {
      const nativeButton = button.nativeButtonElement;
      const focusSpy = vi.spyOn(nativeButton, 'focus');

      button.focus();
      expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should delegate click to native button', () => {
      const nativeButton = button.nativeButtonElement;
      const clickSpy = vi.spyOn(nativeButton, 'click');

      button.click();
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Attribute-Based Styling', () => {
    it('should use attributes for variant styling (no classes)', () => {
      button.variant = 'primary';

      // Should have attribute, no classes
      expect(button.getAttribute('variant')).toBe('primary');
      expect(button.classList.contains('ui-button--primary')).toBe(false);
      expect(button.className).toBe(''); // No utility classes
    });

    it('should use attributes for size styling (no classes)', () => {
      button.size = 'large';

      // Should have attribute, no classes
      expect(button.getAttribute('size')).toBe('large');
      expect(button.classList.contains('ui-button--large')).toBe(false);
      expect(button.className).toBe(''); // No utility classes
    });

    it('should keep DOM clean with minimal JavaScript footprint', () => {
      button.disabled = true;
      button.loading = true;
      button.variant = 'danger';
      button.size = 'small';

      // All styling handled via attributes + CSS
      expect(button.style.cssText).toBe(''); // No inline styles
      expect(button.classList.length).toBe(0); // No CSS classes
    });
  });

  describe('Native Button State Synchronization', () => {
    it('should sync disabled state to native button', () => {
      const nativeButton = button.nativeButtonElement;

      button.disabled = true;
      expect(nativeButton.disabled).toBe(true);

      button.disabled = false;
      expect(nativeButton.disabled).toBe(false);
    });

    it('should sync type attribute to native button', () => {
      const nativeButton = button.nativeButtonElement;

      button.type = 'submit';
      expect(nativeButton.type).toBe('submit');

      button.type = 'reset';
      expect(nativeButton.type).toBe('reset');
    });

    it('should handle loading state affecting disabled', () => {
      const nativeButton = button.nativeButtonElement;

      button.loading = true;
      expect(nativeButton.disabled).toBe(true);

      // Should stay disabled even if disabled=false when loading=true
      button.disabled = false;
      expect(nativeButton.disabled).toBe(true);

      button.loading = false;
      expect(nativeButton.disabled).toBe(false);
    });
  });

  describe('Enhanced Event Dispatching', () => {
    it('should dispatch custom events with context', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);
      button.variant = 'primary';
      button.size = 'large';

      button.click();

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0] as CustomEvent<UIButtonClickEventDetail>;
      expect(event.detail).toMatchObject({
        variant: 'primary',
        size: 'large',
      });
      expect(event.detail.originalEvent).toBeDefined();
    });

    it('should not dispatch events when disabled or loading', () => {
      const eventSpy = vi.fn();
      button.addEventListener('ui-button-click', eventSpy);

      button.disabled = true;
      button.click();
      expect(eventSpy).not.toHaveBeenCalled();

      button.disabled = false;
      button.loading = true;
      button.click();
      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('Light DOM Content Projection', () => {
    it('should move content directly to native button', () => {
      // Create a new button with initial content (before connection)
      const newButton = new UIButton();
      newButton.textContent = 'Button Text';
      document.body.appendChild(newButton);

      const nativeButton = newButton.nativeButtonElement;
      expect(nativeButton.textContent).toBe('Button Text');
      expect(nativeButton.innerHTML).toContain('Button Text');

      newButton.remove();
    });

    it('should support complex content', () => {
      button.innerHTML = '<span>📧</span> Send Email';

      expect(button.textContent).toContain('Send Email');
      expect(button.innerHTML).toContain('📧');
    });
  });

  describe('Public API', () => {
    it('should provide property getters/setters', () => {
      // Test disabled
      expect(button.disabled).toBe(false);
      button.disabled = true;
      expect(button.disabled).toBe(true);

      // Test loading
      expect(button.loading).toBe(false);
      button.loading = true;
      expect(button.loading).toBe(true);

      // Test variant
      expect(button.variant).toBeNull();
      button.variant = 'primary';
      expect(button.variant).toBe('primary');

      // Test size
      expect(button.size).toBeNull();
      button.size = 'large';
      expect(button.size).toBe('large');

      // Test type
      expect(button.type).toBe('button');
      button.type = 'submit';
      expect(button.type).toBe('submit');
    });

    it('should provide access to native button element', () => {
      const nativeButton = button.nativeButtonElement;
      expect(nativeButton).toBeInstanceOf(HTMLButtonElement);
      expect(nativeButton.tagName).toBe('BUTTON');
    });
  });

  describe('Semantic Architecture Benefits', () => {
    it('should demonstrate clean separation of concerns', () => {
      // Component handles attributes and event enhancement
      button.variant = 'danger';
      button.disabled = true;

      // CSS handles all presentation via attribute selectors
      expect(button.getAttribute('variant')).toBe('danger');
      expect(button.hasAttribute('disabled')).toBe(true);

      // No JavaScript styling logic needed
      expect(button.classList.length).toBe(0);
      expect(button.style.cssText).toBe('');
    });

    it('should leverage native browser accessibility', () => {
      const nativeButton = button.nativeButtonElement;

      // Native button handles all accessibility automatically
      // Note: In JSDOM, role is null, not empty string
      expect(nativeButton.role || '').toBe(''); // No role needed - it's a button!
      expect(nativeButton.tabIndex).toBe(0); // Native focusable

      button.disabled = true;
      expect(nativeButton.disabled).toBe(true); // Native disabled behavior
    });
  });
});
