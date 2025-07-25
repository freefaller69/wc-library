/**
 * InteractiveAttributeComponent - Component with accessibility, attributes, events, and updates
 * For interactive elements that need sophisticated attribute handling
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import { compose } from '../utilities/mixin-composer.js';
import { AccessibilityMixin } from '../mixins/AccessibilityMixin.js';
import { AttributeManagerMixin } from '../mixins/AttributeManagerMixin.js';
import { EventManagerMixin } from '../mixins/EventManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import type { ComponentConfig, AccessibilityOptions } from '../../types/component.js';

const InteractiveAttributeBase = compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin,
  EventManagerMixin,
  UpdateManagerMixin
);

export abstract class InteractiveAttributeComponent extends InteractiveAttributeBase {
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