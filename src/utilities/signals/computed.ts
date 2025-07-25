/**
 * Computed signal implementation - derived reactive state
 */

import type { ComputedSignal, ISignalSystem, Computation } from './types.js';

export function createComputed<T>(system: ISignalSystem, fn: () => T): ComputedSignal<T> {
  const subscribers = new Set<any>();
  let isStale = true;
  let cachedValue: T;
  let isComputing = false;
  let dependencies = new Set<any>();

  const invalidate = () => {
    isStale = true;
    system.scheduleUpdate(subscribers);
  };

  const computed: ComputedSignal<T> = {
    get: () => {
      if (isComputing) {
        throw new Error('Circular dependency detected in computed signal');
      }

      // @ts-ignore - Access private property for dependency tracking
      if (system.currentComputation) {
        // @ts-ignore
        subscribers.add(system.currentComputation);
        // @ts-ignore
        system.currentComputation.dependencies.add(computed);
      }

      if (isStale && !isComputing) {
        computed.computeValue();
      }

      return cachedValue;
    },

    peek: () => {
      if (isStale && !isComputing) {
        // @ts-ignore - Access private property
        const prevComputation = system.currentComputation;
        // @ts-ignore
        system.currentComputation = null;
        try {
          cachedValue = system.safeExecute(fn);
          isStale = false;
        } finally {
          // @ts-ignore
          system.currentComputation = prevComputation;
        }
      }
      return cachedValue;
    },

    computeValue: () => {
      if (isComputing) {
        throw new Error('Circular dependency detected in computed signal');
      }

      isComputing = true;
      // @ts-ignore - Access private property
      const prevComputation = system.currentComputation;
      const oldDependencies = dependencies;
      dependencies = new Set();

      const computation: Computation = {
        dependencies,
        invalidate,
      };

      // @ts-ignore
      system.currentComputation = computation;
      // @ts-ignore - Access private property
      system.computationStack.push(computation);

      try {
        system.detectCycle();
        cachedValue = system.safeExecute(fn);
        isStale = false;

        // Clean up old dependencies
        oldDependencies.forEach((dep) => {
          if (!dependencies.has(dep) && dep._subscribers) {
            for (const subscriber of dep._subscribers) {
              if (subscriber.invalidate === invalidate) {
                dep._subscribers.delete(subscriber);
                break;
              }
            }
          }
        });
      } finally {
        // @ts-ignore
        system.currentComputation = prevComputation;
        // @ts-ignore
        system.computationStack.pop();
        isComputing = false;
      }
    },

    destroy: () => {
      dependencies.forEach((dep) => {
        if (dep._subscribers) {
          // Remove this computation from the dependency's subscribers
          for (const subscriber of dep._subscribers) {
            if (subscriber.invalidate === invalidate) {
              dep._subscribers.delete(subscriber);
              break;
            }
          }
        }
      });
      dependencies.clear();
      subscribers.clear();
    },

    _subscribers: subscribers,
    _isSignal: true as const,
    _isComputed: true as const,
  };

  return computed;
}