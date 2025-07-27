# Component File Structure Guidelines

## Overview

This project follows an Angular-inspired component architecture with **separation of concerns** through dedicated files for each aspect of a component. This approach provides better maintainability, clearer organization, and improved developer experience.

## File Structure Pattern

Each component should be organized in its own directory with separate files for different concerns:

```
src/components/[category]/[component-name]/
├── [component-name].ts          # TypeScript component logic
├── [component-name].html        # Template/HTML structure
├── [component-name].css         # Component-specific styles
├── [component-name].test.ts     # Unit tests
└── index.ts                     # Public exports
```

## File Responsibilities

### Component Logic (`.ts`)
- Component class definition
- Lifecycle methods
- Event handling
- State management
- Business logic
- Imports and dependencies

**Example: `ui-heading.ts`**
```typescript
import { BaseComponent } from '../../../base/BaseComponent.js';
import type { AccessibilityOptions } from '../../../types/component.js';
import template from './ui-heading.html';
import styles from './ui-heading.css';

export class UIHeading extends BaseComponent {
  constructor() {
    super({
      tagName: 'ui-heading',
      staticAttributes: ['level', 'variant', 'truncate'],
    });
  }

  // Component logic...
}
```

### Template Structure (`.html`)
- HTML template string
- Slot definitions
- Structural markup
- Accessibility markup

**Example: `ui-heading.html`**
```html
<slot></slot>
```

### Component Styles (`.css`)
- Component-specific CSS
- CSS custom properties
- Responsive design
- State-based styles
- Design token integration

**Example: `ui-heading.css`**
```css
:host {
  display: block;
  font-family: var(--ui-font-family-sans);
  color: var(--ui-color-text-primary);
}

:host([variant="display"]) {
  font-size: var(--ui-font-size-display);
  font-weight: var(--ui-font-weight-bold);
  line-height: var(--ui-line-height-tight);
}

/* Additional variants and states... */
```

### Unit Tests (`.test.ts`)
- Component behavior testing
- Attribute handling tests
- Event dispatching tests
- Accessibility compliance tests
- Integration testing

**Example: `ui-heading.test.ts`**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UIHeading } from './ui-heading.js';

describe('UIHeading', () => {
  let element: UIHeading;

  beforeEach(() => {
    element = new UIHeading();
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  // Test cases...
});
```

### Public Exports (`index.ts`)
- Component class export
- Type definitions export
- Public API surface

**Example: `index.ts`**
```typescript
export { UIHeading } from './ui-heading.js';
export type { UIHeadingVariant, UIHeadingLevel } from './ui-heading.types.js';
```

## Directory Organization

Components are organized by atomic design principles:

```
src/components/
├── primitives/          # Basic building blocks
│   ├── ui-heading/
│   ├── ui-text/
│   ├── ui-button/
│   ├── ui-image/
│   └── ui-icon/
├── molecules/           # Component combinations
│   ├── ui-field/
│   ├── ui-card/
│   └── ui-alert/
└── organisms/           # Complex component groups
    ├── ui-header/
    ├── ui-form/
    └── ui-table/
```

## Benefits of Separated Files

### 1. **Separation of Concerns**
- Logic, presentation, and styling are clearly separated
- Easier to focus on specific aspects during development
- Better code organization and maintainability

### 2. **Developer Experience**
- Syntax highlighting works optimally for each file type
- IDE features work better (CSS IntelliSense, HTML validation)
- Easier to navigate and understand component structure

### 3. **Team Collaboration**
- Designers can work on `.css` files independently
- Content authors can focus on `.html` templates
- Developers can concentrate on `.ts` logic
- QA can easily locate and understand test files

### 4. **Build Optimization**
- Better tree-shaking of unused styles
- Improved caching strategies
- Easier static analysis and bundling

### 5. **Testing and Maintenance**
- Clear test file location and naming
- Easier to mock or stub specific parts
- Better test coverage analysis

## File Import Patterns

### Importing Templates
```typescript
// For string templates
import template from './component.html';

// For template elements (if using HTML imports)
import templateUrl from './component.html?url';
```

### Importing Styles
```typescript
// For CSS strings
import styles from './component.css';

// For constructed stylesheets
import stylesheet from './component.css?sheet';
```

### Component Registration
```typescript
// In component file
if (!customElements.get('ui-heading')) {
  customElements.define('ui-heading', UIHeading);
}

// Or in index.ts for explicit registration
export function registerUIHeading() {
  if (!customElements.get('ui-heading')) {
    customElements.define('ui-heading', UIHeading);
  }
}
```

## Migration Strategy

### Existing Components
1. **Analyze** current single-file components
2. **Extract** HTML template to `.html` file
3. **Extract** CSS styles to `.css` file
4. **Update** imports and build process
5. **Create** comprehensive test files
6. **Validate** functionality remains identical

### New Components
- Follow this structure from the beginning
- Use component templates/scaffolding tools
- Establish consistent patterns across the codebase

## Tooling Considerations

### Build System Updates
- Configure Vite to handle `.html` and `.css` imports
- Ensure proper module resolution
- Support for TypeScript path mapping

### Development Workflow
- Hot module replacement for all file types
- Live reload for template and style changes
- Integrated linting across file types

### IDE Configuration
- File associations for custom extensions
- Snippet templates for new components
- Path mapping for easy navigation

## Examples

### Simple Component (ui-text)
```
src/components/primitives/ui-text/
├── ui-text.ts           # 50-80 lines of logic
├── ui-text.html         # 5-10 lines of template
├── ui-text.css          # 30-50 lines of styles
├── ui-text.test.ts      # 100-150 lines of tests
└── index.ts             # 2-5 lines of exports
```

### Complex Component (ui-card)
```
src/components/molecules/ui-card/
├── ui-card.ts           # 150-200 lines of logic
├── ui-card.html         # 20-30 lines of template
├── ui-card.css          # 100-150 lines of styles
├── ui-card.test.ts      # 200-300 lines of tests
├── ui-card.types.ts     # TypeScript type definitions
└── index.ts             # Export declarations
```

## Best Practices

### File Naming
- Use kebab-case for all file names
- Match component tag name exactly
- Use descriptive file extensions

### Template Organization
- Keep templates minimal and focused
- Use semantic HTML elements
- Include proper ARIA attributes
- Document complex slot structures

### Style Organization
- Start with `:host` styles
- Group related selectors
- Use CSS custom properties extensively
- Include responsive design considerations

### Test Organization
- Group tests by functionality
- Test component in isolation
- Include accessibility tests
- Cover all attribute combinations

This file structure approach ensures our component library remains maintainable, scalable, and developer-friendly while following industry best practices.