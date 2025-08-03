/**
 * AttributeComposite - Component with attribute management and updates only
 * For components that need attribute handling but NOT utility class generation
 *
 * Use AttributeClassComposite if you need utility class generation.
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import { AttributeManagerMixin } from '../mixins/AttributeManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import type { ComponentConfig } from '../../types/component.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const AttributeBase = compose(CoreCustomElement, AttributeManagerMixin, UpdateManagerMixin);

export abstract class AttributeComposite extends AttributeBase {
  constructor(config: ComponentConfig) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(config);
  }
}
