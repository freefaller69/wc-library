/**
 * Effect implementation - side effects that run when dependencies change
 */

import type { EffectCleanup, ISignalSystem, Computation } from './types.js';

export function createEffect(system: ISignalSystem, fn: () => void): EffectCleanup {
  let isActive = true;
  let dependencies = new Set<any>();

  const cleanup = () => {
    isActive = false;
    dependencies.forEach((dep) => {
      if (dep._subscribers) {
        // Remove this effect from the dependency's subscribers
        for (const subscriber of dep._subscribers) {
          if (subscriber === runEffect || subscriber.invalidate === runEffect) {
            dep._subscribers.delete(subscriber);
            break;
          }
        }
      }
    });
    dependencies.clear();
  };

  const runEffect = () => {
    if (!isActive) return;

    // @ts-ignore - Access private property
    const prevComputation = system.currentComputation;
    const oldDependencies = dependencies;
    dependencies = new Set();

    const computation: Computation = {
      dependencies,
      invalidate: runEffect,
    };

    // @ts-ignore
    system.currentComputation = computation;
    // @ts-ignore - Access private property
    system.computationStack.push(computation);

    try {
      system.detectCycle();
      system.safeExecute(fn);

      // Clean up old dependencies
      oldDependencies.forEach((dep) => {
        if (!dependencies.has(dep) && dep._subscribers) {
          for (const subscriber of dep._subscribers) {
            if (subscriber === runEffect || subscriber.invalidate === runEffect) {
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
    }
  };

  // Run immediately
  runEffect();

  return cleanup;
}
