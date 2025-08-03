/**
 * AttributeClassComposite - Component with attribute management and utility class generation
 * For components that need both attribute handling and CSS class-based styling
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import { AttributeManagerMixin } from '../mixins/AttributeManagerMixin.js';
import { ClassManagerMixin } from '../mixins/ClassManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import type { ComponentConfig } from '../../types/component.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const AttributeClassBase = compose(
  CoreCustomElement,
  AttributeManagerMixin,
  ClassManagerMixin,
  UpdateManagerMixin
);

export abstract class AttributeClassComposite extends AttributeClassBase {
  constructor(config: ComponentConfig) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(config);
  }

  /**
   * Must be implemented by subclasses to define state classes
   */
  abstract getStateClasses(): Record<string, boolean>;
}
