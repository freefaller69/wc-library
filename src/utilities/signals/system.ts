/**
 * SignalSystem implementation - core reactive system
 */

import type {
  Signal,
  ComputedSignal,
  EffectCleanup,
  ISignalSystem,
  SignalSystemOptions,
  Computation,
} from './types.js';
import { createSignal } from './signal.js';
import { createComputed } from './computed.js';
import { createEffect } from './effect.js';

export class SignalSystem implements ISignalSystem {
  public currentComputation: Computation | null = null;
  public computationStack: Computation[] = [];
  private updateQueue = new Set<() => void>();
  private isUpdating = false;
  private options: SignalSystemOptions;

  constructor(options: SignalSystemOptions = {}) {
    this.options = {
      debug: false,
      onError: (error, context): void => {
        console.error(`Error in signal ${context}:`, error);
      },
      ...options,
    };
  }

  createSignal<T>(initialValue: T): Signal<T> {
    return createSignal(this, initialValue);
  }

  createComputed<T>(fn: () => T): ComputedSignal<T> {
    return createComputed(this, fn);
  }

  createEffect(fn: () => void): EffectCleanup {
    return createEffect(this, fn);
  }

  detectCycle(): void {
    const currentComputation = this.currentComputation;
    if (!currentComputation) return;

    // Check if current computation appears more than once in the stack
    let count = 0;
    for (let i = 0; i < this.computationStack.length; i++) {
      if (this.computationStack[i] === currentComputation) {
        count++;
        if (count > 1) {
          throw new Error('Circular dependency detected in signal computation');
        }
      }
    }
  }

  scheduleUpdate(subscribers: Set<Computation | (() => void)>): void {
    subscribers.forEach((subscriber) => {
      if (typeof subscriber === 'function') {
        this.updateQueue.add(subscriber);
      } else if (subscriber.invalidate) {
        this.updateQueue.add(subscriber.invalidate);
      }
    });

    if (!this.isUpdating) {
      this.flushUpdates();
    }
  }

  flushUpdates(): void {
    if (this.isUpdating) return;

    this.isUpdating = true;

    try {
      while (this.updateQueue.size > 0) {
        const updates = Array.from(this.updateQueue);
        this.updateQueue.clear();

        updates.forEach((update) => {
          try {
            update();
          } catch (error) {
            this.options.onError?.(error as Error, 'signal update');
          }
        });
      }
    } finally {
      this.isUpdating = false;
    }
  }

  safeExecute<T>(fn: () => T): T {
    try {
      return fn();
    } catch (error) {
      this.options.onError?.(error as Error, 'signal computation');
      throw error;
    }
  }

  batch<T>(fn: () => T): T {
    const wasUpdating = this.isUpdating;
    this.isUpdating = true;

    try {
      const result = fn();
      if (!wasUpdating) {
        // Temporarily set isUpdating to false to allow flushUpdates to run
        this.isUpdating = false;
        this.flushUpdates();
      }
      return result;
    } finally {
      this.isUpdating = wasUpdating;
    }
  }
}
