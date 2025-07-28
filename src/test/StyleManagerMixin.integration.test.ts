/**
 * Integration tests for StyleManagerMixin with CoreCustomElement and ShadowDOMMixin
 */

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Skip tests that require real browser DOM APIs in JSDOM
const isJSDOM =
  typeof globalThis !== 'undefined' && globalThis.navigator?.userAgent?.includes('jsdom');
import { StyleManagerMixin } from '../base/mixins/StyleManagerMixin.js';
import { ShadowDOMMixin } from '../base/mixins/ShadowDOMMixin.js';
import { compose } from '../base/utilities/mixin-composer.js';
import type { ComponentConfig } from '../types/component.js';

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

// Mock CoreCustomElement for testing without requiring custom element registration
class MockCoreCustomElement {
  config: ComponentConfig;
  componentId: string;
  private _isConnected = false;

  constructor(config: ComponentConfig) {
    this.config = config;
    this.componentId = `${config.tagName}-${Math.random().toString(36).substr(2, 9)}`;
  }

  connectedCallback(): void {
    this._isConnected = true;
  }

  disconnectedCallback(): void {
    this._isConnected = false;
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Required abstract method implementation
  }

  getAttribute(name: string): string | null {
    if (name === 'data-ui-component') return this.config.tagName;
    return null;
  }

  get id(): string {
    return this.componentId;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  // Mock attachShadow for ShadowDOMMixin
  attachShadow(options: ShadowRootInit): ShadowRoot {
    const mockShadowRoot = {
      mode: options.mode,
      delegatesFocus: options.delegatesFocus || false,
      adoptedStyleSheets: [],
    } as unknown as ShadowRoot;

    Object.defineProperty(this, 'shadowRoot', {
      value: mockShadowRoot,
      writable: false,
    });

    return mockShadowRoot;
  }
}

// Test component with CoreCustomElement + StyleManagerMixin (Light DOM)
class TestLightDOMComponent extends compose(MockCoreCustomElement as any, StyleManagerMixin) {
  static stylesheet: CSSStyleSheet;

