/**
 * Component registration system for explicit custom element registration
 */

interface ComponentDefinition {
  tagName: string;
  constructor: CustomElementConstructor;
  registered: boolean;
  dependencies?: string[];
}

class ComponentRegistry {
  private definitions = new Map<string, ComponentDefinition>();

  /**
   * Defines a component without immediately registering it
   */
  public define(
    tagName: string,
    constructor: CustomElementConstructor,
    dependencies: string[] = []
  ): void {
    if (this.definitions.has(tagName)) {
      console.warn(`Component ${tagName} is already defined`);
      return;
    }

    this.definitions.set(tagName, {
      tagName,
      constructor,
      registered: false,
      dependencies,
    });
  }

  /**
   * Registers a component with the browser's custom element registry
   */
  public register(tagName: string): boolean {
    const definition = this.definitions.get(tagName);

    if (!definition) {
      console.error(`Component ${tagName} is not defined. Call define() first.`);
      return false;
    }

    if (definition.registered) {
      console.warn(`Component ${tagName} is already registered`);
      return true;
    }

    // Check if already registered in browser (could be registered elsewhere)
    if (customElements.get(tagName)) {
      console.warn(`Custom element ${tagName} is already registered in the browser`);
      definition.registered = true;
      return true;
    }

    // Register dependencies first
    if (definition.dependencies) {
      for (const dep of definition.dependencies) {
        if (!this.register(dep)) {
          console.error(`Failed to register dependency ${dep} for ${tagName}`);
          return false;
        }
      }
    }

    try {
      customElements.define(tagName, definition.constructor);
      definition.registered = true;
      console.log(`Registered component: ${tagName}`);
      return true;
    } catch (error) {
      console.error(`Failed to register ${tagName}:`, error);
      return false;
    }
  }

  /**
   * Registers multiple components
   */
  public registerAll(tagNames: string[]): boolean {
    return tagNames.every((tagName) => this.register(tagName));
  }

  /**
   * Registers all defined components
   */
  public registerAllDefined(): boolean {
    const tagNames = Array.from(this.definitions.keys());
    return this.registerAll(tagNames);
  }

  /**
   * Checks if a component is defined
   */
  public isDefined(tagName: string): boolean {
    return this.definitions.has(tagName);
  }

  /**
   * Checks if a component is registered
   */
  public isRegistered(tagName: string): boolean {
    const definition = this.definitions.get(tagName);
    return definition?.registered || !!customElements.get(tagName);
  }

  /**
   * Gets all defined components
   */
  public getDefinedComponents(): string[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * Gets all registered components
   */
  public getRegisteredComponents(): string[] {
    return Array.from(this.definitions.values())
      .filter((def) => def.registered)
      .map((def) => def.tagName);
  }

  /**
   * Gets unregistered components
   */
  public getUnregisteredComponents(): string[] {
    return Array.from(this.definitions.values())
      .filter((def) => !def.registered)
      .map((def) => def.tagName);
  }

  /**
   * Auto-registers components when they are used in the DOM
   */
  public enableAutoRegistration(): void {
    // Create a MutationObserver to watch for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.autoRegisterElement(node as Element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check existing elements
    this.autoRegisterExistingElements();
  }

  /**
   * Auto-registers an element if it matches a defined component
   */
  private autoRegisterElement(element: Element): void {
    const tagName = element.tagName.toLowerCase();

    if (this.isDefined(tagName) && !this.isRegistered(tagName)) {
      this.register(tagName);
    }

    // Check child elements recursively
    element.querySelectorAll('*').forEach((child) => {
      const childTagName = child.tagName.toLowerCase();
      if (this.isDefined(childTagName) && !this.isRegistered(childTagName)) {
        this.register(childTagName);
      }
    });
  }

  /**
   * Auto-registers existing elements in the DOM
   */
  private autoRegisterExistingElements(): void {
    const definedTags = this.getDefinedComponents();

    definedTags.forEach((tagName) => {
      if (!this.isRegistered(tagName) && document.querySelector(tagName)) {
        this.register(tagName);
      }
    });
  }

  /**
   * Waits for a component to be registered
   */
  public async whenRegistered(tagName: string): Promise<void> {
    if (this.isRegistered(tagName)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const checkRegistration = (): void => {
        if (this.isRegistered(tagName)) {
          resolve();
        } else {
          setTimeout(checkRegistration, 10);
        }
      };
      checkRegistration();
    });
  }

  /**
   * Removes a component definition (cannot unregister from browser)
   */
  public undefine(tagName: string): boolean {
    if (!this.definitions.has(tagName)) {
      return false;
    }

    this.definitions.delete(tagName);
    console.log(`Undefined component: ${tagName}`);
    return true;
  }

  /**
   * Clears all definitions
   */
  public clear(): void {
    this.definitions.clear();
  }
}

// Create and export singleton instance
export const componentRegistry = new ComponentRegistry();

// Convenience functions
export const defineComponent = componentRegistry.define.bind(componentRegistry);
export const registerComponent = componentRegistry.register.bind(componentRegistry);
export const registerAllComponents = componentRegistry.registerAllDefined.bind(componentRegistry);
export const isComponentRegistered = componentRegistry.isRegistered.bind(componentRegistry);
