# Session Startup Guide for Claude Code

## Quick Context Overview

This document provides essential context for resuming work on the web component library, particularly during the **3.5-day Card Composition Sprint** leading to the Tuesday presentation.

---

## 🎯 Current Sprint Goals

**Target**: Tuesday presentation demonstrating compelling card composition capabilities  
**Timeline**: 3.5 days of focused implementation  
**Objective**: Show how composition and slots enable creating diverse card layouts with minimal effort

### Sprint Status Dashboard
- **Day 1 Components**: ui-heading, ui-text, ui-button (Enhanced)
- **Day 2 Components**: ui-image, ui-skeleton  
- **Day 3 Components**: ui-card (foundation)
- **Day 3.5**: Demo composition examples

---

## 📚 Essential Documentation Reference

### Primary Planning Documents
1. **[Card Composition Sprint Plan](./card-composition-sprint.md)** - Complete 3.5-day roadmap
2. **[Day 1 User Stories](./day1-user-stories.md)** - Detailed acceptance criteria for ui-heading, ui-text, ui-button
3. **[Component File Structure](./component-file-structure.md)** - Angular-inspired separated file architecture

### Architecture Foundation
4. **[Implementation Plan](./implementation-plan.md)** - Overall project architecture and current status
5. **[Component Roadmap](./component-roadmap.md)** - Long-term component planning with inheritance hierarchy
6. **[Mixin Patterns](./architecture/mixin-patterns.md)** - Core mixin architecture understanding

### Development Guidelines
7. **[Testing Strategy](./development/testing-strategy.md)** - Comprehensive testing approach
8. **[Component Migration Guide](./development/component-migration-guide.md)** - How to refactor existing components

---

## 🏗️ Architecture Quick Reference

### Component File Structure (Angular-inspired)
```
src/components/primitives/ui-component/
├── ui-component.ts          # Component logic and lifecycle
├── ui-component.html        # Template structure and slots
├── ui-component.css         # Component styles and variants
├── ui-component.test.ts     # Comprehensive test suite
└── index.ts                 # Public exports
```

### Base Class Hierarchy
```
BaseComponent (light DOM)
├── ui-heading, ui-text (typography primitives)
├── ui-image, ui-skeleton (media/visual primitives)
└── InteractiveAttributeComponent
    └── ui-button (interactive elements)

ShadowComponent (encapsulated DOM)
└── ui-card (complex molecules)
```

### Key Architectural Principles
- **Composition over inheritance** - One card component, many layouts
- **Light DOM** for styling flexibility (typography)
- **Shadow DOM** for encapsulation (complex components)
- **Explicit registration** - No auto-registration
- **CSS custom properties** for theming
- **Accessibility first** - ARIA compliance built-in

---

## 🎨 Design System Integration

### CSS Custom Properties Location
- **Design Tokens**: `src/styles/tokens.css`
- **Component Reset**: `src/style.css`
- **Typography Scale**: Uses `--ui-font-size-*`, `--ui-font-weight-*`
- **Color System**: Uses `--ui-color-*` variables
- **Spacing**: Uses `--ui-space-*` tokens

### Component Naming Conventions
- **Events**: `ui-[component]-[action]` (e.g., `ui-button-click`)
- **CSS Classes**: `[component]--[attribute]-[value]` (e.g., `ui-button--variant-primary`)
- **Attributes**: `variant`, `size`, `disabled`, `loading`, etc.

---

## 🧪 Development Environment

### Key Commands
```bash
pnpm dev              # Development server with hot reload
pnpm build            # TypeScript compilation + Vite build
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once (for CI/verification)
```

### File Locations
- **Main Demo**: `src/main.ts` - Development playground
- **Component Registry**: `src/utilities/component-registry.ts`
- **Base Classes**: `src/base/` directory
- **Existing Example**: `src/components/example/SimpleButton.ts`

---

## 📋 Current Sprint Checklist

### Day 1 Components (Current Focus)
- [ ] **ui-heading** - Semantic headings with visual variants
  - Levels: 1-6, Variants: display, title, subtitle, h1-h6
  - Features: semantic/visual separation, truncation, responsive typography
