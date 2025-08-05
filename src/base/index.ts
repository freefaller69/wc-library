/**
 * Base classes exports
 */

// Modern modular architecture
export { CoreCustomElement } from './CoreCustomElement.js';

// Mixin composition utilities
export { compose, createMixin, applyMixin } from './utilities/mixin-composer.js';
export type { Constructor, Mixin, MixinInterface } from './utilities/mixin-composer.js';

// Individual mixins
export * from './mixins/index.js';

// Pre-composed base classes
export * from './composites/index.js';
