"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BookOpenIcon,
  XIcon,
  SparklesIcon,
  ArrowLeftIcon,
  RotateCcwIcon,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTransformerSimulation } from "./transformer-simulation";
import customTokenizer from "@/lib/custom-tokenizer";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ResearchLink {
  title: string;
  url: string;
  description: string;
}

interface StepContent {
  title: string;
  detailedExplanation: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
  researchLinks?: ResearchLink[];
}

// Cache for AI-generated content (in-memory for session)
interface CachedContent {
  data: StepContent;
  timestamp: number;
}

const contentCache: Map<number, CachedContent> = new Map();
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Step titles for each stage
const STEP_TITLES = [
  "Input Tokens",
  "Embeddings",
  "QKV Projection",
  "Attention Mechanism",
  "Feed-Forward Network",
  "Layer Normalization",
  "Output Hidden States",
  "Softmax & Prediction",
];

// Generate detailed content for a step using AI
const generateStepContent = async (stepIndex: number): Promise<StepContent> => {
  const stepTitle = STEP_TITLES[stepIndex];

  try {
    const prompt = `You are an expert AI educator teaching transformers. Generate comprehensive educational content for: "${stepTitle}" (Step ${stepIndex} of 8 in transformer architecture).

Create content that is:
1. Clear and accessible for learners
2. Technically accurate
3. Engaging and relatable
4. Includes concrete examples

Format your response as valid JSON with this EXACT structure:
{
  "title": "${stepTitle}",
  "detailedExplanation": "2-3 paragraphs explaining this step in detail, with examples",
  "keyPoints": [
    "4-5 key bullet points",
    "Each should be concise but informative",
    "Focus on practical understanding"
  ]
}

IMPORTANT: 
- Return ONLY valid JSON, no markdown formatting
- detailedExplanation should be 2-3 complete paragraphs
- Include specific examples relevant to the step
- Make it engaging and educational`;

    const response = await fetch("/api/ai/simulate-transformer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompts: [{ role: "user", content: prompt }],
        tools: [],
      }),
    });

    const data = await response.json();
    const contentText = data.content || "{}";

    // Extract JSON from response
    let jsonText = contentText;
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const generatedContent = JSON.parse(jsonText);

    return {
      title: generatedContent.title || stepTitle,
      detailedExplanation:
        generatedContent.detailedExplanation || "Content being generated...",
      keyPoints: Array.isArray(generatedContent.keyPoints)
        ? generatedContent.keyPoints
        : [],
      quiz: [], // Quiz will be generated on-demand
    };
  } catch (error) {
    console.error(`Error generating content for step ${stepIndex}:`, error);
    // Return fallback content
    return {
      title: stepTitle,
      detailedExplanation: `This step focuses on ${stepTitle.toLowerCase()}. Content is being generated...`,
      keyPoints: ["Key concept 1", "Key concept 2", "Key concept 3"],
      quiz: [],
    };
  }
};

// Get content with caching
const getStepContent = async (stepIndex: number): Promise<StepContent> => {
  // Check cache first
  const cached = contentCache.get(stepIndex) as CachedContent | undefined;
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
    return cached.data;
  }

  // Generate new content
  const content = await generateStepContent(stepIndex);

  // Cache it
  contentCache.set(stepIndex, {
    data: content,
    timestamp: Date.now(),
  });

  return content;
};

// Preload all step content in background for better UX
const preloadAllContent = async () => {
  console.log("🔄 Starting content preload for all 8 steps...");

  const promises = STEP_TITLES.map((_, index) =>
    getStepContent(index).catch((err) => {
      console.error(`Failed to preload step ${index}:`, err);
      return null;
    })
  );

  const results = await Promise.all(promises);
  const successCount = results.filter((r) => r !== null).length;

  console.log(`✅ Content preloading complete: ${successCount}/8 steps cached`);
  console.log("💾 Hover information ready for instant display");
};

