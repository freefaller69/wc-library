/**
 * Mixin composition utilities for creating composable component architectures
 */

/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-function-return-type */

export type Constructor<T = {}> = abstract new (...args: any[]) => T;
export type ConcreteConstructor<T = {}> = new (...args: any[]) => T;
export type Mixin<T extends Constructor> = (Base: T) => T;

/**
 * Composes multiple mixins with a base class
 */
export function compose<T extends Constructor>(Base: T, ...mixins: Mixin<any>[]): any {
  return mixins.reduce((accumulator, mixin) => mixin(accumulator), Base);
}

/**
 * Creates a mixin that can be applied to any constructor
 */
export function createMixin<TMixin>(
  mixinFunction: <TBase extends Constructor>(Base: TBase) => TBase & Constructor<TMixin>
) {
  return mixinFunction;
}

/**
 * Type helper for mixin interfaces
 */
export interface MixinInterface<T> {
  new (...args: any[]): T;
}

/**
 * Utility to check if a class implements a specific mixin interface
 */
export function implementsMixin<T>(
  instance: any,
  mixinCheck: (obj: any) => obj is T
): instance is T {
  return mixinCheck(instance);
}

/**
 * Helper to create type-safe mixin application
 */
export function applyMixin<TBase extends Constructor, TMixin>(
  Base: TBase,
  mixin: (base: TBase) => TBase & Constructor<TMixin>
): TBase & Constructor<TMixin> {
  return mixin(Base);
}
