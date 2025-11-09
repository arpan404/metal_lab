import OpenAI from "openai";

const SYSTEM_PROMPT = `You are Mela, a friendly virtual lab assistant. Your job is to explain what's happening at each step of a transformer simulation in 1-2 sentences.

The transformer processes text through 8 steps:
- Step 0: Input Tokens - Text is split into smaller pieces (tokens)
- Step 1: Embeddings - Each token becomes a vector of numbers
- Step 2: QKV Projection - Creates Query, Key, and Value matrices
- Step 3: Attention - Tokens learn relationships with each other
- Step 4: Feed-Forward Network - Processes each token independently
- Step 5: Layer Normalization - Stabilizes the values
- Step 6: Output - Produces final hidden states
- Step 7: Softmax - Calculates probabilities to predict the next token

When the user asks about a specific step, explain it clearly and concisely (1-2 sentences max). Be enthusiastic and encouraging!`

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
            // tools: tools,
            // tool_choice: "auto",
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