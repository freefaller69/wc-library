/**
 * Tests for component registry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { componentRegistry, defineComponent, registerComponent } from '../utilities/component-registry.js';

// Mock custom element for testing
class MockComponent extends HTMLElement {
  connectedCallback() {
    this.textContent = 'Mock Component';
  }
}

class MockDependentComponent extends HTMLElement {
  connectedCallback() {
    this.textContent = 'Dependent Component';
  }
}

describe('Component Registry', () => {
  beforeEach(() => {
    componentRegistry.clear();
    
    // Clear any existing custom element definitions in tests
    // Note: In real browser, custom elements cannot be undefined
    vi.clearAllMocks();
  });

  describe('define', () => {
    it('should define a component', () => {
      defineComponent('mock-component', MockComponent);
      
      expect(componentRegistry.isDefined('mock-component')).toBe(true);
      expect(componentRegistry.isRegistered('mock-component')).toBe(false);
    });

    it('should define a component with dependencies', () => {
      defineComponent('mock-dependency', MockComponent);
      defineComponent('mock-dependent', MockDependentComponent, ['mock-dependency']);
      
      expect(componentRegistry.isDefined('mock-dependent')).toBe(true);
    });

    it('should warn when defining duplicate component', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      defineComponent('mock-component', MockComponent);
      defineComponent('mock-component', MockComponent);
      
      expect(consoleSpy).toHaveBeenCalledWith('Component mock-component is already defined');
      consoleSpy.mockRestore();
    });
  });

  describe.skip('register', () => {
    beforeEach(() => {
      defineComponent('mock-component', MockComponent);
    });

    it('should register a defined component', () => {
      const result = registerComponent('mock-component');
      
      expect(result).toBe(true);
      expect(componentRegistry.isRegistered('mock-component')).toBe(true);
    });

    it('should handle registration of already registered component', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      registerComponent('mock-component');
      const result = registerComponent('mock-component');
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Component mock-component is already registered');
      consoleSpy.mockRestore();
    });

    it('should fail to register undefined component', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = registerComponent('undefined-component');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Component undefined-component is not defined. Call define() first.');
      consoleSpy.mockRestore();
    });

    it('should register dependencies before main component', () => {
      defineComponent('mock-dependency', MockComponent);
      defineComponent('mock-dependent', MockDependentComponent, ['mock-dependency']);
      
      const result = registerComponent('mock-dependent');
      
      expect(result).toBe(true);
      expect(componentRegistry.isRegistered('mock-dependency')).toBe(true);
      expect(componentRegistry.isRegistered('mock-dependent')).toBe(true);
    });

    it('should fail if dependency registration fails', () => {
      defineComponent('mock-dependent', MockDependentComponent, ['nonexistent-dependency']);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = registerComponent('mock-dependent');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to register dependency nonexistent-dependency for mock-dependent');
      consoleSpy.mockRestore();
    });
  });

  describe('registry queries', () => {
    beforeEach(() => {
      defineComponent('defined-component', MockComponent);
      defineComponent('registered-component', MockDependentComponent);
      registerComponent('registered-component');
    });

    it('should return defined components', () => {
      const defined = componentRegistry.getDefinedComponents();
      
      expect(defined).toContain('defined-component');
      expect(defined).toContain('registered-component');
    });

    it('should return registered components', () => {
      const registered = componentRegistry.getRegisteredComponents();
      
      expect(registered).toContain('registered-component');
      expect(registered).not.toContain('defined-component');
    });

    it('should return unregistered components', () => {
      const unregistered = componentRegistry.getUnregisteredComponents();
      
      expect(unregistered).toContain('defined-component');
      expect(unregistered).not.toContain('registered-component');
    });

    it('should check if component is defined', () => {
      expect(componentRegistry.isDefined('defined-component')).toBe(true);
      expect(componentRegistry.isDefined('nonexistent-component')).toBe(false);
    });

    it('should check if component is registered', () => {
      expect(componentRegistry.isRegistered('registered-component')).toBe(true);
      expect(componentRegistry.isRegistered('defined-component')).toBe(false);
    });
  });

  describe.skip('bulk operations', () => {
    beforeEach(() => {
      defineComponent('component-1', MockComponent);
      defineComponent('component-2', MockDependentComponent);
      defineComponent('component-3', MockComponent);
    });

    it('should register multiple components', () => {
      const result = componentRegistry.registerAll(['component-1', 'component-2']);
      
      expect(result).toBe(true);
      expect(componentRegistry.isRegistered('component-1')).toBe(true);
      expect(componentRegistry.isRegistered('component-2')).toBe(true);
      expect(componentRegistry.isRegistered('component-3')).toBe(false);
    });

    it('should register all defined components', () => {
      const result = componentRegistry.registerAllDefined();
      
      expect(result).toBe(true);
      expect(componentRegistry.getUnregisteredComponents()).toHaveLength(0);
    });

    it('should fail bulk registration if any component fails', () => {
      const result = componentRegistry.registerAll(['component-1', 'nonexistent-component']);
      
      expect(result).toBe(false);
    });
  });

  describe('whenRegistered', () => {
    it('should resolve immediately if component is already registered', async () => {
      defineComponent('mock-component', MockComponent);
      registerComponent('mock-component');
      
      const promise = componentRegistry.whenRegistered('mock-component');
      await expect(promise).resolves.toBeUndefined();
    });

    it('should wait for component registration', async () => {
      defineComponent('mock-component', MockComponent);
      
      const promise = componentRegistry.whenRegistered('mock-component');
      
      // Register after a delay
      setTimeout(() => {
        registerComponent('mock-component');
      }, 50);
      
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('undefine and clear', () => {
    beforeEach(() => {
      defineComponent('mock-component', MockComponent);
    });

    it('should undefine a component', () => {
      const result = componentRegistry.undefine('mock-component');
      
      expect(result).toBe(true);
      expect(componentRegistry.isDefined('mock-component')).toBe(false);
    });

    it('should return false when undefining nonexistent component', () => {
      const result = componentRegistry.undefine('nonexistent-component');
      
      expect(result).toBe(false);
    });

    it('should clear all definitions', () => {
      defineComponent('another-component', MockDependentComponent);
      
      componentRegistry.clear();
      
      expect(componentRegistry.getDefinedComponents()).toHaveLength(0);
    });
  });

  describe('auto-registration', () => {
    it('should enable auto-registration with MutationObserver', () => {
      // Mock MutationObserver for testing
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
      };
      
      globalThis.MutationObserver = vi.fn(() => mockObserver) as any;
      
      componentRegistry.enableAutoRegistration();
      
      expect(globalThis.MutationObserver).toHaveBeenCalled();
      expect(mockObserver.observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });
    });
  });
});