/**
 * Tests for accessibility utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  generateId,
  announceToScreenReader,
  FocusManager,
  setAriaState,
  KeyboardNav,
} from '../utilities/accessibility.js';

describe('Accessibility Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('generateId', () => {
    it('should generate unique IDs with default prefix', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toMatch(/^ui-\d+$/);
      expect(id2).toMatch(/^ui-\d+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate unique IDs with custom prefix', () => {
      const id = generateId('custom');
      expect(id).toMatch(/^custom-\d+$/);
    });
  });

  describe('announceToScreenReader', () => {
    afterEach(() => {
      // Clean up any announcement elements
      document.querySelectorAll('[aria-live]').forEach((el) => el.remove());
    });

    it('should create a live region for announcements', () => {
      announceToScreenReader('Test message');

      const liveRegion = document.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
      expect(liveRegion?.textContent).toBe('Test message');
    });

    it('should use assertive priority when specified', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const liveRegion = document.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeTruthy();
    });

    it('should remove announcement after timeout', () => {
      vi.useFakeTimers();

      announceToScreenReader('Test message');
      expect(document.querySelector('[aria-live]')).toBeTruthy();

      vi.advanceTimersByTime(1000);
      expect(document.querySelector('[aria-live]')).toBeFalsy();

      vi.useRealTimers();
    });
  });

  describe('FocusManager', () => {
    let focusManager: FocusManager;
    let button1: HTMLButtonElement;
    let button2: HTMLButtonElement;
    let container: HTMLDivElement;

    beforeEach(() => {
      focusManager = new FocusManager();

      button1 = document.createElement('button');
      button1.textContent = 'Button 1';

      button2 = document.createElement('button');
      button2.textContent = 'Button 2';

      container = document.createElement('div');
      container.appendChild(button1);
      container.appendChild(button2);

      document.body.appendChild(container);
    });

    describe('capture and restore', () => {
      it('should capture current focus and move to new element', () => {
        button1.focus();
        expect(document.activeElement).toBe(button1);

        focusManager.capture(button2);
        expect(document.activeElement).toBe(button2);
      });

      it('should restore focus to previously focused element', () => {
        button1.focus();
        focusManager.capture(button2);

        focusManager.restore();
        expect(document.activeElement).toBe(button1);
      });

      it('should handle capture without new focus target', () => {
        button1.focus();
        focusManager.capture();

        expect(document.activeElement).toBe(button1);

        button2.focus();
        focusManager.restore();
        expect(document.activeElement).toBe(button1);
      });
    });

    describe('focus trapping', () => {
      it('should trap tab navigation within container', () => {
        focusManager.trap(container);
        button2.focus(); // Focus last element

        // Simulate Tab key (should wrap to first)
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
        container.dispatchEvent(tabEvent);

        // Should move to button1 (first element)
        expect(document.activeElement).toBe(button1);
      });

      it('should handle Shift+Tab in focus trap', () => {
        focusManager.trap(container);
        button1.focus();

        // Simulate Shift+Tab key
        const shiftTabEvent = new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
        });
        container.dispatchEvent(shiftTabEvent);

        // Should move to button2 (last element)
        expect(document.activeElement).toBe(button2);
      });

      it('should remove focus trap', () => {
        focusManager.trap(container);
        focusManager.untrap();

        // Tab event should no longer be handled
        button1.focus();
        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
        const preventDefault = vi.spyOn(tabEvent, 'preventDefault');

        container.dispatchEvent(tabEvent);
        expect(preventDefault).not.toHaveBeenCalled();
      });
    });
  });

  describe('setAriaState', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    it('should set ARIA attributes', () => {
      setAriaState(element, {
        expanded: true,
        'aria-label': 'Test label',
        describedby: 'description-id',
      });

      expect(element.getAttribute('aria-expanded')).toBe('true');
      expect(element.getAttribute('aria-label')).toBe('Test label');
      expect(element.getAttribute('aria-describedby')).toBe('description-id');
    });

    it('should remove ARIA attributes when value is null', () => {
      element.setAttribute('aria-expanded', 'true');

      setAriaState(element, {
        expanded: null,
      });

      expect(element.hasAttribute('aria-expanded')).toBe(false);
    });

    it('should handle boolean values', () => {
      setAriaState(element, {
        expanded: false,
        hidden: true,
      });

      expect(element.getAttribute('aria-expanded')).toBe('false');
      expect(element.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('KeyboardNav', () => {
    let elements: HTMLButtonElement[];

    beforeEach(() => {
      elements = [];
      for (let i = 0; i < 3; i++) {
        const button = document.createElement('button');
        button.textContent = `Button ${i + 1}`;
        elements.push(button);
        document.body.appendChild(button);
      }
    });

    describe('handleArrowKeys', () => {
      it('should handle vertical arrow navigation', () => {
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        const preventDefault = vi.spyOn(downEvent, 'preventDefault');

        const newIndex = KeyboardNav.handleArrowKeys(downEvent, elements, 0);

        expect(newIndex).toBe(1);
        expect(preventDefault).toHaveBeenCalled();
        expect(document.activeElement).toBe(elements[1]);
      });

      it('should handle horizontal arrow navigation', () => {
        const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });

        const newIndex = KeyboardNav.handleArrowKeys(rightEvent, elements, 0, {
          orientation: 'horizontal',
        });

        expect(newIndex).toBe(1);
        expect(document.activeElement).toBe(elements[1]);
      });

      it('should loop navigation when enabled', () => {
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });

        const newIndex = KeyboardNav.handleArrowKeys(
          downEvent,
          elements,
          2, // Last element
          { loop: true }
        );

        expect(newIndex).toBe(0); // Should wrap to first
        expect(document.activeElement).toBe(elements[0]);
      });

      it('should not loop navigation when disabled', () => {
        elements[2].focus(); // Focus the last element first
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });

        const newIndex = KeyboardNav.handleArrowKeys(
          downEvent,
          elements,
          2, // Last element
          { loop: false }
        );

        expect(newIndex).toBe(2); // Should return current index when no movement
        expect(document.activeElement).toBe(elements[2]);
      });

      it('should handle Home and End keys', () => {
        const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
        const endEvent = new KeyboardEvent('keydown', { key: 'End' });

        let newIndex = KeyboardNav.handleArrowKeys(homeEvent, elements, 1);
        expect(newIndex).toBe(0);
        expect(document.activeElement).toBe(elements[0]);

        newIndex = KeyboardNav.handleArrowKeys(endEvent, elements, 1);
        expect(newIndex).toBe(2);
        expect(document.activeElement).toBe(elements[2]);
      });

      it('should return null for unhandled keys', () => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });

        const newIndex = KeyboardNav.handleArrowKeys(spaceEvent, elements, 0);
        expect(newIndex).toBe(null);
      });

      it('should respect orientation settings', () => {
        const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });

        // Should not handle right arrow in vertical-only mode
        const newIndex = KeyboardNav.handleArrowKeys(rightEvent, elements, 0, {
          orientation: 'vertical',
        });

        expect(newIndex).toBe(null);
      });
    });
  });
});