// Dynamic research links based on step topic
const getResearchLinks = (stepTitle: string): ResearchLink[] => {
  const linkMap: Record<string, ResearchLink[]> = {
    "Input Tokens": [
      {
        title: "Tokenization in NLP",
        url: "https://huggingface.co/course/chapter2/4",
        description: "Comprehensive guide to tokenization methods",
      },
      {
        title: "BPE Tokenization Paper",
        url: "https://arxiv.org/abs/1508.07909",
        description: "Neural Machine Translation of Rare Words",
      },
      {
        title: "SentencePiece",
        url: "https://github.com/google/sentencepiece",
        description: "Unsupervised text tokenizer",
      },
    ],
    Embeddings: [
      {
        title: "Word2Vec Paper",
        url: "https://arxiv.org/abs/1301.3781",
        description: "Efficient Estimation of Word Representations",
      },
      {
        title: "Understanding Embeddings",
        url: "https://jalammar.github.io/illustrated-word2vec/",
        description: "Visual guide to word embeddings",
      },
      {
        title: "Positional Encoding",
        url: "https://kazemnejad.com/blog/transformer_architecture_positional_encoding/",
        description: "Deep dive into positional encodings",
      },
    ],
    "QKV Projection": [
      {
        title: "Attention Is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        description: "The original Transformer paper",
      },
      {
        title: "Illustrated Self-Attention",
        url: "https://jalammar.github.io/illustrated-transformer/",
        description: "Visual explanation of attention",
      },
      {
        title: "QKV Intuition",
        url: "https://www.youtube.com/watch?v=KmAISyVvE1Y",
        description: "Stanford CS224N: Attention mechanisms",
      },
    ],
    "Attention Mechanism": [
      {
        title: "Attention Is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        description: "Original paper on multi-head attention",
      },
      {
        title: "Multi-Head Attention Explained",
        url: "https://jalammar.github.io/illustrated-transformer/",
        description: "Visual guide",
      },
      {
        title: "Attention Visualization",
        url: "https://arxiv.org/abs/1906.04341",
        description: "What Does BERT Look At?",
      },
    ],
    "Feed-Forward Network": [
      {
        title: "FFN in Transformers",
        url: "https://arxiv.org/abs/1706.03762",
        description: "Section 3.3 of original paper",
      },
      {
        title: "GLU Variants",
        url: "https://arxiv.org/abs/2002.05202",
        description: "Improved FFN architectures",
      },
      {
        title: "Understanding FFN",
        url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
        description: "Andrej Karpathy's explanation",
      },
    ],
    "Layer Normalization": [
      {
        title: "Layer Norm Paper",
        url: "https://arxiv.org/abs/1607.06450",
        description: "Original Layer Normalization paper",
      },
      {
        title: "RMSNorm",
        url: "https://arxiv.org/abs/1910.07467",
        description: "Root Mean Square Layer Normalization",
      },
      {
        title: "Norm Techniques Comparison",
        url: "https://arxiv.org/abs/2009.10739",
        description: "Understanding normalization",
      },
    ],
    "Output Hidden States": [
      {
        title: "Language Modeling Heads",
        url: "https://arxiv.org/abs/1706.03762",
        description: "Transformer architecture",
      },
      {
        title: "Tied Embeddings",
        url: "https://arxiv.org/abs/1608.05859",
        description: "Using the same weight matrix",
      },
      {
        title: "GPT Architecture",
        url: "https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf",
        description: "GPT model details",
      },
    ],
    "Softmax & Prediction": [
      {
        title: "Softmax Function",
        url: "https://en.wikipedia.org/wiki/Softmax_function",
        description: "Mathematical foundation",
      },
      {
        title: "Temperature in Sampling",
        url: "https://arxiv.org/abs/1904.09751",
        description: "The Curious Case of Neural Text Degeneration",
      },
      {
        title: "Decoding Strategies",
        url: "https://huggingface.co/blog/how-to-generate",
        description: "Comprehensive guide to text generation",
      },
    ],
  };

  // Return links for the specific step or default to general transformer resources
  return (
    linkMap[stepTitle] || [
      {
        title: "Attention Is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        description: "Original Transformer paper",
      },
      {
        title: "The Illustrated Transformer",
        url: "https://jalammar.github.io/illustrated-transformer/",
        description: "Visual guide",
      },
      {
        title: "Andrej Karpathy: Let's Build GPT",
        url: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
        description: "Video tutorial",
      },
    ]
  );
};

