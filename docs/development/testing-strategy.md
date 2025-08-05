# Testing Strategy for Mixin Architecture

> **Document Status** (Updated August 5, 2025): This document describes the testing strategy for mixin-based components. Some references to legacy components (BaseComponent, ShadowComponent, StyleManagerMixin) have been updated to reflect their removal and replacement with current patterns.

This document outlines the comprehensive testing strategy for the mixin-based web component architecture.

## Testing Philosophy

### Test Pyramid for Mixins

```
                   ┌─────────────────┐
                   │  E2E/Browser    │  ← Future Playwright tests
                   │   Integration   │
                   └─────────────────┘
                 ┌───────────────────────┐
                 │    Component         │  ← Full component integration
                 │   Integration        │
                 └───────────────────────┘
               ┌─────────────────────────────┐
               │   Mixin Combination        │  ← Multiple mixins together
               └─────────────────────────────┘
             ┌───────────────────────────────────┐
             │      Individual Mixin            │  ← Single mixin testing
             └───────────────────────────────────┘
           ┌─────────────────────────────────────────┐
           │            Utility                     │  ← Helper functions, composers
           └─────────────────────────────────────────┘
```

### Testing Levels

1. **Utility Tests**: Test compose function, type utilities, helpers
2. **Individual Mixin Tests**: Test each mixin in isolation
3. **Mixin Combination Tests**: Test how mixins work together
4. **Component Integration Tests**: Test complete components using mixins
5. **E2E/Browser Tests**: Real user interactions (future Playwright)

## Test Structure Organization

```
src/test/
├── utilities/
│   ├── mixin-composer.test.ts     # compose() function tests
│   ├── accessibility.test.ts      # Utility function tests
│   └── style-helpers.test.ts      # CSS helper tests
├── mixins/
│   ├── AccessibilityMixin.test.ts
│   ├── AttributeManagerMixin.test.ts
│   ├── EventManagerMixin.test.ts
│   ├── ShadowDOMMixin.test.ts
│   ├── StyleManagerMixin.test.ts (removed August 2025)
│   ├── SlotManagerMixin.test.ts
│   └── UpdateManagerMixin.test.ts
├── combinations/
│   ├── interactive-mixins.test.ts   # Accessibility + Event + Update
│   ├── shadow-mixins.test.ts        # ShadowDOM + Style + Slot
│   └── attribute-mixins.test.ts     # AttributeManager + Update
├── composites/
│   ├── SimpleComponent.test.ts
│   ├── InteractiveComponent.test.ts
│   ├── AttributeComponent.test.ts
│   ├── ShadowComponent.test.ts (removed August 2025)
│   └── FullComponent.test.ts
├── integration/
│   ├── complete-components.test.ts  # Real component implementations
│   └── lifecycle-integration.test.ts
├── migration/
│   ├── compatibility.test.ts        # Old vs new behavior comparison
│   └── feature-parity.test.ts       # Ensure no functionality lost
└── performance/
    ├── bundle-size.test.ts
    ├── runtime-performance.test.ts
    └── memory-usage.test.ts
```

## Individual Mixin Testing Patterns

### Basic Mixin Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CoreCustomElement } from '../../base/CoreCustomElement.js';
import { ExampleMixin } from '../../base/mixins/ExampleMixin.js';

// Create minimal test component
class TestExampleComponent extends ExampleMixin(CoreCustomElement) {
  constructor() {
    super({ tagName: 'test-example' });
  }

  // Implement required abstract methods
  protected getRequiredConfig() {
    return {
      /* test config */
    };
  }
}

// Register for DOM testing
customElements.define('test-example-mixin', TestExampleComponent);

