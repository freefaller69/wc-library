/**
 * @file EventManagerMixin.test.ts
 * Unit tests for EventManagerMixin
 */

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi } from 'vitest';
import { EventManagerMixin } from '../base/mixins/EventManagerMixin.js';
import { compose } from '../base/utilities/mixin-composer.js';
import type { ComponentConfig } from '../types/component.js';

// Mock base class for testing - simulates HTMLElement but works in JSDOM
class MockHTMLElement {
  protected config: ComponentConfig;
  private _listeners = new Map<string, EventListener[]>();
  shadowRoot: ShadowRoot | null = null;

  constructor(config: ComponentConfig) {
    this.config = config;
  }

  addEventListener(
    type: string,
    listener: EventListener,
    _options?: AddEventListenerOptions
  ): void {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }
    this._listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    const listeners = this._listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this._listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
    return !event.defaultPrevented;
  }
}

// Test component that combines MockHTMLElement with EventManagerMixin
class TestEventComponent extends compose(MockHTMLElement as any, EventManagerMixin) {
  constructor(config: ComponentConfig) {
    super(config);
  }
}

describe('EventManagerMixin', () => {
  describe('Validation Tests', () => {
    // Test validation without requiring DOM functionality
    it('should validate event names correctly', () => {
      const component = new TestEventComponent({ tagName: 'test-button' });

      // Invalid names should throw
      expect(() => (component as any).dispatchCustomEvent('', null)).toThrow('Invalid event name');
      expect(() => (component as any).dispatchCustomEvent('  ', null)).toThrow(
        'Invalid event name'
      );
      expect(() => (component as any).dispatchCustomEvent('event with spaces', null)).toThrow(
        'Invalid event name'
      );
      expect(() => (component as any).dispatchCustomEvent('event.with.dots', null)).toThrow(
        'Invalid event name'
      );
      expect(() => (component as any).dispatchCustomEvent('event@special', null)).toThrow(
        'Invalid event name'
      );
    });

    it('should validate config exists for dispatch', () => {
      const invalidComponent = Object.create(TestEventComponent.prototype);
      invalidComponent.config = null;
      invalidComponent._eventNameCache = new Map();
      invalidComponent._eventPrefix = null;
      invalidComponent._componentListeners = new Map();

      expect(() => invalidComponent.dispatchCustomEvent('test', null)).toThrow(
        'Component config with tagName is required for event operations'
      );
    });

    it('should validate handler is a function for addComponentListener', () => {
      const component = new TestEventComponent({ tagName: 'test-button' });

      expect(() => (component as any).addComponentListener('test', null)).toThrow(
        'Event handler must be a function'
      );
      expect(() => (component as any).addComponentListener('test', 'not-a-function')).toThrow(
        'Event handler must be a function'
      );
      expect(() => (component as any).addComponentListener('test', {})).toThrow(
        'Event handler must be a function'
      );
    });

    it('should validate event names for addComponentListener', () => {
      const component = new TestEventComponent({ tagName: 'test-button' });
      const handler = vi.fn();

      expect(() => (component as any).addComponentListener('', handler)).toThrow(
        'Invalid event name'
      );
      expect(() => (component as any).addComponentListener('invalid space', handler)).toThrow(
        'Invalid event name'
      );
      expect(() => (component as any).addComponentListener('invalid.dot', handler)).toThrow(
        'Invalid event name'
      );
    });

    it('should require valid config for removeComponentListener', () => {
      const invalidComponent = Object.create(TestEventComponent.prototype);
      invalidComponent.config = null;
      invalidComponent._eventNameCache = new Map();
      invalidComponent._eventPrefix = null;
      invalidComponent._componentListeners = new Map();
      const handler = vi.fn();

      expect(() => invalidComponent.removeComponentListener('test', handler)).toThrow(
        'Component config with tagName is required for event operations'
      );
    });

    it('should handle empty listener cleanup', () => {
      const component = new TestEventComponent({ tagName: 'test-button' });

      expect(() => (component as any).removeAllComponentListeners()).not.toThrow();
      expect((component as any)._componentListeners.size).toBe(0);
    });
  });

  // Skip all DOM-related tests due to JSDOM limitations with custom elements
  // These should be enabled when Playwright testing is added
  describe.skip('DOM Functionality Tests (Skipped for JSDOM)', () => {
    it('should dispatch events with correct naming pattern', () => {
      // This test would work with proper DOM environment
    });

    it('should handle event listeners correctly', () => {
      // This test would work with proper DOM environment
    });

    // ... other DOM-dependent tests
  });
});
