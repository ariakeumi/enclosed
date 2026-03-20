import { describe, expect, test } from 'vitest';
import { createMemoryStorage } from '../storage/factories/memory.storage';
import { createNoteNotFoundError } from './notes.errors';
import { createNoteRepository } from './notes.repository';

describe('notes repository', () => {
  describe('getNoteById', () => {
    test('a note can be retrieved from storage by its id, with the dates coerced to Date objects', async () => {
      const { storage } = createMemoryStorage();

      storage.setItem('note-1', {
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      const { getNoteById } = createNoteRepository({ storage });
      const { note } = await getNoteById({ noteId: 'note-1' });

      expect(note).to.eql({
        payload: '<serialized-content>',
        expirationDate: new Date('2024-01-01T00:01:00.000Z'),
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });
    });

    test('an error is raised when trying to retrieve a note that does not exist in storage', async () => {
      const { storage } = createMemoryStorage();

      storage.setItem('note-1', {
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      const { getNoteById } = createNoteRepository({ storage });

      expect(getNoteById({ noteId: 'note-2' })).rejects.toThrow(createNoteNotFoundError());
    });
  });

  describe('getNotesIds', () => {
    test('retrieves all note ids from storage, regardless of the expiration', async () => {
      const { storage } = createMemoryStorage();

      storage.setItem('note-1', {
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      storage.setItem('note-2', {
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      const { getNotesIds } = createNoteRepository({ storage });
      const { noteIds } = await getNotesIds();

      expect(noteIds).to.eql(['note-1', 'note-2']);
    });

    test('returns an empty list of ids when there are no notes in storage', async () => {
      const { storage } = createMemoryStorage();
      const { getNotesIds } = createNoteRepository({ storage });
      const { noteIds } = await getNotesIds();

      expect(noteIds).to.eql([]);
    });

    test('it does not delete notes from storage when retrieving their ids, even marked for deletion after reading', async () => {
      const { storage } = createMemoryStorage();

      storage.setItem('note-1', {
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: true,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      const { getNotesIds } = createNoteRepository({ storage });

      await getNotesIds();

      const noteIds = await storage.getKeys();

      expect(noteIds).to.eql(['note-1']);
    });
  });

  describe('deleteNoteById', () => {
    test('deletes a note from storage by its id', async () => {
      const { storage } = createMemoryStorage();

      storage.setItem('note-1', {
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      storage.setItem('note-2', {
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      const { deleteNoteById } = createNoteRepository({ storage });

      await deleteNoteById({ noteId: 'note-1' });

      const noteIds = await storage.getKeys();

      expect(noteIds).to.eql(['note-2']);
    });

    test('when trying to delete a note that does not exist, no error is raised', async () => {
      const { storage } = createMemoryStorage();
      const { deleteNoteById } = createNoteRepository({ storage });

      await deleteNoteById({ noteId: 'note-1' });

      expect(await storage.getKeys()).to.eql([]);
    });
  });

  describe('saveNote', () => {
    test('store a note in storage with its content and metadata', async () => {
      const { storage } = createMemoryStorage();
      let noteIdIndex = 1;
      const { saveNote } = createNoteRepository({ storage });

      expect(await storage.getKeys()).to.eql([]);

      const { noteId } = await saveNote({
        payload: '<serialized-content>',
        ttlInSeconds: 60,
        deleteAfterReading: false,
        generateNoteId: () => `note-${noteIdIndex++}`,
        now: new Date('2024-01-01T00:00:00.000Z'),
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      expect(noteId).to.eql('note-1');
      expect(await storage.getKeys()).to.eql(['note-1']);

      expect(await storage.getItem<any>('note-1')).to.eql({
        payload: '<serialized-content>',
        expirationDate: '2024-01-01T00:01:00.000Z',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });
    });

    test('retries note id generation when the generated id already exists', async () => {
      const { storage } = createMemoryStorage();

      await storage.setItem('taken-id', {
        payload: '<serialized-content>',
        deleteAfterReading: false,
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      const generatedIds = ['taken-id', 'fresh-id'];
      const { saveNote } = createNoteRepository({ storage });

      const { noteId } = await saveNote({
        payload: '<serialized-content>',
        ttlInSeconds: 60,
        deleteAfterReading: false,
        generateNoteId: () => generatedIds.shift() ?? 'unexpected-id',
        now: new Date('2024-01-01T00:00:00.000Z'),
        serializationFormat: 'cbor-array',
        isPublic: true,
      });

      expect(noteId).to.eql('fresh-id');
      expect(await storage.getKeys()).to.eql(['fresh-id', 'taken-id']);
    });
  });

});
