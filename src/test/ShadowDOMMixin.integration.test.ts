/**
 * Integration tests for ShadowDOMMixin with CoreCustomElement
 */

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, beforeEach } from 'vitest';
import { ShadowDOMMixin } from '../base/mixins/ShadowDOMMixin.js';
import { compose } from '../base/utilities/mixin-composer.js';
import type { ComponentConfig } from '../types/component.js';

// Mock CoreCustomElement for testing without requiring custom element registration
class MockCoreCustomElement {
  config: ComponentConfig;
  componentId: string;
  private _isConnected = false;
  shadowRoot: ShadowRoot | null = null;

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

  attachShadow(options: ShadowRootInit): ShadowRoot {
    // Mock implementation for tests
    const mockShadowRoot = {
      mode: options.mode,
      delegatesFocus: options.delegatesFocus || false,
    } as ShadowRoot;
    this.shadowRoot = mockShadowRoot;
    return mockShadowRoot;
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

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Required abstract method implementation
  }
}

// Test component integrating MockCoreCustomElement with ShadowDOMMixin
class TestIntegrationComponent extends compose(MockCoreCustomElement as any, ShadowDOMMixin) {
  constructor(config: ComponentConfig) {
    super(config);
  }
}

describe('ShadowDOMMixin Integration with CoreCustomElement', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('Basic integration', () => {
    it('should create component with shadow DOM when useShadowDOM is true', () => {
      const config: ComponentConfig = {
        tagName: 'integration-shadow',
        useShadowDOM: true,
      };

      const component = new TestIntegrationComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot).not.toBeNull();
      expect(component.hasShadowDOM).toBe(true);
      expect(component.isConnected).toBe(true);
      expect(component.getAttribute('data-ui-component')).toBe('integration-shadow');
    });

    it('should create component without shadow DOM when useShadowDOM is false', () => {
      const config: ComponentConfig = {
        tagName: 'integration-light',
        useShadowDOM: false,
      };

      const component = new TestIntegrationComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot).toBeNull();
      expect(component.hasShadowDOM).toBe(false);
      expect(component.isConnected).toBe(true);
      expect(component.getAttribute('data-ui-component')).toBe('integration-light');
    });
  });

  describe('Lifecycle integration', () => {
    it('should properly call both CoreCustomElement and ShadowDOMMixin lifecycle methods', () => {
      const config: ComponentConfig = {
        tagName: 'integration-lifecycle',
        useShadowDOM: true,
      };

      const component = new TestIntegrationComponent(config);

      // Before connection
      expect(component.isConnected).toBe(false);
      expect(component.shadowRoot).toBeNull();

      // After connection
      component.connectedCallback();
      expect(component.isConnected).toBe(true);
      expect(component.shadowRoot).not.toBeNull();
    });

    it('should handle disconnection properly', () => {
      const config: ComponentConfig = {
        tagName: 'integration-disconnect',
        useShadowDOM: true,
      };

      const component = new TestIntegrationComponent(config);
      component.connectedCallback();

      expect(component.isConnected).toBe(true);
      expect(component.shadowRoot).not.toBeNull();

      component.disconnectedCallback();
      expect(component.isConnected).toBe(false);
      // Shadow root should still exist after disconnection
      expect(component.shadowRoot).not.toBeNull();
    });
  });

  describe('Configuration options', () => {
    it('should respect custom shadow options in integration', () => {
      const config: ComponentConfig = {
        tagName: 'integration-custom',
        useShadowDOM: true,
        shadowOptions: {
          mode: 'closed',
          delegatesFocus: true,
        },
      };

      const component = new TestIntegrationComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot?.mode).toBe('closed');
      expect(component.shadowRoot?.delegatesFocus).toBe(true);
      expect(component.hasShadowDOM).toBe(true);
    });

    it('should work with observed attributes configuration', () => {
      const config: ComponentConfig = {
        tagName: 'integration-attrs',
        useShadowDOM: true,
        observedAttributes: ['test-attr'],
      };

      const component = new TestIntegrationComponent(config);
      component.connectedCallback();

      expect(component.shadowRoot).not.toBeNull();
      expect(component.getAttribute('data-ui-component')).toBe('integration-attrs');
    });
  });

  describe('Component ID and attributes', () => {
    it('should maintain CoreCustomElement functionality with shadow DOM', () => {
      const config: ComponentConfig = {
        tagName: 'integration-attrs-test',
        useShadowDOM: true,
      };

      const component = new TestIntegrationComponent(config);
      component.connectedCallback();

      // CoreCustomElement functionality should work
      expect(component.id).toBeTruthy();
      expect(component.getAttribute('data-ui-component')).toBe('integration-attrs-test');

      // ShadowDOMMixin functionality should work
      expect(component.shadowRoot).not.toBeNull();
      expect(component.hasShadowDOM).toBe(true);
    });

    it('should maintain CoreCustomElement functionality without shadow DOM', () => {
      const config: ComponentConfig = {
        tagName: 'integration-no-shadow-test',
        useShadowDOM: false,
      };

      const component = new TestIntegrationComponent(config);
      component.connectedCallback();

      // CoreCustomElement functionality should work
      expect(component.id).toBeTruthy();
      expect(component.getAttribute('data-ui-component')).toBe('integration-no-shadow-test');

      // ShadowDOMMixin should indicate no shadow DOM
      expect(component.shadowRoot).toBeNull();
      expect(component.hasShadowDOM).toBe(false);
    });
  });
});
