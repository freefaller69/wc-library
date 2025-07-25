# Mixin Patterns and TypeScript Guidelines

This document provides TypeScript patterns and best practices for creating and using mixins in the web component library.

## Core Mixin Pattern

### Basic Mixin Structure

```typescript
// Mixin type definition
type Constructor<T = {}> = new (...args: any[]) => T;

// Mixin function signature
export function ExampleMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  return class ExampleMixinClass extends Base {
    // Mixin implementation
    private _mixinProperty: string = '';
    
    // Mixin methods
    protected mixinMethod(): void {
      // Implementation
    }
    
    // Lifecycle hooks (call super if overriding)
    connectedCallback(): void {
      super.connectedCallback?.();
      // Mixin-specific logic
    }
  };
}

// Interface for type safety
export interface ExampleMixinInterface {
  mixinMethod(): void;
}

// Type helper for composed classes
export type WithExampleMixin<T> = T & ExampleMixinInterface;
```

### Mixin Composition Utility

```typescript
// src/base/utilities/mixin-composer.ts

type Constructor<T = {}> = new (...args: any[]) => T;
type Mixin<T extends Constructor> = (Base: Constructor) => T;

/**
 * Composes multiple mixins with a base class
 * Usage: compose(BaseClass, MixinA, MixinB, MixinC)
 */
export function compose<T extends Constructor>(
  Base: T,
  ...mixins: Mixin<any>[]
): T {
  return mixins.reduce((acc, mixin) => mixin(acc), Base);
}

/**
 * Type-safe mixin composition with interface merging
 */
export function typedCompose<
  TBase extends Constructor,
  TMixins extends readonly Mixin<any>[]
>(
  Base: TBase,
  ...mixins: TMixins
): TBase & UnionToIntersection<ReturnType<TMixins[number]>> {
  return compose(Base, ...mixins) as any;
}

// Utility type for merging mixin interfaces
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
```

## Individual Mixin Patterns

### 1. AccessibilityMixin

```typescript
export interface AccessibilityMixinInterface {
  setAriaStates(states: Record<string, string | boolean | null>): void;
  announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void;
}

export function AccessibilityMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  return class AccessibilityMixinClass extends Base implements AccessibilityMixinInterface {
    private _focusManager?: FocusManager;
    
    connectedCallback(): void {
      super.connectedCallback?.();
      this.setupAccessibility();
    }
    
    disconnectedCallback(): void {
      super.disconnectedCallback?.();
      this.cleanupAccessibility();
    }
    
    protected setupAccessibility(): void {
      const config = this.getAccessibilityConfig?.();
      if (!config) return;
      
      // Setup focus management, ARIA attributes, etc.
    }
    
    private cleanupAccessibility(): void {
      this._focusManager?.cleanup();
    }
    
    setAriaStates(states: Record<string, string | boolean | null>): void {
      setAriaState(this, states);
    }
    
    announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
      announceToScreenReader(message, priority);
    }
    
    // Abstract method - must be implemented by component
    protected abstract getAccessibilityConfig?(): AccessibilityOptions;
  };
}
```

### 2. AttributeManagerMixin

