/**
 * Tiny Transformer Model for Next Token Prediction
 * Optimized for browser execution with custom HF tokenizer
 */

import customTokenizer, { getTokenText, CUSTOM_VOCAB_SIZE } from './custom-tokenizer';

// Transformer hyperparameters
export interface TransformerConfig {
  vocabSize: number;
  embeddingDim: number;
  numHeads: number;
  numLayers: number;
  maxSeqLength: number;
  ffnHiddenDim: number;
}

// Use custom HuggingFace tokenizer vocabulary (500 tokens)
export const VOCAB_SIZE = CUSTOM_VOCAB_SIZE;

// Build vocabulary from custom tokenizer
export const VOCABULARY: string[] = [];
for (let i = 0; i < VOCAB_SIZE; i++) {
  VOCABULARY[i] = getTokenText(i);
}

// Default config for a tiny transformer (optimized for web)
export const DEFAULT_CONFIG: TransformerConfig = {
  vocabSize: VOCAB_SIZE, // 500 tokens
  embeddingDim: 48, // Reduced from 64 to 48 (25% less memory)
  numHeads: 4, // 4 attention heads
  numLayers: 2, // 2 transformer layers
  maxSeqLength: 10, // Max sequence length
  ffnHiddenDim: 96, // Reduced from 128 to 96 (25% less memory)
};

// Helper: Xavier/Glorot initialization
function randomNormal(mean = 0, std = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}

function initializeMatrix(rows: number, cols: number, scale = 1): number[][] {
  const matrix: number[][] = [];
  const std = scale * Math.sqrt(2 / (rows + cols));
  for (let i = 0; i < rows; i++) {
    matrix[i] = [];
    for (let j = 0; j < cols; j++) {
      matrix[i][j] = randomNormal(0, std);
    }
  }
  return matrix;
}

// Matrix operations (optimized for small matrices)
export class Matrix {
  data: number[][];
  rows: number;
  cols: number;

  constructor(data: number[][]) {
    this.data = data;
    this.rows = data.length;
    this.cols = data[0]?.length || 0;
  }

  static zeros(rows: number, cols: number): Matrix {
    const data = Array(rows).fill(0).map(() => Array(cols).fill(0));
    return new Matrix(data);
  }

  static random(rows: number, cols: number, scale = 1): Matrix {
    return new Matrix(initializeMatrix(rows, cols, scale));
  }

  // Matrix multiplication
  static multiply(a: Matrix, b: Matrix): Matrix {
    if (a.cols !== b.rows) {
      throw new Error(`Matrix dimensions don't match: ${a.cols} !== ${b.rows}`);
    }
    const result = Matrix.zeros(a.rows, b.cols);
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < b.cols; j++) {
        let sum = 0;
        for (let k = 0; k < a.cols; k++) {
          sum += a.data[i][k] * b.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  // Element-wise addition
  add(other: Matrix): Matrix {
    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] + other.data[i][j];
      }
    }
    return result;
  }

  // Transpose
  transpose(): Matrix {
    const result = Matrix.zeros(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }

  // Softmax along last dimension
  softmax(): Matrix {
    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      const row = this.data[i];
      const max = Math.max(...row);
      const exps = row.map(x => Math.exp(x - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      result.data[i] = exps.map(x => x / sum);
    }
    return result;
  }

  // Layer normalization
  layerNorm(eps = 1e-5): Matrix {
    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      const row = this.data[i];
      const mean = row.reduce((a, b) => a + b, 0) / row.length;
      const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length;
      const std = Math.sqrt(variance + eps);
      result.data[i] = row.map(x => (x - mean) / std);
    }
    return result;
  }

  // GELU activation
  gelu(): Matrix {
    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const x = this.data[i][j];
        result.data[i][j] = 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
      }
    }
    return result;
  }

  // Scale by scalar
  scale(scalar: number): Matrix {
    const result = Matrix.zeros(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] * scalar;
      }
    }
    return result;
  }
}

// Attention mechanism with proper multi-head support
export class MultiHeadAttention {
  config: TransformerConfig;
  Wq: Matrix;
  Wk: Matrix;
  Wv: Matrix;
  Wo: Matrix;
  
  // Store per-head attention weights for visualization
  headAttentionWeights: Matrix[] = [];

