/**
 * UIHeading Component - Minimal Smart Pass-Through Component
 *
 * Provides design system consistency and developer experience
 * while rendering proper semantic heading elements.
 */

export { UIHeading } from './ui-heading.js';
export type { UIHeadingLevel } from './ui-heading.js';

import { UIHeading } from './ui-heading.js';

// Optional: Export registration function for explicit control
export function registerUIHeading(): void {
  if (!customElements.get('ui-heading')) {
    customElements.define('ui-heading', UIHeading);
  }
}
