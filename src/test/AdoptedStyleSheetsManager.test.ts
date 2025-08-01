/**
 * Unit tests for AdoptedStyleSheetsManager
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

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

// Mock createStyleSheet utility
vi.mock('../utilities/style-helpers.js', async () => {
  const actual = await vi.importActual('../utilities/style-helpers.js');
  return {
    ...actual,
    createStyleSheet: vi.fn((css: string) => mockCSSStyleSheet(css)),
  };
});

import { AdoptedStyleSheetsManager } from '../utilities/style-helpers.js';

// Mock CSSStyleSheet constructor
Object.defineProperty(globalThis, 'CSSStyleSheet', {
  value: function MockCSSStyleSheet() {
    return mockCSSStyleSheet();
  },
  writable: true,
});

describe('AdoptedStyleSheetsManager', () => {
  let manager: AdoptedStyleSheetsManager;
  let mockStylesheet1: CSSStyleSheet;
  let mockStylesheet2: CSSStyleSheet;
  let mockShadowRoot: ShadowRoot;
  let mockDocument: Document;

  beforeEach(() => {
    manager = new AdoptedStyleSheetsManager();
    mockStylesheet1 = mockCSSStyleSheet('.test1 { color: red; }') as unknown as CSSStyleSheet;
    mockStylesheet2 = mockCSSStyleSheet('.test2 { color: blue; }') as unknown as CSSStyleSheet;

    // Mock ShadowRoot with adoptedStyleSheets support
    mockShadowRoot = {
      adoptedStyleSheets: [],
      appendChild: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
    } as unknown as ShadowRoot;

    // Mock Document with adoptedStyleSheets support
    mockDocument = {
      adoptedStyleSheets: [],
      head: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as unknown as Document;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should create an instance with empty stylesheets', () => {
      expect(manager).toBeInstanceOf(AdoptedStyleSheetsManager);
      expect(manager.getStylesheets()).toEqual([]);
    });

    it('should add a stylesheet', () => {
      manager.addStylesheet(mockStylesheet1);

      expect(manager.getStylesheets()).toHaveLength(1);
      expect(manager.getStylesheets()).toContain(mockStylesheet1);
    });

    it('should not add duplicate stylesheets', () => {
      manager.addStylesheet(mockStylesheet1);
      manager.addStylesheet(mockStylesheet1); // Add same stylesheet again

      expect(manager.getStylesheets()).toHaveLength(1);
    });

    it('should add multiple stylesheets', () => {
      manager.addStylesheet(mockStylesheet1);
      manager.addStylesheet(mockStylesheet2);

      expect(manager.getStylesheets()).toHaveLength(2);
      expect(manager.getStylesheets()).toContain(mockStylesheet1);
      expect(manager.getStylesheets()).toContain(mockStylesheet2);
    });
  });

  describe('Batch operations', () => {
    it('should batch add multiple stylesheets', () => {
      manager.batchAddStylesheets([mockStylesheet1, mockStylesheet2]);

      expect(manager.getStylesheets()).toHaveLength(2);
      expect(manager.getStylesheets()).toContain(mockStylesheet1);
      expect(manager.getStylesheets()).toContain(mockStylesheet2);
    });

    it('should not add duplicates in batch operations', () => {
      manager.addStylesheet(mockStylesheet1);
      manager.batchAddStylesheets([mockStylesheet1, mockStylesheet2]);

      expect(manager.getStylesheets()).toHaveLength(2);
    });
  });

  describe('CSS text management', () => {
    it('should create and add stylesheet from CSS text', () => {
      const cssText = '.dynamic { color: green; }';
      const initialCount = manager.getStylesheets().length;

      const createdSheet = manager.addCSS(cssText);

      // Verify that a stylesheet was created and added
      expect(manager.getStylesheets()).toHaveLength(initialCount + 1);
      expect(manager.getStylesheets()).toContain(createdSheet);
      expect(createdSheet).toBeDefined();
    });
  });

  describe('Stylesheet removal', () => {
    it('should remove a stylesheet', () => {
      manager.addStylesheet(mockStylesheet1);
      manager.addStylesheet(mockStylesheet2);

      manager.removeStylesheet(mockStylesheet1);

      expect(manager.getStylesheets()).toHaveLength(1);
      expect(manager.getStylesheets()).not.toContain(mockStylesheet1);
      expect(manager.getStylesheets()).toContain(mockStylesheet2);
    });

    it('should handle removing non-existent stylesheet gracefully', () => {
      manager.addStylesheet(mockStylesheet1);

      expect(() => {
        manager.removeStylesheet(mockStylesheet2);
      }).not.toThrow();

      expect(manager.getStylesheets()).toHaveLength(1);
    });
  });

  describe('Clear functionality', () => {
    it('should clear all stylesheets', () => {
      manager.addStylesheet(mockStylesheet1);
      manager.addStylesheet(mockStylesheet2);

      manager.clear();

      expect(manager.getStylesheets()).toHaveLength(0);
    });
  });

  describe('adoptedStyleSheets API support', () => {
    it('should apply stylesheets using adoptedStyleSheets when supported', () => {
      manager.addStylesheet(mockStylesheet1);
      manager.addStylesheet(mockStylesheet2);

      manager.applyTo(mockShadowRoot);

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(2);
      expect(mockShadowRoot.adoptedStyleSheets).toContain(mockStylesheet1);
      expect(mockShadowRoot.adoptedStyleSheets).toContain(mockStylesheet2);
    });

    it('should apply stylesheets to document when supported', () => {
      manager.addStylesheet(mockStylesheet1);

      manager.applyTo(mockDocument);

      expect(mockDocument.adoptedStyleSheets).toHaveLength(1);
      expect(mockDocument.adoptedStyleSheets).toContain(mockStylesheet1);
    });

    it('should remove stylesheets from adoptedStyleSheets', () => {
      // Pre-populate with some existing stylesheets
      const existingSheet = mockCSSStyleSheet('.existing { }') as unknown as CSSStyleSheet;
      mockShadowRoot.adoptedStyleSheets = [existingSheet];

      manager.addStylesheet(mockStylesheet1);
      manager.applyTo(mockShadowRoot);

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(2);

      manager.removeFrom(mockShadowRoot);

      expect(mockShadowRoot.adoptedStyleSheets).toHaveLength(1);
      expect(mockShadowRoot.adoptedStyleSheets).toContain(existingSheet);
      expect(mockShadowRoot.adoptedStyleSheets).not.toContain(mockStylesheet1);
    });
  });

  describe('Fallback style element support', () => {
    let mockShadowRootWithoutAdoptedStyleSheets: ShadowRoot;

    beforeEach(() => {
      // Mock ShadowRoot without adoptedStyleSheets support
      mockShadowRootWithoutAdoptedStyleSheets = {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
      } as unknown as ShadowRoot;
    });

    it('should fall back to style elements when adoptedStyleSheets not supported', () => {
      const mockStyleElement = document.createElement('style');
      vi.spyOn(document, 'createElement').mockReturnValue(mockStyleElement);

      manager.addStylesheet(mockStylesheet1);
      manager.applyTo(mockShadowRootWithoutAdoptedStyleSheets);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(document.createElement).toHaveBeenCalledWith('style');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockShadowRootWithoutAdoptedStyleSheets.appendChild).toHaveBeenCalledWith(
        mockStyleElement
      );
      expect(mockStyleElement.getAttribute('data-adopted-stylesheets-manager')).toBe('true');
    });

    it('should handle CSS extraction errors gracefully in fallback mode', () => {
      const faultyStylesheet = {
        get cssRules() {
          throw new DOMException('Access denied', 'SecurityError');
        },
      } as unknown as CSSStyleSheet;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.addStylesheet(faultyStylesheet);

      expect(() => {
        manager.applyTo(mockShadowRootWithoutAdoptedStyleSheets);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('AdoptedStyleSheetsManager: CORS security error')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle errors when applying stylesheets and fall back gracefully', () => {
      const faultyShadowRoot = {
        get adoptedStyleSheets() {
          throw new Error('Test error');
        },
        appendChild: vi.fn(),
      } as unknown as ShadowRoot;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.addStylesheet(mockStylesheet1);

      expect(() => {
        manager.applyTo(faultyShadowRoot);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'AdoptedStyleSheetsManager: Failed to apply stylesheets:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors when removing stylesheets', () => {
      const faultyShadowRoot = {
        get adoptedStyleSheets() {
          throw new Error('Test error');
        },
      } as unknown as ShadowRoot;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => {
        manager.removeFrom(faultyShadowRoot);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'AdoptedStyleSheetsManager: Failed to remove stylesheets:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('CSS extraction error handling', () => {
    let mockShadowRootWithoutAdoptedStyleSheets: ShadowRoot;

    beforeEach(() => {
      // Mock ShadowRoot without adoptedStyleSheets support to trigger fallback
      mockShadowRootWithoutAdoptedStyleSheets = {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
      } as unknown as ShadowRoot;
    });

    it('should handle SecurityError when extracting CSS', () => {
      const securityErrorSheet = {
        get cssRules() {
          throw new DOMException('Access denied', 'SecurityError');
        },
      } as unknown as CSSStyleSheet;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.addStylesheet(securityErrorSheet);
      manager.applyTo(mockShadowRootWithoutAdoptedStyleSheets);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('CORS security error'));

      consoleSpy.mockRestore();
    });

    it('should handle InvalidAccessError when extracting CSS', () => {
      const invalidAccessSheet = {
        get cssRules() {
          throw new DOMException('Invalid access', 'InvalidAccessError');
        },
      } as unknown as CSSStyleSheet;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.addStylesheet(invalidAccessSheet);
      manager.applyTo(mockShadowRootWithoutAdoptedStyleSheets);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid access to stylesheet rules')
      );

      consoleSpy.mockRestore();
    });

    it('should handle unexpected errors when extracting CSS', () => {
      const unexpectedErrorSheet = {
        get cssRules() {
          throw new Error('Unexpected error');
        },
      } as unknown as CSSStyleSheet;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      manager.addStylesheet(unexpectedErrorSheet);
      manager.applyTo(mockShadowRootWithoutAdoptedStyleSheets);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected error accessing stylesheet rules'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Memory management', () => {
    it('should clean up fallback style elements when clearing', () => {
      const mockStyleElement = document.createElement('style');
      const mockParentNode = { removeChild: vi.fn() };
      Object.defineProperty(mockStyleElement, 'parentNode', {
        value: mockParentNode,
        writable: true,
      });

      vi.spyOn(document, 'createElement').mockReturnValue(mockStyleElement);

      // Add stylesheet and apply with fallback
      manager.addStylesheet(mockStylesheet1);
      const mockShadowRootWithoutAdoptedStyleSheets = {
        appendChild: vi.fn(),
      } as unknown as ShadowRoot;

      manager.applyTo(mockShadowRootWithoutAdoptedStyleSheets);

      // Clear should remove fallback elements
      manager.clear();

      expect(mockParentNode.removeChild).toHaveBeenCalledWith(mockStyleElement);
    });

    it('should clean up fallback elements when removing individual stylesheets', () => {
      const mockStyleElement = document.createElement('style');
      const mockParentNode = { removeChild: vi.fn() };
      Object.defineProperty(mockStyleElement, 'parentNode', {
        value: mockParentNode,
        writable: true,
      });

      vi.spyOn(document, 'createElement').mockReturnValue(mockStyleElement);

      // Add stylesheet and apply with fallback
      manager.addStylesheet(mockStylesheet1);
      const mockShadowRootWithoutAdoptedStyleSheets = {
        appendChild: vi.fn(),
      } as unknown as ShadowRoot;

      manager.applyTo(mockShadowRootWithoutAdoptedStyleSheets);

      // Remove specific stylesheet should clean up its fallback element
      manager.removeStylesheet(mockStylesheet1);

      expect(mockParentNode.removeChild).toHaveBeenCalledWith(mockStyleElement);
    });
  });
});
