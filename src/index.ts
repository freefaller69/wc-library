/**
 * Main entry point for the web component library
 * Provides individual exports for tree-shaking
 */

// Base classes (deprecated)
/** @deprecated Use CoreCustomElement with mixins or pre-composed classes instead */
export { BaseComponent } from './base/BaseComponent.js';
/** @deprecated Use ShadowComposite or FullComposite instead */
export { ShadowComponent } from './base/ShadowComponent.js';

// Utilities
export * from './utilities/accessibility.js';
export * from './utilities/style-helpers.js';
export * from './utilities/component-registry.js';

// Types
export * from './types/component.js';

// Re-export component registry for convenience
export { componentRegistry as registry } from './utilities/component-registry.js';
