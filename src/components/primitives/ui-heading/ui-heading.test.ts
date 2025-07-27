/**
 * UIHeading Minimal Component Tests
 * Tests for the smart pass-through functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UIHeading } from './ui-heading.js';

describe('UIHeading - Minimal Implementation', () => {
  let element: UIHeading;

  beforeEach(() => {
    element = new UIHeading();
    // Don't append to DOM yet - level attribute must be set first
  });

  afterEach(() => {
    if (element.parentNode) {
      element.remove();
    }
  });

  describe('Component Registration', () => {
    it('should be defined as a custom element', () => {
      expect(customElements.get('ui-heading')).toBeDefined();
    });

    it('should create an instance', () => {
      expect(element).toBeInstanceOf(UIHeading);
      expect(element).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Semantic HTML Rendering', () => {
    it('should require level attribute - no defaults for accessibility', () => {
      element.innerHTML = 'Test Heading';

      expect(() => {
        element.connectedCallback();
      }).toThrow(
        'UIHeading: Level attribute is required. Must specify level="1" through level="6" for proper accessibility. Missing level would break screen reader navigation.'
      );
    });

    it('should render correct heading level', () => {
      element.setAttribute('level', '3');
      element.innerHTML = 'Level 3 Heading';
      document.body.appendChild(element);
      element.connectedCallback();

      const heading = element.querySelector('h3');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('Level 3 Heading');
    });

    it('should handle all valid heading levels (1-6)', () => {
      for (let level = 1; level <= 6; level++) {
        const testElement = new UIHeading();
        testElement.setAttribute('level', level.toString());
        testElement.innerHTML = `Level ${level}`;
        document.body.appendChild(testElement);
        testElement.connectedCallback();

        const heading = testElement.querySelector(`h${level}`);
        expect(heading).toBeTruthy();
        expect(heading?.textContent).toBe(`Level ${level}`);

        testElement.remove();
      }
    });

    it('should throw error for invalid levels and not render', () => {
      const invalidLevels = ['0', '7', 'invalid', '999', '-1'];

      invalidLevels.forEach((level) => {
        const testElement = new UIHeading();
        testElement.setAttribute('level', level);
        testElement.innerHTML = 'Test';

        expect(() => {
          testElement.connectedCallback();
        }).toThrow(
          `UIHeading: Invalid level "${level}". Level must be a number between 1 and 6 for proper accessibility. Current level would break screen reader navigation.`
        );

        // Component should not have rendered any heading
        expect(testElement.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();

        if (testElement.parentNode) testElement.remove();
      });
    });

    it('should throw error for empty level attribute', () => {
      const testElement = new UIHeading();
      testElement.setAttribute('level', '');
      testElement.innerHTML = 'Test';

      expect(() => {
        testElement.connectedCallback();
      }).toThrow(
        'UIHeading: Level attribute is required. Must specify level="1" through level="6" for proper accessibility. Missing level would break screen reader navigation.'
      );

      if (testElement.parentNode) testElement.remove();
    });

    it('should throw error for missing level attribute', () => {
      const testElement = new UIHeading();
      testElement.innerHTML = 'Test';

      expect(() => {
        testElement.connectedCallback();
      }).toThrow(
        'UIHeading: Level attribute is required. Must specify level="1" through level="6" for proper accessibility. Missing level would break screen reader navigation.'
      );

      if (testElement.parentNode) testElement.remove();
    });
  });

  describe('CSS Custom Properties Styling', () => {
    it('should have level attribute for CSS selector targeting', () => {
      element.setAttribute('level', '4');
      element.innerHTML = 'Test';
      document.body.appendChild(element);
      element.connectedCallback();

      expect(element.getAttribute('level')).toBe('4');
    });

    it('should maintain clean DOM without utility classes', () => {
      element.setAttribute('level', '3');
      element.innerHTML = 'Test';
      document.body.appendChild(element);
      element.connectedCallback();

      // Should only have the base attributes from CoreCustomElement
      expect(element.getAttribute('data-ui-component')).toBe('ui-heading');

      // Should NOT have utility classes
      expect(element.classList.contains('ui-heading')).toBe(false);
      expect(element.classList.contains('ui-heading--level-3')).toBe(false);
    });

    it('should update attribute when level changes for CSS targeting', () => {
      element.setAttribute('level', '2');
      element.innerHTML = 'Test';
      document.body.appendChild(element);
      element.connectedCallback();

      // Change level attribute
      element.setAttribute('level', '5');
      expect(element.getAttribute('level')).toBe('5');
    });
  });

  describe('Public API (Read-Only for Static Components)', () => {
    it('should provide level getter', () => {
      element.setAttribute('level', '3');
      expect(element.level).toBe(3);

      element.setAttribute('level', '5');
      expect(element.level).toBe(5);
    });

    it('should not have setters (static components)', () => {
      // Static components are configured via HTML attributes
      // No programmatic setters to maintain simplicity
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'level');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(descriptor?.set).toBeUndefined();
    });
  });

  describe('Accessibility', () => {
    it('should render semantic heading elements (no manual ARIA needed)', () => {
      element.setAttribute('level', '3');
      element.innerHTML = 'Accessible Heading';
      document.body.appendChild(element);
      element.connectedCallback();

      const heading = element.querySelector('h3');
      expect(heading).toBeTruthy();

      // Browser provides implicit role="heading" and aria-level="3"
      // No need for manual ARIA attributes
      expect(element.getAttribute('role')).toBeNull();
      expect(element.getAttribute('aria-level')).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should have minimal DOM overhead', () => {
      element.setAttribute('level', '3');
      element.innerHTML = 'Test Content';
      document.body.appendChild(element);
      element.connectedCallback();

      // Should only contain one child (the heading element)
      expect(element.children.length).toBe(1);
      expect(element.firstElementChild?.tagName).toBe('H3');
    });

    it('should render once and remain stable (static component)', () => {
      element.setAttribute('level', '2');
      element.innerHTML = 'Original Content';
      document.body.appendChild(element);
      element.connectedCallback();

      const heading = element.querySelector('h2');
      expect(heading).toBeTruthy();
      expect(heading?.textContent).toBe('Original Content');

      // Static component - no re-rendering mechanism needed
      expect(element.children.length).toBe(1);
    });
  });

  describe('Extension Points', () => {
    it('should provide getLevel() as extension point', () => {
      // Test the protected method works correctly
      element.setAttribute('level', '2');
      expect(element.level).toBe(2);

      element.setAttribute('level', '4');
      expect(element.level).toBe(4);
    });
  });
});
