/**
 * AttributeComponent - Component with attribute management and updates
 * For components that need sophisticated attribute handling but not accessibility
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import { AttributeManagerMixin } from '../mixins/AttributeManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import type { ComponentConfig } from '../../types/component.js';

const AttributeBase = compose(CoreCustomElement, AttributeManagerMixin, UpdateManagerMixin);

export abstract class AttributeComponent extends AttributeBase {
  constructor(config: ComponentConfig) {
    super(config);
  }

  /**
   * Must be implemented by subclasses to define state classes
   */
  abstract getStateClasses(): Record<string, boolean>;
}
