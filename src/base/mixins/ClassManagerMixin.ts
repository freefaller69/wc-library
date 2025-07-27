/**
 * ClassManagerMixin - Provides CSS class generation and management
 *
 * For components that want utility class-based styling.
 * Separate from AttributeManagerMixin to maintain separation of concerns.
 */

import { ClassUtils } from '../../utilities/style-helpers.js';
import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

// Mixin interface that defines class management features
export interface ClassManagerMixinInterface {
  updateComponentClasses(): void;
  getStateClasses(): Record<string, boolean>;
}

/**
 * Class manager mixin that adds CSS class generation capabilities
 */
export function ClassManagerMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<ClassManagerMixinInterface> {
  abstract class ClassManagerMixin extends Base implements ClassManagerMixinInterface {
    protected config!: ComponentConfig;
    private staticAttributeCache: Map<string, string> = new Map();

    /**
     * Updates component CSS classes based on attributes
     */
    updateComponentClasses(): void {
      const baseClass = this.config.tagName;
      const modifierClasses: Record<string, boolean> = {};

      // Add modifier classes based on static attributes
      this.staticAttributeCache.forEach((value, name) => {
        modifierClasses[`${baseClass}--${name}-${value}`] = true;
      });

      // Add state classes based on dynamic attributes
      const stateClasses = this.getStateClasses();
      Object.assign(modifierClasses, stateClasses);

      this.className = ClassUtils.conditional(`ui-reset ${baseClass}`, modifierClasses);
    }

    /**
     * Updates the static attribute cache (called from AttributeManagerMixin)
     */
    updateStaticAttributeCache(name: string, value: string | null): void {
      if (value) {
        this.staticAttributeCache.set(name, value);
      } else {
        this.staticAttributeCache.delete(name);
      }
    }

    /**
     * Gets state classes - must be implemented by component
     */
    getStateClasses(): Record<string, boolean> {
      throw new Error('getStateClasses must be implemented by the component');
    }
  }

  return ClassManagerMixin;
}
