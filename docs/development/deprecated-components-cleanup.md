# Deprecated Components Cleanup Guide

This document provides a roadmap for removing deprecated BaseComponent architecture and related test files once the library has matured with the new CoreCustomElement + mixins/composites pattern.

## Current Status (as of ui-heading implementation)

### ✅ **New Architecture (In Use)**

- **CoreCustomElement** - Abstract base class for all components
- **Composites** - Pre-built combinations (AttributeComponent, ShadowComponent, etc.)
- **Mixins** - Individual functionality pieces
- **Direct Registration** - `customElements.define()` in component files

### ❌ **Deprecated Architecture (To Remove)**

- **BaseComponent** - Legacy component base class
- **Component Registry System** - Centralized registration with dependencies
- **Related Test Files** - Tests for deprecated functionality

## Files Ready for Removal

### **Test Files (43 skipped tests total)**

#### 1. `src/test/BaseComponent.test.ts`

- **Tests**: 21 skipped tests
- **Purpose**: Tests deprecated `BaseComponent` class functionality
- **Dependencies**: Uses `BaseComponent` import
- **Status**: ❌ Safe to delete - tests deprecated code
- **Evidence**: Documentation states "Don't extend BaseComponent (deprecated)"

#### 2. `src/test/SimpleBaseComponent.test.ts`

- **Tests**: 14 skipped tests
- **Purpose**: Simplified tests for `BaseComponent` with JSDOM limitations
- **Dependencies**: Uses `BaseComponent` import
- **Status**: ❌ Safe to delete - tests deprecated code
- **Notes**: Created to work around JSDOM custom element issues

#### 3. `src/test/component-registry.test.ts` (partial)

- **Tests**: 8 skipped tests (register + bulk operations)
- **Purpose**: Tests component registry system functionality
- **Dependencies**: Uses component registry utilities
- **Status**: 🤔 Decision needed - depends on registry system future
- **Current**: ui-heading uses direct `customElements.define()` successfully

### **Source Files to Evaluate**

#### 1. `src/base/BaseComponent.ts`

- **Status**: ❌ Can be removed after migration complete
- **Usage**: Check if any components still extend it
- **Migration**: All components should use CoreCustomElement or composites

#### 2. `src/utilities/component-registry.ts`

- **Status**: 🤔 Decision needed
- **Current Usage**: Not used by ui-heading
- **Alternative**: Direct `customElements.define()` works well
- **Consideration**: Adds complexity vs. benefits

## Migration Strategy

### **Phase 1: Component Development (Current)**

- ✅ Build 3-5 components with CoreCustomElement pattern
- ✅ Validate architecture works for different component types
- ✅ Document patterns and best practices

### **Phase 2: Architecture Decision (After 3-5 components)**

- **Evaluate**: Does component registry add value?
- **Consider**: Dependency management needs
- **Decide**: Keep registry system or use direct registration
- **Document**: Final architecture decision

### **Phase 3: Cleanup (After architecture stabilized)**

- **Remove**: Deprecated BaseComponent files
- **Delete**: Related test files
- **Update**: Any remaining references
- **Clean**: Import statements and exports

## Cleanup Checklist

When ready to remove deprecated components:

### **Pre-Cleanup Verification**

- [ ] All components migrated to CoreCustomElement pattern
- [ ] No remaining BaseComponent imports in active code
- [ ] Component registry decision finalized
- [ ] Architecture documented and stable

### **File Removal**

- [ ] Delete `src/test/BaseComponent.test.ts` (21 tests)
- [ ] Delete `src/test/SimpleBaseComponent.test.ts` (14 tests)
- [ ] Delete `src/base/BaseComponent.ts` (if no longer used)
- [ ] Evaluate `src/utilities/component-registry.ts` removal
- [ ] Remove component registry tests if system removed (8 tests)

### **Code Cleanup**

- [ ] Remove BaseComponent from exports
- [ ] Update any documentation references
- [ ] Clean up import statements
- [ ] Update TypeScript types if needed

### **Testing Verification**

- [ ] All remaining tests pass
- [ ] No broken imports or references
- [ ] Build completes successfully
- [ ] No TypeScript errors

## Architecture Evidence

### **Current Pattern (ui-heading)**

```typescript
// ✅ Current approach - works well
export class UIHeading extends CoreCustomElement {
  // Implementation using mixins/composites
}

// Register directly
if (!customElements.get('ui-heading')) {
  customElements.define('ui-heading', UIHeading);
}
```

### **Deprecated Pattern (to remove)**

```typescript
// ❌ Deprecated - documented as "don't use"
export class UIHeading extends BaseComponent {
  // Legacy approach
}

// Registry system - adds complexity
defineComponent('ui-heading', UIHeading);
registerComponent('ui-heading');
```

## Decision Factors for Component Registry

### **Pros of Registry System**

- Dependency management between components
- Centralized component tracking
- Bulk operations support
- Deferred registration capabilities

### **Cons of Registry System**

- Added complexity over standard Web Components API
- Not needed for current component patterns
- Extra abstraction layer
- Maintenance overhead

### **Current Evidence**

- ui-heading works perfectly with direct registration
- No dependency management needed so far
- Standard `customElements.define()` is familiar to developers
- Simpler architecture is easier to understand and maintain

## Recommendations

### **Short Term**

- Keep all deprecated tests skipped
- Continue building components with CoreCustomElement
- Document successful patterns as we go

### **Medium Term (After 3-5 components)**

- Evaluate if any components need dependency management
- Decide on component registry system value
- Plan cleanup phase if registry not needed

### **Long Term**

- Remove deprecated BaseComponent architecture completely
- Establish final component development patterns
- Document cleanup decisions for future maintainers

## References

- **Architecture Documentation**: `docs/development/component-development-lessons.md`
- **Don'ts List**: "Don't extend BaseComponent or ShadowComponent (deprecated)"
- **Current Example**: `src/components/primitives/ui-heading/` - successful CoreCustomElement implementation
- **Test Results**: 43 skipped tests, 52 passing tests with new architecture

---

_This document will be updated as the component library evolves and architecture decisions are finalized._