```typescript
export interface AttributeManagerMixinInterface {
  getTypedAttribute(name: string): string | null;
  getTypedAttribute(name: string, type: 'boolean'): boolean;
  getTypedAttribute(name: string, type: 'number'): number | null;
  setTypedAttribute(name: string, value: string | number | boolean | null): void;
}

export function AttributeManagerMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  return class AttributeManagerMixinClass extends Base implements AttributeManagerMixinInterface {
    private staticAttributeCache = new Map<string, string>();
    
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      super.attributeChangedCallback?.(name, oldValue, newValue);
      
      if (oldValue === newValue) return;
      
      const config = this.getAttributeConfig?.();
      if (!config) return;
      
      if (config.staticAttributes?.includes(name)) {
        this.handleStaticAttributeChange(name, newValue);
      } else {
        this.handleDynamicAttributeChange(name, oldValue, newValue);
      }
    }
    
    private handleStaticAttributeChange(name: string, value: string | null): void {
      if (value) {
        this.staticAttributeCache.set(name, value);
      } else {
        this.staticAttributeCache.delete(name);
      }
      this.updateComponentClasses?.();
    }
    
    private handleDynamicAttributeChange(name: string, oldValue: string | null, newValue: string | null): void {
      this.requestUpdate?.();
    }
    
    getTypedAttribute(name: string, type?: 'string' | 'boolean' | 'number'): any {
      const value = this.getAttribute(name);
      
      if (value === null) {
        return type === 'boolean' ? false : null;
      }
      
      switch (type) {
        case 'boolean':
          return value !== 'false' && value !== '';
        case 'number':
          const num = Number(value);
          return isNaN(num) ? null : num;
        default:
          return value;
      }
    }
    
    setTypedAttribute(name: string, value: string | number | boolean | null): void {
      if (value === null || value === undefined) {
        this.removeAttribute(name);
      } else if (typeof value === 'boolean') {
        if (value) {
          this.setAttribute(name, '');
        } else {
          this.removeAttribute(name);
        }
      } else {
        this.setAttribute(name, String(value));
      }
    }
    
    // Abstract methods
    protected abstract getAttributeConfig?(): { staticAttributes?: string[], dynamicAttributes?: string[] };
    protected abstract updateComponentClasses?(): void;
    protected abstract requestUpdate?(): void;
  };
}
```

### 3. EventManagerMixin

```typescript
export interface EventManagerMixinInterface {
  dispatchCustomEvent(eventName: string, detail?: any, options?: CustomEventInit): boolean;
}

export function EventManagerMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  return class EventManagerMixinClass extends Base implements EventManagerMixinInterface {
    dispatchCustomEvent(eventName: string, detail?: any, options?: CustomEventInit): boolean {
      const tagName = this.getTagName?.() || 'component';
      const event = new CustomEvent(`ui-${tagName}-${eventName}`, {
        detail,
        bubbles: true,
        cancelable: true,
        ...options,
      });
      
      return this.dispatchEvent(event);
    }
    
    // Abstract method
    protected abstract getTagName?(): string;
  };
}
```

## Composite Class Patterns

### Creating Composite Base Classes

```typescript
// src/base/composites/SimpleComponent.ts
import { CoreCustomElement } from '../CoreCustomElement.js';

export class SimpleComponent extends CoreCustomElement {
  // Only core functionality - minimal overhead
}

// src/base/composites/InteractiveComponent.ts
import { CoreCustomElement } from '../CoreCustomElement.js';
import { AccessibilityMixin } from '../mixins/AccessibilityMixin.js';
import { EventManagerMixin } from '../mixins/EventManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import { typedCompose } from '../utilities/mixin-composer.js';

export const InteractiveComponent = typedCompose(
  CoreCustomElement,
  AccessibilityMixin,
  EventManagerMixin,
  UpdateManagerMixin
);

export type InteractiveComponent = InstanceType<typeof InteractiveComponent>;
```

### Using Composite Classes

```typescript
// Component implementation using composite
export class ButtonComponent extends InteractiveComponent {
  static get observedAttributes(): string[] {
    return ['disabled', 'variant', 'size'];
  }
  
  constructor() {
    super({
      tagName: 'ui-button',
      observedAttributes: ['disabled', 'variant', 'size'],
      staticAttributes: ['variant', 'size'],
      dynamicAttributes: ['disabled'],
    });
  }
  
  protected getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'button',
      focusable: true,
      ariaLabel: this.textContent || 'Button',
    };
  }
  
  protected getStateClasses(): Record<string, boolean> {
    return {
      'ui-button--disabled': this.getTypedAttribute('disabled', 'boolean'),
    };
  }
  
  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.click();
    }
  }
}
```

## Advanced Patterns

