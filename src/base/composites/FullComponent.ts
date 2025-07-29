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
  // Declare properties from ShadowDOMMixin
  declare shadowRoot: ShadowRoot | null;
  declare shadowDOMCreated: boolean;
  declare hasShadowDOM: () => this is { shadowRoot: ShadowRoot };

  constructor(config: ComponentConfig) {
    super(config);
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
