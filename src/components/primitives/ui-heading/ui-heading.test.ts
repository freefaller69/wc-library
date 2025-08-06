/**
 * UIHeading - The Next Generation Tests
 *
 * Comprehensive test suite for mixin composition architecture.
 * Tests component functionality, mixin interactions, and learning objectives.
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIHeading } from './ui-heading.js';

describe('UIHeading - The Next Generation', () => {
  let element: UIHeading;

  beforeEach(() => {
    element = new UIHeading();
    // Don't append to DOM yet - level attribute must be set first
  });

  afterEach(() => {
    if (element.parentNode) {
      (element as unknown as HTMLElement).remove();
    }
  });

  describe('Component Registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('ui-heading')).toBeDefined();
    });

    it('should create an instance with mixin composition', () => {
      expect(element).toBeInstanceOf(UIHeading);
      expect(element).toBeInstanceOf(HTMLElement);
    });

    it('should have mixin methods available', () => {
      // StyleHandlerMixin methods
      expect(typeof element.getStaticStylesheetManager).toBe('function');
      expect(typeof element.applyStaticStylesheets).toBe('function');

      // AccessibilityMixin methods
      expect(typeof element.setupAccessibility).toBe('function');
      expect(typeof element.getAccessibilityConfig).toBe('function');
    });
  });

  describe('Level Attribute Validation - Enhanced', () => {
    it('should require level attribute with helpful error', () => {
      element.innerHTML = 'Test Heading';

      expect(() => {
        element.connectedCallback();
      }).toThrow(
        'UIHeading: Level attribute is required. Must specify level="1" through level="6" for proper accessibility. Missing level would break screen reader navigation.'
      );
    });

    it('should validate level range with specific error', () => {
      element.setAttribute('level', '7');
      element.innerHTML = 'Invalid Level';

      expect(() => {
        element.connectedCallback();
      }).toThrow(
        'UIHeading: Invalid level "7". Level must be a number between 1 and 6 for proper accessibility. Current level would break screen reader navigation.'
      );
    });

    it('should handle non-numeric levels', () => {
      element.setAttribute('level', 'abc');
      element.innerHTML = 'Invalid Level';

      expect(() => {
        element.connectedCallback();
      }).toThrow(/UIHeading: Invalid level "abc"/);
    });

    it('should accept all valid levels', () => {
      for (let level = 1; level <= 6; level++) {
        const testElement = new UIHeading();
        testElement.setAttribute('level', level.toString());
        testElement.innerHTML = `Level ${level}`;

        expect(() => {
          document.body.appendChild(testElement as unknown as HTMLElement);
          testElement.connectedCallback();
        }).not.toThrow();

        (testElement as unknown as HTMLElement).remove();
      }
    });
  });

  describe('Semantic HTML Rendering - Modern', () => {
    it('should render correct semantic heading element', () => {
      element.setAttribute('level', '3');
      element.innerHTML = 'Level 3 Heading';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();

      const heading = element.querySelector('h3') as HTMLHeadingElement | null;
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('Level 3 Heading');
      expect((element as unknown as HTMLElement).children.length).toBe(1);
    });

    it('should preserve HTML content in semantic element', () => {
      element.setAttribute('level', '2');
      element.innerHTML = 'Heading with <em>emphasis</em> and <strong>strength</strong>';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();

      const heading = element.querySelector('h2') as HTMLHeadingElement | null;
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toContain('emphasis');
      expect(heading?.textContent).toContain('strength');
    });

    it('should replace original content completely', () => {
      element.setAttribute('level', '1');
      element.innerHTML = 'Original Content';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();

      // Should only contain the h1, no other text nodes
      expect((element as unknown as HTMLElement).childNodes.length).toBe(1);
      expect((element as unknown as HTMLElement).firstChild?.nodeName).toBe('H1');
    });
  });

  describe('Mixin Integration - StyleHandlerMixin', () => {
    it('should have static stylesheet defined', () => {
      expect(UIHeading.stylesheet).toBeDefined();
    });

    it('should apply stylesheets on connection', () => {
      element.setAttribute('level', '2');
      element.innerHTML = 'Styled Heading';
      document.body.appendChild(element as unknown as HTMLElement);

      // Mock the stylesheet manager to verify it's called
      const applyStylesSpy = vi.fn();
      element.applyStaticStylesheets = applyStylesSpy;

      element.connectedCallback();

      expect(applyStylesSpy).toHaveBeenCalled();
    });

    it('should have stylesheet manager available', () => {
      const manager = element.getStaticStylesheetManager() as {
        addStylesheet: (sheet: CSSStyleSheet) => void;
      };
      expect(manager).toBeDefined();
      expect(typeof manager.addStylesheet).toBe('function');
    });
  });

  describe('Mixin Integration - AccessibilityMixin', () => {
    beforeEach(() => {
      element.setAttribute('level', '2');
      element.innerHTML = 'Accessible Heading';
      document.body.appendChild(element as unknown as HTMLElement);
    });

    it('should provide accessibility configuration', () => {
      element.connectedCallback();

      const config = element.getAccessibilityConfig();
      expect(config.role).toBe('heading');
      expect(config.ariaLevel).toBe('2');
      expect(config.focusable).toBe(false);
    });

    it('should setup accessibility on connection', () => {
      const setupSpy = vi.fn();
      element.setupAccessibility = setupSpy;

      element.connectedCallback();

      expect(setupSpy).toHaveBeenCalled();
    });

    it('should have dynamic accessibility level', () => {
      element.connectedCallback();

      // Change level and verify config updates
      element.setAttribute('level', '4');
      const config = element.getAccessibilityConfig();
      expect(config.ariaLevel).toBe('4');
    });
  });

  describe('Public API', () => {
    beforeEach(() => {
      element.setAttribute('level', '3');
      element.innerHTML = 'Test Heading';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();
    });

    it('should expose level getter', () => {
      expect(element.level).toBe(3);
    });

    it('should return correct level type', () => {
      const level = element.level;
      expect(typeof level).toBe('number');
      expect(level >= 1 && level <= 6).toBe(true);
    });
  });

  describe('Component Architecture - Learning Validation', () => {
    it('should demonstrate minimal modern component pattern', () => {
      element.setAttribute('level', '1');
      element.innerHTML = 'Architecture Demo';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();

      // Static component - no observed attributes for dynamic behavior
      expect(UIHeading.observedAttributes).toEqual([]);

      // Semantic rendering with minimal complexity
      expect(element.querySelector('h1') as HTMLHeadingElement | null).toBeTruthy();

      // Mixin composition working
      expect(typeof element.getAccessibilityConfig).toBe('function');
      expect(typeof element.applyStaticStylesheets).toBe('function');
    });

    it('should have clean DOM output', () => {
      element.setAttribute('level', '2');
      element.innerHTML = 'Clean Output';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();

      // Should only contain semantic heading element
      expect((element as unknown as HTMLElement).children.length).toBe(1);
      expect((element as unknown as HTMLElement).firstElementChild?.tagName).toBe('H2');

      // No utility classes or extra wrapper elements
      expect((element as unknown as HTMLElement).className).toBe('');
    });

    it('should handle lifecycle correctly with mixins', () => {
      element.setAttribute('level', '3');
      element.innerHTML = 'Lifecycle Test';

      // Connection should not throw with mixin composition
      expect(() => {
        document.body.appendChild(element as unknown as HTMLElement);
        element.connectedCallback();
      }).not.toThrow();

      // Disconnection should clean up properly
      expect(() => {
        (element as unknown as { disconnectedCallback: () => void }).disconnectedCallback();
        (element as unknown as HTMLElement).remove();
      }).not.toThrow();
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      element.setAttribute('level', '1');
      element.innerHTML = '';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();

      const heading = element.querySelector('h1') as HTMLHeadingElement | null;
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('');
    });

    it('should handle whitespace-only content', () => {
      element.setAttribute('level', '2');
      element.innerHTML = '   \n   ';
      document.body.appendChild(element as unknown as HTMLElement);
      element.connectedCallback();

      const heading = element.querySelector('h2') as HTMLHeadingElement | null;
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('   \n   ');
    });

    it('should handle multiple connections gracefully', () => {
      element.setAttribute('level', '1');
      element.innerHTML = 'Multiple Connections';
      document.body.appendChild(element as unknown as HTMLElement);

      // First connection
      element.connectedCallback();
      const firstH1 = element.querySelector('h1') as HTMLHeadingElement | null;
      expect(firstH1).toBeTruthy();

      // Second connection (shouldn't duplicate)
      element.connectedCallback();
      expect((element as unknown as HTMLElement).querySelectorAll('h1').length).toBe(1);
    });
  });
});
