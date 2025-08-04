/**
 * ShadowComposite - Component with Shadow DOM, styles, and updates
 * For components that need Shadow DOM encapsulation
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import { ShadowDOMMixin } from '../mixins/ShadowDOMMixin.js';
import { StyleHandlerMixin } from '../mixins/StyleHandlerMixin.js';
import { SlotManagerMixin } from '../mixins/SlotManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import type { ShadowDOMMixinInterface } from '../mixins/ShadowDOMMixin.js';
import type { UpdateManagerMixinInterface } from '../mixins/UpdateManagerMixin.js';
import type { ComponentConfig } from '../../types/component.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const ShadowBase = compose(
  CoreCustomElement,
  ShadowDOMMixin,
  StyleHandlerMixin,
  SlotManagerMixin,
  UpdateManagerMixin
);

export abstract class ShadowComposite
  extends ShadowBase
  implements ShadowDOMMixinInterface, UpdateManagerMixinInterface
{
  // Declare properties from ShadowDOMMixin
  declare shadowRoot: ShadowRoot | null;
  declare shadowDOMCreated: boolean;
  declare hasShadowDOM: () => this is { shadowRoot: ShadowRoot };

  // Declare methods from UpdateManagerMixin
  declare requestUpdate: () => void;
  declare render?: () => void;

  constructor(config: ComponentConfig) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
