# CI/CD Configuration

This directory contains the GitHub Actions workflows and configuration for automated testing, quality checks, and performance monitoring.

## Workflows

### 🔍 [ci.yml](.workflows/ci.yml) - Main CI Pipeline

**Triggers:** Push to any branch, PRs to main  
**Purpose:** Code quality validation and testing

**What it does:**

- ✅ Installs dependencies with pnpm caching
- ✅ Runs Prettier formatting check
- ✅ Runs ESLint code quality check
- ✅ Runs TypeScript compilation check
- ✅ Executes full test suite
- ✅ Validates production build
- ✅ Uploads build artifacts

**Typical runtime:** 2-3 minutes

### 📊 [performance.yml](.workflows/performance.yml) - Performance Analysis

**Triggers:** PRs to main, pushes to main  
**Purpose:** Performance regression detection and monitoring

**What it does:**

- 📈 Builds current version and analyzes bundle size
- 📊 Compares against stored baseline from main branch
- 🔍 Checks for performance regressions (>10% bundle size increase)
- 💬 Comments on PRs with performance analysis
- 📉 Fails CI if significant performance regression detected
- 🗂️ Stores performance data for trend analysis

**Typical runtime:** 1-2 minutes

## Performance Monitoring

### Bundle Size Thresholds

- **Warning:** >5% increase (comment only)
- **Failure:** >10% increase (blocks merge)
- **Celebration:** >5% decrease (positive comment)

### Baseline Strategy

- **Main branch:** Updates baseline on every merge
- **Feature branches:** Compare against main branch baseline
- **First-time runs:** Establish new baseline automatically

### Performance Artifacts

- `performance-results.json` - Current run metrics
- `bundle-analysis-current.json` - Detailed bundle breakdown
- Retained for 30 days for historical analysis

## Local Development

### Running CI Checks Locally

```bash
# Run all CI checks before pushing
pnpm format:check
pnpm lint
pnpm tsc --noEmit
pnpm test:run
pnpm build

# Or run benchmark
pnpm benchmark:baseline
```

### Performance Testing

```bash
# Build and run performance analysis
pnpm build
pnpm benchmark

# Results saved to performance-results.json
```

## Branch Protection Integration

See [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md) for setting up repository rules that integrate with these workflows.

**Required status checks:**

- `Code Quality & Tests`
- `Performance Analysis`

## Artifacts & Caching

### Build Artifacts

- **Location:** `dist/` directory
- **Retention:** 7 days
- **Usage:** Deployment, debugging, analysis

### Performance Data

- **Location:** `performance-results.json`, baseline cache
- **Retention:** 30 days
- **Usage:** Trend analysis, regression detection

### Dependency Cache

- **Tool:** pnpm store cache
- **Key:** Based on `pnpm-lock.yaml` hash
- **Benefit:** Faster CI runs (30s → 2s for dependency installation)

## Troubleshooting

### CI Workflow Failures

#### Prettier Check Fails

```bash
# Fix locally
pnpm format
git add -A && git commit -m "Fix formatting"
```

#### ESLint Fails

```bash
# Try auto-fix first
pnpm lint:fix
# Manual fixes may be required for some issues
```

#### TypeScript Errors

```bash
# Check compilation locally
pnpm tsc --noEmit
# Fix type errors in your code
```

#### Test Failures

```bash
# Run tests locally with more detail
pnpm test:run --reporter=verbose
# Or run specific test
pnpm test -- --run [test-pattern]
```

#### Build Failures

```bash
# Test build locally
pnpm build
# Check for TypeScript or bundling issues
```

### Performance Workflow Issues

#### No Baseline Found

- This is normal for first runs
- Baseline will be created automatically
- Subsequent runs will compare against it

#### Performance Regression False Positive

- Check if the increase is justified (new features)
- Review bundle analysis in artifacts
- Consider updating thresholds if needed

#### Missing jq Command

- This shouldn't happen in GitHub Actions
- For local testing, install jq: `sudo apt-get install jq`

### General Issues

#### Workflow Not Triggering

- Check branch naming matches patterns in workflow files
- Ensure `.github/workflows/` directory is in repository root
- Verify workflow YAML syntax is valid

#### Permission Errors

- Ensure GitHub Actions has appropriate permissions
- Check repository settings → Actions → General → Workflow permissions

#### Cache Issues

- Cache keys are based on file hashes
- Caches automatically expire after 7 days of inactivity
- Force cache refresh by updating pnpm-lock.yaml

## Future Enhancements

### Planned Additions

- 🔬 **Detailed Performance Benchmarking:** Component creation time, memory usage
- 📸 **Visual Regression Testing:** Component rendering consistency
- 🚀 **Deployment Pipeline:** Automated releases and NPM publishing
- 📈 **Performance Trending:** Historical performance analysis dashboard
- 🤖 **Automated Dependency Updates:** Dependabot integration with auto-merge

### Advanced Features (Later)

- **Multi-browser Testing:** Cross-browser compatibility
- **Lighthouse Integration:** Web performance metrics
- **Bundle Analyzer Dashboard:** Visual bundle composition analysis
- **Security Scanning:** Automated vulnerability detection

## Contributing

When adding or modifying workflows:

1. Test locally when possible
2. Use descriptive job and step names
3. Add appropriate error handling
4. Update this documentation
5. Consider impact on CI runtime
6. Validate YAML syntax before committing

## Monitoring

Keep an eye on:

- **CI success rates** in repository insights
- **Performance trends** in PR comments
- **Workflow runtime** - optimize if getting too slow
- **Cache hit rates** - ensure dependencies are cached effectively
