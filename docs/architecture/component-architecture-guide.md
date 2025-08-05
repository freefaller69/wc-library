# Component Architecture Guide

This guide provides a comprehensive overview of the web component library's architecture, covering the two primary approaches for building web components and the decision-making framework for choosing the right approach.

## Architecture Overview

The component library provides **two primary architectural approaches** for building web components:

```
CoreCustomElement (Foundation)
    ↓
1. Build-from-Scratch Approach (Direct Extension)
   - Extends CoreCustomElement directly
   - Minimal overhead, maximum control
   - Example: UI Heading component

2. Mixin Composition Approach (Feature Assembly)
   - Uses mixin composition for complex functionality
   - Modular feature addition
   - Example: UI Button component

3. Composite Base Classes (Quick Start)
   - Pre-built combinations: SimpleComposite, InteractiveComposite, etc.
   - Balanced feature sets for common patterns
```

### Core Design Principles

1. **Progressive Enhancement**: Start minimal, add only what's needed
2. **Type Safety**: Full TypeScript support with interface definitions
3. **Performance First**: Optimize for minimal overhead and efficient updates
4. **Accessibility by Design**: Built-in accessibility features when needed
5. **Composability**: Mix and match functionality through mixins

## Component Types and When to Use Each

### 1. CoreCustomElement (Foundation)

**Use for**: Library internals, custom base classes, or when you need maximum control.

```typescript
// Minimal foundation - rarely used directly
abstract class CoreCustomElement extends HTMLElement {
  protected componentId: string;
  protected config: ComponentConfig;

  // Essential lifecycle management
  connectedCallback(): void;
  disconnectedCallback(): void;
  adoptedCallback(): void;
  abstract attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void;
}
```

**Key Features**:

- Input validation for component configuration
- Unique ID generation
- Base attribute setup (`data-ui-component`, `id`)
- Essential lifecycle hooks
- Initialization state tracking

**Performance Profile**: Minimal overhead (~1KB), fastest initialization

### 2. Build-from-Scratch Approach (Direct Extension)

**Use for**: Static content, display-only components, simple elements where performance is critical.

```typescript
// Example: UI Heading component using build-from-scratch approach
export class UIHeading extends CoreCustomElement {
  static get observedAttributes(): string[] {
    return ['level', 'variant'];
  }

  constructor() {
    super({ tagName: 'ui-heading' });
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    // Direct, minimal handling - no mixin overhead
    if (name === 'level') {
      this.updateHeadingLevel(newValue);
    } else if (name === 'variant') {
      this.updateVariant(newValue);
    }
  }

  private updateHeadingLevel(level: string | null): void {
    // Direct DOM manipulation for optimal performance
    this.setAttribute('role', 'heading');
    this.setAttribute('aria-level', level || '1');
  }
}
```

**Key Features**:

- Extends CoreCustomElement directly
- Zero mixin overhead
- Direct attribute and DOM manipulation
- Maximum performance optimization
- Full control over every aspect

**Performance Profile**: Minimal overhead (~1KB), fastest initialization and updates

**Recommended For**:

- Text elements (headings, paragraphs, labels)
- Static icons or decorative elements
- Simple containers that don't need interaction
- Performance-critical components
- Components with very specific requirements

### 3. Mixin Composition Approach (Feature Assembly)

**Use for**: Interactive components, form elements, complex UI widgets, components needing accessibility features.

```typescript
// Example: UI Button using mixin composition
import { compose } from '../utilities/mixin-composer.js';
import { AccessibilityMixin } from '../mixins/AccessibilityMixin.js';
import { AttributeManagerMixin } from '../mixins/AttributeManagerMixin.js';
import { StyleHandlerMixin } from '../mixins/StyleHandlerMixin.js';

const UIButtonBase = compose(
  CoreCustomElement,
  AttributeManagerMixin,
  AccessibilityMixin,
  StyleHandlerMixin
);

export class UIButton extends UIButtonBase {
  static get observedAttributes(): string[] {
    return ['disabled', 'variant', 'size', 'type'];
  }

  constructor() {
    super({ tagName: 'ui-button' });
  }

  getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'button',
      focusable: true,
      ariaLabel: this.textContent || 'Button',
    };
  }

  getStateClasses(): Record<string, boolean> {
    return {
      'ui-button--disabled': this.getTypedAttribute('disabled', 'boolean'),
      'ui-button--loading': this.hasAttribute('loading'),
    };
  }
}
```

