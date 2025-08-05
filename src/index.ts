/**
 * Main entry point for the web component library
 * Provides individual exports for tree-shaking
 */

// Utilities
export * from './utilities/accessibility.js';
export * from './utilities/style-helpers.js';
export * from './utilities/component-registry.js';

// Types
export * from './types/component.js';

// Re-export component registry for convenience
export { componentRegistry as registry } from './utilities/component-registry.js';
