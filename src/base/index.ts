/**
 * Base classes exports
 */

// Legacy base classes (deprecated)
/** @deprecated Use CoreCustomElement with mixins or pre-composed classes instead */
export { BaseComponent } from './BaseComponent.js';
/** @deprecated Use ShadowComposite or FullComposite instead */
export { ShadowComponent as LegacyShadowComponent } from './ShadowComponent.js';

// New modular architecture
export { CoreCustomElement } from './CoreCustomElement.js';

// Mixin composition utilities
export { compose, createMixin, applyMixin } from './utilities/mixin-composer.js';
export type { Constructor, Mixin, MixinInterface } from './utilities/mixin-composer.js';

// Individual mixins
export * from './mixins/index.js';

// Pre-composed base classes
export * from './composites/index.js';
