/**
 * DynamicStylesMixin - Runtime CSS generation and theme-aware dynamic styling
 *
 * This mixin provides runtime CSS generation capabilities that complement static stylesheets.
 * It enables components to generate CSS dynamically based on state, props, or theme values
 * while maintaining performance through intelligent caching and minimal DOM updates.
 *
 * Usage:
 * ```typescript
 * export class MyComponent extends compose(
 *   CoreCustomElement,
 *   StaticStylesheetMixin,
 *   DynamicStylesMixin
 * ) {
 *   static stylesheet = createStyleSheet(baseCSS);
 *
 *   generateDynamicCSS() {
 *     return `
 *       :host {
 *         --dynamic-color: ${this.color || 'blue'};
 *         --dynamic-size: ${this.size || '1rem'};
 *       }
 *     `;
 *   }
 * }
 * ```
 */

import type { Constructor } from '../utilities/mixin-composer.js';
import { AdoptedStyleSheetsManager, createStyleSheet } from '../../utilities/style-helpers.js';

// Base type that DynamicStylesMixin expects to work with
type DynamicStylesBase = {
  isConnected?: boolean;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
};

/**
 * Interface for components that support dynamic styles
 */
export interface DynamicStylesMixinInterface {
  /**
   * Gets the dynamic styles manager for this component instance
   */
  getDynamicStylesManager(): AdoptedStyleSheetsManager;

  /**
   * Generates dynamic CSS based on current component state
   * Override this method to provide custom dynamic styling logic
   */
  generateDynamicCSS(): string;

  /**
   * Updates dynamic styles by regenerating CSS and applying changes
   * Call this when component state changes that affects styling
   */
  updateDynamicStyles(): void;

  /**
   * Removes all dynamic styles from the component
   * Called automatically during disconnectedCallback
   */
  removeDynamicStyles(): void;

  /**
   * Invalidates the dynamic styles cache
   * Useful when theme or global state changes
   */
  invalidateDynamicStyles(): void;

  /**
   * Performs the actual dynamic style update
   * @internal - exposed for testing
   */
  performDynamicStyleUpdate(): void;
}

/**
 * Interface for theme-aware components
 */
export interface ThemeAwareComponent {
  /**
   * Current theme object (optional)
   */
  theme?: Record<string, unknown>;

  /**
   * Theme change handler (optional)
   */
  onThemeChange?(newTheme: Record<string, unknown>): void;
}

/**
 * Configuration options for dynamic styles
 */
export interface DynamicStylesConfig {
  /**
   * Enable caching of generated CSS (default: true)
   */
  enableCache?: boolean;

  /**
   * Debounce delay for style updates in milliseconds (default: 16ms)
   * Must be a positive number
   */
  debounceDelay?: number;

  /**
   * Automatically update styles on attribute changes (default: true)
   */
  autoUpdateOnAttributeChange?: boolean;

  /**
   * CSS variable prefix for generated variables (default: '--dynamic')
   * Must be a valid CSS custom property prefix
   */
  cssVariablePrefix?: string;
}

/**
 * Constructor options for components using DynamicStylesMixin
 */
export interface DynamicStylesConstructorOptions {
  dynamicStyles?: Partial<DynamicStylesConfig>;
}

/**
 * DynamicStylesMixin - Provides runtime CSS generation and theme-aware styling
 *
 * Features:
 * - Runtime CSS generation based on component state, props, or theme
 * - Intelligent caching to prevent unnecessary CSS regeneration
 * - Debounced updates to optimize performance during rapid state changes
 * - Theme integration with automatic invalidation on theme changes
 * - Seamless integration with static stylesheets from StaticStylesheetMixin
 * - Automatic cleanup and memory management
 *
 * @param Base - The base class to extend
 * @returns Extended class with dynamic styling functionality
 */
