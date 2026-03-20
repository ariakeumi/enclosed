import { joinUrlPaths } from '@corentinth/chisels';

export { buildViewNotePagePath };

function buildViewNotePagePath({ prefix }: { prefix?: string | null }): string {
  const noteIdParam = '/:noteId';

  if (!prefix || prefix === '' || prefix === '/') {
    return noteIdParam;
  }

  return `/${joinUrlPaths(prefix, noteIdParam)}`;
}
