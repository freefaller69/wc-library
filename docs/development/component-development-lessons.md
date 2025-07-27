# Component Development Lessons: UI-Heading Implementation

This document captures key learnings, best practices, and patterns discovered during the development of our first component (ui-heading) in the web component library.

## Table of Contents

- [Architecture Decisions](#architecture-decisions)
- [TypeScript & Build System](#typescript--build-system)
- [Component Design Philosophy](#component-design-philosophy)
- [CSS & Styling Approach](#css--styling-approach)
- [Testing Strategy](#testing-strategy)
- [Performance & CI/CD](#performance--cicd)
- [Development Workflow](#development-workflow)
- [Dos and Don'ts](#dos-and-donts)

---

## Architecture Decisions

### ✅ **What Worked Well**

#### **Composite Selection Strategy**

- **Evaluate existing composites first** before building from individual mixins
- **Decision hierarchy**:
  1. Does an existing composite fit? → Use it
  2. Need minor modifications? → Extend the composite
  3. Completely unique needs? → Build from CoreCustomElement + individual mixins
- **Separation of concerns**: AttributeManagerMixin vs ClassManagerMixin when building custom

#### **Available Composites**

- **AttributeComponent**: For components with attribute handling (CSS custom properties approach)
- **ShadowComponent**: For components needing Shadow DOM encapsulation
- **InteractiveComponent**: For interactive elements with accessibility and events
- **FullComponent**: Complete component with all mixins (use sparingly)

```typescript
// ✅ Best: Use existing composite when it fits
export class UIText extends AttributeComponent {
  // Inherits attribute handling, clean implementation
}

// ✅ Good: Build from CoreCustomElement when composites don't fit
export class UIHeading extends CoreCustomElement {
  // Clean, focused implementation for unique needs
}

// ❌ Avoid: Deprecated inheritance
export class UIHeading extends BaseComponent {
  // Legacy approach
}
```

#### **Abstract Keyword for Mixins**

- **Always use `abstract class`** in mixin functions for TypeScript compliance
- **Proper return statements** from mixin factory functions

```typescript
// ✅ Correct mixin structure
export function SomeMixin<TBase extends Constructor<HTMLElement>>(Base: TBase) {
  abstract class SomeMixin extends Base implements SomeMixinInterface {
    // implementation
  }

  return SomeMixin; // ✅ Explicit return
}
```

### ⚠️ **Challenges Overcome**

#### **TypeScript Composite Component Issues**

- **Problem**: Composite components couldn't see mixin methods
- **Solution**: Add explicit interface declarations with `declare` statements

```typescript
// ✅ Required for TypeScript in composite components
export abstract class ShadowComponent
  extends ShadowBase
  implements ShadowDOMMixinInterface, UpdateManagerMixinInterface
{
  // Declare methods from ShadowDOMMixin
  declare shadowRoot: ShadowRoot;
  declare setupShadowDOM: (options?: ShadowRootInit) => void;

  // Declare methods from UpdateManagerMixin
  declare requestUpdate: () => void;
}
```

---

## TypeScript & Build System

### ✅ **Build Pipeline Improvements**

#### **Separate Build Commands**

- **`pnpm build`**: Full TypeScript + Vite build for development
- **`pnpm build:no-typecheck`**: Vite-only build for CI performance testing
- **Reason**: Performance CI needs to test actual components, not just type-check

#### **ESLint Configuration**

- **Use `@ts-expect-error`** instead of `@ts-ignore` per ESLint rules
- **Remove unused disable directives** during refactoring
- **Prettier formatting**: Long class declarations need proper line breaks

```typescript
// ✅ Correct TypeScript suppression
connectedCallback() {
  // @ts-expect-error - super might have connectedCallback
  super.connectedCallback?.();
}

// ✅ Proper Prettier formatting for long declarations
export abstract class ShadowComponent
  extends ShadowBase
  implements ShadowDOMMixinInterface, UpdateManagerMixinInterface
{
```

### ⚠️ **TypeScript Gotchas**

#### **Mixin Callback Handling**

- **Problem**: `super.connectedCallback?.()` caused type errors
- **Solution**: Use optional chaining with proper type suppression

```typescript
// ✅ Handles optional parent lifecycle methods
connectedCallback() {
  // @ts-expect-error - super might have connectedCallback
  super.connectedCallback?.();
  this.setupAccessibility();
}
```

---

## Component Design Philosophy

### ✅ **"Smart Pass-Through" Approach**

#### **Minimal Value Proposition**

- **Principle**: Provide just enough benefit to justify existence
- **Question**: "What value does this provide over raw HTML?"
- **Answer**: Design system consistency + developer experience + type safety

#### **Static vs Dynamic Attributes**

- **Headings use static attributes** - set once, don't observe changes
- **Level validation happens once** on connect, not on every change
- **Reasoning**: Headings rarely change level dynamically

```typescript
// ✅ Static attribute handling for headings
connectedCallback(): void {
  this.validateLevel(); // ✅ Validate once on connect
  super.connectedCallback();
  this.render();
}

// ❌ Unnecessary dynamic observation for headings
static get observedAttributes(): string[] {
  return ['level']; // Not needed for static components
}
```

#### **Strict Accessibility Validation**

- **Fail fast with clear errors** for accessibility violations
- **Throw meaningful error messages** that guide developers

```typescript
// ✅ Clear, actionable error messages
if (!isValid) {
  throw new Error(
    `UIHeading: Invalid level "${level}". ` +
      `Level must be a number between 1 and 6 for proper accessibility. ` +
      `Current level would break screen reader navigation.`
  );
}
```

### ⚠️ **Complexity Traps Avoided**

#### **No Manual ARIA Management**

- **Principle**: If you need `role="heading"`, something's wrong
- **Solution**: Render proper semantic HTML elements (h1-h6)
- **Result**: Browser handles accessibility automatically

```typescript
// ✅ Native semantic HTML - browser handles accessibility
const heading = document.createElement(`h${level}`);
heading.innerHTML = content;
this.appendChild(heading);

// ❌ Manual ARIA indicates architectural problem
this.setAttribute('role', 'heading');
this.setAttribute('aria-level', level);
```

---

## CSS & Styling Approach

### ✅ **CSS Custom Properties Strategy**

#### **Attribute-Driven Styling**

- **Use attribute selectors** instead of utility classes
- **CSS custom properties** for easy theming
- **Fallback values** for graceful degradation

```css
/* ✅ Clean attribute-driven styling */
ui-heading {
  font-size: var(--ui-heading-font-size, var(--ui-heading-h2-size, 2rem));
}

ui-heading[level='1'] {
  font-size: var(--ui-heading-h1-size, 2.5rem);
}

/* ❌ Avoided utility class approach */
.ui-heading--level-1 {
  font-size: 2.5rem;
}
```

#### **Theme Integration**

- **Design tokens in separate file** (`styles/tokens.css`)
- **Automatic dark mode** with `prefers-color-scheme`
- **Consistent naming** convention: `--ui-component-property-variant`

### ⚠️ **Dark Mode Issues Discovered**

#### **Background Color Missing**

- **Problem**: Dark mode text appeared on white background
- **Root cause**: `.ui-reset` only set text color, not background
- **Solution**: Add `background-color: var(--ui-color-background-primary)`

```css
/* ✅ Complete color scheme support */
.ui-reset {
  color: var(--ui-color-text-primary);
  background-color: var(--ui-color-background-primary); /* ✅ Added this */
}
```

---

## Testing Strategy

### ✅ **Comprehensive Test Coverage**

#### **Test Categories Implemented**

1. **Validation Tests**: Invalid level handling, error messages
2. **Rendering Tests**: Correct HTML element creation
3. **Accessibility Tests**: Semantic markup verification
4. **Performance Tests**: Component lifecycle timing
5. **Integration Tests**: CSS class application, attribute handling

#### **Test Structure Pattern**

```typescript
// ✅ Clear test organization
describe('UIHeading Component', () => {
  describe('Level Validation', () => {
    // Validation-specific tests
  });

  describe('Rendering Behavior', () => {
    // DOM rendering tests
  });

  describe('Accessibility', () => {
    // A11y verification tests
  });
});
```

#### **JSDOM Limitations Handled**

- **Custom element registration** issues in test environment
- **Simplified mocks** for DOM APIs that don't work in JSDOM
- **Focus on logic testing** rather than full browser behavior

### ⚠️ **Testing Gotchas**

#### **Error Testing Patterns**

```typescript
// ✅ Proper error testing approach
it('should throw error for invalid levels', () => {
  const element = document.createElement('ui-heading');
  element.setAttribute('level', '7');

  expect(() => {
    document.body.appendChild(element); // Triggers connectedCallback
  }).toThrow(/Invalid level "7"/);
});
```

---

## Performance & CI/CD

### ✅ **Performance Monitoring Setup**

#### **Warning-Only During Development**

- **Problem**: 10% regression threshold too strict for early development
- **Solution**: Convert failures to warnings during component buildout phase
- **Benefits**: Data collection continues, builds don't block, team awareness maintained

```yaml
# ✅ Warning annotations instead of failures
- name: Performance regression warning
  run: |
    echo "::warning title=Performance Regression Detected::Bundle size increased by ${{ steps.performance-check.outputs.change_percent }}%"
    echo "This is currently warning-only during early development phase"
```

#### **Bundle Analysis Issues**

- **Problem**: Benchmark script only checked `/dist` root, missed `/dist/assets`
- **Impact**: Underreported actual bundle sizes
- **Note**: Framework for future improvement identified

### ⚠️ **CI/CD Lessons**

#### **Performance Baseline Strategy**

- **Early development**: Use warnings, collect data
- **Stable phase**: Switch to strict thresholds (5-10%)
- **Alternative**: Absolute size limits (e.g., +5KB max per PR)

---

## Development Workflow

### ✅ **Branch Strategy That Worked**

#### **Separation of Concerns**

1. **`fix/mixin-abstract-keywords`**: Architectural TypeScript fixes
2. **`fix/composite-methods-and-cleanup`**: Composite components + legacy cleanup
3. **`feature/minimal-heading-component`**: Actual component implementation

#### **PR Sequencing Benefits**

- **Incremental review**: Easier to review focused changes
- **Risk isolation**: Architectural fixes separate from feature work
- **Clean history**: Clear progression of improvements

### ✅ **Merge Strategy**

- **Merge architectural fixes first** before component work
- **Update feature branches** with latest main after merges
- **Test integration** after merging architectural changes

### ⚠️ **Merge Conflicts Handling**

- **Mixin structure changes** caused conflicts between branches
- **Solution**: Merge main into feature branch, resolve conflicts systematically
- **Git auto-merge** handled most conflicts well due to good separation

---

## Dos and Don'ts

### ✅ **Architecture Dos**

1. **Evaluate existing composites first** - Check if AttributeComponent, ShadowComponent, InteractiveComponent, or FullComponent meets your needs before building with individual mixins. All composites are built on CoreCustomElement + mixins and provide common patterns
2. **Add `abstract` keyword** to all mixin classes for TypeScript
3. **Use explicit interface declarations** in composite components with `declare` statements
4. **Separate attribute management** from CSS class generation (AttributeManagerMixin vs ClassManagerMixin)
5. **Validate accessibility strictly** with clear error messages
6. **Render semantic HTML** instead of managing ARIA manually
7. **Use CSS custom properties** for themeable components
8. **Test comprehensively** including error cases and accessibility

### ❌ **Architecture Don'ts**

1. **Don't extend BaseComponent or ShadowComponent** (deprecated)
2. **Don't use `@ts-ignore`** when `@ts-expect-error` is available
3. **Don't skip `return` statements** in mixin factory functions
4. **Don't add manual ARIA** to components that render semantic HTML
5. **Don't use utility classes** for primitive components (prefer CSS custom properties)
6. **Don't observe attributes** that don't need dynamic updates
7. **Don't fail CI on performance regressions** during early development

### ✅ **Styling Dos**

1. **Use design tokens** from `styles/tokens.css`
2. **Support dark mode** with `prefers-color-scheme`
3. **Include background colors** in reset classes for proper contrast
4. **Use attribute selectors** (`ui-heading[level="1"]`) over utility classes
5. **Provide fallback values** in CSS custom properties
6. **Test both light and dark modes** during development

### ❌ **Styling Don'ts**

1. **Don't hardcode colors** - use design tokens
2. **Don't forget background colors** when setting text colors
3. **Don't use utility classes** for primitive component styling
4. **Don't skip CSS custom property fallbacks**
5. **Don't test only one color scheme**

### ✅ **Testing Dos**

1. **Test error conditions** and validation logic
2. **Verify semantic HTML output** for accessibility
3. **Test component lifecycle** (connect, disconnect, attribute changes)
4. **Mock JSDOM limitations** appropriately
5. **Organize tests by category** (validation, rendering, accessibility, etc.)
6. **Test both positive and negative cases**

### ❌ **Testing Don'ts**

1. **Don't rely on browser-specific APIs** in unit tests
2. **Don't skip error case testing**
3. **Don't test implementation details** - focus on behavior
4. **Don't assume JSDOM has full custom element support**

### ✅ **Performance Dos**

1. **Monitor bundle size** changes in CI
2. **Use warnings during development** phase for data collection
3. **Set appropriate thresholds** for different development phases
4. **Collect baseline data** before enforcing strict limits
5. **Document performance decisions** and thresholds

### ❌ **Performance Don'ts**

1. **Don't use strict thresholds** during early component development
2. **Don't ignore performance data** - monitor trends
3. **Don't forget to update thresholds** as the library matures
4. **Don't block development** with overly strict performance checks

---

## Future Considerations

### **Architecture Evolution**

- **Existing composites** (AttributeComponent, ShadowComponent, etc.) should cover most use cases; evaluate gaps before creating new patterns
- **Mixin composition patterns** will evolve with real-world usage, but prefer extending existing composites
- **TypeScript configuration** may need updates for new component patterns

### **Performance Strategy**

- **Switch to strict thresholds** once 5-10 components are implemented
- **Consider absolute size limits** instead of percentage-based
- **Implement more sophisticated bundle analysis** (tree-shaking effectiveness, etc.)

### **Testing Framework**

- **Consider browser testing** for complex components
- **Automated accessibility testing** with tools like axe-core
- **Visual regression testing** for CSS component appearance

### **Documentation Patterns**

- **Component documentation** standards based on ui-heading example
- **Migration guides** when architectural patterns change
- **Performance benchmarking** documentation for different component types

---

## Conclusion

The ui-heading component implementation provided valuable insights into building a scalable, maintainable web component library. The key success factors were:

1. **Incremental architectural improvements** before feature work
2. **Clear separation of concerns** in mixin architecture
3. **CSS-first approach** with design tokens and custom properties
4. **Comprehensive testing** including error conditions
5. **Flexible performance monitoring** that adapts to development phase
6. **Documentation of decisions** and patterns for future reference

These patterns will serve as the foundation for implementing additional components in the library.
