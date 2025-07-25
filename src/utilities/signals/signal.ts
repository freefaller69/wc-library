/**
 * Signal implementation - writable reactive state
 */

import type { Signal, ISignalSystem } from './types.js';

export function createSignal<T>(system: ISignalSystem, initialValue: T): Signal<T> {
  const subscribers = new Set<any>();
  let value = initialValue;

  const signal: Signal<T> = {
    get: () => {
      // @ts-ignore - Access private property for dependency tracking
      if (system.currentComputation) {
        // @ts-ignore
        subscribers.add(system.currentComputation);
        // @ts-ignore
        system.currentComputation.dependencies.add(signal);
      }
      return value;
    },

    set: (newValue: T) => {
      if (value !== newValue) {
        value = newValue;
        system.scheduleUpdate(subscribers);
      }
    },

    peek: () => {
      return value;
    },

    destroy: () => {
      subscribers.clear();
    },

    _subscribers: subscribers,
    _isSignal: true as const,
  };

  return signal;
}