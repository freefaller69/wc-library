# Card Composition Sprint - 3.5 Day Implementation Plan

**Target**: Tuesday presentation demonstrating compelling card composition capabilities  
**Timeline**: 3.5 days starting implementation  
**Goal**: Showcase how composition and slots enable creating diverse card layouts with minimal effort

## Sprint Overview

This sprint focuses on building essential primitives and a flexible card foundation that demonstrates the power of compositional design. By Tuesday, we'll have working examples showing how one card component can create multiple layout patterns through slot composition.

## Day-by-Day Implementation

### Day 1: Essential Typography & Interactive Primitives

#### ui-heading

- **Extends**: `BaseComponent` (light DOM for maximum styling flexibility)
- **Purpose**: Semantic headings with design system integration
- **File Structure**:
  ```
  src/components/primitives/ui-heading/
  ├── ui-heading.ts          # Component logic and lifecycle
  ├── ui-heading.html        # Minimal template with slot
  ├── ui-heading.css         # Typography variants and responsive styles
  ├── ui-heading.test.ts     # Comprehensive test suite
  └── index.ts               # Public exports
  ```
- **Variants**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `display`, `title`, `subtitle`
- **Attributes**:
  - `level` (1-6) - Semantic heading level
  - `variant` - Visual style variant
  - `truncate` - Text truncation behavior
- **Features**:
  - Semantic/visual separation (h1 can look like h3)
  - Responsive typography via CSS custom properties
  - Accessibility: proper heading hierarchy

#### ui-text

- **Extends**: `BaseComponent` (light DOM for inline flexibility)
- **Purpose**: Flexible text wrapper for paragraphs and inline content
- **File Structure**:
  ```
  src/components/primitives/ui-text/
  ├── ui-text.ts             # Component logic and semantic element handling
  ├── ui-text.html           # Slot-based template for content
  ├── ui-text.css            # Text variants and truncation styles
  ├── ui-text.test.ts        # Comprehensive test coverage
  └── index.ts               # Public exports and types
  ```
- **Variants**: `body`, `caption`, `emphasis`, `strong`, `code`
- **Attributes**:
  - `variant` - Text style variant
  - `truncate` - Single/multi-line truncation
  - `max-lines` - Maximum lines before truncation
- **Features**:
  - Efficient inline/block text rendering
  - Design token integration
  - Reading accessibility optimizations

#### ui-button (Enhanced)

- **Extends**: `InteractiveAttributeComponent` (build on existing SimpleButton)
- **Purpose**: Primary interactive element for cards
- **File Structure**:
  ```
  src/components/primitives/ui-button/
  ├── ui-button.ts           # Interactive component logic and event handling
  ├── ui-button.html         # Button template with icon slots
  ├── ui-button.css          # Variants, sizes, states, and animations
  ├── ui-button.test.ts      # Interaction and accessibility tests
  └── index.ts               # Component exports and types
  ```
- **Variants**: `primary`, `secondary`, `ghost`, `danger`, `success`
- **Sizes**: `small`, `medium`, `large`
- **States**: `disabled`, `loading`, `pressed`
- **Features**:
  - Icon support (prefix/suffix)
  - Loading states with spinner
  - Full keyboard navigation
  - ARIA compliance

### Day 2: Media & Visual Primitives

#### ui-image

- **Extends**: `BaseComponent`
- **Purpose**: Responsive, accessible image component
- **Attributes**:
  - `src` - Image source
  - `alt` - Accessibility description
  - `loading` - `eager` | `lazy`
  - `aspect-ratio` - CSS aspect ratio
  - `sizes` - Responsive sizing
- **States**: `loading`, `loaded`, `error`
- **Events**: `ui-image-load`, `ui-image-error`, `ui-image-lazy-load`
- **Features**:
  - Native lazy loading
  - Error state handling
  - Responsive image optimization
  - Accessibility compliance

#### ui-skeleton

- **Extends**: `BaseComponent`
- **Purpose**: Loading state placeholders
- **Types**: `text`, `circle`, `rectangle`, `custom`
- **Attributes**:
  - `type` - Skeleton shape type
  - `width` - Custom width
  - `height` - Custom height
  - `animate` - Animation enable/disable
  - `lines` - Number of text lines (for text type)
- **Features**:
  - Smooth CSS animations
  - Responsive sizing
  - Customizable appearance
  - Accessibility (aria-hidden, screen reader announcements)

### Day 3: Card Foundation & Architecture

#### ui-card

- **Extends**: `ShadowComponent`
- **Purpose**: Flexible container with slot-based composition
- **Slots**:
  - `header` - Card header content
  - `media` - Images, videos, or visual content
  - `body` - Main content area
  - `footer` - Footer content and actions
  - `actions` - Primary action buttons
- **Variants**: `elevated`, `outlined`, `flat`
- **Interactive**: `clickable`, `hoverable`, `selectable`
- **Attributes**:
  - `variant` - Visual style variant
  - `interactive` - Enable interactive behaviors
  - `padding` - Internal spacing control
  - `gap` - Spacing between sections
