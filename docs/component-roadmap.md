# Component Roadmap

This document outlines the planned components for our web component library, organized by atomic design principles and integrated with our **3-Phase Component Development Strategy**. Each component includes its base class inheritance, key features, and dependencies.

**📋 Strategic Context**: This roadmap supports our evidence-based development approach documented in `/docs/development/strategic-component-roadmap.md` and `/docs/architecture/adr-001-phased-development-strategy.md`.

## Component Status Legend

- ⭐ **Planned** - Not yet implemented
- 🔄 **In Progress** - Currently being developed
- ✅ **Completed** - Implemented and tested
- 📋 **Needs Review** - Implementation complete, awaiting review
- 🎯 **Phase Priority** - Strategic priority for current development phase

---

## Strategic Development Phases

### 🎯 Phase 1: Core Primitives Portfolio (Current Focus)

**Objective**: Validate mixin composition patterns with diverse primitive components

### Phase 2: Molecule Components

**Objective**: Validate component composition and communication patterns

### Phase 3: Architecture Optimization & Tooling

**Objective**: Optimize architecture based on collected evidence

---

## Primitives (Basic Building Blocks)

### Form Controls

#### ui-button ✅ 🎯

- **Phase**: 1 (Completed)
- **Extends**: `FullComponent` (with mixin composition)
- **Variants**: primary, secondary, tertiary, danger, success
- **Sizes**: small, medium, large
- **States**: disabled, loading, pressed
- **Features**: Icon support, full accessibility, keyboard navigation
- **Dependencies**: None
- **Evidence Provided**: Mixin composition validation, event handling patterns, accessibility integration

#### ui-input 🔄 🎯

- **Phase**: 1 (In Progress - Next Priority)
- **Extends**: `FullComponent` (with input-specific mixins)
- **Types**: text, email, tel, url, password, search
- **Variants**: default, filled, outlined
- **Sizes**: small, medium, large
- **States**: disabled, readonly, invalid, valid
- **Features**: Label association, error states, help text
- **Dependencies**: None
- **Evidence Goal**: Complex attribute management, validation state patterns, keyboard navigation

#### ui-textarea ⭐

- **Extends**: `BaseInputComponent`
- **Features**: Auto-resize, character count, validation states
- **Dependencies**: None

#### ui-select 🔄 🎯

- **Phase**: 1 (Planned - High Priority)
- **Extends**: `FullComponent` (with advanced interaction mixins)
- **Features**: Custom dropdown, search filtering, multi-select
- **Variants**: native, custom
- **Dependencies**: ui-icon, ui-button
- **Evidence Goal**: Advanced interaction patterns, keyboard navigation, event coordination

#### ui-checkbox 🔄 🎯

- **Phase**: 1 (Planned - Medium Priority)
- **Extends**: `FullComponent` (with boolean input patterns)
- **States**: checked, unchecked, indeterminate
- **Features**: Custom styling, label association
- **Dependencies**: ui-icon
- **Evidence Goal**: Boolean input patterns, tri-state management, custom styling of native inputs

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

### Typography Elements

#### ui-heading ⭐

- **Extends**: `BaseComponent` (Light DOM for styling flexibility)
- **Levels**: 1-6 (h1-h6) with semantic/visual separation
- **Variants**: display, title, subtitle based on design system scales
- **Attributes**: `level`, `as`, `variant`, `responsive`, `truncate`
- **Features**: Responsive typography, semantic override, design token integration
- **Events**: `ui-heading-truncate-toggle`
- **Dependencies**: None

#### ui-paragraph ⭐

- **Extends**: `BaseComponent` (Light DOM for styling flexibility)
- **Variants**: body, caption, legal, emphasis based on design system
- **Attributes**: `variant`, `size`, `truncate`, `max-lines`
- **Features**: Multi-line truncation, responsive sizing, reading time calculation
- **Events**: `ui-paragraph-expand`, `ui-paragraph-truncate`
- **Dependencies**: None

#### ui-text ⭐

- **Extends**: `BaseComponent` (Light DOM for styling flexibility)
- **Elements**: Generic text wrapper for spans, inline text
- **Variants**: body, caption, label, code, emphasis, strong
- **Attributes**: `variant`, `as`, `size`, `weight`, `italic`
- **Features**: Semantic flexibility, design token integration, inline styling
- **Events**: None (primitive component)
- **Dependencies**: None

### Media Elements

#### ui-image ⭐

- **Extends**: `BaseComponent`
- **Features**: Lazy loading, error states, aspect ratios, responsive sizing
- **States**: loading, loaded, error
- **Attributes**: `src`, `alt`, `sizes`, `loading`, `aspect-ratio`
- **Events**: `ui-image-load`, `ui-image-error`, `ui-image-lazy-load`
- **Dependencies**: None

#### ui-picture ⭐