export function DynamicStylesMixin<TBase extends Constructor<DynamicStylesBase>>(
  Base: TBase
): TBase & Constructor<DynamicStylesMixinInterface> {
  abstract class DynamicStylesMixin extends Base implements DynamicStylesMixinInterface {
    private dynamicStylesManager: AdoptedStyleSheetsManager | null = null;
    private currentDynamicStylesheet: CSSStyleSheet | null = null;
    private lastGeneratedCSS = '';
    private updateDebounceTimer: number | null = null;
    private pendingRAFCallback: number | null = null;

    // Configuration with sensible defaults
    private readonly config: Required<DynamicStylesConfig> = {
      enableCache: true,
      debounceDelay: 16, // One frame at 60fps
      autoUpdateOnAttributeChange: true,
      cssVariablePrefix: '--dynamic',
    };

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      // Initialize configuration from constructor options if provided
      const options = args[0] as DynamicStylesConstructorOptions | undefined;
      if (options?.dynamicStyles) {
        this.applyConfiguration(options.dynamicStyles);
      }
    }

    /**
     * Applies and validates configuration options
     * @param userConfig - User-provided configuration
     * @private
     */
    private applyConfiguration(userConfig: Partial<DynamicStylesConfig>): void {
      // Validate and apply configuration with proper error handling
      const validatedConfig: Partial<Required<DynamicStylesConfig>> = {};

      if (userConfig.enableCache !== undefined) {
        validatedConfig.enableCache = Boolean(userConfig.enableCache);
      }

      if (userConfig.debounceDelay !== undefined) {
        if (typeof userConfig.debounceDelay === 'number' && userConfig.debounceDelay > 0) {
          validatedConfig.debounceDelay = userConfig.debounceDelay;
        } else {
          console.warn(
            `DynamicStylesMixin: Invalid debounceDelay (${userConfig.debounceDelay}). Must be a positive number. Using default: ${this.config.debounceDelay}ms`
          );
        }
      }

      if (userConfig.autoUpdateOnAttributeChange !== undefined) {
        validatedConfig.autoUpdateOnAttributeChange = Boolean(
          userConfig.autoUpdateOnAttributeChange
        );
      }

      if (userConfig.cssVariablePrefix !== undefined) {
        if (
          typeof userConfig.cssVariablePrefix === 'string' &&
          userConfig.cssVariablePrefix.startsWith('--')
        ) {
          validatedConfig.cssVariablePrefix = userConfig.cssVariablePrefix;
        } else {
          console.warn(
            `DynamicStylesMixin: Invalid cssVariablePrefix (${userConfig.cssVariablePrefix}). Must be a string starting with '--'. Using default: ${this.config.cssVariablePrefix}`
          );
        }
      }

      // Apply validated configuration
      Object.assign(this.config, validatedConfig);
    }

    /**
     * Gets or creates the dynamic styles manager for this component
     * @returns AdoptedStyleSheetsManager instance
     */
    getDynamicStylesManager(): AdoptedStyleSheetsManager {
      if (!this.dynamicStylesManager) {
        this.dynamicStylesManager = new AdoptedStyleSheetsManager();
      }
      return this.dynamicStylesManager;
    }

    /**
     * Generates dynamic CSS based on current component state
     * Default implementation returns empty string - override in components
     * @returns CSS string to be applied dynamically
     */
    generateDynamicCSS(): string {
      // Default implementation - components should override this
      return '';
    }

    /**
     * Updates dynamic styles by regenerating CSS and applying changes
     * Includes intelligent caching and debouncing for performance
     * Uses requestAnimationFrame for optimal rendering performance
     */
    updateDynamicStyles(): void {
      // Clear any pending updates
      if (this.updateDebounceTimer !== null) {
        clearTimeout(this.updateDebounceTimer);
        this.updateDebounceTimer = null;
      }
      if (this.pendingRAFCallback !== null) {
        window.cancelAnimationFrame(this.pendingRAFCallback);
        this.pendingRAFCallback = null;
      }

      // Debounce updates to prevent excessive DOM manipulation
      this.updateDebounceTimer = window.setTimeout(() => {
        // Use requestAnimationFrame for optimal rendering performance
        this.pendingRAFCallback = window.requestAnimationFrame(() => {
          this.performDynamicStyleUpdate();
          this.updateDebounceTimer = null;
          this.pendingRAFCallback = null;
        });
      }, this.config.debounceDelay);
    }

    /**
     * Performs the actual dynamic style update
     * @internal - exposed for testing
     */
    performDynamicStyleUpdate(): void {
      try {
        const newCSS = this.generateDynamicCSS();

        // Cache check - avoid regenerating identical CSS
        if (this.config.enableCache && newCSS === this.lastGeneratedCSS) {
          return;
        }

        this.lastGeneratedCSS = newCSS;

        // Remove old dynamic stylesheet if exists
        if (this.currentDynamicStylesheet) {
          this.getDynamicStylesManager().removeStylesheet(this.currentDynamicStylesheet);
          this.currentDynamicStylesheet = null;
        }

        // Add new dynamic stylesheet if we have CSS to apply
        if (newCSS.trim()) {
          this.currentDynamicStylesheet = createStyleSheet(newCSS);
          this.getDynamicStylesManager().addStylesheet(this.currentDynamicStylesheet);

          // Apply to the component's style target
          const target = this.getStyleTarget();
          if (target) {
            this.getDynamicStylesManager().applyTo(target);
          }
        }
      } catch (error) {
        const componentInfo = this.getComponentDebugInfo();
        console.warn(
          `DynamicStylesMixin: Failed to update dynamic styles for ${componentInfo}:`,
          error,
          {
            config: this.config,
            lastGeneratedCSS: this.lastGeneratedCSS,
            hasCurrentStylesheet: !!this.currentDynamicStylesheet,
          }
        );
        // Graceful degradation - continue component operation
      }
    }

    /**
     * Removes all dynamic styles from the component
     */
    removeDynamicStyles(): void {
      try {
        // Clear any pending updates
        if (this.updateDebounceTimer !== null) {
          clearTimeout(this.updateDebounceTimer);
          this.updateDebounceTimer = null;
        }
        if (this.pendingRAFCallback !== null) {
          window.cancelAnimationFrame(this.pendingRAFCallback);
          this.pendingRAFCallback = null;
        }

        if (this.dynamicStylesManager) {
          const target = this.getStyleTarget();
          if (target) {
            this.dynamicStylesManager.removeFrom(target);
          }
          this.dynamicStylesManager.clear();
        }

        // Reset state
        this.currentDynamicStylesheet = null;
        this.lastGeneratedCSS = '';
      } catch (error) {
        const componentInfo = this.getComponentDebugInfo();
        console.warn(
          `DynamicStylesMixin: Failed to remove dynamic styles for ${componentInfo}:`,
          error,
          {
            config: this.config,
            hadStylesManager: !!this.dynamicStylesManager,
            hadCurrentStylesheet: !!this.currentDynamicStylesheet,
          }
        );
        // Continue cleanup even if removal fails
      }
    }

    /**
     * Invalidates the dynamic styles cache, forcing regeneration on next update
     */
    invalidateDynamicStyles(): void {
      this.lastGeneratedCSS = '';
      this.updateDynamicStyles();
    }

    /**
     * Gets debugging information about the component instance
     * @returns String with component information for debugging
     * @private
     */
    private getComponentDebugInfo(): string {
      const constructorName = this.constructor.name;
      const elementTagName =
        'tagName' in this ? (this as unknown as { tagName: string }).tagName : 'Unknown';
      const isConnected = this.isConnected ? 'connected' : 'disconnected';
      const shadowInfo =
        this.getStyleTarget() instanceof ShadowRoot ? ' (Shadow DOM)' : ' (Light DOM)';

      return `${constructorName}(${elementTagName}) [${isConnected}]${shadowInfo}`;
    }

    /**
     * Determines the target for stylesheet application
     * @returns ShadowRoot, Document, or null if no suitable target
     * @private
     */
    private getStyleTarget(): ShadowRoot | Document | null {
      // Priority 1: Shadow DOM if available (with type-safe check)
      if (this.hasShadowRoot()) {
        const shadowRootHost = this as unknown as { shadowRoot: ShadowRoot };
        return shadowRootHost.shadowRoot;
      }

      // Priority 2: Document for light DOM scenarios
      return document;
    }

    /**
     * Type-safe check for shadow DOM availability
     * @returns true if this component has an accessible shadowRoot
     * @private
     */
    private hasShadowRoot(): this is this & { shadowRoot: ShadowRoot } {
      return (
        'shadowRoot' in this &&
        this.shadowRoot !== null &&
        this.shadowRoot !== undefined &&
        typeof this.shadowRoot === 'object' &&
        'adoptedStyleSheets' in this.shadowRoot
      );
    }

    /**
     * Enhanced connectedCallback that initializes dynamic styles
     */
    connectedCallback(): void {
      // Call parent implementation first
      super.connectedCallback?.();

      // Initialize dynamic styles after component is connected
      this.updateDynamicStyles();
    }

    /**
     * Enhanced disconnectedCallback that removes dynamic styles
     */
    disconnectedCallback(): void {
      // Remove dynamic styles before component is disconnected
      this.removeDynamicStyles();

      // Call parent implementation last
      super.disconnectedCallback?.();
    }

    /**
     * Enhanced attributeChangedCallback that updates dynamic styles on attribute changes
     */
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      // Call parent implementation first
      super.attributeChangedCallback?.(name, oldValue, newValue);

      // Auto-update dynamic styles if enabled and values changed
      if (this.config.autoUpdateOnAttributeChange && oldValue !== newValue && this.isConnected) {
        this.updateDynamicStyles();
      }
    }

    /**
     * Helper method to create CSS custom properties from object
     * @param properties - Object with property names and values
     * @param prefix - Custom prefix (optional, uses config default)
     * @returns CSS string with custom properties
     */
    protected createCSSProperties(
      properties: Record<string, string | number | null | undefined>,
      prefix?: string
    ): string {
      const actualPrefix = prefix || this.config.cssVariablePrefix;

      return Object.entries(properties)
        .filter(([, value]) => value != null)
        .map(([key, value]) => {
          const propName = key.startsWith('--') ? key : `${actualPrefix}-${key}`;
          return `  ${propName}: ${value};`;
        })
        .join('\n');
    }

    /**
     * Helper method to wrap CSS in :host selector
     * @param css - CSS content to wrap
     * @returns CSS wrapped in :host selector
     */
    protected wrapInHostSelector(css: string): string {
      if (!css.trim()) return '';

      return `:host {\n${css}\n}`;
    }
  }

  return DynamicStylesMixin as TBase & Constructor<DynamicStylesMixinInterface>;
}