describe('ExampleMixin', () => {
  let component: TestExampleComponent;

  beforeEach(() => {
    document.body.innerHTML = '';
    component = document.createElement('test-example-mixin') as TestExampleComponent;
  });

  describe('Interface Contract', () => {
    it('should implement mixin interface', () => {
      expect(typeof component.mixinMethod).toBe('function');
      expect(component.mixinProperty).toBeDefined();
    });
  });

  describe('Lifecycle Integration', () => {
    it('should call mixin lifecycle methods', () => {
      const spy = vi.spyOn(component, 'mixinLifecycleMethod');
      document.body.appendChild(component);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Functionality', () => {
    it('should perform mixin-specific behavior', () => {
      // Test specific mixin functionality
    });
  });
});
```

### AccessibilityMixin Test Example

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CoreCustomElement } from '../../base/CoreCustomElement.js';
import { AccessibilityMixin } from '../../base/mixins/AccessibilityMixin.js';
import type { AccessibilityOptions } from '../../types/component.js';

class TestAccessibilityComponent extends AccessibilityMixin(CoreCustomElement) {
  private accessibilityConfig: AccessibilityOptions;

  constructor(config: AccessibilityOptions = {}) {
    super({ tagName: 'test-accessibility' });
    this.accessibilityConfig = config;
  }

  protected getAccessibilityConfig(): AccessibilityOptions {
    return this.accessibilityConfig;
  }
}

customElements.define('test-accessibility-mixin', TestAccessibilityComponent);

describe('AccessibilityMixin', () => {
  let component: TestAccessibilityComponent;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ARIA State Management', () => {
    it('should set ARIA states correctly', () => {
      component = new TestAccessibilityComponent({ role: 'button' });
      document.body.appendChild(component);

      component.setAriaStates({
        expanded: true,
        'aria-label': 'Test Button',
        describedby: 'desc-1',
      });

      expect(component.getAttribute('aria-expanded')).toBe('true');
      expect(component.getAttribute('aria-label')).toBe('Test Button');
      expect(component.getAttribute('aria-describedby')).toBe('desc-1');
    });

    it('should remove ARIA states when set to null', () => {
      component = new TestAccessibilityComponent();
      component.setAttribute('aria-expanded', 'true');

      component.setAriaStates({ expanded: null });
      expect(component.hasAttribute('aria-expanded')).toBe(false);
    });
  });

  describe('Focus Management', () => {
    it('should setup focus management for focusable components', () => {
      component = new TestAccessibilityComponent({
        role: 'button',
        focusable: true,
      });
      document.body.appendChild(component);

      const focusSpy = vi.spyOn(component, 'handleFocus');
      component.dispatchEvent(new FocusEvent('focus'));

      expect(focusSpy).toHaveBeenCalled();
      expect(component.classList.contains('ui-focus-visible')).toBe(true);
    });

    it('should not setup focus management for non-focusable components', () => {
      component = new TestAccessibilityComponent({
        role: 'text',
        focusable: false,
      });
      document.body.appendChild(component);

      // Should not have focus event listeners
      const listeners = component.getEventListeners?.('focus') || [];
      expect(listeners.length).toBe(0);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce messages to screen readers', () => {
      component = new TestAccessibilityComponent();

      component.announceToScreenReader('Test announcement');

      const announcement = document.querySelector('[aria-live]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test announcement');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
    });

    it('should support assertive announcements', () => {
      component = new TestAccessibilityComponent();

      component.announceToScreenReader('Urgent message', 'assertive');

      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard events when configured', () => {
      component = new TestAccessibilityComponent({
        focusable: true,
        keyboardNavigation: true,
      });
      document.body.appendChild(component);

      const keydownSpy = vi.spyOn(component, 'handleKeydown');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      component.dispatchEvent(event);

      expect(keydownSpy).toHaveBeenCalledWith(event);
    });
  });
});
```

## Mixin Combination Testing

### Testing Multiple Mixins Together

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CoreCustomElement } from '../../base/CoreCustomElement.js';
import { AccessibilityMixin } from '../../base/mixins/AccessibilityMixin.js';
import { AttributeManagerMixin } from '../../base/mixins/AttributeManagerMixin.js';
import { EventManagerMixin } from '../../base/mixins/EventManagerMixin.js';
import { compose } from '../../base/utilities/mixin-composer.js';

class TestInteractiveComponent extends compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin,
  EventManagerMixin
) {
  static get observedAttributes(): string[] {
    return ['disabled', 'variant'];
  }

  constructor() {
    super({
      tagName: 'test-interactive',
      observedAttributes: ['disabled', 'variant'],
      staticAttributes: ['variant'],
      dynamicAttributes: ['disabled'],
    });
  }

  protected getAccessibilityConfig() {
    return { role: 'button', focusable: true };
  }

  protected getAttributeConfig() {
    return {
      staticAttributes: ['variant'],
      dynamicAttributes: ['disabled'],
    };
  }

  protected getTagName(): string {
    return 'test-interactive';
  }
}

