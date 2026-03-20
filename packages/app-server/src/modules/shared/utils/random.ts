export { generateId };

const NOTE_ID_ALPHABET = '0123456789abcdefghjkmnpqrstvwxyz';
const NOTE_ID_LENGTH = 8;

function generateId() {
  const bytes = crypto.getRandomValues(new Uint8Array(NOTE_ID_LENGTH));

  return Array.from(bytes, byte => NOTE_ID_ALPHABET[byte % NOTE_ID_ALPHABET.length]).join('');
}
