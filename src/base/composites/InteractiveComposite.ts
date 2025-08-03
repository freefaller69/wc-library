/**
 * InteractiveComposite - Component with accessibility, events, and updates
 * For interactive elements like buttons that don't need attribute management
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import { AccessibilityMixin } from '../mixins/AccessibilityMixin.js';
import { EventManagerMixin } from '../mixins/EventManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import type { UpdateManagerMixinInterface } from '../mixins/UpdateManagerMixin.js';
import type { ComponentConfig, AccessibilityOptions } from '../../types/component.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const InteractiveBase = compose(
  CoreCustomElement,
  AccessibilityMixin,
  EventManagerMixin,
  UpdateManagerMixin
);

export abstract class InteractiveComposite
  extends InteractiveBase
  implements UpdateManagerMixinInterface
{
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
    // Interactive components typically trigger updates on attribute changes
    this.requestUpdate();
  }

  /**
   * Must be implemented by subclasses to define accessibility configuration
   */
  abstract getAccessibilityConfig(): AccessibilityOptions;
}
