# Development Workflow

This document outlines the development workflow for the web component library, particularly during the mixin refactoring phase.

## Development Environment Setup

### Prerequisites
- Node.js (version specified in package.json)
- pnpm (package manager of choice)

### Initial Setup
```bash
# Clone and setup
git clone <repository-url>
cd web-component-library
pnpm install

# Verify setup
pnpm dev
pnpm test:run
```

## Daily Development Workflow

### 1. Start Development Session
```bash
# Pull latest changes and switch to main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/mixin-accessibility-implementation
# or
git checkout -b refactor/base-component-mixins
# or  
git checkout -b fix/button-focus-management

# Start development server (for component testing)
pnpm dev

# Run tests in watch mode (separate terminal)
pnpm test
```

### 2. Development Process

#### For New Mixins/Components
1. **Create the implementation**
   - Follow TypeScript patterns in `docs/architecture/mixin-patterns.md`
   - Use existing components as reference
   
2. **Write tests first or alongside development**
   - Individual mixin tests in `src/test/mixins/`
   - Integration tests in `src/test/integration/`
   - Follow patterns in `docs/development/testing-strategy.md`

3. **Validate implementation**
   ```bash
   # Run specific tests
   pnpm test -- --run [test-file-pattern]
   
   # Run type checking
   pnpm build
   
   # Check in browser
   pnpm dev
   ```

#### For Refactoring Existing Components
1. **Identify current functionality** (keep BaseComponent as reference)
2. **Create mixin-based equivalent** (parallel implementation)
3. **Write comparison tests** to ensure feature parity
4. **Performance benchmark** before/after

### 3. Quality Assurance

#### Before Committing
```bash
# Full test suite
pnpm test:run

# Type checking + build
pnpm build

# Preview production build
pnpm preview
```

#### Code Quality Checklist
- [ ] All tests passing
- [ ] TypeScript compilation clean
- [ ] No console errors in dev/preview
- [ ] Performance benchmarks (if applicable)
- [ ] Documentation updated

## Testing Workflow

### Test Structure
```
src/test/
├── mixins/           # Individual mixin tests
├── composites/       # Composite base class tests  
├── integration/      # Full component integration tests
├── performance/      # Performance comparison tests
└── migration/        # Migration validation tests
```

### Testing Commands
```bash
# Watch mode during development
pnpm test

# Single run (CI/validation)
pnpm test:run

# UI interface for debugging
pnpm test:ui

# Specific test pattern
pnpm test -- --run pattern-name
```

### Performance Testing
```bash
# Capture baseline metrics (before refactor)
pnpm run benchmark:baseline

# Compare current implementation
pnpm run benchmark:compare

# Generate performance report
pnpm run benchmark:report
```

## Git Workflow

### Branch Strategy
- `main` - stable, deployable code
- `feature/[feature-name]` - new features and components
- `refactor/[refactor-name]` - code refactoring tasks
- `fix/[fix-name]` - bug fixes and defect resolution
- `docs/[docs-name]` - documentation updates and improvements
- `test/[test-name]` - test-only changes and improvements
- `perf/[perf-name]` - performance optimizations
- `chore/[chore-name]` - maintenance tasks, dependency updates

### Branch Naming Conventions
```bash
# Features
git checkout -b feature/mixin-accessibility
git checkout -b feature/shadow-dom-mixin
git checkout -b feature/button-component-v2

# Refactoring
git checkout -b refactor/base-component-migration
git checkout -b refactor/test-structure-optimization

# Bug fixes
git checkout -b fix/focus-management-regression
git checkout -b fix/attribute-sync-issue

# Documentation
git checkout -b docs/mixin-usage-examples
git checkout -b docs/migration-guide-updates

# Testing
git checkout -b test/mixin-integration-coverage
git checkout -b test/performance-benchmarking

# Performance
git checkout -b perf/bundle-size-optimization
git checkout -b perf/component-creation-speed

# Maintenance
git checkout -b chore/dependency-updates
git checkout -b chore/eslint-config-update
```

### Commit Guidelines
- **feat**: new mixins, components, or major features
- **refactor**: restructuring existing code
- **test**: adding or modifying tests
- **docs**: documentation updates
- **perf**: performance improvements
- **fix**: bug fixes

