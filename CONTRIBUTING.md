# Contributing Guidelines

Welcome to the web component library project! This document outlines our development practices and contribution workflow.

## Pull Request Philosophy

We believe in **small, focused pull requests** that:

- Address **one specific issue or feature** at a time
- Are **easy to review** (typically under 400 lines of changes)
- **Don't break existing functionality**
- Have **clear, descriptive titles** and descriptions
- **Pass all CI checks** before requesting review

### Why Small PRs?

- **Faster reviews**: Reviewers can quickly understand and approve changes
- **Easier debugging**: When issues arise, it's simpler to identify the cause
- **Reduced conflicts**: Smaller changes have less chance of conflicting with other work
- **Better quality**: Focused changes are easier to test thoroughly
- **Incremental progress**: Clear milestones and easier rollback if needed

## Development Workflow

### 1. Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `refactor/` - Code restructuring without behavior changes
- `docs/` - Documentation updates
- `test/` - Test additions or improvements
- `chore/` - Maintenance tasks, dependencies, tooling

**Examples:**

```
feature/aria-mixin-implementation
fix/component-lifecycle-memory-leak
refactor/extract-accessibility-helpers
docs/mixin-usage-examples
```

### 2. Before Creating a PR

Run these checks locally to ensure CI will pass:

```bash
# Format code
pnpm format

# Run linting
pnpm lint

# Type checking
pnpm tsc --noEmit

# Run tests
pnpm test:run

# Build project
pnpm build

# Performance benchmark (optional)
pnpm benchmark:baseline
```

### 3. PR Requirements

All pull requests must:

- [ ] **Target the correct base branch** (usually `main`)
- [ ] **Pass all CI checks** (formatting, linting, tests, build)
- [ ] **Pass performance analysis** (no significant regressions)
- [ ] **Include clear description** of what changed and why
- [ ] **Reference related issues** when applicable
- [ ] **Have a meaningful title** that summarizes the change

### 4. PR Template

When creating a PR, include:

```markdown
## Summary

Brief description of what this PR accomplishes.

## Changes

- List of specific changes made
- Focus on the "what" and "why"

## Testing

- [ ] Local tests pass
- [ ] Manual testing completed (if applicable)
- [ ] Performance impact verified

## Related Issues

Closes #123
```

## Code Quality Standards

### TypeScript

- Use **strict mode** (already configured)
- Prefer **explicit types** over `any`
- Use **meaningful variable and function names**
- Add **JSDoc comments** for public APIs

### Component Design

- Follow the **established base component patterns**
- Use **mixins for cross-cutting concerns**
- Implement **proper accessibility** (ARIA attributes, keyboard navigation)
- Follow **CSS custom property conventions** for theming

### Testing

- Write **unit tests** for all new functionality
- Include **accessibility tests** for UI components
- Use **descriptive test names** that explain the behavior
- Mock external dependencies appropriately

## Review Process

### For Authors

1. **Self-review** your changes before requesting review
2. **Respond promptly** to review feedback
3. **Keep discussions constructive** and focused on the code
4. **Update the PR** rather than creating new ones for feedback

### For Reviewers

1. **Review within 24 hours** when possible
2. **Focus on correctness, readability, and maintainability**
3. **Provide specific, actionable feedback**
4. **Approve once satisfied** with the changes

## Performance Considerations

Our CI includes performance monitoring that:

- **Tracks bundle size** changes
- **Flags regressions** > 10% increase
- **Celebrates improvements** > 5% decrease
- **Maintains baselines** for comparison

Consider performance impact when:

- Adding new dependencies
- Implementing complex algorithms
- Modifying build configuration
- Creating large components

## Common Patterns

### Breaking Down Large Changes

Instead of one large PR, consider:

```bash
# Split into focused commits/PRs
1. Refactor existing component base classes
2. Add new mixin interfaces and types
3. Implement specific mixin (e.g., AccessibilityMixin)
4. Update components to use new mixin
5. Add tests and documentation
```

### Dependency Updates

- **Security updates**: Immediate, focused PRs
- **Minor updates**: Batch related dependencies
- **Major updates**: Individual PRs with thorough testing

## Getting Help

- **Questions**: Open a discussion or ask in PR comments
- **Issues**: Create detailed bug reports with reproduction steps
- **Ideas**: Propose features through issues before implementation

## Enforcement

These guidelines are enforced through:

- **Automated CI checks** (formatting, linting, tests, build)
- **Branch protection rules** (required reviews, up-to-date branches)
- **Performance monitoring** (regression detection)
- **Code review process** (human verification)

Remember: The goal is **sustainable, high-quality code** that's easy to understand, maintain, and extend. Small, focused PRs are a key part of achieving this goal.
