/**
 * Unit tests for StyleHandlerMixin
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Enhanced mocking for JSDOM compatibility
const mockCSSStyleSheet = (cssText: string = '') => ({
  cssRules: [{ cssText }],
  replaceSync: vi.fn(),
  insertRule: vi.fn(),
  deleteRule: vi.fn(),
  ownerNode: null,
  type: 'text/css',
  href: null,
  ownerRule: null,
  parentStyleSheet: null,
  title: '',
  media: { length: 0 },
});

// Remove unused mock function
// const createMockManager = () => ({
//   addStylesheet: vi.fn(),
//   batchAddStylesheets: vi.fn(),
//   removeStylesheet: vi.fn(),
//   getStylesheets: vi.fn(() => []),
//   applyTo: vi.fn(),
//   removeFrom: vi.fn(),
//   clear: vi.fn(),
// });

// Create a class that returns the mock manager
class MockAdoptedStyleSheetsManager {
  addStylesheet = vi.fn();
  batchAddStylesheets = vi.fn();
  removeStylesheet = vi.fn();
  getStylesheets = vi.fn(() => []);
  applyTo = vi.fn();
  removeFrom = vi.fn();
  clear = vi.fn();
}

vi.mock('../../utilities/style-helpers.js', () => ({
  AdoptedStyleSheetsManager: MockAdoptedStyleSheetsManager,
  createStyleSheet: vi.fn((css: string) => mockCSSStyleSheet(css)),
}));

import { StyleHandlerMixin } from '../base/mixins/StyleHandlerMixin.js';
import { compose } from '../base/utilities/mixin-composer.js';

// Mock base element class
class MockBaseElement {
  constructor() {}

  connectedCallback(): void {
    // Base implementation
  }

  disconnectedCallback(): void {
    // Base implementation
  }
}

// Type-safe interface for accessing test methods
interface TestComponentInstance {
  getStaticStylesheetManager(): MockAdoptedStyleSheetsManager;
  applyStaticStylesheets(): void;
  removeStaticStylesheets(): void;
  connectedCallback(): void;
  disconnectedCallback(): void;
}

// Interface for components with internal state access (for testing)
interface ComponentWithInternalState extends TestComponentInstance {
  hasAppliedStaticStyles: boolean;
  staticStylesheetManager: MockAdoptedStyleSheetsManager | null;
  getStyleTarget(): ShadowRoot | Document | null;
}

// Test component with single static stylesheet
class TestComponentWithStylesheet extends compose(MockBaseElement, StyleHandlerMixin) {
  static stylesheet = mockCSSStyleSheet('.test-single { color: red; }') as unknown as CSSStyleSheet;

  constructor() {
    super();
  }
}

// Test component with multiple static stylesheets
class TestComponentWithMultipleStylesheets extends compose(MockBaseElement, StyleHandlerMixin) {
  static stylesheets = [
    mockCSSStyleSheet('.test-multi-1 { color: blue; }') as unknown as CSSStyleSheet,
    mockCSSStyleSheet('.test-multi-2 { color: green; }') as unknown as CSSStyleSheet,
  ];

  constructor() {
    super();
  }
}

// Test component with both single and multiple stylesheets (to test priority)
class TestComponentWithBoth extends compose(MockBaseElement, StyleHandlerMixin) {
  static stylesheet = mockCSSStyleSheet(
    '.test-both-single { color: red; }'
  ) as unknown as CSSStyleSheet;
  static stylesheets = [
    mockCSSStyleSheet('.test-both-multi { color: blue; }') as unknown as CSSStyleSheet,
  ];

  constructor() {
    super();
  }
}

// Test component without static stylesheets
class TestComponentWithoutStylesheets extends compose(MockBaseElement, StyleHandlerMixin) {
  constructor() {
    super();
  }
}

// Component with shadow DOM
class TestComponentWithShadowDOM extends compose(MockBaseElement, StyleHandlerMixin) {
  static stylesheet = mockCSSStyleSheet(
    '.shadow-test { color: purple; }'
  ) as unknown as CSSStyleSheet;
  shadowRoot: ShadowRoot;

  constructor() {
    super();
    // Mock shadow root for testing
    this.shadowRoot = {
      adoptedStyleSheets: [],
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as unknown as ShadowRoot;
  }
}

describe('StyleHandlerMixin', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Spy on console to capture warnings
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Basic mixin functionality', () => {
    it('should create component instance with StyleHandlerMixin methods', () => {
      const component = new TestComponentWithStylesheet();

      expect(component).toBeInstanceOf(TestComponentWithStylesheet);
      expect(component.getStaticStylesheetManager).toBeTypeOf('function');
      expect(component.applyStaticStylesheets).toBeTypeOf('function');
      expect(component.removeStaticStylesheets).toBeTypeOf('function');
    });

    it('should create and reuse AdoptedStyleSheetsManager instance', () => {
      const component = new TestComponentWithStylesheet();

      const manager1 = component.getStaticStylesheetManager();
      const manager2 = component.getStaticStylesheetManager();

      // Should return the same instance
      expect(manager1).toBe(manager2);
      expect(manager1).toBeDefined();
    });
  });

  describe('Static stylesheet detection', () => {
    it('should detect single static stylesheet', () => {
      const component = new TestComponentWithStylesheet();

      // Spy on the manager methods directly
      const manager = component.getStaticStylesheetManager();
      const batchSpy = vi.spyOn(manager, 'batchAddStylesheets');

      component.applyStaticStylesheets();

      // Should have added the single stylesheet
      expect(batchSpy).toHaveBeenCalledWith([TestComponentWithStylesheet.stylesheet]);

      batchSpy.mockRestore();
    });

    it('should detect multiple static stylesheets', () => {
      const component = new TestComponentWithMultipleStylesheets();

      const manager = component.getStaticStylesheetManager();
      const batchSpy = vi.spyOn(manager, 'batchAddStylesheets');

      component.applyStaticStylesheets();

      // Should have added all stylesheets
      expect(batchSpy).toHaveBeenCalledWith(TestComponentWithMultipleStylesheets.stylesheets);

      batchSpy.mockRestore();
    });

    it('should detect both single and multiple stylesheets', () => {
      const component = new TestComponentWithBoth();

      const manager = component.getStaticStylesheetManager();
      const batchSpy = vi.spyOn(manager, 'batchAddStylesheets');

      component.applyStaticStylesheets();

      // Should have added both single and multiple stylesheets
      const expectedStylesheets = [
        TestComponentWithBoth.stylesheet,
        ...TestComponentWithBoth.stylesheets,
      ];

      expect(batchSpy).toHaveBeenCalledWith(expectedStylesheets);

      batchSpy.mockRestore();
    });

    it('should handle components without static stylesheets', () => {
      const component = new TestComponentWithoutStylesheets();

      const manager = component.getStaticStylesheetManager();
      const batchSpy = vi.spyOn(manager, 'batchAddStylesheets');

      component.applyStaticStylesheets();

      // Should not have called batchAddStylesheets
      expect(batchSpy).not.toHaveBeenCalled();

      batchSpy.mockRestore();
    });
  });

  describe('Style target determination', () => {
    it('should prefer shadow root as style target', () => {
      const component = new TestComponentWithShadowDOM();

      const manager = component.getStaticStylesheetManager();
      const applySpy = vi.spyOn(manager, 'applyTo');

      component.applyStaticStylesheets();

      // Should have applied to shadow root
      expect(applySpy).toHaveBeenCalledWith(component.shadowRoot);

      applySpy.mockRestore();
    });

    it('should fall back to document for light DOM components', () => {
      const component = new TestComponentWithStylesheet();

      const manager = component.getStaticStylesheetManager();
      const applySpy = vi.spyOn(manager, 'applyTo');

      component.applyStaticStylesheets();

      // Should have applied to document
      expect(applySpy).toHaveBeenCalledWith(document);

      applySpy.mockRestore();
    });
  });

  describe('Lifecycle integration', () => {
    it('should apply static stylesheets during connectedCallback', () => {
      const component = new TestComponentWithStylesheet();

      // Spy on the applyStaticStylesheets method
      const applySpy = vi.spyOn(component, 'applyStaticStylesheets');

      component.connectedCallback();

      expect(applySpy).toHaveBeenCalled();

      applySpy.mockRestore();
    });

    it('should remove static stylesheets during disconnectedCallback', () => {
      const component = new TestComponentWithStylesheet();

      // First apply styles
      component.applyStaticStylesheets();

      // Spy on the removeStaticStylesheets method
      const removeSpy = vi.spyOn(component, 'removeStaticStylesheets');

      component.disconnectedCallback();

      expect(removeSpy).toHaveBeenCalled();

      removeSpy.mockRestore();
    });

    it('should call parent lifecycle methods', () => {
      // Create a spy-friendly base class
      class SpyableBase {
        connectedCallback = vi.fn();
        disconnectedCallback = vi.fn();
      }

      class TestSpyComponent extends compose(SpyableBase, StyleHandlerMixin) {
        constructor() {
          super();
        }
      }

      const component = new TestSpyComponent();

      component.connectedCallback();
      component.disconnectedCallback();

      // Verify parent methods were called
      expect(component.connectedCallback).toHaveBeenCalled();
      expect(component.disconnectedCallback).toHaveBeenCalled();
    });
  });

  describe('Duplicate application prevention', () => {
    it('should not apply static stylesheets multiple times', () => {
      const component = new TestComponentWithStylesheet();

      const manager = component.getStaticStylesheetManager();
      const batchSpy = vi.spyOn(manager, 'batchAddStylesheets');
      const applySpy = vi.spyOn(manager, 'applyTo');

      // Apply twice
      component.applyStaticStylesheets();
      component.applyStaticStylesheets();

      // Should only have been called once
      expect(batchSpy).toHaveBeenCalledTimes(1);
      expect(applySpy).toHaveBeenCalledTimes(1);

      batchSpy.mockRestore();
      applySpy.mockRestore();
    });

    it('should handle removal when stylesheets not applied', () => {
      const component = new TestComponentWithStylesheet();

      const manager = component.getStaticStylesheetManager();
      const removeSpy = vi.spyOn(manager, 'removeFrom');

      // Try to remove without applying first
      expect(() => {
        component.removeStaticStylesheets();
      }).not.toThrow();

      // Should not have called removeFrom
      expect(removeSpy).not.toHaveBeenCalled();

      removeSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle errors during stylesheet application gracefully', () => {
      const component = new TestComponentWithStylesheet();

      // Mock manager to throw error
      const manager = component.getStaticStylesheetManager();
      manager.applyTo = vi.fn(() => {
        throw new Error('Test application error');
      });

      expect(() => {
        component.applyStaticStylesheets();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to apply static stylesheets'),
        expect.any(Error)
      );
    });

    it('should handle errors during stylesheet removal gracefully', () => {
      const component = new TestComponentWithStylesheet();

      // First apply styles
      component.applyStaticStylesheets();

      // Mock manager to throw error during removal
      const manager = component.getStaticStylesheetManager();
      manager.removeFrom = vi.fn(() => {
        throw new Error('Test removal error');
      });

      expect(() => {
        component.removeStaticStylesheets();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to remove static stylesheets'),
        expect.any(Error)
      );
    });

    it('should handle missing style target gracefully', () => {
      const component = new TestComponentWithStylesheet();

      // Mock getStyleTarget to return null
      const componentWithState = component as ComponentWithInternalState;
      const originalGetStyleTarget = componentWithState.getStyleTarget;
      componentWithState.getStyleTarget = vi.fn(() => null);

      expect(() => {
        component.applyStaticStylesheets();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No suitable style target found')
      );

      // Restore original method
      componentWithState.getStyleTarget = originalGetStyleTarget;
    });
  });

  describe('Memory management', () => {
    it('should clean up manager references after disconnection', () => {
      const component = new TestComponentWithStylesheet() as ComponentWithInternalState;

      // Apply styles
      component.applyStaticStylesheets();

      // Remove styles
      component.removeStaticStylesheets();

      // Internal state should be reset
      expect(component.hasAppliedStaticStyles).toBe(false);
    });

    it('should handle removal when manager is null', () => {
      const component = new TestComponentWithStylesheet() as ComponentWithInternalState;

      // Set internal state to simulate edge case
      component.hasAppliedStaticStyles = true;
      component.staticStylesheetManager = null;

      expect(() => {
        component.removeStaticStylesheets();
      }).not.toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should work with multiple component instances', () => {
      const component1 = new TestComponentWithStylesheet();
      const component2 = new TestComponentWithStylesheet();

      const manager1 = component1.getStaticStylesheetManager();
      const manager2 = component2.getStaticStylesheetManager();
      const batch1Spy = vi.spyOn(manager1, 'batchAddStylesheets');
      const batch2Spy = vi.spyOn(manager2, 'batchAddStylesheets');

      component1.applyStaticStylesheets();
      component2.applyStaticStylesheets();

      // Each component should have its own manager
      expect(manager1).not.toBe(manager2);
      expect(batch1Spy).toHaveBeenCalled();
      expect(batch2Spy).toHaveBeenCalled();

      batch1Spy.mockRestore();
      batch2Spy.mockRestore();
    });

    it('should handle complete lifecycle', () => {
      const component = new TestComponentWithStylesheet();

      const manager = component.getStaticStylesheetManager();
      const batchSpy = vi.spyOn(manager, 'batchAddStylesheets');
      const applySpy = vi.spyOn(manager, 'applyTo');
      const removeSpy = vi.spyOn(manager, 'removeFrom');

      // Full lifecycle
      component.connectedCallback();

      expect(batchSpy).toHaveBeenCalled();
      expect(applySpy).toHaveBeenCalled();

      component.disconnectedCallback();
      expect(removeSpy).toHaveBeenCalled();

      batchSpy.mockRestore();
      applySpy.mockRestore();
      removeSpy.mockRestore();
    });
  });
});
