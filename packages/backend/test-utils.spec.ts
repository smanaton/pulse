import { describe, expect, test } from 'vitest';
import { assertExists, idOf } from './test-utils';

describe('test-utils', () => {
  test('assertExists and idOf work as expected', () => {
    const obj = { _id: 'abc123' } as const;
    expect(() => assertExists(obj)).not.toThrow();
    expect(idOf(obj)).toBe('abc123');
  });
});
