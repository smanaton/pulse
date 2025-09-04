/**
 * Shared test helpers to avoid non-null assertions and keep tests type-safe.
 *
 * Import these in tests like:
 *   import { assertExists, idOf } from '../test-utils';
 */

export function assertExists<T>(v: T | undefined | null, msg?: string): asserts v is T {
  if (v === undefined || v === null) throw new Error(msg ?? 'Expected value to exist');
}

export function idOf(v?: { _id?: unknown } | null | undefined, name = 'value'): any {
  assertExists(v, `${name} is missing or has no _id`);
  return (v as any)._id;
}
