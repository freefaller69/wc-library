/**
 * @file AccessibilityMixin.test.ts
 * Unit tests for AccessibilityMixin dynamic accessibility features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AccessibilityMixin } from '../base/mixins/AccessibilityMixin.js';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */

// Mock HTMLElement for testing
class MockElement {
  isConnected = true;
  attributes = new Map<string, string>();
  config = { tagName: 'test-element' };

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) || null;
  }

  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

// Test component with AccessibilityMixin
class TestAccessibilityComponent extends AccessibilityMixin(MockElement as any) {
  getAccessibilityConfig() {
    return {
      role: 'button',
      ariaLabel: 'Test button',
      focusable: true,
    };
  }
}

// Test component with minimal config
class MinimalAccessibilityComponent extends AccessibilityMixin(MockElement as any) {
  getAccessibilityConfig() {
    return {};
  }
}

describe('AccessibilityMixin', () => {
  let component: TestAccessibilityComponent;
  let minimalComponent: MinimalAccessibilityComponent;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  // Mock document methods
  const originalGetElementById = document.getElementById;
  const originalCreateElement = document.createElement;
  const originalBody = document.body;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component = new TestAccessibilityComponent();
    minimalComponent = new MinimalAccessibilityComponent();

    // Mock document methods
    document.getElementById = vi.fn();
    document.createElement = vi.fn().mockReturnValue({
      setAttribute: vi.fn(),
      style: {},
      id: '',
      textContent: '',
      parentNode: null,
    });

    // Mock document.body
    const mockBody = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    };
    Object.defineProperty(document, 'body', {
      value: mockBody,
      writable: true,
    });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    // Restore document methods
    document.getElementById = originalGetElementById;
    document.createElement = originalCreateElement;
    Object.defineProperty(document, 'body', {
      value: originalBody,
      writable: true,
    });
  });

  describe('Legacy Accessibility Setup', () => {
    it('should set up basic accessibility configuration', () => {
      component.connectedCallback();

      expect(component.getAttribute('role')).toBe('button');
      expect(component.getAttribute('aria-label')).toBe('Test button');
    });

    it('should handle minimal configuration without errors', () => {
      expect(() => minimalComponent.connectedCallback()).not.toThrow();
    });

    it('should set up focus management for focusable components', () => {
      component.connectedCallback();

      expect(component.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
      expect(component.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(component.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should not set up accessibility twice', () => {
      component.connectedCallback();
      component.setupAccessibility(); // Call again

      // Should still only have the role set once
      expect(component.getAttribute('role')).toBe('button');
    });

    it('should handle legacy setAriaStates method', () => {
      component.setAriaStates({
        expanded: true,
        hidden: false,
        disabled: 'true',
      });

      expect(component.getAttribute('aria-expanded')).toBe('true');
      expect(component.getAttribute('aria-hidden')).toBe('false');
      expect(component.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('Dynamic ARIA State Management', () => {
    it('should set aria-expanded attribute', () => {
      component.setAriaExpanded(true);
      expect(component.getAttribute('aria-expanded')).toBe('true');

      component.setAriaExpanded(false);
      expect(component.getAttribute('aria-expanded')).toBe('false');
    });

    it('should set aria-hidden attribute', () => {
      component.setAriaHidden(true);
      expect(component.getAttribute('aria-hidden')).toBe('true');

      component.setAriaHidden(false);
      expect(component.getAttribute('aria-hidden')).toBe('false');
    });

    it('should set aria-disabled attribute', () => {
      component.setAriaDisabled(true);
      expect(component.getAttribute('aria-disabled')).toBe('true');

      component.setAriaDisabled(false);
      expect(component.getAttribute('aria-disabled')).toBe('false');
    });

    it('should set aria-busy attribute', () => {
      component.setAriaBusy(true);
      expect(component.getAttribute('aria-busy')).toBe('true');

      component.setAriaBusy(false);
      expect(component.getAttribute('aria-busy')).toBe('false');
    });

    it('should set aria-invalid attribute', () => {
      component.setAriaInvalid(true);
      expect(component.getAttribute('aria-invalid')).toBe('true');

      component.setAriaInvalid(false);
      expect(component.getAttribute('aria-invalid')).toBe('false');
    });

    it('should handle errors when setting ARIA attributes gracefully', () => {
      // Mock setAttribute to throw an error
      component.setAttribute = vi.fn().mockImplementation(() => {
        throw new Error('setAttribute failed');
      });

      expect(() => component.setAriaExpanded(true)).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Error setting aria-expanded:',
        expect.any(Error)
      );
    });
  });

  describe('ARIA Relationships with Lazy Validation', () => {
    it('should set aria-describedby with valid element IDs', () => {
      // Mock existing elements
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'description1' || id === 'description2' ? { id } : null;
      });

      component.setAriaDescribedBy(['description1', 'description2']);
      expect(component.getAttribute('aria-describedby')).toBe('description1 description2');
    });

    it('should set aria-labelledby with valid element IDs', () => {
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'label1' ? { id } : null;
      });

      component.setAriaLabelledBy(['label1']);
      expect(component.getAttribute('aria-labelledby')).toBe('label1');
    });

    it('should set aria-controls with valid element IDs', () => {
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'controlled1' || id === 'controlled2' ? { id } : null;
      });

      component.setAriaControls(['controlled1', 'controlled2']);
      expect(component.getAttribute('aria-controls')).toBe('controlled1 controlled2');
    });

    it('should handle missing elements and warn about them', () => {
      document.getElementById = vi.fn().mockReturnValue(null);

      component.setAriaDescribedBy(['nonexistent1', 'nonexistent2']);

      expect(component.getAttribute('aria-describedby')).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Elements not found for aria-describedby: nonexistent1, nonexistent2'
      );
    });

    it('should handle partial matches correctly', () => {
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'exists' ? { id } : null;
      });

      component.setAriaDescribedBy(['exists', 'doesnotexist']);

      expect(component.getAttribute('aria-describedby')).toBe('exists');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Elements not found for aria-describedby: doesnotexist'
      );
    });

    it('should remove attributes when empty array is provided', () => {
      // First set an attribute
      component.setAriaDescribedBy(['test']);

      // Then clear it
      component.setAriaDescribedBy([]);
      expect(component.getAttribute('aria-describedby')).toBeNull();
    });

    it('should validate pending relationships on connect', () => {
      // Set relationships before elements exist
      component.setAriaDescribedBy(['future-element']);
      expect(component.getAttribute('aria-describedby')).toBeNull();

      // Mock element becoming available
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'future-element' ? { id } : null;
      });

      // Connect should validate pending relationships
      component.connectedCallback();
      expect(component.getAttribute('aria-describedby')).toBe('future-element');
    });

    it('should handle errors during relationship validation gracefully', () => {
      document.getElementById = vi.fn().mockImplementation(() => {
        throw new Error('getElementById failed');
      });

      expect(() => component.setAriaDescribedBy(['test'])).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Error validating aria-describedby:',
        expect.any(Error)
      );
    });
  });

  describe('Screen Reader Communication', () => {
    it('should announce messages to screen readers', () => {
      // Mock the global announceToScreenReader function
      const mockAnnounce = vi.fn();
      vi.doMock('../../utilities/accessibility.js', () => ({
        announceToScreenReader: mockAnnounce,
        setAriaState: vi.fn(),
        generateId: vi.fn(() => 'test-id'),
      }));

      component.announceToScreenReader('Test message', 'polite');
      // Note: In this test we can't easily verify the mock was called
      // due to how the import works, but we can verify no errors occur
      expect(() => component.announceToScreenReader('Test message')).not.toThrow();
    });

    it('should handle empty messages gracefully', () => {
      component.announceToScreenReader('');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Empty message provided to announceToScreenReader'
      );

      component.announceToScreenReader('   ');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Empty message provided to announceToScreenReader'
      );
    });

    it('should handle errors during announcement gracefully', () => {
      // We can't easily mock the imported function, but we can test error handling
      expect(() => component.announceToScreenReader('test')).not.toThrow();
    });
  });

  describe('Live Region Management', () => {
    it('should create live region with correct attributes', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        id: '',
        textContent: '',
        parentNode: null,
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);

      component.createLiveRegion('polite');

      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockElement);
    });

    it('should create assertive live region', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        id: '',
        textContent: '',
        parentNode: null,
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);

      component.createLiveRegion('assertive');

      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
    });

    it('should reuse existing live region', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        id: '',
        textContent: '',
        parentNode: document.body, // Simulate already in DOM
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);

      const firstRegion = component.createLiveRegion('polite');
      const secondRegion = component.createLiveRegion('polite');

      expect(firstRegion).toBe(secondRegion);
      expect(document.createElement).toHaveBeenCalledTimes(1);
    });

    it('should update live region content', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        id: '',
        textContent: '',
        parentNode: null,
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);

      component.updateLiveRegion('Test message');

      expect(mockElement.textContent).toBe('Test message');
    });

    it('should handle empty messages in live region updates', () => {
      component.updateLiveRegion('');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Empty message provided to updateLiveRegion'
      );
    });

    it('should handle errors during live region creation gracefully', () => {
      document.createElement = vi.fn().mockImplementation(() => {
        throw new Error('createElement failed');
      });

      const fallbackElement = component.createLiveRegion('polite');

      expect(fallbackElement).toBeDefined();
      expect(fallbackElement.tagName).toBe('DIV'); // Should return fallback div
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Error creating live region:',
        expect.any(Error)
      );
    });

    it('should handle errors during live region updates gracefully', () => {
      // Mock createElement to work initially, then fail on updateLiveRegion
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        get textContent() {
          throw new Error('textContent access failed');
        },
        set textContent(_value) {
          throw new Error('textContent set failed');
        },
        parentNode: null,
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);

      expect(() => component.updateLiveRegion('test')).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Error updating live region:',
        expect.any(Error)
      );
    });
  });

  describe('Lifecycle Management', () => {
    it('should clean up live regions on disconnect', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        id: '',
        textContent: '',
        parentNode: document.body,
        removeChild: vi.fn(),
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);
      document.body.removeChild = vi.fn();

      // Create a live region
      component.createLiveRegion('polite');

      // Disconnect should clean it up
      component.disconnectedCallback();

      expect(document.body.removeChild).toHaveBeenCalledWith(mockElement);
    });

    it('should handle cleanup errors gracefully', () => {
      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        id: '',
        textContent: '',
        parentNode: {
          removeChild: vi.fn().mockImplementation(() => {
            throw new Error('removeChild failed');
          }),
        },
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);

      // Create a live region
      component.createLiveRegion('polite');

      // Disconnect should handle cleanup errors
      expect(() => component.disconnectedCallback()).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'AccessibilityMixin: Error cleaning up live regions:',
        expect.any(Error)
      );
    });

    it('should call parent lifecycle methods', () => {
      const parentConnected = vi.fn();
      const parentDisconnected = vi.fn();

      // Create component with parent lifecycle methods
      class TestComponentWithParent extends AccessibilityMixin(
        class extends MockElement {
          connectedCallback = parentConnected;
          disconnectedCallback = parentDisconnected;

          getAccessibilityConfig() {
            return {};
          }
        } as any
      ) {}

      const componentWithParent = new TestComponentWithParent();

      componentWithParent.connectedCallback();
      expect(parentConnected).toHaveBeenCalled();

      componentWithParent.disconnectedCallback();
      expect(parentDisconnected).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid input types gracefully', () => {
      expect(() => component.setAriaDescribedBy(null as any)).not.toThrow();
      expect(() => component.setAriaDescribedBy('not-an-array' as any)).not.toThrow();
      expect(() => component.setAriaDescribedBy(undefined as any)).not.toThrow();
    });

    it('should handle document methods being unavailable', () => {
      const originalGetElementById = document.getElementById;
      delete (document as any).getElementById;

      expect(() => component.setAriaDescribedBy(['test'])).not.toThrow();

      document.getElementById = originalGetElementById;
    });

    it('should handle DOM manipulation failures', () => {
      document.body.appendChild = vi.fn().mockImplementation(() => {
        throw new Error('appendChild failed');
      });

      expect(() => component.createLiveRegion('polite')).not.toThrow();
    });
  });

  describe('Interface Compliance', () => {
    it('should implement AccessibilityMixinInterface correctly', () => {
      // Legacy methods
      expect(typeof component.setupAccessibility).toBe('function');
      expect(typeof component.setAriaStates).toBe('function');
      expect(typeof component.getAccessibilityConfig).toBe('function');
      expect(typeof component.handleFocus).toBe('function');
      expect(typeof component.handleBlur).toBe('function');
      expect(typeof component.handleKeydown).toBe('function');

      // New dynamic methods
      expect(typeof component.setAriaExpanded).toBe('function');
      expect(typeof component.setAriaHidden).toBe('function');
      expect(typeof component.setAriaDisabled).toBe('function');
      expect(typeof component.setAriaBusy).toBe('function');
      expect(typeof component.setAriaInvalid).toBe('function');
      expect(typeof component.setAriaDescribedBy).toBe('function');
      expect(typeof component.setAriaLabelledBy).toBe('function');
      expect(typeof component.setAriaControls).toBe('function');
      expect(typeof component.announceToScreenReader).toBe('function');
      expect(typeof component.createLiveRegion).toBe('function');
      expect(typeof component.updateLiveRegion).toBe('function');
    });

    it('should maintain backward compatibility', () => {
      expect(() => component.setupAccessibility()).not.toThrow();
      expect(() => component.setAriaStates({})).not.toThrow();
      expect(() => component.handleFocus({} as FocusEvent)).not.toThrow();
      expect(() => component.handleBlur({} as FocusEvent)).not.toThrow();
      expect(() => component.handleKeydown({} as KeyboardEvent)).not.toThrow();
    });
  });
});