const stepContentData: StepContent[] = [
  {
    title: "Input Tokens",
    detailedExplanation:
      "Tokenization is the first step where raw text is broken down into smaller units called tokens. These tokens can be words, subwords, or characters depending on the tokenizer used. For example, 'Hello world' might become ['Hello', 'world'] or ['Hel', '##lo', 'world'] with subword tokenization.",
    keyPoints: [
      "Tokens are the basic units of text processing",
      "Different tokenizers use different strategies (word, subword, character)",
      "Each token gets a unique ID from the vocabulary",
      "Special tokens like [CLS] and [SEP] are added for structure",
    ],
    quiz: [
      {
        question: "What is the primary purpose of tokenization?",
        options: [
          "To make text look pretty",
          "To break text into processable units",
          "To encrypt the text",
          "To translate text",
        ],
        correctAnswer: 1,
        explanation:
          "Tokenization breaks text into smaller units (tokens) that the model can process.",
      },
      {
        question: "Which is NOT a common tokenization strategy?",
        options: [
          "Word-level tokenization",
          "Subword tokenization",
          "Character-level tokenization",
          "Emotion-level tokenization",
        ],
        correctAnswer: 3,
        explanation:
          "Emotion-level tokenization doesn't exist. The three main strategies are word, subword, and character level.",
      },
      {
        question:
          "Why do we use subword tokenization instead of just word-level?",
        options: [
          "It's faster to compute",
          "It handles unknown words and reduces vocabulary size",
          "It makes the text longer",
          "It only works with English",
        ],
        correctAnswer: 1,
        explanation:
          "Subword tokenization (like BPE) can handle rare/unknown words by breaking them into known subwords, keeping vocabulary manageable.",
      },
      {
        question: "What happens to a token after tokenization?",
        options: [
          "It gets deleted",
          "It's assigned a unique numerical ID from the vocabulary",
          "It's translated to another language",
          "It's encrypted",
        ],
        correctAnswer: 1,
        explanation:
          "Each token is mapped to a unique ID from a fixed vocabulary (e.g., token 'hello' might be ID 5421).",
      },
      {
        question:
          "In the phrase 'unbelievable', how might BPE tokenization split it?",
        options: [
          "It always stays as one token",
          "['un', 'believ', 'able'] - into meaningful subwords",
          "['u', 'n', 'b', 'e', 'l'...] - into characters",
          "['unbe', 'lievable'] - randomly",
        ],
        correctAnswer: 1,
        explanation:
          "BPE learns common subword patterns, so it might split 'unbelievable' into prefix 'un', root 'believ', and suffix 'able'.",
      },
    ],
  },
  {
    title: "Embeddings",
    detailedExplanation:
      "Token embeddings convert discrete token IDs into continuous vector representations. Each token is mapped to a high-dimensional vector (e.g., 512 or 768 dimensions) that captures semantic meaning. Similar words have similar embeddings, allowing the model to understand relationships.",
    keyPoints: [
      "Embeddings are learned during training",
      "Each dimension captures different semantic features",
      "Similar tokens have vectors close together in embedding space",
      "Position information is added via positional encodings",
    ],
    quiz: [
      {
        question: "What do embeddings represent?",
        options: [
          "Token colors",
          "Vector representations of tokens",
          "Token frequencies",
          "Token lengths",
        ],
        correctAnswer: 1,
        explanation:
          "Embeddings are vector representations that capture the semantic meaning of tokens.",
      },
      {
        question: "Why are embeddings useful?",
        options: [
          "They make tokens smaller",
          "They capture semantic relationships",
          "They speed up processing",
          "They reduce memory usage",
        ],
        correctAnswer: 1,
        explanation:
          "Embeddings capture semantic relationships, allowing similar words to have similar vector representations.",
      },
      {
        question:
          "What is the typical dimensionality of embeddings in transformers?",
        options: [
          "10-50 dimensions",
          "512-768 dimensions",
          "5000-10000 dimensions",
          "Only 3 dimensions",
        ],
        correctAnswer: 1,
        explanation:
          "Modern transformers like GPT and BERT use embeddings with 512-768 dimensions (or even higher for larger models).",
      },
      {
        question: "What's special about similar words in embedding space?",
        options: [
          "They have the same color",
          "Their vectors are close together (high cosine similarity)",
          "They always appear next to each other in text",
          "They have the same length",
        ],
        correctAnswer: 1,
        explanation:
          "Words with similar meanings have similar embedding vectors, making them close in the high-dimensional space.",
      },
      {
        question: "How are embeddings initially created?",
        options: [
          "Manually by programmers",
          "Randomly initialized and learned during training",
          "Copied from a dictionary",
          "Generated by users",
        ],
        correctAnswer: 1,
        explanation:
          "Embeddings start as random vectors and are adjusted during training to capture meaningful relationships.",
      },
    ],
  },
  {
    title: "QKV Projection",
    detailedExplanation:
      "The QKV projection creates three different representations of each token: Query (Q), Key (K), and Value (V). These are created by multiplying the input embeddings with learned weight matrices. Queries ask 'what am I looking for?', Keys answer 'what do I contain?', and Values provide 'what information should be passed forward?'",
    keyPoints: [
      "Q, K, V are linear projections of the input",
      "Query: what information to look for",
      "Key: what information is available",
      "Value: the actual information to pass",
    ],
    quiz: [
      {
        question: "What does the Query (Q) represent?",
        options: [
          "The answer to a question",
          "What information a token is looking for",
          "The final output",
          "The input text",
        ],
        correctAnswer: 1,
        explanation:
          "The Query represents what information each token is searching for in other tokens.",
      },
      {
        question: "How are Q, K, V created?",
        options: [
          "Random generation",
          "Linear projection of inputs",
          "User input",
          "Copy of embeddings",
        ],
        correctAnswer: 1,
        explanation:
          "Q, K, and V are created by multiplying input embeddings with learned weight matrices.",
      },
    ],
  },
  {
    title: "Attention Mechanism",
    detailedExplanation:
      "The attention mechanism computes how much each token should 'attend to' (focus on) every other token. It calculates scores by comparing Queries with Keys, normalizes with softmax, and uses these scores to weight the Values. This allows the model to learn which tokens are relevant to each other.",
    keyPoints: [
      "Attention scores = softmax(Q·K^T / √d)",
      "Each token can attend to all other tokens",
      "Multiple attention heads capture different relationships",
      "Self-attention allows tokens to gather context",
    ],
    quiz: [
      {
        question: "What does attention calculate?",
        options: [
          "Token size",
          "Token relevance/importance to other tokens",
          "Token speed",
          "Token color",
        ],
        correctAnswer: 1,
        explanation:
          "Attention calculates how relevant each token is to every other token in the sequence.",
      },
      {
        question: "Why divide by √d in attention?",
        options: [
          "To make it faster",
          "To stabilize gradients and prevent extreme values",
          "To add randomness",
          "To reduce memory",
        ],
        correctAnswer: 1,
        explanation:
          "Dividing by √d (where d is dimension) prevents dot products from becoming too large, stabilizing training.",
      },
    ],
  },
  {
    title: "Feed-Forward Network",
    detailedExplanation:
      "After attention, each token passes through a feed-forward network (FFN) independently. The FFN consists of two linear layers with a non-linear activation (like ReLU or GELU) in between. This allows the model to process and transform the information gathered from attention.",
    keyPoints: [
      "Applied to each position independently",
      "Typically: Linear → Activation → Linear",
      "Expands dimension then contracts back",
      "Adds non-linearity and processing power",
    ],
    quiz: [
      {
        question: "What is unique about FFN processing?",
        options: [
          "It processes all tokens together",
          "It processes each token independently",
          "It only processes the first token",
          "It skips some tokens",
        ],
        correctAnswer: 1,
        explanation:
          "The FFN processes each token independently, unlike attention which looks at relationships between tokens.",
      },
      {
        question: "What does the FFN add to the model?",
        options: [
          "More tokens",
          "Non-linearity and transformation capacity",
          "Random noise",
          "Attention scores",
        ],
        correctAnswer: 1,
        explanation:
          "The FFN adds non-linear transformations, allowing the model to learn complex patterns beyond linear relationships.",
      },
    ],
  },
  {
    title: "Layer Normalization",
    detailedExplanation:
      "Layer normalization stabilizes training by normalizing the values across features for each token. It computes the mean and variance and scales the values to have zero mean and unit variance. This prevents values from exploding or vanishing during training and speeds up convergence.",
    keyPoints: [
      "Normalizes across feature dimension",
      "Prevents gradient explosion/vanishing",
      "Speeds up training convergence",
      "Applied after attention and FFN",
    ],
    quiz: [
      {
        question: "What is the main benefit of layer normalization?",
        options: [
          "Makes the model faster",
          "Stabilizes training and prevents extreme values",
          "Reduces model size",
          "Adds more layers",
        ],
        correctAnswer: 1,
        explanation:
          "Layer normalization stabilizes training by keeping values in a reasonable range, preventing gradient issues.",
      },
      {
        question: "When is layer normalization applied?",
        options: [
          "Only at the start",
          "After attention and FFN sublayers",
          "Only at the end",
          "Never",
        ],
        correctAnswer: 1,
        explanation:
          "Layer normalization is applied after both the attention and feed-forward network sublayers.",
      },
    ],
  },
  {
    title: "Output Hidden States",
    detailedExplanation:
      "After passing through all transformer layers (attention + FFN + normalization), we get the final hidden states. These are rich, contextualized representations of each token that incorporate information from the entire sequence. Each token's hidden state now contains understanding of its role and context.",
    keyPoints: [
      "Final contextual representation of each token",
      "Incorporates information from entire sequence",
      "Used for downstream tasks (classification, generation, etc.)",
      "Stacking layers increases representation power",
    ],
    quiz: [
      {
        question: "What information do final hidden states contain?",
        options: [
          "Only the original token",
          "Contextualized information from the entire sequence",
          "Random values",
          "Only neighboring tokens",
        ],
        correctAnswer: 1,
        explanation:
          "Final hidden states are contextualized representations that incorporate information from all tokens in the sequence.",
      },
      {
        question: "What makes deeper transformers more powerful?",
        options: [
          "They run faster",
          "Each layer adds more contextual understanding",
          "They use less memory",
          "They need less training",
        ],
        correctAnswer: 1,
        explanation:
          "Each transformer layer adds another level of contextual understanding and abstraction.",
      },
    ],
  },
  {
    title: "Softmax & Prediction",
    detailedExplanation:
      "The final step converts hidden states into probability distributions over the vocabulary using softmax. For each position, the model outputs probabilities for what token should come next. The token with the highest probability is typically selected (or sampled from the distribution for creative generation).",
    keyPoints: [
      "Converts logits to probability distribution",
      "Sum of all probabilities = 1",
      "Highest probability token is most likely next token",
      "Temperature parameter controls randomness",
    ],
    quiz: [
      {
        question: "What does softmax do?",
        options: [
          "Makes values soft",
          "Converts scores to probability distribution",
          "Deletes tokens",
          "Adds noise",
        ],
        correctAnswer: 1,
        explanation:
          "Softmax converts raw scores (logits) into a probability distribution where all values sum to 1.",
      },
      {
        question: "How does temperature affect generation?",
        options: [
          "Higher = more random/creative",
          "Higher = more deterministic",
          "No effect",
          "Only affects speed",
        ],
        correctAnswer: 0,
        explanation:
          "Higher temperature makes the distribution more uniform (more random), while lower temperature makes it more peaked (more deterministic).",
      },
    ],
  },
];

