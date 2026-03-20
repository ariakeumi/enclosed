export type NoteAsset = {
  metadata: {
    type: string;
    [key: string]: unknown;
  };
  content: Uint8Array;
};

export type Note = {
  content: string;
  assets: NoteAsset[];
};
