import { joinUrlPaths } from '@corentinth/chisels';

export { createNoteUrl, createNoteUrlHashFragment, parseNoteUrl, parseNoteUrlHashFragment };

function createNoteUrlHashFragment() {
  return undefined;
}

function parseNoteUrlHashFragment() {
  return {
    isDeletedAfterReading: false,
  };
}

function createNoteUrl({
  noteId,
  clientBaseUrl,
  pathPrefix,
}: {
  noteId: string;
  clientBaseUrl: string;
  pathPrefix?: string;
}): { noteUrl: string } {
  const url = new URL(clientBaseUrl);

  url.pathname = pathPrefix
    ? `/${joinUrlPaths(pathPrefix, noteId)}`
    : `/${noteId}`;
  url.hash = '';

  return { noteUrl: url.toString() };
}

function parseNoteUrl({ noteUrl }: { noteUrl: string }) {
  const url = new URL(noteUrl);
  const noteId = url.pathname.split('/').filter(Boolean).pop();

  if (!noteId) {
    throw new Error('Invalid note url');
  }

  return {
    noteId,
    isDeletedAfterReading: false,
  };
}
