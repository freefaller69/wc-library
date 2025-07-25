/**
 * SimpleComponent - Minimal component for display-only elements
 * Uses only CoreCustomElement without any mixins
 */

import { CoreCustomElement } from '../CoreCustomElement.js';
import type { ComponentConfig } from '../../types/component.js';

export abstract class SimpleComponent extends CoreCustomElement {
  constructor(config: ComponentConfig) {
    super(config);
  }

  /**
   * Simple implementation of attributeChangedCallback
   * For display components that don't need complex attribute handling
   */
  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    // Simple components typically don't need attribute change handling
    // Override in subclasses if needed
  }
}
