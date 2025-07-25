/**
 * ShadowDOMMixin - Provides Shadow DOM creation and management
 */

import type { Constructor } from '../utilities/mixin-composer.js';

// Mixin interface that defines Shadow DOM features
export interface ShadowDOMMixinInterface {
  shadowRoot: ShadowRoot;
  shadowQuery<T extends Element = Element>(selector: string): T | null;
  shadowQueryAll<T extends Element = Element>(selector: string): NodeListOf<T>;
  setupShadowDOM(options?: ShadowRootInit): void;
}

/**
 * Shadow DOM mixin that adds shadow root creation and querying utilities
 */
export function ShadowDOMMixin<TBase extends Constructor<HTMLElement>>(
  Base: TBase
): TBase & Constructor<ShadowDOMMixinInterface> {
  return class ShadowDOMMixin extends Base implements ShadowDOMMixinInterface {
    declare shadowRoot: ShadowRoot;
    private _shadowSetup = false;

    constructor(...args: any[]) {
      super(...args);
      this.setupShadowDOM();
    }

    /**
     * Sets up Shadow DOM with default or custom configuration
     */
    setupShadowDOM(options: ShadowRootInit = { mode: 'open' }): void {
      if (this._shadowSetup) return;
      this._shadowSetup = true;

      if (!this.shadowRoot) {
        this.attachShadow(options);
      }
    }

    /**
     * Query selector within shadow DOM
     */
    shadowQuery<T extends Element = Element>(selector: string): T | null {
      return this.shadowRoot.querySelector<T>(selector);
    }

    /**
     * Query selector all within shadow DOM
     */
    shadowQueryAll<T extends Element = Element>(selector: string): NodeListOf<T> {
      return this.shadowRoot.querySelectorAll<T>(selector);
    }
  };
}