**Key Features**:

- Modular feature assembly through mixin composition
- Type-safe attribute management via AttributeManagerMixin
- Built-in accessibility features via AccessibilityMixin
- Automatic styling and state management via StyleHandlerMixin
- Additional mixins available as needed (EventManagerMixin, ShadowDOMMixin, etc.)
- Clean separation of concerns between different functional areas

**Performance Profile**: Moderate overhead (~4-8KB) depending on mixin selection

**Recommended For**:

- Form controls (buttons, inputs, selects)
- Interactive widgets requiring accessibility
- Components with complex attribute management
- Components needing dynamic styling
- Scenarios where you want to pick specific functionality modules

### 4. Composite Base Classes (Quick Start)

**Use for**: Common component patterns without custom mixin selection.

```typescript
// Pre-built composites for common patterns
import { SimpleComposite, InteractiveComposite, ShadowComposite } from '../composites/';

// Simple component with basic functionality
export class MySimpleComponent extends SimpleComposite {
  // Gets AttributeManagerMixin automatically
}

// Interactive component with full feature set
export class MyInteractiveComponent extends InteractiveComposite {
  // Gets AttributeManagerMixin + AccessibilityMixin + StyleHandlerMixin
}

// Component needing Shadow DOM
export class MyShadowComponent extends ShadowComposite {
  // Gets ShadowDOMMixin + StyleHandlerMixin + other essentials
}
```

**Available Composites**:

- **SimpleComposite**: AttributeManagerMixin only
- **InteractiveComposite**: AttributeManagerMixin + AccessibilityMixin + StyleHandlerMixin
- **ShadowComposite**: ShadowDOMMixin + StyleHandlerMixin + AttributeManagerMixin
- **FullComposite**: All mixins for maximum functionality

## Mixin System Deep Dive

The mixin composition approach provides modular functionality through strategic composition:

### Available Mixins

```typescript
// Core mixins available for composition
import { AccessibilityMixin } from '../mixins/AccessibilityMixin.js'; // ARIA, focus management
import { AttributeManagerMixin } from '../mixins/AttributeManagerMixin.js'; // Type-safe attributes
import { EventManagerMixin } from '../mixins/EventManagerMixin.js'; // Custom event system
import { ShadowDOMMixin } from '../mixins/ShadowDOMMixin.js'; // Shadow DOM support
import { StyleHandlerMixin } from '../mixins/StyleHandlerMixin.js'; // Dynamic styling
import { SlotManagerMixin } from '../mixins/SlotManagerMixin.js'; // Content projection
import { UpdateManagerMixin } from '../mixins/UpdateManagerMixin.js'; // Update scheduling
```

### Cross-Mixin Communication Patterns

The mixins are designed to work together through shared interfaces and method calls:

#### 1. Attribute → Style Management Chain

```typescript
// AttributeManagerMixin detects change
attributeChangedCallback(name, oldValue, newValue) {
  // ... processing ...
  this.updateComponentClasses?.(); // Calls StyleHandlerMixin
}

// StyleHandlerMixin responds
updateComponentClasses() {
  const stateClasses = this.getStateClasses(); // From component
  // Apply classes efficiently using modern adoptedStyleSheets API
}
```

#### 2. Update Request Chain

```typescript
// Any mixin can request updates
this.requestUpdate?.(); // From UpdateManagerMixin

// UpdateManagerMixin schedules efficiently
private scheduleUpdate() {
  if (!this.updateScheduled) {
    this.updateScheduled = true;
    queueMicrotask(() => this.performUpdate());
  }
}
```

#### 3. Accessibility Integration

