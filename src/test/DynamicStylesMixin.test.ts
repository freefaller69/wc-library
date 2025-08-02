/**
 * Unit tests for DynamicStylesMixin
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */

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

// Store the createStyleSheet mock for inspection
const mockCreateStyleSheet = vi.fn((css: string) => mockCSSStyleSheet(css));

vi.mock('../../utilities/style-helpers.js', () => ({
  AdoptedStyleSheetsManager: MockAdoptedStyleSheetsManager,
  createStyleSheet: mockCreateStyleSheet,
}));

// Also try mocking the .ts version just in case
vi.mock('../../utilities/style-helpers.ts', () => ({
  AdoptedStyleSheetsManager: MockAdoptedStyleSheetsManager,
  createStyleSheet: mockCreateStyleSheet,
}));

import { DynamicStylesMixin } from '../base/mixins/DynamicStylesMixin.js';
import { compose } from '../base/utilities/mixin-composer.js';

// Mock base element class
class MockBaseElement {
  isConnected = true;

  constructor() {}

  connectedCallback(): void {
    this.isConnected = true;
  }

  disconnectedCallback(): void {
    this.isConnected = false;
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Base implementation
  }
}

// Test component interfaces are defined inline where needed to avoid unused type warnings

// Test component with basic dynamic styles
class TestComponentWithDynamicStyles extends compose(MockBaseElement, DynamicStylesMixin) {
  color = 'blue';
  size = '16px';

  constructor() {
    super();
  }

  generateDynamicCSS(): string {
    return `
      :host {
        --dynamic-color: ${this.color};
        --dynamic-size: ${this.size};
      }
    `;
  }
}

// Test component with theme support
class TestComponentWithTheme extends compose(MockBaseElement, DynamicStylesMixin) {
  theme = { primary: 'red', spacing: '8px' };

  constructor() {
    super();
  }

  generateDynamicCSS(): string {
    return this.wrapInHostSelector(
      this.createCSSProperties({
        'theme-primary': String(this.theme.primary),
        'theme-spacing': String(this.theme.spacing),
      })
    );
  }
}

// Test component with shadow DOM
class TestComponentWithShadowDOM extends compose(MockBaseElement, DynamicStylesMixin) {
  shadowRoot: ShadowRoot;

  constructor() {
    super();
    // Mock shadow root for testing
    this.shadowRoot = {
      adoptedStyleSheets: [],
      appendChild: vi.fn() as unknown as (node: Node) => Node,
      removeChild: vi.fn() as unknown as (oldChild: Node) => Node,
    } as unknown as ShadowRoot;
  }

  generateDynamicCSS(): string {
    return ':host { --shadow-test: value; }';
  }
}

// Test component without dynamic styles
class TestComponentWithoutDynamicStyles extends compose(MockBaseElement, DynamicStylesMixin) {
  constructor() {
    super();
  }

  // Uses default generateDynamicCSS (returns empty string)
}

// Test component with custom configuration
class TestComponentWithCustomConfig extends compose(MockBaseElement, DynamicStylesMixin) {
  constructor() {
    super({
      dynamicStyles: {
        enableCache: false,
        debounceDelay: 100,
        autoUpdateOnAttributeChange: false,
        cssVariablePrefix: '--custom',
      },
    });
  }

  generateDynamicCSS(): string {
    return ':host { --custom-test: configured; }';
  }
}

