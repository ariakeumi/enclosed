import { createNote, filesToNoteAssets } from '@enclosed/lib';
import { storeNote } from './notes.services';

export { createAndStoreNote };

async function createAndStoreNote(args: {
  content: string;
  ttlInSeconds?: number;
  deleteAfterReading: boolean;
  fileAssets: File[];
  isPublic?: boolean;
  pathPrefix?: string;
}) {
  return createNote({
    ...args,
    storeNote,
    clientBaseUrl: window.location.origin,
    assets: [
      ...await filesToNoteAssets({ files: args.fileAssets }),
    ],
  });
}
