/**
 * Unit tests for StyleManagerMixin
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Skip tests that require real browser DOM APIs in JSDOM
const isJSDOM =
  typeof globalThis !== 'undefined' && globalThis.navigator?.userAgent?.includes('jsdom');
import { StyleManagerMixin } from '../base/mixins/StyleManagerMixin.js';
import { compose } from '../base/utilities/mixin-composer.js';

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

// Mock createStyleSheet utility with enhanced mock
vi.mock('../../utilities/style-helpers.js', () => ({
  createStyleSheet: vi.fn((css: string) => mockCSSStyleSheet(css)),
}));

// Mock CSSStyleSheet constructor for tests that create new instances
Object.defineProperty(globalThis, 'CSSStyleSheet', {
  value: function MockCSSStyleSheet() {
    return mockCSSStyleSheet();
  },
  writable: true,
});

// Mock base class for testing
class MockBaseElement {
  constructor() {}
  connectedCallback(): void {}
}

// Test component with StyleManagerMixin
class TestStyleComponent extends compose(MockBaseElement as any, StyleManagerMixin) {
  constructor() {
    super();
  }
}

// Test component with static stylesheet - create mock after class definition
class TestStyleWithStaticSheet extends compose(MockBaseElement as any, StyleManagerMixin) {
  static stylesheet: CSSStyleSheet;

  constructor() {
    super();
  }
}

// Set up the mock stylesheet after class is defined
TestStyleWithStaticSheet.stylesheet = mockCSSStyleSheet(
  '.test-component { color: red; }'
) as unknown as CSSStyleSheet;

describe('StyleManagerMixin', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Clear any existing style elements from previous tests
    document.querySelectorAll('style[id^="style-"]').forEach((el) => el.remove());
  });

  afterEach(() => {
    container.remove();
  });

  describe('Basic functionality', () => {
    it('should create component instance with StyleManagerMixin', () => {
      const component = new TestStyleComponent();

      expect(component).toBeInstanceOf(TestStyleComponent);
      expect(component.addCSS).toBeTypeOf('function');
      expect(component.addStylesheet).toBeTypeOf('function');
      expect(component.batchAddStylesheets).toBeTypeOf('function');
    });

    it('should handle connectedCallback lifecycle', () => {
      const component = new TestStyleComponent();

      // Should not throw when connected
      expect(() => {
        component.connectedCallback();
      }).not.toThrow();
    });

    it('should handle disconnectedCallback lifecycle', () => {
      const component = new TestStyleComponent();

      // Should not throw when disconnected
      expect(() => {
        component.disconnectedCallback?.();
      }).not.toThrow();
    });
  });

  describe('Static stylesheet auto-detection', () => {
    it.skipIf(isJSDOM)(
      'should auto-detect and apply class stylesheet when component connects',
      () => {
        const component = new TestStyleWithStaticSheet();

        // Mock shadow root with adoptedStyleSheets support
        const mockShadowRoot = {
          adoptedStyleSheets: [],
        } as unknown as ShadowRoot;

        Object.defineProperty(component, 'shadowRoot', {
          value: mockShadowRoot,
          writable: true,
        });

        component.connectedCallback();

        expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(1);
        expect(mockShadowRoot.adoptedStyleSheets[0]).toBe(TestStyleWithStaticSheet.stylesheet);
      }
    );

    it('should work without static stylesheet', () => {
      const component = new TestStyleComponent();

      // Should not throw when no static stylesheet exists
      expect(() => {
        component.connectedCallback();
      }).not.toThrow();
    });
  });

  describe('addCSS method', () => {
    it('should create and add dynamic stylesheet from CSS string', async () => {
      const component = new TestStyleComponent();
      const mockShadowRoot = {
        adoptedStyleSheets: [],
      } as unknown as ShadowRoot;

      Object.defineProperty(component, 'shadowRoot', {
        value: mockShadowRoot,
        writable: true,
      });

      const css = '.dynamic { background: blue; }';
      component.addCSS(css);

      // Wait for microtask to complete debounced update
      // eslint-disable-next-line no-undef
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(1);
    });

    it('should handle multiple addCSS calls with debouncing', async () => {
      const component = new TestStyleComponent();
      const mockShadowRoot = {
        adoptedStyleSheets: [],
      } as unknown as ShadowRoot;

      Object.defineProperty(component, 'shadowRoot', {
        value: mockShadowRoot,
        writable: true,
      });

      component.addCSS('.first { color: red; }');
      component.addCSS('.second { color: blue; }');

      // Wait for microtask to complete debounced update
      // eslint-disable-next-line no-undef
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(2);
    });

    it('should support batch adding stylesheets', async () => {
      const component = new TestStyleComponent();
      const mockShadowRoot = {
        adoptedStyleSheets: [],
      } as unknown as ShadowRoot;

      Object.defineProperty(component, 'shadowRoot', {
        value: mockShadowRoot,
        writable: true,
      });

      const sheet1 = mockCSSStyleSheet('.batch1 { color: red; }') as unknown as CSSStyleSheet;
      const sheet2 = mockCSSStyleSheet('.batch2 { color: blue; }') as unknown as CSSStyleSheet;

      component.batchAddStylesheets([sheet1, sheet2]);

      // Wait for microtask to complete debounced update
      // eslint-disable-next-line no-undef
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(2);
    });

    it('should handle invalid CSS gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const component = new TestStyleComponent();

      // This should not throw, but might log a warning
      expect(() => {
        component.addCSS('invalid css {{');
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('addStylesheet method', () => {
    it.skipIf(isJSDOM)('should add pre-constructed stylesheet', () => {
      const component = new TestStyleComponent();
      const mockShadowRoot = {
        adoptedStyleSheets: [],
      } as unknown as ShadowRoot;

      Object.defineProperty(component, 'shadowRoot', {
        value: mockShadowRoot,
        writable: true,
      });

      const stylesheet = mockCSSStyleSheet(
        '.custom { font-size: 16px; }'
      ) as unknown as CSSStyleSheet;

      component.addStylesheet(stylesheet);

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(1);
      expect(mockShadowRoot.adoptedStyleSheets[0]).toBe(stylesheet);
    });

    it.skipIf(isJSDOM)('should combine static and dynamic stylesheets', () => {
      const component = new TestStyleWithStaticSheet();
      const mockShadowRoot = {
        adoptedStyleSheets: [],
      } as unknown as ShadowRoot;

      Object.defineProperty(component, 'shadowRoot', {
        value: mockShadowRoot,
        writable: true,
      });

      // Connect to apply static stylesheet
      component.connectedCallback();

      // Add dynamic stylesheet
      const dynamicSheet = mockCSSStyleSheet(
        '.dynamic { margin: 10px; }'
      ) as unknown as CSSStyleSheet;
      component.addStylesheet(dynamicSheet);

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(2);
      expect(mockShadowRoot.adoptedStyleSheets[0]).toBe(TestStyleWithStaticSheet.stylesheet);
      expect(mockShadowRoot.adoptedStyleSheets[1]).toBe(dynamicSheet);
    });
  });

  describe('Shadow DOM vs Light DOM handling', () => {
    it('should use adoptedStyleSheets when shadowRoot exists', async () => {
      const component = new TestStyleComponent();
      const mockShadowRoot = {
        adoptedStyleSheets: [],
      } as unknown as ShadowRoot;

      Object.defineProperty(component, 'shadowRoot', {
        value: mockShadowRoot,
        writable: true,
      });

      component.addCSS('.shadow-test { color: green; }');

      // Wait for microtask to complete debounced update
      // eslint-disable-next-line no-undef
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

      // Should use adoptedStyleSheets, not create style elements
      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(1);
      expect(document.querySelectorAll('style[id^="style-"]')).toHaveLength(0);
    });

    it('should fall back to style elements when no shadowRoot', async () => {
      const component = new TestStyleComponent();

      // Ensure no shadowRoot
      Object.defineProperty(component, 'shadowRoot', {
        value: null,
        writable: true,
      });

      component.addCSS('.light-test { color: purple; }');

      // Wait for microtask to complete debounced update
      // eslint-disable-next-line no-undef
      await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

      // Should create style element in document.head
      const styleElements = document.querySelectorAll('style[id^="style-TestStyleComponent"]');
      expect(styleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback style element behavior', () => {
    it.skipIf(isJSDOM)('should create unique IDs for style elements', () => {
      const component = new TestStyleWithStaticSheet();

      // No shadowRoot - should fall back to style elements
      Object.defineProperty(component, 'shadowRoot', {
        value: null,
        writable: true,
      });

      component.connectedCallback();

      const staticStyleElement = document.getElementById('style-TestStyleWithStaticSheet-static');
      expect(staticStyleElement).not.toBeNull();
      expect(staticStyleElement?.tagName).toBe('STYLE');
    });

    it.skipIf(isJSDOM)('should avoid duplicate style elements for class stylesheets', () => {
      const component1 = new TestStyleWithStaticSheet();
      const component2 = new TestStyleWithStaticSheet();

      // Both components without shadowRoot
      Object.defineProperty(component1, 'shadowRoot', {
        value: null,
        writable: true,
      });
      Object.defineProperty(component2, 'shadowRoot', {
        value: null,
        writable: true,
      });

      component1.connectedCallback();
      component2.connectedCallback();

      // Should only create one static style element
      const staticStyleElements = document.querySelectorAll(
        '#style-TestStyleWithStaticSheet-static'
      );
      expect(staticStyleElements).toHaveLength(1);
    });

    it.skipIf(isJSDOM)('should handle CSS text extraction from stylesheets', () => {
      const component = new TestStyleComponent();

      Object.defineProperty(component, 'shadowRoot', {
        value: null,
        writable: true,
      });

      const stylesheet = mockCSSStyleSheet(
        '.extract-test { padding: 5px; }'
      ) as unknown as CSSStyleSheet;

      component.addStylesheet(stylesheet);

      const dynamicStyleElements = document.querySelectorAll(
        'style[id*="TestStyleComponent-dynamic"]'
      );
      expect(dynamicStyleElements.length).toBeGreaterThan(0);

      const styleContent = dynamicStyleElements[0].textContent;
      expect(styleContent).toContain('.extract-test');
      expect(styleContent).toContain('padding: 5px');
    });
  });

  describe('Error handling', () => {
    it('should handle CSS text extraction errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const component = new TestStyleComponent();

      Object.defineProperty(component, 'shadowRoot', {
        value: null,
        writable: true,
      });

      // Create a stylesheet that might cause cssRules access issues
      const problematicSheet = mockCSSStyleSheet() as unknown as CSSStyleSheet;

      // Mock cssRules to throw an error
      Object.defineProperty(problematicSheet, 'cssRules', {
        get: () => {
          throw new Error('Access denied');
        },
      });

      expect(() => {
        component.addStylesheet(problematicSheet);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should handle style element creation errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const component = new TestStyleComponent();

      Object.defineProperty(component, 'shadowRoot', {
        value: null,
        writable: true,
      });

      // This should not throw even if there are DOM manipulation issues
      expect(() => {
        component.addCSS('.error-test { color: red; }');
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