### Conditional Mixin Application

```typescript
// Apply mixins based on configuration
function createComponent(config: ComponentConfig) {
  let Base: Constructor = CoreCustomElement;
  
  if (config.needsAccessibility) {
    Base = AccessibilityMixin(Base);
  }
  
  if (config.needsAttributes) {
    Base = AttributeManagerMixin(Base);
  }
  
  if (config.needsShadowDOM) {
    Base = ShadowDOMMixin(Base);
  }
  
  return Base;
}
```

### Mixin Dependencies

```typescript
// Mixin that depends on other mixins
export function AdvancedMixin<TBase extends Constructor<HTMLElement & AttributeManagerMixinInterface>>(
  Base: TBase
) {
  return class AdvancedMixinClass extends Base {
    // Can safely use AttributeManagerMixin methods
    someMethod(): void {
      const value = this.getTypedAttribute('some-attr');
      // ...
    }
  };
}

// Usage with type safety
const ComponentClass = compose(
  CoreCustomElement,
  AttributeManagerMixin,  // Required dependency
  AdvancedMixin          // Depends on AttributeManagerMixin
);
```

### Mixin Method Override Patterns

```typescript
export function OverridingMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  return class OverridingMixinClass extends Base {
    // Always call super for lifecycle methods
    connectedCallback(): void {
      super.connectedCallback?.();
      // Mixin-specific logic
    }
    
    // For methods that may not exist in base
    protected someMethod(): void {
      // Call super if it exists
      if (super.someMethod) {
        super.someMethod();
      }
      // Additional logic
    }
    
    // Override with extension
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      // Handle mixin-specific attributes first
      if (name === 'mixin-specific-attr') {
        // Handle it
        return;
      }
      
      // Pass to base implementation
      super.attributeChangedCallback?.(name, oldValue, newValue);
    }
  };
}
```

## Type Safety Best Practices

### 1. Always Define Interfaces

```typescript
// Define what the mixin provides
export interface MyMixinInterface {
  myMethod(): void;
  myProperty: string;
}

// Use interface in mixin
export function MyMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  return class extends Base implements MyMixinInterface {
    myProperty: string = '';
    myMethod(): void { /* implementation */ }
  };
}
```

### 2. Use Type Guards for Safety

```typescript
function hasAccessibilityMixin(component: any): component is AccessibilityMixinInterface {
  return typeof component.setAriaStates === 'function';
}

// Usage
if (hasAccessibilityMixin(someComponent)) {
  someComponent.setAriaStates({ expanded: true }); // Type safe
}
```

### 3. Abstract Method Patterns

```typescript
// Use abstract methods for required implementations
export function RequireImplementationMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  abstract class RequireImplementationMixinClass extends Base {
    // Concrete methods
    public mixinMethod(): void {
      const config = this.getRequiredConfig(); // Will enforce implementation
      // Use config...
    }
    
    // Abstract method - must be implemented
    protected abstract getRequiredConfig(): SomeConfigType;
  }
  
  return RequireImplementationMixinClass;
}
```

## Testing Patterns for Mixins

### Individual Mixin Testing

```typescript
// Create minimal test class
class TestMixinComponent extends AccessibilityMixin(CoreCustomElement) {
  constructor() {
    super({ tagName: 'test-mixin' });
  }
  
  protected getAccessibilityConfig(): AccessibilityOptions {
    return { role: 'button', focusable: true };
  }
}

describe('AccessibilityMixin', () => {
  let component: TestMixinComponent;
  
  beforeEach(() => {
    component = new TestMixinComponent();
  });
  
  it('should provide accessibility methods', () => {
    expect(typeof component.setAriaStates).toBe('function');
  });
});
```

### Mixin Combination Testing

```typescript
// Test multiple mixins working together
class TestComboComponent extends compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin
) {
  // Minimal implementation for testing
}
```

This pattern-based approach ensures type safety, reusability, and maintainability throughout the mixin system.