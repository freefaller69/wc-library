# Branch Protection Rules Configuration

This document outlines the GitHub branch protection rules that should be applied to the repository to enforce our development workflow.

## Main Branch Protection Rules

Apply these settings to the `main` branch in your GitHub repository settings:

### General Settings

- ✅ **Require pull request reviews before merging**
  - Required approving reviews: **1**
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (optional, can be enabled later)

### Status Checks

- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**

#### Required Status Checks:

- `Code Quality & Tests` (from ci.yml workflow)
- `Performance Analysis` (from performance.yml workflow)

### Additional Restrictions

- ✅ **Require branches to be up to date before merging**
- ✅ **Include administrators** (apply rules to repository administrators)
- ❌ **Allow force pushes** (keep disabled for safety)
- ❌ **Allow deletions** (keep disabled for safety)

## How to Apply These Settings

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** or edit existing rule for `main` branch
4. Apply the settings listed above
5. Save the protection rule

## Workflow Integration

With these rules in place:

1. **All changes must go through PR process**
2. **CI checks must pass** before merging is allowed
3. **Performance analysis must pass** (no major regressions)
4. **At least 1 review required** before merge
5. **Branch must be up-to-date** with main before merge

## Testing the Setup

After applying these rules, test by:

1. Creating a test branch and PR
2. Verifying that CI checks run automatically
3. Confirming that performance analysis runs
4. Ensuring merge is blocked until all checks pass and review is provided

## Status Check Names

If you need to configure the exact status check names, they are:

- **CI Workflow**: `Code Quality & Tests`
- **Performance Workflow**: `Performance Analysis`

These names come from the `name:` fields in our GitHub Actions workflow files.

## Troubleshooting

### Status Checks Not Appearing

- Ensure workflows have run at least once on a PR
- Check that workflow files are in `.github/workflows/` directory
- Verify workflow syntax is correct

### Permission Issues

- Ensure GitHub Actions has read/write permissions in repository settings
- Check that required secrets/permissions are properly configured

### Performance Analysis Failing

- First run will establish baseline (should pass)
- Subsequent runs compare against stored baseline
- Check performance threshold settings in workflow if needed

## Future Enhancements

Consider adding later:

- **Required reviewers** for specific file paths
- **Auto-merge** for dependency updates (dependabot)
- **Draft PR support** for work-in-progress changes
- **CODEOWNERS** file for automatic reviewer assignment
