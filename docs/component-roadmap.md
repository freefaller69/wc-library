# Component Roadmap

This document outlines the planned components for our web component library, organized by atomic design principles. Each component includes its base class inheritance, key features, and dependencies.

## Component Status Legend

- ⭐ **Planned** - Not yet implemented
- 🚧 **In Progress** - Currently being developed  
- ✅ **Completed** - Implemented and tested
- 📋 **Needs Review** - Implementation complete, awaiting review

---

## Primitives (Basic Building Blocks)

### Form Controls

#### ui-button ⭐
- **Extends**: `BaseComponent`
- **Variants**: primary, secondary, tertiary, danger, success
- **Sizes**: small, medium, large
- **States**: disabled, loading, pressed
- **Features**: Icon support, full accessibility, keyboard navigation
- **Dependencies**: None

#### ui-input ⭐  
- **Extends**: `BaseInputComponent` (extends `BaseComponent`)
- **Types**: text, email, tel, url, password, search
- **Variants**: default, filled, outlined
- **Sizes**: small, medium, large
- **States**: disabled, readonly, invalid, valid
- **Features**: Label association, error states, help text
- **Dependencies**: None

#### ui-textarea ⭐
- **Extends**: `BaseInputComponent`
- **Features**: Auto-resize, character count, validation states
- **Dependencies**: None

#### ui-select ⭐
- **Extends**: `BaseInputComponent`
- **Features**: Custom dropdown, search filtering, multi-select
- **Variants**: native, custom
- **Dependencies**: ui-icon, ui-button

#### ui-checkbox ⭐
- **Extends**: `BooleanInputComponent` (extends `BaseInputComponent`)
- **States**: checked, unchecked, indeterminate
- **Features**: Custom styling, label association
- **Dependencies**: ui-icon

#### ui-radio ⭐
- **Extends**: `BooleanInputComponent`
- **Features**: Group management, label association
- **Dependencies**: None

#### ui-switch ⭐
- **Extends**: `BooleanInputComponent`  
- **Features**: Toggle animation, accessibility labels
- **Dependencies**: None

#### ui-slider ⭐
- **Extends**: `BaseInputComponent`
- **Types**: single, range
- **Features**: Step values, marks, tooltips
- **Dependencies**: None

### Display Elements

#### ui-icon ⭐
- **Extends**: `BaseComponent`
- **Sources**: SVG, icon font, custom
- **Sizes**: xs, sm, md, lg, xl
- **Features**: Color theming, accessibility labels
- **Dependencies**: None

#### ui-avatar ⭐
- **Extends**: `BaseComponent`
- **Types**: image, initials, icon
- **Sizes**: xs, sm, md, lg, xl
- **Features**: Fallback handling, status indicators
- **Dependencies**: ui-icon

#### ui-badge ⭐
- **Extends**: `BaseComponent`
- **Variants**: primary, secondary, success, warning, danger
- **Sizes**: small, medium, large
- **Features**: Dot variant, positioning, counts
- **Dependencies**: None

#### ui-label ⭐
- **Extends**: `BaseComponent`
- **Variants**: default, required, optional
- **Features**: Form association, help text, tooltips
- **Dependencies**: ui-icon

#### ui-divider ⭐
- **Extends**: `BaseComponent`
- **Orientations**: horizontal, vertical
- **Variants**: solid, dashed, dotted
- **Features**: Text content, spacing control
- **Dependencies**: None

#### ui-skeleton ⭐
- **Extends**: `BaseComponent`
- **Types**: text, circle, rectangle, custom
- **Features**: Animation control, responsive sizing
- **Dependencies**: None

#### ui-spinner ⭐
- **Extends**: `BaseComponent`
- **Variants**: dots, bars, circle, pulse
- **Sizes**: small, medium, large
- **Features**: Color theming, speed control
- **Dependencies**: None

### Interactive Elements

#### ui-link ⭐
- **Extends**: `BaseComponent`
- **Variants**: default, button, quiet
- **States**: visited, active, focus
- **Features**: External link indicators, download attributes
- **Dependencies**: ui-icon

#### ui-progress ⭐
- **Extends**: `BaseComponent`
- **Types**: linear, circular
- **Features**: Indeterminate state, labels, colors
- **Dependencies**: None

---

## Molecules (Component Combinations)

