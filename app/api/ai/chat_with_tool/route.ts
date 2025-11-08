import OpenAI from "openai";

export async function POST(req: Request) {
    const apiKey = process.env.XAI_API_KEY;
    const { messages, message, tools } = await req.json();
    if (!apiKey) {
        throw new Error("XAI_API_KEY is not set in environment variables.");
    }

    const xai = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.x.ai/v1",
    });
    const response = await xai.chat.completions.create({
        model: "grok-4-fast-",
        messages: [...messages, message],
        tools: tools,
        tool_choice: "auto",
        stream: false,
    });
    return response;
};
