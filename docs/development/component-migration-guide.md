# Component Migration Guide

> **Historical Document Notice** (Updated August 5, 2025): This document was written for migrating from the original BaseComponent/ShadowComponent architecture to mixin-based components. Since then, these legacy components have been **completely removed** from the codebase (August 2025). This document is preserved for historical reference but is **no longer applicable** to current development.
>
> **For Current Component Development**: See the current component patterns in `/src/components/` (UI Button using mixin composition, UI Heading using build-from-scratch) and refer to `/docs/development/component-development-lessons.md` for current best practices.

## Historical Context

This guide provided step-by-step instructions for migrating components from the BaseComponent/ShadowComponent architecture to the mixin-based system that was implemented in 2025.

## Migration Overview

### Migration Strategy

1. **Parallel Development**: Build new mixin-based components alongside existing ones
2. **Feature Parity Validation**: Ensure all functionality is preserved
3. **Performance Verification**: Confirm performance improvements
4. **Gradual Replacement**: Replace old components one at a time
5. **Testing & Validation**: Comprehensive testing at each step

### Migration Timeline

- **Phase 1**: Assess and categorize existing components
- **Phase 2**: Create optimal mixin compositions for each component type
- **Phase 3**: Migrate components with validation
- **Phase 4**: Remove deprecated implementations

## Pre-Migration Assessment

### Component Analysis Checklist

For each existing component, assess:

```typescript
// Component Assessment Template
interface ComponentAssessment {
  name: string;
  currentBase: 'BaseComponent' | 'ShadowComponent';
  features: {
    accessibility: boolean;
    attributes: boolean;
    events: boolean;
    shadowDOM: boolean;
    styles: boolean;
    slots: boolean;
    updates: boolean;
  };
  complexity: 'simple' | 'interactive' | 'complex';
  recommendedMixins: string[];
  migrationPriority: 'high' | 'medium' | 'low';
  estimatedEffort: 'small' | 'medium' | 'large';
}
```

### Example Assessment

```typescript
// Example: Button Component Assessment
const buttonAssessment: ComponentAssessment = {
  name: 'ButtonComponent',
  currentBase: 'BaseComponent',
  features: {
    accessibility: true, // Has focus management, ARIA
    attributes: true, // Has variant, size, disabled
    events: true, // Dispatches click events
    shadowDOM: false, // Uses light DOM
    styles: false, // No shadow styles
    slots: false, // No slot management
    updates: true, // Has render method
  },
  complexity: 'interactive',
  recommendedMixins: [
    'AccessibilityMixin',
    'AttributeManagerMixin',
    'EventManagerMixin',
    'UpdateManagerMixin',
  ],
  migrationPriority: 'high',
  estimatedEffort: 'small',
};
```

## Step-by-Step Migration Process

### Step 1: Analyze Current Component

```typescript
// 1. Document current implementation
class ButtonComponent extends BaseComponent {
  static get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled'];
  }

  constructor() {
    super({
      tagName: 'ui-button',
      observedAttributes: ['variant', 'size', 'disabled'],
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

  protected render(): void {
    // Render logic
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.click();
    }
  }
}
```

### Step 2: Determine Optimal Mixin Composition

```typescript
// 2. Choose appropriate composite base or mixin combination
import { InteractiveComponent } from '../base/composites/InteractiveComponent.js';
// OR
import { compose } from '../base/utilities/mixin-composer.js';
import { CoreCustomElement } from '../base/CoreCustomElement.js';
import { AccessibilityMixin } from '../base/mixins/AccessibilityMixin.js';
import { AttributeManagerMixin } from '../base/mixins/AttributeManagerMixin.js';
import { EventManagerMixin } from '../base/mixins/EventManagerMixin.js';
import { UpdateManagerMixin } from '../base/mixins/UpdateManagerMixin.js';

// Option A: Use pre-composed base
const ButtonBase = InteractiveComponent;

// Option B: Custom composition
const ButtonBase = compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin,
  EventManagerMixin,
  UpdateManagerMixin
);
```

### Step 3: Create New Implementation

