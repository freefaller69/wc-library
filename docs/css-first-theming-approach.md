# CSS-First Theming Approach

## Philosophy: Minimal JS, Maximum CSS Flexibility

Instead of JavaScript managing variants, let's use **CSS custom properties** and **attribute selectors** to enable powerful theming with minimal component code.

---

## 🎯 Core Concept

### Current Variant Approach (Complex)

```typescript
// JavaScript manages everything
private updateVariantClasses(): void {
  this.removeVariantClasses();
  this.classList.add(`ui-heading--variant-${this._variant}`);
}
```

### CSS-First Approach (Simple)

```typescript
// Component just sets attributes - CSS does the work
set variant(value: string) {
  this.setAttribute('variant', value);
  // That's it! CSS handles the rest
}
```

---

## 📝 Typography Utilities - Simplified

### Typography Manager (Minimal JS)

```typescript
export class TypographyManager {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  // Simple attribute-based theming
  setVariant(variant: string): void {
    this.element.setAttribute('variant', variant);
  }

  // CSS custom property support
  setCustomProperty(property: string, value: string): void {
    this.element.style.setProperty(`--${property}`, value);
  }

  // Responsive typography helper
  setResponsiveScale(scale: number): void {
    this.element.style.setProperty('--typography-scale', scale.toString());
  }

  // Simple truncation toggle
  setTruncate(enabled: boolean, lines: number = 1): void {
    this.element.setAttribute('truncate', enabled ? lines.toString() : '');
  }
}
```

### CSS Does the Heavy Lifting

