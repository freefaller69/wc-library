# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` or `npm run dev` - starts Vite development server
- **Build**: `pnpm build` or `npm run build` - runs TypeScript compilation followed by Vite build
- **Preview**: `pnpm preview` or `npm run preview` - previews the production build locally

## Architecture

This is a Vite-based TypeScript web component library project with the following structure:

- **Build Tool**: Vite 7.x with TypeScript 5.8.x
- **Module System**: ESNext modules with bundler resolution
- **TypeScript Configuration**: Strict mode enabled with comprehensive linting rules
- **Entry Point**: `src/main.ts` renders content into `#app` div in `index.html`
- **Component Pattern**: Functions that accept DOM elements and attach event listeners (see `setupCounter` in `counter.ts`)

## Key Files

- `src/main.ts` - Main application entry point, handles DOM manipulation and component setup
- `src/counter.ts` - Example component demonstrating the function-based pattern for web components
- `src/style.css` - Global styles with CSS custom properties and dark/light mode support
- `tsconfig.json` - Strict TypeScript configuration with modern ES2022 target

## Testing

- **Test Framework**: Vitest with jsdom environment for DOM testing
- **Test Commands**: 
  - `pnpm test` - Run tests in watch mode
  - `pnpm test:run` - Run tests once
  - `pnpm test:ui` - Run tests with UI interface
- **Test Structure**: Tests located in `src/test/` directory
- **Note**: Some tests use simplified mocks due to JSDOM limitations with custom elements

## Development Notes

- Uses pnpm for package management (lock file present)
- ESLint configured with TypeScript rules and Prettier integration
- Prettier configured for consistent code formatting
- CSS uses CSS custom properties and prefers-color-scheme media queries for theming
- Components use explicit registration system rather than auto-registration
- Individual component exports enable tree-shaking optimization