export function SimpleAITutor() {
  // Get values from transformer simulation context
  const context = useTransformerSimulation();

  if (!context) {
    throw new Error(
      "SimpleAITutor must be used within TransformerSimulationProvider"
    );
  }

  const {
    currentStep,
    nextStep: onNext,
    autoContinue,
    setAutoContinue,
    inputText,
    setInputText,
    setCurrentStep,
    predictedToken,
  } = context;

  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showDetailedContent, setShowDetailedContent] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [showContinuousGenerationModal, setShowContinuousGenerationModal] =
    useState(false);
  const [currentStepContent, setCurrentStepContent] = useState<StepContent>(
    stepContentData[0]
  );
  const [isPreloading, setIsPreloading] = useState(false);

  // Preload all content when starting (including hover details)
  useEffect(() => {
    if (hasStarted && !isPreloading) {
      setIsPreloading(true);
      preloadAllContent()
        .then(() => {
          console.log(
            "✅ Content preloading complete - all hover details cached"
          );
          setIsPreloading(false);
        })
        .catch((error) => {
          console.error("❌ Error during content preload:", error);
          setIsPreloading(false);
        });
    }
  }, [hasStarted, isPreloading]);

  // Load step content dynamically
  useEffect(() => {
    const loadStepContent = async () => {
      try {
        const content = await getStepContent(currentStep);
        setCurrentStepContent(content);
      } catch (error) {
        console.error(`Error loading content for step ${currentStep}:`, error);
        // Fallback to static content
        setCurrentStepContent(stepContentData[currentStep]);
      }
    };

    if (hasStarted) {
      loadStepContent();
    }
  }, [currentStep, hasStarted]);

  const stepPrompts = [
    `We're looking at Step 0: Input Tokens. In your own words, explain what's happening here - how does text get split into tokens? Keep it casual and friendly. ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
    `Now we're at Step 1: Embeddings. What's going on as these tokens transform into vectors? Make it relatable. ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
    `Step 2: QKV Projection. This is where things get interesting - what are Query, Key, and Value doing here? Explain like you're chatting with a friend. ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
    `Step 3: Attention - this is the transformer's superpower! How do tokens learn to pay attention to each other? Get us excited about it. ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
    `Step 4: Feed-Forward Network. After all that attention, what happens in the FFN? Why does each token need this processing? ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
    `Step 5: Layer Normalization. Things could get messy without this - what's it doing to keep everything stable? ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
    `Step 6: Output. We're almost there! What are these final hidden states, and why do they matter? ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
    `Step 7: Softmax. The grand finale - how does the model predict what comes next? Make it click for us. ${
      hasCompletedOnce
        ? "Also, reference the input text we're using: '" + inputText + "'"
        : "and the predicted next token was '" +
          predictedToken +
          "'. We have already seen this step, and the other steps before, so just focus on how the context affect the data and prediction."
    }`,
  ];

  const getExplanation = async (step: number) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/simulate-transformer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompts: [
            {
              role: "user",
              content: `${stepPrompts[step]}\n\nContext: The current input text is "${inputText}". Reference this input in your explanation when relevant.`,
            },
          ],
          tools: [],
        }),
      });

      const data = await response.json();
      setExplanation(data.content || "Let's continue exploring transformers!");
    } catch (error) {
      console.error("Error:", error);
      setExplanation("Let's continue to the next step!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setHasStarted(true);
    await getExplanation(0);
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (currentStep < 7) {
      onNext();
      getExplanation(currentStep + 1);
    } else {
      setHasCompletedOnce(true);
      setCurrentStep(0);
      setInputText(inputText + (predictedToken ? predictedToken : ""));
    }
  };

  if (!hasStarted) {
    return (
      <AIExplanation
        text="I'm Mela! Ready to see how transformers work? I'll pick a simple phrase to demonstrate, then we'll walk through all 8 steps together. Click when you're ready!"
        position={{ x: -40, y: 450 }}
        autohide={false}
      >
        <Button
          className="cursor-pointer"
          variant="secondary"
          size="icon"
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? "..." : <ArrowRightIcon />}
        </Button>
      </AIExplanation>
    );
  }

  if (explanation && !isLoading) {
    return (
      <>
        <AIExplanation
          text={explanation}
          position={{ x: -40, y: 300 }}
          autohide={false}
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                className="cursor-pointer"
                variant="outline"
                size="icon"
                onClick={() => setShowDetailedContent(true)}
                title="Learn more"
              >
                <BookOpenIcon className="h-4 w-4" />
              </Button>
              <Button
                className="cursor-pointer"
                variant="secondary"
                size="icon"
                onClick={handleContinue}
                disabled={isLoading}
              >
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        </AIExplanation>

        <DetailedContentModal
          isOpen={showDetailedContent}
          onClose={() => setShowDetailedContent(false)}
          content={currentStepContent}
        />

        <ContinuousGenerationModal
          isOpen={showContinuousGenerationModal}
          onClose={() => setShowContinuousGenerationModal(false)}
          onEnableAutoContinue={() => {
            setAutoContinue(true);
            setShowContinuousGenerationModal(false);
            setExplanation(
              "Auto-Continue enabled! Watch how LLMs generate tokens continuously!"
            );
          }}
        />
      </>
    );
  }

  return null;
}

function ContinuousGenerationModal({
  isOpen,
  onClose,
  onEnableAutoContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEnableAutoContinue: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            🎉 Congratulations! You've Completed the 8 Steps!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">
              🔄 Continuous Text Generation
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              LLMs generate text by looping through all 8 steps repeatedly. Each
              predicted token becomes the new input!
            </p>

            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-lg">🔁</span>
                The Loop
              </h4>
              <div className="flex items-center justify-between text-sm text-gray-700 font-medium">
                <div className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-md">
                    "the"
                  </div>
                  <span className="text-xs font-semibold text-blue-900">
                    Predict
                  </span>
                </div>
                <div className="text-2xl text-blue-400 font-bold">→</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2 rounded-lg bg-purple-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-md">
                    "cat"
                  </div>
                  <span className="text-xs font-semibold text-purple-900">
                    Append
                  </span>
                </div>
                <div className="text-2xl text-purple-400 font-bold">→</div>
                <div className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2 rounded-lg bg-pink-600 text-white flex items-center justify-center font-mono text-sm font-bold shadow-md">
                    "sat"
                  </div>
                  <span className="text-xs font-semibold text-pink-900">
                    Repeat
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong className="text-green-900">
                  💡 This is how ChatGPT works!
                </strong>{" "}
                Each token cycles through all 8 steps until completion.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-2">
              Ready to see it in action?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Enable <strong>Auto-Continue</strong> to watch the continuous
              generation loop!
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onEnableAutoContinue}
              className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              🚀 Enable Auto-Continue
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailedContentModal({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: StepContent;
}) {
  const [showQuiz, setShowQuiz] = useState(false);

  // Check if content is still loading (has placeholder text)
  const isContentLoading =
    content.detailedExplanation.includes("being generated");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {content.title}
            {isContentLoading ? (
              <span className="text-sm font-normal text-blue-600 animate-pulse">
                ✨ AI generating...
              </span>
            ) : (
              <span className="text-xs font-normal text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Cached
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!showQuiz ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">
                Detailed Explanation
              </h3>
              {isContentLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {content.detailedExplanation}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Key Points</h3>
              <ul className="list-disc list-inside space-y-2">
                {content.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-gray-700">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-lg">📚</span> Related Research & Resources
              </h3>
              <div className="space-y-3">
                {getResearchLinks(content.title).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-start gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                      <span className="text-xs mt-0.5 opacity-60">→</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm group-hover:underline">
                          {link.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {link.description}
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowQuiz(true)}
                className="flex-1"
                variant="default"
              >
                Take Quiz 📝
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Continue Learning
              </Button>
            </div>
          </div>
        ) : (
          <QuizComponent
            questions={content.quiz}
            content={content}
            onBack={() => setShowQuiz(false)}
            onComplete={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuizComponent({
  questions: initialQuestions,
  content,
  onBack,
  onComplete,
}: {
  questions: QuizQuestion[];
  content: StepContent;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isGeneratingInitial, setIsGeneratingInitial] = useState(true);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isCorrect = selectedAnswer === question?.correctAnswer;

  // Define generateQuizQuestions before using it
  const generateQuizQuestions = async (
    count: number = 5
  ): Promise<QuizQuestion[]> => {
    try {
      const prompt = `Based on this content about "${content.title}":

DETAILED EXPLANATION:
${content.detailedExplanation}

KEY POINTS:
${content.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

Generate ${count} multiple-choice quiz questions that test understanding of THIS SPECIFIC content (not general transformer knowledge). 

IMPORTANT: Questions must be directly based on the information provided above. Test comprehension of the specific concepts explained.

Format your response EXACTLY as valid JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct based on the content above"
  }
]