- **Extends**: `BaseComponent`
- **Features**: Multiple format support (WebP/AVIF), art direction, density switching
- **Sources**: Format-based (`webp`, `avif`, `jpg`), media query-based
- **Attributes**: `fallback-src`, `alt`, `sizes`
- **Events**: `ui-picture-load`, `ui-picture-error`, `ui-picture-source-change`
- **Dependencies**: None
- **Note**: Generates `<picture>` element with multiple `<source>` tags

#### ui-video ⭐

- **Extends**: `BaseComponent`
- **Features**: Custom controls, poster support, accessibility, caption handling
- **Sources**: Single/multiple format support, adaptive streaming
- **Controls**: play/pause, seek, volume, fullscreen, playback speed
- **Attributes**: `src`, `poster`, `controls`, `autoplay`, `muted`, `loop`
- **Events**: `ui-video-play`, `ui-video-pause`, `ui-video-ended`, `ui-video-error`
- **Dependencies**: ui-button, ui-icon, ui-slider

#### ui-media-embed ⭐

- **Extends**: `BaseComponent`
- **Providers**: YouTube, Vimeo, Twitter, Instagram, generic iframe
- **Features**: Privacy-first loading, GDPR compliance, aspect ratio containers
- **Privacy**: Click-to-load with consent, no cookies until user interaction
- **Attributes**: `provider`, `video-id`, `privacy-mode`, `aspect-ratio`
- **Events**: `ui-embed-consent`, `ui-embed-load`, `ui-embed-error`
- **Dependencies**: ui-button, ui-icon

---

## Molecules (Component Combinations)

### Form Molecules

#### ui-field 🔄 🎯

- **Phase**: 2 (Planned - High Priority)
- **Extends**: `FullComponent` (with composition patterns)
- **Components**: label + input + help text + error
- **Features**: Validation states, required indicators
- **Dependencies**: ui-label, ui-input/ui-textarea/ui-select, ui-icon
- **Evidence Goal**: Multi-component composition, state coordination, inter-component communication

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

#### ui-card 🔄 🎯

- **Phase**: 2 (Planned - High Priority)
- **Extends**: `FullComponent` (with flexible layout patterns)
- **Sections**: header, body, footer, media
- **Variants**: elevated, outlined, filled
- **Features**: Interactive states, actions
- **Dependencies**: ui-button, ui-icon
- **Evidence Goal**: Layout flexibility, content projection, slot management patterns

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

### Media Molecules

#### ui-media-gallery ⭐

- **Extends**: `BaseComponent`
- **Features**: Grid/masonry layouts, lightbox integration, lazy loading
- **Layouts**: grid, masonry, carousel, filmstrip
- **Navigation**: thumbnail nav, prev/next, keyboard support
- **Events**: `ui-gallery-item-select`, `ui-gallery-view-change`
- **Dependencies**: ui-image, ui-picture, ui-button, ui-icon

#### ui-media-player ⭐

- **Extends**: `ShadowComponent`
- **Features**: Unified audio/video player, playlist support, custom themes
- **Media Types**: video, audio, live streams
- **Controls**: Custom UI, keyboard shortcuts, gesture support
- **Features**: Picture-in-picture, fullscreen, captions, quality selection
- **Events**: `ui-player-play`, `ui-player-pause`, `ui-player-seek`, `ui-player-quality-change`
- **Dependencies**: ui-video, ui-button, ui-icon, ui-slider, ui-menu

#### ui-lightbox ⭐

- **Extends**: `ShadowComponent`
- **Features**: Full-screen media viewing, zoom, pan, slideshow
- **Media Types**: images, videos, mixed galleries
- **Navigation**: Swipe gestures, keyboard, thumbnails
- **Features**: Zoom controls, slideshow timer, download options
- **Events**: `ui-lightbox-open`, `ui-lightbox-close`, `ui-lightbox-navigate`
- **Dependencies**: ui-image, ui-video, ui-button, ui-icon

#### ui-media-uploader ⭐

- **Extends**: `BaseComponent`
- **Features**: Drag & drop, multiple files, preview, progress, validation
- **File Types**: images, videos, audio, documents
- **Validation**: File size, type, dimensions, duration
- **Preview**: Thumbnails, metadata display, crop tools
- **Events**: `ui-uploader-add`, `ui-uploader-progress`, `ui-uploader-complete`, `ui-uploader-error`
- **Dependencies**: ui-button, ui-progress, ui-icon, ui-image

### Typography Molecules

#### ui-article ⭐

- **Extends**: `ShadowComponent` (Encapsulated content structure)
- **Features**: Semantic content hierarchy, reading time, table of contents
- **Sections**: header, body, footer, sidebar, metadata
- **Content**: Automatic heading hierarchy validation, spacing consistency
- **Attributes**: `reading-time`, `toc`, `word-count`, `estimated-read`
- **Events**: `ui-article-scroll-section`, `ui-article-toc-click`
- **Dependencies**: ui-heading, ui-paragraph, ui-text

#### ui-text-block ⭐

