import type { Expand } from '@corentinth/chisels';
import type { createNoteRepository } from './notes.repository';

export type NotesRepository = ReturnType<typeof createNoteRepository>;

export type DatabaseNote = {
  payload: string;
  serializationFormat: string;
  expirationDate?: string;
  deleteAfterReading: boolean;
  isPublic: boolean;
};

export type Note = Expand<Omit<DatabaseNote, 'expirationDate'> & { expirationDate?: Date }>;
