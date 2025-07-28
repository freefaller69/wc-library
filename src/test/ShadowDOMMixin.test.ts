/**
 * Unit tests for ShadowDOMMixin
 */

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShadowDOMMixin } from '../base/mixins/ShadowDOMMixin.js';
import { compose } from '../base/utilities/mixin-composer.js';
import type { ComponentConfig } from '../types/component.js';

// Mock base class for testing - doesn't extend HTMLElement in tests
class MockBaseElement {
  config: ComponentConfig;
  private _isConnected = false;
  shadowRoot: ShadowRoot | null = null;

  constructor(config: ComponentConfig) {
    this.config = config;
  }

  connectedCallback(): void {
    this._isConnected = true;
  }

  attachShadow(options: ShadowRootInit): ShadowRoot {
    // Mock implementation for tests
    const mockShadowRoot = {
      mode: options.mode,
      delegatesFocus: options.delegatesFocus || false,
    } as ShadowRoot;
    this.shadowRoot = mockShadowRoot;
    return mockShadowRoot;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }
}

// Test component with ShadowDOMMixin
class TestShadowComponent extends compose(MockBaseElement as any, ShadowDOMMixin) {
  constructor(config: ComponentConfig) {
    super(config);
  }
}

describe('ShadowDOMMixin', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Shadow DOM creation', () => {
    it('should create shadowRoot when useShadowDOM is true', () => {
      const config: ComponentConfig = {
        tagName: 'test-shadow',
        useShadowDOM: true,
      };

      const component = new TestShadowComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot).not.toBeNull();
      expect(component.hasShadowDOM).toBe(true);
    });

    it('should not create shadowRoot when useShadowDOM is false', () => {
      const config: ComponentConfig = {
        tagName: 'test-light',
        useShadowDOM: false,
      };

      const component = new TestShadowComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot).toBeNull();
      expect(component.hasShadowDOM).toBe(false);
    });

    it('should not create shadowRoot when useShadowDOM is undefined', () => {
      const config: ComponentConfig = {
        tagName: 'test-default',
      };

      const component = new TestShadowComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot).toBeNull();
      expect(component.hasShadowDOM).toBe(false);
    });
  });

  describe('Shadow DOM options', () => {
    it('should use default options when shadowOptions is not provided', () => {
      const config: ComponentConfig = {
        tagName: 'test-default-options',
        useShadowDOM: true,
      };

      const component = new TestShadowComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot?.mode).toBe('open');
    });

    it('should use custom shadowOptions when provided', () => {
      const config: ComponentConfig = {
        tagName: 'test-custom-options',
        useShadowDOM: true,
        shadowOptions: { mode: 'closed', delegatesFocus: true },
      };

      const component = new TestShadowComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot?.mode).toBe('closed');
      expect(component.shadowRoot?.delegatesFocus).toBe(true);
    });
  });

  describe('hasShadowDOM property', () => {
    it('should return true when useShadowDOM is true', () => {
      const config: ComponentConfig = {
        tagName: 'test-has-shadow',
        useShadowDOM: true,
      };

      const component = new TestShadowComponent(config);
      expect(component.hasShadowDOM).toBe(true);
    });

    it('should return false when useShadowDOM is false', () => {
      const config: ComponentConfig = {
        tagName: 'test-no-shadow',
        useShadowDOM: false,
      };

      const component = new TestShadowComponent(config);
      expect(component.hasShadowDOM).toBe(false);
    });

    it('should return false when useShadowDOM is undefined', () => {
      const config: ComponentConfig = {
        tagName: 'test-undefined-shadow',
      };

      const component = new TestShadowComponent(config);
      expect(component.hasShadowDOM).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle attachShadow failure gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      class FailingMockElement {
        config: ComponentConfig;
        shadowRoot: ShadowRoot | null = null;

        constructor(config: ComponentConfig) {
          this.config = config;
        }

        connectedCallback(): void {}

        attachShadow(): ShadowRoot {
          throw new Error('attachShadow not supported');
        }
      }

      class FailingTestComponent extends compose(FailingMockElement as any, ShadowDOMMixin) {
        constructor(config: ComponentConfig) {
          super(config);
        }
      }

      const config: ComponentConfig = {
        tagName: 'failing-shadow',
        useShadowDOM: true,
      };

      const component = new FailingTestComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot).toBeNull();
      expect(component.hasShadowDOM).toBe(true); // Config still says true
      expect(consoleSpy).toHaveBeenCalledWith(
        'ShadowDOMMixin: Failed to create shadow DOM for component failing-shadow:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should warn and ignore duplicate attachShadow calls', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config: ComponentConfig = {
        tagName: 'duplicate-shadow',
        useShadowDOM: true,
      };

      const component = new TestShadowComponent(config);
      component.connectedCallback();

      const firstShadowRoot = component.shadowRoot;
      expect(firstShadowRoot).not.toBeNull();

      // Attempt to setup shadow DOM again
      component.connectedCallback();

      expect(component.shadowRoot).toBe(firstShadowRoot);
      expect(consoleSpy).toHaveBeenCalledWith(
        'ShadowDOMMixin: Shadow DOM already exists for component duplicate-shadow. Ignoring duplicate setup.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('lifecycle integration', () => {
    it('should call super.connectedCallback if it exists', () => {
      let superCalled = false;

      class TestBase {
        config: ComponentConfig;
        shadowRoot: ShadowRoot | null = null;

        constructor(config: ComponentConfig) {
          this.config = config;
        }

        connectedCallback(): void {
          superCalled = true;
        }

        attachShadow(options: ShadowRootInit): ShadowRoot {
          const mockShadowRoot = {
            mode: options.mode,
            delegatesFocus: options.delegatesFocus || false,
          } as ShadowRoot;
          this.shadowRoot = mockShadowRoot;
          return mockShadowRoot;
        }
      }

      class TestComponent extends compose(TestBase as any, ShadowDOMMixin) {
        constructor(config: ComponentConfig) {
          super(config);
        }
      }

      const config: ComponentConfig = {
        tagName: 'test-lifecycle',
        useShadowDOM: true,
      };

      const component = new TestComponent(config);
      component.connectedCallback();

      expect(superCalled).toBe(true);
      expect(component.shadowRoot).not.toBeNull();
    });

    it('should not create shadowRoot multiple times on multiple connects', () => {
      const config: ComponentConfig = {
        tagName: 'test-multiple-connect',
        useShadowDOM: true,
      };

      const component = new TestShadowComponent(config);
      component.connectedCallback();

      const firstShadowRoot = component.shadowRoot;
      expect(firstShadowRoot).not.toBeNull();

      // Simulate reconnection
      component.connectedCallback();

      expect(component.shadowRoot).toBe(firstShadowRoot);
    });
  });
});
