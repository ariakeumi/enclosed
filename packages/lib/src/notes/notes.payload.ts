import type { SerializationFormat } from '../crypto/serialization/serialization.types';
import type { Note } from './notes.types';
import { base64UrlToBuffer, bufferToBase64Url } from '@enclosed/crypto';
import { getParsingMethod, getSerializationMethod } from '../crypto/serialization/serialization.registry';

export { parseNotePayload, serializeNotePayload };

async function serializeNotePayload({
  note,
  serializationFormat = 'cbor-array',
}: {
  note: Note;
  serializationFormat?: SerializationFormat;
}) {
  const { serializeNote } = getSerializationMethod({ serializationFormat });
  const { noteBuffer } = await serializeNote({ note });

  return {
    payload: bufferToBase64Url({ buffer: noteBuffer }),
  };
}

async function parseNotePayload({
  payload,
  serializationFormat = 'cbor-array',
}: {
  payload: string;
  serializationFormat?: SerializationFormat;
}) {
  const { parseNote } = getParsingMethod({ serializationFormat });
  const noteBuffer = base64UrlToBuffer({ base64Url: payload });

  return parseNote({ noteBuffer });
}
