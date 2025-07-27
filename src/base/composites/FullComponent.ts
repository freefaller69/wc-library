/**
 * FullComponent - Complete component with all mixins
 * Equivalent to the current BaseComponent but built with mixins
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import {
  AccessibilityMixin,
  AttributeManagerMixin,
  EventManagerMixin,
  ShadowDOMMixin,
  StyleManagerMixin,
  SlotManagerMixin,
  UpdateManagerMixin,
} from '../mixins/index.js';
import type { ShadowDOMMixinInterface } from '../mixins/ShadowDOMMixin.js';
import type { ComponentConfig, AccessibilityOptions } from '../../types/component.js';

const FullBase = compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin,
  EventManagerMixin,
  ShadowDOMMixin,
  StyleManagerMixin,
  SlotManagerMixin,
  UpdateManagerMixin
);

export abstract class FullComponent extends FullBase implements ShadowDOMMixinInterface {
  // Declare methods from ShadowDOMMixin
  declare shadowRoot: ShadowRoot;
  declare shadowQuery: <T extends Element = Element>(selector: string) => T | null;
  declare shadowQueryAll: <T extends Element = Element>(selector: string) => NodeListOf<T>;
  declare setupShadowDOM: (options?: ShadowRootInit) => void;

  constructor(config: ComponentConfig, shadowOptions?: ShadowRootInit) {
    super(config);
    this.setupShadowDOM(shadowOptions);
  }

  /**
   * Must be implemented by subclasses to define accessibility configuration
   */
  abstract getAccessibilityConfig(): AccessibilityOptions;

  /**
   * Must be implemented by subclasses to define state classes
   */
  abstract getStateClasses(): Record<string, boolean>;
}
