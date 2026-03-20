import { describe, expect, test } from 'vitest';
import { generateId } from './random';

describe('random utils', () => {
  describe('generateId', () => {
    test('generates an 8-character Crockford base32 id', () => {
      const noteId = generateId();

      expect(noteId).toMatch(/^[0-9a-hjkmnp-tv-z]{8}$/);
    });

    test('generates different ids across multiple calls', () => {
      const generatedIds = new Set(Array.from({ length: 32 }, () => generateId()));

      expect(generatedIds.size).toBe(32);
    });
  });
});
