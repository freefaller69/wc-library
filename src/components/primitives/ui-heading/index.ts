/**
 * UIHeading - The Next Generation Component
 *
 * Modern mixin-based heading component demonstrating minimal modern patterns.
 * Architecture: CoreCustomElement + StyleHandlerMixin + AccessibilityMixin
 */

export { UIHeading } from './ui-heading.js';
export type { UIHeadingLevel } from './ui-heading.js';

import { UIHeading } from './ui-heading.js';

// Optional: Export registration function for explicit control
export function registerUIHeading(): void {
  if (!customElements.get('ui-heading')) {
    customElements.define('ui-heading', UIHeading as unknown as CustomElementConstructor);
  }
}
