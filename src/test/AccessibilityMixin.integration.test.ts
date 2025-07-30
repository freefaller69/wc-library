/**
 * @file AccessibilityMixin.integration.test.ts
 * Integration tests for AccessibilityMixin with other mixins and real-world patterns
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AccessibilityMixin } from '../base/mixins/AccessibilityMixin.js';

// Mock element for testing
class MockElement {
  isConnected = true;
  attributes = new Map<string, string>();
  config = {
    tagName: 'test-element',
  };

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

// Real-world dropdown component pattern
class DropdownComponent extends AccessibilityMixin(
  MockElement as unknown as new () => HTMLElement & {
    connectedCallback(): void;
    disconnectedCallback(): void;
  }
) {
  private _isOpen = false;
  private _menuId = 'dropdown-menu-1';

  constructor() {
    super();
    // Set initial ARIA states
    this.setAriaExpanded(false);
  }

  getAccessibilityConfig() {
    return {
      role: 'button',
      ariaLabel: 'Open dropdown menu',
      tabIndex: 0,
      focusable: true,
    };
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  set isOpen(value: boolean) {
    this._isOpen = value;
    this.setAriaExpanded(value);
    if (value) {
      this.setAriaControls([this._menuId]);
    } else {
      this.setAriaControls([]);
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.announceToScreenReader(this.isOpen ? 'Menu opened' : 'Menu closed', 'polite');
  }
}

// Form component with validation
class FormFieldComponent extends AccessibilityMixin(
  MockElement as unknown as new () => HTMLElement & {
    connectedCallback(): void;
    disconnectedCallback(): void;
  }
) {
  private _hasError = false;
  private _isLoading = false;
  private _errorMessageId = 'error-message-1';

  constructor() {
    super();
    // Set initial ARIA states
    this.setAriaInvalid(false);
    this.setAriaBusy(false);
  }

  getAccessibilityConfig() {
    return {
      role: 'textbox',
      ariaLabel: 'Email address',
    };
  }

  get hasError(): boolean {
    return this._hasError;
  }

  set hasError(value: boolean) {
    this._hasError = value;
    this.setAriaInvalid(value);
    if (value) {
      this.setAriaDescribedBy([this._errorMessageId]);
    } else {
      this.setAriaDescribedBy([]);
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
    this.setAriaBusy(value);
  }

  async validate(): Promise<void> {
    this.isLoading = true;
    try {
      // Simulate async validation
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.hasError = false;
      this.announceToScreenReader('Validation successful', 'polite');
    } catch {
      this.hasError = true;
      this.announceToScreenReader('Validation failed', 'assertive');
    } finally {
      this.isLoading = false;
    }
  }
}

// Modal/Dialog component pattern
class ModalComponent extends AccessibilityMixin(
  MockElement as unknown as new () => HTMLElement & {
    connectedCallback(): void;
    disconnectedCallback(): void;
  }
) {
  private _isVisible = false;
  private _titleId = 'modal-title-1';
  private _descriptionId = 'modal-description-1';

  constructor() {
    super();
    // Set initial ARIA states (modal starts hidden)
    this.setAriaHidden(true);
  }

  getAccessibilityConfig() {
    return {
      role: 'dialog',
      tabIndex: -1,
    };
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  set isVisible(value: boolean) {
    this._isVisible = value;
    this.setAriaHidden(!value);
    if (value) {
      this.setAriaLabelledBy([this._titleId]);
      this.setAriaDescribedBy([this._descriptionId]);
    }
  }

  show(): void {
    this.isVisible = true;
    this.announceToScreenReader('Dialog opened', 'assertive');
  }

  hide(): void {
    this.isVisible = false;
    this.announceToScreenReader('Dialog closed', 'polite');
  }
}

// Component with multiple live regions
class StatusComponent extends AccessibilityMixin(
  MockElement as unknown as new () => HTMLElement & {
    connectedCallback(): void;
    disconnectedCallback(): void;
  }
) {
  getAccessibilityConfig() {
    return {
      role: 'status',
    };
  }

  showError(message: string): void {
    const errorRegion = this.createLiveRegion('assertive');
    errorRegion.textContent = `Error: ${message}`;
  }

  showSuccess(message: string): void {
    const successRegion = this.createLiveRegion('polite');
    successRegion.textContent = `Success: ${message}`;
  }

  updateStatus(message: string): void {
    this.updateLiveRegion(message);
  }
}

describe('AccessibilityMixin Integration', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  // Mock document methods
  const originalGetElementById = document.getElementById.bind(document);
  const originalCreateElement = document.createElement.bind(document);
  const originalBody = document.body;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

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

  describe('Dropdown Component Pattern', () => {
    it('should handle dropdown state changes correctly', () => {
      const dropdown = new DropdownComponent();

      // Mock dropdown menu element exists
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'dropdown-menu-1' ? { id } : null;
      });

      dropdown.connectedCallback();

      // Initial closed state
      expect(dropdown.getAttribute('aria-expanded')).toBe('false');
      expect(dropdown.getAttribute('aria-controls')).toBeNull();

      // Open the dropdown
      dropdown.isOpen = true;
      expect(dropdown.getAttribute('aria-expanded')).toBe('true');
      expect(dropdown.getAttribute('aria-controls')).toBe('dropdown-menu-1');

      // Close the dropdown
      dropdown.isOpen = false;
      expect(dropdown.getAttribute('aria-expanded')).toBe('false');
      expect(dropdown.getAttribute('aria-controls')).toBeNull();
    });

    it('should announce state changes to screen readers', () => {
      const dropdown = new DropdownComponent();

      expect(() => dropdown.toggle()).not.toThrow();
      expect(() => dropdown.toggle()).not.toThrow();
    });

    it('should maintain accessibility configuration', () => {
      const dropdown = new DropdownComponent();
      dropdown.connectedCallback();

      expect(dropdown.getAttribute('role')).toBe('button');
      expect(dropdown.getAttribute('aria-label')).toBe('Open dropdown menu');
      expect(dropdown.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('Form Field Component Pattern', () => {
    it('should handle validation states correctly', () => {
      const formField = new FormFieldComponent();
      formField.connectedCallback();

      // Mock error element exists
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'error-message-1' ? { id } : null;
      });

      // Initial valid state
      expect(formField.getAttribute('aria-invalid')).toBe('false');
      expect(formField.getAttribute('aria-describedby')).toBeNull();

      // Set error state
      formField.hasError = true;
      expect(formField.getAttribute('aria-invalid')).toBe('true');
      expect(formField.getAttribute('aria-describedby')).toBe('error-message-1');

      // Clear error state
      formField.hasError = false;
      expect(formField.getAttribute('aria-invalid')).toBe('false');
      expect(formField.getAttribute('aria-describedby')).toBeNull();
    });

    it('should handle loading states correctly', () => {
      const formField = new FormFieldComponent();

      formField.isLoading = true;
      expect(formField.getAttribute('aria-busy')).toBe('true');

      formField.isLoading = false;
      expect(formField.getAttribute('aria-busy')).toBe('false');
    });

    it('should handle async validation workflow', async () => {
      const formField = new FormFieldComponent();

      const validationPromise = formField.validate();

      // Should be loading during validation
      expect(formField.isLoading).toBe(true);

      await validationPromise;

      // Should not be loading after validation
      expect(formField.isLoading).toBe(false);
      expect(formField.hasError).toBe(false);
    });
  });

  describe('Modal Component Pattern', () => {
    it('should handle modal visibility correctly', () => {
      const modal = new ModalComponent();
      modal.connectedCallback();

      // Mock modal elements exist
      document.getElementById = vi.fn().mockImplementation((id) => {
        return ['modal-title-1', 'modal-description-1'].includes(id as string) ? { id } : null;
      });

      // Initial hidden state
      expect(modal.getAttribute('aria-hidden')).toBe('true');

      // Show modal
      modal.show();
      expect(modal.getAttribute('aria-hidden')).toBe('false');
      expect(modal.getAttribute('aria-labelledby')).toBe('modal-title-1');
      expect(modal.getAttribute('aria-describedby')).toBe('modal-description-1');

      // Hide modal
      modal.hide();
      expect(modal.getAttribute('aria-hidden')).toBe('true');
    });

    it('should announce modal state changes', () => {
      const modal = new ModalComponent();

      expect(() => modal.show()).not.toThrow();
      expect(() => modal.hide()).not.toThrow();
    });

    it('should maintain dialog role and configuration', () => {
      const modal = new ModalComponent();
      modal.connectedCallback();

      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('Status Component with Multiple Live Regions', () => {
    it('should create separate live regions for different priorities', () => {
      const status = new StatusComponent();

      // Create elements for both priorities
      const politeElement = { setAttribute: vi.fn(), style: {}, textContent: '', parentNode: null };
      const assertiveElement = {
        setAttribute: vi.fn(),
        style: {},
        textContent: '',
        parentNode: null,
      };

      document.createElement = vi
        .fn()
        .mockReturnValueOnce(politeElement)
        .mockReturnValueOnce(assertiveElement);

      status.showSuccess('Operation completed');
      status.showError('Operation failed');

      expect(politeElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(assertiveElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(politeElement.textContent).toBe('Success: Operation completed');
      expect(assertiveElement.textContent).toBe('Error: Operation failed');
    });

    it('should update default live region', () => {
      const status = new StatusComponent();

      const mockElement = {
        setAttribute: vi.fn(),
        style: {},
        textContent: '',
        parentNode: null,
      };

      document.createElement = vi.fn().mockReturnValue(mockElement);

      status.updateStatus('Status updated');

      expect(mockElement.textContent).toBe('Status updated');
    });
  });

  describe('Cross-Mixin Integration Patterns', () => {
    it('should work with components that have multiple mixins', () => {
      // Simulate a component that might use multiple mixins
      class ComplexComponent extends AccessibilityMixin(
        MockElement as unknown as new () => HTMLElement & {
          connectedCallback(): void;
          disconnectedCallback(): void;
        }
      ) {
        private _updateCount = 0;

        getAccessibilityConfig() {
          return {
            role: 'application',
            ariaLabel: 'Complex widget',
          };
        }

        // Simulate UpdateManagerMixin integration
        requestUpdate(): void {
          this._updateCount++;
        }

        // Simulate method that would use multiple mixin features
        performComplexOperation(): void {
          this.setAriaBusy(true);
          this.announceToScreenReader('Processing...', 'polite');

          // Simulate async operation
          setTimeout(() => {
            this.setAriaBusy(false);
            this.announceToScreenReader('Operation complete', 'polite');
          }, 100);
        }
      }

      const complex = new ComplexComponent();
      complex.connectedCallback();

      expect(complex.getAttribute('role')).toBe('application');
      expect(() => complex.performComplexOperation()).not.toThrow();
    });

    it('should handle components without getAccessibilityConfig gracefully', () => {
      // Test edge case where abstract method might not be properly implemented
      class IncompleteComponent extends AccessibilityMixin(
        MockElement as unknown as new () => HTMLElement & {
          connectedCallback(): void;
          disconnectedCallback(): void;
        }
      ) {
        getAccessibilityConfig() {
          return {}; // Minimal config
        }
      }

      const incomplete = new IncompleteComponent();
      expect(() => incomplete.connectedCallback()).not.toThrow();
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should handle rapid state changes without errors', () => {
      const dropdown = new DropdownComponent();

      // Rapid state changes (common in user interactions)
      for (let i = 0; i < 10; i++) {
        expect(() => dropdown.toggle()).not.toThrow();
      }
    });

    it('should handle cleanup with multiple components', () => {
      const components = [
        new DropdownComponent(),
        new FormFieldComponent(),
        new ModalComponent(),
        new StatusComponent(),
      ];

      // Connect all components
      components.forEach((component) => {
        expect(() => component.connectedCallback()).not.toThrow();
      });

      // Create live regions for some components
      components[2].createLiveRegion('polite');
      components[3].createLiveRegion('assertive');

      // Disconnect all components should clean up properly
      components.forEach((component) => {
        expect(() => component.disconnectedCallback()).not.toThrow();
      });
    });

    it('should handle edge cases with DOM manipulation failures', () => {
      const status = new StatusComponent();

      // Mock DOM failures for createElement
      document.createElement = vi.fn().mockImplementation(() => {
        throw new Error('DOM manipulation failed');
      });

      // createLiveRegion should handle the error and return a fallback
      expect(() => {
        const region = status.createLiveRegion('assertive');
        expect(region).toBeDefined();
      }).not.toThrow();

      // updateLiveRegion should also handle errors gracefully
      expect(() => status.updateLiveRegion('Test status')).not.toThrow();
    });

    it('should validate relationships with dynamic content', () => {
      const formField = new FormFieldComponent();

      // Set relationship before element exists
      formField.setAriaDescribedBy(['dynamic-error']);
      expect(formField.getAttribute('aria-describedby')).toBeNull();

      // Mock element becoming available
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'dynamic-error' ? { id } : null;
      });

      // Connection should validate the relationship
      formField.connectedCallback();
      expect(formField.getAttribute('aria-describedby')).toBe('dynamic-error');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create duplicate live regions', () => {
      const status = new StatusComponent();

      document.createElement = vi.fn().mockReturnValue({
        setAttribute: vi.fn(),
        style: {},
        textContent: '',
        parentNode: document.body, // Simulate already in DOM
      });

      const region1 = status.createLiveRegion('polite');
      const region2 = status.createLiveRegion('polite');

      expect(region1).toBe(region2);
      // Should only create one element (reuse existing region)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const mockFn = document.createElement as any;
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle memory cleanup correctly', () => {
      const components = Array.from({ length: 3 }, () => new StatusComponent());

      // Mock live region elements that are actually in the DOM
      const mockLiveRegions = components.map(() => ({
        setAttribute: vi.fn(),
        style: {},
        textContent: '',
        parentNode: document.body, // Important: simulate being in DOM
      }));

      let callCount = 0;
      document.createElement = vi.fn().mockImplementation(() => {
        return mockLiveRegions[callCount++] || mockLiveRegions[0];
      });

      // Create live regions for all components
      components.forEach((component) => {
        component.createLiveRegion('polite');
        component.createLiveRegion('assertive');
      });

      // Disconnect all components
      components.forEach((component) => {
        expect(() => component.disconnectedCallback()).not.toThrow();
      });

      // Should have attempted to clean up live regions that were in the DOM
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const mockRemoveChild = document.body.removeChild as any;
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('Accessibility Compliance Patterns', () => {
    it('should follow ARIA best practices for dropdown', () => {
      const dropdown = new DropdownComponent();

      // Mock dropdown menu element exists
      document.getElementById = vi.fn().mockImplementation((id) => {
        return id === 'dropdown-menu-1' ? { id } : null;
      });

      dropdown.connectedCallback();

      // Should have proper button role
      expect(dropdown.getAttribute('role')).toBe('button');

      // Should be focusable
      expect(dropdown.getAttribute('tabindex')).toBe('0');

      // Should manage expanded state
      dropdown.isOpen = true;
      expect(dropdown.getAttribute('aria-expanded')).toBe('true');
      expect(dropdown.getAttribute('aria-controls')).toBeTruthy();
    });

    it('should follow ARIA best practices for form validation', () => {
      const formField = new FormFieldComponent();
      formField.connectedCallback();

      // Mock error element
      document.getElementById = vi.fn().mockReturnValue({ id: 'error-message-1' });

      // Should have proper form control role
      expect(formField.getAttribute('role')).toBe('textbox');

      // Should manage validation state
      formField.hasError = true;
      expect(formField.getAttribute('aria-invalid')).toBe('true');
      expect(formField.getAttribute('aria-describedby')).toBe('error-message-1');

      // Should manage loading state
      formField.isLoading = true;
      expect(formField.getAttribute('aria-busy')).toBe('true');
    });

    it('should follow ARIA best practices for modals', () => {
      const modal = new ModalComponent();
      modal.connectedCallback();

      // Mock modal elements
      document.getElementById = vi.fn().mockImplementation((id) => {
        return ['modal-title-1', 'modal-description-1'].includes(id as string) ? { id } : null;
      });

      // Should have proper dialog role and be initially hidden
      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('aria-hidden')).toBe('true');

      // Should manage labeling when shown
      modal.show();
      expect(modal.getAttribute('aria-hidden')).toBe('false');
      expect(modal.getAttribute('aria-labelledby')).toBe('modal-title-1');
      expect(modal.getAttribute('aria-describedby')).toBe('modal-description-1');
    });
  });
});