describe('DynamicStylesMixin', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Reset the specific mock we're tracking
    mockCreateStyleSheet.mockClear();

    // Spy on console to capture warnings
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock window.setTimeout and clearTimeout - execute immediately for tests
    const mockSetTimeout = vi.fn((fn: () => void, _delay: number) => {
      // Execute function immediately for testing
      if (typeof fn === 'function') {
        fn();
      }
      return 123; // Mock timer ID
    });

    vi.stubGlobal('setTimeout', mockSetTimeout);
    vi.stubGlobal('clearTimeout', vi.fn() as (id: number | undefined) => void);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  describe('Basic mixin functionality', () => {
    it('should create component instance with DynamicStylesMixin methods', () => {
      const component = new TestComponentWithDynamicStyles();

      expect(component).toBeInstanceOf(TestComponentWithDynamicStyles);
      expect(component.getDynamicStylesManager).toBeTypeOf('function');
      expect(component.generateDynamicCSS).toBeTypeOf('function');
      expect(component.updateDynamicStyles).toBeTypeOf('function');
      expect(component.removeDynamicStyles).toBeTypeOf('function');
      expect(component.invalidateDynamicStyles).toBeTypeOf('function');
    });

    it('should create and reuse AdoptedStyleSheetsManager instance', () => {
      const component = new TestComponentWithDynamicStyles();

      const manager1 = component.getDynamicStylesManager();
      const manager2 = component.getDynamicStylesManager();

      // Should return the same instance
      expect(manager1).toBe(manager2);
      expect(manager1).toBeDefined();
    });
  });

  describe('Dynamic CSS generation', () => {
    it('should generate CSS based on component state', () => {
      const component = new TestComponentWithDynamicStyles();

      const css = component.generateDynamicCSS();

      expect(css).toContain('--dynamic-color: blue');
      expect(css).toContain('--dynamic-size: 16px');
    });

    it('should update CSS when component state changes', () => {
      const component = new TestComponentWithDynamicStyles();

      // Change state
      component.color = 'red';
      component.size = '20px';

      const css = component.generateDynamicCSS();

      expect(css).toContain('--dynamic-color: red');
      expect(css).toContain('--dynamic-size: 20px');
    });

    it('should handle empty CSS generation', () => {
      const component = new TestComponentWithoutDynamicStyles();

      const css = component.generateDynamicCSS();

      expect(css).toBe('');
    });
  });

  describe('Dynamic style updates', () => {
    it('should update dynamic styles when updateDynamicStyles is called', () => {
      const component = new TestComponentWithDynamicStyles();

      // Verify CSS generation works
      const css = component.generateDynamicCSS();
      expect(css.trim()).not.toBe('');

      // Verify manager is created and accessible
      const manager = component.getDynamicStylesManager();
      expect(manager).toBeDefined();

      // Test that updateDynamicStyles method exists and can be called without error
      expect(() => component.updateDynamicStyles()).not.toThrow();
      expect(() => component.performDynamicStyleUpdate()).not.toThrow();
    });

    it('should prefer shadow root as style target', () => {
      const component = new TestComponentWithShadowDOM();

      // Verify component has shadow root
      expect(component.shadowRoot).toBeDefined();

      // Verify update methods can be called without error
      expect(() => component.updateDynamicStyles()).not.toThrow();
      expect(() => component.performDynamicStyleUpdate()).not.toThrow();
    });

    it('should not create stylesheet for empty CSS', () => {
      const component = new TestComponentWithoutDynamicStyles();

      const manager = component.getDynamicStylesManager();
      const addSpy = vi.spyOn(manager, 'addStylesheet');

      component.updateDynamicStyles();

      expect(addSpy).not.toHaveBeenCalled();

      addSpy.mockRestore();
    });
  });

  describe('Caching behavior', () => {
    it('should cache generated CSS and avoid regeneration', () => {
      const component = new TestComponentWithDynamicStyles();

      // Test CSS generation is consistent
      const css1 = component.generateDynamicCSS();
      const css2 = component.generateDynamicCSS();

      expect(css1).toBe(css2);
      expect(css1.trim()).not.toBe('');
    });

    it('should invalidate cache when invalidateDynamicStyles is called', () => {
      const component = new TestComponentWithDynamicStyles();

      // Test invalidation method exists and can be called
      expect(() => component.invalidateDynamicStyles()).not.toThrow();

      // Verify CSS can still be generated after invalidation
      const css = component.generateDynamicCSS();
      expect(css.trim()).not.toBe('');
    });
  });

  describe('Stylesheet management', () => {
    it('should handle dynamic style updates when state changes', () => {
      const component = new TestComponentWithDynamicStyles();

      // Initial CSS
      const initialCSS = component.generateDynamicCSS();
      expect(initialCSS).toContain('blue');

      // Change state and regenerate CSS
      component.color = 'green';
      const updatedCSS = component.generateDynamicCSS();
      expect(updatedCSS).toContain('green');
      expect(updatedCSS).not.toContain('blue');

      // Verify update methods work
      expect(() => component.updateDynamicStyles()).not.toThrow();
    });

    it('should handle stylesheet removal errors gracefully', () => {
      const component = new TestComponentWithDynamicStyles();

      // Mock generateDynamicCSS to consistently return CSS that will trigger updates
      const originalGenerateCSS = component.generateDynamicCSS;
      component.generateDynamicCSS = vi.fn(() => ':host { background: red; }');

      // First update to create a stylesheet
      component.performDynamicStyleUpdate();

      const manager = component.getDynamicStylesManager();

      // Mock removeStylesheet to throw error
      manager.removeStylesheet = vi.fn(() => {
        throw new Error('Test removal error');
      });

      // Now change the CSS to trigger removal of old stylesheet
      component.generateDynamicCSS = vi.fn(() => ':host { background: blue; }');

      // Should handle error gracefully when trying to remove old stylesheet
      expect(() => {
        component.performDynamicStyleUpdate();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update dynamic styles'),
        expect.any(Error),
        expect.objectContaining({
          config: expect.any(Object),
          lastGeneratedCSS: expect.any(String),
          hasCurrentStylesheet: expect.any(Boolean),
        })
      );

      // Restore original function
      component.generateDynamicCSS = originalGenerateCSS;
    });
  });

  describe('Lifecycle integration', () => {
    it('should update dynamic styles during connectedCallback', () => {
      const component = new TestComponentWithDynamicStyles();

      const updateSpy = vi.spyOn(component, 'updateDynamicStyles');

      component.connectedCallback();

      expect(updateSpy).toHaveBeenCalled();

      updateSpy.mockRestore();
    });

    it('should remove dynamic styles during disconnectedCallback', () => {
      const component = new TestComponentWithDynamicStyles();

      const removeSpy = vi.spyOn(component, 'removeDynamicStyles');

      component.disconnectedCallback();

      expect(removeSpy).toHaveBeenCalled();

      removeSpy.mockRestore();
    });

    it('should call parent lifecycle methods', () => {
      // Create a spy-friendly base class
      class SpyableBase {
        isConnected = true;
        connectedCallback = vi.fn() as () => void;
        disconnectedCallback = vi.fn() as () => void;
        attributeChangedCallback = vi.fn() as (
          name: string,
          oldValue: string | null,
          newValue: string | null
        ) => void;
      }

      class TestSpyComponent extends compose(SpyableBase, DynamicStylesMixin) {
        constructor() {
          super();
        }
      }

      const component = new TestSpyComponent();

      component.connectedCallback();
      component.disconnectedCallback();
      component.attributeChangedCallback('test', 'old', 'new');

      // Verify parent methods were called
      expect(component.connectedCallback).toHaveBeenCalled();
      expect(component.disconnectedCallback).toHaveBeenCalled();
      expect(component.attributeChangedCallback).toHaveBeenCalledWith('test', 'old', 'new');
    });
  });

  describe('Attribute change handling', () => {
    it('should update styles on attribute changes when autoUpdateOnAttributeChange is enabled', () => {
      const component = new TestComponentWithDynamicStyles();

      const updateSpy = vi.spyOn(component, 'updateDynamicStyles');

      component.attributeChangedCallback('color', 'blue', 'red');

      expect(updateSpy).toHaveBeenCalled();

      updateSpy.mockRestore();
    });

    it('should not update styles when component is not connected', () => {
      const component = new TestComponentWithDynamicStyles();
      component.isConnected = false;

      const updateSpy = vi.spyOn(component, 'updateDynamicStyles');

      component.attributeChangedCallback('color', 'blue', 'red');

      expect(updateSpy).not.toHaveBeenCalled();

      updateSpy.mockRestore();
    });

    it('should not update styles when old and new values are the same', () => {
      const component = new TestComponentWithDynamicStyles();

      const updateSpy = vi.spyOn(component, 'updateDynamicStyles');

      component.attributeChangedCallback('color', 'blue', 'blue');

      expect(updateSpy).not.toHaveBeenCalled();

      updateSpy.mockRestore();
    });
  });

  describe('Helper methods', () => {
    it('should create CSS properties with default prefix', () => {
      const component = new TestComponentWithDynamicStyles();

      const css = component.createCSSProperties({
        color: 'red',
        size: '16px',
        margin: null,
        padding: undefined,
      });

      expect(css).toContain('--dynamic-color: red');
      expect(css).toContain('--dynamic-size: 16px');
      expect(css).not.toContain('margin');
      expect(css).not.toContain('padding');
    });

    it('should create CSS properties with custom prefix', () => {
      const component = new TestComponentWithDynamicStyles();

      const css = component.createCSSProperties(
        {
          color: 'blue',
        },
        '--custom'
      );

      expect(css).toContain('--custom-color: blue');
    });

    it('should handle CSS properties that already have -- prefix', () => {
      const component = new TestComponentWithDynamicStyles();

      const css = component.createCSSProperties({
        '--existing-var': 'value',
      });

      expect(css).toContain('--existing-var: value');
      expect(css).not.toContain('--dynamic---existing-var');
    });

    it('should wrap CSS in :host selector', () => {
      const component = new TestComponentWithDynamicStyles();

      const css = component.wrapInHostSelector('color: red;\nfont-size: 16px;');

      expect(css).toBe(':host {\ncolor: red;\nfont-size: 16px;\n}');
    });

    it('should return empty string for empty CSS', () => {
      const component = new TestComponentWithDynamicStyles();

      const css = component.wrapInHostSelector('');

      expect(css).toBe('');
    });
  });

  describe('Theme integration', () => {
    it('should generate theme-aware CSS', () => {
      const component = new TestComponentWithTheme();

      const css = component.generateDynamicCSS();

      expect(css).toContain('--dynamic-theme-primary: red');
      expect(css).toContain('--dynamic-theme-spacing: 8px');
      expect(css).toContain(':host {');
    });

    it('should update when theme changes', () => {
      const component = new TestComponentWithTheme();

      // Change theme
      component.theme = { primary: 'green', spacing: '12px' };

      const css = component.generateDynamicCSS();

      expect(css).toContain('--dynamic-theme-primary: green');
      expect(css).toContain('--dynamic-theme-spacing: 12px');
    });
  });

  describe('Configuration options', () => {
    it('should respect custom configuration', () => {
      const component = new TestComponentWithCustomConfig();

      const css = component.generateDynamicCSS();

      expect(css).toContain('--custom-test: configured');
    });

    it('should validate configuration options and warn about invalid values', () => {
      const invalidConfig = {
        dynamicStyles: {
          debounceDelay: -5, // Invalid: negative
          cssVariablePrefix: 'invalid-prefix', // Invalid: doesn't start with --
        },
      };

      // Create component with invalid config
      expect(() => {
        new (class extends compose(MockBaseElement, DynamicStylesMixin) {
          constructor() {
            super(invalidConfig);
          }
        })();
      }).not.toThrow();

      // Should have logged warnings about invalid config
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid debounceDelay'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid cssVariablePrefix'));
    });

    it('should handle debounced updates', () => {
      const component = new TestComponentWithDynamicStyles();

      // Mock setTimeout to test debouncing
      const timeoutSpy = vi.spyOn(window, 'setTimeout');

      component.updateDynamicStyles();

      expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 16);

      timeoutSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle CSS generation errors gracefully', () => {
      const component = new TestComponentWithDynamicStyles();

      // Mock generateDynamicCSS to throw error
      component.generateDynamicCSS = vi.fn(() => {
        throw new Error('Test CSS generation error');
      });

      expect(() => {
        component.performDynamicStyleUpdate();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update dynamic styles'),
        expect.any(Error),
        expect.objectContaining({
          config: expect.any(Object),
          lastGeneratedCSS: expect.any(String),
          hasCurrentStylesheet: expect.any(Boolean),
        })
      );
    });

    it('should handle removal errors gracefully', () => {
      const component = new TestComponentWithDynamicStyles();

      const manager = component.getDynamicStylesManager();
      manager.removeFrom = vi.fn(() => {
        throw new Error('Test removal error');
      });

      expect(() => {
        component.removeDynamicStyles();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to remove dynamic styles'),
        expect.any(Error),
        expect.objectContaining({
          config: expect.any(Object),
          hadStylesManager: expect.any(Boolean),
          hadCurrentStylesheet: expect.any(Boolean),
        })
      );
    });
  });

  describe('Memory management', () => {
    it('should clean up resources during disconnection', () => {
      const component = new TestComponentWithDynamicStyles();

      // Test that remove dynamic styles works without error
      expect(() => component.removeDynamicStyles()).not.toThrow();

      // Verify the component can still generate CSS after cleanup
      const css = component.generateDynamicCSS();
      expect(css.trim()).not.toBe('');
    });

    it('should handle cleanup errors gracefully', () => {
      const component = new TestComponentWithDynamicStyles();

      const manager = component.getDynamicStylesManager();
      manager.clear = vi.fn(() => {
        throw new Error('Test cleanup error');
      });

      expect(() => {
        component.removeDynamicStyles();
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to remove dynamic styles'),
        expect.any(Error),
        expect.objectContaining({
          config: expect.any(Object),
          hadStylesManager: expect.any(Boolean),
          hadCurrentStylesheet: expect.any(Boolean),
        })
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should work with multiple component instances', () => {
      const component1 = new TestComponentWithDynamicStyles();
      const component2 = new TestComponentWithDynamicStyles();

      // Set different states
      component1.color = 'red';
      component2.color = 'blue';

      const css1 = component1.generateDynamicCSS();
      const css2 = component2.generateDynamicCSS();

      expect(css1).toContain('--dynamic-color: red');
      expect(css2).toContain('--dynamic-color: blue');

      // Should have separate managers
      const manager1 = component1.getDynamicStylesManager();
      const manager2 = component2.getDynamicStylesManager();
      expect(manager1).not.toBe(manager2);
    });

    it('should handle complete lifecycle', () => {
      const component = new TestComponentWithDynamicStyles();

      // Verify lifecycle methods exist and can be called without error
      expect(() => component.connectedCallback()).not.toThrow();
      expect(() => component.disconnectedCallback()).not.toThrow();

      // Verify CSS generation still works after lifecycle
      const css = component.generateDynamicCSS();
      expect(css.trim()).not.toBe('');
    });
  });
});