  constructor(config: TransformerConfig) {
    this.config = config;
    const d = config.embeddingDim;
    
    // Initialize weight matrices
    this.Wq = Matrix.random(d, d);
    this.Wk = Matrix.random(d, d);
    this.Wv = Matrix.random(d, d);
    this.Wo = Matrix.random(d, d);
  }

  forward(x: Matrix): { 
    output: Matrix; 
    attentionWeights: Matrix;
    headAttentionWeights: Matrix[];
  } {
    const seqLen = x.rows;
    const d = this.config.embeddingDim;
    const numHeads = this.config.numHeads;
    const dHead = d / numHeads;

    // Compute Q, K, V
    const Q = Matrix.multiply(x, this.Wq);
    const K = Matrix.multiply(x, this.Wk);
    const V = Matrix.multiply(x, this.Wv);

    // Split into multiple heads and compute attention per head
    this.headAttentionWeights = [];
    const headOutputs: Matrix[] = [];
    
    for (let h = 0; h < numHeads; h++) {
      const startIdx = h * dHead;
      const endIdx = (h + 1) * dHead;
      
      // Extract head-specific Q, K, V
      const Qh = Matrix.zeros(seqLen, dHead);
      const Kh = Matrix.zeros(seqLen, dHead);
      const Vh = Matrix.zeros(seqLen, dHead);
      
      for (let i = 0; i < seqLen; i++) {
        for (let j = 0; j < dHead; j++) {
          Qh.data[i][j] = Q.data[i][startIdx + j];
          Kh.data[i][j] = K.data[i][startIdx + j];
          Vh.data[i][j] = V.data[i][startIdx + j];
        }
      }
      
      // Compute attention scores for this head: QK^T / sqrt(d_head)
      const scores = Matrix.multiply(Qh, Kh.transpose()).scale(1 / Math.sqrt(dHead));
      
      // Apply causal mask (only attend to previous tokens)
      for (let i = 0; i < seqLen; i++) {
        for (let j = i + 1; j < seqLen; j++) {
          scores.data[i][j] = -Infinity;
        }
      }
      
      // Apply softmax to get attention weights
      const headAttnWeights = scores.softmax();
      this.headAttentionWeights.push(headAttnWeights);
      
      // Apply attention to values
      const headOutput = Matrix.multiply(headAttnWeights, Vh);
      headOutputs.push(headOutput);
    }
    
    // Concatenate head outputs
    const concatenated = Matrix.zeros(seqLen, d);
    for (let i = 0; i < seqLen; i++) {
      for (let h = 0; h < numHeads; h++) {
        const startIdx = h * dHead;
        for (let j = 0; j < dHead; j++) {
          concatenated.data[i][startIdx + j] = headOutputs[h].data[i][j];
        }
      }
    }
    
    // Output projection
    const output = Matrix.multiply(concatenated, this.Wo);
    
    // Average attention weights across heads for visualization
    const avgAttentionWeights = Matrix.zeros(seqLen, seqLen);
    for (let i = 0; i < seqLen; i++) {
      for (let j = 0; j < seqLen; j++) {
        let sum = 0;
        for (let h = 0; h < numHeads; h++) {
          sum += this.headAttentionWeights[h].data[i][j];
        }
        avgAttentionWeights.data[i][j] = sum / numHeads;
      }
    }

    return { 
      output, 
      attentionWeights: avgAttentionWeights,
      headAttentionWeights: this.headAttentionWeights 
    };
  }
}

// Feed-forward network
export class FeedForward {
  config: TransformerConfig;
  W1: Matrix;
  W2: Matrix;
  b1: Matrix;
  b2: Matrix;

  constructor(config: TransformerConfig) {
    this.config = config;
    const d = config.embeddingDim;
    const h = config.ffnHiddenDim;
    
    this.W1 = Matrix.random(d, h);
    this.W2 = Matrix.random(h, d);
    this.b1 = Matrix.zeros(1, h);
    this.b2 = Matrix.zeros(1, d);
  }

  forward(x: Matrix): Matrix {
    // First layer with GELU activation
    let h = Matrix.multiply(x, this.W1);
    for (let i = 0; i < h.rows; i++) {
      for (let j = 0; j < h.cols; j++) {
        h.data[i][j] += this.b1.data[0][j];
      }
    }
    h = h.gelu();

    // Second layer
    let output = Matrix.multiply(h, this.W2);
    for (let i = 0; i < output.rows; i++) {
      for (let j = 0; j < output.cols; j++) {
        output.data[i][j] += this.b2.data[0][j];
      }
    }

    return output;
  }
}