Rules:
- Make questions specific to the content provided (not generic)
- Vary difficulty from easy to challenging
- correctAnswer is 0-3 (index of correct option)
- Include detailed explanations referencing the content
- Return ONLY valid JSON, no markdown formatting`;

      const response = await fetch("/api/ai/simulate-transformer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompts: [{ role: "user", content: prompt }],
          tools: [],
        }),
      });

      const data = await response.json();
      const content_text = data.content || "[]";

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = content_text;
      const jsonMatch = content_text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const generatedQuestions = JSON.parse(jsonText);

      // Validate structure
      if (Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
        return generatedQuestions.map((q: any) => ({
          question: q.question || "Question",
          options: Array.isArray(q.options) ? q.options : ["A", "B", "C", "D"],
          correctAnswer:
            typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          explanation: q.explanation || "Correct!",
        }));
      }

      // Fallback to original questions if generation fails
      return initialQuestions;
    } catch (error) {
      console.error("Failed to generate quiz questions:", error);
      return initialQuestions;
    }
  };

  // Handler functions
  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);
    if (isCorrect && !answeredQuestions.includes(currentQuestion)) {
      setScore(score + 1);
      setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions([]);
    setQuizCompleted(false);
  };

  const handleGenerateMore = async () => {
    setIsGeneratingMore(true);
    try {
      const newQuestions = await generateQuizQuestions(5);
      setQuestions(newQuestions);
      handleRestart();
    } catch (error) {
      console.error("Error generating more questions:", error);
    }
    setIsGeneratingMore(false);
  };

  // Generate initial questions when component mounts
  useEffect(() => {
    const loadInitialQuestions = async () => {
      setIsGeneratingInitial(true);
      const newQuestions = await generateQuizQuestions(5);
      setQuestions(newQuestions);
      setIsGeneratingInitial(false);
    };
    loadInitialQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6 text-center">
        <div className="text-6xl mb-4">
          {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📚"}
        </div>
        <h3 className="text-2xl font-bold">Quiz Complete!</h3>
        <div className="text-lg">
          You scored <span className="font-bold text-green-600">{score}</span>{" "}
          out of <span className="font-bold">{questions.length}</span>
        </div>
        <div className="text-3xl font-bold text-blue-600">{percentage}%</div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            {percentage >= 80
              ? "Excellent work! You've mastered this concept! 🌟"
              : percentage >= 60
              ? "Good job! You're on the right track. Review the content and try again! 💪"
              : "Keep learning! Review the material and practice more. You've got this! 📖"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
          <Button onClick={handleRestart} variant="default" className="flex-1">
            <RotateCcwIcon className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={handleGenerateMore}
            variant="secondary"
            className="flex-1"
            disabled={isGeneratingMore}
          >
            {isGeneratingMore ? "⏳ Loading..." : "➕ More Practice"}
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while generating initial questions
  if (isGeneratingInitial) {
    return (
      <div className="space-y-8 text-center py-12">
        <div className="flex justify-center">
          <div className="relative w-fit">
            <Image
              src="/mela.webp"
              width={96}
              height={96}
              alt="Loading"
              className="rounded-full animate-pulse shadow-lg"
            />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crafting Your Quiz
          </h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Mela is analyzing the content and generating personalized questions
            to test your understanding
          </p>
        </div>

        <div className="flex justify-center items-center gap-2">
          <div
            className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>

        <div className="bg-linear-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-xs text-gray-700">
            💡 <strong>Pro tip:</strong> These questions are AI-generated based
            on the specific content you learned
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" size="sm">
          ← Back to Content
        </Button>
        <div className="text-sm font-medium">
          Question {currentQuestion + 1} of {questions.length} | Score: {score}/
          {questions.length}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">{question.question}</h3>
        <div className="space-y-2">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(idx)}
              disabled={showExplanation}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === idx
                  ? showExplanation
                    ? isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                  : showExplanation && idx === question.correctAnswer
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === idx
                      ? showExplanation
                        ? isCorrect
                          ? "border-green-500 bg-green-500"
                          : "border-red-500 bg-red-500"
                        : "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {showExplanation && idx === question.correctAnswer && (
                    <span className="text-white text-sm">✓</span>
                  )}
                  {showExplanation && selectedAnswer === idx && !isCorrect && (
                    <span className="text-white text-sm">✗</span>
                  )}
                </div>
                <span className="text-sm">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showExplanation && (
        <div
          className={`p-4 rounded-lg ${
            isCorrect
              ? "bg-green-50 border border-green-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <p className="font-semibold mb-2">
            {isCorrect ? "🎉 Correct!" : "💡 Learn from this:"}
          </p>
          <p className="text-sm text-gray-700">{question.explanation}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!showExplanation ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="flex-1"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1">
            {isLastQuestion ? "Complete Quiz 🎯" : "Next Question →"}
          </Button>
        )}
      </div>
    </div>
  );
}

export const AIExplanation = ({
  text,
  position,
  children,
  autohide = true,
}: {
  text: string;
  autohide: boolean;
  position: { x: number; y: number };
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.95)",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="relative flex items-start gap-2">
        <Image
          src="/mela.webp"
          width={200}
          height={400}
          draggable={false}
          alt="AI Explanation"
          className="rounded-2xl rounded-tr-none object-cover object-top select-none"
        />
        <div className="flex flex-col items-end justify-end gap-2 -ml-8">
          <div className="bg-white rounded-2xl rounded-bl-none shadow-lg p-4 max-w-[20rem]">
            <p className="text-sm text-gray-800">{text}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
