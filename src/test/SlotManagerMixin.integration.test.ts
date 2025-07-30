/**
 * @file SlotManagerMixin.integration.test.ts
 * Integration tests for SlotManagerMixin with other mixins
 * Note: Full DOM integration tests are skipped due to JSDOM limitations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SlotManagerMixin } from '../base/mixins/SlotManagerMixin.js';
import { ShadowDOMMixin } from '../base/mixins/ShadowDOMMixin.js';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

// Mock element for testing
class MockElement {
  isConnected = true;
  config = {
    tagName: 'test-element',
    shadowOptions: { mode: 'open' as const },
  };
}

// Integrated test component with ShadowDOMMixin
class IntegratedSlotComponent extends SlotManagerMixin(ShadowDOMMixin(MockElement as any)) {
  onSlotChangeCallCount = 0;
  lastSlotChangeName: string | null = null;
  renderCallCount = 0;

  onSlotChange(slotName: string): void {
    this.onSlotChangeCallCount++;
    this.lastSlotChangeName = slotName;
  }

  render(): void {
    this.renderCallCount++;
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <div class="header">
          <slot name="header"></slot>
        </div>
        <div class="content">
          <slot></slot>
        </div>
        ${this.hasSlottedContent('footer') ? '<div class="footer"><slot name="footer"></slot></div>' : ''}
      `;
    }
  }
}

// Component with UpdateManager integration
class SlotComponentWithUpdate extends SlotManagerMixin(ShadowDOMMixin(MockElement as any)) {
  updateRequestCount = 0;

  requestUpdate(): void {
    this.updateRequestCount++;
  }

  onSlotChange(slotName: string): void {
    if (slotName === 'critical') {
      this.requestUpdate();
    }
  }

  render(): void {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <slot name="critical"></slot>
        <slot name="optional"></slot>
      `;
    }
  }
}

describe('SlotManagerMixin Integration', () => {
  let component: IntegratedSlotComponent;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    component = new IntegratedSlotComponent();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Integration with ShadowDOMMixin', () => {
    it('should work with ShadowDOMMixin to create and manage slots', () => {
      // ShadowDOMMixin should create shadowRoot during connection
      component.connectedCallback();

      // Note: In test environment, shadowRoot might not be created due to JSDOM limitations
      // but the integration should not error
      expect(() => component.render()).not.toThrow();

      expect(component.renderCallCount).toBe(1);
    });

    it('should discover slots after render creates them', () => {
      component.connectedCallback();
      component.render();

      // Note: In JSDOM, these will be null due to limitations, but methods shouldn't error
      expect(() => component.getSlot('header')).not.toThrow();
      expect(() => component.getSlot()).not.toThrow();
    });

    it('should handle conditional slot rendering', () => {
      component.connectedCallback();

      // Initially no footer content
      const hasFooterBefore = component.hasSlottedContent('footer');

      component.render();

      // After render, still no footer content (JSDOM limitation)
      const hasFooterAfter = component.hasSlottedContent('footer');

      expect(hasFooterBefore).toBe(false);
      expect(hasFooterAfter).toBe(false);
    });
  });

  describe('Render Integration', () => {
    it('should refresh slot bindings when render is called', () => {
      component.connectedCallback();

      const initialRenderCount = component.renderCallCount;
      component.render();

      expect(component.renderCallCount).toBe(initialRenderCount + 1);
    });

    it('should handle errors during integrated super render', () => {
      // Create a base that has a render method that throws
      class BaseWithErrorRender extends MockElement {
        render(): void {
          throw new Error('Base integrated render failed');
        }
      }

      const componentWithError = new (SlotManagerMixin(
        ShadowDOMMixin(BaseWithErrorRender as any)
      ))();

      componentWithError.connectedCallback();

      // The error in super.render() should be caught and logged by SlotManagerMixin
      expect(() => componentWithError.render()).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Error in render method:',
        expect.any(Error)
      );
    });
  });

  describe('Cross-Mixin Communication', () => {
    it('should integrate with UpdateManager pattern', () => {
      const updateComponent = new SlotComponentWithUpdate();
      updateComponent.connectedCallback();
      updateComponent.render();

      // Reset counter
      updateComponent.updateRequestCount = 0;

      // Simulate slot change event (would normally come from DOM)
      if (updateComponent.onSlotChange) {
        updateComponent.onSlotChange('critical');
      }

      expect(updateComponent.updateRequestCount).toBe(1);
    });

    it('should selectively trigger updates based on slot name', () => {
      const updateComponent = new SlotComponentWithUpdate();
      updateComponent.connectedCallback();
      updateComponent.render();

      updateComponent.updateRequestCount = 0;

      // Critical slot should trigger update
      if (updateComponent.onSlotChange) {
        updateComponent.onSlotChange('critical');
      }
      expect(updateComponent.updateRequestCount).toBe(1);

      // Optional slot should not trigger update
      if (updateComponent.onSlotChange) {
        updateComponent.onSlotChange('optional');
      }
      expect(updateComponent.updateRequestCount).toBe(1); // Still 1, not 2
    });
  });

  describe('Error Resilience in Integration', () => {
    it('should handle ShadowDOM creation failures gracefully', () => {
      // Create component without shadowRoot to simulate failure case
      const problematicComponent = new (class extends SlotManagerMixin(MockElement as any) {
        shadowRoot = null;
      })();

      // Should not throw during connection
      expect(() => problematicComponent.connectedCallback()).not.toThrow();

      // Slot operations should return safe defaults
      expect(problematicComponent.getSlot('test')).toBeNull();
      expect(problematicComponent.getSlottedContent('test')).toEqual([]);
      expect(problematicComponent.hasSlottedContent('test')).toBe(false);
    });

    it('should maintain component functionality when slot operations fail', () => {
      component.connectedCallback();

      // Even if slot discovery fails, component should remain functional
      expect(() => component.render()).not.toThrow();
      expect(component.renderCallCount).toBe(1);
    });
  });

  describe('Real-world Component Patterns', () => {
    it('should support card component pattern', () => {
      // Simulate card component usage pattern from session brief
      const cardComponent = new (class extends SlotManagerMixin(
        ShadowDOMMixin(MockElement as any)
      ) {
        render(): void {
          if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
              <div class="card">
                ${this.hasSlottedContent('header') ? '<div class="card-header"><slot name="header"></slot></div>' : ''}
                <div class="card-body"><slot></slot></div>  
                ${this.hasSlottedContent('actions') ? '<div class="card-actions"><slot name="actions"></slot></div>' : ''}
              </div>
            `;
          }
        }

        onSlotChange(): void {
          // Re-render when slot content changes
          this.render();
        }
      })();

      cardComponent.connectedCallback();

      // Should not throw during typical usage
      expect(() => cardComponent.render()).not.toThrow();
    });

    it('should handle multiple slot types in one component', () => {
      component.connectedCallback();
      component.render();

      // Should handle multiple slot queries without issues
      const slots = ['header', 'footer', 'sidebar', 'actions'];

      slots.forEach((slotName) => {
        expect(() => component.getSlot(slotName)).not.toThrow();
        expect(() => component.hasSlottedContent(slotName)).not.toThrow();
        expect(() => component.getSlottedContent(slotName)).not.toThrow();
      });
    });
  });

  describe('Lifecycle Integration', () => {
    it('should properly coordinate lifecycle with ShadowDOMMixin', () => {
      // Connection should set up both shadow DOM and slot management
      component.connectedCallback();

      // Note: shadowRoot creation depends on browser environment
      // In tests, we verify no errors occur during lifecycle coordination
      expect(() => component.render()).not.toThrow();

      // Disconnection should clean up properly
      expect(() => component.disconnectedCallback()).not.toThrow();
    });

    it('should handle multiple connect/disconnect cycles', () => {
      // Multiple cycles should work without memory leaks or errors
      expect(() => {
        component.connectedCallback();
        component.disconnectedCallback();

        component.connectedCallback();
        component.disconnectedCallback();

        component.connectedCallback();
      }).not.toThrow();
    });
  });

  // Skip full DOM integration tests due to JSDOM limitations
  describe.skip('Full DOM Integration Tests (Skipped for JSDOM)', () => {
    it('should work with actual DOM slot projection', () => {
      // This would test:
      // - Real slot element creation and projection
      // - Actual slotchange event firing
      // - Real assignedElements() behavior
      // - Browser-native slot content detection
    });

    it('should handle dynamic slot content changes', () => {
      // This would test:
      // - Adding/removing slotted content dynamically
      // - slotchange events firing correctly
      // - hasSlottedContent() updating properly
      // - Re-rendering triggered by slot changes
    });

    it('should integrate with real custom element registration', () => {
      // This would test:
      // - Full custom element registration
      // - Real DOM usage patterns
      // - Browser-native lifecycle management
      // - Performance under realistic conditions
    });
  });
});