// Transformer layer
export class TransformerLayer {
  attention: MultiHeadAttention;
  ffn: FeedForward;

  constructor(config: TransformerConfig) {
    this.attention = new MultiHeadAttention(config);
    this.ffn = new FeedForward(config);
  }

  forward(x: Matrix): { 
    output: Matrix; 
    attentionWeights: Matrix;
    headAttentionWeights: Matrix[];
  } {
    // Self-attention with residual connection
    const { output: attnOut, attentionWeights, headAttentionWeights } = this.attention.forward(x);
    let residual1 = x.add(attnOut);
    residual1 = residual1.layerNorm();

    // Feed-forward with residual connection
    const ffnOut = this.ffn.forward(residual1);
    let output = residual1.add(ffnOut);
    output = output.layerNorm();

    return { output, attentionWeights, headAttentionWeights };
  }
}

// Main Transformer model
export class TinyTransformer {
  config: TransformerConfig;
  tokenEmbedding: Matrix;
  positionEmbedding: Matrix;
  layers: TransformerLayer[];
  outputProjection: Matrix;
  
  // Store intermediate activations for visualization
  public embeddings: Matrix | null = null;
  public qkvProjections: { Q: Matrix; K: Matrix; V: Matrix }[] = [];
  public attentionWeights: Matrix[] = [];
  public headAttentionWeights: Matrix[][] = []; // Per-layer, per-head attention weights
  public ffnOutputs: Matrix[] = [];
  public layerOutputs: Matrix[] = [];

  constructor(config: TransformerConfig = DEFAULT_CONFIG) {
    this.config = config;
    
    // Initialize embeddings
    this.tokenEmbedding = Matrix.random(config.vocabSize, config.embeddingDim);
    this.positionEmbedding = Matrix.random(config.maxSeqLength, config.embeddingDim);
    
    // Initialize transformer layers
    this.layers = [];
    for (let i = 0; i < config.numLayers; i++) {
      this.layers.push(new TransformerLayer(config));
    }
    
    // Output projection to vocabulary
    this.outputProjection = Matrix.random(config.embeddingDim, config.vocabSize);
  }

  // Embed tokens and add positional encoding
  embed(tokenIds: number[]): Matrix {
    const seqLen = tokenIds.length;
    const embeddings = Matrix.zeros(seqLen, this.config.embeddingDim);
    
    for (let i = 0; i < seqLen; i++) {
      const tokenId = tokenIds[i] % this.config.vocabSize; // Clamp to vocab size
      for (let j = 0; j < this.config.embeddingDim; j++) {
        embeddings.data[i][j] = 
          this.tokenEmbedding.data[tokenId][j] + 
          this.positionEmbedding.data[i % this.config.maxSeqLength][j];
      }
    }
    
    return embeddings;
  }

  // Forward pass
  forward(tokenIds: number[]): { 
    logits: number[]; 
    predictedTokenId: number;
    predictedToken: string;
    predictedGptToken: string;
    probabilities: number[];
    tokenizedInput: Array<{ token: string; id: number; gptId: number }>;
    softmaxStage: {
      beforeSoftmax: number[];
      afterSoftmax: number[];
      temperature: number;
    };
  } {
    // Clear previous activations
    this.qkvProjections = [];
    this.attentionWeights = [];
    this.headAttentionWeights = [];
    this.ffnOutputs = [];
    this.layerOutputs = [];

    // Create tokenized input info with custom tokenizer
    const tokenizedInput = tokenIds.map(id => {
      const tokenText = getTokenText(id);
      
      return {
        token: tokenText,
        id: id,
        gptId: id // Using same ID since we're using custom tokenizer directly
      };
    });

    // Embed tokens
    let x = this.embed(tokenIds);
    this.embeddings = x;

    // Pass through transformer layers
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      
      // Store Q, K, V projections for visualization
      const Q = Matrix.multiply(x, layer.attention.Wq);
      const K = Matrix.multiply(x, layer.attention.Wk);
      const V = Matrix.multiply(x, layer.attention.Wv);
      this.qkvProjections.push({ Q, K, V });
      
      const { output, attentionWeights, headAttentionWeights } = layer.forward(x);
      
      this.attentionWeights.push(attentionWeights);
      this.headAttentionWeights.push(headAttentionWeights);
      this.layerOutputs.push(output);
      
      x = output;
    }

