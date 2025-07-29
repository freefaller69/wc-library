/**
 * @file UpdateManagerMixin.integration.test.ts
 * Integration tests for UpdateManagerMixin with other mixins
 * Note: Full DOM integration tests are skipped due to JSDOM limitations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UpdateManagerMixin } from '../base/mixins/UpdateManagerMixin.js';
import { AttributeManagerMixin } from '../base/mixins/AttributeManagerMixin.js';

/* eslint-disable @typescript-eslint/no-unsafe-call */

// Mock element for testing
class MockElement {
  isConnected = true;
  config = {
    tagName: 'test-element',
    dynamicAttributes: ['disabled', 'loading'],
    staticAttributes: ['variant'],
  };
}

// Integrated test component
class IntegratedComponent extends UpdateManagerMixin(AttributeManagerMixin(MockElement as any)) {
  renderCallCount = 0;
  classUpdateCount = 0;

  static get observedAttributes() {
    return ['disabled', 'loading'];
  }

  render(): void {
    this.renderCallCount++;
  }

  updateComponentClasses(): void {
    this.classUpdateCount++;
  }
}

describe('UpdateManagerMixin Integration', () => {
  let component: IntegratedComponent;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    component = new IntegratedComponent();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Integration with AttributeManagerMixin', () => {
    it('should trigger updates when attributes change', async () => {
      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);
      expect(component.classUpdateCount).toBe(1);
    });

    it('should batch multiple rapid attribute changes', async () => {
      component.requestUpdate();
      component.requestUpdate();
      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);
      expect(component.classUpdateCount).toBe(1);
    });

    it('should maintain proper call order', async () => {
      const callOrder: string[] = [];

      const originalUpdate = component.updateComponentClasses.bind(component);
      const originalRender = component.render.bind(component);

      component.updateComponentClasses = () => {
        callOrder.push('updateComponentClasses');
        originalUpdate();
      };

      component.render = () => {
        callOrder.push('render');
        originalRender();
      };

      component.requestUpdate();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(callOrder).toEqual(['updateComponentClasses', 'render']);
    });
  });

  describe('Error Resilience', () => {
    it('should handle class manager errors gracefully', async () => {
      component.updateComponentClasses = () => {
        throw new Error('Class manager failed');
      };

      component.requestUpdate();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'UpdateManagerMixin: Error in updateComponentClasses:',
        expect.any(Error)
      );
    });

    it('should handle render errors gracefully', async () => {
      component.render = () => {
        component.renderCallCount++;
        throw new Error('Render failed');
      };

      component.requestUpdate();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);
      expect(component.classUpdateCount).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'UpdateManagerMixin: Error in render method:',
        expect.any(Error)
      );
    });
  });

  describe('Component Patterns', () => {
    it('should handle typical button component workflow', async () => {
      component.renderCallCount = 0;
      component.classUpdateCount = 0;

      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.classUpdateCount).toBe(1);
      expect(component.renderCallCount).toBe(1);
    });

    it('should efficiently batch state changes', async () => {
      component.renderCallCount = 0;
      component.classUpdateCount = 0;

      component.requestUpdate();
      component.requestUpdate();
      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 5));

      expect(component.renderCallCount).toBe(1);
      expect(component.classUpdateCount).toBe(1);
    });
  });

  // Skip full DOM integration tests due to JSDOM limitations
  describe.skip('Full DOM Integration Tests (Skipped for JSDOM)', () => {
    it('should work with actual custom element registration and DOM', () => {
      // This would test:
      // - Real custom element registration
      // - Actual DOM attribute changes
      // - Browser-native attributeChangedCallback
    });

    it('should integrate with ShadowDOMMixin for complete component', () => {
      // This would test:
      // - ShadowDOM + AttributeManager + UpdateManager integration
      // - Real DOM updates and rendering
    });
  });
});
