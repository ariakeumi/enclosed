import { joinUrlPaths } from '@corentinth/chisels';

export { createNoteUrl, createNoteUrlHashFragment, parseNoteUrl, parseNoteUrlHashFragment };

const DELETED_AFTER_READING_HASH_FRAGMENT = 'dar';

function createNoteUrlHashFragment({ isDeletedAfterReading }: { isDeletedAfterReading?: boolean }) {
  if (!isDeletedAfterReading) {
    return undefined;
  }

  return DELETED_AFTER_READING_HASH_FRAGMENT;
}

function parseNoteUrlHashFragment({ hashFragment }: { hashFragment: string }) {
  const cleanedHashFragment = hashFragment.replace(/^#/, '');

  if (cleanedHashFragment === '') {
    return {
      isDeletedAfterReading: false,
    };
  }

  if (cleanedHashFragment !== DELETED_AFTER_READING_HASH_FRAGMENT) {
    throw new Error('Invalid hash fragment');
  }

  return {
    isDeletedAfterReading: true,
  };
}

function createNoteUrl({
  noteId,
  clientBaseUrl,
  isDeletedAfterReading,
  pathPrefix,
}: {
  noteId: string;
  clientBaseUrl: string;
  isDeletedAfterReading?: boolean;
  pathPrefix?: string;
}): { noteUrl: string } {
  const url = new URL(clientBaseUrl);
  const hashFragment = createNoteUrlHashFragment({ isDeletedAfterReading });

  url.pathname = pathPrefix
    ? `/${joinUrlPaths(pathPrefix, noteId)}`
    : `/${noteId}`;
  url.hash = hashFragment ?? '';

  return { noteUrl: url.toString() };
}

function parseNoteUrl({ noteUrl }: { noteUrl: string }) {
  const url = new URL(noteUrl);
  const noteId = url.pathname.split('/').filter(Boolean).pop();

  if (!noteId) {
    throw new Error('Invalid note url');
  }

  const { isDeletedAfterReading } = parseNoteUrlHashFragment({ hashFragment: url.hash });

  return { noteId, isDeletedAfterReading };
}