    // Get last token's representation
    const lastTokenRep = x.data[x.rows - 1];
    
    // Project to vocabulary
    const logits: number[] = Array(this.config.vocabSize).fill(0);
    for (let i = 0; i < this.config.vocabSize; i++) {
      for (let j = 0; j < this.config.embeddingDim; j++) {
        logits[i] += lastTokenRep[j] * this.outputProjection.data[j][i];
      }
    }

    // Store logits before softmax
    const beforeSoftmax = [...logits];
    
    // Apply softmax to get probabilities (numerically stable)
    const temperature = 1.0;
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(l => Math.exp((l - maxLogit) / temperature));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    const probabilities = expLogits.map(e => e / sumExp);

    // Get predicted token (argmax)
    let predictedTokenId = 0;
    let maxProb = probabilities[0];
    for (let i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        predictedTokenId = i;
      }
    }
    
    // Get token text using custom tokenizer
    const predictedToken = getTokenText(predictedTokenId);
    const predictedGptToken = predictedToken; // Same since we're using custom tokenizer

    return { 
      logits, 
      predictedTokenId, 
      predictedToken,
      predictedGptToken,
      probabilities, 
      tokenizedInput,
      softmaxStage: {
        beforeSoftmax: beforeSoftmax.slice(0, 20), // Top 20 for visualization
        afterSoftmax: probabilities.slice(0, 20),
        temperature
      }
    };
  }

  // Train on a single example (simplified SGD step)
  train(tokenIds: number[], targetTokenId: number, learningRate = 0.01): number {
    const { logits } = this.forward(tokenIds);
    
    // Compute cross-entropy loss
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(l => Math.exp(l - maxLogit));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    const probs = expLogits.map(e => e / sumExp);
    
    const loss = -Math.log(probs[targetTokenId] + 1e-10);
    
    // Simplified gradient descent on output layer only (for demo)
    // In a real implementation, you'd use backpropagation
    const gradient = [...probs];
    gradient[targetTokenId] -= 1;
    
    if (this.embeddings) {
      const lastTokenRep = this.embeddings.data[this.embeddings.rows - 1];
      for (let i = 0; i < this.config.vocabSize; i++) {
        for (let j = 0; j < this.config.embeddingDim; j++) {
          this.outputProjection.data[j][i] -= learningRate * gradient[i] * lastTokenRep[j];
        }
      }
    }
    
    return loss;
  }

  // Save model parameters
  serialize(): string {
    return JSON.stringify({
      config: this.config,
      tokenEmbedding: this.tokenEmbedding.data,
      positionEmbedding: this.positionEmbedding.data,
      outputProjection: this.outputProjection.data,
    });
  }

  // Load model parameters
  static deserialize(json: string): TinyTransformer {
    const data = JSON.parse(json);
    const model = new TinyTransformer(data.config);
    model.tokenEmbedding = new Matrix(data.tokenEmbedding);
    model.positionEmbedding = new Matrix(data.positionEmbedding);
    model.outputProjection = new Matrix(data.outputProjection);
    return model;
  }
}

// Helper to tokenize text using custom HF tokenizer
export function tokenize(text: string): { 
  tokens: number[]; 
  originalTokens: Array<{ gptId: number; ourId: number; text: string }> 
} {
  try {
    const tokenIds = customTokenizer.encode(text);
    const originalTokens: Array<{ gptId: number; ourId: number; text: string }> = [];

    for (const id of tokenIds) {
      const tokenText = getTokenText(id);
      originalTokens.push({ 
        gptId: id, // Using the same ID since we're using custom tokenizer directly
        ourId: id, 
        text: tokenText 
      });
    }

    return { tokens: tokenIds, originalTokens };
  } catch (error) {
    console.error("Tokenization error:", error);
    // Fallback to simple word splitting
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const tokens = words.map(() => 1); // All unknown
    const originalTokens = words.map((word, idx) => ({ 
      gptId: 1, 
      ourId: 1, 
      text: word 
    }));
    return { tokens, originalTokens };
  }
}

// Helper to decode token IDs to text
export function decodeTokens(tokenIds: number[]): string {
  try {
    return customTokenizer.decode(tokenIds);
  } catch (error) {
    return tokenIds.map(id => VOCABULARY[id] || "[UNK]").join("");
  }
}

