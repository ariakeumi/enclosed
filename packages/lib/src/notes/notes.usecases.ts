import type { SerializationFormat } from '../crypto/serialization/serialization.types';
import type { NoteAsset } from './notes.types';
import { createNoteUrl } from './notes.models';
import { serializeNotePayload } from './notes.payload';
import { storeNote as storeNoteImpl } from './notes.services';

export { createNote };

const BASE_URL = 'https://enclosed.cc';

async function createNote({
  content,
  ttlInSeconds,
  deleteAfterReading = false,
  clientBaseUrl = BASE_URL,
  apiBaseUrl = clientBaseUrl,
  storeNote = params => storeNoteImpl({ ...params, apiBaseUrl }),
  assets = [],
  serializationFormat = 'cbor-array',
  isPublic = true,
  pathPrefix,
}: {
  content: string;
  ttlInSeconds?: number;
  deleteAfterReading?: boolean;
  clientBaseUrl?: string;
  apiBaseUrl?: string;
  assets?: NoteAsset[];
  serializationFormat?: SerializationFormat;
  isPublic?: boolean;
  pathPrefix?: string;
  storeNote?: (params: {
    payload: string;
    ttlInSeconds?: number;
    deleteAfterReading: boolean;
    serializationFormat: SerializationFormat;
    isPublic?: boolean;
  }) => Promise<{ noteId: string }>;
}) {
  const { payload } = await serializeNotePayload({
    note: { content, assets },
    serializationFormat,
  });

  const { noteId } = await storeNote({
    payload,
    ttlInSeconds,
    deleteAfterReading,
    serializationFormat,
    isPublic,
  });

  const { noteUrl } = createNoteUrl({
    noteId,
    clientBaseUrl,
    isDeletedAfterReading: deleteAfterReading,
    pathPrefix,
  });

  return {
    payload,
    noteId,
    noteUrl,
  };
}
