# Web Component Library Implementation Plan

## Project Overview

This project creates a modern, accessible web component library using vanilla TypeScript and Web Components API. The library follows atomic design principles with a robust inheritance hierarchy and comprehensive accessibility features.

## Core Principles

1. **Accessibility First** - Every component must be fully accessible
2. **Atomic Structure** - Components organized as primitives, molecules, and organisms
3. **Inheritance-Based Architecture** - Base classes extended for specific functionality
4. **Explicit Registration** - Components registered explicitly rather than auto-registered
5. **Tree-Shaking Optimized** - Individual exports for optimal bundling

## Architecture Foundation

### Base Classes

- **BaseComponent** - Foundation class with lifecycle, attributes, events, accessibility
- **ShadowComponent** - Extends BaseComponent with Shadow DOM support

### Component Hierarchy Examples

```
BaseComponent
├── BaseInputComponent
│   ├── TextInputComponent
│   │   ├── EmailInputComponent
│   │   ├── TelInputComponent
│   │   └── UrlInputComponent
│   ├── NumberInputComponent
│   ├── BooleanInputComponent
│   ├── DateInputComponent
│   ├── FileInputComponent
│   └── ColorInputComponent
└── ButtonComponent
```

### Atomic Design Structure

```
src/components/
├── primitives/     # ui-button, ui-input, ui-icon, ui-badge
├── molecules/      # ui-field, ui-alert, ui-search-box
└── organisms/      # ui-header, ui-form, ui-table
```

## Phase 1: Foundation ✅ COMPLETED

### Completed Tasks

1. **✅ Atomic design folder structure** - Organized component directories
2. **✅ Base utilities** - Accessibility helpers, CSS custom properties, style helpers
3. **✅ BaseComponent class** - Lifecycle, attributes (static/dynamic), events, accessibility
4. **✅ ShadowComponent class** - Extended BaseComponent with Shadow DOM
5. **✅ Component registration system** - Explicit registration with dependency management
6. **✅ Individual component exports** - Tree-shaking optimization
7. **✅ TypeScript interfaces** - Component configuration and accessibility options
8. **✅ Comprehensive test suite** - Vitest with jsdom, accessibility utilities testing
9. **✅ Signals system** - TC39-aligned reactive state management with web component integration

### Key Features Implemented

- **Attribute Management**: Separate handling for static (variants) vs dynamic (state) attributes
- **Event System**: Standardized `ui-[component]-[action]` event naming
- **Accessibility Utilities**:
  - `generateId()` - Unique ID generation
  - `announceToScreenReader()` - Live region announcements
  - `FocusManager` - Focus capture, restore, and trapping
  - `setAriaState()` - ARIA state management
  - `KeyboardNav` - Arrow key navigation patterns
- **Style System**: CSS custom properties, design tokens, adoptable stylesheets
- **Component Registry**: Explicit registration with dependency resolution
- **Signals System**: TC39-aligned reactive primitives (signal, computed, effect) with:
  - Automatic dependency tracking and batched updates
  - Web component integration via `withSignals` mixin
  - Reactive DOM attribute binding with `SignalAttribute` classes
  - Circular dependency detection and proper cleanup lifecycle

### Test Coverage

- ✅ **Accessibility Tests**: 21/21 passing
- ✅ **SimpleBaseComponent Tests**: 13/13 passing
- ✅ **Component Registry Tests**: 16/19 passing (3 JSDOM limitations)

## Phase 2: First Components (NEXT)

### Planned Implementation

1. **Build ui-button primitive** - Complete example with variants and accessibility
2. **Create BaseInputComponent** - Input inheritance pattern foundation
3. **Build ui-input component** - TextInputComponent extending BaseInputComponent
4. **Test atomic design hierarchy** - Validate with first molecule component

### Component Features to Implement

- Static attribute variants (size, variant, etc.)
- Dynamic state management (disabled, loading, etc.)
- Comprehensive accessibility (ARIA, keyboard, focus management)
- CSS custom property theming
- Full test coverage

## Phase 3: Validation & Documentation (FUTURE)

1. Document design principles and architecture patterns
2. Create component development guidelines
3. Establish build and testing workflows
4. Validate atomic design with molecule/organism examples

## Technical Specifications

### Event Naming Convention

- Pattern: `ui-[component]-[action]`
- Examples: `ui-button-click`, `ui-input-change`, `ui-modal-open`
- All events bubble by default, composed for Shadow DOM

### CSS Class Naming

- Base: Component tag name (e.g., `ui-button`)
- Variants: `[component]--[attribute]-[value]` (e.g., `ui-button--variant-primary`)
- States: `[component]--[state]` (e.g., `ui-button--disabled`)

### Attribute Patterns

- **Static Attributes**: `variant`, `size`, `color` - Set once, rarely change
- **Dynamic Attributes**: `disabled`, `loading`, `selected` - Change during interaction

### Accessibility Standards

- All components implement appropriate ARIA roles and states
- Keyboard navigation follows ARIA Authoring Practices Guide
- Focus management with visual indicators
- Screen reader announcements for state changes

## Development Commands

- `pnpm dev` - Development server
- `pnpm build` - TypeScript + Vite build
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm lint` - ESLint checking
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier

## File Structure

```
src/
├── base/                   # BaseComponent, ShadowComponent
├── utilities/             # Accessibility, style helpers, registry, signals
├── components/            # UI components organized atomically
│   ├── primitives/       # Basic building blocks
│   │   └── ui-component/ # Each component in its own directory
│   │       ├── ui-component.ts      # Component logic
│   │       ├── ui-component.html    # Template structure
│   │       ├── ui-component.css     # Component styles
│   │       ├── ui-component.test.ts # Unit tests
│   │       └── index.ts             # Public exports
│   ├── molecules/        # Component combinations
│   └── organisms/        # Complex component groups
├── mixins/               # Reusable behavior mixins
├── styles/               # Global styles, tokens, reset
├── types/                # TypeScript interfaces
└── test/                 # Test utilities and base tests
```

## Component Architecture

This project follows an **Angular-inspired component structure** with separation of concerns:

- **Logic** (`.ts`) - Component class, lifecycle, event handling
- **Template** (`.html`) - HTML structure and slots
- **Styles** (`.css`) - Component-specific CSS and variants
- **Tests** (`.test.ts`) - Comprehensive test coverage

See [Component File Structure Guidelines](./component-file-structure.md) for detailed information.

This implementation plan provides a solid foundation for building a comprehensive, accessible component library that can scale efficiently while maintaining code quality and developer experience.
