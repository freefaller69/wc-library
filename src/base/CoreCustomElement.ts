/**
 * CoreCustomElement - Minimal base class for all UI components
 * Provides only the essential functionality needed for custom elements
 */

import { generateId } from '../utilities/accessibility.js';
import type { ComponentConfig, LifecycleCallbacks } from '../types/component.js';

export abstract class CoreCustomElement extends HTMLElement implements LifecycleCallbacks {
  protected componentId: string;
  protected config: ComponentConfig;
  private _isComponentInitialized = false;

  constructor(config: ComponentConfig) {
    super();

    // Input validation for required configuration
    if (!config) {
      throw new Error('ComponentConfig is required');
    }
    if (!config.tagName || typeof config.tagName !== 'string' || !config.tagName.trim()) {
      throw new Error('ComponentConfig.tagName is required and must be a non-empty string');
    }

    this.componentId = generateId(config.tagName);
    this.config = config;
    this.setupBaseAttributes();
  }

  /**
   * Component lifecycle - called when element is connected to DOM
   */
  connectedCallback(): void {
    // Prevent duplicate initialization calls, but allow legitimate reconnections
    if (this._isComponentInitialized && this.isConnected) {
      return;
    }

    this._isComponentInitialized = true;
    this.onConnect?.();
  }

  /**
   * Component lifecycle - called when element is disconnected from DOM
   */
  disconnectedCallback(): void {
    // Note: We don't reset _isComponentInitialized to allow for reconnection
    // The native isConnected property will handle the connection state
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
   * Gets whether the component has been initialized
   * Note: For DOM connection state, use the native HTMLElement.isConnected property
   */
  get isComponentInitialized(): boolean {
    return this._isComponentInitialized;
  }

  /**
   * Sets up base component attributes and classes
   * Optimized to minimize DOM operations
   */
  private setupBaseAttributes(): void {
    this.setAttribute('data-ui-component', this.config.tagName);

    // Only set ID if not already present - avoid DOM read if possible
    if (!this.hasAttribute('id')) {
      this.id = this.componentId;
    }
  }

  /**
   * Called when component is first connected to DOM
   * Override this method to perform initialization logic
   * Note: This is called only once per component instance
   */
  onConnect?(): void;

  /**
   * Called when component is disconnected from DOM
   * Override this method to perform cleanup logic
   * Note: Component may be reconnected later, so avoid permanent cleanup
   */
  onDisconnect?(): void;

  /**
   * Called when component is adopted to a new document
   * Override this method to handle document context changes
   * Note: This is rarely used but important for cross-document scenarios
   */
  onAdopt?(): void;
}
