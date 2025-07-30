# Claude Code Session Brief: AccessibilityMixin Development

## Current Problem
Need an AccessibilityMixin to handle dynamic ARIA states, relationships, and screen reader communication for components that require more than semantic HTML provides.

## Session Goal
Build ONLY the AccessibilityMixin - focused on dynamic accessibility features that complement semantic HTML, not replace it.

## What NOT to Change
- CoreCustomElement base class
- ShadowDOMMixin (perfect as-is)
- StyleManagerMixin (perfect as-is)
- EventManagerMixin (perfect as-is)
- AttributeManagerMixin (perfect as-is)
- UpdateManagerMixin (perfect as-is)
- SlotManagerMixin (perfect as-is)
- Mixin-composer utility
- Any other existing code

## Required Deliverables
1. AccessibilityMixin implementation
2. Unit tests for AccessibilityMixin
3. Simple integration test with CoreCustomElement

## Core Philosophy: Semantic HTML First

### What AccessibilityMixin Should NOT Do:
```typescript
// DON'T recreate what semantic HTML already provides
addRole(role: string)           // Use proper HTML elements instead
makeButtonAccessible()          // Use <button> element instead
addBasicKeyboardSupport()       // Use proper focusable elements instead
```

### What AccessibilityMixin SHOULD Do:
```typescript
// Dynamic ARIA states that change during component lifecycle
setAriaExpanded(expanded: boolean): void
setAriaHidden(hidden: boolean): void
setAriaDisabled(disabled: boolean): void
setAriaBusy(busy: boolean): void
setAriaInvalid(invalid: boolean): void

// Complex ARIA relationships between elements
setAriaDescribedBy(elementIds: string[]): void
setAriaLabelledBy(elementIds: string[]): void
setAriaControls(elementIds: string[]): void

// Screen reader communication
announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void

// Live region management
createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement
updateLiveRegion(message: string): void
```

## Primary Use Cases

### 1. Dynamic State Management
```typescript
// Dropdown component
this.setAriaExpanded(isOpen);
this.setAriaControls([this.menuId]);

// Loading states
this.setAriaBusy(isLoading);

// Form validation
this.setAriaInvalid(hasErrors);
this.setAriaDescribedBy([this.errorMessageId]);
```

### 2. Complex Widget Relationships
```typescript
// Modal/Dialog
this.setAriaLabelledBy([this.titleId]);
this.setAriaDescribedBy([this.descriptionId]);

// Combobox
this.setAriaControls([this.listboxId]);
this.setAriaActiveDescendant(this.selectedOptionId);
```

### 3. Screen Reader Communication
```typescript
// Status updates
this.announceToScreenReader('Form saved successfully', 'polite');

// Critical alerts
this.announceToScreenReader('Connection lost', 'assertive');
```

## Interface Definition

```typescript
export interface AccessibilityMixinInterface {
  // Dynamic ARIA state management
  setAriaExpanded(expanded: boolean): void;
  setAriaHidden(hidden: boolean): void;
  setAriaDisabled(disabled: boolean): void;
  setAriaBusy(busy: boolean): void;
  setAriaInvalid(invalid: boolean): void;
  
  // ARIA relationships
  setAriaDescribedBy(elementIds: string[]): void;
  setAriaLabelledBy(elementIds: string[]): void;
  setAriaControls(elementIds: string[]): void;
  
  // Screen reader communication
  announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void;
  
  // Live region management
  createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement;
  updateLiveRegion(message: string): void;
}
```

## Architecture Decisions

### ARIA Attribute Management
```typescript
// Should handle both element and shadowRoot scenarios
// Use proper type safety and null checking
private setAriaAttribute(attribute: string, value: string | null): void {
  if (value === null) {
    this.removeAttribute(attribute);
  } else {
    this.setAttribute(attribute, value);
  }
}
```

