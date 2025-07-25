/**
 * CoreCustomElement - Minimal base class for all UI components
 * Provides only the essential functionality needed for custom elements
 */

import { generateId } from '../utilities/accessibility.js';
import type { ComponentConfig, LifecycleCallbacks } from '../types/component.js';

export abstract class CoreCustomElement extends HTMLElement implements LifecycleCallbacks {
  protected componentId: string;
  protected config: ComponentConfig;
  private _isConnected = false;

  constructor(config: ComponentConfig) {
    super();
    this.componentId = generateId(config.tagName);
    this.config = config;
    this.setupBaseAttributes();
  }

  /**
   * Component lifecycle - called when element is connected to DOM
   */
  connectedCallback(): void {
    if (this._isConnected) return;

    this._isConnected = true;
    this.onConnect?.();
  }

  /**
   * Component lifecycle - called when element is disconnected from DOM
   */
  disconnectedCallback(): void {
    this._isConnected = false;
    this.onDisconnect?.();
  }

  /**
   * Component lifecycle - called when element is adopted to new document
   */
  adoptedCallback(): void {
    this.onAdopt?.();
  }

  /**
   * Component lifecycle - called when observed attributes change
   * This is abstract to force implementation in mixins or subclasses
   */
  abstract attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void;

  /**
   * Static getter for observed attributes
   * Must be implemented by subclasses or mixins
   */
  static get observedAttributes(): string[] {
    return [];
  }

  /**
   * Gets the connection state of the component
   */
  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Sets up base component attributes and classes
   */
  private setupBaseAttributes(): void {
    this.classList.add('ui-reset');
    this.setAttribute('data-ui-component', this.config.tagName);

    if (!this.id) {
      this.id = this.componentId;
    }
  }

  // Lifecycle methods (can be overridden)
  onConnect?(): void;
  onDisconnect?(): void;
  onAdopt?(): void;
}