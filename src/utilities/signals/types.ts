/**
 * TypeScript interfaces for the signals system
 * Aligned with TC39 signals proposal with additional pragmatic features
 */

/**
 * Base signal interface - readonly access
 */
export interface ReadonlySignal<T> {
  /** Get the current value (reactive - creates dependency) */
  get(): T;
  /** Get the current value without creating dependency */
  peek(): T;
  /** Cleanup resources */
  destroy(): void;
  /** Internal marker for type checking */
  readonly _isSignal: true;
  /** Internal subscribers set */
  readonly _subscribers: Set<Computation | (() => void)>;
}

/**
 * Writable signal interface - extends readonly with setter
 */
export interface Signal<T> extends ReadonlySignal<T> {
  /** Set a new value */
  set(value: T): void;
}

/**
 * Computed signal interface - readonly derived state
 */
export interface ComputedSignal<T> extends ReadonlySignal<T> {
  /** Internal method to recompute value */
  computeValue(): void;
  /** Internal marker for type checking */
  readonly _isComputed: true;
}

/**
 * Effect cleanup function
 */
export type EffectCleanup = () => void;

/**
 * Computation context for dependency tracking
 */
export interface Computation {
  /** Set of signals this computation depends on */
  dependencies: Set<ReadonlySignal<any>>;
  /** Function to call when dependencies change */
  invalidate: () => void;
}

/**
 * Signal system configuration options
 */
export interface SignalSystemOptions {
  /** Enable debug mode for additional logging */
  debug?: boolean;
  /** Custom error handler for signal computations */
  onError?: (error: Error, context: string) => void;
}

/**
 * Main signal system interface
 */
export interface ISignalSystem {
  /** Create a writable signal */
  createSignal<T>(initialValue: T): Signal<T>;
  /** Create a computed signal */
  createComputed<T>(fn: () => T): ComputedSignal<T>;
  /** Create an effect */
  createEffect(fn: () => void): EffectCleanup;
  /** Batch multiple signal updates */
  batch<T>(fn: () => T): T;
  /** Schedule updates for subscribers */
  scheduleUpdate(subscribers: Set<Computation | (() => void)>): void;
  /** Flush all pending updates */
  flushUpdates(): void;
  /** Execute function safely with error handling */
  safeExecute<T>(fn: () => T): T;
  /** Detect circular dependencies */
  detectCycle(): void;
}

/**
 * Factory function return type
 */
export interface SignalFactory {
  signal: <T>(initialValue: T) => Signal<T>;
  computed: <T>(fn: () => T) => ComputedSignal<T>;
  effect: (fn: () => void) => EffectCleanup;
  batch: <T>(fn: () => T) => T;
  system: ISignalSystem;
}

/**
 * Type guards for signal identification
 */
export const isSignal = <T>(value: any): value is ReadonlySignal<T> => {
  return value && typeof value === 'object' && value._isSignal === true;
};

export const isComputed = <T>(value: any): value is ComputedSignal<T> => {
  return value && typeof value === 'object' && value._isComputed === true;
};

/**
 * Utility type for extracting signal value type
 */
export type SignalValue<T> = T extends ReadonlySignal<infer U> ? U : never;
