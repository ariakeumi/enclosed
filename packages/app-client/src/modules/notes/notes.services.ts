import { apiClient } from '../shared/http/http-client';

export { fetchNoteById, fetchNoteExists, storeNote };

async function storeNote({
  payload,
  ttlInSeconds,
  deleteAfterReading,
  serializationFormat,
  isPublic,
}: {
  payload: string;
  ttlInSeconds?: number;
  deleteAfterReading: boolean;
  serializationFormat: string;
  isPublic?: boolean;
}) {
  const { noteId } = await apiClient<{ noteId: string }>({
    path: '/api/notes',
    method: 'POST',
    body: {
      payload,
      ttlInSeconds,
      deleteAfterReading,
      serializationFormat,
      isPublic,
    },
  });

  return { noteId };
}

async function fetchNoteById({ noteId }: { noteId: string }) {
  const { note } = await apiClient<{ note: {
    payload: string;
    serializationFormat: string;
  }; }>({
    path: `/api/notes/${noteId}`,
    method: 'GET',
  });

  return { note };
}

async function fetchNoteExists({ noteId }: { noteId: string }) {
  const { noteExists } = await apiClient<{ noteExists: boolean }>({
    method: 'GET',
    path: `/api/notes/${noteId}/exists`,
  });

  return { noteExists };
}
