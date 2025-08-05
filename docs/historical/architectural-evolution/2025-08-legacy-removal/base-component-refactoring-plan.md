# Base Component Refactoring Plan

## Overview

This document outlines the refactoring of our current `BaseComponent` and `ShadowComponent` classes into a modular, composable architecture. The goal is to create smaller, focused components that can be mixed and matched to build exactly what each component needs.

## Current Architecture Issues

### BaseComponent (253 lines)

- **Monolithic design**: Handles lifecycle, accessibility, attributes, events, and updates all in one class
- **Heavy for simple components**: Display-only components get focus management, ARIA handling, etc.
- **Rigid inheritance**: All components must inherit all functionality

### ShadowComponent (198 lines)

- **Extends monolithic base**: Inherits all BaseComponent functionality regardless of need
- **Shadow DOM coupled with everything**: Can't use shadow DOM without full base functionality

## Proposed Modular Architecture

### 1. CoreCustomElement (Minimal Base)

**Purpose**: Absolute minimum for custom elements
**Size**: ~50 lines

```typescript
// Features:
- Basic lifecycle callbacks (connected/disconnected/adopted)
- Component ID generation
- Connection state tracking
- Essential setup (ui-reset class, data-ui-component attribute)
- Abstract observedAttributes getter
```

### 2. AccessibilityMixin

**Purpose**: ARIA states, focus management, keyboard handling  
**Size**: ~60 lines

```typescript
// Features:
- ARIA state management (setAriaStates)
- Focus management (focus/blur handlers)
- Keyboard event handling (handleKeydown)
- Accessibility configuration system
- Focus visual indicators (ui-focus-visible)
```

### 3. AttributeManagerMixin

**Purpose**: Attribute handling and CSS class generation
**Size**: ~80 lines

```typescript
// Features:
- Static vs dynamic attribute differentiation
- Typed attribute utilities (getTypedAttribute, setTypedAttribute)
- Automatic CSS class generation from attributes
- Attribute change handling and caching
- Component class updating system
```

### 4. EventManagerMixin

**Purpose**: Custom event dispatching and management
**Size**: ~30 lines

```typescript
// Features:
- Namespaced custom event dispatching
- Event composition for shadow DOM
- Standard event configuration
```

### 5. ShadowDOMMixin

**Purpose**: Shadow DOM creation and management
**Size**: ~40 lines

```typescript
// Features:
- Shadow root creation with configuration
- Shadow DOM querying utilities (shadowQuery, shadowQueryAll)
- Template management and setup
- Shadow boundary event handling
```

### 6. StyleManagerMixin

**Purpose**: CSS and stylesheet management
**Size**: ~35 lines

```typescript
// Features:
- CSS text and stylesheet addition
- Style application to shadow DOM
- StyleManager integration
```

### 7. SlotManagerMixin

**Purpose**: Slot handling and management
**Size**: ~25 lines

```typescript
// Features:
- Slot change event handling
- Slot utilities and lifecycle management
```

### 8. UpdateManagerMixin

**Purpose**: Component update lifecycle
**Size**: ~25 lines

```typescript
// Features:
- Update request system
- Render method coordination
- Update batching and optimization
```

## Implementation Strategy

### Phase 1: Create Mixin Infrastructure

1. **Create mixin base system** - Common mixin patterns and utilities
2. **Implement CoreCustomElement** - Minimal base class
3. **Create individual mixins** - Each focused on single responsibility
4. **Add mixin composition utilities** - Helper functions for combining mixins

### Phase 2: Create Composite Base Classes

1. **SimpleComponent** - CoreCustomElement only (for display components)
2. **InteractiveComponent** - Core + Accessibility + Events + Updates
3. **AttributeComponent** - Core + AttributeManager + Updates
4. **ShadowComponent** - Core + ShadowDOM + Styles + Updates
5. **FullComponent** - All mixins (equivalent to current BaseComponent)

### Phase 3: Migration Strategy

1. **Create parallel implementation** - New classes alongside existing ones
2. **Migrate tests** - Ensure all existing functionality works
3. **Update component examples** - Show usage patterns
4. **Deprecate old classes** - Gradual migration path

### Phase 4: Optimize Existing Components

