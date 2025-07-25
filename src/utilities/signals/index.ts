/**
 * Signals - Reactive state management system
 * Aligned with TC39 signals proposal with additional pragmatic features
 *
 * @example
 * ```typescript
 * import { signal, computed, effect, batch } from './signals/index.js';
 *
 * // Create reactive state
 * const count = signal(0);
 * const doubled = computed(() => count.get() * 2);
 *
 * // React to changes
 * effect(() => {
 *   console.log('Count is:', count.get());
 * });
 *
 * // Update state
 * count.set(5); // logs: "Count is: 5"
 * ```
 */

import { SignalSystem } from './system.js';
import type {
  Signal,
  ComputedSignal,
  EffectCleanup,
  SignalFactory,
  SignalSystemOptions,
  ReadonlySignal,
  SignalValue,
} from './types.js';

// Re-export types for convenience
export type {
  Signal,
  ComputedSignal,
  EffectCleanup,
  SignalFactory,
  SignalSystemOptions,
  ReadonlySignal,
  SignalValue,
};

export { isSignal, isComputed } from './types.js';
export { SignalSystem } from './system.js';
export * from './integration.js';

/**
 * Create a new isolated signal system
 */
export function createSignalSystem(options?: SignalSystemOptions): SignalFactory {
  const system = new SignalSystem(options);

  return {
    signal: <T>(initialValue: T) => system.createSignal(initialValue),
    computed: <T>(fn: () => T) => system.createComputed(fn),
    effect: (fn: () => void) => system.createEffect(fn),
    batch: <T>(fn: () => T) => system.batch(fn),
    system,
  };
}

// Default global instance for convenience
const defaultSystem = createSignalSystem();

/**
 * Create a writable signal with initial value
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * count.set(5);
 * console.log(count.get()); // 5
 * ```
 */
export const signal = defaultSystem.signal;

/**
 * Create a computed signal that derives from other signals
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * const doubled = computed(() => count.get() * 2);
 * console.log(doubled.get()); // 0
 * count.set(5);
 * console.log(doubled.get()); // 10
 * ```
 */
export const computed = defaultSystem.computed;

/**
 * Create an effect that runs when dependencies change
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * const cleanup = effect(() => {
 *   console.log('Count changed:', count.get());
 * });
 *
 * count.set(5); // logs: "Count changed: 5"
 * cleanup(); // stops the effect
 * ```
 */
export const effect = defaultSystem.effect;

/**
 * Batch multiple signal updates to prevent intermediate updates
 *
 * @example
 * ```typescript
 * const a = signal(1);
 * const b = signal(2);
 * const sum = computed(() => a.get() + b.get());
 *
 * effect(() => console.log('Sum:', sum.get()));
 *
 * batch(() => {
 *   a.set(10);
 *   b.set(20);
 * }); // Only logs once: "Sum: 30"
 * ```
 */
export const batch = defaultSystem.batch;

/**
 * Access to the default system instance for advanced usage
 */
export const system = defaultSystem.system;

// Browser global support
declare global {
  interface Window {
    Signals?: {
      signal: typeof signal;
      computed: typeof computed;
      effect: typeof effect;
      batch: typeof batch;
      createSignalSystem: typeof createSignalSystem;
      SignalSystem: typeof SignalSystem;
    };
  }
}

if (typeof window !== 'undefined') {
  window.Signals = {
    signal,
    computed,
    effect,
    batch,
    createSignalSystem,
    SignalSystem,
  };
}
