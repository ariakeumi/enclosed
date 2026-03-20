import { describe, expect, test } from 'vitest';
import { NOTE_ID_REGEX } from './notes.constants';

describe('notes constants', () => {
  describe('NOTE_ID_REGEX', () => {
    test('matches the new 8-character note ids', () => {
      expect(NOTE_ID_REGEX.test('abc123de')).toBe(true);
    });

    test('matches legacy 26-character ULID note ids', () => {
      expect(NOTE_ID_REGEX.test('01j6af0fb2v4q6g28p2pw9m3dx')).toBe(true);
    });

    test('rejects ids with unsupported lengths', () => {
      expect(NOTE_ID_REGEX.test('abc123d')).toBe(false);
      expect(NOTE_ID_REGEX.test('abc123def')).toBe(false);
      expect(NOTE_ID_REGEX.test('01j6af0fb2v4q6g28p2pw9m3d')).toBe(false);
    });
  });
});