- **Features**:
  - Flexible slot arrangement
  - CSS custom property theming
  - Interactive state management
  - Accessibility (focus management, ARIA)

### Day 3.5: Composition Examples & Demo

#### Demo Card Examples

1. **Product Card**

   ```html
   <ui-card variant="elevated" interactive="clickable">
     <ui-image slot="media" src="product.jpg" alt="Product name"></ui-image>
     <ui-heading slot="body" level="3" variant="title">Product Name</ui-heading>
     <ui-text slot="body" variant="body">Product description text...</ui-text>
     <ui-button slot="actions" variant="primary">Add to Cart</ui-button>
   </ui-card>
   ```

2. **Profile Card**

   ```html
   <ui-card variant="outlined">
     <ui-image slot="media" src="avatar.jpg" aspect-ratio="1/1"></ui-image>
     <ui-heading slot="body" level="2" variant="subtitle">John Doe</ui-heading>
     <ui-text slot="body" variant="caption">Software Engineer</ui-text>
     <ui-button slot="actions" variant="secondary">View Profile</ui-button>
   </ui-card>
   ```

3. **Article Card**

   ```html
   <ui-card variant="flat" interactive="hoverable">
     <ui-image slot="media" src="article.jpg" loading="lazy"></ui-image>
     <ui-heading slot="body" level="3">Article Title</ui-heading>
     <ui-text slot="body" truncate max-lines="3">Article excerpt...</ui-text>
     <ui-text slot="footer" variant="caption">Published 2 days ago</ui-text>
   </ui-card>
   ```

4. **Loading Card (with Skeletons)**

   ```html
   <ui-card variant="elevated">
     <ui-skeleton slot="media" type="rectangle" aspect-ratio="16/9"></ui-skeleton>
     <ui-skeleton slot="body" type="text" lines="1"></ui-skeleton>
     <ui-skeleton slot="body" type="text" lines="2"></ui-skeleton>
     <ui-skeleton slot="actions" type="rectangle" width="100px" height="36px"></ui-skeleton>
   </ui-card>
   ```

5. **Metric Card**
   ```html
   <ui-card variant="outlined">
     <ui-heading slot="header" level="4" variant="caption">Revenue</ui-heading>
     <ui-heading slot="body" level="2" variant="display">$45,231</ui-heading>
     <ui-text slot="footer" variant="caption" style="color: green;">+12.5% from last month</ui-text>
   </ui-card>
   ```

#### Development Playground Updates

Update `src/main.ts` to showcase:

- Interactive card examples
- Live composition editing
- Loading state demonstrations
- Responsive behavior
- Accessibility features

## Key Presentation Points

### 1. Composition Over Inheritance

- **One card component, infinite layouts**: Show how slots enable diverse designs
- **Flexible content arrangement**: Demonstrate slot reordering and optional sections
- **Minimal markup overhead**: Compare to traditional approaches

### 2. Developer Experience

- **Intuitive slot names**: `header`, `media`, `body`, `footer`, `actions`
- **Semantic HTML preservation**: Components enhance rather than replace
- **TypeScript integration**: Full type safety and IntelliSense

### 3. Performance Benefits

- **Light DOM where beneficial**: Typography components for styling flexibility
- **Shadow DOM where needed**: Cards for encapsulation and component boundaries
- **Lazy loading**: Images and skeleton states for perceived performance

### 4. Accessibility by Default

- **ARIA compliance**: Proper roles, states, and properties
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: Semantic markup and announcements

### 5. Design System Integration

- **CSS custom properties**: Consistent theming across all components
- **Responsive design**: Mobile-first approach with fluid scaling
- **Dark/light mode**: Automatic theme switching support

## Success Criteria

### Functional Requirements

- [ ] All primitive components render correctly
- [ ] Card composition works with any combination of slots
- [ ] Interactive states function properly
- [ ] Loading skeletons provide smooth UX
- [ ] Responsive behavior works across devices

### Accessibility Requirements

- [ ] All components pass ARIA validation
- [ ] Keyboard navigation works completely
- [ ] Screen reader compatibility verified
- [ ] Focus management functions properly

### Demo Requirements

- [ ] 5+ distinct card examples working
- [ ] Live editing/composition demonstration
- [ ] Performance benefits visible
- [ ] Code examples are clear and concise

### Technical Requirements

- [ ] TypeScript compilation successful
- [ ] Test coverage >80% for new components
- [ ] Build process works without errors
- [ ] Documentation is complete and accurate

## Timeline Checkpoints

- **End Day 1**: Typography and button primitives complete
- **End Day 2**: Image and skeleton components functional
- **End Day 3**: Card foundation working with basic examples
- **Tuesday Morning**: Polish, final testing, presentation prep

## Risk Mitigation

- **Scope Creep**: Focus on core functionality first, enhancements second
- **Integration Issues**: Test components together early and often
- **Accessibility Gaps**: Validate ARIA compliance at each checkpoint
- **Time Pressure**: Have fallback demo examples if advanced features aren't ready

This sprint plan provides a focused path to demonstrating the power of compositional design while staying achievable within our timeline constraints.
