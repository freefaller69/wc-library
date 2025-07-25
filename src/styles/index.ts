/**
 * Styles exports and initialization
 */

import { createStyleSheet, adoptGlobalStyleSheets } from '../utilities/style-helpers.js';

// Import CSS files as text (will need to be handled by build tool)
// For now, we'll export utilities to load them

/**
 * Loads and adopts the design system styles globally
 */
export async function loadGlobalStyles(): Promise<void> {
  try {
    // In a real build setup, these would be imported as strings
    // For now, we create placeholder sheets
    const tokensCSS = await fetch('/src/styles/tokens.css').then((r) => r.text());
    const resetCSS = await fetch('/src/styles/reset.css').then((r) => r.text());

    const tokensSheet = createStyleSheet(tokensCSS);
    const resetSheet = createStyleSheet(resetCSS);

    adoptGlobalStyleSheets([tokensSheet, resetSheet]);
  } catch (error) {
    console.warn('Failed to load global styles:', error);
  }
}

// Export utilities for manual loading
export { createStyleSheet, adoptGlobalStyleSheets } from '../utilities/style-helpers.js';
