/**
 * @file SlotManagerMixin.test.ts
 * Unit tests for SlotManagerMixin
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SlotManagerMixin } from '../base/mixins/SlotManagerMixin.js';

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/unbound-method */

// Mock HTMLElement for testing
class MockElement {
  isConnected = true;
  shadowRoot: ShadowRoot | null = null;
  config = { tagName: 'test-element' };

  // Mock shadow root methods
  createMockShadowRoot() {
    this.shadowRoot = {
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
    } as any;
    return this.shadowRoot;
  }
}

// Test component with SlotManagerMixin
class TestSlotComponent extends SlotManagerMixin(MockElement as any) {
  onSlotChangeCallCount = 0;
  lastSlotChangeData: { slotName: string; event: Event } | null = null;

  onSlotChange(_slotName: string, event: Event): void {
    this.onSlotChangeCallCount++;
    this.lastSlotChangeData = { slotName: _slotName, event };
  }
}

// Test component without onSlotChange callback
class TestSlotComponentNoCallback extends SlotManagerMixin(MockElement as any) {
  // No onSlotChange implementation
}

// Test component with UpdateManager
class TestSlotComponentWithUpdate extends SlotManagerMixin(MockElement as any) {
  updateRequestCount = 0;

  requestUpdate(): void {
    this.updateRequestCount++;
  }

  onSlotChange(_slotName: string): void {
    // Demonstrate UpdateManager integration
    this.requestUpdate();
  }
}

