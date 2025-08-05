/**
 * Mixin composition utilities for creating composable component architectures
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */

// Improved base constructor types with backward compatibility
export type Constructor<T = object> = abstract new (...args: any[]) => T;
export type ConcreteConstructor<T = object> = new (...args: any[]) => T;

// Enhanced mixin type - maintains compatibility while improving inference
export type Mixin<
  TInput extends Constructor = Constructor,
  TOutput extends Constructor = TInput,
> = (Base: TInput) => TOutput;

// Flexible mixin type that accepts any compatible mixin function
export type AnyMixin = (base: any) => any;

/**
 * Composes multiple mixins with a base class
 *
 * @param Base - The base constructor to extend
 * @param mixins - Array of mixin functions to apply in order
 * @returns Composed constructor with all mixin functionality
 */
export function compose<TBase extends Constructor>(
  Base: TBase,
  ...mixins: readonly AnyMixin[]
): any {
  return mixins.reduce((accumulator: any, mixin) => mixin(accumulator), Base);
}

/**
 * Creates a mixin that can be applied to any constructor
 *
 * @param mixinFunction - Function that takes a base constructor and returns enhanced constructor
 * @returns The same mixin function with improved type inference
 */
export function createMixin<TMixin>(
  mixinFunction: <TBase extends Constructor>(Base: TBase) => TBase & Constructor<TMixin>
): <TBase extends Constructor>(Base: TBase) => TBase & Constructor<TMixin> {
  return mixinFunction;
}

/**
 * Type helper for mixin interfaces - represents a constructable with specific interface
 */
export interface MixinInterface<T> {
  new (...args: readonly unknown[]): T;
}

/**
 * Utility to check if a class implements a specific mixin interface
 *
 * @param instance - Object instance to check
 * @param mixinCheck - Type guard function for the mixin interface
 * @returns True if instance implements the mixin interface
 */
export function implementsMixin<T>(
  instance: unknown,
  mixinCheck: (obj: unknown) => obj is T
): instance is T {
  return mixinCheck(instance);
}

/**
 * Helper to create type-safe mixin application for single mixin
 *
 * @param Base - Base constructor to extend
 * @param mixin - Mixin function to apply
 * @returns Enhanced constructor with mixin functionality
 */
export function applyMixin<TBase extends Constructor, TMixin>(
  Base: TBase,
  mixin: (base: TBase) => TBase & Constructor<TMixin>
): TBase & Constructor<TMixin> {
  return mixin(Base);
}