### Form Molecules

#### ui-field ⭐
- **Extends**: `BaseComponent`
- **Components**: label + input + help text + error
- **Features**: Validation states, required indicators
- **Dependencies**: ui-label, ui-input/ui-textarea/ui-select, ui-icon

#### ui-fieldset ⭐
- **Extends**: `BaseComponent`
- **Features**: Grouped form controls, legend support
- **Dependencies**: ui-field, ui-label

#### ui-search-box ⭐
- **Extends**: `BaseComponent`
- **Components**: input + search button + clear button
- **Features**: Live search, keyboard shortcuts
- **Dependencies**: ui-input, ui-button, ui-icon

#### ui-file-upload ⭐
- **Extends**: `BaseComponent`
- **Features**: Drag & drop, progress, file preview
- **Dependencies**: ui-button, ui-progress, ui-icon

### Display Molecules

#### ui-card ⭐
- **Extends**: `ShadowComponent`
- **Sections**: header, body, footer, media
- **Variants**: elevated, outlined, filled
- **Features**: Interactive states, actions
- **Dependencies**: ui-button, ui-icon

#### ui-alert ⭐
- **Extends**: `BaseComponent`
- **Variants**: info, success, warning, error
- **Features**: Dismissible, actions, icons
- **Dependencies**: ui-icon, ui-button

#### ui-toast ⭐
- **Extends**: `BaseComponent`
- **Variants**: info, success, warning, error
- **Features**: Auto-dismiss, positioning, queue management
- **Dependencies**: ui-icon, ui-button

#### ui-tooltip ⭐
- **Extends**: `ShadowComponent`
- **Triggers**: hover, focus, click
- **Positions**: top, bottom, left, right, auto
- **Features**: Arrow positioning, delay control
- **Dependencies**: None

#### ui-popover ⭐
- **Extends**: `ShadowComponent`
- **Triggers**: click, hover, focus
- **Features**: Focus trapping, positioning, dismissal
- **Dependencies**: None

#### ui-accordion ⭐
- **Extends**: `BaseComponent`
- **Features**: Multiple/single expand, keyboard navigation
- **Dependencies**: ui-icon, ui-button

#### ui-tabs ⭐
- **Extends**: `BaseComponent`
- **Orientations**: horizontal, vertical
- **Features**: Keyboard navigation, lazy loading
- **Dependencies**: ui-button

### Navigation Molecules

#### ui-breadcrumb ⭐
- **Extends**: `BaseComponent`
- **Features**: Separator customization, overflow handling
- **Dependencies**: ui-link, ui-icon

#### ui-pagination ⭐
- **Extends**: `BaseComponent`
- **Features**: Page numbers, prev/next, jump to page
- **Dependencies**: ui-button, ui-select

#### ui-menu ⭐
- **Extends**: `ShadowComponent`
- **Types**: dropdown, context, nested
- **Features**: Keyboard navigation, separators, icons
- **Dependencies**: ui-icon, ui-divider

---

## Organisms (Complex Component Groups)

### Layout Organisms

#### ui-header ⭐
- **Extends**: `BaseComponent`
- **Sections**: logo, navigation, actions, search
- **Features**: Responsive behavior, sticky positioning
- **Dependencies**: ui-button, ui-link, ui-search-box, ui-menu

#### ui-sidebar ⭐
- **Extends**: `BaseComponent`
- **Features**: Collapsible, responsive, nested navigation
- **Dependencies**: ui-menu, ui-button, ui-icon

#### ui-footer ⭐
- **Extends**: `BaseComponent`
- **Sections**: links, social, legal, newsletter
- **Dependencies**: ui-link, ui-icon, ui-button

### Form Organisms

#### ui-form ⭐
- **Extends**: `BaseComponent`
- **Features**: Validation management, submission handling
- **Dependencies**: ui-field, ui-fieldset, ui-button

#### ui-multi-step-form ⭐
- **Extends**: `BaseComponent`
- **Features**: Step navigation, progress tracking, validation
- **Dependencies**: ui-form, ui-progress, ui-button

### Data Display Organisms

#### ui-table ⭐
- **Extends**: `BaseComponent`
- **Features**: Sorting, filtering, pagination, selection
- **Dependencies**: ui-checkbox, ui-button, ui-icon, ui-pagination

