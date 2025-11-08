

import { SystemPromptForChat } from '@/lib/prompts';
import { xai } from '@ai-sdk/xai'
import { streamText } from 'ai'


// we simply get the chat context from the frontend and stream the response back
export async function POST(req: Request) {
    const { messages, newMessage } = await req.json()
    let context = messages as Array<{ role: "user" | "assistant" | "system"; content: string }>
    if(messages.length === 0) {
        context = [{ role: "system", content: SystemPromptForChat }, ...context]
    }
    context.push({ role: "user", content: newMessage })
    const result = streamText({
        model: xai("grok-4-fast-non-reasoning"),
        messages: context,
    })
    return result.toTextStreamResponse()
}

