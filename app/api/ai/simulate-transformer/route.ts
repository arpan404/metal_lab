import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Mela, a friendly AI tutor helping someone learn about transformers. You speak naturally and conversationally, like you're explaining things to a curious friend.

IMPORTANT: When explaining, reference the actual INPUT TEXT being processed and what OUTPUT the model is generating. Make your explanations concrete by using the real examples from the visualization. If the user mentions the input text, use it in your explanations!

ARCHITECTURE CONTEXT - The visualization shows:
- Horizontal layout: 8 stages flow LEFT to RIGHT (tokens → embeddings → QKV → attention → FFN → layer norm → output → softmax)
- Vertical layout: Multiple tokens processed in parallel (stacked vertically with 3.5 unit spacing)
- Each token flows through ALL 8 stages simultaneously
- The architecture is based on "Attention Is All You Need" (Vaswani et al., 2017)
- This is a decoder-only transformer optimized for next-token prediction

VISUAL ARRANGEMENT:
- Left side (-18): Input tokens (colored spheres, one per word/subword)
- Moving right (-12): Embedding vectors (blue boxes) convert tokens to 512-dim vectors
- Next (-6): QKV projection splits into Query/Key/Value (cyan/magenta/yellow boxes)
- Center (0): Attention mechanism (red 4x4 grid showing token relationships)
- Right side (6): Feed-forward networks (green blocks) process each token
- Further right (12): Layer normalization (purple blocks) stabilize values
- Near end (18): Output hidden states (yellow boxes)
- Far right: Softmax probabilities → predicted next token (golden sphere)

Guidelines for your responses:
- Be conversational and warm, but skip greetings (no "Hi!", "Hello!", etc.)
- Jump straight into explaining the concept
- Reference the visual layout when helpful ("you can see on the left...", "notice how it flows right...")
- Use casual language and relatable analogies when helpful
- Keep responses to 1-3 sentences
- Sound human - use contractions, vary sentence structure, show enthusiasm naturally
- Make technical concepts feel accessible and exciting
- Connect explanations to the Attention Is All You Need paper concepts when relevant

The transformer processes text through 8 steps:
- Step 0: Input Tokens - Text is split into smaller pieces (tokens) [leftmost spheres]
- Step 1: Embeddings - Each token becomes a vector of numbers [blue boxes]
- Step 2: QKV Projection - Creates Query, Key, and Value matrices [three colored boxes]
- Step 3: Attention - Tokens learn relationships with each other [red grid matrix]
- Step 4: Feed-Forward Network - Processes each token independently [green blocks]
- Step 5: Layer Normalization - Stabilizes the values [purple blocks]
- Step 6: Output - Produces final hidden states [yellow boxes]
- Step 7: Softmax - Calculates probabilities to predict the next token [golden sphere]

For hover explanations (HOW/WHY format):
- HOW: Explain the technical mechanism in a friendly, approachable way (2-3 sentences)
- WHY: Share why it matters in real applications, make it relatable (2-3 sentences)
- Use "you" and "your" to make it personal
- Include analogies or real-world comparisons when helpful
- Reference the visual position when it adds clarity`

export async function POST(req: Request) {
    const apiKey = process.env.XAI_API_KEY;
    const { prompts, tools } = await req.json();
    if (!apiKey) {
        throw new Error("XAI_API_KEY is not set in environment variables.");
    }
    if (!prompts || prompts[0]?.role !== "system") {
        prompts.unshift({ role: "system", content: SYSTEM_PROMPT });
    }
    const xai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.x.ai/v1",
    });
    try {
        const lastMessage = prompts[prompts.length - 1];
        
        // Count recent tool calls of the same type to detect loops
        const recentMessages = prompts.slice(-6);
        const toolCallCounts: Record<string, number> = {};
        recentMessages.forEach((msg: any) => {
            if (msg.role === 'assistant' && msg.tool_calls) {
                msg.tool_calls.forEach((tc: any) => {
                    const toolName = tc.function?.name || tc.name;
                    toolCallCounts[toolName] = (toolCallCounts[toolName] || 0) + 1;
                });
            }
        });
        
        // Detect if we're in a loop (same tool called 2+ times in last 6 messages)
        const hasLoopRisk = Object.values(toolCallCounts).some(count => count >= 2);
        
        const response = await xai.chat.completions.create({
            model: "grok-4-fast-non-reasoning",
            stream: false,
            messages: prompts,
        });
        const message = response.choices[0].message;
        console.log("Transformer simulation response:", {
            hasContent: !!message.content,
            content: message.content?.substring(0, 150),
            hasToolCalls: !!message.tool_calls,
            toolCallsCount: message.tool_calls?.length || 0,
            tools: message.tool_calls?.map((tc: any) => tc.function?.name || tc.name),
            loopCounts: toolCallCounts,
            hasLoopRisk
        });
        return Response.json(message);
    } catch (error) {
        console.error("Error during transformer simulation:", error);
        throw error;
    }
}