### Live Region Strategy
```typescript
// Should live regions be:
// Option A: Created per component instance
// Option B: Shared globally (more efficient)
// Option C: Configurable per component

// Recommendation: Option A for simplicity, can optimize later
```

### Integration with Other Mixins
```typescript
// Should work with UpdateManagerMixin for state changes
// Should integrate with AttributeManagerMixin for attribute updates
// Follow established type guard patterns
```

## Components That Need AccessibilityMixin

### High Priority:
- **Dropdown/Select** - aria-expanded, aria-controls, aria-activedescendant
- **Modal/Dialog** - aria-labelledby, aria-describedby, focus management
- **Tabs** - aria-selected, aria-controls, aria-labelledby
- **Accordion** - aria-expanded, aria-controls

### Medium Priority:
- **Form components with validation** - aria-invalid, aria-describedby
- **Loading states** - aria-busy
- **Dynamic content** - live regions

### Low Priority (Semantic HTML Sufficient):
- **Simple buttons** - Use `<button>` element
- **Basic inputs** - Use proper `<input>` types
- **Links** - Use `<a>` elements

## Error Handling Requirements

### Graceful Degradation
```typescript
// Should continue working if:
// - Screen reader technology is not present
// - ARIA attributes fail to set
// - Live regions can't be created
// - Invalid element IDs are provided
```

### Validation
```typescript
// Should validate:
// - Element IDs exist before setting relationships
// - ARIA values are valid (true/false for boolean attributes)
// - Live region priorities are valid
```

## Performance Considerations

### Efficient Updates
- Don't set ARIA attributes unnecessarily (check current value first)
- Batch related ARIA updates when possible
- Clean up live regions and listeners on disconnect

### Memory Management
- Remove event listeners in disconnectedCallback
- Clean up created live regions
- Avoid memory leaks from retained references

## Success Criteria
- [ ] Provides essential dynamic ARIA management without duplicating semantic HTML
- [ ] Integrates cleanly with existing mixin patterns
- [ ] Handles both Shadow DOM and Light DOM scenarios
- [ ] Includes proper error handling and validation
- [ ] Has comprehensive unit tests
- [ ] No memory leaks or performance regressions
- [ ] Clear documentation of when to use vs semantic HTML

## Integration Examples

### With Existing Mixins
```typescript
class DropdownComponent extends compose(
  CoreCustomElement,
  ShadowDOMMixin,
  StyleManagerMixin,
  AttributeManagerMixin,
  EventManagerMixin,
  AccessibilityMixin
) {
  toggle() {
    this.isOpen = !this.isOpen;
    this.setAriaExpanded(this.isOpen);
    if (this.hasUpdateManager()) {
      this.requestUpdate();
    }
  }
}
```

### Type Guard Pattern
```typescript
// Follow established pattern from other mixins
interface UpdateManagerInterface {
  requestUpdate(): void;
}

private hasUpdateManager(): this is this & UpdateManagerInterface {
  return 'requestUpdate' in this && typeof this.requestUpdate === 'function';
}
```

## Specific Implementation Notes

### Live Region Management
- Create live regions in Shadow DOM if available, otherwise in document
- Use unique IDs to avoid conflicts
- Support both 'polite' and 'assertive' priorities

### ARIA Relationship Handling
- Validate that referenced element IDs exist
- Handle arrays of IDs properly (space-separated values)
- Provide helpful warnings for missing elements

### State Management
- Integrate with AttributeManagerMixin for persistent state
- Support both direct method calls and attribute-driven updates

## Context to Provide Claude Code
- All existing mixin implementations for pattern consistency
- Emphasis on complementing semantic HTML, not replacing it
- Focus on dynamic accessibility features only
- Follow established error handling and type safety patterns

## Validation Steps
1. Test dynamic ARIA state management
2. Verify live region creation and updates work
3. Check integration with other mixins
4. Test memory cleanup on disconnect
5. Ensure graceful degradation without screen readers
6. Validate ARIA relationship handling with real DOM elements