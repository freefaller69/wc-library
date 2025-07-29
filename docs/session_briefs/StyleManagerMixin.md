# Claude Code Session Brief: StyleManagerMixin Only

## Current Problem

Need a StyleManagerMixin mixin that works with shadowRoot from ShadowDOMMixin OR works without it for Light DOM.

## Session Goal

Build ONLY the StyleManagerMixin mixin - no other mixins, no integration yet.

## What NOT to Change

- CoreCustomElement base class
- Mixin-composer utility
- ShadowDOMMixin (you can look, but don't touch/change)
- Any other existing code

## Required Deliverables

1. StyleManagerMixin mixin only
2. Unit tests for StyleManagerMixin only
3. Simple integration test with CoreCustomElement and ShadowDOMMixin

## Architecture Decisions

### StyleManager Creation

- adoptedStyleSheets integration
- Per-class stylesheets - One CSSStyleSheet shared across all instances of a component class (much more efficient)
- needs proper fallback for browsers without adoptedStyleSheets support

Better adoptedStyleSheets pattern - Something like:

```
class ButtonComponent extends compose(CoreCustomElement, ShadowDOMMixin, StyleManagerMixin) {
  static stylesheet = StyleManager.createStylesheet(buttonCSS);
}
```

### StyleManagerMixin Interface

```typescript
interface StyleManagerMixinInterface {
  addCSS(css: string): void;
  addStylesheet(stylesheet: CSSStyleSheet): void;
}
```

## Success Criteria

- [ ] Creates and applies adoptedStyleSheets for supported browsers
- [ ] Creates and applies `<style>` element for unsupported browsers
- [ ] Uses shadowRoot when ShadowDOMMixin
- [ ] Uses document.head as fallback when no shadowRoot
- [ ] Has comprehensive unit tests
- [ ] Works with CoreCustomElement in integration test

## Example Usage

```javascript
class TestComponent extends compose(CoreCustomElement, StyleManagerMixin) {
  constructor() {
    super();
  }
}
```

## Context to Provide Claude Code

- Current CoreCustomElement implementation
- Current ShadowDOMMixin implementation
- Mixin-composer utility
- Explanation of per-class stylesheet requirement
- Angular-style file structure preference

## Validation Steps

1. Create simple test component using both mixins
2. Verify adoptedStyleSheets works with and without shadow DOM
3. Test fallback behavior in simulated older browser
4. Ensure mixin composition order dependency is clear
5. Run all existing tests to ensure no regressions
