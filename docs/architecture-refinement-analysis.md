# Architecture Refinement Analysis: UI-Heading Component

## Overview

This document analyzes the current `ui-heading` implementation and proposes a refined architecture that emphasizes **composability**, **separation of concerns**, and **reusability** to create a solid foundation for all future components.

---

## 🔍 Current Implementation Analysis

### Strengths

- ✅ Angular-style file separation
- ✅ Light DOM for styling flexibility
- ✅ Good accessibility implementation
- ✅ Comprehensive test coverage

### Areas for Improvement

#### 1. **Manual CSS Class Management**

```typescript
// Current approach - repetitive across components
private updateVariantClasses(): void {
  const classesToRemove: string[] = [];
  for (let i = 0; i < this.classList.length; i++) {
    const className = this.classList.item(i);
    if (className && className.startsWith('ui-heading--variant-')) {
      classesToRemove.push(className);
    }
  }
  classesToRemove.forEach(className => this.classList.remove(className));
  this.classList.add(`ui-heading--variant-${this._variant}`);
}
```

#### 2. **Mixed Responsibilities**

- Semantic concerns (heading level) mixed with visual styling (variants)
- Component managing its own DOM manipulation
- Event dispatching logic repeated across methods

#### 3. **Non-Reusable Patterns**

- Variant management will be needed in `ui-text`, `ui-button`
- Truncation logic reusable across all text components
- Attribute validation patterns repeated

---

## 💡 Proposed Composable Architecture

### 1. **Typography Utilities** (`typography-utilities.ts`)

Extracted reusable utilities for common text component needs:

```typescript
// Reusable CSS class management
export class VariantManager {
  setVariant(variant: string): void {
    this.removeVariantClasses();
    this.element.classList.add(`${this.prefix}--variant-${variant}`);
  }
}

// Reusable truncation behavior
export class TruncationManager {
  enable(): void {
    /* systematic truncation */
  }
  disable(): void {
    /* cleanup */
  }
}

// Reusable attribute validation
export class AttributeValidator {
  static validateEnum<T>(value: string | null, allowed: readonly T[], fallback: T): T;
  static validateRange(value: string | null, min: number, max: number, fallback: number): number;
}

// Consistent event dispatching
export class ComponentEventDispatcher {
  dispatch(eventName: string, detail?: unknown): boolean;
}
```

### 2. **TypographyComponent Base Class**

Provides common typography functionality:

```typescript
export abstract class TypographyComponent extends BaseComponent {
  protected variantManager: VariantManager;
  protected truncationManager: TruncationManager;
  protected eventDispatcher: ComponentEventDispatcher;

  // Handles common typography attributes (variant, truncate)
  protected handleTypographyAttributeChange(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void;

  // Provides text metrics and reading time utilities
  protected getTextMetrics(): { width: number; height: number; lines: number };
  protected getReadingTime(wordsPerMinute?: number): number;
}
```

### 3. **Refined UI-Heading Component**

Much cleaner with focused responsibilities:

```typescript
export class UIHeading extends TypographyComponent {
  private _level: UIHeadingLevel = 2;

  constructor() {
    super({
      tagName: 'ui-heading',
      defaultVariant: 'h2',
      allowedVariants: ALLOWED_VARIANTS,
      truncationOptions: { maxLines: 1, showTooltip: true },
    });
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'level') {
      this._level = AttributeValidator.validateRange(newValue, 1, 6, 2) as UIHeadingLevel;
      this.updateSemanticLevel();
    } else {
      // Delegate typography concerns to parent
      this.handleTypographyAttributeChange(name, oldValue, newValue);
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  // Focused on heading-specific semantic concerns
  private updateSemanticLevel(): void {
    this.setAriaStates({ 'aria-level': this._level.toString() });
    this.eventDispatcher.dispatch('level-change', { level: this._level });
  }
}
```

---

## 📊 Comparison: Before vs After

