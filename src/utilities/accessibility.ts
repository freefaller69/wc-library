/**
 * Accessibility utilities for web components
 */

let idCounter = 0;

/**
 * Generates a unique ID with an optional prefix
 */
export function generateId(prefix = 'ui'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Announces a message to screen readers via a live region
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Manages focus with options for trapping and restoration
 */
export class FocusManager {
  private previouslyFocusedElement: Element | null = null;
  private trapContainer: HTMLElement | null = null;

  /**
   * Stores current focus and optionally moves focus to a new element
   */
  public capture(newFocusTarget?: HTMLElement): void {
    this.previouslyFocusedElement = document.activeElement;
    if (newFocusTarget) {
      newFocusTarget.focus();
    }
  }

  /**
   * Restores focus to the previously focused element
   */
  public restore(): void {
    if (this.previouslyFocusedElement && 'focus' in this.previouslyFocusedElement) {
      (this.previouslyFocusedElement as HTMLElement).focus();
    }
    this.previouslyFocusedElement = null;
  }

  /**
   * Sets up focus trapping within a container
   */
  public trap(container: HTMLElement): void {
    this.trapContainer = container;
    container.addEventListener('keydown', this.handleTrapKeydown);
  }

  /**
   * Removes focus trapping
   */
  public untrap(): void {
    if (this.trapContainer) {
      this.trapContainer.removeEventListener('keydown', this.handleTrapKeydown);
      this.trapContainer = null;
    }
  }

  private handleTrapKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || !this.trapContainer) {
      return;
    }

    const focusableElements = this.getFocusableElements(this.trapContainer);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        event.preventDefault();
      }
    }
  };

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector));
  }
}

/**
 * Sets ARIA states on an element
 */
export function setAriaState(
  element: HTMLElement,
  states: Record<string, string | boolean | null>
): void {
  Object.entries(states).forEach(([key, value]) => {
    const ariaKey = key.startsWith('aria-') ? key : `aria-${key}`;
    
    if (value === null || value === undefined) {
      element.removeAttribute(ariaKey);
    } else {
      element.setAttribute(ariaKey, String(value));
    }
  });
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNav = {
  /**
   * Handles arrow key navigation for a list of elements
   */
  handleArrowKeys(
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    options: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      loop?: boolean;
    } = {}
  ): number | null {
    const { orientation = 'vertical', loop = true } = options;
    let newIndex = currentIndex;
    let keyHandled = false;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = loop ? (currentIndex + 1) % elements.length : Math.min(currentIndex + 1, elements.length - 1);
          keyHandled = true;
          if (newIndex !== currentIndex || loop) {
            event.preventDefault();
          }
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = loop ? (currentIndex - 1 + elements.length) % elements.length : Math.max(currentIndex - 1, 0);
          keyHandled = true;
          if (newIndex !== currentIndex || loop) {
            event.preventDefault();
          }
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = loop ? (currentIndex + 1) % elements.length : Math.min(currentIndex + 1, elements.length - 1);
          keyHandled = true;
          if (newIndex !== currentIndex || loop) {
            event.preventDefault();
          }
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = loop ? (currentIndex - 1 + elements.length) % elements.length : Math.max(currentIndex - 1, 0);
          keyHandled = true;
          if (newIndex !== currentIndex || loop) {
            event.preventDefault();
          }
        }
        break;
      case 'Home':
        newIndex = 0;
        keyHandled = true;
        event.preventDefault();
        break;
      case 'End':
        newIndex = elements.length - 1;
        keyHandled = true;
        event.preventDefault();
        break;
      default:
        return null;
    }

    if (!keyHandled) {
      return null;
    }

    if (newIndex !== currentIndex) {
      elements[newIndex]?.focus();
      return newIndex;
    }

    // Return current index if key was handled but no movement occurred
    return currentIndex;
  },
};