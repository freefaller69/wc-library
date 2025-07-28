# Claude Code Session Brief: ShadowDOMMixin Only

## Current Problem

Need a ShadowDOMMixin mixin that creates shadowRoot based on component configuration.

## Session Goal

Build ONLY the ShadowDOMMixin mixin - no other mixins, no integration yet.

## What NOT to Change

- CoreCustomElement base class
- Mixin-composer utility
- StyleManagerMixin (don't even look at it)
- Any other existing code

## Required Deliverables

1. ShadowDOMMixin mixin only
2. Unit tests for ShadowDOMMixin only
3. Simple integration test with CoreCustomElement only

## Architecture Decisions

### Configuration Approach

```javascript
const config = {
  tagName: 'my-button',
  useShadowDOM: true, // boolean flag
  shadowOptions: {
    // optional ShadowRootInit
    mode: 'open',
    delegatesFocus: true,
  },
};
```

### ShadowDOM Creation

- Check config.useShadowDOM in connectedCallback
- Create shadowRoot if true, skip if false (light DOM)
- Use config.shadowOptions or sensible defaults
- Expose shadowRoot property for other mixins

### ShadowDOMMixin Interface

```typescript
interface ShadowDOMMixinInterface {
  shadowRoot: ShadowRoot | null;
  hasShadowDOM: boolean;
}
```

## Success Criteria

- [ ] Creates shadowRoot when config.useShadowDOM is true
- [ ] Skips creation when config.useShadowDOM is false
- [ ] Uses custom shadowOptions when provided
- [ ] Exposes shadowRoot property
- [ ] Has comprehensive unit tests
- [ ] Works with CoreCustomElement in integration test

## Example Usage

```javascript
class TestComponent extends compose(CoreCustomElement, ShadowDOMMixin) {
  constructor() {
    super({
      tagName: 'test-component',
      useShadowDOM: true,
      shadowOptions: { mode: 'open' },
    });
  }
}
```

## Context to Provide Claude Code

- Current CoreCustomElement implementation
- Current StyleManagerMixin implementation
- Mixin-composer utility
- Explanation of per-class stylesheet requirement
- Angular-style file structure preference

## Validation Steps

1. Create simple test component using both mixins
2. Verify shadowRoot exists and adoptedStyleSheets works
3. Test fallback behavior in simulated older browser
4. Ensure mixin composition order dependency is clear
5. Run all existing tests to ensure no regressions
