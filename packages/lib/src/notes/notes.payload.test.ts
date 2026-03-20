import { describe, expect, test } from 'vitest';
import { parseNotePayload, serializeNotePayload } from './notes.payload';

describe('note payload', () => {
  test('a note payload can be serialized and parsed back', async () => {
    const note = {
      content: 'Hello, World!',
      assets: [
        {
          metadata: {
            type: 'text/plain',
            name: 'hello.txt',
          },
          content: new Uint8Array([1, 2, 3, 4]),
        },
      ],
    };

    const { payload } = await serializeNotePayload({ note });
    const { note: parsedNote } = await parseNotePayload({ payload });

    expect(parsedNote).to.eql(note);
  });
});