describe('SlotManagerMixin', () => {
  let component: TestSlotComponent;
  let mockSlot: HTMLSlotElement;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    component = new TestSlotComponent();
    component.createMockShadowRoot();

    // Mock slot element
    mockSlot = {
      getAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      assignedElements: vi.fn(),
    } as any;
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Slot Discovery and Access', () => {
    it('should get slot by name', () => {
      const mockQuerySelector = vi.fn().mockReturnValue(mockSlot);
      component.shadowRoot!.querySelector = mockQuerySelector;

      const result = component.getSlot('header');

      expect(mockQuerySelector).toHaveBeenCalledWith('slot[name="header"]');
      expect(result).toBe(mockSlot);
    });

    it('should get default slot when no name provided', () => {
      const mockQuerySelector = vi.fn().mockReturnValue(mockSlot);
      component.shadowRoot!.querySelector = mockQuerySelector;

      const result = component.getSlot();

      expect(mockQuerySelector).toHaveBeenCalledWith('slot:not([name])');
      expect(result).toBe(mockSlot);
    });

    it('should return null when slot not found', () => {
      const mockQuerySelector = vi.fn().mockReturnValue(null);
      component.shadowRoot!.querySelector = mockQuerySelector;

      const result = component.getSlot('nonexistent');

      expect(result).toBeNull();
    });

    it('should warn and return null when no shadow root', () => {
      component.shadowRoot = null;

      const result = component.getSlot('header');

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Slots require Shadow DOM. Consider using ShadowDOMMixin.'
      );
    });

    it('should handle errors in slot query gracefully', () => {
      const mockQuerySelector = vi.fn().mockImplementation(() => {
        throw new Error('Query failed');
      });
      component.shadowRoot!.querySelector = mockQuerySelector;

      const result = component.getSlot('header');

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Error finding slot "header":',
        expect.any(Error)
      );
    });
  });

  describe('Slotted Content Management', () => {
    it('should get slotted content for named slot', () => {
      const mockElements = [document.createElement('div'), document.createElement('span')];
      const mockQuerySelector = vi.fn().mockReturnValue(mockSlot);
      component.shadowRoot!.querySelector = mockQuerySelector;
      mockSlot.assignedElements = vi.fn().mockReturnValue(mockElements);

      const result = component.getSlottedContent('header');

      expect(result).toEqual(mockElements);
      expect(mockSlot.assignedElements).toHaveBeenCalled();
    });

    it('should return empty array when slot not found', () => {
      const mockQuerySelector = vi.fn().mockReturnValue(null);
      component.shadowRoot!.querySelector = mockQuerySelector;

      const result = component.getSlottedContent('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle errors in assignedElements gracefully', () => {
      const mockQuerySelector = vi.fn().mockReturnValue(mockSlot);
      component.shadowRoot!.querySelector = mockQuerySelector;
      mockSlot.assignedElements = vi.fn().mockImplementation(() => {
        throw new Error('assignedElements failed');
      });

      const result = component.getSlottedContent('header');

      expect(result).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Error getting slotted content for "header":',
        expect.any(Error)
      );
    });

    it('should check if slot has content', () => {
      const mockElements = [document.createElement('div')];
      const mockQuerySelector = vi.fn().mockReturnValue(mockSlot);
      component.shadowRoot!.querySelector = mockQuerySelector;
      mockSlot.assignedElements = vi.fn().mockReturnValue(mockElements);

      const result = component.hasSlottedContent('header');

      expect(result).toBe(true);
    });

    it('should return false when slot has no content', () => {
      const mockQuerySelector = vi.fn().mockReturnValue(mockSlot);
      component.shadowRoot!.querySelector = mockQuerySelector;
      mockSlot.assignedElements = vi.fn().mockReturnValue([]);

      const result = component.hasSlottedContent('header');

      expect(result).toBe(false);
    });
  });

  describe('Slot Change Event Handling', () => {
    it('should set up slot change listeners on connect', () => {
      const mockSlots = [mockSlot];
      const mockQuerySelectorAll = vi.fn().mockReturnValue(mockSlots);
      component.shadowRoot!.querySelectorAll = mockQuerySelectorAll;

      component.connectedCallback();

      expect(mockQuerySelectorAll).toHaveBeenCalledWith('slot');
      expect(mockSlot.addEventListener).toHaveBeenCalledWith('slotchange', expect.any(Function));
    });

    it('should handle slot change events and call callback', () => {
      const mockSlots = [mockSlot];
      component.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);
      mockSlot.getAttribute = vi.fn().mockReturnValue('header');

      component.connectedCallback();

      // Get the listener that was added
      const addedListener = (mockSlot.addEventListener as any).mock.calls[0][1];
      const mockEvent = new Event('slotchange');

      // Trigger the listener
      addedListener(mockEvent);

      expect(component.onSlotChangeCallCount).toBe(1);
      expect(component.lastSlotChangeData).toEqual({
        slotName: 'header',
        event: mockEvent,
      });
    });

    it('should use "default" as slot name when no name attribute', () => {
      const mockSlots = [mockSlot];
      component.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);
      mockSlot.getAttribute = vi.fn().mockReturnValue(null);

      component.connectedCallback();

      const addedListener = (mockSlot.addEventListener as any).mock.calls[0][1];
      const mockEvent = new Event('slotchange');

      addedListener(mockEvent);

      expect(component.lastSlotChangeData?.slotName).toBe('default');
    });

    it('should work without onSlotChange callback', () => {
      const componentNoCallback = new TestSlotComponentNoCallback();
      componentNoCallback.createMockShadowRoot();

      const mockSlots = [mockSlot];
      componentNoCallback.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);

      componentNoCallback.connectedCallback();

      const addedListener = (mockSlot.addEventListener as any).mock.calls[0][1];

      // Should not throw when no callback is implemented
      expect(() => addedListener(new Event('slotchange'))).not.toThrow();
    });

    it('should handle errors in slot change listener gracefully', () => {
      const componentWithError = new (class extends SlotManagerMixin(MockElement as any) {
        onSlotChange(): void {
          throw new Error('Callback failed');
        }
      })();
      componentWithError.createMockShadowRoot();

      const mockSlots = [mockSlot];
      componentWithError.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);
      mockSlot.getAttribute = vi.fn().mockReturnValue('header');

      componentWithError.connectedCallback();

      const addedListener = (mockSlot.addEventListener as any).mock.calls[0][1];

      // Should handle error gracefully
      addedListener(new Event('slotchange'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Error in slot change handler:',
        expect.any(Error)
      );
    });
  });

  describe('Lifecycle Management', () => {
    it('should clean up slot listeners on disconnect', () => {
      const mockSlots = [mockSlot];
      component.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);

      component.connectedCallback();
      component.disconnectedCallback();

      expect(mockSlot.removeEventListener).toHaveBeenCalledWith('slotchange', expect.any(Function));
    });

    it('should handle errors during slot discovery gracefully', () => {
      const mockQuerySelectorAll = vi.fn().mockImplementation(() => {
        throw new Error('Query failed');
      });
      component.shadowRoot!.querySelectorAll = mockQuerySelectorAll;

      component.connectedCallback();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Error during slot discovery:',
        expect.any(Error)
      );
    });

    it('should handle errors during cleanup gracefully', () => {
      const mockSlots = [mockSlot];
      component.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);

      component.connectedCallback();

      // Make removeEventListener throw
      mockSlot.removeEventListener = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      component.disconnectedCallback();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Error cleaning up slot listeners:',
        expect.any(Error)
      );
    });

    it('should work without shadow root during disconnect', () => {
      component.shadowRoot = null;

      // Should not throw
      expect(() => component.disconnectedCallback()).not.toThrow();
    });
  });

  describe('Render Integration', () => {
    it('should refresh slot bindings after render', () => {
      const mockSlots = [mockSlot];
      component.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);

      // Call render which should trigger slot discovery
      component.render();

      expect(component.shadowRoot!.querySelectorAll).toHaveBeenCalledWith('slot');
      expect(mockSlot.addEventListener).toHaveBeenCalledWith('slotchange', expect.any(Function));
    });

    it('should refresh slots even if super render fails', () => {
      // Create a base class with a render method that throws
      class BaseWithErrorRender extends MockElement {
        render(): void {
          throw new Error('Base render failed');
        }
      }

      const componentWithError = new (SlotManagerMixin(BaseWithErrorRender as any))();
      componentWithError.createMockShadowRoot();

      const mockSlots = [mockSlot];
      componentWithError.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);

      // The error in super.render() should be caught and not propagate
      expect(() => componentWithError.render()).not.toThrow();

      // Should still have refreshed slots despite render error
      expect(componentWithError.shadowRoot!.querySelectorAll).toHaveBeenCalledWith('slot');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'SlotManagerMixin: Error in render method:',
        expect.any(Error)
      );
    });
  });

  describe('UpdateManager Integration', () => {
    it('should integrate with UpdateManager when available', () => {
      const componentWithUpdate = new TestSlotComponentWithUpdate();
      componentWithUpdate.createMockShadowRoot();

      const mockSlots = [mockSlot];
      componentWithUpdate.shadowRoot!.querySelectorAll = vi.fn().mockReturnValue(mockSlots);
      mockSlot.getAttribute = vi.fn().mockReturnValue('header');

      componentWithUpdate.connectedCallback();

      const addedListener = (mockSlot.addEventListener as any).mock.calls[0][1];
      addedListener(new Event('slotchange'));

      expect(componentWithUpdate.updateRequestCount).toBe(1);
    });
  });

  describe('Interface Compliance', () => {
    it('should implement SlotManagerMixinInterface correctly', () => {
      expect(typeof component.getSlot).toBe('function');
      expect(typeof component.getSlottedContent).toBe('function');
      expect(typeof component.hasSlottedContent).toBe('function');
      expect(typeof component.onSlotChange).toBe('function');
    });

    it('should maintain backward compatibility', () => {
      expect(() => component.getSlot()).not.toThrow();
      expect(() => component.getSlottedContent()).not.toThrow();
      expect(() => component.hasSlottedContent()).not.toThrow();
    });
  });
});