customElements.define('test-interactive-combo', TestInteractiveComponent);

describe('Interactive Mixin Combination', () => {
  let component: TestInteractiveComponent;

  beforeEach(() => {
    document.body.innerHTML = '';
    component = document.createElement('test-interactive-combo') as TestInteractiveComponent;
  });

  describe('Cross-Mixin Integration', () => {
    it('should integrate accessibility with attribute changes', () => {
      document.body.appendChild(component);

      // Change attribute through AttributeManagerMixin
      component.setTypedAttribute('disabled', true);

      // Should affect accessibility through integration
      expect(component.getAttribute('aria-disabled')).toBe('true');
      expect(component.hasAttribute('tabindex')).toBe(false);
    });

    it('should dispatch events with proper accessibility context', () => {
      document.body.appendChild(component);
      const eventSpy = vi.fn();

      component.addEventListener('ui-test-interactive-action', eventSpy);
      component.dispatchCustomEvent('action', {
        accessible: true,
        role: component.getAttribute('role'),
      });

      expect(eventSpy).toHaveBeenCalled();
      const event = eventSpy.mock.calls[0][0];
      expect(event.detail.role).toBe('button');
    });

    it('should coordinate lifecycle across all mixins', () => {
      const accessibilitySpy = vi.spyOn(component, 'setupAccessibility');
      const attributeSpy = vi.spyOn(component, 'handleStaticAttributeChange');

      document.body.appendChild(component);
      component.setAttribute('variant', 'primary');

      expect(accessibilitySpy).toHaveBeenCalled();
      expect(attributeSpy).toHaveBeenCalledWith('variant', 'primary');
    });
  });

  describe('Method Resolution Order', () => {
    it('should call super methods in correct order', () => {
      const calls: string[] = [];

      // Spy on each mixin's connectedCallback
      vi.spyOn(component, 'connectedCallback').mockImplementation(() => {
        calls.push('component');
      });

      // Add to DOM to trigger callbacks
      document.body.appendChild(component);

      // Verify proper method resolution
      expect(calls).toContain('component');
    });
  });
});
```

## Component Integration Testing

### Full Component Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ButtonComponent } from '../../components/button/ButtonComponent.js';

describe('ButtonComponent Integration', () => {
  let button: ButtonComponent;

  beforeEach(() => {
    document.body.innerHTML = '';
    button = document.createElement('ui-button') as ButtonComponent;
  });

  describe('Complete Functionality', () => {
    it('should integrate all mixin functionality', () => {
      button.textContent = 'Click me';
      document.body.appendChild(button);

      // Test accessibility integration
      expect(button.getAttribute('role')).toBe('button');
      expect(button.hasAttribute('tabindex')).toBe(false); // Native focusable

      // Test attribute management
      button.setAttribute('variant', 'primary');
      expect(button.classList.contains('ui-button--variant-primary')).toBe(true);

      // Test event management
      const clickSpy = vi.fn();
      button.addEventListener('ui-button-click', clickSpy);
      button.click();
      expect(clickSpy).toHaveBeenCalled();

      // Test update management
      button.setAttribute('disabled', '');
      expect(button.classList.contains('ui-button--disabled')).toBe(true);
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('should handle complex user interactions', () => {
      document.body.appendChild(button);

      // Keyboard interaction
      button.focus();
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const clickSpy = vi.fn();
      button.addEventListener('click', clickSpy);

      button.dispatchEvent(enterEvent);
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
```

## Migration and Compatibility Testing

### Feature Parity Testing