// Create and pre-train a simple model
export function createPretrainedModel(): TinyTransformer {
  const model = new TinyTransformer(DEFAULT_CONFIG);
  
  // Training examples using actual custom tokenizer IDs
  // Format: { input: [token_ids...], target: next_token_id }
  const trainingData = [
    // Basic patterns: "The X" -> verb patterns
    { input: [325, 276, 272], target: 267 },      // " The cat" -> " s" (sits)
    { input: [325, 276, 272, 267, 275], target: 84 }, // " The cat sit" -> "s"
    { input: [262, 276, 272], target: 267 },      // " the cat" -> " s"
    { input: [262, 295, 496], target: 83 },       // " the dog" -> "r" (runs)
    
    // Action sequences: X verb -> preposition
    { input: [276, 272, 267, 275, 84], target: 327 }, // "cat sits" -> " on"
    { input: [295, 496, 83, 86, 79, 84], target: 327 }, // "dog runs" -> " on"
    { input: [276, 272, 288, 84], target: 327 },   // "cat jumps" -> " on"
    { input: [295, 496, 270, 286, 76, 84], target: 327 }, // "dog walks" -> " on"
    
    // Prepositional phrases: on -> "the"
    { input: [327, 262], target: 294 },           // " on the" -> " m" (mat)
    { input: [267, 275, 84, 327], target: 262 },  // "sits on" -> " the"
    { input: [83, 86, 79, 84, 327], target: 262 }, // "runs on" -> " the"
    
    // Complete patterns: "The cat sits on the" -> "mat"
    { input: [325, 276, 272, 267, 275, 84, 327, 262], target: 294 }, // -> " m"
    { input: [262, 276, 272, 267, 275, 84, 327], target: 262 },      // -> " the"
    
    // Verb patterns
    { input: [325], target: 276 },                // " The" -> " c" (cat)
    { input: [262], target: 276 },                // " the" -> " c" (cat/can/...)
    { input: [262, 276], target: 272 },           // " the c" -> "at"
    
    // Common sequences with "is"
    { input: [325, 276, 272, 365], target: 327 }, // " The cat is" -> " on"
    { input: [262, 276, 272, 365], target: 327 }, // " the cat is" -> " on"
    { input: [365, 327], target: 262 },           // "is on" -> " the"
    
    // Action completions
    { input: [276, 272], target: 267 },           // "cat" -> " s" (sits/sleeps)
    { input: [295, 496], target: 83 },            // "dog" -> "r" (runs)
    { input: [270], target: 274 },                // " w" -> "or" (world/work)
    
    // Conjunction patterns: "and"
    { input: [276, 272, 289], target: 262 },      // "cat and" -> " the"
    { input: [289, 262], target: 295 },           // "and the" -> " d" (dog)
    
    // Descriptive patterns
    { input: [262, 67, 342], target: 276 },       // " the big" -> " c" (cat)
    { input: [262, 465], target: 276 },           // " the red" -> " c" (cat)
    { input: [262, 84, 78, 286, 77], target: 276 }, // " the small" -> " c"
    
    // Question patterns
    { input: [369, 414], target: 365 },           // " where" -> "is"
    { input: [369, 272], target: 365 },           // " what" -> "is"
    
    // Time/sequence words
    { input: [308, 277], target: 276 },           // " then" -> " c" (cat)
    { input: [474], target: 262 },                // " not" -> " the"
    
    // Completion patterns for common phrases
    { input: [325, 276, 272, 289, 262, 295], target: 496 }, // " The cat and the d" -> "og"
    { input: [327, 262, 294, 272], target: 273 }, // " on the mat" -> " ." (period)
    
    // Article patterns
    { input: [260], target: 276 },                // " a" -> " c" (cat/can)
    { input: [260, 276, 272], target: 365 },      // " a cat" -> "is"
    
    // More verb forms
    { input: [276, 272, 423], target: 473 },      // "cat se" -> "le" (sleeps)
    { input: [295, 496, 270], target: 286 },      // "dog w" -> "al" (walks)
    { input: [276, 272, 70, 272, 84], target: 327 }, // "cat eats" -> " on"
  ];
  
  // Train for fewer epochs (optimized for web - faster initialization)
  for (let epoch = 0; epoch < 80; epoch++) {
    // Gradually decrease learning rate
    const learningRate = 0.05 * (1 - epoch / 160);
    
    for (const example of trainingData) {
      model.train(example.input, example.target, Math.max(learningRate, 0.01));
    }
  }
  
  return model;
}