| Aspect               | Current Implementation          | Refined Architecture          |
| -------------------- | ------------------------------- | ----------------------------- |
| **Lines of Code**    | ~200 lines                      | ~80 lines                     |
| **Responsibilities** | Mixed (semantic + visual + DOM) | Focused (semantic only)       |
| **Reusability**      | Component-specific              | Shared utilities              |
| **Maintainability**  | Manual class management         | Systematic utilities          |
| **Testability**      | Monolithic tests                | Focused unit tests            |
| **Composability**    | None                            | High - utilities + base class |

---

## 🎯 Benefits for Future Components

### **UI-Text Component** (Next)

```typescript
export class UIText extends TypographyComponent {
  constructor() {
    super({
      tagName: 'ui-text',
      defaultVariant: 'body',
      allowedVariants: ['body', 'caption', 'emphasis', 'strong', 'code'],
      truncationOptions: { maxLines: 3, showTooltip: true },
    });
  }

  // Only needs to implement text-specific logic
  // Variant + truncation management comes free from base class
}
```

### **UI-Button Component**

```typescript
export class UIButton extends BaseComponent {
  private variantManager = new VariantManager(this, 'ui-button');
  private eventDispatcher = new ComponentEventDispatcher(this, 'ui-button');

  // Reuses variant management pattern
  // Gets consistent event dispatching
}
```

---

## 🏗️ Architectural Patterns Established

### 1. **Separation of Concerns**

- **Utilities**: Reusable functionality (variant management, truncation, validation)
- **Base Classes**: Common patterns (typography, interactions)
- **Components**: Focused on specific functionality (heading semantics)

### 2. **Composition over Inheritance**

- Components compose utilities rather than implementing everything
- Base classes provide patterns, not implementation
- Managers handle specific concerns (variants, events, truncation)

### 3. **Consistent API Patterns**

- All components use same variant management system
- Consistent event naming and dispatching
- Standardized attribute validation

### 4. **Progressive Enhancement**

- Base functionality works without JavaScript
- Enhanced features layered on top
- Graceful degradation built-in

---

## 🎨 Theming & Styling Benefits

### **Simplified CSS Architecture**

```css
/* Systematic class generation */
ui-heading.ui-heading--variant-display {
  /* display styles */
}
ui-heading.ui-heading--variant-title {
  /* title styles */
}
ui-heading.ui-heading--level-1 {
  /* semantic h1 styles */
}
ui-heading.ui-heading--truncate {
  /* truncation styles */
}

/* Shared truncation styles across all components */
.ui-truncated {
  /* Common truncation styling */
}
```

### **Consistent Design Tokens**

- All typography components share same variant system
- Systematic CSS custom property usage
- Consistent spacing and sizing patterns

---

## ✅ Recommended Next Steps

### 1. **Immediate Action**

- Implement refined `ui-heading` with new architecture
- Create `ui-text` using `TypographyComponent` base
- Validate pattern with `ui-button` (using utilities but not typography base)

### 2. **Future Components**

- All text components extend `TypographyComponent`
- All components use utility managers for common concerns
- Establish base classes for other patterns (forms, layouts, media)

### 3. **Testing Strategy**

- Test utilities independently
- Test base classes with mock components
- Focus component tests on specific functionality only

---

## 🎯 Success Metrics

1. **Reduced Duplication**: Common patterns reused across components
2. **Faster Development**: New components built with established patterns
3. **Better Maintainability**: Changes to patterns update all components
4. **Improved Testing**: Focused tests for specific responsibilities
5. **Consistent UX**: Standardized behaviors across all components

This refined architecture provides the **solid foundation** needed for rapid, consistent development of the remaining components while maintaining high quality and accessibility standards.

---

## 📝 Implementation Recommendation

**Replace the current ui-heading implementation with the refined version** to establish these patterns before building ui-text and ui-button. This ensures all components follow the same architectural principles from the start.
