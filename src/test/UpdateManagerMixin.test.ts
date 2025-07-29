/**
 * @file UpdateManagerMixin.test.ts
 * Unit tests for UpdateManagerMixin
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UpdateManagerMixin } from '../base/mixins/UpdateManagerMixin.js';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

// Mock HTMLElement for testing
class MockElement {
  isConnected = true;
  config = { tagName: 'test-element' };
}

// Simple test component
class TestComponent extends UpdateManagerMixin(MockElement as any) {
  renderCallCount = 0;
  renderError: Error | null = null;
  classUpdateCount = 0;
  classUpdateError: Error | null = null;

  render(): void {
    this.renderCallCount++;
    if (this.renderError) throw this.renderError;
  }

  updateComponentClasses(): void {
    this.classUpdateCount++;
    if (this.classUpdateError) throw this.classUpdateError;
  }
}

// Component without render method
class NoRenderComponent extends UpdateManagerMixin(MockElement as any) {
  classUpdateCount = 0;

  updateComponentClasses(): void {
    this.classUpdateCount++;
  }
}

// Component without class manager
class NoClassManagerComponent extends UpdateManagerMixin(MockElement as any) {
  renderCallCount = 0;

  render(): void {
    this.renderCallCount++;
  }
}

describe('UpdateManagerMixin', () => {
  let component: TestComponent;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    component = new TestComponent();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Update Batching', () => {
    it('should batch multiple update requests', async () => {
      component.requestUpdate();
      component.requestUpdate();
      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);
      expect(component.classUpdateCount).toBe(1);
    });

    it('should not update when disconnected', async () => {
      component.isConnected = false;
      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(0);
      expect(component.classUpdateCount).toBe(0);
    });

    it('should allow new updates after completion', async () => {
      component.requestUpdate();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);

      component.requestUpdate();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle render errors gracefully', async () => {
      component.renderError = new Error('Render failed');
      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'UpdateManagerMixin: Error in render method:',
        expect.any(Error)
      );
    });

    it('should handle class update errors gracefully', async () => {
      component.classUpdateError = new Error('Class update failed');
      component.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.classUpdateCount).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'UpdateManagerMixin: Error in updateComponentClasses:',
        expect.any(Error)
      );
    });

    it('should continue updates even with both errors', async () => {
      component.renderError = new Error('Render failed');
      component.classUpdateError = new Error('Class update failed');

      component.requestUpdate();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(component.renderCallCount).toBe(1);
      expect(component.classUpdateCount).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Component Variations', () => {
    it('should work without render method', async () => {
      const noRenderComponent = new NoRenderComponent();
      noRenderComponent.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(noRenderComponent.classUpdateCount).toBe(1);
    });

    it('should work without class manager', async () => {
      const noClassComponent = new NoClassManagerComponent();
      noClassComponent.requestUpdate();

      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(noClassComponent.renderCallCount).toBe(1);
    });
  });

  describe('Update Lifecycle', () => {
    it('should call updateComponentClasses before render', async () => {
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

  describe('Interface Compliance', () => {
    it('should implement UpdateManagerMixinInterface', () => {
      expect(typeof component.requestUpdate).toBe('function');
      expect(typeof component.render).toBe('function');
    });

    it('should maintain backward compatibility', () => {
      expect(() => component.requestUpdate()).not.toThrow();
    });
  });
});