```typescript
// AccessibilityMixin hooks into component lifecycle
setupAccessibility() {
  const config = this.getAccessibilityConfig?.(); // From component
  if (config.focusable) {
    this.setupFocusManagement();
  }
}
```

### Type Safety Patterns

Each mixin provides explicit interfaces for type safety:

```typescript
// Mixin interface definition
export interface AttributeManagerMixinInterface {
  getTypedAttribute(name: string): string | null;
  getTypedAttribute(name: string, type: 'boolean'): boolean;
  getTypedAttribute(name: string, type: 'number'): number | null;
  setTypedAttribute(name: string, value: string | number | boolean | null): void;
}

// Component implementation with type safety
export class MyMixinComponent extends compose(
  CoreCustomElement,
  AttributeManagerMixin,
  AccessibilityMixin
) {
  // TypeScript automatically infers combined interface
  // All mixin methods available with type safety
}
```

## Performance Optimizations

### Build-from-Scratch Approach Optimizations

1. **Zero Mixin Overhead**: Direct inheritance, minimal call stack
2. **Minimal Lifecycle**: Only essential callbacks implemented
3. **Direct DOM Manipulation**: No abstraction layers
4. **Fast Initialization**: Minimal setup in constructor
5. **Optimized for Specific Use Case**: Every line of code serves the component's exact needs

### Mixin Composition Approach Optimizations

1. **Selective Feature Loading**: Only include needed mixins
2. **Attribute Caching**: AttributeManagerMixin provides intelligent caching
3. **Efficient Style Management**: StyleHandlerMixin uses modern adoptedStyleSheets API
4. **Update Batching**: UpdateManagerMixin batches changes when included
5. **Memory Management**: Proper cleanup across all mixins

### Benchmark Results

Based on performance testing with current architecture:

```typescript
// Initialization time (lower is better)
Build-from-Scratch:  ~0.3ms per instance
Mixin Composition:   ~1.5ms per instance (varies by mixin count)
Composite Classes:   ~1.0ms per instance

// Memory footprint (lower is better)
Build-from-Scratch:  ~1KB per instance
Mixin Composition:   ~3-8KB per instance (varies by mixin selection)
Composite Classes:   ~4-6KB per instance

// Attribute update time (lower is better)
Build-from-Scratch:  ~0.05ms per update
Mixin Composition:   ~0.2ms per update (with caching)
Composite Classes:   ~0.15ms per update
```

## Decision Framework

### Choose Build-from-Scratch Approach When:

- ✅ Component is primarily for content display
- ✅ No complex user interactions required
- ✅ Accessibility needs are minimal (semantic HTML sufficient)
- ✅ Attribute changes are infrequent
- ✅ Performance is absolutely critical
- ✅ Bundle size matters most
- ✅ Component has very specific, unique requirements

**Examples**: UI Heading, labels, icons, simple containers, static text elements

### Choose Mixin Composition Approach When:

- ✅ Component needs user interaction
- ✅ Accessibility features required (ARIA, focus management)
- ✅ Complex attribute handling needed
- ✅ Custom events must be dispatched
- ✅ Shadow DOM encapsulation beneficial
- ✅ Frequent state changes expected
- ✅ Advanced styling features needed

**Examples**: UI Button, form inputs, modals, dropdowns, tabs, complex widgets

### Choose Composite Base Classes When:

- ✅ You want quick start with proven patterns
- ✅ Standard feature combinations meet your needs
- ✅ Don't want to manually select mixins
- ✅ Consistency across team development is important

**Available Options**:

- **SimpleComposite**: Basic components with attribute management
- **InteractiveComposite**: Interactive components with accessibility
- **ShadowComposite**: Components needing encapsulation
- **FullComposite**: Maximum functionality for complex widgets

### Migration Path

If you start with build-from-scratch and need more features later:

```typescript
// Original build-from-scratch component
class MySimpleComponent extends CoreCustomElement {
  // Direct implementation
}

// Migrate to mixin composition when needs grow
const MyEnhancedBase = compose(CoreCustomElement, AttributeManagerMixin, AccessibilityMixin);

class MyEnhancedComponent extends MyEnhancedBase {
  // Enhanced capabilities with type safety
  getAccessibilityConfig(): AccessibilityOptions {
    return { role: 'button', focusable: true };
  }
}
```

