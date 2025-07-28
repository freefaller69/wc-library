/**
 * ShadowDOMMixin - Provides Shadow DOM creation and management based on component configuration
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

// Base type that ShadowDOMMixin expects to work with
type ShadowDOMBase = HTMLElement & {
  config: ComponentConfig;
  connectedCallback?(): void;
};

// Mixin interface that defines Shadow DOM features
export interface ShadowDOMMixinInterface {
  shadowRoot: ShadowRoot | null;
  hasShadowDOM: boolean;
}

/**
 * Shadow DOM mixin that creates shadowRoot based on component configuration
 */
export function ShadowDOMMixin<TBase extends Constructor<ShadowDOMBase>>(
  Base: TBase
): TBase & Constructor<ShadowDOMMixinInterface> {
  abstract class ShadowDOMMixin extends Base implements ShadowDOMMixinInterface {
    declare shadowRoot: ShadowRoot | null;

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
    }

    /**
     * Component lifecycle - called when element is connected to DOM
     * Creates shadowRoot if config.useShadowDOM is true
     */
    connectedCallback(): void {
      super.connectedCallback?.();
      this.setupShadowDOM();
    }

    /**
     * Gets whether this component has Shadow DOM enabled
     */
    get hasShadowDOM(): boolean {
      return Boolean(this.config.useShadowDOM);
    }

    /**
     * Sets up Shadow DOM based on component configuration
     */
    private setupShadowDOM(): void {
      if (!this.config.useShadowDOM) {
        return;
      }

      // Prevent multiple calls to attachShadow
      if (this.shadowRoot) {
        console.warn(
          `ShadowDOMMixin: Shadow DOM already exists for component ${this.config.tagName}. Ignoring duplicate setup.`
        );
        return;
      }

      try {
        const options = this.config.shadowOptions || { mode: 'open' };
        this.attachShadow(options);
      } catch (error) {
        console.error(
          `ShadowDOMMixin: Failed to create shadow DOM for component ${this.config.tagName}:`,
          error
        );
        // Don't rethrow - allow component to continue functioning without shadow DOM
      }
    }
  }

  return ShadowDOMMixin;
}