- **Extends**: `ShadowComponent` (Structured content pattern)
- **Features**: Heading + content + metadata composition, responsive layout
- **Layouts**: stacked, inline, card-style, banner
- **Content**: Heading, paragraph, optional metadata, actions
- **Attributes**: `layout`, `spacing`, `alignment`, `metadata-position`
- **Events**: `ui-text-block-expand`, `ui-text-block-action`
- **Dependencies**: ui-heading, ui-paragraph, ui-text, ui-button

#### ui-content-card ⭐

- **Extends**: `ShadowComponent` (Rich content container)
- **Features**: Media + typography composition, interactive content
- **Sections**: media (image/video), heading, description, actions, metadata
- **Layouts**: horizontal, vertical, overlay, grid
- **Attributes**: `layout`, `media-position`, `actions-position`, `interactive`
- **Events**: `ui-content-card-click`, `ui-content-card-action`
- **Dependencies**: ui-image, ui-heading, ui-paragraph, ui-button, ui-icon

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
│   ├── ui-dialog
│   ├── ui-media-player
│   ├── ui-lightbox
│   ├── ui-article
│   ├── ui-text-block
│   └── ui-content-card
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
    ├── ui-heading
    ├── ui-paragraph
    ├── ui-text
    ├── ui-image
    ├── ui-picture
    ├── ui-video
    ├── ui-media-embed
    ├── ui-media-gallery
    ├── ui-media-uploader
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

#### 5. **Media Component Pattern**

Media components use progressive enhancement: basic `ui-image`/`ui-video` for simple use cases, complex `ui-media-player`/`ui-lightbox` for advanced features. Privacy-first design for embeds.

#### 6. **Typography Hybrid Pattern**

Typography primitives (`ui-heading`, `ui-paragraph`, `ui-text`) use light DOM for maximum styling flexibility. Typography molecules (`ui-article`, `ui-text-block`) use shadow DOM for structured content patterns while inheriting design tokens.

---

## Strategic Implementation Priorities

### 🎯 Phase 1: Core Primitives Portfolio (Current Focus)

**Objective**: Validate mixin composition patterns with diverse primitive components

**Priority Order**:

1. ✅ **ui-button** (Completed - Mixin composition validation)
2. 🔄 **ui-input** (Next - Complex attribute management evidence)
3. 🔄 **ui-select** (Advanced interaction patterns evidence)
4. 🔄 **ui-checkbox** (Boolean input patterns evidence)

**Success Criteria**:

- [ ] 4 primitive components demonstrate consistent patterns
- [ ] Mixin composition validated across component types
- [ ] Performance baseline established (<2ms initialization)
- [ ] Accessibility patterns proven (WCAG 2.1 AA compliance)

### Phase 2: Molecule Components (Evidence Integration)

**Objective**: Validate component composition and communication patterns

**Priority Order**:

1. 🔄 **ui-form-field** (Multi-component composition evidence)
2. 🔄 **ui-card** (Layout flexibility and slot management evidence)

**Success Criteria**:

- [ ] 2 molecule components demonstrate effective primitive composition
- [ ] Component communication patterns documented
- [ ] Slot management strategies validated
- [ ] Performance impact of composite components measured

### Phase 3: Architecture Optimization & Tooling (Refinement)

**Objective**: Optimize architecture based on collected evidence

**Priority Order**:

1. **Performance Monitoring Integration** (Performance API + Playwright)
2. **Enhanced Mixin Communication Patterns** (Based on evidence from Phases 1-2)
3. **Bundle Analysis and Optimization** (Tree-shaking validation)
4. **Advanced Testing Utilities** (Component testing helpers)

**Success Criteria**:

- [ ] Performance monitoring system operational
- [ ] Architecture optimizations implemented based on evidence
- [ ] Advanced tooling reduces development friction
- [ ] Library ready for production adoption

### Future Phases: Advanced Components

**Objective**: Scale the library with complex organisms

**Components**: ui-table, ui-modal, ui-data-grid, ui-multi-step-form, ui-media-player, ui-lightbox

**Note**: These will be developed after Phase 3 optimization, using patterns validated in earlier phases.

---

## Notes

- Each component should include comprehensive accessibility features
- All components follow the established event naming convention (`ui-[component]-[action]`)
- CSS custom properties enable flexible theming
- Individual exports support tree-shaking
- Test coverage should be maintained at >90% for all components
- **Media components prioritize privacy**: No external requests until user consent
- **Progressive enhancement**: Simple media components work without JavaScript
- **Performance first**: Lazy loading, intersection observers, and efficient rendering

This roadmap provides a comprehensive view of where the component library is headed while maintaining flexibility to adapt as requirements evolve.

## Strategic Documentation Links

- **📋 Strategic Roadmap**: `/docs/development/strategic-component-roadmap.md` - Detailed 3-phase strategy
- **🏗️ Architecture Guide**: `/docs/architecture/component-architecture-guide.md` - Technical patterns and decisions
- **📝 ADR-001**: `/docs/architecture/adr-001-phased-development-strategy.md` - Architectural decision rationale
- **🔘 Button Session Brief**: `/docs/session_briefs/button-session-brief.md` - Phase 1 completion example

This integrated approach ensures our component development aligns with architectural evidence collection and optimization goals.