#### ui-data-grid ⭐
- **Extends**: `BaseComponent`
- **Features**: Virtual scrolling, editing, grouping
- **Dependencies**: ui-table, ui-input, ui-select

#### ui-list ⭐
- **Extends**: `BaseComponent`
- **Types**: simple, detailed, virtual
- **Features**: Selection, actions, infinite scroll
- **Dependencies**: ui-checkbox, ui-button, ui-icon

### Modal Organisms

#### ui-modal ⭐
- **Extends**: `ShadowComponent`
- **Sizes**: small, medium, large, fullscreen
- **Features**: Focus trapping, backdrop, animations
- **Dependencies**: ui-button, ui-icon

#### ui-drawer ⭐
- **Extends**: `ShadowComponent`
- **Positions**: left, right, top, bottom
- **Features**: Overlay, push content, resize
- **Dependencies**: ui-button, ui-icon

#### ui-dialog ⭐
- **Extends**: `ShadowComponent`
- **Types**: alert, confirm, custom
- **Features**: Modal behavior, action buttons
- **Dependencies**: ui-button, ui-icon

---

## Base Component Composition Patterns

### Inheritance Hierarchy

```
BaseComponent
├── ShadowComponent
│   ├── ui-card
│   ├── ui-tooltip  
│   ├── ui-popover
│   ├── ui-menu
│   ├── ui-modal
│   ├── ui-drawer
│   └── ui-dialog
├── BaseInputComponent
│   ├── TextInputComponent
│   │   ├── ui-input (text, email, tel, url, password, search)
│   │   └── ui-textarea
│   ├── NumberInputComponent
│   │   ├── ui-input[type="number"]
│   │   └── ui-slider
│   ├── BooleanInputComponent
│   │   ├── ui-checkbox
│   │   ├── ui-radio
│   │   └── ui-switch
│   ├── DateInputComponent
│   │   └── ui-input[type="date"]
│   ├── FileInputComponent
│   │   └── ui-file-upload
│   └── SelectInputComponent
│       └── ui-select
└── [Direct BaseComponent extensions]
    ├── ui-button
    ├── ui-icon
    ├── ui-badge
    ├── ui-label
    ├── ui-avatar
    ├── ui-divider
    ├── ui-skeleton
    ├── ui-spinner
    ├── ui-link
    ├── ui-progress
    ├── ui-alert
    ├── ui-toast
    ├── ui-accordion
    ├── ui-tabs
    ├── ui-breadcrumb
    ├── ui-pagination
    ├── ui-header
    ├── ui-sidebar
    ├── ui-footer
    ├── ui-form
    ├── ui-multi-step-form
    ├── ui-table
    ├── ui-data-grid
    ├── ui-list
    ├── ui-field
    └── ui-fieldset
```

### Composition Strategies

#### 1. **Input Components Pattern**
All form inputs extend specialized base classes with common validation, labeling, and state management.

#### 2. **Shadow DOM Pattern**  
Complex components with internal DOM structure use `ShadowComponent` for encapsulation.

#### 3. **Composite Pattern**
Higher-level components compose multiple primitives (ui-field = ui-label + ui-input + ui-icon).

#### 4. **Mixin Pattern**
Shared behaviors (keyboard navigation, focus management) implemented as mixins.

---

## Implementation Priorities

### Phase 2: Core Primitives
1. ui-button (foundation example)
2. ui-input (inheritance pattern validation)  
3. ui-icon (dependency for many components)
4. ui-label (field composition)

### Phase 3: Essential Molecules
1. ui-field (form building block)
2. ui-alert (feedback pattern)
3. ui-card (layout pattern)

### Phase 4: Advanced Components
1. ui-select (complex interaction)
2. ui-table (data display)
3. ui-modal (overlay pattern)

### Phase 5: Specialized Components
1. ui-data-grid (advanced data)
2. ui-multi-step-form (complex flows)
3. ui-drawer (advanced navigation)

---

## Notes

- Each component should include comprehensive accessibility features
- All components follow the established event naming convention (`ui-[component]-[action]`)
- CSS custom properties enable flexible theming
- Individual exports support tree-shaking
- Test coverage should be maintained at >90% for all components

This roadmap provides a comprehensive view of where the component library is headed while maintaining flexibility to adapt as requirements evolve.