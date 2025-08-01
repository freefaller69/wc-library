# Claude Code Session Brief: Button Component Development

## Current Problem

Need to build the first primitive Button component using the refined mixin foundation to validate the entire architecture with a real-world interactive component.

## Session Goal

Build ONLY a Button component - a focused, accessible, themeable button that demonstrates clean mixin composition.

## What NOT to Change

- CoreCustomElement base class (perfect as-is)
- ShadowDOMMixin (perfect as-is)
- StyleManagerMixin (perfect as-is)
- EventManagerMixin (perfect as-is)
- AttributeManagerMixin (perfect as-is)
- UpdateManagerMixin (perfect as-is)
- SlotManagerMixin (perfect as-is)
- AccessibilityMixin (perfect as-is)
- Mixin-composer utility
- Any other existing code

## Required Deliverables

1. Button component implementation (.ts file)
2. Button component styles (.css file)
3. Unit tests for Button component
4. Simple usage example

## Architecture Requirements

### Mixin Composition

```typescript
const ButtonComponent = compose(
  CoreCustomElement,
  ShadowDOMMixin,
  StyleManagerMixin,
  AttributeManagerMixin,
  EventManagerMixin,
  AccessibilityMixin
);
```

### Component Structure

```
components/button/
├── button.component.ts      # Implementation
├── button.component.css     # Styles
├── button.component.spec.ts # Tests
└── button.component.md      # Documentation
```

## Component Requirements

### Core Functionality

- **Click events** with proper event dispatching
- **Disabled state** management
- **Loading state** support
- **Variant styling** (primary, secondary, danger, etc.)
- **Size options** (small, medium, large)

### Attribute Design

```typescript
// Static attributes (set once, don't change)
staticAttributes: ['variant', 'size'];

// Dynamic attributes (can change during lifecycle)
// disabled, loading, aria-pressed (for toggle buttons)
```

### Expected Usage

```html
<!-- Basic button -->
<ui-button>Click me</ui-button>

<!-- Variants -->
<ui-button variant="primary">Primary Action</ui-button>
<ui-button variant="secondary">Secondary Action</ui-button>
<ui-button variant="danger">Delete</ui-button>

<!-- Sizes -->
<ui-button size="small">Small</ui-button>
<ui-button size="large">Large Button</ui-button>

<!-- States -->
<ui-button disabled>Disabled</ui-button>
<ui-button loading>Processing...</ui-button>
```

## Styling Requirements

### CSS Custom Properties for Theming

```css
/* Avoid utility classes - use semantic custom properties */
--button-bg-color
--button-text-color
--button-border-color
--button-border-radius
--button-padding-x
--button-padding-y
--button-font-size
--button-font-weight
```

### Variant System

```css
/* Clean variant classes, not utility spam */
.button--primary {
  /* primary variant styles */
}
.button--secondary {
  /* secondary variant styles */
}
.button--danger {
  /* danger variant styles */
}

/* NOT this utility class approach */
.bg-blue-500.text-white.px-4.py-2.rounded {
  /* avoid! */
}
```

### State Management

```css
/* Semantic state classes */
.button--disabled {
  /* disabled styles */
}
.button--loading {
  /* loading styles */
}
.button--pressed {
  /* pressed/active styles */
}
```

### Responsive and Accessible Design

- **Focus indicators** using `:focus-visible`
- **High contrast support** with proper color ratios
- **Reduced motion** support for animations
- **Touch-friendly** sizing (44px minimum)

## Implementation Guidelines

### TypeScript Implementation

```typescript
class ButtonComponent extends compose(...mixins) {
  // Should be compact - most functionality comes from mixins

  static get observedAttributes() {
    return getObservedAttributes(this.config);
  }

  constructor() {
    super({
      tagName: 'ui-button',
      staticAttributes: ['variant', 'size'],
      // Minimal configuration, leverage mixin defaults
    });
  }

  // Button-specific event handling
  handleClick(event: Event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      return;
    }

    this.dispatchCustomEvent('click', {
      originalEvent: event,
    });
  }

  // Simple render method
  render() {
    this.shadowRoot.innerHTML = `
      <button class="button" part="button">
        <slot></slot>
      </button>
    `;
  }
}
```

### Event Integration

- Use **EventManagerMixin** for custom event dispatching
- Dispatch `ui-button-click` events with proper detail
- Handle keyboard events (Enter, Space) for accessibility
- Prevent events when disabled or loading

### Accessibility Integration

- Use **AccessibilityMixin** for dynamic ARIA states
- Set `aria-disabled` for disabled state
- Set `aria-busy` for loading state
- Support `aria-pressed` for toggle button variants
- Ensure proper focus management

## Styling Philosophy

### Avoid Utility Class Pollution

```html
<!-- Good: Semantic, clean DOM -->
<ui-button variant="primary" size="large">
  #shadow-root
  <button class="button button--primary button--large">
    <slot></slot>
  </button>
</ui-button>

<!-- Bad: Utility class spam -->
<ui-button class="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"> ... </ui-button>
```

### CSS Custom Property Strategy

```css
/* Theme-aware, not hardcoded */
.button {
  background: var(--button-bg-color, var(--color-neutral-100));
  color: var(--button-text-color, var(--color-neutral-900));
  border: 1px solid var(--button-border-color, transparent);
  border-radius: var(--button-border-radius, var(--radius-md));

  /* NOT hardcoded values */
  /* background: #3b82f6; */
}
```

## Success Criteria

- [ ] Component file is compact (under 100 lines of TypeScript)
- [ ] Styles use CSS custom properties for theming
- [ ] DOM remains clean without utility class pollution
- [ ] All mixin integrations work correctly
- [ ] Accessibility patterns are properly implemented
- [ ] Events dispatch correctly through EventManagerMixin
- [ ] Attributes are managed through AttributeManagerMixin
- [ ] Component is fully tested
- [ ] Usage examples demonstrate the API clearly

## Testing Requirements

- **Unit tests** for component behavior
- **Event testing** for click handling and custom events
- **Accessibility testing** for ARIA state management
- **Attribute testing** for static and dynamic attributes
- **Integration testing** with all composed mixins

## Performance Considerations

- **Minimal bundle impact** - leverage existing mixin functionality
- **Efficient styling** - avoid complex CSS selectors
- **Event efficiency** - proper event delegation and cleanup
- **Memory management** - ensure proper cleanup in disconnectedCallback

## Context to Provide Claude Code

- Current mixin implementations for integration patterns
- Emphasis on leveraging the mixin foundation rather than reimplementing functionality
- Focus on clean, semantic styling over utility classes
- Goal of validating the entire mixin architecture with this first primitive

## Validation Steps

1. Verify mixin composition works correctly
2. Test static and dynamic attribute handling
3. Validate event dispatching through EventManagerMixin
4. Check accessibility features from AccessibilityMixin
5. Ensure styling follows theming approach without utility classes
6. Confirm DOM remains clean and semantic
7. Run all tests to ensure no regressions in mixin functionality