- [ ] **ui-text** - Flexible text wrapper
  - Variants: body, caption, emphasis, strong, code
  - Features: multi-line truncation, semantic elements
- [ ] **ui-button** - Enhanced interactive element
  - Variants: primary, secondary, ghost, danger, success
  - Features: loading states, icon support, full accessibility

### Implementation Order Strategy
**Start Simple → Build Complexity**
1. **ui-heading** (establish patterns, validate architecture)
2. **ui-text** (refine typography approach)
3. **ui-button** (complex interactions and states)

---

## 🎯 Acceptance Criteria Quick Reference

### Universal Requirements (All Components)
- [ ] Angular-style separated files (`.ts`, `.html`, `.css`, `.test.ts`)
- [ ] TypeScript strict mode compliance
- [ ] CSS custom property integration
- [ ] Comprehensive accessibility (ARIA, keyboard, screen reader)
- [ ] >90% test coverage
- [ ] Integration with design token system

### Day 1 Specific Goals
- [ ] Typography components use light DOM for styling flexibility
- [ ] Button extends InteractiveAttributeComponent pattern
- [ ] All components work together in card compositions
- [ ] Responsive behavior across viewport sizes
- [ ] Error-free build and test execution

---

## 🚀 Demo Composition Examples (End Goal)

### Target Card Compositions for Tuesday
1. **Product Card**: image + heading + text + button
2. **Profile Card**: avatar + heading + text + actions  
3. **Article Card**: media + heading + excerpt + metadata
4. **Metric Card**: heading + large text + skeleton loading
5. **Gallery Card**: image + overlay text + actions

### Key Demo Points
- **Slot flexibility** - Easy content rearrangement
- **Loading states** - Skeleton components for UX
- **Responsive design** - Mobile-first approach
- **Accessibility** - Full keyboard navigation and screen reader support

---

## 🔧 Development Workflow

### Starting a New Component
1. **Create directory structure** following Angular pattern
2. **Implement base `.ts` file** with proper inheritance
3. **Create minimal `.html` template** with appropriate slots
4. **Build `.css` styles** with variants and design tokens
5. **Write comprehensive `.test.ts`** covering all acceptance criteria
6. **Update `main.ts`** with demo examples
7. **Run quality checks**: `pnpm test:run && pnpm build`

### Before Each Commit
- [ ] All tests passing (`pnpm test:run`)
- [ ] Build successful (`pnpm build`)
- [ ] Components demonstrated in `main.ts`
- [ ] Documentation updated if needed

---

## 🎪 Presentation Preparation

### Success Metrics for Tuesday
- [ ] 5+ distinct card examples working
- [ ] Live composition demonstration ready
- [ ] Performance benefits visible (loading states)
- [ ] Accessibility features demonstrable
- [ ] Code examples clear and concise

### Key Talking Points
1. **Composition over inheritance** - Show slot flexibility
2. **Developer experience** - Minimal markup, maximum flexibility  
3. **Accessibility by default** - Built-in ARIA compliance
4. **Performance** - Light/Shadow DOM strategic usage
5. **Design system integration** - Consistent theming

---

## 🆘 Common Issues & Solutions

### Build Issues
- **TypeScript errors**: Check mixin imports and type definitions
- **CSS import errors**: Verify file paths and Vite configuration
- **Test failures**: Ensure JSDOM compatibility and proper cleanup

### Architecture Questions
- **Light vs Shadow DOM**: Typography = Light, Complex components = Shadow
- **Base class choice**: Interactive elements = InteractiveAttributeComponent, Simple = BaseComponent
- **Event naming**: Always `ui-[component]-[action]` pattern

### Component Integration
- **Spacing issues**: Use CSS custom properties for consistent spacing
- **Theme conflicts**: Ensure proper design token inheritance
- **Accessibility gaps**: Test with keyboard navigation and screen readers

---

## 📝 Quick Status Check

**Before starting each session, verify:**
1. **Current sprint day** and component focus
2. **Last completed component** status
3. **Build and test status** - ensure clean starting point  
4. **Demo functionality** - what's working in `main.ts`
5. **Next component priority** from sprint plan

This guide should provide all the essential context needed to jump back into productive development work efficiently! 🚀