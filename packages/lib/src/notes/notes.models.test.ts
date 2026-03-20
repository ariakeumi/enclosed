import { describe, expect, test } from 'vitest';
import { createNoteUrl, createNoteUrlHashFragment, parseNoteUrl, parseNoteUrlHashFragment } from './notes.models';

describe('note models', () => {
  describe('createNoteUrl', () => {
    test('a sharable note url contains the note id as path', () => {
      expect(
        createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com' }),
      ).to.eql({
        noteUrl: 'https://example.com/123',
      });
    });

    test('trailing slash in the base url is handled', () => {
      expect(
        createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com/' }),
      ).to.eql({
        noteUrl: 'https://example.com/123',
      });
    });

    test('a note url can be prefixed with a path', () => {
      expect(
        createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com/', pathPrefix: 'notes' }),
      ).to.eql({
        noteUrl: 'https://example.com/notes/123',
      });

      expect(
        createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com/', pathPrefix: 'notes/view' }),
      ).to.eql({
        noteUrl: 'https://example.com/notes/view/123',
      });

      expect(
        createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com/discarded', pathPrefix: 'notes/view' }),
      ).to.eql({
        noteUrl: 'https://example.com/notes/view/123',
      });
    });
  });

  describe('parseNoteUrl', () => {
    test('retrieves the note id from a sharable note url', () => {
      expect(
        parseNoteUrl({ noteUrl: 'https://example.com/123' }),
      ).to.eql({
        noteId: '123',
        isDeletedAfterReading: false,
      });
    });

    test('trailing slash in the base url is handled', () => {
      expect(
        parseNoteUrl({ noteUrl: 'https://example.com/123/' }),
      ).to.eql({
        noteId: '123',
        isDeletedAfterReading: false,
      });
    });

    test('in case of nested paths, the last path segment is considered the note id', () => {
      expect(
        parseNoteUrl({ noteUrl: 'https://example.com/123/456' }),
      ).to.eql({
        noteId: '456',
        isDeletedAfterReading: false,
      });
    });

    test('throws an error if the url has no note id', () => {
      expect(() => {
        parseNoteUrl({ noteUrl: 'https://example.com/' });
      }).to.throw('Invalid note url');
    });
  });

  describe('creation + parsing', () => {
    test('a note url can be parsed back to its original parts', () => {
      const { noteUrl } = createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com' });
      const { noteId, isDeletedAfterReading } = parseNoteUrl({ noteUrl });

      expect(noteId).to.equal('123');
      expect(isDeletedAfterReading).to.equal(false);
    });
  });

  describe('createNoteUrlHashFragment', () => {
    test('no extra hash fragment is generated', () => {
      expect(createNoteUrlHashFragment()).to.equal(undefined);
    });
  });

  describe('parseNoteUrlHashFragment', () => {
    test('hash fragments are ignored', () => {
      expect(parseNoteUrlHashFragment()).to.eql({
        isDeletedAfterReading: false,
      });
    });
  });
});
