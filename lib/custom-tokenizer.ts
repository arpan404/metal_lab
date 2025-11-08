/**
 * Custom Tokenizer Wrapper
 * Uses the HuggingFace ByteLevel BPE tokenizer trained on wikitext-2
 */

import tokenizerData from './custom_tokenizer_bpe_500.json';

// Simple interface for our tokenizer
interface TokenizerInterface {
  encode: (text: string) => number[];
  decode: (ids: number[]) => string;
  vocabulary: Map<number, string>;
  vocabSize: number;
}

// ByteLevel decoder mapping (GPT-style)
const BYTE_TO_UNICODE: Map<number, string> = new Map();
const UNICODE_TO_BYTE: Map<string, number> = new Map();

// Initialize byte-to-unicode mapping
function initByteMappings() {
  const bs = [
    ...Array.from({ length: 33 }, (_, i) => 33 + i), // ! to A
    ...Array.from({ length: 94 }, (_, i) => 33 + i), // full printable range
    ...Array.from({ length: 172 }, (_, i) => 161 + i), // extended chars
  ];
  
  const cs = [...bs];
  let n = 0;
  
  for (let b = 0; b < 256; b++) {
    if (!bs.includes(b)) {
      bs.push(b);
      cs.push(256 + n);
      n++;
    }
  }
  
  for (let i = 0; i < bs.length; i++) {
    const char = String.fromCharCode(cs[i]);
    BYTE_TO_UNICODE.set(bs[i], char);
    UNICODE_TO_BYTE.set(char, bs[i]);
  }
}

initByteMappings();

// Build vocabulary from tokenizer data
const vocab = tokenizerData.model.vocab as Record<string, number>;
const merges = tokenizerData.model.merges as Array<[string, string]>;
const addPrefix = tokenizerData.pre_tokenizer?.add_prefix_space ?? true;

// Create ID to token mapping
const ID_TO_TOKEN: Map<number, string> = new Map();
const TOKEN_TO_ID: Map<string, number> = new Map();

Object.entries(vocab).forEach(([token, id]) => {
  ID_TO_TOKEN.set(id, token);
  TOKEN_TO_ID.set(token, id);
});

// Build merge ranks
const MERGE_RANKS: Map<string, number> = new Map();
merges.forEach((merge, idx) => {
  MERGE_RANKS.set(merge.join(' '), idx);
});

// Pattern for pre-tokenization (simplified GPT-2 pattern)
const PAT = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

// Convert bytes to unicode characters for encoding
function bytesToUnicode(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => BYTE_TO_UNICODE.get(b) || String.fromCharCode(b))
    .join('');
}

// Convert unicode string to bytes for decoding
function unicodeToBytes(text: string): Uint8Array {
  const bytes: number[] = [];
  for (const char of text) {
    const byte = UNICODE_TO_BYTE.get(char);
    if (byte !== undefined) {
      bytes.push(byte);
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }
  return new Uint8Array(bytes);
}

// Get pairs from word
function getPairs(word: string[]): Set<string> {
  const pairs = new Set<string>();
  for (let i = 0; i < word.length - 1; i++) {
    pairs.add(`${word[i]} ${word[i + 1]}`);
  }
  return pairs;
}

// Apply BPE merges to a word
function bpe(token: string): string[] {
  if (token.length === 1) {
    return [token];
  }
  
  let word = token.split('');
  let pairs = getPairs(word);
  
  if (pairs.size === 0) {
    return [token];
  }
  
  while (true) {
    // Find the pair with lowest merge rank
    let minPair: string | null = null;
    let minRank = Infinity;
    
    for (const pair of pairs) {
      const rank = MERGE_RANKS.get(pair);
      if (rank !== undefined && rank < minRank) {
        minRank = rank;
        minPair = pair;
      }
    }
    
    if (minPair === null) {
      break;
    }
    
    const [first, second] = minPair.split(' ');
    const newWord: string[] = [];
    let i = 0;
    
    while (i < word.length) {
      const j = word.indexOf(first, i);
      if (j === -1) {
        newWord.push(...word.slice(i));
        break;
      }
      
      newWord.push(...word.slice(i, j));
      i = j;
      
      if (word[i] === first && i < word.length - 1 && word[i + 1] === second) {
        newWord.push(first + second);
        i += 2;
      } else {
        newWord.push(word[i]);
        i += 1;
      }
    }
    
    word = newWord;
    if (word.length === 1) {
      break;
    }
    pairs = getPairs(word);
  }
  
  return word;
}

// Encode text to token IDs
function encode(text: string): number[] {
  // Add prefix space if needed
  if (addPrefix && text.length > 0 && !text.startsWith(' ')) {
    text = ' ' + text;
  }
  
  const bpeTokens: number[] = [];
  
  // Pre-tokenize using regex pattern
  const matches = text.matchAll(PAT);
  
  for (const match of matches) {
    const token = match[0];
    
    // Convert to bytes and then to unicode string
    const bytes = new TextEncoder().encode(token);
    const unicodeStr = bytesToUnicode(bytes);
    
    // Apply BPE
    const bpeResult = bpe(unicodeStr);
    
    // Convert to IDs
    for (const bpeToken of bpeResult) {
      const id = TOKEN_TO_ID.get(bpeToken);
      if (id !== undefined) {
        bpeTokens.push(id);
      } else {
        // Unknown token - try byte-by-byte encoding
        for (const char of bpeToken) {
          const charId = TOKEN_TO_ID.get(char);
          if (charId !== undefined) {
            bpeTokens.push(charId);
          }
        }
      }
    }
  }
  
  return bpeTokens;
}

// Decode token IDs to text
function decode(ids: number[]): string {
  const tokens = ids.map(id => ID_TO_TOKEN.get(id) || '');
  const text = tokens.join('');
  
  // Convert unicode back to bytes
  const bytes = unicodeToBytes(text);
  
  // Decode UTF-8
  return new TextDecoder().decode(bytes);
}

// Export tokenizer interface
export const customTokenizer: TokenizerInterface = {
  encode,
  decode,
  vocabulary: ID_TO_TOKEN,
  vocabSize: Object.keys(vocab).length,
};

// Helper to get token text by ID
export function getTokenText(id: number): string {
  const token = ID_TO_TOKEN.get(id);
  if (!token) return `[UNK-${id}]`;
  
  // Decode the token to get readable text
  try {
    const bytes = unicodeToBytes(token);
    return new TextDecoder().decode(bytes);
  } catch {
    return token;
  }
}

// Helper to get all vocabulary tokens
export function getAllTokens(): Array<{ id: number; text: string; raw: string }> {
  return Array.from(ID_TO_TOKEN.entries()).map(([id, raw]) => ({
    id,
    raw,
    text: getTokenText(id),
  }));
}

// Export vocab size
export const CUSTOM_VOCAB_SIZE = Object.keys(vocab).length;

// Export for easier use
export default customTokenizer;
