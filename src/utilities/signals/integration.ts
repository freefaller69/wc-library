/**
 * Integration utilities for web components and signals
 * Provides helpers for bridging signals with BaseComponent lifecycle
 */

import type { Signal, ComputedSignal, EffectCleanup } from './types.js';
import { signal, computed, effect } from './index.js';

/**
 * Signal-aware attribute management for BaseComponent
 * Bridges HTML attributes to reactive signals
 */
export class SignalAttribute<T = string> {
  private _signal: Signal<T | null>;
  private _element: HTMLElement;
  private _attributeName: string;
  private _transform?: (value: string | null) => T | null;

  constructor(
    element: HTMLElement,
    attributeName: string,
    initialValue: T | null = null,
    transform?: (value: string | null) => T | null
  ) {
    this._element = element;
    this._attributeName = attributeName;
    this._transform = transform;
    this._signal = signal(initialValue);

    // Initialize with current attribute value
    const currentValue = element.getAttribute(attributeName);
    if (currentValue !== null) {
      this.set(this._transform ? this._transform(currentValue) : (currentValue as T));
    }
  }

  /**
   * Get the reactive signal
   */
  get signal(): Signal<T | null> {
    return this._signal;
  }

  /**
   * Get current value (reactive)
   */
  get(): T | null {
    return this._signal.get();
  }

  /**
   * Set value and update DOM attribute
   */
  set(value: T | null): void {
    this._signal.set(value);

    if (value === null || value === undefined) {
      this._element.removeAttribute(this._attributeName);
    } else {
      this._element.setAttribute(this._attributeName, String(value));
    }
  }

  /**
   * Update signal from attribute change (called from attributeChangedCallback)
   */
  updateFromAttribute(value: string | null): void {
    const transformedValue = this._transform ? this._transform(value) : (value as T);
    this._signal.set(transformedValue);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this._signal.destroy();
  }
}

/**
 * Boolean signal attribute helper
 */
export class BooleanSignalAttribute extends SignalAttribute<boolean> {
  constructor(element: HTMLElement, attributeName: string, initialValue = false) {
    super(element, attributeName, initialValue, (value) => value !== null && value !== 'false');
  }
}

/**
 * Number signal attribute helper
 */
export class NumberSignalAttribute extends SignalAttribute<number> {
  constructor(element: HTMLElement, attributeName: string, initialValue = 0) {
    super(element, attributeName, initialValue, (value) => {
      if (value === null) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    });
  }
}

/**
 * Component integration mixin for signals support
 * Provides lifecycle management for effects and cleanup
 */
export interface SignalComponentMixin {
  _signalEffects: Set<EffectCleanup>;
  _signalAttributes: Map<string, SignalAttribute<any>>;

  /**
   * Register an effect for automatic cleanup
   */
  addEffect(effectFn: () => void): EffectCleanup;

  /**
   * Create a signal attribute that syncs with DOM
   */
  createSignalAttribute<T>(
    attributeName: string,
    initialValue?: T | null,
    transform?: (value: string | null) => T | null
  ): SignalAttribute<T>;

  /**
   * Create a boolean signal attribute
   */
  createBooleanSignalAttribute(
    attributeName: string,
    initialValue?: boolean
  ): BooleanSignalAttribute;

  /**
   * Create a number signal attribute
   */
  createNumberSignalAttribute(attributeName: string, initialValue?: number): NumberSignalAttribute;

  /**
   * Update signal attribute from attributeChangedCallback
   */
  updateSignalAttribute(attributeName: string, value: string | null): void;

  /**
   * Cleanup all signals and effects
   */
  cleanupSignals(): void;
}

/**
 * Mixin function to add signals support to BaseComponent
 */
export function withSignals<T extends new (...args: any[]) => HTMLElement>(
  Base: T
): T & (new (...args: any[]) => SignalComponentMixin) {
  return class extends Base implements SignalComponentMixin {
    _signalEffects = new Set<EffectCleanup>();
    _signalAttributes = new Map<string, SignalAttribute<any>>();

    addEffect(effectFn: () => void): EffectCleanup {
      const cleanup = effect(effectFn);
      this._signalEffects.add(cleanup);
      return () => {
        cleanup();
        this._signalEffects.delete(cleanup);
      };
    }

    createSignalAttribute<T>(
      attributeName: string,
      initialValue?: T | null,
      transform?: (value: string | null) => T | null
    ): SignalAttribute<T> {
      const signalAttr = new SignalAttribute(this, attributeName, initialValue, transform);
      this._signalAttributes.set(attributeName, signalAttr);
      return signalAttr;
    }

    createBooleanSignalAttribute(
      attributeName: string,
      initialValue = false
    ): BooleanSignalAttribute {
      const signalAttr = new BooleanSignalAttribute(this, attributeName, initialValue);
      this._signalAttributes.set(attributeName, signalAttr);
      return signalAttr;
    }

    createNumberSignalAttribute(attributeName: string, initialValue = 0): NumberSignalAttribute {
      const signalAttr = new NumberSignalAttribute(this, attributeName, initialValue);
      this._signalAttributes.set(attributeName, signalAttr);
      return signalAttr;
    }

    updateSignalAttribute(attributeName: string, value: string | null): void {
      const signalAttr = this._signalAttributes.get(attributeName);
      if (signalAttr) {
        signalAttr.updateFromAttribute(value);
      }
    }

    cleanupSignals(): void {
      // Cleanup effects
      this._signalEffects.forEach((cleanup) => cleanup());
      this._signalEffects.clear();

      // Cleanup signal attributes
      this._signalAttributes.forEach((signalAttr) => signalAttr.destroy());
      this._signalAttributes.clear();
    }

    // Override disconnectedCallback to cleanup signals
    disconnectedCallback(): void {
      this.cleanupSignals();
      const parentDisconnected = Object.getPrototypeOf(Object.getPrototypeOf(this))?.disconnectedCallback;
      if (parentDisconnected && typeof parentDisconnected === 'function') {
        parentDisconnected.call(this);
      }
    }
  };
}

/**
 * Utility functions for common signal patterns
 */
export const SignalUtils = {
  /**
   * Create a derived state signal from multiple dependencies
   */
  combine<T extends readonly unknown[], R>(
    signals: readonly [...{ [K in keyof T]: Signal<T[K]> }],
    combiner: (...values: T) => R
  ): ComputedSignal<R> {
    return computed(() => {
      const values = signals.map((signal) => signal.get()) as unknown as T;
      return combiner(...values);
    });
  },

  /**
   * Create a signal that toggles between two values
   */
  toggle(initialValue = false): Signal<boolean> & { toggle(): void } {
    const toggleSignal = signal(initialValue);

    return Object.assign(toggleSignal, {
      toggle(): void {
        toggleSignal.set(!toggleSignal.get());
      },
    });
  },

  /**
   * Create a counter signal with increment/decrement methods
   */
  counter(initialValue = 0): Signal<number> & {
    increment(step?: number): void;
    decrement(step?: number): void;
    reset(): void;
  } {
    const counterSignal = signal(initialValue);

    return Object.assign(counterSignal, {
      increment(step = 1): void {
        counterSignal.set(counterSignal.get() + step);
      },
      decrement(step = 1): void {
        counterSignal.set(counterSignal.get() - step);
      },
      reset(): void {
        counterSignal.set(initialValue);
      },
    });
  },
};