```typescript
// 3. Implement using mixin-based architecture
class ButtonComponentNew extends ButtonBase {
  static get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled'];
  }

  constructor() {
    super({
      tagName: 'ui-button',
      observedAttributes: ['variant', 'size', 'disabled'],
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

  protected getAttributeConfig() {
    return {
      staticAttributes: ['variant', 'size'],
      dynamicAttributes: ['disabled'],
    };
  }

  protected getTagName(): string {
    return 'ui-button';
  }

  protected render(): void {
    // Same render logic
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.click();
    }
  }
}
```

### Step 4: Create Migration Test Suite

```typescript
// 4. Create comprehensive migration tests
import { describe, it, expect, beforeEach } from 'vitest';
import { ButtonComponent } from './ButtonComponent.js'; // Old
import { ButtonComponentNew } from './ButtonComponentNew.js'; // New

describe('Button Migration Validation', () => {
  let oldButton: ButtonComponent;
  let newButton: ButtonComponentNew;

  beforeEach(() => {
    document.body.innerHTML = '';
    oldButton = document.createElement('ui-button') as ButtonComponent;
    newButton = document.createElement('ui-button-new') as ButtonComponentNew;
  });

  describe('Feature Parity', () => {
    it('should have identical public API', () => {
      const oldMethods = getPublicMethods(oldButton);
      const newMethods = getPublicMethods(newButton);

      expect(newMethods).toEqual(expect.arrayContaining(oldMethods));
    });

    it('should produce identical DOM output', () => {
      // Set same properties
      oldButton.setAttribute('variant', 'primary');
      newButton.setAttribute('variant', 'primary');

      document.body.appendChild(oldButton);
      document.body.appendChild(newButton);

      // Compare rendered output
      expect(oldButton.className).toBe(newButton.className);
      expect(oldButton.getAttribute('role')).toBe(newButton.getAttribute('role'));
      expect(oldButton.hasAttribute('tabindex')).toBe(newButton.hasAttribute('tabindex'));
    });

    it('should handle all attribute combinations identically', () => {
      const testCases = [
        { variant: 'primary', size: 'large' },
        { variant: 'secondary', disabled: '' },
        { size: 'small' },
        {},
      ];

      testCases.forEach((attrs) => {
        // Reset
        oldButton.removeAttribute('variant');
        oldButton.removeAttribute('size');
        oldButton.removeAttribute('disabled');
        newButton.removeAttribute('variant');
        newButton.removeAttribute('size');
        newButton.removeAttribute('disabled');

        // Apply attributes
        Object.entries(attrs).forEach(([key, value]) => {
          oldButton.setAttribute(key, value);
          newButton.setAttribute(key, value);
        });

        document.body.appendChild(oldButton);
        document.body.appendChild(newButton);

        expect(oldButton.className).toBe(newButton.className);

        oldButton.remove();
        newButton.remove();
      });
    });

    it('should dispatch identical events', () => {
      const oldEvents: CustomEvent[] = [];
      const newEvents: CustomEvent[] = [];

      oldButton.addEventListener('ui-button-click', (e) => oldEvents.push(e as CustomEvent));
      newButton.addEventListener('ui-button-click', (e) => newEvents.push(e as CustomEvent));

      document.body.appendChild(oldButton);
      document.body.appendChild(newButton);

      oldButton.click();
      newButton.click();

      expect(oldEvents).toHaveLength(1);
      expect(newEvents).toHaveLength(1);
      expect(oldEvents[0].type).toBe(newEvents[0].type);
      expect(oldEvents[0].bubbles).toBe(newEvents[0].bubbles);
    });

    it('should handle keyboard interactions identically', () => {
      document.body.appendChild(oldButton);
      document.body.appendChild(newButton);

      const oldClickSpy = vi.spyOn(oldButton, 'click');
      const newClickSpy = vi.spyOn(newButton, 'click');

      // Test Enter key
      oldButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      newButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(oldClickSpy).toHaveBeenCalled();
      expect(newClickSpy).toHaveBeenCalled();

      // Test Space key
      oldButton.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      newButton.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

      expect(oldClickSpy).toHaveBeenCalledTimes(2);
      expect(newClickSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Performance Comparison', () => {
    it('should have better or equal performance', async () => {
      const oldTime = measureCreationTime(() => new ButtonComponent());
      const newTime = measureCreationTime(() => new ButtonComponentNew());

      expect(newTime).toBeLessThanOrEqual(oldTime * 1.05); // Allow 5% regression
    });

    it('should have smaller or equal bundle size', async () => {
      const oldSize = await getBundleSize('ButtonComponent');
      const newSize = await getBundleSize('ButtonComponentNew');

      expect(newSize).toBeLessThanOrEqual(oldSize);
    });
  });
});

function getPublicMethods(obj: any): string[] {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(
    (name) => typeof obj[name] === 'function' && !name.startsWith('_')
  );
}

function measureCreationTime(createFn: () => any): number {
  const start = performance.now();
  const iterations = 1000;

  for (let i = 0; i < iterations; i++) {
    createFn();
  }

  return (performance.now() - start) / iterations;
}

async function getBundleSize(componentName: string): Promise<number> {
  // Mock implementation - integrate with actual bundle analyzer
  return 5000; // bytes
}
```

