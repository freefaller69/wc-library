/**
 * ShadowDOMMixin - Provides Shadow DOM creation and management based on component configuration
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import type { ComponentConfig } from '../../types/component.js';

/**
 * Logging interface for configurable logging in ShadowDOMMixin
 */
interface Logger {
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

// Default logger implementation using console
const defaultLogger: Logger = {
  warn: (message: string, ...args: unknown[]) => console.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => console.error(message, ...args),
};

// Global logger configuration (can be overridden by applications)
let shadowDOMLogger: Logger = defaultLogger;

/**
 * Configure the logger used by ShadowDOMMixin
 *
 * This allows applications to control how ShadowDOMMixin logs warnings and errors.
 * Useful for production environments where you may want to silence warnings
 * or route errors to a specific logging service.
 *
 * @param logger - Custom logger implementation with warn and error methods
 *
 * @example Disable logging in production
 * ```typescript
 * configureShadowDOMLogger({
 *   warn: () => {}, // Silent
 *   error: () => {} // Silent
 * });
 * ```
 *
 * @example Route to custom logging service
 * ```typescript
 * configureShadowDOMLogger({
 *   warn: (msg, ...args) => myLogger.warn('ShadowDOM', msg, ...args),
 *   error: (msg, ...args) => myLogger.error('ShadowDOM', msg, ...args)
 * });
 * ```
 */
export function configureShadowDOMLogger(logger: Logger): void {
  shadowDOMLogger = logger;
}

// Base type that ShadowDOMMixin expects to work with
type ShadowDOMBase = HTMLElement & {
  config: ComponentConfig;
  connectedCallback?(): void;
};

// Mixin interface that defines Shadow DOM features
export interface ShadowDOMMixinInterface {
  shadowRoot: ShadowRoot | null;
  hasShadowDOM(): this is { shadowRoot: ShadowRoot };
  shadowDOMCreated: boolean;
}

/**
 * Shadow DOM mixin that creates shadowRoot based on component configuration
 *
 * This mixin automatically creates a Shadow DOM when the component is connected to the DOM.
 * It provides type-safe access to the shadowRoot and includes comprehensive error handling
 * with configurable logging.
 *
 * ## Features:
 * - Automatic Shadow DOM creation based on component configuration
 * - Type guard method for safe shadowRoot access
 * - Configurable logging system for library integration
 * - Development-mode debugging helpers
 * - Comprehensive error handling with detailed messages
 * - Configuration validation for shadowOptions
 *
 * ## Browser Compatibility:
 * Requires Shadow DOM support (Chrome 53+, Firefox 63+, Safari 10+)
 * For older browsers, consider using a Shadow DOM polyfill
 *
 * ## Performance Notes:
 * - Shadow DOM creation is deferred until connectedCallback
 * - Duplicate creation attempts are safely ignored
 * - No performance overhead when shadow DOM creation fails
 *
 * @example Basic usage
 * ```typescript
 * class MyComponent extends compose(CoreCustomElement, ShadowDOMMixin) {
 *   constructor() {
 *     super({
 *       tagName: 'my-component',
 *       shadowOptions: { mode: 'open' }
 *     });
 *   }
 * }
 * ```
 *
 * @example Safe shadowRoot access
 * ```typescript
 * connectedCallback() {
 *   super.connectedCallback();
 *   if (this.hasShadowDOM()) {
 *     // TypeScript knows this.shadowRoot is non-null here
 *     this.shadowRoot.innerHTML = '<p>Content</p>';
 *   } else {
 *     // Fallback for cases where shadow DOM creation failed
 *     this.innerHTML = '<p>Content</p>';
 *   }
 * }
 * ```
 *
 * @example Custom logging configuration
 * ```typescript
 * import { configureShadowDOMLogger } from './ShadowDOMMixin';
 *
 * // Configure custom logger (e.g., for production silence)
 * configureShadowDOMLogger({
 *   warn: () => {}, // Silent in production
 *   error: (msg, ...args) => console.error('[ShadowDOM]', msg, ...args)
 * });
 * ```
 */
export function ShadowDOMMixin<TBase extends Constructor<ShadowDOMBase>>(
  Base: TBase
): TBase & Constructor<ShadowDOMMixinInterface> {
  abstract class ShadowDOMMixin extends Base implements ShadowDOMMixinInterface {
    declare shadowRoot: ShadowRoot | null;
    public shadowDOMCreated = false;

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
    }

    /**
     * Type guard to safely check if shadow DOM was successfully created
     * @returns true if shadowRoot exists and is accessible
     *
     * @example
     * ```typescript
     * if (this.hasShadowDOM()) {
     *   // TypeScript now knows this.shadowRoot is non-null
     *   this.shadowRoot.appendChild(element);
     * }
     * ```
     */
    hasShadowDOM(): this is { shadowRoot: ShadowRoot } {
      return this.shadowRoot !== null && this.shadowDOMCreated;
    }

    /**
     * Component lifecycle - called when element is connected to DOM
     * Creates shadowRoot when mixin is used
     */
    connectedCallback(): void {
      super.connectedCallback?.();
      this.setupShadowDOM();
    }

    /**
     * Sets up Shadow DOM - always creates shadow root when mixin is used
     * Includes comprehensive error handling and configuration validation
     */
    private setupShadowDOM(): void {
      // Prevent multiple calls to attachShadow
      if (this.shadowRoot) {
        shadowDOMLogger.warn(
          `ShadowDOMMixin: Shadow DOM already exists for component ${this.config.tagName}. Ignoring duplicate setup.`
        );
        return;
      }

      try {
        const options = this.config.shadowOptions || { mode: 'open' };

        // Validate shadow options before creation
        this.validateShadowOptions(options);

        this.attachShadow(options);
        this.shadowDOMCreated = true;

        // Add development-mode debugging helpers in development
        this.addDebugInfo(options);
      } catch (error) {
        const errorMessage = this.getDetailedErrorMessage(error);
        shadowDOMLogger.error(
          `ShadowDOMMixin: Failed to create shadow DOM for component ${this.config.tagName}: ${errorMessage}`,
          error
        );
        // Don't rethrow - allow component to continue functioning without shadow DOM
        // Components can check hasShadowDOM() to adapt behavior
      }
    }

    /**
     * Validates shadow DOM options to catch common configuration errors
     */
    private validateShadowOptions(options: ShadowRootInit): void {
      if (options.mode && !['open', 'closed'].includes(options.mode)) {
        shadowDOMLogger.warn(
          `ShadowDOMMixin: Invalid shadow DOM mode '${options.mode}' for ${this.config.tagName}. Using 'open' instead.`
        );
        options.mode = 'open';
      }
    }

    /**
     * Provides detailed error messages with context and recovery guidance
     */
    private getDetailedErrorMessage(error: unknown): string {
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotSupportedError':
            return 'Shadow DOM is not supported by this browser or element type. Consider using a polyfill or graceful degradation.';
          case 'InvalidStateError':
            return 'Element already has a shadow root attached. Check if the mixin is being applied multiple times.';
          default:
            return `DOM Exception (${error.name}): ${error.message}`;
        }
      }

      if (error instanceof Error) {
        return error.message;
      }

      return 'Unknown error occurred during shadow DOM creation';
    }

    /**
     * Adds debugging information in development mode
     */
    private addDebugInfo(options: ShadowRootInit): void {
      if (this.shadowRoot) {
        // Add debugging attributes that can be inspected in dev tools
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (this as any).__shadowDOMMixinDebug = {
          createdAt: Date.now(),
          options: { ...options },
          mode: this.shadowRoot.mode,
          delegatesFocus: this.shadowRoot.delegatesFocus,
          componentName: this.config.tagName,
        };
      }
    }
  }

  return ShadowDOMMixin;
}
