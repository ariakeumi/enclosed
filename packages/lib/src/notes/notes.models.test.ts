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

    test('a note deleted after reading is indicated in the hash fragment', () => {
      expect(
        createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com', isDeletedAfterReading: true }),
      ).to.eql({
        noteUrl: 'https://example.com/123#dar',
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

    test('a note that is deleted after reading is indicated in the hash fragment', () => {
      expect(
        parseNoteUrl({ noteUrl: 'https://example.com/123#dar' }),
      ).to.eql({
        noteId: '123',
        isDeletedAfterReading: true,
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

    test('throws an error if the url has no note id or an invalid hash fragment', () => {
      expect(() => {
        parseNoteUrl({ noteUrl: 'https://example.com/' });
      }).to.throw('Invalid note url');

      expect(() => {
        parseNoteUrl({ noteUrl: 'https://example.com/123#foo' });
      }).to.throw('Invalid hash fragment');
    });
  });

  describe('creation + parsing', () => {
    test('a note url can be parsed back to its original parts', () => {
      const { noteUrl } = createNoteUrl({ noteId: '123', clientBaseUrl: 'https://example.com', isDeletedAfterReading: true });
      const { noteId, isDeletedAfterReading } = parseNoteUrl({ noteUrl });

      expect(noteId).to.equal('123');
      expect(isDeletedAfterReading).to.equal(true);
    });
  });

  describe('createNoteUrlHashFragment', () => {
    test('returns nothing when the note is not deleted after reading', () => {
      expect(
        createNoteUrlHashFragment({}),
      ).to.equal(undefined);
    });

    test('indicates that the note is deleted after reading', () => {
      expect(
        createNoteUrlHashFragment({ isDeletedAfterReading: true }),
      ).to.equal('dar');
    });
  });

  describe('parseNoteUrlHashFragment', () => {
    test('an empty hash fragment means the note is not deleted after reading', () => {
      expect(
        parseNoteUrlHashFragment({ hashFragment: '' }),
      ).to.eql({
        isDeletedAfterReading: false,
      });

      expect(
        parseNoteUrlHashFragment({ hashFragment: '#' }),
      ).to.eql({
        isDeletedAfterReading: false,
      });
    });

    test('the fragment can indicate that the note is deleted after reading', () => {
      expect(
        parseNoteUrlHashFragment({ hashFragment: 'dar' }),
      ).to.eql({
        isDeletedAfterReading: true,
      });

      expect(
        parseNoteUrlHashFragment({ hashFragment: '#dar' }),
      ).to.eql({
        isDeletedAfterReading: true,
      });
    });

    test('throws when the fragment is invalid', () => {
      expect(() => {
        parseNoteUrlHashFragment({ hashFragment: 'foo' });
      }).to.throw('Invalid hash fragment');
    });
  });
});