### Step 5: Validate Migration

```typescript
// 5. Run comprehensive validation
describe('Migration Validation Suite', () => {
  it('should pass all feature parity tests', () => {
    // All feature parity tests must pass
  });

  it('should meet performance requirements', () => {
    // Performance tests must pass
  });

  it('should have no accessibility regressions', () => {
    // Accessibility tests must pass
  });

  it('should be compatible with existing usage patterns', () => {
    // Integration tests with other components
  });
});
```

## Migration Patterns by Component Type

### Simple Display Components

```typescript
// Migration: DisplayComponent
// OLD: extends BaseComponent  →  NEW: extends SimpleComponent

class DisplayComponentOld extends BaseComponent {
  constructor() {
    super({ tagName: 'ui-display' });
  }

  protected getAccessibilityConfig() {
    return {};
  }
  protected getStateClasses() {
    return {};
  }
}

// NEW (much simpler)
class DisplayComponentNew extends SimpleComponent {
  constructor() {
    super({ tagName: 'ui-display' });
  }
}
```

### Interactive Components

```typescript
// Migration: Interactive components
// OLD: extends BaseComponent  →  NEW: extends InteractiveComponent

class InteractiveComponentOld extends BaseComponent {
  // Full BaseComponent with all mixins
}

class InteractiveComponentNew extends InteractiveComponent {
  // Only necessary mixins: Core + Accessibility + Events + Updates
}
```

### Shadow DOM Components

```typescript
// Migration: Shadow DOM components
// OLD: extends ShadowComponent  →  NEW: extends ShadowComponent (new)

class CardComponentOld extends ShadowComponent {
  // Old monolithic shadow implementation
}

class CardComponentNew extends compose(
  CoreCustomElement,
  ShadowDOMMixin,
  StyleManagerMixin,
  SlotManagerMixin,
  AttributeManagerMixin,
  UpdateManagerMixin
) {
  // Modular shadow implementation
}
```

## Common Migration Challenges

### 1. Abstract Method Implementation

```typescript
// CHALLENGE: New mixins require additional abstract methods
class ComponentNew extends InteractiveComponent {
  // REQUIRED: Implement mixin-specific abstract methods
  protected getAccessibilityConfig(): AccessibilityOptions {
    return { role: 'button', focusable: true };
  }

  protected getAttributeConfig() {
    return {
      staticAttributes: ['variant'],
      dynamicAttributes: ['disabled'],
    };
  }

  protected getTagName(): string {
    return 'ui-component';
  }
}
```

### 2. Method Override Patterns

```typescript
// CHALLENGE: Ensure super calls in lifecycle methods
class ComponentNew extends InteractiveComponent {
  connectedCallback(): void {
    // IMPORTANT: Always call super first
    super.connectedCallback();

    // Component-specific logic
    this.setupCustomBehavior();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    // IMPORTANT: Call super to trigger mixin handling
    super.attributeChangedCallback(name, oldValue, newValue);

    // Component-specific attribute handling
    if (name === 'custom-attr') {
      this.handleCustomAttribute(newValue);
    }
  }
}
```

### 3. Type Safety Issues

