/**
 * @file AttributeManagerMixin.safety-validation.test.ts
 * Comprehensive safety validation tests for AttributeManagerMixin recursion protection
 * 
 * This test suite validates the critical safety measures implemented to prevent
 * infinite recursion and stack overflow in AttributeManagerMixin.
 * 
 * Priority Coverage:
 * - HIGH: Recursion depth protection and depth counter management
 * - MEDIUM: Circular prototype reference detection and method string analysis
 * - Integration: Error handling, recovery, and normal operation validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AttributeManagerMixin } from '../base/mixins/AttributeManagerMixin.js';

// Mock console methods to capture output
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
let consoleWarnSpy: ReturnType<typeof vi.fn>;
let consoleErrorSpy: ReturnType<typeof vi.fn>;

describe('AttributeManagerMixin Safety Validation', () => {
  beforeEach(() => {
    consoleWarnSpy = vi.fn();
    consoleErrorSpy = vi.fn();
    console.warn = consoleWarnSpy;
    console.error = consoleErrorSpy;
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  describe('HIGH PRIORITY: Depth Protection Configuration', () => {
    it('should have proper depth protection constants', () => {
      class MockBase {
        config = { tagName: 'test-constants', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {
        getMaxCallbackDepth() {
          return (this as any).MAX_CALLBACK_DEPTH;
        }

        getMaxPrototypeSearchDepth() {
          return (this as any).MAX_PROTOTYPE_SEARCH_DEPTH;
        }
      }

      const element = new TestElement();
      
      // Verify constants are set to expected safe values
      expect(element.getMaxCallbackDepth()).toBe(5);
      expect(element.getMaxPrototypeSearchDepth()).toBe(10);
      
      // Verify constants are readonly
      expect(() => {
        (element as any).MAX_CALLBACK_DEPTH = 100;
      }).toThrow();
    });

    it('should initialize depth counter to zero', () => {
      class MockBase {
        config = { tagName: 'test-init', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {
        getDepthCounter() {
          return (this as any)._attributeCallbackDepth;
        }
      }

      const element = new TestElement();
      expect(element.getDepthCounter()).toBe(0);
    });

    it('should trigger depth protection when manually set to limit', () => {
      class MockBase {
        config = { tagName: 'test-depth-limit', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {
        setDepthToMax() {
          (this as any)._attributeCallbackDepth = 5; // Set to MAX_CALLBACK_DEPTH
        }
      }

      const element = new TestElement();
      element.setDepthToMax();
      
      // This should trigger depth protection immediately
      element.attributeChangedCallback('test-attr', null, 'value');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Maximum callback depth (5) exceeded')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Stack overflow prevented')
      );
    });

    it('should reset depth counter after normal callback', () => {
      class MockBase {
        config = { tagName: 'test-reset', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {
        getDepthCounter() {
          return (this as any)._attributeCallbackDepth;
        }
      }

      const element = new TestElement();
      
      expect(element.getDepthCounter()).toBe(0);
      element.attributeChangedCallback('test-attr', null, 'value1');
      expect(element.getDepthCounter()).toBe(0); // Should reset after completion
    });

    it('should reset depth counter even when errors occur', () => {
      class MockBase {
        config = { tagName: 'test-error-reset', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {
        getDepthCounter() {
          return (this as any)._attributeCallbackDepth;
        }

        handleDynamicAttributeChange(): void {
          throw new Error('Test error for depth counter reset');
        }
      }

      const element = new TestElement();
      
      expect(element.getDepthCounter()).toBe(0);
      element.attributeChangedCallback('test-attr', null, 'error-value');
      
      // Should have caught and logged the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in attributeChangedCallback for "test-attr"'),
        expect.any(Error)
      );
      
      // Depth counter should still be reset due to finally block
      expect(element.getDepthCounter()).toBe(0);
    });
  });

  describe('MEDIUM PRIORITY: Prototype Chain Safety', () => {
    it('should detect circular prototype references', () => {
      class MockBase {
        config = { tagName: 'test-circular', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      // Mock circular prototype reference
      const originalGetPrototypeOf = Object.getPrototypeOf;
      const circularProto = { 
        constructor: class MockClass {},
        attributeChangedCallback: vi.fn()
      };
      
      Object.getPrototypeOf = vi.fn(() => circularProto); // Always return same object

      try {
        element.attributeChangedCallback('test-attr', null, 'value1');
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Circular prototype reference detected')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Stopping search to prevent infinite loop')
        );
      } finally {
        Object.getPrototypeOf = originalGetPrototypeOf;
      }
    });

    it('should handle deep prototype chains gracefully', () => {
      class MockBase {
        config = { tagName: 'test-deep', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      // Mock deep prototype chain
      const originalGetPrototypeOf = Object.getPrototypeOf;
      let depth = 0;
      
      Object.getPrototypeOf = vi.fn(() => {
        depth++;
        if (depth <= 12) { // Exceed MAX_PROTOTYPE_SEARCH_DEPTH
          return {
            constructor: class DeepClass {},
            attributeChangedCallback: vi.fn(),
            depth: depth // Make each unique
          };
        }
        return Object.prototype;
      });

      try {
        element.attributeChangedCallback('test-attr', null, 'value1');
        
        // Should have reached the search depth limit
        expect(depth).toBeGreaterThanOrEqual(10);
        
        // Should not warn about circular references (since there were none)
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Circular prototype reference detected')
        );
      } finally {
        Object.getPrototypeOf = originalGetPrototypeOf;
      }
    });
  });

  describe('MEDIUM PRIORITY: Method String Analysis', () => {
    it('should detect and skip recursive AttributeManagerMixin methods', () => {
      class MockBase {
        config = { tagName: 'test-method-detection', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      // Mock method with recursive patterns
      const recursiveMethod = vi.fn();
      recursiveMethod.toString = () => 'function() { this.callParentAttributeChangedCallback(); /* AttributeManagerMixin */ }';
      
      const originalGetPrototypeOf = Object.getPrototypeOf;
      Object.getPrototypeOf = vi.fn(() => ({
        constructor: class RecursiveClass {},
        attributeChangedCallback: recursiveMethod
      }));

      try {
        element.attributeChangedCallback('test-attr', null, 'value1');
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Skipping recursive AttributeManagerMixin method')
        );
        expect(recursiveMethod).not.toHaveBeenCalled();
      } finally {
        Object.getPrototypeOf = originalGetPrototypeOf;
      }
    });

    it('should allow safe methods without recursive patterns', () => {
      class MockBase {
        config = { tagName: 'test-safe-method', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      // Mock safe method
      const safeMethod = vi.fn();
      safeMethod.toString = () => 'function() { console.log("Safe method"); }';
      
      const originalGetPrototypeOf = Object.getPrototypeOf;
      Object.getPrototypeOf = vi.fn(() => ({
        constructor: class SafeClass {},
        attributeChangedCallback: safeMethod
      }));

      try {
        element.attributeChangedCallback('test-attr', null, 'value1');
        
        expect(consoleWarnSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Skipping recursive AttributeManagerMixin method')
        );
        expect(safeMethod).toHaveBeenCalledWith('test-attr', null, 'value1');
      } finally {
        Object.getPrototypeOf = originalGetPrototypeOf;
      }
    });

    it('should require both patterns for method skipping', () => {
      class MockBase {
        config = { tagName: 'test-pattern-requirements', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      const testCases = [
        {
          name: 'Only callParentAttributeChangedCallback',
          toString: () => 'function() { this.callParentAttributeChangedCallback(); }',
          shouldSkip: false
        },
        {
          name: 'Only AttributeManagerMixin',
          toString: () => 'function() { /* AttributeManagerMixin */ }',
          shouldSkip: false
        },
        {
          name: 'Both patterns',
          toString: () => 'function() { this.callParentAttributeChangedCallback(); /* AttributeManagerMixin */ }',
          shouldSkip: true
        }
      ];

      testCases.forEach((testCase) => {
        consoleWarnSpy.mockClear();
        
        const testMethod = vi.fn();
        testMethod.toString = testCase.toString;
        
        const originalGetPrototypeOf = Object.getPrototypeOf;
        Object.getPrototypeOf = vi.fn(() => ({
          constructor: class TestClass {},
          attributeChangedCallback: testMethod
        }));

        try {
          element.attributeChangedCallback('test-attr', null, 'test-value');
          
          if (testCase.shouldSkip) {
            expect(consoleWarnSpy).toHaveBeenCalledWith(
              expect.stringContaining('Skipping recursive AttributeManagerMixin method')
            );
            expect(testMethod).not.toHaveBeenCalled();
          } else {
            expect(consoleWarnSpy).not.toHaveBeenCalledWith(
              expect.stringContaining('Skipping recursive AttributeManagerMixin method')
            );
            expect(testMethod).toHaveBeenCalled();
          }
        } finally {
          Object.getPrototypeOf = originalGetPrototypeOf;
        }
      });
    });

    it('should handle method string analysis errors gracefully', () => {
      class MockBase {
        config = { tagName: 'test-string-error', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      // Mock method where toString() throws
      const problematicMethod = vi.fn();
      problematicMethod.toString = () => {
        throw new Error('toString() error');
      };
      
      const originalGetPrototypeOf = Object.getPrototypeOf;
      Object.getPrototypeOf = vi.fn(() => ({
        constructor: class ProblematicClass {},
        attributeChangedCallback: problematicMethod
      }));

      try {
        expect(() => {
          element.attributeChangedCallback('test-attr', null, 'value1');
        }).not.toThrow();
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to call parent attributeChangedCallback'),
          expect.any(Error)
        );
      } finally {
        Object.getPrototypeOf = originalGetPrototypeOf;
      }
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle prototype traversal errors gracefully', () => {
      class MockBase {
        config = { tagName: 'test-traversal-error', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      // Mock method that throws during execution
      const throwingMethod = vi.fn(() => {
        throw new Error('Parent method error');
      });
      
      const originalGetPrototypeOf = Object.getPrototypeOf;
      Object.getPrototypeOf = vi.fn(() => ({
        constructor: class ThrowingClass {},
        attributeChangedCallback: throwingMethod
      }));

      try {
        expect(() => {
          element.attributeChangedCallback('test-attr', null, 'value1');
        }).not.toThrow();
        
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to call parent attributeChangedCallback'),
          expect.any(Error)
        );
      } finally {
        Object.getPrototypeOf = originalGetPrototypeOf;
      }
    });

    it('should continue normal processing after parent method errors', () => {
      class MockBase {
        config = { tagName: 'test-continue-processing', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {
        processedNormally = false;

        handleDynamicAttributeChange(): void {
          this.processedNormally = true;
        }
      }

      const element = new TestElement();
      
      // Mock parent that throws error
      const originalGetPrototypeOf = Object.getPrototypeOf;
      Object.getPrototypeOf = vi.fn(() => ({
        constructor: class ErrorClass {},
        attributeChangedCallback: () => { throw new Error('Parent error'); }
      }));

      try {
        element.attributeChangedCallback('test-attr', null, 'value1');
        
        // Should have logged parent error
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to call parent attributeChangedCallback')
        );
        
        // Should still have continued with normal processing
        expect(element.processedNormally).toBe(true);
      } finally {
        Object.getPrototypeOf = originalGetPrototypeOf;
      }
    });
  });

  describe('Normal Operation Validation', () => {
    it('should handle normal attribute changes without any warnings', () => {
      class MockBase {
        config = { tagName: 'test-normal', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {}
      const element = new TestElement();
      
      // Normal attribute change should work without warnings
      element.attributeChangedCallback('test-attr', null, 'normal-value');
      element.attributeChangedCallback('test-attr', 'normal-value', 'another-value');
      
      // Should not have any error or warning messages for normal operation
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should handle same value changes efficiently', () => {
      class MockBase {
        config = { tagName: 'test-same-value', dynamicAttributes: ['test-attr'] };
      }

      class TestElement extends AttributeManagerMixin(MockBase as any) {
        changeProcessed = false;

        handleDynamicAttributeChange(): void {
          this.changeProcessed = true;
        }
      }

      const element = new TestElement();
      
      // Same value should short-circuit processing
      element.attributeChangedCallback('test-attr', 'same-value', 'same-value');
      
      // Should not have processed the change (short-circuited)
      expect(element.changeProcessed).toBe(false);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});