```typescript
import { describe, it, expect } from 'vitest';
// Historical example - BaseComponent was removed August 2025
// import { BaseComponent } from '../../base/BaseComponent.js'; // Removed
import { StyleHandlerMixin } from '../../base/mixins/StyleHandlerMixin.js'; // Current

describe('Migration Compatibility', () => {
  describe('Feature Parity', () => {
    it('should provide same public API', () => {
      // Create both old and new implementations
      // Historical example - would have been BaseComponent vs new pattern
      // class OldTestComponent extends BaseComponent { ... }
      
      class CurrentTestComponent extends compose(
        CoreCustomElement,
        AccessibilityMixin,
        StyleHandlerMixin
      ) {
        constructor() {
          super({ tagName: 'new-test' });
        }
        protected getAccessibilityConfig() {
          return {};
        }
        protected getStateClasses() {
          return {};
        }
      }

      const oldComponent = new OldTestComponent();
      const newComponent = new NewTestComponent();

      // Compare public interfaces
      const oldMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(oldComponent)).filter(
        (name) => typeof oldComponent[name] === 'function' && !name.startsWith('_')
      );

      const newMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(newComponent)).filter(
        (name) => typeof newComponent[name] === 'function' && !name.startsWith('_')
      );

      // New implementation should have all old methods
      oldMethods.forEach((method) => {
        expect(newMethods).toContain(method);
      });
    });

    it('should produce same DOM output', () => {
      // Test that old and new implementations produce identical DOM
      // This is crucial for migration safety
    });

    it('should have same performance characteristics', () => {
      // Performance regression testing
      // Measure both implementations and compare
    });
  });
});
```

## Performance Testing Patterns

### Bundle Size Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Bundle Size Optimization', () => {
  it('should have smaller bundle for simple components', async () => {
    // Mock bundle analysis
    const simpleComponentSize = await getBundleSize('SimpleComponent');
    const legacyComponentSize = await getBundleSize('LegacyComponent'); // Historical reference

    expect(simpleComponentSize).toBeLessThan(baseComponentSize * 0.6);
  });

  it('should tree-shake unused mixin functionality', async () => {
    const partialMixinSize = await getBundleSize('InteractiveComponent');
    const fullMixinSize = await getBundleSize('FullComponent');

    expect(partialMixinSize).toBeLessThan(fullMixinSize);
  });
});
```

## Test Utilities

### Mixin Test Helpers

```typescript
// src/test/utilities/mixin-test-helpers.ts

export function createMixinTestComponent<T extends Constructor>(
  mixins: Mixin<any>[],
  config: Partial<ComponentConfig> = {}
): T {
  const TestClass = compose(CoreCustomElement, ...mixins);

  class TestComponent extends TestClass {
    constructor() {
      super({
        tagName: 'test-component',
        ...config,
      });
    }

    // Provide default implementations for abstract methods
    protected getAccessibilityConfig() {
      return {};
    }
    protected getStateClasses() {
      return {};
    }
    protected getAttributeConfig() {
      return {};
    }
    protected getTagName() {
      return 'test-component';
    }
  }

  return TestComponent as any;
}

export function expectMixinInterface<T>(
  component: any,
  interfaceShape: Record<keyof T, 'function' | 'property'>
): void {
  Object.entries(interfaceShape).forEach(([key, type]) => {
    if (type === 'function') {
      expect(typeof component[key]).toBe('function');
    } else {
      expect(component[key]).toBeDefined();
    }
  });
}

export async function waitForMixinLifecycle(component: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    if (component.isConnected) {
      resolve();
    } else {
      const observer = new MutationObserver(() => {
        if (component.isConnected) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
}
```

## Continuous Integration Testing

### Test Running Strategy

```bash
# Run all tests in parallel
pnpm test:all

# Run specific test categories
pnpm test:mixins
pnpm test:combinations
pnpm test:integration
pnpm test:migration
pnpm test:performance

# Watch mode for development
pnpm test:watch

# Coverage reporting
pnpm test:coverage
```

### Quality Gates

- **Unit Test Coverage**: 90%+ for individual mixins
- **Integration Test Coverage**: 80%+ for mixin combinations
- **Performance Tests**: No regression > 5%
- **Migration Tests**: 100% feature parity
- **Bundle Size Tests**: Meet optimization targets

This comprehensive testing strategy ensures that the mixin architecture maintains quality, performance, and compatibility throughout development and migration.
