/**
 * UIHeading Legacy Component - Minimal Smart Pass-Through Component
 *
 * This is the legacy implementation preserved during namespace clearing.
 * Use ui-heading (modern implementation) for new development.
 */

export { UIHeading } from './ui-heading.js';
export type { UIHeadingLevel } from './ui-heading.js';

import { UIHeading } from './ui-heading.js';

// Optional: Export registration function for explicit control
export function registerUIHeadingLegacy(): void {
  if (!customElements.get('ui-heading-legacy')) {
    customElements.define('ui-heading-legacy', UIHeading);
  }
}
