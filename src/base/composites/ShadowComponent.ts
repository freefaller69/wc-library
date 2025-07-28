/**
 * ShadowComponent - Component with Shadow DOM, styles, and updates
 * For components that need Shadow DOM encapsulation
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import { ShadowDOMMixin } from '../mixins/ShadowDOMMixin.js';
import { StyleManagerMixin } from '../mixins/StyleManagerMixin.js';
import { SlotManagerMixin } from '../mixins/SlotManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import type { ShadowDOMMixinInterface } from '../mixins/ShadowDOMMixin.js';
import type { UpdateManagerMixinInterface } from '../mixins/UpdateManagerMixin.js';
import type { ComponentConfig } from '../../types/component.js';

const ShadowBase = compose(
  CoreCustomElement,
  ShadowDOMMixin,
  StyleManagerMixin,
  SlotManagerMixin,
  UpdateManagerMixin
);

export abstract class ShadowComponent
  extends ShadowBase
  implements ShadowDOMMixinInterface, UpdateManagerMixinInterface
{
  // Declare properties from ShadowDOMMixin
  declare shadowRoot: ShadowRoot | null;
  declare hasShadowDOM: boolean;

  // Declare methods from UpdateManagerMixin
  declare requestUpdate: () => void;
  declare render?: () => void;

  constructor(config: ComponentConfig) {
    super(config);
  }

  /**
   * Basic implementation of attributeChangedCallback
   */
  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Shadow components typically trigger updates on attribute changes
    this.requestUpdate();
  }
}
