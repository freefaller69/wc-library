/**
 * ShadowComponent - Base class for components that need Shadow DOM
 */

import { BaseComponent } from './BaseComponent.js';
import { StyleManager } from '../utilities/style-helpers.js';
import type { ComponentConfig, AccessibilityOptions } from '../types/component.js';

export interface ShadowComponentConfig extends ComponentConfig {
  shadowMode?: 'open' | 'closed';
  delegatesFocus?: boolean;
}

export abstract class ShadowComponent extends BaseComponent {
  protected shadowRoot: ShadowRoot;
  protected styleManager: StyleManager;
  protected template: HTMLTemplateElement | null = null;

  constructor(config: ShadowComponentConfig) {
    super(config);
    
    // Create shadow root
    this.shadowRoot = this.attachShadow({
      mode: config.shadowMode || 'open',
      delegatesFocus: config.delegatesFocus || false,
    });

    this.styleManager = new StyleManager();
    this.setupShadowDOM();
  }

  /**
   * Sets up the Shadow DOM structure
   */
  private setupShadowDOM(): void {
    // Add component styles
    this.addComponentStyles();
    
    // Apply stylesheets to shadow root
    this.styleManager.applyTo(this.shadowRoot);
    
    // Setup template if provided
    this.setupTemplate();
  }

  /**
   * Sets up the component template
   */
  private setupTemplate(): void {
    const templateContent = this.getTemplate();
    
    if (templateContent) {
      if (typeof templateContent === 'string') {
        this.shadowRoot.innerHTML = templateContent;
      } else {
        // It's a template element
        this.template = templateContent;
        const clone = this.template.content.cloneNode(true);
        this.shadowRoot.appendChild(clone);
      }
    }
  }

  /**
   * Component lifecycle - enhanced for Shadow DOM
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.bindEventListeners();
    this.updateShadowContent();
  }

  /**
   * Component lifecycle - cleanup for Shadow DOM
   */
  disconnectedCallback(): void {
    this.unbindEventListeners();
    super.disconnectedCallback();
  }

  /**
   * Updates shadow DOM content
   */
  protected updateShadowContent(): void {
    this.render?.();
    this.updateSlots();
  }

  /**
   * Updates slot content and handles slot changes
   */
  private updateSlots(): void {
    const slots = this.shadowRoot.querySelectorAll('slot');
    slots.forEach(slot => {
      slot.addEventListener('slotchange', this.handleSlotChange);
    });
  }

  /**
   * Handles slot content changes
   */
  private handleSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assignedElements = slot.assignedElements();
    this.onSlotChange?.(slot.name || 'default', assignedElements);
  };

  /**
   * Adds CSS to the component's shadow DOM
   */
  protected addCSS(cssText: string): void {
    this.styleManager.addCSS(cssText);
    this.styleManager.applyTo(this.shadowRoot);
  }

  /**
   * Adds a stylesheet to the component's shadow DOM
   */
  protected addStyleSheet(sheet: CSSStyleSheet): void {
    this.styleManager.addSheet(sheet);
    this.styleManager.applyTo(this.shadowRoot);
  }

  /**
   * Queries an element within the shadow DOM
   */
  protected shadowQuery<T extends Element = Element>(selector: string): T | null {
    return this.shadowRoot.querySelector<T>(selector);
  }

  /**
   * Queries all elements within the shadow DOM
   */
  protected shadowQueryAll<T extends Element = Element>(selector: string): NodeListOf<T> {
    return this.shadowRoot.querySelectorAll<T>(selector);
  }

  /**
   * Creates and returns a template element
   */
  protected createTemplate(html: string, id?: string): HTMLTemplateElement {
    const template = document.createElement('template');
    if (id) {
      template.id = id;
    }
    template.innerHTML = html;
    return template;
  }

  /**
   * Dispatches events from shadow DOM that can cross the boundary
   */
  protected dispatchShadowEvent(eventName: string, detail?: any, options?: CustomEventInit): boolean {
    const event = new CustomEvent(`ui-${this.config.tagName}-${eventName}`, {
      detail,
      bubbles: true,
      cancelable: true,
      composed: true, // Allows event to cross shadow boundary
      ...options,
    });
    
    return this.dispatchEvent(event);
  }

  /**
   * Sets focus to an element within the shadow DOM
   */
  protected focusShadowElement(selector: string): boolean {
    const element = this.shadowQuery<HTMLElement>(selector);
    if (element && 'focus' in element) {
      element.focus();
      return true;
    }
    return false;
  }

  /**
   * Request update - enhanced for Shadow DOM
   */
  protected requestUpdate(): void {
    super.requestUpdate();
    if (this.shadowRoot) {
      this.updateShadowContent();
    }
  }

  // Abstract methods to be implemented by subclasses
  protected abstract getTemplate(): string | HTMLTemplateElement | null;
  protected abstract addComponentStyles(): void;
  protected abstract bindEventListeners(): void;
  protected abstract unbindEventListeners(): void;

  // Optional lifecycle methods
  protected onSlotChange?(slotName: string, assignedElements: Element[]): void;

  // Render method for shadow DOM content updates
  protected render?(): void;
}