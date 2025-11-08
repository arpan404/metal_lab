/**
 * Test script for custom tokenizer
 * Run with: npx tsx lib/test-tokenizer.ts
 */

import customTokenizer, { getTokenText, getAllTokens, CUSTOM_VOCAB_SIZE } from './custom-tokenizer';
import { tokenize, decodeTokens } from './tiny-transformer';

console.log('🧪 Testing Custom HuggingFace Tokenizer\n');

// Test 1: Basic encoding/decoding
console.log('Test 1: Basic Encoding/Decoding');
console.log('=================================');
const testText = "The cat sits on the mat";
console.log(`Input: "${testText}"`);

const encoded = customTokenizer.encode(testText);
console.log(`Encoded IDs: [${encoded.join(', ')}]`);

const tokens = encoded.map(id => getTokenText(id));
console.log(`Tokens: [${tokens.map(t => `"${t}"`).join(', ')}]`);

const decoded = customTokenizer.decode(encoded);
console.log(`Decoded: "${decoded}"`);
console.log(`Match: ${decoded.trim() === testText.trim() ? '✅' : '❌'}\n`);

// Test 2: Tokenize function from transformer
console.log('Test 2: Tokenize Function (from transformer)');
console.log('=============================================');
const { tokens: tokenIds, originalTokens } = tokenize(testText);
console.log(`Token IDs: [${tokenIds.join(', ')}]`);
console.log('Token Details:');
originalTokens.forEach((t, i) => {
  console.log(`  ${i}: ID=${t.ourId}, Text="${t.text}"`);
});
console.log();

// Test 3: Decode tokens
console.log('Test 3: Decode Tokens Function');
console.log('===============================');
const decodedText = decodeTokens(tokenIds);
console.log(`Decoded: "${decodedText}"`);
console.log(`Match: ${decodedText.trim() === testText.trim() ? '✅' : '❌'}\n`);

// Test 4: Vocabulary stats
console.log('Test 4: Vocabulary Statistics');
console.log('==============================');
console.log(`Vocab Size: ${CUSTOM_VOCAB_SIZE}`);
console.log(`Sample tokens (first 20):`);
for (let i = 0; i < Math.min(20, CUSTOM_VOCAB_SIZE); i++) {
  const text = getTokenText(i);
  console.log(`  ID ${i}: "${text}"`);
}
console.log();

// Test 5: Common words
console.log('Test 5: Common Words Test');
console.log('==========================');
const commonWords = ["hello", "world", "the", "and", "is", "a", "to"];
commonWords.forEach(word => {
  const ids = customTokenizer.encode(word);
  const decoded = customTokenizer.decode(ids);
  console.log(`"${word}" -> [${ids.join(', ')}] -> "${decoded.trim()}" ${decoded.trim() === word ? '✅' : '❌'}`);
});

console.log('\n✨ Tokenizer tests complete!');
