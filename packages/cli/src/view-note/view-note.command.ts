import { fetchNote, isApiClientErrorWithStatusCode, parseNotePayload, parseNoteUrl } from '@enclosed/lib';
import { defineCommand } from 'citty';
import picocolors from 'picocolors';
import { getInstanceUrl } from '../config/config.usecases';

export const viewNoteCommand = defineCommand({
  meta: {
    name: 'view',
    description: 'View a note',
  },
  args: {
    noteUrl: {
      description: 'Note URL',
      type: 'positional',
      required: true,
    },
  },
  run: async ({ args }) => {
    const { noteUrl } = args;

    try {
      const { noteId } = parseNoteUrl({ noteUrl });

      const { payload, serializationFormat } = await fetchNote({
        noteId,
        apiBaseUrl: getInstanceUrl(),
      });

      const { note } = await parseNotePayload({
        payload,
        serializationFormat: serializationFormat as 'cbor-array',
      });

      console.log(note.content);
    } catch (error) {
      if (isApiClientErrorWithStatusCode({ error, statusCode: 404 })) {
        console.error(picocolors.red('Note not found'));
        return;
      }

      if (isApiClientErrorWithStatusCode({ error, statusCode: 429 })) {
        console.error(picocolors.red('Api rate limit reached, please try again later'));
        return;
      }

      console.error(picocolors.red('Failed to fetch note'));
    }
  },
});
