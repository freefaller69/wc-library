# Frontend Code Review Agent

This document describes the frontend code review agent available in the project for automated code quality assessment.

## Overview

The `frontend-code-reviewer` agent provides comprehensive code review for frontend changes, focusing on:

- **Build Quality**: ESLint, TypeScript, Prettier, and build validation
- **Standards Compliance**: Project patterns, accessibility, and security
- **Performance**: Memory management, optimization opportunities
- **Maintainability**: Code clarity, error handling, and documentation

## Usage

The agent should be used before merging pull requests or when implementing significant features:

```bash
# Through Claude Code interface
"Please review my recent changes with the frontend-code-reviewer agent"
```

## Review Process

1. **Build Quality Verification** (MANDATORY)
   - Validates ESLint, TypeScript, Prettier, and build status
   - Reports any blockers that must be resolved first

2. **Git Diff Analysis**
   - Examines recent changes and their impact
   - Focuses on modified code rather than entire codebase

3. **Standards Compliance Review**
   - Evaluates adherence to project patterns
   - Checks TypeScript strict mode compliance
   - Verifies component and CSS conventions

## Review Categories

- **CRITICAL**: Security, accessibility, breaking changes (must fix)
- **WARNINGS**: Performance, maintainability, pattern deviations (should fix)
- **SUGGESTIONS**: Code clarity, optimizations, best practices (nice to have)

## Integration with Workflow

The agent integrates with the existing development workflow defined in `CONTRIBUTING.md`:

- Use before creating pull requests
- Ensures code quality gates are met
- Provides consistent review standards across contributors
- Complements human code review with automated quality checks

## Benefits

- **Consistent Standards**: Applies uniform review criteria
- **Comprehensive Coverage**: Checks build, security, accessibility, and performance
- **Fast Feedback**: Immediate assessment without waiting for human reviewers
- **Educational**: Explains rationale behind recommendations

## Limitations

- **Review Only**: Does not modify code or auto-fix issues
- **Context Dependent**: May miss business logic or design decisions
- **Supplement, Not Replace**: Works best alongside human code review for complex changes

The agent was previously tested with the StyleManagerMixin implementation (before its removal in August 2025) and provided valuable feedback that improved code quality, performance, and maintainability during its lifecycle. It continues to provide valuable code review for current mixin-based components.