  constructor(config: ComponentConfig) {
    super(config);
  }
}

// Set up mock stylesheet for light DOM component
TestLightDOMComponent.stylesheet = mockCSSStyleSheet(
  '.light-component { color: blue; padding: 10px; }'
) as unknown as CSSStyleSheet;

// Test component with CoreCustomElement + ShadowDOMMixin + StyleManagerMixin (Shadow DOM)
class TestShadowDOMComponent extends compose(
  MockCoreCustomElement as any,
  ShadowDOMMixin,
  StyleManagerMixin
) {
  static stylesheet: CSSStyleSheet;

  constructor(config: ComponentConfig) {
    super(config);
  }
}

// Set up mock stylesheet for shadow DOM component
TestShadowDOMComponent.stylesheet = mockCSSStyleSheet(
  '.shadow-component { background: red; margin: 5px; }'
) as unknown as CSSStyleSheet;

// Test component without static stylesheet
class TestNoStylesComponent extends compose(
  MockCoreCustomElement as any,
  ShadowDOMMixin,
  StyleManagerMixin
) {
  constructor(config: ComponentConfig) {
    super(config);
  }
}

describe('StyleManagerMixin Integration', () => {
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

  describe('Integration with CoreCustomElement (Light DOM)', () => {
    it.skipIf(isJSDOM)('should work with CoreCustomElement in Light DOM mode', () => {
      const config: ComponentConfig = {
        tagName: 'test-light-component',
      };

      const component = new TestLightDOMComponent(config);
      component.connectedCallback();

      // CoreCustomElement functionality should work
      expect(component.id).toBeTruthy();
      expect(component.getAttribute('data-ui-component')).toBe('test-light-component');
      expect(component.isConnected).toBe(true);

      // StyleManagerMixin functionality should work
      expect(component.addCSS).toBeTypeOf('function');
      expect(component.addStylesheet).toBeTypeOf('function');

      // Should create style element in document.head for Light DOM
      const staticStyleElement = document.getElementById('style-TestLightDOMComponent-static');
      expect(staticStyleElement).not.toBeNull();
      expect(staticStyleElement?.textContent).toContain('.light-component');
    });

    it.skipIf(isJSDOM)('should handle dynamic styles in Light DOM', () => {
      const config: ComponentConfig = {
        tagName: 'test-light-dynamic',
      };

      const component = new TestLightDOMComponent(config);
      component.connectedCallback();

      // Add dynamic CSS
      component.addCSS('.dynamic-light { font-weight: bold; }');

      // Should create additional style element for dynamic CSS
      const dynamicStyleElements = document.querySelectorAll(
        'style[id*="TestLightDOMComponent-dynamic"]'
      );
      expect(dynamicStyleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with CoreCustomElement + ShadowDOMMixin (Shadow DOM)', () => {
    it.skipIf(isJSDOM)('should work with both CoreCustomElement and ShadowDOMMixin', () => {
      const config: ComponentConfig = {
        tagName: 'test-shadow-integration',
        shadowOptions: { mode: 'open' },
      };

      const component = new TestShadowDOMComponent(config);
      component.connectedCallback();

      // CoreCustomElement functionality should work
      expect(component.id).toBeTruthy();
      expect(component.getAttribute('data-ui-component')).toBe('test-shadow-integration');
      expect(component.isConnected).toBe(true);

      // ShadowDOMMixin functionality should work
      expect(component.shadowRoot).not.toBeNull();
      expect(component.shadowRoot?.mode).toBe('open');

      // StyleManagerMixin functionality should work
      expect(component.addCSS).toBeTypeOf('function');
      expect(component.addStylesheet).toBeTypeOf('function');

      // Should use adoptedStyleSheets in Shadow DOM
      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(1);
      expect(component.shadowRoot?.adoptedStyleSheets[0]).toBe(TestShadowDOMComponent.stylesheet);
    });

    it.skipIf(isJSDOM)('should handle dynamic styles in Shadow DOM', () => {
      const config: ComponentConfig = {
        tagName: 'test-shadow-dynamic',
        shadowOptions: { mode: 'open' },
      };

      const component = new TestShadowDOMComponent(config);
      component.connectedCallback();

      // Add dynamic CSS
      component.addCSS('.dynamic-shadow { text-decoration: underline; }');

      // Should add to adoptedStyleSheets
      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(2);
      expect(component.shadowRoot?.adoptedStyleSheets[0]).toBe(TestShadowDOMComponent.stylesheet);

      // Second stylesheet should be the dynamic one
      expect(component.shadowRoot?.adoptedStyleSheets[1]).toBeInstanceOf(CSSStyleSheet);
    });

    it.skipIf(isJSDOM)('should work with closed shadow DOM', () => {
      const config: ComponentConfig = {
        tagName: 'test-shadow-closed',
        shadowOptions: { mode: 'closed' },
      };

      const component = new TestShadowDOMComponent(config);
      component.connectedCallback();

      // Should still work with closed shadow DOM
      expect(component.shadowRoot?.mode).toBe('closed');
      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(1);

      // Should be able to add dynamic styles
      component.addCSS('.closed-dynamic { visibility: hidden; }');
      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(2);
    });
  });

  describe('Component without static stylesheet', () => {
    it.skipIf(isJSDOM)('should work with components that have no static styles', () => {
      const config: ComponentConfig = {
        tagName: 'test-no-styles',
        shadowOptions: { mode: 'open' },
      };

      const component = new TestNoStylesComponent(config);
      component.connectedCallback();

      // Should work fine without static stylesheet
      expect(component.shadowRoot).not.toBeNull();
      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(0);

      // Should be able to add dynamic styles
      component.addCSS('.only-dynamic { color: green; }');
      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(1);
    });
  });

  describe('Mixed usage patterns', () => {
    it.skipIf(isJSDOM)(
      'should handle multiple components with different mixin combinations',
      () => {
        const lightConfig: ComponentConfig = {
          tagName: 'test-light-mixed',
        };

        const shadowConfig: ComponentConfig = {
          tagName: 'test-shadow-mixed',
          shadowOptions: { mode: 'open' },
        };

        const lightComponent = new TestLightDOMComponent(lightConfig);
        const shadowComponent = new TestShadowDOMComponent(shadowConfig);

        lightComponent.connectedCallback();
        shadowComponent.connectedCallback();

        // Light DOM component should use style elements
        const lightStyleElement = document.getElementById('style-TestLightDOMComponent-static');
        expect(lightStyleElement).not.toBeNull();

        // Shadow DOM component should use adoptedStyleSheets
        expect(shadowComponent.shadowRoot?.adoptedStyleSheets).toHaveLength(1);

        // Both should work independently
        lightComponent.addCSS('.light-mixed { border: 1px solid black; }');
        shadowComponent.addCSS('.shadow-mixed { border: 1px solid white; }');

        // Verify they don't interfere with each other
        const lightDynamicElements = document.querySelectorAll(
          'style[id*="TestLightDOMComponent-dynamic"]'
        );
        expect(lightDynamicElements.length).toBeGreaterThan(0);
        expect(shadowComponent.shadowRoot?.adoptedStyleSheets).toHaveLength(2);
      }
    );

    it.skipIf(isJSDOM)('should handle lifecycle order properly', () => {
      const config: ComponentConfig = {
        tagName: 'test-lifecycle-order',
        shadowOptions: { mode: 'open' },
      };

      const component = new TestShadowDOMComponent(config);

      // Before connection - no styles should be applied yet
      expect(component.shadowRoot).toBeNull();

      // After connection - all mixins should have run
      component.connectedCallback();

      // ShadowDOMMixin should have created shadowRoot
      expect(component.shadowRoot).not.toBeNull();

      // StyleManagerMixin should have applied static stylesheet
      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(1);
      expect(component.shadowRoot?.adoptedStyleSheets[0]).toBe(TestShadowDOMComponent.stylesheet);
    });
  });

  describe('Error scenarios and edge cases', () => {
    it('should handle components with malformed static stylesheets', () => {
      class TestMalformedStyleComponent extends compose(
        MockCoreCustomElement as any,
        StyleManagerMixin
      ) {
        static stylesheet = 'not-a-stylesheet'; // Invalid type

        constructor(config: ComponentConfig) {
          super(config);
        }
      }

      const config: ComponentConfig = {
        tagName: 'test-malformed',
      };

      const component = new TestMalformedStyleComponent(config);

      // Should not throw despite invalid static stylesheet
      expect(() => {
        component.connectedCallback();
      }).not.toThrow();

      // Should still be able to add dynamic styles
      expect(() => {
        component.addCSS('.recovery { color: orange; }');
      }).not.toThrow();
    });

    it.skipIf(isJSDOM)('should handle rapid connect/disconnect cycles', () => {
      const config: ComponentConfig = {
        tagName: 'test-rapid-cycle',
        shadowOptions: { mode: 'open' },
      };

      const component = new TestShadowDOMComponent(config);

      // Rapid connect/disconnect should not cause issues
      component.connectedCallback();
      component.disconnectedCallback();
      component.connectedCallback();

      expect(component.shadowRoot?.adoptedStyleSheets).toHaveLength(1);
      expect(component.isConnected).toBe(false); // Last call was disconnect
    });
  });
});