```css
/* Pure CSS theming - no JavaScript class management */
ui-heading {
  /* Base typography using design tokens */
  font-family: var(--ui-font-family-sans);
  color: var(--ui-color-text-primary);

  /* Default responsive scaling */
  font-size: calc(var(--ui-font-size-base) * var(--typography-scale, 1));
  line-height: var(--ui-line-height-normal);
}

/* Variant theming via attribute selectors */
ui-heading[variant='display'] {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
  font-weight: var(--ui-font-weight-bold);
  line-height: var(--ui-line-height-tight);
  letter-spacing: -0.025em;
}

ui-heading[variant='title'] {
  font-size: var(--ui-font-size-2xl);
  font-weight: var(--ui-font-weight-bold);
  line-height: var(--ui-line-height-tight);
}

ui-heading[variant='subtitle'] {
  font-size: var(--ui-font-size-lg);
  font-weight: var(--ui-font-weight-medium);
  color: var(--ui-color-text-secondary);
}

/* Semantic level styling */
ui-heading[level='1'] {
  font-size: var(--ui-font-size-2xl);
}
ui-heading[level='2'] {
  font-size: var(--ui-font-size-xl);
}
ui-heading[level='3'] {
  font-size: var(--ui-font-size-lg);
}
ui-heading[level='4'] {
  font-size: var(--ui-font-size-base);
}
ui-heading[level='5'] {
  font-size: var(--ui-font-size-sm);
}
ui-heading[level='6'] {
  font-size: var(--ui-font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Truncation via CSS */
ui-heading[truncate='1'] {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

ui-heading[truncate='2'],
ui-heading[truncate='3'],
ui-heading[truncate='4'],
ui-heading[truncate='5'] {
  display: -webkit-box;
  -webkit-line-clamp: attr(truncate number, 1);
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

---

## 🎨 Consumer Customization Examples

### Easy Custom Variants

```css
/* Consumer adds their own variants */
ui-heading[variant='hero'] {
  font-size: 5rem;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

ui-heading[variant='compact'] {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
```

### Custom Property Theming

```css
/* Consumer overrides design tokens */
:root {
  --ui-font-size-2xl: 2.5rem;
  --ui-color-text-primary: #2d3748;
  --ui-line-height-tight: 1.1;
}

/* Context-specific theming */
.dark-theme ui-heading {
  --ui-color-text-primary: #f7fafc;
}

.print-mode ui-heading {
  --ui-font-size-display: 2rem;
  color: black !important;
}
```

### Dynamic Theming

```javascript
// Consumer can dynamically theme
const heading = document.querySelector('ui-heading');
heading.style.setProperty('--typography-scale', '1.2');
heading.setAttribute('variant', 'custom-hero');
```

---

## 🔧 Simplified Component Code

### Minimal UI-Heading Implementation

```typescript
export class UIHeading extends BaseComponent {
  private _level: number = 2;
  private typographyManager: TypographyManager;

  constructor() {
    super({ tagName: 'ui-heading' });
    this.typographyManager = new TypographyManager(this);
  }

  static get observedAttributes(): string[] {
    return ['level', 'variant', 'truncate'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    switch (name) {
      case 'level':
        this._level = this.validateLevel(newValue);
        this.updateSemanticLevel();
        break;
      case 'variant':
        // CSS handles styling automatically via attribute
        this.dispatchEvent(new CustomEvent('variant-change', { detail: newValue }));
        break;
      case 'truncate':
        // CSS handles truncation automatically via attribute
        this.dispatchEvent(new CustomEvent('truncate-change', { detail: newValue }));
        break;
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  private updateSemanticLevel(): void {
    this.setAttribute('aria-level', this._level.toString());
  }

  // Simple property setters
  get level() {
    return this._level;
  }
  set level(value: number) {
    this.setAttribute('level', value.toString());
  }

  get variant() {
    return this.getAttribute('variant') || '';
  }
  set variant(value: string) {
    this.setAttribute('variant', value);
  }

  get truncate() {
    return this.getAttribute('truncate') || '';
  }
  set truncate(value: string | number) {
    this.setAttribute('truncate', value.toString());
  }
}
```

### UI-Text Implementation (Trivial)

```typescript
export class UIText extends BaseComponent {
  private typographyManager: TypographyManager;

  constructor() {
    super({ tagName: 'ui-text' });
    this.typographyManager = new TypographyManager(this);
  }

  static get observedAttributes(): string[] {
    return ['variant', 'truncate', 'as'];
  }

  // Semantic element rendering
  get as() {
    return this.getAttribute('as') || 'p';
  }
  set as(value: string) {
    this.setAttribute('as', value);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.updateSemanticElement();
  }

  private updateSemanticElement(): void {
    // Could dynamically change the tag name if needed
    // Or just use role attributes
    const semanticRole = this.getSemanticRole();
    if (semanticRole) {
      this.setAttribute('role', semanticRole);
    }
  }

  private getSemanticRole(): string | null {
    const asValue = this.as;
    if (['strong', 'em', 'code'].includes(asValue)) {
      return asValue;
    }
    return null;
  }
}
```

### UI-Button Implementation

```typescript
export class UIButton extends BaseComponent {
  private typographyManager: TypographyManager;

  constructor() {
    super({ tagName: 'ui-button' });
    this.typographyManager = new TypographyManager(this);
  }

  static get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled', 'loading'];
  }

  // Button gets same typography utilities but different base styling
  // CSS handles all the variant complexity
}
```

---

## 🎨 CSS Architecture Benefits

### 1. **Performance**

- No JavaScript class manipulation
- CSS-only theming is faster
- Reduced bundle size

### 2. **Flexibility**

- Consumers add unlimited custom variants
- No predefined variant limitations
- Easy responsive design with CSS

### 3. **Maintainability**

- Components are simpler
- Styling logic in CSS where it belongs
- Easy to debug and modify

### 4. **Developer Experience**

```css
/* Consumer can theme everything */
ui-heading[variant='my-custom'] {
  /* Their custom styles */
}

/* Or override design tokens */
:root {
  --ui-font-size-xl: 2rem;
}

/* Or target specific contexts */
.card ui-heading {
  margin-bottom: 0.5rem;
}
```

---

## 🔧 Typography Utilities Final Form

```typescript
export class TypographyUtilities {
  static setCustomProperty(element: HTMLElement, property: string, value: string): void {
    element.style.setProperty(`--${property}`, value);
  }

  static applyResponsiveScale(element: HTMLElement, scale: number): void {
    element.style.setProperty('--typography-scale', scale.toString());
  }

  static setTruncation(element: HTMLElement, lines: number): void {
    element.setAttribute('truncate', lines.toString());
  }

  static calculateReadingTime(text: string, wpm: number = 200): number {
    return Math.ceil(text.trim().split(/\s+/).length / wpm);
  }

  static getTextMetrics(element: HTMLElement) {
    const computed = getComputedStyle(element);
    return {
      fontSize: computed.fontSize,
      lineHeight: computed.lineHeight,
      fontWeight: computed.fontWeight,
    };
  }
}
```

---

## 📊 Comparison: Variants vs CSS-First

| Aspect             | JavaScript Variants            | CSS-First Approach   |
| ------------------ | ------------------------------ | -------------------- |
| **Component Code** | 200+ lines                     | 50-80 lines          |
| **Performance**    | Class manipulation overhead    | CSS-only, fast       |
| **Customization**  | Limited to predefined variants | Unlimited via CSS    |
| **Bundle Size**    | Larger (variant logic)         | Smaller (minimal JS) |
| **Theming**        | JavaScript + CSS               | Pure CSS             |
| **Debugging**      | JS + CSS complexity            | CSS-only debugging   |

---

## ✅ Recommendation

**Use CSS-first approach with minimal typography utilities** that provide:

1. **Custom property helpers** for dynamic theming
2. **Responsive scaling utilities**
3. **Text metrics calculations**
4. **Simple truncation helpers**

This gives us **maximum flexibility** with **minimal complexity**, and consumers can create unlimited variants purely through CSS without touching JavaScript.

**Should we refactor ui-heading to use this CSS-first approach?**
