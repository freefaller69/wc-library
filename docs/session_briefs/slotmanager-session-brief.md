# Claude Code Session Brief: SlotManagerMixin Development

## Current Problem

Need a SlotManagerMixin to handle slot management, content projection, and slot-related events for Shadow DOM components.

## Session Goal

Build ONLY the SlotManagerMixin - focused on slot detection, content management, and slot change events.

## What NOT to Change

- CoreCustomElement base class
- ShadowDOMMixin (perfect as-is)
- StyleManagerMixin (perfect as-is)
- EventManagerMixin (perfect as-is)
- AttributeManagerMixin (perfect as-is)
- UpdateManagerMixin (perfect as-is)
- Mixin-composer utility
- Any other existing code

## Required Deliverables

1. SlotManagerMixin implementation
2. Unit tests for SlotManagerMixin
3. Simple integration test with CoreCustomElement + ShadowDOMMixin

## Core Requirements

### 1. Slot Detection and Management

```typescript
interface SlotManagerMixinInterface {
  getSlot(name?: string): HTMLSlotElement | null;
  getSlottedContent(slotName?: string): Element[];
  hasSlottedContent(slotName?: string): boolean;
  onSlotChange?(slotName: string, event: Event): void;
}
```

### 2. Slot Change Event Handling

- Listen for `slotchange` events on all slots
- Provide callbacks for slot content changes
- Handle both named and default slots
- Clean up event listeners on disconnect

### 3. Content Projection Utilities

- Easy access to slotted content
- Helper methods for common slot operations
- Support for conditional rendering based on slot content

## Architecture Decisions

### Slot Discovery Strategy

```typescript
// Should slots be discovered:
// Option A: In connectedCallback (when component connects)
// Option B: Lazily (when first accessed)
// Option C: Continuously (watch for new slots being added)

// Recommendation: Option A for simplicity and performance
```

### Event Handling Approach

```typescript
// Should the mixin:
// Option A: Automatically bind to all slots and call onSlotChange callback
// Option B: Provide manual slot event binding methods
// Option C: Use a registry pattern for slot listeners

// Recommendation: Option A with optional callback override
```

### Shadow DOM Integration

```typescript
// Should SlotManagerMixin:
// - Require ShadowDOMMixin (slots only work in Shadow DOM)?
// - Work independently and check for shadowRoot?
// - Handle Light DOM scenarios gracefully?

// Recommendation: Work independently, check for shadowRoot, warn if not present
```

## Expected Functionality

### Basic Slot Operations

```typescript
// Get slot elements
const defaultSlot = this.getSlot(); // default slot
const headerSlot = this.getSlot('header'); // named slot

// Check for content
if (this.hasSlottedContent('footer')) {
  // Footer content is present
}

// Get slotted elements
const headerContent = this.getSlottedContent('header');
```

### Slot Change Handling

```typescript
class MyComponent extends compose(CoreCustomElement, ShadowDOMMixin, SlotManagerMixin) {
  onSlotChange(slotName: string, event: Event) {
    // Called when slot content changes
    if (slotName === 'header') {
      this.updateHeaderClasses();
    }
  }
}
```

### Template Integration

```typescript
// Should work with shadow DOM templates
render() {
  this.shadowRoot.innerHTML = `
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="footer" ${this.hasSlottedContent('footer') ? '' : 'hidden'}>
      <slot name="footer"></slot>
    </div>
  `;
}
```

## Performance Considerations

### Event Listener Management

- Efficient slot change event binding
- Proper cleanup on disconnectedCallback
- Avoid memory leaks from unremoved listeners

### Slot Discovery Optimization

- Cache slot references when possible
- Avoid repeated DOM queries
- Lazy evaluation where appropriate

## Error Handling Requirements

### Shadow DOM Dependency

```typescript
// Graceful handling when shadowRoot doesn't exist
if (!this.shadowRoot) {
  console.warn('SlotManagerMixin: Slots require Shadow DOM. Consider using ShadowDOMMixin.');
  return;
}
```

### Robust Event Handling

- Handle cases where slots are dynamically added/removed
- Graceful degradation if slot elements are missing
- Proper error logging without breaking component

## Success Criteria

- [ ] Provides clean API for slot access and content detection
- [ ] Automatically handles slot change events
- [ ] Works seamlessly with ShadowDOMMixin
- [ ] Degrades gracefully without Shadow DOM
- [ ] Has comprehensive unit tests
- [ ] No memory leaks from event listeners
- [ ] Integrates cleanly with existing mixin patterns

## Integration Points

### With ShadowDOMMixin

```typescript
// Should work together seamlessly
const Component = compose(CoreCustomElement, ShadowDOMMixin, SlotManagerMixin);
```

### With UpdateManagerMixin

```typescript
// Slot changes might trigger updates
onSlotChange(slotName: string) {
  if (this.hasUpdateManager()) {
    this.requestUpdate(); // Trigger re-render if needed
  }
}
```

## Example Component Usage

```typescript
class CardComponent extends compose(
  CoreCustomElement,
  ShadowDOMMixin,
  SlotManagerMixin,
  StyleManagerMixin
) {
  render() {
    this.shadowRoot.innerHTML = `
      <div class="card">
        ${this.hasSlottedContent('header') ? '<div class="card-header"><slot name="header"></slot></div>' : ''}
        <div class="card-body"><slot></slot></div>
        ${this.hasSlottedContent('actions') ? '<div class="card-actions"><slot name="actions"></slot></div>' : ''}
      </div>
    `;
  }

  onSlotChange(slotName: string) {
    // Re-render when slot content changes
    this.render();
  }
}
```

## Specific Implementation Notes

### Lifecycle Integration

- Discover slots in `connectedCallback`
- Set up event listeners after slot discovery
- Clean up in `disconnectedCallback`

### Type Safety

- Use proper type guards consistent with other mixins
- Handle null/undefined slot elements gracefully
- Provide good TypeScript support for slot operations

### Keep It Simple

- Focus on core slot functionality
- Avoid over-engineering slot templating systems
- Don't try to solve every possible slot scenario

## Context to Provide Claude Code

- Current ShadowDOMMixin implementation
- UpdateManagerMixin for potential integration
- Emphasis on clean, simple API for slot operations
- Focus on essential slot management without over-engineering

## Validation Steps

1. Test slot discovery and content detection
2. Verify slot change event handling works correctly
3. Check integration with ShadowDOMMixin
4. Test memory cleanup on disconnect
5. Ensure graceful degradation without Shadow DOM
6. Validate no breaking changes to existing patterns