### Example Commit Messages
```
feat: add AccessibilityMixin with focus management
refactor: convert ButtonComponent to use mixin composition
test: add integration tests for ShadowDOMMixin + StyleManagerMixin
docs: update mixin usage examples
perf: optimize AttributeManagerMixin caching
```

### Pull Request Workflow

#### Creating Pull Requests
```bash
# After completing feature development and testing
git add .
git commit -m "feat: implement AccessibilityMixin with focus management"
git push origin feature/mixin-accessibility

# Create PR via GitHub CLI or web interface
gh pr create --title "Implement AccessibilityMixin" --body "
## Summary
- Add AccessibilityMixin with focus management and ARIA support
- Include comprehensive test suite
- Update documentation with usage examples

## Testing
- [ ] All tests passing
- [ ] Manual testing completed
- [ ] Performance benchmarks meet targets

## Checklist
- [ ] Code follows TypeScript patterns
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes
"
```

#### Code Review Process
1. **Automated Checks**: CI runs tests, linting, and type checking
2. **Claude Code Review**: Request review from Claude for:
   - Code quality and patterns
   - Security considerations
   - Performance implications
   - Architecture adherence
   - Test coverage
3. **Address Feedback**: Make requested changes and push updates
4. **Final Approval**: Merge after all checks pass and review approved

#### Review Criteria
- [ ] **Functionality**: Code works as intended
- [ ] **Tests**: Comprehensive test coverage
- [ ] **Performance**: No regressions, meets benchmarks
- [ ] **Security**: No security vulnerabilities
- [ ] **Architecture**: Follows mixin patterns and best practices
- [ ] **Documentation**: Code is well-documented
- [ ] **Type Safety**: Full TypeScript compliance

## Documentation Workflow

### When to Update Documentation
- **New mixins**: Add to usage examples and patterns
- **API changes**: Update migration guide
- **Performance changes**: Update benchmarking results
- **Breaking changes**: Update breaking changes policy

### Documentation Review Process
1. Update relevant docs alongside code changes
2. Review docs for accuracy and completeness
3. Validate examples work with current code
4. Update CLAUDE.md if development commands change

## Release Preparation

### Pre-Release Checklist
- [ ] All tests passing
- [ ] Performance benchmarks meet targets
- [ ] Documentation up to date
- [ ] Migration guide validated
- [ ] Breaking changes documented
- [ ] Examples working

### Version Strategy
- **Major**: Breaking changes, major refactors
- **Minor**: New mixins, new composite classes
- **Patch**: Bug fixes, performance improvements

## Performance Baseline Setup

### Initial Baseline Capture
Before starting the mixin refactoring, capture performance baselines:

```bash
# Install dependencies and build
pnpm install
pnpm build

# Capture baseline metrics for current BaseComponent
pnpm run test:performance:baseline

# This will create baseline measurements for:
# - Bundle sizes for different component types
# - Component creation/destruction times  
# - Memory usage patterns
# - First paint and interaction metrics
```

### Continuous Performance Monitoring
During development, regularly compare against baseline:

```bash
# Quick performance check
pnpm run perf:check

# Full performance comparison
pnpm run perf:compare

# Generate performance report
pnpm run perf:report
```

### Performance Validation Commands
```bash
# Bundle size analysis
pnpm run analyze:bundle

# Runtime performance measurement
pnpm run measure:runtime

# Memory usage profiling  
pnpm run profile:memory

# Tree shaking effectiveness
pnpm run validate:tree-shaking
```

## Troubleshooting

### Common Issues
- **TypeScript errors**: Check mixin composition patterns
- **Test failures**: Verify jsdom compatibility (some features mocked)
- **Performance regressions**: Use benchmark tools to identify bottlenecks
- **Mixin conflicts**: Review composition order and method overrides

### Getting Help
- Check existing documentation in `docs/`
- Review similar implementations in codebase
- Test individual mixins in isolation
- Use TypeScript compiler for detailed error information

## Development Tools

### Recommended VS Code Extensions
- TypeScript and JavaScript Language Features
- Vitest (for test running)
- ESLint
- Prettier

### Useful Commands Reference
```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview build

# Testing  
pnpm test         # Watch mode
pnpm test:run     # Single run
pnpm test:ui      # UI interface

# Linting/Formatting
pnpm lint         # ESLint check
pnpm format       # Prettier format
```

---

This workflow will evolve as we progress through the mixin refactoring. Update this document when processes change or new tools are added.