1. **Audit component needs** - Determine which mixins each component actually needs
2. **Migrate to optimal base** - Use smallest appropriate base class
3. **Performance validation** - Measure bundle size improvements

## Component Usage Examples

### Simple Display Component

```typescript
// Only needs core functionality
class DisplayComponent extends CoreCustomElement {
  // Minimal implementation
}
```

### Interactive Button

```typescript
// Needs accessibility and events
class ButtonComponent extends compose(
  CoreCustomElement,
  AccessibilityMixin,
  EventManagerMixin,
  UpdateManagerMixin
) {
  // Button-specific implementation
}
```

### Complex Form Input

```typescript
// Needs everything except shadow DOM
class InputComponent extends compose(
  CoreCustomElement,
  AccessibilityMixin,
  AttributeManagerMixin,
  EventManagerMixin,
  UpdateManagerMixin
) {
  // Input-specific implementation
}
```

### Shadow DOM Component

```typescript
// Full shadow component with all features
class CardComponent extends compose(
  CoreCustomElement,
  ShadowDOMMixin,
  StyleManagerMixin,
  SlotManagerMixin,
  AttributeManagerMixin,
  UpdateManagerMixin
) {
  // Card-specific implementation
}
```

## Benefits

### Bundle Size Optimization

- **Simple components**: ~2KB instead of ~8KB (BaseComponent overhead)
- **Complex components**: Same size, but only include what's needed
- **Tree shaking**: Unused mixin functionality automatically removed

### Development Experience

- **Clear separation of concerns**: Each mixin has single responsibility
- **Composable architecture**: Mix and match exactly what you need
- **Easier testing**: Test mixins in isolation
- **Better code reuse**: Mixins can be used across different base classes

### Maintenance

- **Smaller files**: Each mixin is focused and manageable
- **Easier debugging**: Issues isolated to specific functionality
- **Flexible evolution**: Add new mixins without affecting existing components

## Migration Timeline

### Week 1-2: Infrastructure

- Create mixin system and CoreCustomElement
- Implement first 3 mixins (Accessibility, AttributeManager, EventManager)
- Set up composition utilities

### Week 3: Complete Mixin Set

- Implement remaining mixins (ShadowDOM, StyleManager, SlotManager, UpdateManager)
- Create composite base classes
- Write comprehensive tests

### Week 4: Migration & Validation

- Migrate existing components to new system
- Performance testing and validation
- Update documentation and examples

## File Structure Changes

```
src/
├── base/
│   ├── CoreCustomElement.ts      # NEW: Minimal base
│   ├── mixins/                   # NEW: Individual mixins
│   │   ├── AccessibilityMixin.ts
│   │   ├── AttributeManagerMixin.ts
│   │   ├── EventManagerMixin.ts
│   │   ├── ShadowDOMMixin.ts
│   │   ├── StyleManagerMixin.ts
│   │   ├── SlotManagerMixin.ts
│   │   └── UpdateManagerMixin.ts
│   ├── composites/               # NEW: Pre-composed base classes
│   │   ├── SimpleComponent.ts
│   │   ├── InteractiveComponent.ts
│   │   ├── AttributeComponent.ts
│   │   ├── ShadowComponent.ts
│   │   └── FullComponent.ts
│   ├── utilities/
│   │   └── mixin-composer.ts     # NEW: Mixin composition utilities
│   ├── BaseComponent.ts          # DEPRECATED: Keep for migration
│   └── ShadowComponent.ts        # DEPRECATED: Keep for migration
```

## Success Metrics

- **Bundle Size**: 40-60% reduction for simple components
- **Development Speed**: Faster component creation with clear composition
- **Code Quality**: Better separation of concerns and testability
- **Performance**: No runtime performance regression
- **Migration**: Zero breaking changes during transition

## Risk Mitigation

- **Parallel Implementation**: Keep existing classes during transition
- **Comprehensive Testing**: Ensure all functionality preserved
- **Gradual Migration**: Move components one at a time
- **Performance Monitoring**: Validate no runtime regressions
- **Documentation**: Clear migration guides and examples

This refactoring will create a more flexible, maintainable, and performant foundation for our component library while preserving all existing functionality.