## Best Practices

### For Build-from-Scratch Development

1. **Keep It Minimal**: Only add essential functionality for your specific use case
2. **Direct Implementation**: Manual attribute handling and DOM updates
3. **Performance First**: Optimize for your component's exact requirements
4. **Semantic HTML**: Rely on proper HTML semantics for basic accessibility

```typescript
export class UIBadge extends CoreCustomElement {
  static get observedAttributes(): string[] {
    return ['variant', 'count'];
  }

  constructor() {
    super({ tagName: 'ui-badge' });
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'variant') {
      this.className = `ui-badge ui-badge--${newValue || 'default'}`;
    } else if (name === 'count') {
      this.textContent = newValue || '0';
    }
  }
}
```

### For Mixin Composition Development

1. **Select Mixins Deliberately**: Only include mixins you actually need
2. **Use Typed Attributes**: Leverage AttributeManagerMixin for type safety
3. **Implement Mixin Interfaces**: Provide required methods like getAccessibilityConfig
4. **Custom Events**: Use EventManagerMixin for component communication

```typescript
const ToggleSwitchBase = compose(
  CoreCustomElement,
  AttributeManagerMixin,
  AccessibilityMixin,
  StyleHandlerMixin
);

export class ToggleSwitch extends ToggleSwitchBase {
  static get observedAttributes(): string[] {
    return ['checked', 'disabled', 'label'];
  }

  getAccessibilityConfig(): AccessibilityOptions {
    return {
      role: 'switch',
      focusable: true,
      ariaLabel: this.getTypedAttribute('label') || 'Toggle switch',
    };
  }

  getStateClasses(): Record<string, boolean> {
    return {
      'ui-toggle--checked': this.getTypedAttribute('checked', 'boolean'),
      'ui-toggle--disabled': this.getTypedAttribute('disabled', 'boolean'),
    };
  }
}

  private handleClick(): void {
    if (this.getTypedAttribute('disabled', 'boolean')) return;

    const newChecked = !this.getTypedAttribute('checked', 'boolean');
    this.setTypedAttribute('checked', newChecked);

    // EventManagerMixin provides dispatchCustomEvent
    this.dispatchCustomEvent('toggle', { checked: newChecked });
  }
}
```

## Architecture Benefits

### Maintainability

- Clear separation of concerns through mixins
- Consistent patterns across components
- Type safety prevents runtime errors
- Easy to extend and modify

### Performance

- Choose appropriate level of functionality
- Optimized update cycles
- Efficient DOM operations
- Memory management built-in

### Developer Experience

- Intuitive progression from simple to complex
- Comprehensive TypeScript support
- Consistent APIs across component types
- Clear migration paths

### Accessibility

- Built-in accessibility for interactive components
- ARIA support through AccessibilityMixin
- Focus management included
- Screen reader announcements

This architecture provides a solid foundation for building scalable, performant, and accessible web components while maintaining developer productivity and code quality.

## Strategic Development Integration

This architecture guide supports our **3-Phase Component Development Strategy** documented in `/docs/development/strategic-component-roadmap.md`. The component types and patterns described here provide the technical foundation for:

### Phase 1: Core Primitives

- **Build-from-Scratch Approach**: Used for display-only primitives (ui-heading, ui-text, ui-icon)
- **Mixin Composition Approach**: Used for interactive primitives (ui-button, ui-input, ui-select, ui-checkbox)

### Phase 2: Molecule Components

- **Mixin Composition or Composite Classes**: Used for components that combine multiple primitives
- **Validated Patterns**: Proven composition strategies from primitive implementations

### Phase 3: Architecture Optimization

- **Performance Benchmarks**: Based on real measurements of current architecture patterns
- **Mixin Refinements**: Driven by evidence from production component implementations

See the strategic roadmap for detailed implementation phases and success criteria.
