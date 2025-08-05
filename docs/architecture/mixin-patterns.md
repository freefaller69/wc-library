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
export function compose<T extends Constructor>(Base: T, ...mixins: Mixin<any>[]): T {
  return mixins.reduce((acc, mixin) => mixin(acc), Base);
}

/**
 * Additional utility functions available in the actual implementation:
 * - createMixin: Creates a mixin with improved type inference
 * - applyMixin: Helper for single mixin application
 * - implementsMixin: Type-safe mixin interface checking
 */
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

    private handleDynamicAttributeChange(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ): void {
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
    protected abstract getAttributeConfig?(): {
      staticAttributes?: string[];
      dynamicAttributes?: string[];
    };
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
// Example: Minimal component using only core functionality
// (Components like UI Heading use build-from-scratch approach)
import { CoreCustomElement } from '../CoreCustomElement.js';

export class MinimalComponent extends CoreCustomElement {
  // Only core functionality - minimal overhead
}

// src/base/composites/InteractiveComposite.ts
import { CoreCustomElement } from '../CoreCustomElement.js';
import { AccessibilityMixin } from '../mixins/AccessibilityMixin.js';
import { EventManagerMixin } from '../mixins/EventManagerMixin.js';
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js';
import { compose } from '../utilities/mixin-composer.js';

const InteractiveBase = compose(
  CoreCustomElement,
  AccessibilityMixin,
  EventManagerMixin,
  UpdateManagerMixin
);

export abstract class InteractiveComposite extends InteractiveBase {
  // Implementation details...
}
```

### Using Composite Classes

```typescript
// Component implementation using composite
export class ButtonComponent extends InteractiveComposite {
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
export function AdvancedMixin<
  TBase extends Constructor<HTMLElement & AttributeManagerMixinInterface>,
>(Base: TBase) {
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
  AttributeManagerMixin, // Required dependency
  AdvancedMixin // Depends on AttributeManagerMixin
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
    myMethod(): void {
      /* implementation */
    }
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

## Mixin Complexity Assessment Framework

Based on comprehensive analysis of mixin integration across primitive components, the following patterns have emerged:

### Mixin Evaluation Matrix

| Mixin                     | Primitive Value | Bundle Impact | Runtime Cost | Complexity Level | Status                  |
| ------------------------- | --------------- | ------------- | ------------ | ---------------- | ----------------------- |
| **AttributeManagerMixin** | ✅ High         | Low           | Low          | Medium           | ✅ Recommended          |
| **AccessibilityMixin**    | ✅ High         | Medium        | Low          | Medium           | ✅ Recommended          |
| **ShadowDOMMixin**        | ✅ High         | Low           | Low          | Low              | ✅ Recommended          |
| **StyleHandlerMixin**     | ✅ High         | Low           | Low          | Low              | ✅ Recommended          |
| **ClassManagerMixin**     | ✅ Medium       | Low           | Low          | Low              | ✅ Situational          |
| **SlotManagerMixin**      | ✅ Medium       | Low           | Low          | Medium           | ✅ Situational          |
| **UpdateManagerMixin**    | ❌ Overkill     | High          | High         | High             | ❌ Avoid for primitives |
| **EventManagerMixin**     | ❌ Overkill     | High          | High         | High             | ❌ Avoid for primitives |

### Component Complexity Spectrum

**Primitives** (ui-button, ui-input, ui-card):

- Simple, direct web platform API usage optimal
- Minimal abstraction layers preferred
- Focus on performance and maintainability

**Molecules** (form-group, data-list, modal-dialog):

- May benefit from coordination mixins
- Selective mixin integration based on real needs
- Balance complexity vs functionality

**Organisms** (dashboard, data-table, application-shell):

- Likely need sophisticated state and event management
- Complex mixins provide clear value
- Full-featured abstractions justified

### Anti-Patterns Identified

1. **Over-Engineering**: Adding complexity without corresponding benefit
2. **One-Size-Fits-All**: Assuming all components need the same capabilities
3. **Premature Optimization**: Optimizing for problems that don't exist
4. **Abstraction Overhead**: Creating layers that obscure simple operations

### Evidence-Based Integration Principle

> The best architecture often means knowing when NOT to add abstraction layers.

**Integration Decision Framework:**

1. Does the component actually need this complexity?
2. What's the real-world performance impact vs benefit?
3. Are there integration conflicts or naming issues?
4. Does it solve problems the component actually has?
5. What's the maintenance overhead vs functionality gain?

For detailed analysis examples, see:

- `/docs/architecture/eventmanager-mixin-analysis.md` - Comprehensive EventManagerMixin evaluation
- `/docs/architecture/update-management-architecture-analysis.md` - UpdateManagerMixin complexity analysis