```typescript
// CHALLENGE: Ensure proper typing with mixins
import type {
  AccessibilityMixinInterface,
  AttributeManagerMixinInterface,
  EventManagerMixinInterface,
} from '../base/mixins/index.js';

class ComponentNew
  extends InteractiveComponent
  implements
    AccessibilityMixinInterface,
    AttributeManagerMixinInterface,
    EventManagerMixinInterface {
  // TypeScript will enforce interface implementation
}
```

## Post-Migration Checklist

### Validation Checklist

- [ ] **Feature Parity**: All functionality preserved
- [ ] **Performance**: Meets performance requirements
- [ ] **Bundle Size**: Bundle size reduced or maintained
- [ ] **Accessibility**: No accessibility regressions
- [ ] **Testing**: All tests passing
- [ ] **Documentation**: Updated documentation
- [ ] **Integration**: Compatible with other components
- [ ] **Browser Support**: Works across target browsers

### Cleanup Tasks

```typescript
// 1. Update component registry
// OLD
export { ButtonComponent } from './components/button/ButtonComponent.js';

// NEW
export { ButtonComponent as ButtonComponentOld } from './components/button/ButtonComponent.js';
export { ButtonComponentNew as ButtonComponent } from './components/button/ButtonComponentNew.js';

// 2. Update tests
// Move old tests to migration folder
// Update integration tests to use new component

// 3. Update documentation
// Update usage examples
// Update API documentation
// Add migration notes
```

## Rollback Strategy

### Emergency Rollback Plan

```typescript
// If issues are discovered post-migration:

// 1. Immediate rollback capability
export {
  ButtonComponentOld as ButtonComponent, // Quick switch back
} from './components/button/index.js';

// 2. Feature flags for gradual rollout
const USE_NEW_COMPONENTS = process.env.NODE_ENV === 'development';

export const ButtonComponent = USE_NEW_COMPONENTS ? ButtonComponentNew : ButtonComponentOld;

// 3. A/B testing support
export function getButtonComponent(variant: 'old' | 'new' = 'new') {
  return variant === 'new' ? ButtonComponentNew : ButtonComponentOld;
}
```

## Migration Tools

### Automated Migration Script

```bash
#!/bin/bash
# scripts/migrate-component.sh

COMPONENT_NAME=$1
COMPONENT_PATH=$2

echo "Migrating $COMPONENT_NAME..."

# 1. Analyze current component
node scripts/analyze-component.js "$COMPONENT_PATH"

# 2. Generate migration template
node scripts/generate-migration.js "$COMPONENT_NAME" "$COMPONENT_PATH"

# 3. Create test suite
node scripts/create-migration-tests.js "$COMPONENT_NAME"

# 4. Run initial validation
npm run test:migration -- "$COMPONENT_NAME"

echo "Migration template created for $COMPONENT_NAME"
echo "Review and customize the generated files before finalizing"
```

---

## What Actually Happened (August 2025 Update)

Instead of following this complex migration process, the development team ultimately took a different approach:

### **Actual Resolution: Complete Legacy Removal**

1. **Legacy Components Removed**: BaseComponent, ShadowComponent, and StyleManagerMixin were completely removed from the codebase
2. **Current Architecture**: Two primary patterns emerged:
   - **Build-from-Scratch**: Simple components (like UI Heading) extend HTMLElement directly
   - **Mixin Composition**: Complex components (like UI Button) use CoreCustomElement + individual mixins
3. **Mixin-Based Foundation**: Components use specific mixins as needed:
   - `AccessibilityMixin` for ARIA and keyboard handling
   - `AttributeManagerMixin` for typed attribute management
   - `StyleHandlerMixin` for automatic stylesheet management
   - `EventManagerMixin`, `SlotManagerMixin`, etc. as needed

### **Current Component Development Process**

Instead of migration, developers now:

1. **Choose the right pattern** based on component complexity
2. **Build-from-scratch** for simple components with minimal needs
3. **Compose mixins** for complex components requiring rich functionality
4. **Reference existing examples**: UI Button (mixin composition) and UI Heading (build-from-scratch)

This simplified approach eliminated the need for complex migration processes and provided cleaner, more maintainable component architectures.

---

## Historical Migration Guide (Pre-August 2025)

The following content represents the original migration guidance that was never fully implemented:

This comprehensive migration guide ensured a systematic, safe, and validated approach to transitioning from the monolithic BaseComponent architecture to the flexible mixin-based system.
